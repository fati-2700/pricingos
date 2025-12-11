'use client';

import { useState } from 'react';
import { Check } from 'lucide-react';
import { loadStripe } from '@stripe/stripe-js';

const plans = [
  {
    name: 'Starter Setup',
    setupFee: 199,
    monthlyPrice: null,
    lifetimePrice: null,
    description: 'One-time setup fee',
    features: ['Access to pricing wizard', 'Package generator', 'Unlimited packages'],
  },
  {
    name: 'Pro Setup',
    setupFee: 299,
    monthlyPrice: null,
    lifetimePrice: null,
    description: 'One-time setup fee',
    features: ['Everything in Starter', 'Priority support', 'Advanced analytics'],
  },
  {
    name: 'Monthly Basic',
    setupFee: null,
    monthlyPrice: 39,
    lifetimePrice: null,
    description: 'Monthly subscription',
    features: ['Access to pricing wizard', 'Package generator', 'Unlimited packages'],
  },
  {
    name: 'Monthly Pro',
    setupFee: null,
    monthlyPrice: 59,
    lifetimePrice: null,
    description: 'Monthly subscription',
    features: ['Everything in Basic', 'Priority support', 'Advanced analytics'],
  },
  {
    name: 'Lifetime Basic',
    setupFee: null,
    monthlyPrice: null,
    lifetimePrice: 399,
    description: 'One-time payment',
    features: ['Access to pricing wizard', 'Package generator', 'Unlimited packages', 'Lifetime updates'],
  },
  {
    name: 'Lifetime Pro',
    setupFee: null,
    monthlyPrice: null,
    lifetimePrice: 499,
    description: 'One-time payment',
    features: ['Everything in Lifetime Basic', 'Priority support', 'Advanced analytics', 'Lifetime updates'],
  },
];

interface PricingCardsProps {
  user: any;
}

export default function PricingCards({ user }: PricingCardsProps) {
  const [loading, setLoading] = useState<string | null>(null);

  const handleCheckout = async (plan: typeof plans[0], type: 'setup' | 'monthly' | 'lifetime') => {
    if (!user) {
      window.location.href = '/signup';
      return;
    }

    setLoading(`${plan.name}-${type}`);

    try {
      const response = await fetch('/api/checkout', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          planName: plan.name,
          type,
          setupFee: plan.setupFee,
          monthlyPrice: plan.monthlyPrice,
          lifetimePrice: plan.lifetimePrice,
        }),
      });

      const { url } = await response.json();

      if (url) {
        window.location.href = url;
      } else {
        alert('Error creating checkout session');
        setLoading(null);
      }
    } catch (error) {
      console.error('Error:', error);
      alert('Error creating checkout session');
      setLoading(null);
    }
  };

  return (
    <div className="mx-auto mt-16 grid max-w-6xl grid-cols-1 gap-8 lg:grid-cols-3">
      {/* Setup Plans */}
      <div className="rounded-lg border border-gray-200 bg-white p-8 shadow-sm">
        <h3 className="text-lg font-semibold text-gray-900">Setup Fee Plans</h3>
        <div className="mt-6 space-y-4">
          {plans
            .filter((p) => p.setupFee)
            .map((plan) => (
              <div key={plan.name} className="rounded-lg border border-gray-200 p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="font-medium text-gray-900">{plan.name}</h4>
                    <p className="mt-1 text-sm text-gray-600">{plan.description}</p>
                  </div>
                  <div className="text-right">
                    <div className="text-2xl font-bold text-gray-900">${plan.setupFee}</div>
                  </div>
                </div>
                <ul className="mt-4 space-y-2">
                  {plan.features.map((feature) => (
                    <li key={feature} className="flex items-start text-sm text-gray-600">
                      <Check className="mr-2 h-5 w-5 flex-shrink-0 text-primary-600" />
                      <span>{feature}</span>
                    </li>
                  ))}
                </ul>
                <button
                  onClick={() => handleCheckout(plan, 'setup')}
                  disabled={loading === `${plan.name}-setup`}
                  className="mt-4 w-full rounded-lg bg-primary-600 px-4 py-2 text-sm font-medium text-white hover:bg-primary-700 disabled:opacity-50"
                >
                  {loading === `${plan.name}-setup` ? 'Loading...' : 'Get Started'}
                </button>
              </div>
            ))}
        </div>
      </div>

      {/* Monthly Plans */}
      <div className="rounded-lg border border-gray-200 bg-white p-8 shadow-sm">
        <h3 className="text-lg font-semibold text-gray-900">Monthly Plans</h3>
        <div className="mt-6 space-y-4">
          {plans
            .filter((p) => p.monthlyPrice)
            .map((plan) => (
              <div key={plan.name} className="rounded-lg border border-gray-200 p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="font-medium text-gray-900">{plan.name}</h4>
                    <p className="mt-1 text-sm text-gray-600">{plan.description}</p>
                  </div>
                  <div className="text-right">
                    <div className="text-2xl font-bold text-gray-900">${plan.monthlyPrice}</div>
                    <div className="text-sm text-gray-600">/month</div>
                  </div>
                </div>
                <ul className="mt-4 space-y-2">
                  {plan.features.map((feature) => (
                    <li key={feature} className="flex items-start text-sm text-gray-600">
                      <Check className="mr-2 h-5 w-5 flex-shrink-0 text-primary-600" />
                      <span>{feature}</span>
                    </li>
                  ))}
                </ul>
                <button
                  onClick={() => handleCheckout(plan, 'monthly')}
                  disabled={loading === `${plan.name}-monthly`}
                  className="mt-4 w-full rounded-lg bg-primary-600 px-4 py-2 text-sm font-medium text-white hover:bg-primary-700 disabled:opacity-50"
                >
                  {loading === `${plan.name}-monthly` ? 'Loading...' : 'Subscribe'}
                </button>
              </div>
            ))}
        </div>
      </div>

      {/* Lifetime Plans */}
      <div className="rounded-lg border border-gray-200 bg-white p-8 shadow-sm">
        <h3 className="text-lg font-semibold text-gray-900">Lifetime Plans</h3>
        <div className="mt-6 space-y-4">
          {plans
            .filter((p) => p.lifetimePrice)
            .map((plan) => (
              <div key={plan.name} className="rounded-lg border border-gray-200 p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="font-medium text-gray-900">{plan.name}</h4>
                    <p className="mt-1 text-sm text-gray-600">{plan.description}</p>
                  </div>
                  <div className="text-right">
                    <div className="text-2xl font-bold text-gray-900">${plan.lifetimePrice}</div>
                  </div>
                </div>
                <ul className="mt-4 space-y-2">
                  {plan.features.map((feature) => (
                    <li key={feature} className="flex items-start text-sm text-gray-600">
                      <Check className="mr-2 h-5 w-5 flex-shrink-0 text-primary-600" />
                      <span>{feature}</span>
                    </li>
                  ))}
                </ul>
                <button
                  onClick={() => handleCheckout(plan, 'lifetime')}
                  disabled={loading === `${plan.name}-lifetime`}
                  className="mt-4 w-full rounded-lg bg-primary-600 px-4 py-2 text-sm font-medium text-white hover:bg-primary-700 disabled:opacity-50"
                >
                  {loading === `${plan.name}-lifetime` ? 'Loading...' : 'Buy Lifetime'}
                </button>
              </div>
            ))}
        </div>
      </div>
    </div>
  );
}


