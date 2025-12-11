'use client';

import { useState, useEffect, useMemo } from 'react';
import { createClient } from '@/lib/supabase/client';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function SignupPage() {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [step, setStep] = useState<'email' | 'onboarding'>('email');
  const [onboardingData, setOnboardingData] = useState({
    name: '',
    country: '',
    main_service: '',
    years_experience: '',
  });
  // Memoize supabase client to prevent recreating on every render
  const supabase = useMemo(() => createClient(), []);
  const router = useRouter();

  const handleEmailSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage('');

    // Get the redirect URL - use environment variable or current origin
    let redirectUrl: string;
    if (typeof window !== 'undefined') {
      // Client-side: use current origin (works in both local and production)
      redirectUrl = window.location.origin;
    } else {
      // Server-side fallback
      redirectUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
    }

    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: {
        shouldCreateUser: true,
        emailRedirectTo: `${redirectUrl}/signup`,
      },
    });

    if (error) {
      setMessage(error.message);
      setLoading(false);
    } else {
      setMessage('Check your email for the magic link!');
      setLoading(false);
    }
  };

  const handleOnboardingSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage('');

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      setMessage('Please sign in first');
      setLoading(false);
      return;
    }

    // Save user profile data
    const { error: userError } = await (supabase as any)
      .from('users')
      .upsert({
        id: user.id,
        email: user.email!,
        name: onboardingData.name,
        country: onboardingData.country,
        main_service: onboardingData.main_service,
        years_experience: parseInt(onboardingData.years_experience) || null,
      });

    if (userError) {
      setMessage(userError.message);
      setLoading(false);
      return;
    }

    // Wait a moment for the database to update, then verify
    await new Promise(resolve => setTimeout(resolve, 500));

    // Verify the data was saved before redirecting
    const { data: verifyData } = await supabase
      .from('users')
      .select('name')
      .eq('id', user.id)
      .maybeSingle();

    if (verifyData && (verifyData as any).name) {
      // Data is saved, use window.location for a hard redirect to avoid loops
      window.location.href = '/dashboard';
    } else {
      setMessage('Error saving data. Please try again.');
      setLoading(false);
    }
  };

  // Check if user is already logged in (only once on mount)
  useEffect(() => {
    let mounted = true;
    let hasChecked = false;
    
    const checkUser = async () => {
      // Prevent multiple checks
      if (hasChecked) return;
      hasChecked = true;
      
      const {
        data: { user },
      } = await supabase.auth.getUser();
      
      if (!mounted) return;
      
      if (user) {
        // Check if user has completed onboarding
        // Use maybeSingle() instead of single() to handle case where user doesn't exist yet
        const { data: userData, error } = await supabase
          .from('users')
          .select('name')
          .eq('id', user.id)
          .maybeSingle();

        if (!mounted) return;

        // If error is a 406 or other client error, log it but don't block
        if (error && error.code !== 'PGRST116') {
          console.error('Error checking user data:', error);
        }

        if (userData && (userData as any).name) {
          // User has completed onboarding, redirect to dashboard using window.location
          // to avoid router loops
          window.location.href = '/dashboard';
        } else {
          // User hasn't completed onboarding, show onboarding form
          setStep('onboarding');
          if (user.email) {
            setEmail(user.email);
          }
        }
      }
    };
    
    // Small delay to prevent race conditions
    const timeoutId = setTimeout(() => {
      checkUser();
    }, 100);
    
    return () => {
      mounted = false;
      clearTimeout(timeoutId);
    };
  }, []); // Empty dependency array - only run once on mount

  if (step === 'email') {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-50 px-4 py-12 sm:px-6 lg:px-8">
        <div className="w-full max-w-md space-y-8">
          <div>
            <h2 className="mt-6 text-center text-3xl font-bold tracking-tight text-gray-900">
              Sign up for PricingOS
            </h2>
            <p className="mt-2 text-center text-sm text-gray-600">
              Or{' '}
              <Link
                href="/"
                className="font-medium text-primary-600 hover:text-primary-500"
              >
                return to home
              </Link>
            </p>
          </div>
          <form className="mt-8 space-y-6" onSubmit={handleEmailSubmit}>
            <div>
              <label htmlFor="email" className="sr-only">
                Email address
              </label>
              <input
                id="email"
                name="email"
                type="email"
                autoComplete="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="relative block w-full rounded-lg border border-gray-300 px-3 py-2 text-gray-900 placeholder-gray-500 focus:z-10 focus:border-primary-500 focus:outline-none focus:ring-primary-500 sm:text-sm"
                placeholder="Email address"
              />
            </div>

            {message && (
              <div
                className={`rounded-lg p-3 text-sm ${
                  message.includes('Check your email')
                    ? 'bg-green-50 text-green-800'
                    : 'bg-red-50 text-red-800'
                }`}
              >
                {message}
              </div>
            )}

            <div>
              <button
                type="submit"
                disabled={loading}
                className="group relative flex w-full justify-center rounded-lg border border-transparent bg-primary-600 px-4 py-2 text-sm font-medium text-white hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 disabled:opacity-50"
              >
                {loading ? 'Sending...' : 'Send Magic Link'}
              </button>
            </div>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50 px-4 py-12 sm:px-6 lg:px-8">
      <div className="w-full max-w-md space-y-8">
        <div>
          <h2 className="mt-6 text-center text-3xl font-bold tracking-tight text-gray-900">
            Complete Your Profile
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600">
            Help us personalize your pricing recommendations
          </p>
        </div>
        <form className="mt-8 space-y-6" onSubmit={handleOnboardingSubmit}>
          <div className="space-y-4">
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-gray-700">
                Name
              </label>
              <input
                id="name"
                name="name"
                type="text"
                required
                value={onboardingData.name}
                onChange={(e) =>
                  setOnboardingData({ ...onboardingData, name: e.target.value })
                }
                className="mt-1 block w-full rounded-lg border border-gray-300 px-3 py-2 text-gray-900 placeholder-gray-500 focus:border-primary-500 focus:outline-none focus:ring-primary-500 sm:text-sm"
                placeholder="John Doe"
              />
            </div>

            <div>
              <label htmlFor="country" className="block text-sm font-medium text-gray-700">
                Country
              </label>
              <input
                id="country"
                name="country"
                type="text"
                required
                value={onboardingData.country}
                onChange={(e) =>
                  setOnboardingData({ ...onboardingData, country: e.target.value })
                }
                className="mt-1 block w-full rounded-lg border border-gray-300 px-3 py-2 text-gray-900 placeholder-gray-500 focus:border-primary-500 focus:outline-none focus:ring-primary-500 sm:text-sm"
                placeholder="United States"
              />
            </div>

            <div>
              <label htmlFor="main_service" className="block text-sm font-medium text-gray-700">
                Main Service
              </label>
              <select
                id="main_service"
                name="main_service"
                required
                value={onboardingData.main_service}
                onChange={(e) =>
                  setOnboardingData({ ...onboardingData, main_service: e.target.value })
                }
                className="mt-1 block w-full rounded-lg border border-gray-300 px-3 py-2 text-gray-900 focus:border-primary-500 focus:outline-none focus:ring-primary-500 sm:text-sm"
              >
                <option value="">Select a service</option>
                <option value="design">Design</option>
                <option value="development">Development</option>
                <option value="copywriting">Copywriting</option>
                <option value="marketing">Marketing</option>
                <option value="other">Other</option>
              </select>
            </div>

            <div>
              <label htmlFor="years_experience" className="block text-sm font-medium text-gray-700">
                Years of Experience
              </label>
              <input
                id="years_experience"
                name="years_experience"
                type="number"
                min="0"
                required
                value={onboardingData.years_experience}
                onChange={(e) =>
                  setOnboardingData({
                    ...onboardingData,
                    years_experience: e.target.value,
                  })
                }
                className="mt-1 block w-full rounded-lg border border-gray-300 px-3 py-2 text-gray-900 placeholder-gray-500 focus:border-primary-500 focus:outline-none focus:ring-primary-500 sm:text-sm"
                placeholder="5"
              />
            </div>
          </div>

          {message && (
            <div className="rounded-lg bg-red-50 p-3 text-sm text-red-800">
              {message}
            </div>
          )}

          <div>
            <button
              type="submit"
              disabled={loading}
              className="group relative flex w-full justify-center rounded-lg border border-transparent bg-primary-600 px-4 py-2 text-sm font-medium text-white hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 disabled:opacity-50"
            >
              {loading ? 'Saving...' : 'Complete Setup'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

