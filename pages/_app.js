// pages/_app.js
import { useState } from 'react';
import { createPagesBrowserClient } from '@supabase/auth-helpers-nextjs';
import { SessionContextProvider } from '@supabase/auth-helpers-react';

// import your global CSS (must be imported here)
import '../index.css'; // or 'styles/globals.css' if that's where your @tailwind file lives

export default function App({ Component, pageProps }) {
  const [supabase] = useState(() => createPagesBrowserClient());
  return (
    <SessionContextProvider supabaseClient={supabase} initialSession={pageProps.initialSession}>
      <Component {...pageProps} />
    </SessionContextProvider>
  );
}
