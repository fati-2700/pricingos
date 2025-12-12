import { createServerSupabaseClient } from '@/lib/supabase/server';
import { NextResponse } from 'next/server';
import { redirect } from 'next/navigation';

export async function GET(request: Request) {
  const requestUrl = new URL(request.url);
  const code = requestUrl.searchParams.get('code');
  const next = requestUrl.searchParams.get('next') || '/signup';

  if (code) {
    const supabase = createServerSupabaseClient();
    
    // Exchange the code for a session
    const { error } = await supabase.auth.exchangeCodeForSession(code);

    if (!error) {
      // Get the user to check if they've completed onboarding
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (user) {
        // Check if user has completed onboarding
        const { data: userData } = await supabase
          .from('users')
          .select('name')
          .eq('id', user.id)
          .maybeSingle();

        if (userData && (userData as any).name) {
          // User has completed onboarding, redirect to dashboard
          redirect('/dashboard');
        } else {
          // User hasn't completed onboarding, redirect to signup to show onboarding form
          redirect('/signup');
        }
      }
    }
  }

  // If no code or error, redirect to signup
  redirect('/signup');
}

