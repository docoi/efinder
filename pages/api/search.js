// pages/api/search.js
import { createPagesServerClient } from '@supabase/auth-helpers-nextjs';

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).end();

  const supabase = createPagesServerClient({ req, res });
  const { data: { user }, error } = await supabase.auth.getUser();
  if (error || !user) return res.status(401).json({ error: 'Unauthorized' });

  const { q, limit = 3 } = req.body || {};
  const vps = process.env.VPS_API_BASE;
  if (!vps) return res.status(500).json({ error: 'VPS_API_BASE missing' });

  // 1) read candidates from the VPS (service role stays on VPS)
  const r = await fetch(`${vps}/search`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ user_id: user.id, q, limit }),
  });
  if (!r.ok) return res.status(502).json({ error: await r.text() });

  const leads = await r.json();

  // 2) record deliveries (no dupes via onConflict)
  const deliveries = (leads || []).map(l => ({
    user_id: user.id,
    ig_id: l.ig_id,
    run_id: (globalThis.crypto?.randomUUID?.() || `${Date.now()}-${Math.random()}`),
    credits_charged: Array.isArray(l.emails) ? l.emails.length : 0,
    is_trial: false, // set true if you call this from the trial flow
  }));

  const { error: upErr } = await supabase
    .from('deliveries')
    .upsert(deliveries, { onConflict: 'user_id,ig_id', ignoreDuplicates: true });

  if (upErr) console.error('deliveries upsert error:', upErr);
  res.json({ leads });
}
