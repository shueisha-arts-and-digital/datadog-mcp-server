import type { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';

export type ToolRegistrar = (server: McpServer, client: import('./client.js').DatadogClient) => void;

export interface ToolDefinition {
  name: string;
  category: string;
  description: string;
  apiMethod: string;
  apiPath: string;
}

export const TOOL_CATEGORIES = {
  'error-tracking': {
    name: 'Error Tracking',
    description: 'Error tracking issues and events across services',
  },
  'monitors': {
    name: 'Monitors',
    description: 'Monitor definitions, statuses, and group searches',
  },
  'metrics': {
    name: 'Metrics',
    description: 'Active metrics, timeseries queries, and metadata',
  },
  'logs': {
    name: 'Logs',
    description: 'Log event search and retrieval',
  },
  'rum': {
    name: 'RUM',
    description: 'Real User Monitoring event search and retrieval',
  },
} as const;

export const TOOL_REGISTRY: ToolDefinition[] = [
  // Error Tracking
  { name: 'datadog_get_error_tracking_issue', category: 'error-tracking', description: 'Get details of a specific error tracking issue by ID', apiMethod: 'GET', apiPath: '/api/v2/error-tracking/issues/{issue_id}' },
  { name: 'datadog_search_error_tracking_issues', category: 'error-tracking', description: 'Search error tracking issues with query filters', apiMethod: 'POST', apiPath: '/api/v2/error-tracking/issues/search' },
  // Monitors
  { name: 'datadog_list_monitors', category: 'monitors', description: 'List all monitors with optional name/tag filters', apiMethod: 'GET', apiPath: '/api/v1/monitor' },
  { name: 'datadog_get_monitor', category: 'monitors', description: 'Get details of a specific monitor by ID', apiMethod: 'GET', apiPath: '/api/v1/monitor/{monitor_id}' },
  { name: 'datadog_search_monitor_groups', category: 'monitors', description: 'Search monitor groups with query string', apiMethod: 'GET', apiPath: '/api/v1/monitor/groups/search' },
  // Metrics
  { name: 'datadog_list_active_metrics', category: 'metrics', description: 'List active metrics since a given time', apiMethod: 'GET', apiPath: '/api/v1/metrics' },
  { name: 'datadog_query_metrics', category: 'metrics', description: 'Query timeseries metric data points', apiMethod: 'GET', apiPath: '/api/v1/query' },
  { name: 'datadog_list_tag_configurations', category: 'metrics', description: 'List metrics with tag configurations', apiMethod: 'GET', apiPath: '/api/v2/metrics' },
  { name: 'datadog_get_metric_metadata', category: 'metrics', description: 'Get metadata for a specific metric by name', apiMethod: 'GET', apiPath: '/api/v1/metrics/{metric_name}' },
  { name: 'datadog_list_metric_tags', category: 'metrics', description: 'List tag configurations for a specific metric', apiMethod: 'GET', apiPath: '/api/v2/metrics/{metric_name}/tags' },
  // Logs
  { name: 'datadog_search_logs', category: 'logs', description: 'Search log events with query filters and time range', apiMethod: 'POST', apiPath: '/api/v2/logs/events/search' },
  // RUM
  { name: 'datadog_search_rum_events', category: 'rum', description: 'Search RUM events with query filters and time range', apiMethod: 'POST', apiPath: '/api/v2/rum/events/search' },
];
