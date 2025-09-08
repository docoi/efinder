// pages/login.jsx
import dynamic from 'next/dynamic';
import Head from 'next/head';
import { useEffect, useState } from 'react';
import { getBrowserSupabase } from '../lib/supabaseBrowserClient';

function LoginInner() {
  const supabase = getBrowserSupabase();
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState('');
  const [err, setErr] = useState('');

  // If already signed in, go straight to dashboard
  useEffect(() => {
    if (!supabase) return;
    const { data: sub } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session) window.location.href = '/dashboard';
    });
    supabase.auth.getSession().then(({ data }) => {
      if (data.session) window.location.href = '/dashboard';
    });
    return () => sub?.subscription?.unsubscribe();
  }, [supabase]);

  async function handleEmailLogin(e) {
    e.preventDefault();
    if (!supabase) return;
    setLoading(true);
    setErr('');
    setMsg('');
    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: {
        emailRedirectTo: `${window.location.origin}/dashboard`,
      },
    });
    if (error) setErr(error.message);
    else setMsg('Check your inbox for the login link.');
    setLoading(false);
  }

  return (
    <>
      <Head>
        <title>Login | Insta Email Scout</title>
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <div className="min-h-screen flex items-center justify-center bg-gray-50 p-6">
        <div className="w-full max-w-md bg-white rounded-xl shadow p-6">
          <h1 className="text-2xl font-bold mb-1 text-center">Sign in</h1>
          <p className="text-center text-gray-500 mb-6">
            We’ll email you a magic link to log in.
          </p>

          <form onSubmit={handleEmailLogin} className="space-y-4">
            <label className="block text-sm font-medium text-gray-700">
              Email address
            </label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full rounded border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="you@example.com"
            />

            <button
              type="submit"
              disabled={loading}
              className="w-full rounded bg-blue-600 text-white py-2 font-medium hover:bg-blue-700 disabled:opacity-50"
            >
              {loading ? 'Sending…' : 'Send magic link'}
            </button>
          </form>

          {msg && (
            <div className="mt-4 rounded border border-green-300 bg-green-50 p-3 text-green-800">
              {msg}
            </div>
          )}
          {err && (
            <div className="mt-4 rounded border border-red-300 bg-red-50 p-3 text-red-700">
              {err}
            </div>
          )}
        </div>
      </div>
    </>
  );
}

export default dynamic(() => Promise.resolve(LoginInner), { ssr: false });
