// pages/api/tools.ts
import type { NextApiRequest, NextApiResponse } from 'next';
import { MCP_BASE } from '../../src/lib/mcp';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    const upstream = await fetch(`${MCP_BASE}/tools`);
    const json = await upstream.json();
    res.status(200).json(json);
  } catch (err: any) {
    res.status(500).json({ error: err?.message ?? String(err) });
  }
}
