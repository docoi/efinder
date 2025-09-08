// components/LoginClient.jsx
import { useEffect } from 'react';
import { useSession, useSupabaseClient } from '@supabase/auth-helpers-react';
import { Auth, ThemeSupa } from '@supabase/auth-ui-react';

export default function LoginClient() {
  const session = useSession();
  const supabase = useSupabaseClient();

  useEffect(() => {
    if (session) window.location.assign('/dashboard');
  }, [session]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 p-6">
      <div className="w-full max-w-md">
        <Auth
          supabaseClient={supabase}
          appearance={{ theme: ThemeSupa }}
          providers={['google']}
          redirectTo={`${process.env.NEXT_PUBLIC_SITE_URL || ''}/dashboard`}
        />
      </div>
    </div>
  );
}
