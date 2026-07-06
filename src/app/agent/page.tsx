'use client';

import { useEffect, useRef, useState } from 'react';
import { useSession } from 'next-auth/react';
import Link from 'next/link';
import Image from 'next/image';
import AgentComparisonCard from '@/components/AgentComparisonCard';

interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
}

interface ToolTraceEntryLite {
  name: string;
  args: Record<string, unknown>;
  result: string;
  isError: boolean;
}

interface ManualPrediction {
  _id: string;
  predictedHome: number | null;
  predictedAway: number | null;
  predictedQualifier?: 'home' | 'away' | null;
  matchId: {
    _id: string;
    matchId?: string;
    homeTeam: string;
    awayTeam: string;
    stage: string;
    group?: string;
    matchDate: string;
    status: string;
  };
}

interface AgentPrediction {
  _id: string;
  predictedHome: number | null;
  predictedAway: number | null;
  predictedQualifier?: 'home' | 'away' | null;
  note?: string | null;
  source?: string;
  createdAt?: string;
  updatedAt?: string;
  matchId: {
    _id: string;
    matchId?: string;
    homeTeam: string;
    awayTeam: string;
    stage: string;
    group?: string;
    matchDate: string;
    status: string;
  };
}

export default function AgentPage() {
  const { data: session, status } = useSession();
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState('');
  const [sending, setSending] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [manual, setManual] = useState<ManualPrediction[]>([]);
  const [agentPreds, setAgentPreds] = useState<AgentPrediction[]>([]);
  const [lastTrace, setLastTrace] = useState<ToolTraceEntryLite[] | null>(null);
  const scrollRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (status === 'unauthenticated') {
      window.location.href = '/';
    }
  }, [status]);

  useEffect(() => {
    if (!session) return;
    void fetchAll();
  }, [session]);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, sending]);

  async function fetchAll() {
    try {
      const [mRes, aRes] = await Promise.all([
        fetch('/api/predictions/profile'),
        fetch('/api/predictions/agent-history'),
      ]);
      if (mRes.ok) {
        const data = await mRes.json();
        setManual((data.predictions ?? []) as ManualPrediction[]);
      }
      if (aRes.ok) {
        const data = await aRes.json();
        setAgentPreds((data.agentPredictions ?? []) as AgentPrediction[]);
      }
    } catch (err) {
      console.error('fetchAll error', err);
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const trimmed = input.trim();
    if (!trimmed) return;
    setErrorMsg(null);
    setSending(true);

    const newTurn: ChatMessage = { role: 'user', content: trimmed };
    const convo = [...messages, newTurn];
    setMessages(convo);
    setInput('');

    try {
      const res = await fetch('/api/agent-chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ messages: convo }),
      });
      const data = await res.json();
      if (!res.ok) {
        setErrorMsg(data.error ?? `Request failed (${res.status})`);
      } else {
        const assistantMessage: string = data.assistantMessage ?? '';
        setMessages([...convo, { role: 'assistant', content: assistantMessage }]);
        setLastTrace((data.toolTrace ?? []) as ToolTraceEntryLite[]);
        if (
          Array.isArray(data.toolTrace) &&
          data.toolTrace.some((t: ToolTraceEntryLite) => t.name === 'submit_prediction')
        ) {
          await fetchAll();
        }
      }
    } catch (err) {
      setErrorMsg(err instanceof Error ? err.message : 'Network error');
    } finally {
      setSending(false);
    }
  }

  if (status === 'loading') {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-sb-muted text-sm">Loading…</div>
      </div>
    );
  }
  if (!session) return null;

  // Build a side-by-side comparison slice across all matches with either a manual
  // and/or an agent prediction.
  const comparisonRows = buildComparisonRows(manual, agentPreds);

  return (
    <div className="max-w-6xl mx-auto px-3 py-4 space-y-4">
      <header className="sb-card overflow-hidden">
        <div className="sb-section-header flex items-center gap-3">
          <span className="w-2 h-2 rounded-full bg-sb-yellow pulse-live" />
          AI Prediction Agent · Africp-powered
        </div>
        <div className="p-4 flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-3 min-w-0">
            <Image
              src={session.user?.avatar || 'https://cdn.discordapp.com/embed/avatars/0.png'}
              alt={session.user?.username ?? 'User'}
              width={36}
              height={36}
              className="rounded-full border-2 border-sb-yellow/50 shrink-0"
            />
            <div className="min-w-0">
              <div className="font-bold text-white text-sm truncate">
                {session.user?.username}
              </div>
              <div className="text-sb-muted text-xs">
                Ask strategy questions, request picks, or analyze the leaderboard.
              </div>
            </div>
          </div>
          <Link href="/matches" className="sb-btn text-xs px-3 py-2">
            Make manual picks →
          </Link>
        </div>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <section className="lg:col-span-2 sb-card overflow-hidden flex flex-col h-[calc(100vh-220px)] min-h-[480px]">
          <div className="sb-section-header">Chat</div>
          <div ref={scrollRef} className="flex-1 overflow-y-auto px-3 py-3 space-y-3">
            {messages.length === 0 && (
              <div className="text-sb-muted text-sm space-y-2">
                <p className="font-semibold text-white">Try asking:</p>
                <ul className="list-disc list-inside space-y-1 pl-1">
                  <li>“Where do I sit on the leaderboard?”</li>
                  <li>“What’s the closest upcoming match I haven’t predicted?”</li>
                  <li>“Predict Brazil vs Scotland — give me a reason.”</li>
                  <li>“Can I still overtake the leader? What’s the math?”</li>
                </ul>
              </div>
            )}
            {messages.map((m, i) => (
              <Bubble key={i} role={m.role} content={m.content} />
            ))}
            {sending && (
              <div className="flex justify-start">
                <div className="bg-sb-card-2 border border-sb-border rounded-sm px-3 py-2 text-sb-muted text-xs italic">
                  Agent is thinking…
                </div>
              </div>
            )}
          </div>
          {lastTrace && lastTrace.length > 0 && (
            <div className="border-t border-sb-border px-3 py-2 flex flex-wrap gap-1.5">
              <span className="text-[10px] uppercase tracking-widest text-sb-muted font-bold mr-1">
                Tools used:
              </span>
              {lastTrace.map((t, i) => (
                <span
                  key={i}
                  className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-sm ${
                    t.isError
                      ? 'bg-red-900/30 text-red-300 border border-red-900/60'
                      : 'bg-sb-green/20 text-sb-yellow border border-sb-green/40'
                  }`}
                  title={typeof t.result === 'string' ? t.result.slice(0, 240) : ''}
                >
                  {t.name}
                </span>
              ))}
            </div>
          )}
          <form onSubmit={handleSubmit} className="border-t border-sb-border p-3 flex gap-2">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Ask the agent anything about your predictions…"
              disabled={sending}
              className="flex-1 bg-sb-bg border border-sb-border focus:border-sb-yellow rounded-sm px-3 py-2 text-sm text-white focus:outline-none placeholder:text-sb-muted disabled:opacity-50"
            />
            <button
              type="submit"
              disabled={sending || !input.trim()}
              className="sb-btn text-sm px-4 disabled:opacity-40"
            >
              {sending ? 'Sending…' : 'Send'}
            </button>
          </form>
          {errorMsg && (
            <div className="border-t border-red-900/40 bg-red-900/10 px-3 py-2 text-xs text-red-300">
              {errorMsg}
            </div>
          )}
        </section>

        <aside className="space-y-4">
          <div className="sb-card overflow-hidden">
            <div className="sb-section-header">Your picks vs Agent drafts</div>
            {comparisonRows.length === 0 ? (
              <div className="p-6 text-center text-sb-muted text-xs">
                Ask the agent to predict a match to see comparison cards here.
              </div>
            ) : (
              <div className="divide-y divide-sb-border">
                {comparisonRows.map((row) => (
                  <div key={row.matchKey} className="p-3">
                    <AgentComparisonCard
                      match={row.match}
                      manual={row.manual}
                      agent={row.agent}
                      highlight={row.justSubmitted}
                    />
                  </div>
                ))}
              </div>
            )}
          </div>
        </aside>
      </div>
    </div>
  );
}

interface ComparisonRow {
  matchKey: string;
  match: {
    homeTeam: string;
    awayTeam: string;
    stage: string;
    group?: string;
    matchDate: string | Date;
    status: string;
  };
  manual: ManualPrediction | null;
  agent: AgentPrediction | null;
  justSubmitted: boolean;
}

function buildComparisonRows(
  manual: ManualPrediction[],
  agent: AgentPrediction[]
): ComparisonRow[] {
  // Index by match._id (string) so we can merge
  const byKey = new Map<
    string,
    { manual: ManualPrediction | null; agent: AgentPrediction | null; ts: number }
  >();

  for (const m of manual) {
    if (!m?.matchId) continue;
    const key = typeof m.matchId === 'object' ? m.matchId._id : String(m.matchId);
    byKey.set(key, { manual: m, agent: byKey.get(key)?.agent ?? null, ts: 0 });
  }
  for (const a of agent) {
    if (!a?.matchId) continue;
    const key = typeof a.matchId === 'object' ? a.matchId._id : String(a.matchId);
    const prev = byKey.get(key);
    const ts = a.updatedAt ? new Date(a.updatedAt).getTime() : 0;
    byKey.set(key, {
      manual: prev?.manual ?? null,
      agent: a,
      ts,
    });
  }

  // Filter to scheduled matches (we only show OPEN picks here)
  const rows: ComparisonRow[] = [];
  byKey.forEach((v, key) => {
    if (!v.agent && !v.manual) return;
    const sourceMatch = v.manual?.matchId ?? v.agent?.matchId;
    if (!sourceMatch || typeof sourceMatch !== 'object') return;
    const matchLike: any = sourceMatch;
    if (matchLike.status && matchLike.status !== 'scheduled') return;
    rows.push({
      matchKey: key,
      match: {
        homeTeam: matchLike.homeTeam,
        awayTeam: matchLike.awayTeam,
        stage: matchLike.stage,
        group: matchLike.group,
        matchDate: matchLike.matchDate,
        status: matchLike.status,
      },
      manual: v.manual,
      agent: v.agent,
      justSubmitted: v.ts > Date.now() - 5 * 60_000,
    });
  });
  rows.sort((a, b) => (a.match.matchDate > b.match.matchDate ? 1 : -1));
  return rows;
}

function Bubble({ role, content }: { role: 'user' | 'assistant'; content: string }) {
  const isUser = role === 'user';
  return (
    <div className={`flex ${isUser ? 'justify-end' : 'justify-start'}`}>
      <div
        className={`max-w-[85%] whitespace-pre-wrap rounded-sm px-3 py-2 text-sm leading-relaxed ${
          isUser
            ? 'bg-sb-yellow/15 border border-sb-yellow/40 text-white'
            : 'bg-sb-card-2 border border-sb-border text-white'
        }`}
      >
        {content}
      </div>
    </div>
  );
}
