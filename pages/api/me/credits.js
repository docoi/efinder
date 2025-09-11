// pages/api/me/credits.js
import { createServerSupabaseClient } from '@supabase/auth-helpers-nextjs';

export default async function handler(req, res) {
  // Never cache the balance in the browser or any proxy
  res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate');
  res.setHeader('Pragma', 'no-cache');
  res.setHeader('Expires', '0');

  try {
    const supabase = createServerSupabaseClient({ req, res });
    const {
      data: { session },
      error: sessionError,
    } = await supabase.auth.getSession();

    if (sessionError) {
      console.error('[credits] sessionError:', sessionError);
      return res.status(401).json({ error: 'unauthorized' });
    }
    if (!session?.user?.id) {
      return res.status(401).json({ error: 'unauthorized' });
    }

    const userId = session.user.id;

    // Try to read the current credits
    let { data, error } = await supabase
      .from('user_credits')
      .select('credits_available')
      .eq('user_id', userId)
      .maybeSingle();

    // If missing, create a 0 row (RLS must allow insert by user_id = auth.uid())
    if (!data && !error) {
      const ins = await supabase
        .from('user_credits')
        .insert({ user_id: userId, credits_available: 0 })
        .select('credits_available')
        .single();
      data = ins.data;
      error = ins.error;
    }

    if (error) {
      console.error('[credits] db error:', error);
      return res.status(500).json({ error: 'db_error' });
    }

    return res.status(200).json({ credits_available: data?.credits_available ?? 0 });
  } catch (e) {
    console.error('[credits] server error:', e);
    return res.status(500).json({ error: 'server_error' });
  }
}
