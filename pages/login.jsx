// pages/login.jsx
import { useEffect } from 'react';
import { useRouter } from 'next/router';
import { useSession, useSupabaseClient } from '@supabase/auth-helpers-react';
import { Auth } from '@supabase/auth-ui-react';
import { ThemeSupa } from '@supabase/auth-ui-shared';

export default function Login() {
  const session = useSession();
  const supabase = useSupabaseClient();
  const router = useRouter();

  useEffect(() => {
    if (session) router.replace('/dashboard');
  }, [session, router]);

  return (
    <div style={{ minHeight: '100vh' }} className="flex items-center justify-center bg-gray-50">
      <div className="w-full max-w-md p-6 bg-white rounded-xl shadow">
        <h1 className="text-2xl font-bold mb-4 text-center">Sign in</h1>
        <Auth supabaseClient={supabase} appearance={{ theme: ThemeSupa }} providers={[]} />
      </div>
    </div>
  );
}
