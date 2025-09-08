// lib/supabaseBrowserClient.js
import { createPagesBrowserClient } from '@supabase/auth-helpers-nextjs';

let _client; // singleton
export function getBrowserSupabase() {
  if (!_client && typeof window !== 'undefined') {
    _client = createPagesBrowserClient();
  }
  return _client || null;
}
