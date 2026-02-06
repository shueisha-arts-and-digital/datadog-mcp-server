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

const transport = new StdioServerTransport();
await server.connect(transport);
