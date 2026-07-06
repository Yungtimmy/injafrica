import { NextRequest, NextResponse } from 'next/server';
import Groq from 'groq-sdk';
import { z } from 'zod';
import { auth } from '@/lib/auth';
import { handlers } from '@/lib/mcp/handlers';
import { groqTools } from '@/lib/mcp/groq-tools';

// Node runtime required for Mongoose + Web fetch.
export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

// ----------------------------------------------------------------------------
// Rate limit (in-memory, per discordId)
// ----------------------------------------------------------------------------
const REQUEST_WINDOW_MS = 60_000;
const MAX_REQUESTS_PER_WINDOW = 10;
const buckets = new Map<string, number[]>();

function checkRateLimit(discordId: string): { ok: boolean; retryAfter: number } {
  const now = Date.now();
  const arr = (buckets.get(discordId) ?? []).filter((t) => now - t < REQUEST_WINDOW_MS);
  if (arr.length >= MAX_REQUESTS_PER_WINDOW) {
    const oldestInWindow = arr[0];
    return {
      ok: false,
      retryAfter: Math.ceil((REQUEST_WINDOW_MS - (now - oldestInWindow)) / 1000),
    };
  }
  arr.push(now);
  buckets.set(discordId, arr);
  return { ok: true, retryAfter: 0 };
}

// ----------------------------------------------------------------------------
// System prompt
// ----------------------------------------------------------------------------
const SYSTEM_PROMPT = `You are a tactical assistant for the FIFA World Cup 2026 prediction game at INJAFRICA.

You have FIVE tools available:
1. get_leaderboard({ limit?: 1..100 }) — top N players by points. Default 25.
2. get_user_points() — the caller's points + global rank.
3. get_upcoming_matches({ limit?: 1..100 }) — scheduled matches.
4. get_scoring_rules() — the points scoring rules.
5. submit_prediction({ matchId, predictedHome, predictedAway, predictedQualifier?, note? }) — submits an agent-side draft.

CRITICAL ISOLATION FACTS (must surface to the user):
- submit_prediction writes to a SEPARATE AgentPrediction collection. It NEVER affects User.points.
- Manual predictions (in the "Prediction" collection) are what count for real points.
- After submit_prediction, the user sees the draft in a side-by-side card next to their own manual pick on this page.
- The agent draft does NOT replace the user's manual pick. They are stored in two different MongoDB collections.

Behavior:
- Be brief. Plain language. Do not exceed ~120 words per reply unless the user asks for detail.
- When the user asks a strategy question, ALWAYS start by calling get_user_points and get_upcoming_matches so you have current context.
- When the user asks "should I pick X for match Y" or "predict Brazil vs Scotland", call submit_prediction.
- When submit_prediction succeeds, mention the isolation fact so the user understands what just happened.
- Use natural team names from get_upcoming_matches; do not invent teams.`;

// ----------------------------------------------------------------------------
// Body validation
// ----------------------------------------------------------------------------
const ChatMessageSchema = z.object({
  role: z.enum(['user', 'assistant']),
  content: z.string().max(4000),
});

const BodySchema = z.object({
  messages: z.array(ChatMessageSchema).min(1).max(50),
});

// ----------------------------------------------------------------------------
// Loop
// ----------------------------------------------------------------------------
const MAX_LOOP_ITERATIONS = 5;
const MODEL = 'llama-3.3-70b-versatile';

interface ToolTraceEntry {
  name: string;
  args: unknown;
  result: string;
  isError: boolean;
}

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.discordId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const apiKey = process.env.GROQ_API_KEY;
  if (!apiKey) {
    return NextResponse.json(
      { error: 'GROQ_API_KEY is not configured on the server.' },
      { status: 503 }
    );
  }

  const rl = checkRateLimit(session.user.discordId);
  if (!rl.ok) {
    return NextResponse.json(
      { error: `Too many requests. Try again in ${rl.retryAfter}s.` },
      { status: 429, headers: { 'Retry-After': String(rl.retryAfter) } }
    );
  }

  let parsed;
  try {
    const raw = await req.json();
    parsed = BodySchema.parse(raw);
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    return NextResponse.json({ error: `Invalid body: ${message}` }, { status: 400 });
  }

  const fullMessages: any[] = [
    { role: 'system', content: SYSTEM_PROMPT },
    ...parsed.messages,
  ];
  const toolTrace: ToolTraceEntry[] = [];
  const groq = new Groq({ apiKey });

  let iterations = 0;
  while (iterations < MAX_LOOP_ITERATIONS) {
    iterations++;

    let completion;
    try {
      completion = await groq.chat.completions.create({
        model: MODEL,
        messages: fullMessages,
        tools: groqTools as any,
        tool_choice: 'auto',
        temperature: 0.4,
      });
    } catch (err) {
      console.error('[agent-chat] Groq error', err);
      const msg = err instanceof Error ? err.message : String(err);
      return NextResponse.json(
        {
          assistantMessage: `Assistant chat failed: ${msg}`,
          messages: fullMessages,
          toolTrace,
        },
        { status: 502 }
      );
    }

    const choice = completion.choices?.[0];
    const assistantMsg = choice?.message;
    if (!assistantMsg) {
      return NextResponse.json(
        { assistantMessage: '', messages: fullMessages, toolTrace },
        { status: 502 }
      );
    }

    const toolCalls = assistantMsg.tool_calls ?? [];

    if (toolCalls.length === 0) {
      const assistantMessage = assistantMsg.content ?? '';
      fullMessages.push({ role: 'assistant', content: assistantMessage });
      return NextResponse.json({
        assistantMessage,
        messages: fullMessages,
        toolTrace,
      });
    }

    // Push the assistant turn that contained tool_calls.
    fullMessages.push({
      role: 'assistant',
      content: assistantMsg.content ?? '',
      tool_calls: toolCalls,
    });

    // Dispatch each tool call.
    for (const call of toolCalls) {
      const toolName: string = call.function.name;
      const rawArgs: string = call.function.arguments;
      let args: unknown = {};
      try {
        args = rawArgs ? JSON.parse(rawArgs) : {};
      } catch {
        args = {};
      }

      const def = handlers[toolName];
      let resultText: string;
      let isError = false;
      if (!def) {
        resultText = `ERROR: Unknown tool '${toolName}'.`;
        isError = true;
      } else {
        try {
          const r = await def.handler(args as any, { session });
          resultText = r.content.map((c) => c.text).join('\n');
          isError = r.isError === true;
        } catch (err) {
          console.error(`[agent-chat] tool ${toolName} threw`, err);
          resultText = `ERROR: ${err instanceof Error ? err.message : String(err)}`;
          isError = true;
        }
      }

      toolTrace.push({ name: toolName, args, result: resultText, isError });

      fullMessages.push({
        role: 'tool',
        tool_call_id: call.id,
        content: resultText,
      });
    }
  }

  // Cap reached — nudge one final time.
  fullMessages.push({
    role: 'system',
    content:
      'Tool call limit reached. Output a final concise response to the user based on what you have so far.',
  });
  try {
    const completion = await groq.chat.completions.create({
      model: MODEL,
      messages: fullMessages,
      temperature: 0.4,
    });
    const assistantMessage = completion.choices?.[0]?.message?.content ?? '';
    fullMessages.push({ role: 'assistant', content: assistantMessage });
    return NextResponse.json({ assistantMessage, messages: fullMessages, toolTrace });
  } catch {
    return NextResponse.json({
      assistantMessage:
        'Tool-call limit reached. Try a more specific question so fewer tools are needed.',
      messages: fullMessages,
      toolTrace,
    });
  }
}
