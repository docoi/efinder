// pages/_app.js
import { useState } from 'react';
import {
  SessionContextProvider,
  createBrowserSupabaseClient,
} from '@supabase/auth-helpers-nextjs';
import '../index.css'; // keep your global styles

export default function App({ Component, pageProps }) {
  // One browser Supabase client for the whole app
  const [supabaseClient] = useState(() => createBrowserSupabaseClient());

  return (
    <SessionContextProvider
      supabaseClient={supabaseClient}
      initialSession={pageProps.initialSession}
    >
      <Component {...pageProps} />
    </SessionContextProvider>
  );
}
