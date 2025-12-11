# Quick Start Guide

## 🚀 Get Started in 5 Minutes

### 1. Install Dependencies

```bash
npm install
```

### 2. Set Up Environment Variables

Copy `.env.local.example` to `.env.local` and fill in:

```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=your_stripe_publishable_key
STRIPE_SECRET_KEY=your_stripe_secret_key
STRIPE_WEBHOOK_SECRET=your_webhook_secret
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

### 3. Initialize Supabase Database

1. Go to your Supabase project → SQL Editor
2. Copy and paste the contents of `database/schema.sql`
3. Click Run

### 4. Update Stripe Price IDs

Open `app/api/checkout/route.ts` and replace placeholder price IDs with your actual Stripe price IDs.

### 5. Run Development Server

```bash
npm run dev
```

Visit [http://localhost:3000](http://localhost:3000)

### 6. Test Webhook Locally (Optional)

```bash
stripe listen --forward-to localhost:3000/api/webhooks/stripe
```

Copy the webhook secret and add it to `.env.local` as `STRIPE_WEBHOOK_SECRET`.

---

For detailed setup instructions, see [README.md](./README.md).


