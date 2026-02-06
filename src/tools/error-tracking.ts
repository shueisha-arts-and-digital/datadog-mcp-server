import { z } from 'zod';
import type { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import type { DatadogClient } from '../client.js';
import type { ToolRegistrar } from '../types.js';

export const registerErrorTrackingTools: ToolRegistrar = (server: McpServer, client: DatadogClient) => {
  server.tool(
    'datadog_get_error_tracking_issue',
    'Get details of a specific error tracking issue by ID. Use datadog_search_error_tracking_issues first to find issue IDs.',
    {
      issue_id: z.string().describe('The ID of the error tracking issue'),
    },
    async ({ issue_id }) => {
      try {
        const result = await client.getErrorTrackingIssue({ issueId: issue_id });
        return { content: [{ type: 'text', text: JSON.stringify(result, null, 2) }] };
      } catch (error: unknown) {
        return { content: [{ type: 'text', text: formatError(error) }], isError: true };
      }
    }
  );

  server.tool(
    'datadog_search_error_tracking_issues',
    'Search error tracking issues with query filters. Uses POST /api/v2/error-tracking/issues/search with data.attributes body.',
    {
      query: z.string().describe('Search query string (e.g., "service:my-app", "error.type:TypeError")'),
      from: z.number().describe('Start time as POSIX timestamp (seconds)'),
      to: z.number().describe('End time as POSIX timestamp (seconds)'),
      track: z.string().optional().describe('Track type filter (e.g., "backend", "browser", "mobile")'),
    },
    async (params) => {
      try {
        const result = await client.searchErrorTrackingIssues(params);
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
