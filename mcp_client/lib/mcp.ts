// src/lib/mcp.ts
export const MCP_BASE = process.env.NEXT_PUBLIC_MCP_HTTP_URL || 'http://localhost:4000';

export async function listTools() {
  const res = await fetch(`${MCP_BASE}/tools`);
  if (!res.ok) throw new Error(`MCP /tools failed: ${res.status}`);
  return res.json();
}

export async function callTool(name: string, args: any) {
  const res = await fetch(`${MCP_BASE}/call`, {
    method: 'POST',
    headers: {'Content-Type': 'application/json'},
    body: JSON.stringify({ name, arguments: args }),
  });
  if (!res.ok) {
    const text = await res.text();
    throw new Error(`MCP /call failed: ${res.status} ${text}`);
  }
  return res.json();
}
