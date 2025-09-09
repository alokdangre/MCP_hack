#!/usr/bin/env node
import 'dotenv/config';
import http from 'http';
import { URL } from 'url';
import * as slack from './services/slack/index.js';
import * as github from './services/github/index.js';
import * as google from './services/google/index.js';

const PORT = Number(process.env.PORT ?? 4000);

// combine tools for listing
const TOOLS = [
  ...slack.tools,
  ...github.tools,
  ...(google.tools ?? []),
];

function findServiceForTool(name: string) {
  if (name.startsWith('slack_')) return { service: slack, name };
  if (name.startsWith('google_')) return { service: google, name };
  // github had some non-prefixed names — check tools list
  if (github.toolNames?.includes(name) || name.startsWith('github_')) return { service: github, name };
  // fallback: try matching by name in TOOLS
  const found = TOOLS.find((t: any) => t.name === name);
  if (found) {
    if (found.name.startsWith('slack_')) return { service: slack, name };
    if (found.name.startsWith('github_') || github.toolNames?.includes(found.name)) return { service: github, name: found.name };
    if (found.name.startsWith('google_')) return { service: google, name: found.name };
  }
  return null;
}

async function handleCallTool(body: any, res: http.ServerResponse) {
  if (!body || typeof body.name !== 'string') {
    res.writeHead(400, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ error: 'body must be JSON with field "name": string and optional "arguments": object' }));
    return;
  }
  const name = body.name;
  const args = body.arguments ?? {};
  const mapping = findServiceForTool(name);
  if (!mapping) {
    res.writeHead(404, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ error: `Unknown tool: ${name}` }));
    return;
  }
  try {
    const result = await mapping.service.callTool(mapping.name, args);
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ ok: true, result }, null, 2));
  } catch (err: any) {
    res.writeHead(500, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ ok: false, error: err?.message ?? String(err) }));
  }
}

const server = http.createServer(async (req, res) => {
  const url = new URL(req.url ?? '', `http://${req.headers.host}`);
  if (req.method === 'GET' && url.pathname === '/tools') {
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify(TOOLS.map((t: any) => ({ name: t.name, description: t.description })), null, 2));
    return;
  }

  if (req.method === 'POST' && url.pathname === '/call') {
    // collect body
    let raw = '';
    req.on('data', (chunk) => (raw += chunk));
    req.on('end', async () => {
      try {
        const body = raw ? JSON.parse(raw) : {};
        await handleCallTool(body, res);
      } catch (e: any) {
        res.writeHead(400, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ error: 'Invalid JSON body', details: e?.message ?? String(e) }));
      }
    });
    return;
  }

  // root help
  if (req.method === 'GET' && url.pathname === '/') {
    res.writeHead(200, { 'Content-Type': 'text/plain' });
    res.end('HTTP test server for MCP gateway\nGET  /tools -> list tools\nPOST /call -> { name, arguments }\n');
    return;
  }

  res.writeHead(404);
  res.end('not found');
});

server.listen(PORT, () => {
  console.error(`HTTP test server listening at http://localhost:${PORT}`);
});
