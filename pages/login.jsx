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

  // If already signed-in, go straight to dashboard
  useEffect(() => {
    if (session) router.replace('/dashboard');
  }, [session, router]);

  const redirectTo =
    typeof window !== 'undefined' ? `${window.location.origin}/login` : undefined;

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
            redirectTo={redirectTo}
          />
        </div>
      </div>
    </>
  );
}

// render only on the client to avoid SSR hook issues
export default dynamic(() => Promise.resolve(LoginInner), { ssr: false });
