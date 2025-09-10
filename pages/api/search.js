// pages/api/search.js
import { createServerSupabaseClient } from '@supabase/auth-helpers-nextjs';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    return res.status(405).json({ error: 'method_not_allowed' });
  }

  try {
    const supabase = createServerSupabaseClient({ req, res });
    const {
      data: { session },
      error: sessionErr,
    } = await supabase.auth.getSession();

    if (sessionErr || !session?.user?.id) {
      return res.status(401).json({ error: 'unauthorized' });
    }
    const userId = session.user.id;

    const {
      q,
      limit,
      exclude,
      exclude_usernames,  // pass-through from client
      after,              // optional pass-through
    } = req.body || {};

    if (!q || typeof q !== 'string' || !q.trim()) {
      return res.status(400).json({ error: 'missing_query' });
    }

    const safeLimit = Math.min(Math.max(parseInt(limit || 10, 10), 1), 50);
    const safeExclude = Array.isArray(exclude) ? exclude.map(String).filter(Boolean) : [];
    const safeExcludeUsernames = Array.isArray(exclude_usernames)
      ? exclude_usernames.map((x) => String(x || '').toLowerCase()).filter(Boolean)
      : [];
    const safeAfter = typeof after === 'string' && after ? after : undefined;

    const base = process.env.VPS_API_BASE;
    if (!base) return res.status(500).json({ error: 'server_misconfig' });

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
        exclude_usernames: safeExcludeUsernames,
        after: safeAfter,
      }),
      signal: controller.signal,
    }).catch((e) => {
      throw new Error(`vps_fetch_failed: ${e.message}`);
    });

    clearTimeout(timeout);

    const payload = await vpsResp.json().catch(() => ({ error: 'invalid_json_from_vps' }));
    if (!vpsResp.ok) {
      return res.status(vpsResp.status).json({ error: 'vps_error', detail: payload });
    }

    return res.status(200).json(payload);
  } catch (e) {
    console.error('API /search error:', e);
    return res.status(500).json({ error: 'server_error' });
  }
}
