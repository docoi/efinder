export default async function handler(req, res) {
    const base = process.env.VPS_API_BASE;
    if (!base) return res.status(500).json({ ok: false, error: 'VPS_API_BASE not set' });
    try {
      const r = await fetch(`${base}/healthz`);
      const text = await r.text();
      return res.status(200).json({ ok: r.ok, status: r.status, body: text.slice(0, 200) });
    } catch (e) {
      return res.status(500).json({ ok: false, error: String(e) });
    }
  }
  