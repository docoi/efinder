// pages/api/auth/session.js
export default function handler(req, res) {
  // no-op: acknowledge session pings from the client helper
  if (req.method !== 'GET' && req.method !== 'POST') {
    res.setHeader('Allow', ['GET', 'POST']);
    return res.status(405).end();
  }
  return res.status(200).json({ ok: true });
}
