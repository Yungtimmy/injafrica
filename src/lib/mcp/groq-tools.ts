/**
 * OpenAI/Groq-flavored tool definitions paralleling the MCP `inputShape` in
 * `src/lib/mcp/handlers.ts`. Used by the in-site chat handler to expose the
 * same five tools to Groq's function-calling API.
 *
 * The shape intentionally mirrors the Zod definitions one-for-one; if you add
 * or change a field in handlers.ts, update the corresponding JSON schema here
 * so Groq's tool-call validator doesn't reject it.
 */
export interface GroqTool {
  type: 'function';
  function: {
    name: string;
    description: string;
    parameters: {
      type: 'object';
      properties: Record<string, unknown>;
      required?: string[];
    };
  };
}

export const groqTools: GroqTool[] = [
  {
    type: 'function',
    function: {
      name: 'get_leaderboard',
      description:
        'Returns the top N players ranked by WC2026 prediction points. Read-only. Requires an authenticated Discord session on the server side.',
      parameters: {
        type: 'object',
        properties: {
          limit: {
            type: 'integer',
            minimum: 1,
            maximum: 100,
            default: 25,
            description: 'How many top-ranked players to return. Default 25, max 100.',
          },
        },
        required: [],
      },
    },
  },
  {
    type: 'function',
    function: {
      name: 'get_user_points',
      description:
        "Returns the calling user's points and global rank. No parameters — the user identity is taken from the authenticated session. Read-only.",
      parameters: { type: 'object', properties: {}, required: [] },
    },
  },
  {
    type: 'function',
    function: {
      name: 'get_upcoming_matches',
      description:
        'Returns scheduled (not-yet-finished) WC2026 matches sorted by matchDate ascending. Read-only.',
      parameters: {
        type: 'object',
        properties: {
          limit: {
            type: 'integer',
            minimum: 1,
            maximum: 100,
            default: 20,
            description: 'How many matches to return. Default 20, max 100.',
          },
        },
        required: [],
      },
    },
  },
  {
    type: 'function',
    function: {
      name: 'submit_prediction',
      description:
        "Submits (or replaces) the calling user's agent prediction for a single match. Writes to a SEPARATE AgentPrediction collection that is INVISIBLE to the scoring system, so this tool cannot affect User.points, the leaderboard, or set-score by construction. Use the matchId returned by get_upcoming_matches (business key like 'A1') or a Mongo ObjectId hex string.",
      parameters: {
        type: 'object',
        properties: {
          matchId: {
            type: 'string',
            minLength: 1,
            description:
              "Match identifier — either the business key (e.g. 'A1', 'B2') returned by get_upcoming_matches, or a Mongo ObjectId hex string.",
          },
          predictedHome: {
            type: 'integer',
            minimum: 0,
            maximum: 20,
            description:
              'Predicted home-team goals at the end of regular/90-min time. Integer 0-20.',
          },
          predictedAway: {
            type: 'integer',
            minimum: 0,
            maximum: 20,
            description:
              'Predicted away-team goals at the end of regular/90-min time. Integer 0-20.',
          },
          predictedQualifier: {
            type: 'string',
            enum: ['home', 'away'],
            description:
              "Predicted advancing team. REQUIRED only for knockout matches where the predicted 90-min score is a draw; 'home' or 'away' indicates who advances after extra time / penalties.",
          },
          note: {
            type: 'string',
            maxLength: 500,
            description:
              'Optional short explanation (max 500 chars) shown to the user alongside the agent draft.',
          },
        },
        required: ['matchId', 'predictedHome', 'predictedAway'],
      },
    },
  },
  {
    type: 'function',
    function: {
      name: 'get_scoring_rules',
      description:
        'Returns a textual description of the prediction scoring rules (a mirror of src/lib/points.ts). Read-only.',
      parameters: { type: 'object', properties: {}, required: [] },
    },
  },
];
