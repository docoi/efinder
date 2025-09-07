// pages/api/auth/[...supabase].js
import { handleAuth } from '@supabase/auth-helpers-nextjs';

// This endpoint keeps Supabase auth cookies in sync for SSR.
export default handleAuth({
  cookieOptions: {
    name: 'sb',            // cookie prefix
    // lifetime: 60 * 60 * 24 * 7, // optional: 7 days
  },
});
