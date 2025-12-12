import { createServerSupabaseClient } from '@/lib/supabase/server';
import { NextResponse } from 'next/server';
import { redirect } from 'next/navigation';

export async function GET(request: Request) {
  const requestUrl = new URL(request.url);
  const code = requestUrl.searchParams.get('code');
  const next = requestUrl.searchParams.get('next') || '/signup';

  if (code) {
    const supabase = createServerSupabaseClient();
    
    try {
      // Exchange the code for a session
      const { error: exchangeError } = await supabase.auth.exchangeCodeForSession(code);

      if (exchangeError) {
        console.error('Error exchanging code for session:', exchangeError);
        // Redirect to signup with error parameter
        redirect('/signup?error=auth_failed');
      }

      // Get the user to check if they've completed onboarding
      const {
        data: { user },
        error: userError,
      } = await supabase.auth.getUser();

      if (userError || !user) {
        console.error('Error getting user after exchange:', userError);
        redirect('/signup?error=user_not_found');
      }

      // Check if user has completed onboarding
      const { data: userData, error: dbError } = await supabase
        .from('users')
        .select('name')
        .eq('id', user.id)
        .maybeSingle();

      if (dbError && dbError.code !== 'PGRST116') {
        console.error('Error checking user data:', dbError);
      }

      if (userData && (userData as any).name) {
        // User has completed onboarding, redirect to dashboard
        redirect('/dashboard');
      } else {
        // User hasn't completed onboarding, redirect to signup with authenticated flag
        // This tells the signup page to show onboarding form immediately
        redirect('/signup?authenticated=true');
      }
    } catch (error) {
      console.error('Unexpected error in auth callback:', error);
      redirect('/signup?error=unexpected');
    }
  }

  // If no code, redirect to signup
  redirect('/signup');
}

