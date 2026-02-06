import { z } from 'zod';
import type { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import type { DatadogClient } from '../client.js';
import type { ToolRegistrar } from '../types.js';

export const registerLogTools: ToolRegistrar = (server: McpServer, client: DatadogClient) => {
  server.tool(
    'datadog_search_logs',
    'Search log events with query filters and time range. Returns matching log entries with metadata.',
    {
      filter_query: z.string().optional().describe('Log search query (e.g., "service:my-app status:error", "@http.status_code:500"). Default: "*"'),
      filter_from: z.string().optional().describe('Start time (ISO 8601 or relative like "now-15m"). Default: "now-15m"'),
      filter_to: z.string().optional().describe('End time (ISO 8601 or relative like "now"). Default: "now"'),
      sort: z.string().optional().describe('Sort order (e.g., "-timestamp" for newest first, "timestamp" for oldest first)'),
      page_limit: z.number().optional().describe('Number of log events per page (default: 10, max: 1000)'),
      page_cursor: z.string().optional().describe('Cursor for pagination from previous response'),
    },
    async (params) => {
      try {
        const result = await client.searchLogs(params);
        return { content: [{ type: 'text', text: JSON.stringify(result, null, 2) }] };
      } catch (error: unknown) {
        return { content: [{ type: 'text', text: formatError(error) }], isError: true };
      }
    }
  );
};

function formatError(error: unknown): string {
  if (error instanceof Error) {
    const axiosError = error as { response?: { status?: number; statusText?: string; data?: unknown } };
    if (axiosError.response) {
      return `Datadog API Error: ${axiosError.response.status} ${axiosError.response.statusText}\n${JSON.stringify(axiosError.response.data, null, 2)}`;
    }
    return error.message;
  }
  return 'Unknown error';
}
