// components/EmailAuthForm.jsx
import { useState, useMemo } from 'react';
import { useRouter } from 'next/router';
import { useSupabaseClient } from '@supabase/auth-helpers-react';

/** Small helper to make Supabase errors human-friendly */
function niceError(msg = '') {
  const m = msg.toLowerCase();
  if (m.includes('invalid login credentials')) return 'Email or password is incorrect.';
  if (m.includes('email not confirmed')) return 'Please confirm your email, then try again.';
  if (m.includes('user already registered')) return 'That email is already registered. Use “Forgot your password?”';
  if (m.includes('password should be at least')) return 'Password must be at least 8 characters.';
  if (m.includes('rate limit')) return 'Too many attempts — please wait a moment and try again.';
  return msg || 'Something went wrong. Please try again.';
}

export default function EmailAuthForm() {
  const supabase = useSupabaseClient();
  const router = useRouter();

  const [mode, setMode] = useState('sign_in'); // 'sign_in' | 'sign_up' | 'magic' | 'forgot'
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [busy, setBusy] = useState(false);
  const [note, setNote] = useState({ type: '', text: '' });

  const redirectTo = useMemo(
    () => `${typeof window !== 'undefined' ? window.location.origin : ''}/login`,
    []
  );

  const handle = async (fn) => {
    setBusy(true);
    setNote({ type: '', text: '' });
    try {
      await fn();
    } finally {
      setBusy(false);
    }
  };

  const onSignIn = () =>
    handle(async () => {
      const { error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) return setNote({ type: 'error', text: niceError(error.message) });
      setNote({ type: 'success', text: 'Signed in — taking you to your dashboard…' });
      router.push('/dashboard');
    });

  const onSignUp = () =>
    handle(async () => {
      if (password.length < 8) {
        return setNote({ type: 'error', text: 'Password must be at least 8 characters.' });
      }
      if (confirm !== password) {
        return setNote({ type: 'error', text: 'Passwords do not match.' });
      }
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: { emailRedirectTo: redirectTo },
      });
      if (error) return setNote({ type: 'error', text: niceError(error.message) });
      if (data?.session) {
        // (rare) email confirmation not required
        router.push('/dashboard');
      } else {
        setNote({
          type: 'success',
          text: 'Check your inbox and click the confirmation link to finish creating your account.',
        });
      }
    });

  const onMagic = () =>
    handle(async () => {
      const { error } = await supabase.auth.signInWithOtp({
        email,
        options: { emailRedirectTo: redirectTo },
      });
      if (error) return setNote({ type: 'error', text: niceError(error.message) });
      setNote({ type: 'success', text: 'Magic link sent! Check your inbox to sign in.' });
    });

  const onForgot = () =>
    handle(async () => {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo,
      });
      if (error) return setNote({ type: 'error', text: niceError(error.message) });
      setNote({
        type: 'success',
        text: 'Password reset email sent. Open it on this device to continue.',
      });
    });

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 p-6">
      <div className="w-full max-w-md bg-white rounded-xl shadow p-6">
        <h1 className="text-2xl font-bold mb-2 text-center">
          {mode === 'sign_in' && 'Sign in'}
          {mode === 'sign_up' && 'Create your account'}
          {mode === 'magic' && 'Send a magic link'}
          {mode === 'forgot' && 'Reset your password'}
        </h1>

        {/* Tabs */}
        <div className="grid grid-cols-4 gap-2 text-sm mb-6">
          <button onClick={() => setMode('sign_in')} className={`py-2 rounded border ${mode==='sign_in'?'bg-gray-100 font-medium':''}`}>Sign in</button>
          <button onClick={() => setMode('sign_up')} className={`py-2 rounded border ${mode==='sign_up'?'bg-gray-100 font-medium':''}`}>Sign up</button>
          <button onClick={() => setMode('magic')} className={`py-2 rounded border ${mode==='magic'?'bg-gray-100 font-medium':''}`}>Magic link</button>
          <button onClick={() => setMode('forgot')} className={`py-2 rounded border ${mode==='forgot'?'bg-gray-100 font-medium':''}`}>Forgot?</button>
        </div>

        {/* Messages */}
        {note.text ? (
          <div
            className={`mb-4 rounded border px-3 py-2 text-sm ${
              note.type === 'error'
                ? 'bg-red-50 border-red-200 text-red-700'
                : 'bg-green-50 border-green-200 text-green-700'
            }`}
          >
            {note.text}
          </div>
        ) : null}

        {/* Form */}
        <div className="space-y-4">
          <div>
            <label className="block mb-1 text-sm text-gray-700">Email address</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-3 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-purple-500"
              placeholder="you@example.com"
              autoComplete="email"
              required
            />
          </div>

          {(mode === 'sign_in' || mode === 'sign_up') && (
            <div>
              <label className="block mb-1 text-sm text-gray-700">
                {mode === 'sign_in' ? 'Password' : 'Create a password'}
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-3 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-purple-500"
                placeholder={mode === 'sign_in' ? 'Your password' : 'At least 8 characters'}
                autoComplete={mode === 'sign_in' ? 'current-password' : 'new-password'}
                required
              />
            </div>
          )}

          {mode === 'sign_up' && (
            <div>
              <label className="block mb-1 text-sm text-gray-700">Confirm password</label>
              <input
                type="password"
                value={confirm}
                onChange={(e) => setConfirm(e.target.value)}
                className="w-full px-3 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-purple-500"
                placeholder="Repeat your password"
                autoComplete="new-password"
                required
              />
            </div>
          )}

          <button
            disabled={busy}
            onClick={
              mode === 'sign_in' ? onSignIn : mode === 'sign_up' ? onSignUp : mode === 'magic' ? onMagic : onForgot
            }
            className="w-full py-2 rounded bg-purple-600 text-white font-medium hover:bg-purple-700 disabled:opacity-60"
          >
            {busy
              ? 'Please wait…'
              : mode === 'sign_in'
              ? 'Sign in'
              : mode === 'sign_up'
              ? 'Create account'
              : mode === 'magic'
              ? 'Send magic link'
              : 'Send reset link'}
          </button>
        </div>

        {/* Helper links */}
        <div className="mt-6 text-center text-sm text-gray-600 space-x-4">
          {mode !== 'sign_in' && (
            <button onClick={() => setMode('sign_in')} className="underline hover:text-gray-800">
              Already have an account? Sign in
            </button>
          )}
          {mode !== 'sign_up' && (
            <button onClick={() => setMode('sign_up')} className="underline hover:text-gray-800">
              New here? Create an account
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
