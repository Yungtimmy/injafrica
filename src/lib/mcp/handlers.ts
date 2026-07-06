import { z, ZodRawShape } from 'zod';
import { Types } from 'mongoose';
import type { Session } from 'next-auth';
import dbConnect from '@/lib/mongodb';
import Match from '@/models/Match';
import User from '@/models/User';
import AgentPrediction from '@/models/AgentPrediction';

export interface ToolContext {
  session: Session | null;
}

export interface ToolResult {
  content: Array<{ type: 'text'; text: string; [key: string]: unknown }>;
  isError?: boolean;
  _meta?: Record<string, unknown>;
  [key: string]: unknown;
}

export type ToolHandler = (args: any, ctx: ToolContext) => Promise<ToolResult>;

export interface ToolDefinition {
  description: string;
  inputShape: ZodRawShape;
  handler: ToolHandler;
}

/**
 * Single source of truth for all MCP / chat tool handlers.
 *
 * Each entry exposes:
 *   - description: shown to the LLM (and to MCP clients on list)
 *   - inputShape: Zod raw-shape used by the MCP SDK + manually mirrored
 *                 as OpenAI JSON schema for Groq in @/lib/mcp/groq-tools.ts
 *   - handler: pure async function (args, ctx) => ToolResult
 *
 * Consumers:
 *   - src/lib/mcp/tools.ts      (registers each on a fresh McpServer)
 *   - src/app/api/agent-chat    (calls handlers[name].handler directly)
 */
