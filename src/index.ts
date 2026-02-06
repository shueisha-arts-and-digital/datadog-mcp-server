#!/usr/bin/env node

import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import { DatadogClient } from './client.js';
import { registerMetaTools } from './tools/meta.js';
import { registerErrorTrackingTools } from './tools/error-tracking.js';
import { registerMonitorTools } from './tools/monitors.js';
import { registerMetricTools } from './tools/metrics.js';
import { registerLogTools } from './tools/logs.js';
import { registerRumTools } from './tools/rum.js';

const DD_API_KEY = process.env.DD_API_KEY;
const DD_APP_KEY = process.env.DD_APP_KEY;
const DD_SITE = process.env.DD_SITE || 'datadoghq.com';

if (!DD_API_KEY || !DD_APP_KEY) {
  console.error('DD_API_KEY and DD_APP_KEY environment variables are required.');
  process.exit(1);
}

const client = new DatadogClient(DD_API_KEY, DD_APP_KEY, DD_SITE);

const server = new McpServer({
  name: 'datadog-mcp-server',
  version: '1.0.0',
});

registerMetaTools(server);
registerErrorTrackingTools(server, client);
registerMonitorTools(server, client);
registerMetricTools(server, client);
registerLogTools(server, client);
registerRumTools(server, client);

const TOOL_NAMES = [
  'datadog_list_tool_categories', 'datadog_search_tools',
  'datadog_get_error_tracking_issue', 'datadog_search_error_tracking_issues',
  'datadog_list_monitors', 'datadog_get_monitor', 'datadog_search_monitor_groups',
  'datadog_list_active_metrics', 'datadog_query_metrics', 'datadog_list_tag_configurations',
  'datadog_get_metric_metadata', 'datadog_list_metric_tags',
  'datadog_search_logs',
  'datadog_search_rum_events',
];

async function start() {
  const transport = new StdioServerTransport();
  await server.connect(transport);
  console.error(`Datadog MCP Server ready (Site: ${DD_SITE})`);
  console.error(`Available tools: ${TOOL_NAMES.join(', ')}`);
}

start().catch(console.error);
