import React from 'react';
import { useSupabaseClient, useUser } from '@supabase/auth-helpers-nextjs';
import { createServerSupabaseClient } from '@supabase/auth-helpers-nextjs';
import UserDashboard from '../components/UserDashboard';

export default function DashboardPage() {
  const supabase = useSupabaseClient();
  const user = useUser();

  const handleLogout = async () => {
    try {
      await supabase.auth.signOut();
    } catch (e) {
      console.error('Sign out error', e);
    } finally {
      window.location.href = '/login';
    }
  };

  return (
    <div>
      <div className="flex justify-end p-4">
        <button
          onClick={handleLogout}
          className="px-3 py-1 border rounded hover:bg-gray-50"
          aria-label="Logout"
        >
          Logout
        </button>
      </div>

      {/* If your dashboard needs the user object, it’s here */}
      <UserDashboard user={user ?? null} />
    </div>
  );
}

/** 🔒 Server-side auth guard: redirect to /login if no session */
export async function getServerSideProps(ctx) {
  const supabase = createServerSupabaseClient(ctx);
  const { data: { session } } = await supabase.auth.getSession();

  if (!session) {
    return { redirect: { destination: '/login', permanent: false } };
  }
  return { props: { initialSession: session, user: session.user } };
}