export const handlers: Record<string, ToolDefinition> = {
  // ========================================================================
  // READ: top N players by points
  // ========================================================================
  get_leaderboard: {
    description:
      'Returns the top N players ranked by WC2026 prediction points. Read-only. Does not mutate or award points. Requires an authenticated Discord session on the server side.',
    inputShape: {
      limit: z
        .number()
        .int()
        .min(1)
        .max(100)
        .default(25)
        .describe('How many top-ranked players to return. Default 25, max 100.'),
    },
    handler: async ({ limit } = {}) => {
      await dbConnect();
      const users = await User.find({})
        .sort({ points: -1, createdAt: 1 })
        .limit(limit ?? 25)
        .lean();
      const rows = users.map((u, i) => ({
        rank: i + 1,
        discordId: u.discordId,
        username: u.username,
        avatar: u.avatar,
        points: u.points,
      }));
      return { content: [{ type: 'text', text: JSON.stringify(rows, null, 2) }] };
    },
  },

  // ========================================================================
  // READ: caller's points + global rank
  // ========================================================================
  get_user_points: {
    description:
      "Returns the calling user's points and global rank. No parameters — the user identity is taken from the authenticated session. Read-only.",
    inputShape: {},
    handler: async (_args, ctx) => {
      const discordId = ctx.session?.user?.discordId;
      if (!discordId) {
        return {
          content: [{ type: 'text', text: 'ERROR: Not authenticated.' }],
          isError: true,
        };
      }
      await dbConnect();
      const me = await User.findOne({ discordId }).lean();
      if (!me) {
        return {
          content: [
            {
              type: 'text',
              text: 'ERROR: Authenticated user is not registered in the database.',
            },
          ],
          isError: true,
        };
      }
      const higherCount = await User.countDocuments({
        points: { $gt: me.points },
      });
      return {
        content: [
          {
            type: 'text',
            text: JSON.stringify(
              {
                discordId: me.discordId,
                username: me.username,
                avatar: me.avatar,
                points: me.points,
                rank: higherCount + 1,
              },
              null,
              2
            ),
          },
        ],
      };
    },
  },

  // ========================================================================
  // READ: scheduled matches
  // ========================================================================
  get_upcoming_matches: {
    description:
      'Returns scheduled (not-yet-finished) WC2026 matches sorted by matchDate ascending. Read-only. No live or finished matches are included.',
    inputShape: {
      limit: z
        .number()
        .int()
        .min(1)
        .max(100)
        .default(20)
        .describe('How many matches to return. Default 20, max 100.'),
    },
    handler: async ({ limit } = {}) => {
      await dbConnect();
      const matches = await Match.find({ status: 'scheduled' })
        .sort({ matchDate: 1 })
        .limit(limit ?? 20)
        .lean();
      const rows = matches.map((m) => ({
        matchId: m.matchId,
        homeTeam: m.homeTeam,
        awayTeam: m.awayTeam,
        group: m.group,
        stage: m.stage,
        matchDate: m.matchDate,
        venue: m.venue,
        city: m.city,
      }));
      return { content: [{ type: 'text', text: JSON.stringify(rows, null, 2) }] };
    },
  },

  // ========================================================================
  // WRITE: submit_prediction (writes to AgentPrediction ONLY)
  //
  //   - Never writes to Prediction, User, Match, Settings.
  //   - The existing set-score flow queries `Prediction.find({ matchId })`
  //     so this row is structurally invisible to scoring.
  //   - User.points cannot be reached from this handler — it doesn't touch User.
  // ========================================================================
  submit_prediction: {
    description:
      "Submits (or replaces) the calling user's agent prediction for a single match. Writes to a SEPARATE AgentPrediction collection that is INVISIBLE to the scoring system, so this tool cannot affect User.points, the leaderboard, or set-score by construction. Use the matchId returned by get_upcoming_matches (business key like 'A1') or a Mongo ObjectId hex string.",
    inputShape: {
      matchId: z
        .string()
        .min(1)
        .describe(
          "Match identifier — either the business key (e.g. 'A1', 'B2') returned by get_upcoming_matches, or a Mongo ObjectId hex string."
        ),
      predictedHome: z
        .number()
        .int()
        .min(0)
        .max(20)
        .describe('Predicted home-team goals at the end of regular/90-min time. Integer 0-20.'),
      predictedAway: z
        .number()
        .int()
        .min(0)
        .max(20)
        .describe('Predicted away-team goals at the end of regular/90-min time. Integer 0-20.'),
      predictedQualifier: z
        .enum(['home', 'away'])
        .optional()
        .describe(
          "Predicted advancing team. REQUIRED only for knockout matches where the predicted 90-min score is a draw; 'home' or 'away' indicates who advances after extra time / penalties."
        ),
      note: z
        .string()
        .max(500)
        .optional()
        .describe(
          'Optional short explanation (max 500 chars) shown to the user alongside the agent draft.'
        ),
    },
    handler: async (
      { matchId, predictedHome, predictedAway, predictedQualifier, note } = {},
      ctx
    ) => {
      const discordId = ctx.session?.user?.discordId;
      if (!discordId) {
        return {
          content: [{ type: 'text', text: 'ERROR: Not authenticated.' }],
          isError: true,
        };
      }

      try {
        await dbConnect();

        // Resolve the match from either an ObjectId or the business key.
        let match = null;
        if (Types.ObjectId.isValid(matchId)) {
          try {
            match = await Match.findById(matchId);
          } catch {
            match = null;
          }
        }
        if (!match) {
          match = await Match.findOne({ matchId });
        }
        if (!match) {
          return {
            content: [{ type: 'text', text: `ERROR: No match found for id '${matchId}'.` }],
            isError: true,
          };
        }
        if (match.status !== 'scheduled') {
          return {
            content: [
              {
                type: 'text',
                text: `ERROR: Match '${match.matchId}' is already ${match.status} and no longer accepts predictions.`,
              },
            ],
            isError: true,
          };
        }
        if (new Date(match.matchDate).getTime() < Date.now()) {
          return {
            content: [
              {
                type: 'text',
                text: `ERROR: Match '${match.matchId}' kickoff (${new Date(
                  match.matchDate
                ).toISOString()}) is in the past.`,
              },
            ],
            isError: true,
          };
        }

        const user = await User.findOne({ discordId });
        if (!user) {
          return {
            content: [
              { type: 'text', text: 'ERROR: Authenticated user not found in the database.' },
            ],
            isError: true,
          };
        }

        // UPSERT: same (discordId, matchId) replaces any previous agent draft.
        const ap = await AgentPrediction.findOneAndUpdate(
          { discordId, matchId: match._id },
          {
            $set: {
              userId: user._id,
              discordId,
              matchId: match._id,
              predictedHome,
              predictedAway,
              predictedQualifier: predictedQualifier ?? null,
              source: 'agent-mcp',
              note: note ?? null,
            },
          },
          { upsert: true, new: true, setDefaultsOnInsert: true }
        );

        if (!ap) {
          return {
            content: [{ type: 'text', text: 'ERROR: Failed to persist agent prediction.' }],
            isError: true,
          };
        }

        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify(
                {
                  ok: true,
                  isolated: true,
                  message:
                    'Agent draft saved. This row is in the SEPARATE AgentPrediction collection; it is not scored by set-score and never increments User.points.',
                  agentPrediction: {
                    _id: ap._id.toString(),
                    discordId: ap.discordId,
                    matchObjectId: ap.matchId.toString(),
                    businessMatchId: match.matchId,
                    homeTeam: match.homeTeam,
                    awayTeam: match.awayTeam,
                    predictedHome: ap.predictedHome,
                    predictedAway: ap.predictedAway,
                    predictedQualifier: ap.predictedQualifier,
                    source: ap.source,
                    note: ap.note,
                    createdAt: ap.createdAt,
                    updatedAt: ap.updatedAt,
                  },
                },
                null,
                2
              ),
            },
          ],
        };
      } catch (err) {
        console.error('[mcp] submit_prediction error', err);
        return {
          content: [
            {
              type: 'text',
              text: `ERROR: ${err instanceof Error ? err.message : 'unknown error'}`,
            },
          ],
          isError: true,
        };
      }
    },
  },

  // ========================================================================
  // READ: scoring rules text
  // ========================================================================
  get_scoring_rules: {
    description:
      'Returns a textual description of the prediction scoring rules (a mirror of src/lib/points.ts). Read-only.',
    inputShape: {},
    handler: async () => {
      const text = [
        'WC2026 scoring rules (mirrors src/lib/points.ts):',
        '',
        'For each finished match, the existing admin set-score flow iterates',
        'the "Prediction" collection only. Agent-submitted predictions live in',
        'the separate "AgentPrediction" collection and are NOT scored, so this MCP',
        'server cannot affect real points by design.',
        '',
        'Per-match points awarded by calculatePoints():',
        '  - Wrong outcome AND wrong qualifier -> 0 points',
        '  - Wrong outcome BUT correct qualifier -> 2 points',
        '  - Correct outcome ONLY (non-draw) -> 1 point',
        '  - Correct outcome ONLY (draw) -> 3 points',
        '  - Correct outcome + correct qualifier (non-draw) -> 3 points',
        '  - Correct outcome + correct qualifier (draw) -> 5 points',
        '  - Correct score ONLY (non-draw) -> 6 points',
        '  - Correct score ONLY (draw) -> 8 points',
        '  - Correct score + correct qualifier (non-draw) -> 8 points',
        '  - Correct score + correct qualifier (draw) -> 10 points',
        '',
        'Additional points awarded at the group-to-knockout boundary for each',
        'correctly guessed group advancer: +2 points.',
      ].join('\n');

      return { content: [{ type: 'text', text }] };
    },
  },
};

export type ToolName = keyof typeof handlers;
