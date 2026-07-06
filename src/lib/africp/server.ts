import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import type { Session } from 'next-auth';
import { registerTools } from './tools';

/**
 * Build a fresh `McpServer` instance for a single Africp request.
 *
 * Intentionally created PER REQUEST (not cached at module level): the tool
 * callbacks close over the calling user's session, so each invocation has its
 * own isolated `ctx`. The constructor is cheap — it just registers four
 * schemas + handlers — and `enableJsonResponse: true` returns a static
 * JSON `Response` so we don't hold any streams open afterwards.
 */
export function createAfricpServer(session: Session | null): McpServer {
  const server = new McpServer(
    {
      name: 'wc2026-prediction-africp',
      version: '0.1.0',
    },
    {
      capabilities: {
        tools: {},
      },
    }
  );

  registerTools(server, { session });
  return server;
}
