// Fixes 405s from Supabase auth refresh calls
import { handleSession } from '@supabase/auth-helpers-nextjs';
export default handleSession;
