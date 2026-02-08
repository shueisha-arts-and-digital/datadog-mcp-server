import type { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';

export type ToolRegistrar = (server: McpServer, client: import('./client.js').DatadogClient) => void;

// ─── Error Tracking ───

export interface GetErrorTrackingIssueParams {
  issueId: string;
}

export interface SearchErrorTrackingIssuesParams {
  query: string;
  from: number;
  to: number;
  track?: string;
}

// ─── Monitors ───

export interface ListMonitorsParams {
  group_states?: string;
  name?: string;
  tags?: string;
  monitor_tags?: string;
  page?: number;
  page_size?: number;
}

export interface GetMonitorParams {
  monitorId: number;
}

export interface SearchMonitorGroupsParams {
  query?: string;
  page?: number;
  per_page?: number;
  sort?: string;
}

// ─── Metrics ───

export interface ListActiveMetricsParams {
  from: number;
  host?: string;
  tag_filter?: string;
}

export interface QueryMetricsParams {
  from: number;
  to: number;
  query: string;
}

export interface GetMetricMetadataParams {
  metricName: string;
}

export interface ListAllMetricTagsParams {
  metricName: string;
  windowSeconds?: number;
}

export interface SearchMetricsParams {
  query: string;
}

// ─── Logs ───

export interface SearchLogsParams {
  filter_query?: string;
  filter_from?: string;
  filter_to?: string;
  sort?: string;
  page_limit?: number;
  page_cursor?: string;
}

// ─── RUM ───

export interface SearchRumEventsParams {
  filter_query?: string;
  filter_from?: string;
  filter_to?: string;
  sort?: string;
  page_limit?: number;
  page_cursor?: string;
}

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
  { name: 'datadog_get_metric_metadata', category: 'metrics', description: 'Get metadata for a specific metric by name', apiMethod: 'GET', apiPath: '/api/v1/metrics/{metric_name}' },
  { name: 'datadog_list_all_metric_tags', category: 'metrics', description: 'List all tags for a specific metric including ingested tags', apiMethod: 'GET', apiPath: '/api/v2/metrics/{metric_name}/all-tags' },
  { name: 'datadog_search_metrics', category: 'metrics', description: 'Search metric names by query prefix', apiMethod: 'GET', apiPath: '/api/v1/search' },
  // Logs
  { name: 'datadog_search_logs', category: 'logs', description: 'Search log events with query filters and time range', apiMethod: 'POST', apiPath: '/api/v2/logs/events/search' },
  // RUM
  { name: 'datadog_search_rum_events', category: 'rum', description: 'Search RUM events with query filters and time range', apiMethod: 'POST', apiPath: '/api/v2/rum/events/search' },
];
