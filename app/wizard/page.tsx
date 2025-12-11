'use client';

import { useState, useEffect } from 'react';
import { createClient } from '@/lib/supabase/client';
import { useRouter } from 'next/navigation';
import DashboardLayout from '@/components/DashboardLayout';
import { generatePackages } from '@/lib/package-generator';
import type { Profile, ProjectType } from '@/types/database';

export default function WizardPage() {
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const supabase = createClient();
  const router = useRouter();

  // Step 1: Profile data
  const [profileData, setProfileData] = useState({
    base_hourly_rate: '',
    target_annual_income: '',
    typical_weekly_hours: '',
    currency: 'EUR',
  });

  // Step 2: Project types
  const [projectTypes, setProjectTypes] = useState<
    Array<{
      name: string;
      description: string;
      complexity: number;
      typical_duration_days: number;
    }>
  >([{ name: '', description: '', complexity: 3, typical_duration_days: 30 }]);

  // Step 3: Client and positioning
  const [clientData, setClientData] = useState({
    clientType: 'smb' as 'startup' | 'smb' | 'enterprise',
    positioning: 'mid-market' as 'budget' | 'mid-market' | 'premium',
  });

  useEffect(() => {
    const checkAuth = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) {
        router.push('/signup');
      }
    };
    checkAuth();
  }, [supabase, router]);

  const addProjectType = () => {
    if (projectTypes.length < 3) {
      setProjectTypes([
        ...projectTypes,
        { name: '', description: '', complexity: 3, typical_duration_days: 30 },
      ]);
    }
  };

  const removeProjectType = (index: number) => {
    setProjectTypes(projectTypes.filter((_, i) => i !== index));
  };

  const updateProjectType = (
    index: number,
    field: string,
    value: string | number
  ) => {
    const updated = [...projectTypes];
    updated[index] = { ...updated[index], [field]: value };
    setProjectTypes(updated);
  };

  const handleSubmit = async () => {
    setLoading(true);
    setError('');

    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        setError('Please sign in first');
        setLoading(false);
        return;
      }

      // Save profile
      const { data: profile, error: profileError } = await (supabase as any)
        .from('profiles')
        .upsert({
          user_id: user.id,
          base_hourly_rate: parseFloat(profileData.base_hourly_rate),
          target_annual_income: parseFloat(profileData.target_annual_income),
          typical_weekly_hours: parseFloat(profileData.typical_weekly_hours),
          currency: profileData.currency,
        })
        .select()
        .single();

      if (profileError) throw profileError;

      // Save project types and generate packages
      for (const pt of projectTypes) {
        if (!pt.name.trim()) continue;

        const { data: projectType, error: ptError } = await (supabase as any)
          .from('project_types')
          .insert({
            user_id: user.id,
            name: pt.name,
            description: pt.description || null,
            complexity: pt.complexity,
            typical_duration_days: pt.typical_duration_days,
          })
          .select()
          .single();

        if (ptError) throw ptError;

        // Generate packages
        const packages = generatePackages({
          profile: profile as Profile,
          projectType: projectType as ProjectType,
          clientType: clientData.clientType,
          positioning: clientData.positioning,
        });

        // Save packages
        for (const pkg of packages) {
          const { error: pkgError } = await (supabase as any)
            .from('generated_packages')
            .insert({
              user_id: user.id,
              project_type_id: (projectType as any).id,
              package_name: pkg.package_name,
              price: pkg.price,
              short_description: pkg.short_description,
              includes_text: pkg.includes_text,
            });

          if (pkgError) throw pkgError;
        }
      }

      router.push('/dashboard');
    } catch (err: any) {
      setError(err.message || 'An error occurred');
      setLoading(false);
    }
  };

  return (
    <DashboardLayout>
      <div className="mx-auto max-w-3xl">
        <h1 className="text-3xl font-bold text-gray-900">Pricing Wizard</h1>
        <p className="mt-2 text-gray-600">
          Let's set up your pricing profile step by step.
        </p>

        {error && (
          <div className="mt-4 rounded-lg bg-red-50 p-4 text-sm text-red-800">
            {error}
          </div>
        )}

        {/* Step 1: Profile */}
        {step === 1 && (
          <div className="mt-8 space-y-6 rounded-lg border border-gray-200 bg-white p-6">
            <h2 className="text-xl font-semibold text-gray-900">Step 1: Your Profile</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Base Hourly Rate (€)
                </label>
                <input
                  type="number"
                  value={profileData.base_hourly_rate}
                  onChange={(e) =>
                    setProfileData({
                      ...profileData,
                      base_hourly_rate: e.target.value,
                    })
                  }
                  className="mt-1 block w-full rounded-lg border border-gray-300 px-3 py-2 text-gray-900 focus:border-primary-500 focus:outline-none focus:ring-primary-500 sm:text-sm"
                  placeholder="50"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Target Annual Income (€)
                </label>
                <input
                  type="number"
                  value={profileData.target_annual_income}
                  onChange={(e) =>
                    setProfileData({
                      ...profileData,
                      target_annual_income: e.target.value,
                    })
                  }
                  className="mt-1 block w-full rounded-lg border border-gray-300 px-3 py-2 text-gray-900 focus:border-primary-500 focus:outline-none focus:ring-primary-500 sm:text-sm"
                  placeholder="80000"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Typical Weekly Hours
                </label>
                <input
                  type="number"
                  value={profileData.typical_weekly_hours}
                  onChange={(e) =>
                    setProfileData({
                      ...profileData,
                      typical_weekly_hours: e.target.value,
                    })
                  }
                  className="mt-1 block w-full rounded-lg border border-gray-300 px-3 py-2 text-gray-900 focus:border-primary-500 focus:outline-none focus:ring-primary-500 sm:text-sm"
                  placeholder="40"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Currency
                </label>
                <select
                  value={profileData.currency}
                  onChange={(e) =>
                    setProfileData({ ...profileData, currency: e.target.value })
                  }
                  className="mt-1 block w-full rounded-lg border border-gray-300 px-3 py-2 text-gray-900 focus:border-primary-500 focus:outline-none focus:ring-primary-500 sm:text-sm"
                >
                  <option value="EUR">EUR (€)</option>
                  <option value="USD">USD ($)</option>
                  <option value="GBP">GBP (£)</option>
                </select>
              </div>
            </div>
            <button
              onClick={() => setStep(2)}
              className="mt-4 rounded-lg bg-primary-600 px-4 py-2 text-sm font-medium text-white hover:bg-primary-700"
            >
              Next: Project Types
            </button>
          </div>
        )}

        {/* Step 2: Project Types */}
        {step === 2 && (
          <div className="mt-8 space-y-6 rounded-lg border border-gray-200 bg-white p-6">
            <h2 className="text-xl font-semibold text-gray-900">Step 2: Project Types</h2>
            <p className="text-sm text-gray-600">
              Add 1-3 project types you typically work on.
            </p>
            {projectTypes.map((pt, index) => (
              <div key={index} className="space-y-4 rounded-lg border border-gray-200 p-4">
                <div className="flex items-center justify-between">
                  <h3 className="font-medium text-gray-900">Project Type {index + 1}</h3>
                  {projectTypes.length > 1 && (
                    <button
                      onClick={() => removeProjectType(index)}
                      className="text-sm text-red-600 hover:text-red-700"
                    >
                      Remove
                    </button>
                  )}
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Name</label>
                  <input
                    type="text"
                    value={pt.name}
                    onChange={(e) => updateProjectType(index, 'name', e.target.value)}
                    className="mt-1 block w-full rounded-lg border border-gray-300 px-3 py-2 text-gray-900 focus:border-primary-500 focus:outline-none focus:ring-primary-500 sm:text-sm"
                    placeholder="Website Design"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Description
                  </label>
                  <textarea
                    value={pt.description}
                    onChange={(e) => updateProjectType(index, 'description', e.target.value)}
                    rows={2}
                    className="mt-1 block w-full rounded-lg border border-gray-300 px-3 py-2 text-gray-900 focus:border-primary-500 focus:outline-none focus:ring-primary-500 sm:text-sm"
                    placeholder="A complete website redesign project"
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">
                      Complexity (1-5)
                    </label>
                    <input
                      type="number"
                      min="1"
                      max="5"
                      value={pt.complexity}
                      onChange={(e) =>
                        updateProjectType(index, 'complexity', parseInt(e.target.value))
                      }
                      className="mt-1 block w-full rounded-lg border border-gray-300 px-3 py-2 text-gray-900 focus:border-primary-500 focus:outline-none focus:ring-primary-500 sm:text-sm"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">
                      Duration (days)
                    </label>
                    <input
                      type="number"
                      value={pt.typical_duration_days}
                      onChange={(e) =>
                        updateProjectType(index, 'typical_duration_days', parseInt(e.target.value))
                      }
                      className="mt-1 block w-full rounded-lg border border-gray-300 px-3 py-2 text-gray-900 focus:border-primary-500 focus:outline-none focus:ring-primary-500 sm:text-sm"
                    />
                  </div>
                </div>
              </div>
            ))}
            {projectTypes.length < 3 && (
              <button
                onClick={addProjectType}
                className="rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
              >
                + Add Another Project Type
              </button>
            )}
            <div className="flex space-x-4">
              <button
                onClick={() => setStep(1)}
                className="rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
              >
                Back
              </button>
              <button
                onClick={() => setStep(3)}
                className="rounded-lg bg-primary-600 px-4 py-2 text-sm font-medium text-white hover:bg-primary-700"
              >
                Next: Client & Positioning
              </button>
            </div>
          </div>
        )}

        {/* Step 3: Client & Positioning */}
        {step === 3 && (
          <div className="mt-8 space-y-6 rounded-lg border border-gray-200 bg-white p-6">
            <h2 className="text-xl font-semibold text-gray-900">Step 3: Client & Positioning</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Typical Client Type
                </label>
                <select
                  value={clientData.clientType}
                  onChange={(e) =>
                    setClientData({
                      ...clientData,
                      clientType: e.target.value as any,
                    })
                  }
                  className="mt-1 block w-full rounded-lg border border-gray-300 px-3 py-2 text-gray-900 focus:border-primary-500 focus:outline-none focus:ring-primary-500 sm:text-sm"
                >
                  <option value="startup">Startups</option>
                  <option value="smb">Small/Medium Businesses</option>
                  <option value="enterprise">Enterprise</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Market Positioning
                </label>
                <select
                  value={clientData.positioning}
                  onChange={(e) =>
                    setClientData({
                      ...clientData,
                      positioning: e.target.value as any,
                    })
                  }
                  className="mt-1 block w-full rounded-lg border border-gray-300 px-3 py-2 text-gray-900 focus:border-primary-500 focus:outline-none focus:ring-primary-500 sm:text-sm"
                >
                  <option value="budget">Budget</option>
                  <option value="mid-market">Mid-Market</option>
                  <option value="premium">Premium</option>
                </select>
              </div>
            </div>
            <div className="flex space-x-4">
              <button
                onClick={() => setStep(2)}
                className="rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
              >
                Back
              </button>
              <button
                onClick={handleSubmit}
                disabled={loading}
                className="rounded-lg bg-primary-600 px-4 py-2 text-sm font-medium text-white hover:bg-primary-700 disabled:opacity-50"
              >
                {loading ? 'Generating Packages...' : 'Generate Packages'}
              </button>
            </div>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}


