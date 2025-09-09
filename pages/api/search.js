// pages/api/search.js
import { createServerSupabaseClient } from '@supabase/auth-helpers-nextjs';

export default async function handler(req, res) {
  try {
    if (req.method !== 'POST') {
      res.setHeader('Allow', ['POST']);
      return res.status(405).json({ error: 'method_not_allowed' });
    }

    // ---- parse & validate input
    const body = typeof req.body === 'string' ? JSON.parse(req.body || '{}') : (req.body || {});
    let { q = '', limit = 3 } = body;
    q = String(q || '').trim();
    limit = Math.max(1, Math.min(50, parseInt(limit, 10) || 1));
    if (!q) return res.status(400).json({ error: 'missing_q' });

    // ---- supabase (SSR) + session
    const supabase = createServerSupabaseClient({ req, res });
    const { data: { session } } = await supabase.auth.getSession();
    const userId = session?.user?.id || null;
    if (!userId) return res.status(401).json({ error: 'unauthorized' });

    // ---- env check
    const vps = process.env.VPS_API_BASE;
    if (!vps) return res.status(500).json({ error: 'missing_env', detail: 'VPS_API_BASE is not set' });

    // ---- ask VPS for cached results first
    const r = await fetch(`${vps}/search`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        q,
        limit,
        user_id: userId, // VPS may use this only for logging/auditing; no secrets exposed
      }),
    });

    if (!r.ok) {
      const text = await r.text();
      return res.status(502).json({ error: 'vps_failed', status: r.status, details: text.slice(0, 500) });
    }

    const json = await r.json();
    // Support both shapes:
    // 1) { results:[...], source:{cache:<n>, vps:<m>}, emailsDelivered:<n> }
    // 2) legacy: [...]  (treat as results array)
    const results = Array.isArray(json) ? json : (Array.isArray(json.results) ? json.results : []);
    const source = Array.isArray(json) ? {} : (json.source || {});
    let emailsDelivered = Array.isArray(json) ? undefined : (json.emailsDelivered ?? undefined);

    // ---- normalize rows for deliveries upsert + count emails if not provided
    const deliveryRows = [];
    let computedEmails = 0;

    for (const l of results) {
      const primary = Array.isArray(l.emails_primary_json) ? l.emails_primary_json : [];
      const related = Array.isArray(l.emails_related_json) ? l.emails_related_json : [];
      const emails =
        Array.isArray(l.emails) ? l.emails :
        Array.isArray(l.emails_json) ? l.emails_json : // in case your VPS used a different field
        [...primary, ...related];

      const charge = Array.isArray(emails) ? emails.length : 0;
      computedEmails += charge;

      deliveryRows.push({
        user_id: userId,
        ig_id: String(l.ig_id),
        credits_charged: charge,
        is_trial: false,
      });
    }

    if (typeof emailsDelivered !== 'number') emailsDelivered = computedEmails;

    // ---- upsert deliveries (no dupes per (user_id, ig_id))
    if (deliveryRows.length) {
      const { error: upsertErr } = await supabase
        .from('deliveries')
        .upsert(deliveryRows, { onConflict: 'user_id,ig_id', ignoreDuplicates: true });
      if (upsertErr) console.error('deliveries upsert error', upsertErr);
    }

    // ---- deduct credits if any were actually delivered
    if (emailsDelivered > 0) {
      const { error: rpcErr } = await supabase.rpc('deduct_credits', { uid: userId, n: emailsDelivered });
      if (rpcErr) console.error('deduct_credits error', rpcErr);
    }

    // ---- fire-and-forget "top-up" if cache didn’t meet the request
    const shortfall = Math.max(0, Number(limit) - results.length);
    if (shortfall > 0) {
      try {
        const exclude = results.map((r) => String(r.ig_id));
        // This does not block the user; your VPS should enqueue scraping and upsert into public.leads
        fetch(`${vps}/discover`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ q, limit: shortfall, exclude }),
        }).catch(() => {});
      } catch (e) {
        // never block the main path
        console.warn('top-up discover fire-and-forget failed', e);
      }
    }

    // ---- respond to client
    return res.status(200).json({
      results,
      emailsDelivered,
      source,
    });
  } catch (e) {
    console.error(e);
    return res.status(500).json({ error: 'internal_error', message: String(e).slice(0, 500) });
  }
}
