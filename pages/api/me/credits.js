import { createServerSupabaseClient } from '@supabase/auth-helpers-nextjs';

export default async function handler(req, res) {
  try {
    const supabase = createServerSupabaseClient({ req, res });
    const { data: { session } } = await supabase.auth.getSession();
    if (!session?.user?.id) return res.status(401).json({ error: 'unauthorized' });

    // Try read
    let { data, error } = await supabase
      .from('user_credits')
      .select('credits_available')
      .eq('user_id', session.user.id)
      .maybeSingle();

    // If missing, create a zero row for this user (RLS allows it)
    if (!data && !error) {
      const ins = await supabase
        .from('user_credits')
        .insert({ user_id: session.user.id, credits_available: 0 })
        .select('credits_available')
        .single();
      data = ins.data;
      error = ins.error;
    }

    if (error) return res.status(500).json({ error: 'db_error' });
    return res.status(200).json({ credits_available: data?.credits_available ?? 0 });
  } catch (e) {
    console.error(e);
    return res.status(500).json({ error: 'server_error' });
  }
}
