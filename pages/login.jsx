import dynamic from 'next/dynamic';
import { Auth } from '@supabase/auth-ui-react';
import { ThemeSupa } from '@supabase/auth-ui-shared';
import { useSupabaseClient, useSession } from '@supabase/auth-helpers-react';
import Head from 'next/head';

function LoginInner() {
  const supabase = useSupabaseClient();
  const session = useSession();

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
          redirectTo="/dashboard"
          onlyThirdPartyProviders={false}
        />
        {session ? (
          <p className="mt-4 text-center text-sm">You are signed in.</p>
        ) : null}
      </div>
    </div>
    </>
  );
}

// 👉 disable SSR so this page never renders on the server
export default dynamic(() => Promise.resolve(LoginInner), { ssr: false });
