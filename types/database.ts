export interface User {
  id: string;
  email: string;
  name: string | null;
  country: string | null;
  main_service: string | null;
  years_experience: number | null;
  created_at: string;
}

export interface Plan {
  id: string;
  name: string;
  monthly_price_usd: number;
  setup_fee_usd: number;
  lifetime_price_usd: number;
  stripe_product_id: string | null;
  stripe_price_monthly_id: string | null;
  stripe_price_setup_id: string | null;
  stripe_price_lifetime_id: string | null;
}

export interface Subscription {
  id: string;
  user_id: string;
  plan_id: string;
  status: 'active' | 'canceled' | 'past_due' | 'trialing';
  stripe_customer_id: string | null;
  stripe_subscription_id: string | null;
  renewal_date: string | null;
  is_lifetime: boolean;
  created_at: string;
}

export interface Profile {
  id: string;
  user_id: string;
  base_hourly_rate: number;
  target_annual_income: number;
  currency: string;
  typical_weekly_hours: number;
  created_at: string;
}

export interface ProjectType {
  id: string;
  user_id: string;
  name: string;
  description: string | null;
  complexity: number; // 1-5
  typical_duration_days: number;
  created_at: string;
}

export interface GeneratedPackage {
  id: string;
  user_id: string;
  project_type_id: string;
  package_name: 'Starter' | 'Standard' | 'Premium';
  price: number;
  short_description: string;
  includes_text: string;
  created_at: string;
}


