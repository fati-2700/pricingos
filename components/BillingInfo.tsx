'use client';

import { useState } from 'react';
import { CreditCard, Calendar, CheckCircle, XCircle } from 'lucide-react';

interface BillingInfoProps {
  subscription: any;
}

export default function BillingInfo({ subscription }: BillingInfoProps) {
  const [loading, setLoading] = useState(false);

  const handleManageBilling = async () => {
    setLoading(true);
    // TODO: Implement Stripe Customer Portal
    // For now, this is a placeholder
    alert(
      'Stripe Customer Portal integration coming soon. For now, please contact support to manage your subscription.'
    );
    setLoading(false);
  };

  if (!subscription) {
    return (
      <div className="rounded-lg border border-gray-200 bg-white p-6">
        <p className="text-gray-600">No active subscription found.</p>
        <a
          href="/pricing"
          className="mt-4 inline-block rounded-lg bg-primary-600 px-4 py-2 text-sm font-medium text-white hover:bg-primary-700"
        >
          View Pricing Plans
        </a>
      </div>
    );
  }

  const planName = subscription.plans?.name || 'Unknown Plan';
  const isLifetime = subscription.is_lifetime;
  const renewalDate = subscription.renewal_date
    ? new Date(subscription.renewal_date).toLocaleDateString()
    : 'N/A';

  return (
    <div className="space-y-6">
      <div className="rounded-lg border border-gray-200 bg-white p-6">
        <h2 className="text-xl font-semibold text-gray-900">Current Plan</h2>
        <div className="mt-4 space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <CreditCard className="h-5 w-5 text-gray-400" />
              <span className="text-gray-700">Plan</span>
            </div>
            <span className="font-medium text-gray-900">{planName}</span>
          </div>
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <CheckCircle className="h-5 w-5 text-green-500" />
              <span className="text-gray-700">Status</span>
            </div>
            <span className="font-medium capitalize text-gray-900">
              {subscription.status}
            </span>
          </div>
          {!isLifetime && (
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <Calendar className="h-5 w-5 text-gray-400" />
                <span className="text-gray-700">Renewal Date</span>
              </div>
              <span className="font-medium text-gray-900">{renewalDate}</span>
            </div>
          )}
          {isLifetime && (
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <CheckCircle className="h-5 w-5 text-green-500" />
                <span className="text-gray-700">Type</span>
              </div>
              <span className="font-medium text-gray-900">Lifetime Access</span>
            </div>
          )}
        </div>
      </div>

      <div className="rounded-lg border border-gray-200 bg-white p-6">
        <h2 className="text-xl font-semibold text-gray-900">Manage Billing</h2>
        <p className="mt-2 text-sm text-gray-600">
          Update your payment method or cancel your subscription.
        </p>
        <div className="mt-4 space-x-4">
          <button
            onClick={handleManageBilling}
            disabled={loading}
            className="rounded-lg bg-primary-600 px-4 py-2 text-sm font-medium text-white hover:bg-primary-700 disabled:opacity-50"
          >
            {loading ? 'Loading...' : 'Manage Billing'}
          </button>
          <a
            href="/pricing"
            className="inline-block rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
          >
            Change Plan
          </a>
        </div>
        <p className="mt-4 text-xs text-gray-500">
          Note: Stripe Customer Portal integration is coming soon. For now, please
          contact support for billing changes.
        </p>
      </div>
    </div>
  );
}


