import { z } from 'zod';
import type { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import type { DatadogClient } from '../client.js';
import type { ToolRegistrar } from '../types.js';

export const registerMonitorTools: ToolRegistrar = (server: McpServer, client: DatadogClient) => {
  server.tool(
    'datadog_list_monitors',
    'List all monitors with optional name/tag filters. Returns monitor definitions and their current statuses.',
    {
      group_states: z.string().optional().describe('Comma-separated list of group states to filter on (e.g., "alert,warn,no data")'),
      name: z.string().optional().describe('Filter monitors by name substring'),
      tags: z.string().optional().describe('Comma-separated list of tags to filter by (e.g., "env:prod,service:web")'),
      monitor_tags: z.string().optional().describe('Comma-separated list of monitor tags to filter by'),
      page: z.number().optional().describe('Page number (0-indexed)'),
      page_size: z.number().optional().describe('Number of monitors per page (default: 100)'),
    },
    async (params) => {
      try {
        const result = await client.listMonitors(params);
        return { content: [{ type: 'text', text: JSON.stringify(result, null, 2) }] };
      } catch (error: unknown) {
        return { content: [{ type: 'text', text: formatError(error) }], isError: true };
      }
    }
  );

  server.tool(
    'datadog_get_monitor',
    'Get details of a specific monitor by ID. Use datadog_list_monitors first to find monitor IDs.',
    {
      monitor_id: z.number().describe('The ID of the monitor'),
    },
    async ({ monitor_id }) => {
      try {
        const result = await client.getMonitor(monitor_id);
        return { content: [{ type: 'text', text: JSON.stringify(result, null, 2) }] };
      } catch (error: unknown) {
        return { content: [{ type: 'text', text: formatError(error) }], isError: true };
      }
    }
  );

  server.tool(
    'datadog_search_monitor_groups',
    'Search monitor groups with a query string. Useful for finding specific monitor group statuses.',
    {
      query: z.string().optional().describe('Search query string'),
      page: z.number().optional().describe('Page number (0-indexed)'),
      per_page: z.number().optional().describe('Number of results per page (default: 30)'),
      sort: z.string().optional().describe('Sort field and direction (e.g., "name,asc")'),
    },
    async (params) => {
      try {
        const result = await client.searchMonitorGroups(params);
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
