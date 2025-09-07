// pages/api/call.ts
import type { NextApiRequest, NextApiResponse } from 'next';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') return res.status(405).end('Method not allowed');

  try {
    const body = req.body;
    // forward to your HTTP test server
    const backend = process.env.TEST_SERVER_URL ?? 'http://localhost:4000/call';
    const rsp = await fetch(backend, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    });

    if (!rsp.ok) {
      const txt = await rsp.text();
      return res.status(502).json({ ok: false, error: `Upstream error: ${rsp.status} ${txt}` });
    }

    const json = await rsp.json();
    // json = { ok: true, result: ... } as per your test server
    return res.status(200).json(json);
  } catch (err: any) {
    return res.status(500).json({ ok: false, error: err?.message ?? String(err) });
  }
}
