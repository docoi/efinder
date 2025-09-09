import { createServerSupabaseClient } from '@supabase/auth-helpers-nextjs';

export default async function handler(req, res) {
  try {
    if (req.method !== 'POST') {
      res.setHeader('Allow', ['POST']);
      return res.status(405).json({ error: 'method_not_allowed' });
    }

    const body = typeof req.body === 'string' ? JSON.parse(req.body || '{}') : (req.body || {});
    const { q = '', limit = 3 } = body;

    // Require a signed-in user
    const supabase = createServerSupabaseClient({ req, res });
    const { data: { session } } = await supabase.auth.getSession();
    if (!session?.user?.id) return res.status(401).json({ error: 'unauthorized' });

    const vps = process.env.VPS_API_BASE;
    if (!vps) return res.status(500).json({ error: 'missing_env', detail: 'VPS_API_BASE is not set' });

    // Call your VPS (cache-first)
    const r = await fetch(`${vps}/search`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ user_id: session.user.id, q, limit }),
    });

    if (!r.ok) {
      const text = await r.text();
      return res.status(502).json({ error: 'vps_failed', status: r.status, details: text.slice(0, 500) });
    }

    const payload = await r.json();

    // Support both shapes:
    //  A) { results: [...], run_id: '...' }
    //  B) [ ... ]
    const results = Array.isArray(payload) ? payload : (Array.isArray(payload?.results) ? payload.results : []);
    const runId   = Array.isArray(payload) ? null : (payload?.run_id ?? null);

    // Prepare deliveries rows (match your table columns exactly)
    const rows = results.map((l) => {
      const primary = Array.isArray(l.emails_primary_json) ? l.emails_primary_json : [];
      const related = Array.isArray(l.emails_related_json) ? l.emails_related_json : [];
      const emails  = Array.isArray(l.emails) ? l.emails : [...primary, ...related];

      return {
        user_id: session.user.id,
        ig_id: String(l.ig_id ?? l.username ?? ''),   // prefer ig_id; fallback to username if needed
        emails: emails ?? [],
        run_id: runId,
      };
    }).filter(r => r.ig_id); // ensure we have a key

    // Insert deliveries (ignore duplicates per unique (user_id, ig_id))
    let emailsDelivered = 0;
    if (rows.length) {
      emailsDelivered = rows.reduce((sum, r) => sum + (Array.isArray(r.emails) ? r.emails.length : 0), 0);

      const { error: insErr } = await supabase
        .from('deliveries')
        .insert(rows, { returning: 'minimal' }); // unique constraint will error on dupes; we can ignore 23505

      if (insErr && insErr.code !== '23505') {
        console.warn('deliveries insert error', insErr);
      }
    }

    // Deduct credits atomically (only if there were emails delivered)
    if (emailsDelivered > 0) {
      const { error: rpcErr } = await supabase.rpc('deduct_credits', {
        p_user: session.user.id,
        p_amount: emailsDelivered,
      });
      if (rpcErr) console.warn('deduct_credits RPC error', rpcErr);
    }

    return res.status(200).json({ results, run_id: runId, emailsDelivered });
  } catch (e) {
    console.error(e);
    return res.status(500).json({ error: 'internal_error', message: String(e).slice(0, 500) });
  }
}
