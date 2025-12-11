import Link from 'next/link';
import { ArrowRight, Sparkles, TrendingUp, Zap } from 'lucide-react';

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white">
      {/* Navigation */}
      <nav className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">
        <div className="text-2xl font-bold text-gray-900">PricingOS</div>
        <div className="flex items-center space-x-4">
          <Link
            href="/pricing"
            className="text-sm font-medium text-gray-700 hover:text-gray-900"
          >
            Pricing
          </Link>
          <Link
            href="/signup"
            className="rounded-lg bg-primary-600 px-4 py-2 text-sm font-medium text-white hover:bg-primary-700"
          >
            Get Started
          </Link>
        </div>
      </nav>

      {/* Hero Section */}
      <div className="mx-auto max-w-7xl px-6 py-20">
        <div className="mx-auto max-w-3xl text-center">
          <h1 className="text-5xl font-bold tracking-tight text-gray-900 sm:text-6xl">
            Stop Underpricing Your Work
          </h1>
          <p className="mt-6 text-xl leading-8 text-gray-600">
            PricingOS generates professional service packages with smart pricing
            suggestions. Perfect for freelancers and small agencies who want to
            charge what they're worth.
          </p>
          <div className="mt-10 flex items-center justify-center gap-x-6">
            <Link
              href="/signup"
              className="rounded-lg bg-primary-600 px-6 py-3 text-base font-semibold text-white shadow-sm hover:bg-primary-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary-600"
            >
              Start Free Trial
              <ArrowRight className="ml-2 inline h-5 w-5" />
            </Link>
            <Link
              href="/pricing"
              className="text-base font-semibold leading-6 text-gray-900"
            >
              View Pricing <span aria-hidden="true">→</span>
            </Link>
          </div>
        </div>

        {/* Features */}
        <div className="mx-auto mt-32 max-w-2xl sm:mt-40 lg:mt-48">
          <div className="grid grid-cols-1 gap-8 sm:grid-cols-3">
            <div className="text-center">
              <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-lg bg-primary-100">
                <Sparkles className="h-6 w-6 text-primary-600" />
              </div>
              <h3 className="mt-4 text-lg font-semibold text-gray-900">
                Smart Pricing
              </h3>
              <p className="mt-2 text-sm text-gray-600">
                Get data-driven pricing suggestions based on your experience,
                target income, and project complexity.
              </p>
            </div>
            <div className="text-center">
              <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-lg bg-primary-100">
                <Zap className="h-6 w-6 text-primary-600" />
              </div>
              <h3 className="mt-4 text-lg font-semibold text-gray-900">
                Fast Proposals
              </h3>
              <p className="mt-2 text-sm text-gray-600">
                Generate ready-to-send proposal text in seconds. No more
                spending hours on pricing every project.
              </p>
            </div>
            <div className="text-center">
              <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-lg bg-primary-100">
                <TrendingUp className="h-6 w-6 text-primary-600" />
              </div>
              <h3 className="mt-4 text-lg font-semibold text-gray-900">
                Increase Revenue
              </h3>
              <p className="mt-2 text-sm text-gray-600">
                Stop leaving 50-200% on the table. Price confidently and grow
                your freelance business.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}



