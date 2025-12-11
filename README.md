# PricingOS - Micro-SaaS MVP

A complete, production-ready micro-SaaS MVP for freelancers and small agencies to generate professional service packages with smart pricing suggestions.

> **🚀 ¿Listo para deployar?** Ver [DEPLOY.md](./DEPLOY.md) para instrucciones completas de deployment en Vercel.

## 🚀 Features

- **Email Magic Link Authentication** - Secure login using Supabase Auth
- **Pricing Wizard** - Multi-step form to set up your pricing profile
- **Smart Package Generator** - Automatically generates 3 pricing tiers (Starter, Standard, Premium) based on your inputs
- **Stripe Integration** - Full payment processing with setup fees, monthly subscriptions, and lifetime deals
- **Package Management** - View, edit, and copy packages to clipboard for proposals
- **Billing Management** - View subscription status and manage billing
- **Admin Dashboard** - Track users, subscriptions, MRR, and lifetime revenue

## 🛠 Tech Stack

- **Framework**: Next.js 14 (App Router) + TypeScript
- **Database & Auth**: Supabase (PostgreSQL + Auth)
- **Payments**: Stripe Billing
- **Styling**: TailwindCSS
- **Deployment**: Vercel

## 📋 Prerequisites

- Node.js 18+ and npm
- A Supabase account and project
- A Stripe account
- A Vercel account (for deployment)

> **🇪🇸 ¿Prefieres instrucciones en español?** Ver [GUIA-STRIPE-PLANS.md](./GUIA-STRIPE-PLANS.md) para una guía paso a paso detallada sobre cómo pre-poblar la tabla `plans` con tus Stripe Price IDs.

## 🏗 Setup Instructions

### 1. Clone and Install

```bash
# Clone the repository
git clone <your-repo-url>
cd pricingos

# Install dependencies
npm install
```

### 2. Supabase Setup

#### Create a Supabase Project

