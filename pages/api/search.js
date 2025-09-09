// pages/api/search.js
import { createServerSupabaseClient } from '@supabase/auth-helpers-nextjs';
import { createClient } from '@supabase/supabase-js';

const VPS_BASE = process.env.VPS_API_BASE;
const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_SERVICE_ROLE = process.env.SUPABASE_SERVICE_ROLE;

// normalize any VPS/cache row into a common shape
function normalizeLead(row = {}) {
  const ig_id = String(row.ig_id ?? row.id ?? '').trim();
  const username = String(row.username ?? row.handle ?? '').trim();

  // emails could be in different fields; unify to a flat array of strings
  let emails = [];
  const cand = [
    row.emails,
    row.emails_json,
    row.emails_primary_json,
    row.emails_related_json,
    row.emails_primary,
    row.emails_related,
  ];
  for (const c of cand) {
    if (Array.isArray(c)) emails.push(...c);
  }
  // de-dup + trim + basic lowercase
  emails = Array.from(new Set((emails || []).map((e) => String(e).trim().toLowerCase()))).filter(Boolean);

  return {
    ig_id,
    username,
    followers: Number(row.followers ?? row.follower_count ?? 0) || 0,
    category: row.category ?? row.category_final ?? null,
    emails,
  };
}

// unique by ig_id, keep first occurrence
function uniqByIgId(list) {
  const seen = new Set();
  const out = [];
  for (const item of list) {
    const id = String(item.ig_id || '').trim();
    if (!id || seen.has(id)) continue;
    seen.add(id);
    out.push(item);
  }
  return out;
}

export default async function handler(req, res) {
  try {
    if (req.method !== 'POST') {
      res.setHeader('Allow', ['POST']);
      return res.status(405).json({ error: 'method_not_allowed' });
    }

    if (!VPS_BASE || !SUPABASE_URL || !SUPABASE_SERVICE_ROLE) {
      return res.status(500).json({ error: 'missing_env', detail: 'VPS_API_BASE or SUPABASE_URL or SUPABASE_SERVICE_ROLE not set' });
    }

    const body = typeof req.body === 'string' ? JSON.parse(req.body || '{}') : (req.body || {});
    const q = String(body.q ?? '').trim();
    const limit = Math.max(1, Math.min(100, Number(body.limit ?? 3)));

    // auth (SSR cookie session)
    const supaSSR = createServerSupabaseClient({ req, res });
    const { data: { session } } = await supaSSR.auth.getSession();
    const userId = session?.user?.id;
    if (!userId) return res.status(401).json({ error: 'unauthorized' });

    // server (service role) client for DB actions
    const supaAdmin = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE, { auth: { persistSession: false } });

    // 1) CACHE: read from public.leads
    // basic keyword match (category, username, biography, tags) – adjust as you like
    // prefer rows with emails, order by followers desc
    const { data: cachedRows, error: cacheErr } = await supaAdmin
      .from('leads')
      .select('ig_id, username, followers, category, biography, emails, emails_primary_json, emails_related_json')
      .or([
        q ? `category.ilike.%${q}%` : '',
        q ? `username.ilike.%${q}%` : '',
        q ? `biography.ilike.%${q}%` : '',
      ].filter(Boolean).join(',') || 'ig_id.not.is.null') // fallback no-op to avoid empty OR
      .limit(limit * 2) // grab extra; we’ll filter to emails later
      .order('followers', { ascending: false });

    if (cacheErr) console.error('cache select error', cacheErr);

    const cacheNormalized = uniqByIgId(
      (cachedRows || []).map(normalizeLead)
        .filter(r => r.emails.length > 0)
    );

    // 2) Deliveries for this user → build exclude to guarantee no dupes
    const { data: deliveredRows, error: delivErr } = await supaAdmin
      .from('deliveries')
      .select('ig_id')
      .eq('user_id', userId)
      .limit(2000);
    if (delivErr) console.error('deliveries select error', delivErr);

    const deliveredIds = new Set((deliveredRows || []).map(r => String(r.ig_id)));
    const cacheIds = new Set(cacheNormalized.map(r => String(r.ig_id)));

    // start building the response list from cache (respect limit later after top-up merge)
    let responseList = [...cacheNormalized];

    // 3) VPS top-up if needed
    const remainingNeeded = Math.max(0, limit - responseList.length);

    let vpsCountUsed = 0;
    if (remainingNeeded > 0) {
      // exclude = already delivered + already picked from cache
      const exclude = Array.from(new Set([...deliveredIds, ...cacheIds]));

      // over-fetch a bit to survive de-dup and email filtering
      const overfetch = Math.min(remainingNeeded * 2, 50);

      let vpsItems = [];
      try {
        const r = await fetch(`${VPS_BASE}/search`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ q, limit: overfetch, user_id: userId, exclude }),
        });
        if (!r.ok) {
          const text = await r.text();
          console.error('VPS /search failed', r.status, text.slice(0, 500));
        } else {
          const payload = await r.json(); // expect {results:[...]} or [...]
          const list = Array.isArray(payload) ? payload : (payload.results || []);
          vpsItems = list.map(normalizeLead).filter(r => r.emails.length > 0);
        }
      } catch (e) {
        console.error('VPS fetch error', e);
      }

      // Merge cache + vps, dedupe by ig_id
      const before = responseList.length;
      responseList = uniqByIgId([...responseList, ...vpsItems]);
      vpsCountUsed = Math.max(0, responseList.length - before);
    }

    // 4) Trim to requested limit
    responseList = responseList.slice(0, limit);

    // 5) Record deliveries + debit credits (atomic RPC)
    // prepare items for RPC: ig_id + emails array
    const rpcItems = responseList.map(r => ({ ig_id: String(r.ig_id), emails: r.emails }));
    let emailsDelivered = 0;

    try {
      const { data: deliveredDetail, error: rpcErr } = await supaAdmin
        .rpc('deliver_and_debit', { _user: userId, _items: rpcItems });

      if (rpcErr) {
        console.error('deliver_and_debit error', rpcErr);
      } else if (Array.isArray(deliveredDetail)) {
        // deliveredDetail rows are (ig_id, emails) from the SQL function
        emailsDelivered = deliveredDetail.reduce((sum, r) => sum + (Number(r.emails) || 0), 0);
      }
    } catch (e) {
      console.error('deliver_and_debit exception', e);
    }

    const source = {
      cache: Math.min(cacheNormalized.length, responseList.length),
      vps: vpsCountUsed,
    };

    return res.status(200).json({
      results: responseList,
      emailsDelivered,
      source,
    });
  } catch (e) {
    console.error('search handler error', e);
    return res.status(500).json({ error: 'internal_error', message: String(e).slice(0, 500) });
  }
}
