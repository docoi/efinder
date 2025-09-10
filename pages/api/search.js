// pages/api/search.js
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';

const VPS_API_BASE = process.env.VPS_API_BASE || 'https://api.leads4ig.com';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'method_not_allowed' });
  }

  try {
    // Auth (required for user_id and RLS)
    const supabase = createRouteHandlerClient({ cookies });
    const { data: { session } } = await supabase.auth.getSession();
    if (!session?.user?.id) {
      return res.status(401).json({ error: 'unauthorized' });
    }

    const { q, limit, exclude } = req.body || {};
    const safeLimit = Math.max(1, Math.min(Number(limit || 10), 50));

    const payload = {
      user_id: session.user.id,
      q: String(q || '').trim(),
      limit: safeLimit,
      exclude: Array.isArray(exclude) ? exclude.map(String) : [],
    };

    const resp = await fetch(`${VPS_API_BASE}/search`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });

    const data = await resp.json().catch(() => ({}));
    if (!resp.ok) {
      return res.status(resp.status).json(data || { error: 'vps_error' });
    }

    return res.status(200).json(data);
  } catch (e) {
    console.error('search api error', e);
    return res.status(500).json({ error: 'server_error' });
  }
}