1. Go to [supabase.com](https://supabase.com) and create a new project
2. Wait for the project to be fully provisioned

#### Initialize Database Schema

1. In your Supabase dashboard, go to **SQL Editor**
2. Copy and paste the contents of `database/schema.sql`
3. Click **Run** to execute the SQL script
4. This will create all tables, indexes, and RLS policies

#### Get Supabase Credentials

1. Go to **Settings** → **API** in your Supabase dashboard
2. Copy the following:
   - **Project URL** (under "Project URL")
   - **anon/public key** (under "Project API keys")
   - **service_role key** (under "Project API keys" - keep this secret!)

### 3. Stripe Setup

#### Create Stripe Products and Prices

1. Go to [Stripe Dashboard](https://dashboard.stripe.com)
2. Navigate to **Products** → **Add Product**

Create the following products and prices:

**Setup Fee Plans:**
- Product: "Starter Setup"
  - One-time price: €199.00
  - Copy the Price ID (starts with `price_...`)
- Product: "Pro Setup"
  - One-time price: €299.00
  - Copy the Price ID

**Monthly Plans:**
- Product: "Monthly Basic"
  - Recurring price: €39.00/month
  - Copy the Price ID
- Product: "Monthly Pro"
  - Recurring price: €59.00/month
  - Copy the Price ID

**Lifetime Plans:**
- Product: "Lifetime Basic"
  - One-time price: €399.00
  - Copy the Price ID
- Product: "Lifetime Pro"
  - One-time price: €499.00
  - Copy the Price ID

#### Set Up Webhook

1. Go to **Developers** → **Webhooks** in Stripe Dashboard
2. Click **Add endpoint**
3. For local development, use [Stripe CLI](https://stripe.com/docs/stripe-cli):
   ```bash
   stripe listen --forward-to localhost:3000/api/webhooks/stripe
   ```
   This will give you a webhook signing secret (starts with `whsec_...`)
4. For production, add your Vercel URL:
   ```
   https://your-domain.vercel.app/api/webhooks/stripe
   ```
5. Select these events to listen to:
   - `checkout.session.completed`
   - `customer.subscription.updated`
   - `customer.subscription.deleted`
6. Copy the **Signing secret** (starts with `whsec_...`)

#### Get Stripe API Keys

1. Go to **Developers** → **API keys** in Stripe Dashboard
2. Copy:
   - **Publishable key** (starts with `pk_...`)
   - **Secret key** (starts with `sk_...`)

### 4. Environment Variables

1. Copy `.env.local.example` to `.env.local`:
   ```bash
   cp .env.local.example .env.local
   ```

2. Fill in your environment variables:

```env
# Supabase
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key

# Stripe
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=your_stripe_publishable_key
STRIPE_SECRET_KEY=your_stripe_secret_key
STRIPE_WEBHOOK_SECRET=your_stripe_webhook_secret

# App
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

### 5. Update Stripe Price IDs in Code

**Important**: The checkout API route uses placeholder price IDs. You need to update them:

1. Open `app/api/checkout/route.ts`
2. Replace the placeholder price IDs with your actual Stripe price IDs:
   ```typescript
   // Replace these with your actual Stripe price IDs
   if (type === 'setup') {
     priceId = 'price_YOUR_SETUP_PRICE_ID';
   } else if (type === 'monthly') {
     priceId = 'price_YOUR_MONTHLY_PRICE_ID';
   } else {
     priceId = 'price_YOUR_LIFETIME_PRICE_ID';
   }
   ```

**Better approach**: Store price IDs in the database `plans` table and fetch them dynamically. See TODO comments in the code.

### 6. Populate Plans Table (Optional but Recommended)

You can pre-populate the `plans` table with your Stripe product/price IDs:

```sql
INSERT INTO plans (name, monthly_price_eur, setup_fee_eur, lifetime_price_eur, stripe_price_setup_id, stripe_price_monthly_id, stripe_price_lifetime_id)
VALUES
  ('Starter Setup', 0, 199, 0, 'price_YOUR_STARTER_SETUP_ID', NULL, NULL),
  ('Pro Setup', 0, 299, 0, 'price_YOUR_PRO_SETUP_ID', NULL, NULL),
  ('Monthly Basic', 39, 0, 0, NULL, 'price_YOUR_MONTHLY_BASIC_ID', NULL),
  ('Monthly Pro', 59, 0, 0, NULL, 'price_YOUR_MONTHLY_PRO_ID', NULL),
  ('Lifetime Basic', 0, 0, 399, NULL, NULL, 'price_YOUR_LIFETIME_BASIC_ID'),
  ('Lifetime Pro', 0, 0, 499, NULL, NULL, 'price_YOUR_LIFETIME_PRO_ID');
```

Then update `app/api/checkout/route.ts` to fetch price IDs from the database instead of using placeholders.

### 7. Run Locally

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

### 8. Test the Flow

1. **Sign Up**: Go to `/signup` and enter your email
2. **Check Email**: You'll receive a magic link (check your Supabase email logs if using test mode)
3. **Complete Onboarding**: Fill in your name, country, service, and experience
4. **Run Wizard**: Go to `/wizard` and complete the 3-step pricing wizard
5. **View Packages**: Check `/dashboard` to see your generated packages
6. **Test Checkout**: Go to `/pricing` and test a checkout (use Stripe test cards)

## 🚢 Deployment to Vercel

### 1. Push to GitHub

```bash
git init
git add .
git commit -m "Initial commit"
git remote add origin <your-github-repo-url>
git push -u origin main
```

### 2. Deploy to Vercel

1. Go to [vercel.com](https://vercel.com) and sign in
2. Click **Add New Project**
3. Import your GitHub repository
4. Add environment variables (same as `.env.local`)
5. Click **Deploy**

### 3. Update Webhook URL

1. After deployment, go to Stripe Dashboard → **Webhooks**
2. Update your webhook endpoint URL to:
   ```
   https://your-domain.vercel.app/api/webhooks/stripe
   ```
3. Update `NEXT_PUBLIC_APP_URL` in Vercel environment variables to your production URL

### 4. Test Production

1. Visit your Vercel URL
2. Test the full signup and checkout flow
3. Verify webhook events are being received (check Stripe Dashboard → **Webhooks** → **Events**)

## 📁 Project Structure

```
pricingos/
├── app/                    # Next.js App Router pages
│   ├── api/               # API routes
│   │   ├── checkout/      # Stripe checkout session creation
│   │   └── webhooks/      # Stripe webhook handler
│   ├── admin/             # Admin dashboard
│   ├── billing/           # Billing management
│   ├── dashboard/         # Main user dashboard
│   ├── pricing/           # Pricing page
│   ├── signup/            # Sign up/login
│   ├── wizard/            # Pricing wizard
│   ├── layout.tsx         # Root layout
│   └── page.tsx           # Home page
├── components/            # React components
│   ├── AdminDashboard.tsx
│   ├── BillingInfo.tsx
│   ├── DashboardLayout.tsx
│   ├── PackagesList.tsx
│   ├── PricingCards.tsx
│   ├── Sidebar.tsx
│   └── TopBar.tsx
├── lib/                   # Utility libraries
│   ├── package-generator.ts  # Package generation logic
│   ├── stripe.ts          # Stripe client
│   └── supabase/          # Supabase clients
│       ├── client.ts      # Client-side Supabase
│       ├── server.ts      # Server-side Supabase
│       └── types.ts       # Database types
├── types/                 # TypeScript types
│   └── database.ts       # Database entity types
├── database/              # Database schema
│   └── schema.sql        # SQL schema and RLS policies
└── README.md
```

## 🔒 Security Notes

- **RLS Policies**: All tables have Row Level Security enabled. Users can only access their own data.
- **Service Role Key**: Only use the service role key in server-side code (API routes). Never expose it to the client.
- **Webhook Secret**: Always verify webhook signatures using the webhook secret.
- **Environment Variables**: Never commit `.env.local` to version control.

## 🐛 Troubleshooting

### Magic Link Not Working

- Check Supabase email settings (Settings → Auth → Email Templates)
- For local development, check Supabase logs for email links
- Ensure `NEXT_PUBLIC_SUPABASE_URL` is correct

### Webhook Not Receiving Events

- Verify webhook URL is correct in Stripe Dashboard
- Check webhook secret is set correctly in environment variables
- Use Stripe CLI for local testing: `stripe listen --forward-to localhost:3000/api/webhooks/stripe`
- Check Vercel function logs for errors

### Database Errors

- Ensure RLS policies are set up correctly
- Check that the `users` table trigger is created
- Verify foreign key constraints are correct

### Stripe Checkout Not Working

- Verify Stripe API keys are correct
- Check that price IDs are valid in Stripe
- Ensure `NEXT_PUBLIC_APP_URL` is set correctly
- Check browser console and server logs for errors

## 📝 TODO / Future Improvements

- [ ] Implement Stripe Customer Portal for self-service billing management
- [ ] Add proper admin role checking (currently any user can access `/admin`)
- [ ] Store Stripe price IDs in database and fetch dynamically
- [ ] Add email notifications for subscription events
- [ ] Implement package templates and presets
- [ ] Add export functionality (PDF, CSV)
- [ ] Add analytics and usage tracking
- [ ] Implement team/organization features
- [ ] Add AI-powered pricing suggestions (optional enhancement)

## 📄 License

This project is provided as-is for educational and commercial use.

## 🤝 Support

For issues or questions, please open an issue on GitHub or contact support.

---

Built with ❤️ for freelancers and small agencies


favicon.ico:1  Failed to load resource: the server responded with a status of 404 ()
users?select=name&id=eq.ee87626b-18ae-4ddb-9107-6864ff0aff4c:1  Failed to load resource: the server responded with a status of 406 ()
Node cannot be found in the current page.