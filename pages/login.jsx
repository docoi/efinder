import dynamic from 'next/dynamic';
import Head from 'next/head';
import { useEffect } from 'react';
import { useRouter } from 'next/router';
import { Auth } from '@supabase/auth-ui-react';
import { ThemeSupa } from '@supabase/auth-ui-shared';
import { useSession, useSupabaseClient } from '@supabase/auth-helpers-react';

function LoginInner() {
  const supabase = useSupabaseClient();
  const session = useSession();
  const router = useRouter();

  // If we already have a session, go to the dashboard
  useEffect(() => {
    if (session) router.replace('/dashboard');
  }, [session, router]);

  return (
    <>
      <Head><title>Login | Insta Email Scout</title></Head>
      <div className="min-h-screen flex items-center justify-center bg-gray-50 p-6">
        <div className="w-full max-w-md bg-white rounded-xl shadow p-6">
          <h1 className="text-2xl font-bold mb-4 text-center">Sign in</h1>
          <Auth
            supabaseClient={supabase}
            appearance={{ theme: ThemeSupa }}
            providers={[]}
            magicLink
            // where Supabase should send the user back after clicking the email link
            redirectTo={typeof window !== 'undefined' ? `${window.location.origin}/login` : undefined}
          />
        </div>
      </div>
    </>
  );
}

// render only on the client (avoids SSR issues with hooks)
export default dynamic(() => Promise.resolve(LoginInner), { ssr: false });
