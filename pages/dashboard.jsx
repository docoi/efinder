// pages/dashboard.jsx
import React from 'react';
import { useSupabaseClient, useUser } from '@supabase/auth-helpers-nextjs';
import { createServerSupabaseClient } from '@supabase/auth-helpers-nextjs';
import UserDashboard from '../components/UserDashboard';

export default function DashboardPage() {
  const supabase = useSupabaseClient();
  const user = useUser();

  return (
    <div>
      <div className="flex justify-end p-4">
        <button
          className="px-3 py-1 border rounded"
          onClick={async () => {
            await supabase.auth.signOut();
            window.location.href = '/login';
          }}
        >
          Logout
        </button>
      </div>

      {/* Pass user down if your component wants it */}
      <UserDashboard user={user ?? null} />
    </div>
  );
}

// 🔒 Redirect to /login if not authenticated
export async function getServerSideProps(ctx) {
  const supabase = createServerSupabaseClient(ctx);
  const { data: { session } } = await supabase.auth.getSession();

  if (!session) {
    return { redirect: { destination: '/login', permanent: false } };
  }

  // Provide initialSession so auth-helpers hydrates client state
  return { props: { initialSession: session, user: session.user } };
}
