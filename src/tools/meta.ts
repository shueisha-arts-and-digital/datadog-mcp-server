import { z } from 'zod';
import type { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { TOOL_CATEGORIES, TOOL_REGISTRY, type ToolDefinition } from '../types.js';

function formatTools(tools: ToolDefinition[], detailLevel: string): string {
  switch (detailLevel) {
    case 'name':
      return tools.map(t => t.name).join('\n');
    case 'description':
      return tools.map(t => `${t.name}: ${t.description}`).join('\n');
    case 'full':
      return tools.map(t =>
        `${t.name}:\n  description: ${t.description}\n  api: ${t.apiMethod} ${t.apiPath}\n  category: ${t.category}`
      ).join('\n\n');
    default:
      return tools.map(t => t.name).join('\n');
  }
}

export function registerMetaTools(server: McpServer): void {
  server.tool(
    'datadog_list_tool_categories',
    'List available Datadog tool categories and their tools. Use this to discover what tools are available before calling them.',
    {
      category: z.enum([
        'error-tracking', 'monitors', 'metrics', 'logs', 'rum',
      ]).optional().describe('Filter to a specific category'),
      detailLevel: z.enum(['name', 'description', 'full']).optional().default('description').describe(
        'Level of detail: name (tool names only), description (names + descriptions), full (complete definitions with API paths)'
      ),
    },
    async ({ category, detailLevel }) => {
      const level = detailLevel || 'description';

      if (category) {
        const cat = TOOL_CATEGORIES[category];
        const tools = TOOL_REGISTRY.filter(t => t.category === category);
        const header = `## ${cat.name}\n${cat.description}\n\n`;
        return { content: [{ type: 'text', text: header + formatTools(tools, level) }] };
      }

      const sections = Object.entries(TOOL_CATEGORIES).map(([key, cat]) => {
        const tools = TOOL_REGISTRY.filter(t => t.category === key);
        return `## ${cat.name} (${key})\n${cat.description}\n\n${formatTools(tools, level)}`;
      });

      return { content: [{ type: 'text', text: sections.join('\n\n') }] };
    }
  );

  server.tool(
    'datadog_search_tools',
    'Search for available Datadog tools by keyword. Use this to find the right tool for a specific task.',
    {
      keyword: z.string().describe('Keyword to search for in tool names and descriptions'),
      detailLevel: z.enum(['name', 'description', 'full']).optional().default('description').describe(
        'Level of detail: name (tool names only), description (names + descriptions), full (complete definitions)'
      ),
    },
    async ({ keyword, detailLevel }) => {
      const level = detailLevel || 'description';
      const lower = keyword.toLowerCase();
      const matches = TOOL_REGISTRY.filter(t =>
        t.name.toLowerCase().includes(lower) ||
        t.description.toLowerCase().includes(lower) ||
        t.category.toLowerCase().includes(lower)
      );

      if (matches.length === 0) {
        return { content: [{ type: 'text', text: `No tools found matching "${keyword}"` }] };
      }

      return { content: [{ type: 'text', text: `Found ${matches.length} tools matching "${keyword}":\n\n${formatTools(matches, level)}` }] };
    }
  );
}
