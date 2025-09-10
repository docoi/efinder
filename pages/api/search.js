// pages/api/search.js
import { createServerSupabaseClient } from '@supabase/auth-helpers-nextjs';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    return res.status(405).json({ error: 'method_not_allowed' });
  }

  try {
    // 1) Auth: get the signed-in user
    const supabase = createServerSupabaseClient({ req, res });
    const {
      data: { session },
      error: sessionErr,
    } = await supabase.auth.getSession();

    if (sessionErr) {
      console.error('getSession error:', sessionErr);
      return res.status(401).json({ error: 'unauthorized' });
    }
    const userId = session?.user?.id;
    if (!userId) {
      return res.status(401).json({ error: 'unauthorized' });
    }

    // 2) Validate input
    const { q, limit, exclude } = (req.body || {});
    if (!q || typeof q !== 'string' || !q.trim()) {
      return res.status(400).json({ error: 'missing_query' });
    }

    const safeLimit = Math.min(Math.max(parseInt(limit || 10, 10), 1), 50);
    const safeExclude =
      Array.isArray(exclude) ? exclude.map(String).filter(Boolean) : [];

    // 3) Call the VPS API
    const base = process.env.VPS_API_BASE; // e.g. https://api.leads4ig.com
    if (!base) {
      console.error('VPS_API_BASE is missing from environment');
      return res.status(500).json({ error: 'server_misconfig' });
    }

    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 30000);

    const vpsResp = await fetch(`${base.replace(/\/$/, '')}/search`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        user_id: userId,
        q: q.trim(),
        limit: safeLimit,
        exclude: safeExclude,
      }),
      signal: controller.signal,
    }).catch((e) => {
      // fetch throws on abort / network errors
      throw new Error(`vps_fetch_failed: ${e.message}`);
    });

    clearTimeout(timeout);

    const payload = await vpsResp
      .json()
      .catch(() => ({ error: 'invalid_json_from_vps' }));

    if (!vpsResp.ok) {
      // Bubble up VPS error for visibility in DevTools
      return res.status(vpsResp.status).json({
        error: 'vps_error',
        status: vpsResp.status,
        detail: payload,
      });
    }

    // 4) Return results to the client
    return res.status(200).json(payload);
  } catch (e) {
    console.error('API /search error:', e);
    const message =
      typeof e?.message === 'string' ? e.message : 'internal_error';
    return res.status(500).json({ error: 'server_error', detail: message });
  }
}
