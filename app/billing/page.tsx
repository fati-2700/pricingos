import { createServerSupabaseClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import DashboardLayout from '@/components/DashboardLayout';
import BillingInfo from '@/components/BillingInfo';

export default async function BillingPage() {
  const supabase = createServerSupabaseClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  // TEMPORARY: Disable auth check for testing
  // if (!user) {
  //   redirect('/signup');
  // }

  // Get user's subscription (only if user exists)
  let subscription = null;
  if (user) {
    const { data } = await supabase
      .from('subscriptions')
      .select('*, plans(name)')
      .eq('user_id', user.id)
      .eq('status', 'active')
      .maybeSingle();
    subscription = data;
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <h1 className="text-3xl font-bold text-gray-900">Billing</h1>
        <BillingInfo subscription={subscription} />
      </div>
    </DashboardLayout>
  );
}

