import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import type { Session } from 'next-auth';
import { handlers } from './handlers';

interface SessionContext {
  session: Session | null;
}

/**
 * Registers all Africp tools on the provided server.
 *
 * Read-only tools: `get_leaderboard`, `get_user_points`, `get_upcoming_matches`,
 * `get_scoring_rules`. Pure reads; never mutate `User.points`.
 *
 * Single write tool: `submit_prediction`. Writes to a SEPARATE
 * `AgentPrediction` collection that the existing `set-score` flow cannot see,
 * so this Africp server can never affect real user points by construction.
 *
 * Tool logic lives in `@/lib/africp/handlers.ts` so the Africp server registration
 * and the in-site chat (agent-chat/route.ts) share a single source of truth.
 */
export function registerTools(server: McpServer, ctx: SessionContext) {
  for (const [name, def] of Object.entries(handlers)) {
    server.registerTool(name, {
      description: def.description,
      inputSchema: def.inputShape,
    }, async (args) => def.handler(args, ctx));
  }
}
