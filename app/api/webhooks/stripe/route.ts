import { createServiceClient } from '@/lib/supabase/service';
import { stripe } from '@/lib/stripe';
import { NextResponse } from 'next/server';
import Stripe from 'stripe';

// Use Node.js runtime for webhook (required for Stripe webhook verification)
export const runtime = 'nodejs';

export async function POST(request: Request) {
  const body = await request.text();
  const signature = request.headers.get('stripe-signature');

  if (!signature) {
    return NextResponse.json({ error: 'No signature' }, { status: 400 });
  }

  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;
  if (!webhookSecret) {
    console.error('STRIPE_WEBHOOK_SECRET is not set');
    return NextResponse.json({ error: 'Webhook secret not configured' }, { status: 500 });
  }

  let event: Stripe.Event;

  try {
    event = stripe.webhooks.constructEvent(body, signature, webhookSecret);
  } catch (err: any) {
    console.error('Webhook signature verification failed:', err.message);
    return NextResponse.json({ error: `Webhook Error: ${err.message}` }, { status: 400 });
  }

  // Use service role client for webhook operations (bypasses RLS)
  const supabase = createServiceClient();

  // Handle the event
  if (event.type === 'checkout.session.completed') {
    const session = event.data.object as Stripe.Checkout.Session;
    const userId = session.metadata?.user_id;

    if (!userId) {
      console.error('No user_id in session metadata');
      return NextResponse.json({ error: 'No user_id' }, { status: 400 });
    }

    // Determine plan type from metadata
    const planType = session.metadata?.type;
    const planName = session.metadata?.plan_name;

    if (!planName) {
      console.error('No plan_name in session metadata');
      return NextResponse.json({ error: 'No plan_name' }, { status: 400 });
    }

    // Find or create plan in database
    // TODO: In production, properly match plan from plans table
    let planId: string;
    const { data: existingPlan, error: existingPlanError } = await supabase
      .from('plans')
      .select('id')
      .eq('name', planName)
      .single();

    if (existingPlanError || !existingPlan) {
      // Create a placeholder plan if it doesn't exist
      // TODO: Pre-populate plans table with actual Stripe product/price IDs
      const { data: newPlan, error: planError } = await (supabase as any)
        .from('plans')
        .insert({
          name: planName,
          monthly_price_usd: 0,
          setup_fee_usd: 0,
          lifetime_price_usd: 0,
        })
        .select()
        .single();

      if (planError || !newPlan) {
        console.error('Error creating plan:', planError);
        return NextResponse.json({ error: 'Error creating plan' }, { status: 500 });
      }
      planId = (newPlan as { id: string }).id;
    } else {
      planId = (existingPlan as { id: string }).id;
    }

    // Determine if this is a lifetime purchase
    const isLifetime = planType === 'lifetime';

    // Get subscription details if it's a subscription
    let subscriptionId: string | null = null;
    let renewalDate: string | null = null;
    let status: 'active' | 'canceled' | 'past_due' | 'trialing' = 'active';

    if (session.subscription) {
      const subscription = await stripe.subscriptions.retrieve(session.subscription as string);
      subscriptionId = subscription.id;
      renewalDate = new Date(subscription.current_period_end * 1000).toISOString();
      status = subscription.status as any;
    } else if (isLifetime) {
      // For lifetime, set a far future date
      renewalDate = new Date('2099-12-31').toISOString();
    }

    // Create or update subscription record
    const { error: subError } = await (supabase as any).from('subscriptions').upsert({
      user_id: userId,
      plan_id: planId,
      status,
      stripe_customer_id: session.customer as string,
      stripe_subscription_id: subscriptionId,
      renewal_date: renewalDate,
      is_lifetime: isLifetime,
    });

    if (subError) {
      console.error('Error creating subscription:', subError);
      return NextResponse.json({ error: 'Error creating subscription' }, { status: 500 });
    }
  } else if (event.type === 'customer.subscription.updated') {
    const subscription = event.data.object as Stripe.Subscription;

    // Update subscription status and renewal date
    const { error: updateError } = await (supabase as any)
      .from('subscriptions')
      .update({
        status: subscription.status as any,
        renewal_date: new Date(subscription.current_period_end * 1000).toISOString(),
      })
      .eq('stripe_subscription_id', subscription.id);

    if (updateError) {
      console.error('Error updating subscription:', updateError);
    }
  } else if (event.type === 'customer.subscription.deleted') {
    const subscription = event.data.object as Stripe.Subscription;

    // Mark subscription as canceled
    const { error: cancelError } = await (supabase as any)
      .from('subscriptions')
      .update({
        status: 'canceled',
      })
      .eq('stripe_subscription_id', subscription.id);

    if (cancelError) {
      console.error('Error canceling subscription:', cancelError);
    }
  }

  return NextResponse.json({ received: true });
}

