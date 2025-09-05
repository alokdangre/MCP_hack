#!/usr/bin/env node
import 'dotenv/config';
import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import { CallToolRequestSchema, ListToolsRequestSchema } from '@modelcontextprotocol/sdk/types.js';

import * as slackService from './services/slack/index.js';
import * as githubService from './services/github/index.js';
// import * as googleService from './services/google/index.js';

const server = new Server(
  {
    name: 'mcp-unified-gateway',
    version: '1.0.0',
  },
  {
    capabilities: { tools: {} },
  }
);

// Compose tools
const tools = [
  ...slackService.tools,
  ...githubService.tools,
  // ...(googleService.tools ?? []),
];

server.setRequestHandler(ListToolsRequestSchema, async () => {
  return { tools };
});

// generic delegator
server.setRequestHandler(CallToolRequestSchema, async (request: any) => {
  if (!request?.params) throw new Error('Invalid request shape');
  const toolName: string = request.params.name;
  const args = request.params.arguments ?? {};

  try {
    if (toolName.startsWith('slack_')) {
      const res = await slackService.callTool(toolName, args);
      return { content: [{ type: 'text', text: JSON.stringify(res) }] };
    }

    // Many GitHub tools in the original code are not prefixed; handle by explicit mapping inside service
    if (toolName.startsWith('github_') || githubService.toolNames?.includes(toolName)) {
      const res = await githubService.callTool(toolName, args);
      return { content: [{ type: 'text', text: JSON.stringify(res, null, 2) }] };
    }

    // if (toolName.startsWith('google_')) {
    //   const res = await googleService.callTool(toolName, args);
    //   return { content: [{ type: 'text', text: JSON.stringify(res) }] };
    // }

    throw new Error(`Unknown tool: ${toolName}`);
  } catch (err: any) {
    console.error(`[GATEWAY] error for ${toolName}:`, err);
    return { content: [{ type: 'text', text: JSON.stringify({ error: err?.message ?? String(err) }) }] };
  }
});

async function run() {
  const transport = new StdioServerTransport();
  await server.connect(transport);
  console.error('MCP Unified Gateway running on stdio');
}

run().catch((err) => {
  console.error('fatal gateway error:', err);
  process.exit(1);
});
