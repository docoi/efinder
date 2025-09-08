// pages/_app.js
import '../styles/globals.css';
import { useEffect, useState } from 'react';
import { createPagesBrowserClient } from '@supabase/auth-helpers-nextjs';
import { SessionContextProvider } from '@supabase/auth-helpers-react';

export default function App({ Component, pageProps }) {
  const [supabase] = useState(() => createPagesBrowserClient());

  // Keep Next.js auth cookie in sync with Supabase
  useEffect(() => {
    const { data: { subscription } } =
      supabase.auth.onAuthStateChange((_event, session) => {
        fetch('/api/auth/session', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          credentials: 'same-origin',
          body: JSON.stringify({ session })
        });
      });

    return () => subscription.unsubscribe();
  }, [supabase]);

  return (
    <SessionContextProvider supabaseClient={supabase} initialSession={pageProps?.initialSession}>
      <Component {...pageProps} />
    </SessionContextProvider>
  );
}
