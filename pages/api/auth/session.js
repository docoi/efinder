// pages/api/auth/session.js
export default async function handler(req, res) {
    // Some versions of the helper expect GET, but the client may POST.
    if (req.method === 'POST') {
      try {
        // Coerce POST -> GET to satisfy the helper
        req.method = 'GET';
      } catch (_) {
        // ignore if read-only; the helper will still handle GET/POST in newer versions
      }
    }
  
    const { handleSession } = await import('@supabase/auth-helpers-nextjs');
    return handleSession(req, res);
  }
  