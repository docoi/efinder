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

    // Call your VPS (cache-first, no BD spend on this path)
    const r = await fetch(`${vps}/search`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ user_id: session.user.id, q, limit }),
    });

    if (!r.ok) {
      const text = await r.text();
      return res.status(502).json({ error: 'vps_failed', status: r.status, details: text.slice(0, 500) });
    }

    const leads = await r.json();

    // Upsert deliveries for billing + no-dup guarantee
    const rows = (Array.isArray(leads) ? leads : []).map((l) => {
      const primary = Array.isArray(l.emails_primary_json) ? l.emails_primary_json : [];
      const related = Array.isArray(l.emails_related_json) ? l.emails_related_json : [];
      const emails = Array.isArray(l.emails) ? l.emails : [...primary, ...related];

      return {
        user_id: session.user.id,
        ig_id: String(l.ig_id),
        credits_charged: (emails || []).length,
        is_trial: false,
      };
    });

    if (rows.length) {
      const { error: upsertErr } = await supabase
        .from('deliveries')
        .upsert(rows, { onConflict: 'user_id,ig_id', ignoreDuplicates: true });
      if (upsertErr) console.error('deliveries upsert error', upsertErr);
    }

    return res.status(200).json({ leads });
  } catch (e) {
    console.error(e);
    return res.status(500).json({ error: 'internal_error', message: String(e).slice(0, 500) });
  }
}
