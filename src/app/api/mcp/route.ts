import { NextRequest } from 'next/server';
import { WebStandardStreamableHTTPServerTransport } from
  '@modelcontextprotocol/sdk/server/webStandardStreamableHttp.js';
import { auth } from '@/lib/auth';
import { createMcpServer } from '@/lib/mcp/server';

// Run on the Node runtime: Mongoose + WebStandard transport both require it.
export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

function jsonRpcError(status: number, code: number, message: string) {
  return new Response(
    JSON.stringify({
      jsonrpc: '2.0',
      error: { code, message },
      id: null,
    }),
    {
      status,
      headers: { 'Content-Type': 'application/json' },
    }
  );
}

function methodNotAllowedJson() {
  return new Response(
    JSON.stringify({
      jsonrpc: '2.0',
      error: { code: -32000, message: 'Method Not Allowed' },
      id: null,
    }),
    {
      status: 405,
      headers: { 'Content-Type': 'application/json', Allow: 'POST' },
    }
  );
}

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.discordId) {
    return jsonRpcError(401, -32001, 'Unauthorized: a valid Discord session is required to call the MCP endpoint.');
  }

  const server = createMcpServer(session);
  const transport = new WebStandardStreamableHTTPServerTransport({
    // Stateless mode: Next.js serverless-friendly; each request is fully isolated.
    sessionIdGenerator: undefined,
    // Return plain JSON-RPC responses (no SSE streams).
    enableJsonResponse: true,
  });

  try {
    await server.connect(transport);
    return await transport.handleRequest(req);
  } catch (err) {
    console.error('[mcp] request error', err);
    return jsonRpcError(500, -32603, 'Internal server error');
  }
}

export async function GET() {
  return methodNotAllowedJson();
}

export async function DELETE() {
  // Stateless mode has no closing semantics, but spec asks for a clear
  // signal so clients don't try to open long-lived GET streams.
  return methodNotAllowedJson();
}
