import { createServerSupabaseClient } from '@supabase/auth-helpers-nextjs';

export default async function handler(req, res) {
  try {
    if (req.method !== 'POST') {
      res.setHeader('Allow', ['POST']);
      return res.status(405).json({ error: 'method_not_allowed' });
    }

    const body = typeof req.body === 'string' ? JSON.parse(req.body || '{}') : (req.body || {});
    const rawQ = (body.q || '').toString().trim();
    const q = rawQ.slice(0, 120); // basic guard
    const limit = Math.max(1, Math.min(100, Number(body.limit || 10)));

    // Require a signed-in user
    const supabase = createServerSupabaseClient({ req, res });
    const { data: { session } } = await supabase.auth.getSession();
    if (!session?.user?.id) return res.status(401).json({ error: 'unauthorized' });
    const userId = session.user.id;

    const vps = process.env.VPS_API_BASE;
    if (!vps) return res.status(500).json({ error: 'missing_env', detail: 'VPS_API_BASE is not set' });

    // 1) Find what this user already received (exclude list)
    const { data: deliveredRows, error: deliveredErr } = await supabase
      .from('deliveries')
      .select('ig_id')
      .eq('user_id', userId)
      .limit(5000);
    if (deliveredErr) console.warn('deliveries select error', deliveredErr);
    const alreadyDelivered = (deliveredRows || []).map(r => String(r.ig_id));

    // 2) CACHE-FIRST: query Supabase leads (username/biography/category)
    //    Exclude already delivered, limit <= requested.
    let cached = [];
    if (q) {
      // Build a simple OR filter for ilike matches
      const ilike = `%${q}%`;
      let cacheQuery = supabase
        .from('leads')
        .select('ig_id, username, biography, followers, category, emails')
        .or(`username.ilike.${ilike},biography.ilike.${ilike},category.ilike.${ilike}`)
        .order('followers', { ascending: false })
        .limit(limit);

      if (alreadyDelivered.length) {
        // exclude delivered
        cacheQuery = cacheQuery.not('ig_id', 'in', `(${alreadyDelivered.map(v => `"${v}"`).join(',')})`);
      }

      const { data: cacheData, error: cacheErr } = await cacheQuery;
      if (cacheErr) console.warn('cache query error', cacheErr);
      cached = (cacheData || []);
    }

    let results = [...cached];

    // 3) If still short, TOP UP from VPS (ask for only what we still need).
    const remaining = Math.max(0, limit - results.length);
    let runId = null;

    if (remaining > 0) {
      // Build an exclude list for the VPS so it doesn't send dupes:
      const excludeIds = [
        ...alreadyDelivered,
        ...results.map(r => String(r.ig_id)),
      ].slice(0, 500); // keep request small

      const vpsResp = await fetch(`${vps}/search`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ user_id: userId, q, limit: remaining, exclude: excludeIds }),
      });

      if (!vpsResp.ok) {
        const text = await vpsResp.text();
        console.warn('VPS error', vpsResp.status, text.slice(0, 300));
      } else {
        const payload = await vpsResp.json();
        const vpsResults = Array.isArray(payload) ? payload : (Array.isArray(payload?.results) ? payload.results : []);
        runId = Array.isArray(payload) ? null : (payload?.run_id ?? null);

        // Normalize shape and append (avoid dupes by ig_id)
        const seen = new Set(results.map(r => String(r.ig_id)));
        for (const l of vpsResults) {
          const ig_id = String(l.ig_id ?? l.username ?? '');
          if (!ig_id || seen.has(ig_id)) continue;
          const primary = Array.isArray(l.emails_primary_json) ? l.emails_primary_json : [];
          const related = Array.isArray(l.emails_related_json) ? l.emails_related_json : [];
          const emails  = Array.isArray(l.emails) ? l.emails : [...primary, ...related];
          results.push({
            ig_id,
            username: l.username ?? ig_id,
            biography: l.biography ?? null,
            followers: l.followers ?? null,
            category: l.category ?? null,
            emails: emails ?? [],
          });
          seen.add(ig_id);
          if (results.length >= limit) break;
        }
      }
    }

    // 4) Insert deliveries (ignore duplicates) and deduct credits based on emails
    const toInsert = results.map(r => ({
      user_id: userId,
      ig_id: String(r.ig_id),
      emails: Array.isArray(r.emails) ? r.emails : [],
      run_id: runId,
    }));

    let emailsDelivered = 0;
    if (toInsert.length) {
      emailsDelivered = toInsert.reduce((sum, r) => sum + (Array.isArray(r.emails) ? r.emails.length : 0), 0);

      const { error: insErr } = await supabase
        .from('deliveries')
        .insert(toInsert, { returning: 'minimal' });
      // unique (user_id, ig_id) may throw 23505 if VPS sent dupes; safe to ignore
      if (insErr && insErr.code !== '23505') {
        console.warn('deliveries insert error', insErr);
      }

      if (emailsDelivered > 0) {
        const { error: rpcErr } = await supabase.rpc('deduct_credits', {
          p_user: userId,
          p_amount: emailsDelivered,
        });
        if (rpcErr) console.warn('deduct_credits error', rpcErr);
      }
    }

    return res.status(200).json({ results, run_id: runId, emailsDelivered, source: { cache: cached.length, vps: results.length - cached.length } });
  } catch (e) {
    console.error(e);
    return res.status(500).json({ error: 'internal_error', message: String(e).slice(0, 500) });
  }
}
