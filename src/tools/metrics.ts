import { z } from 'zod';
import type { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import type { DatadogClient } from '../client.js';
import type { ToolRegistrar } from '../types.js';

export const registerMetricTools: ToolRegistrar = (server: McpServer, client: DatadogClient) => {
  server.tool(
    'datadog_list_active_metrics',
    'List active metrics reported since a given time. Returns metric names.',
    {
      from: z.number().describe('POSIX timestamp (seconds) from which to list active metrics'),
      host: z.string().optional().describe('Filter metrics by host name'),
      tag_filter: z.string().optional().describe('Filter metrics by tag (e.g., "env:production")'),
    },
    async (params) => {
      try {
        const result = await client.listActiveMetrics(params);
        return { content: [{ type: 'text', text: JSON.stringify(result, null, 2) }] };
      } catch (error: unknown) {
        return { content: [{ type: 'text', text: formatError(error) }], isError: true };
      }
    }
  );

  server.tool(
    'datadog_query_metrics',
    'Query timeseries metric data points. Returns datapoints for graphing or analysis.',
    {
      from: z.number().describe('Start time as POSIX timestamp (seconds)'),
      to: z.number().describe('End time as POSIX timestamp (seconds)'),
      query: z.string().describe('Datadog metrics query string (e.g., "avg:system.cpu.user{*}", "sum:trace.servlet.request.hits{service:my-app}.as_count()")'),
    },
    async (params) => {
      try {
        const result = await client.queryMetrics(params);
        return { content: [{ type: 'text', text: JSON.stringify(result, null, 2) }] };
      } catch (error: unknown) {
        return { content: [{ type: 'text', text: formatError(error) }], isError: true };
      }
    }
  );

  server.tool(
    'datadog_list_tag_configurations',
    'List metrics with tag configurations. Returns metric names and their tag configuration metadata.',
    {
      filter_configured: z.boolean().optional().describe('Filter on metrics that have configured tags'),
      filter_tags_configured: z.string().optional().describe('Filter tag configurations by configured/actively_queried state'),
      filter_metric_type: z.string().optional().describe('Filter by metric type (gauge, count, rate, distribution)'),
      filter_include_percentiles: z.boolean().optional().describe('Filter by whether percentiles are included'),
      filter_queried: z.boolean().optional().describe('Filter on actively queried metrics'),
      filter_tags: z.string().optional().describe('Filter by tag key-value pair'),
      window_seconds: z.number().optional().describe('Time window in seconds for query activity (default: 3600)'),
    },
    async (params) => {
      try {
        const result = await client.listTagConfigurations(params);
        return { content: [{ type: 'text', text: JSON.stringify(result, null, 2) }] };
      } catch (error: unknown) {
        return { content: [{ type: 'text', text: formatError(error) }], isError: true };
      }
    }
  );

  server.tool(
    'datadog_get_metric_metadata',
    'Get metadata for a specific metric by name. Returns type, description, unit, and other metadata.',
    {
      metric_name: z.string().describe('The name of the metric (e.g., "system.cpu.user")'),
    },
    async ({ metric_name }) => {
      try {
        const result = await client.getMetricMetadata({ metricName: metric_name });
        return { content: [{ type: 'text', text: JSON.stringify(result, null, 2) }] };
      } catch (error: unknown) {
        return { content: [{ type: 'text', text: formatError(error) }], isError: true };
      }
    }
  );

  server.tool(
    'datadog_list_metric_tags',
    'List tag configurations for a specific metric. Shows which tags are queryable.',
    {
      metric_name: z.string().describe('The name of the metric (e.g., "system.cpu.user")'),
    },
    async ({ metric_name }) => {
      try {
        const result = await client.listMetricTags({ metricName: metric_name });
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
