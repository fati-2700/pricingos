import { createServerSupabaseClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import DashboardLayout from '@/components/DashboardLayout';
import BillingInfo from '@/components/BillingInfo';

export default async function BillingPage() {
  const supabase = createServerSupabaseClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect('/signup');
  }

  // Get user's subscription
  const { data: subscription } = await supabase
    .from('subscriptions')
    .select('*, plans(name)')
    .eq('user_id', user.id)
    .eq('status', 'active')
    .single();

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <h1 className="text-3xl font-bold text-gray-900">Billing</h1>
        <BillingInfo subscription={subscription} />
      </div>
    </DashboardLayout>
  );
}

