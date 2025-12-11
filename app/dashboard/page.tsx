import { createServerSupabaseClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import DashboardLayout from '@/components/DashboardLayout';
import PackagesList from '@/components/PackagesList';
import Link from 'next/link';

export default async function DashboardPage() {
  const supabase = createServerSupabaseClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect('/signup');
  }

  // Check if user has completed onboarding
  // Use maybeSingle() to handle case where user doesn't exist yet
  const { data: userData, error: userDataError } = await supabase
    .from('users')
    .select('name')
    .eq('id', user.id)
    .maybeSingle();

  // If user data doesn't exist or name is missing, redirect to signup
  // PGRST116 is "not found" error which is expected for new users
  if (userDataError && userDataError.code !== 'PGRST116') {
    console.error('Error fetching user data:', userDataError);
  }
  
  if (!userData || !(userData as any).name) {
    redirect('/signup');
  }

  // Check if profile exists (use maybeSingle to avoid errors if it doesn't exist)
  const { data: profile } = await supabase
    .from('profiles')
    .select('*')
    .eq('user_id', user.id)
    .maybeSingle();

  // Get packages with project types
  const { data: packages } = await supabase
    .from('generated_packages')
    .select(`
      *,
      project_types (
        name
      )
    `)
    .eq('user_id', user.id)
    .order('created_at', { ascending: false });

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
        </div>

        {!profile && (
          <div className="rounded-lg border border-primary-200 bg-primary-50 p-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-semibold text-primary-900">
                  Complete Your Profile
                </h3>
                <p className="mt-1 text-sm text-primary-700">
                  Set up your pricing profile to start generating packages.
                </p>
              </div>
              <Link
                href="/wizard"
                className="rounded-lg bg-primary-600 px-4 py-2 text-sm font-medium text-white hover:bg-primary-700"
              >
                Go to Wizard
              </Link>
            </div>
          </div>
        )}

        <div>
          <h2 className="text-xl font-semibold text-gray-900">Your Packages</h2>
          <PackagesList packages={packages || []} />
        </div>
      </div>
    </DashboardLayout>
  );
}

