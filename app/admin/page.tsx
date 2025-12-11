import { createServerSupabaseClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import DashboardLayout from '@/components/DashboardLayout';
import AdminDashboard from '@/components/AdminDashboard';

export default async function AdminPage() {
  const supabase = createServerSupabaseClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect('/signup');
  }

  // TODO: Implement proper admin role check
  // For now, we'll allow any logged-in user to access admin
  // In production, add a role field to users table and check it here

  // Get all users
  const { data: users } = await supabase.from('users').select('*').order('created_at', { ascending: false });

  // Get all subscriptions
  const { data: subscriptions } = await supabase
    .from('subscriptions')
    .select('*, plans(name, monthly_price_usd, lifetime_price_usd), users(email)')
    .order('created_at', { ascending: false });

  // Calculate stats
  const activeSubscriptions = subscriptions?.filter((s) => s.status === 'active' && !s.is_lifetime) || [];
  const lifetimeDeals = subscriptions?.filter((s) => s.is_lifetime && s.status === 'active') || [];
  
  const mrr = activeSubscriptions.reduce((sum, s) => {
    return sum + (s.plans?.monthly_price_usd || 0);
  }, 0);

  const lifetimeRevenue = lifetimeDeals.reduce((sum, s) => {
    return sum + (s.plans?.lifetime_price_usd || 0);
  }, 0);

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <h1 className="text-3xl font-bold text-gray-900">Admin Dashboard</h1>
        <AdminDashboard
          users={users || []}
          subscriptions={subscriptions || []}
          stats={{
            totalUsers: users?.length || 0,
            activeUsers: new Set(subscriptions?.map((s) => s.user_id)).size || 0,
            mrr,
            lifetimeRevenue,
          }}
        />
      </div>
    </DashboardLayout>
  );
}

