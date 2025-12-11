import { createServerSupabaseClient } from '@/lib/supabase/server';
import { stripe } from '@/lib/stripe';
import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    const supabase = createServerSupabaseClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { planName, type } = body;

    const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';

    // Fetch plan from database to get Stripe price ID
    const { data: plan, error: planError } = await supabase
      .from('plans')
      .select('*')
      .eq('name', planName)
      .single();

    if (planError || !plan) {
      return NextResponse.json(
        { error: 'Plan not found' },
        { status: 404 }
      );
    }

    let priceId: string | null = null;
    let mode: 'payment' | 'subscription';

    // Type assertion for plan data
    const planData = plan as any;

    if (type === 'setup') {
      // Setup fee - one-time payment
      mode = 'payment';
      priceId = planData.stripe_price_setup_id;
    } else if (type === 'monthly') {
      // Monthly subscription
      mode = 'subscription';
      priceId = planData.stripe_price_monthly_id;
    } else {
      // Lifetime - one-time payment
      mode = 'payment';
      priceId = planData.stripe_price_lifetime_id;
    }

    if (!priceId) {
      return NextResponse.json(
        { error: 'Price ID not found for this plan type' },
        { status: 400 }
      );
    }

    // Create or get Stripe customer
    let customerId: string;

    // Check if user already has a Stripe customer ID
    const { data: subscription } = await supabase
      .from('subscriptions')
      .select('stripe_customer_id')
      .eq('user_id', user.id)
      .single();

    const subscriptionData = subscription as any;
    if (subscriptionData?.stripe_customer_id) {
      customerId = subscriptionData.stripe_customer_id;
    } else {
      // Create new Stripe customer
      const customer = await stripe.customers.create({
        email: user.email!,
        metadata: {
          supabase_user_id: user.id,
        },
      });
      customerId = customer.id;
    }

    // Create checkout session
    const session = await stripe.checkout.sessions.create({
      customer: customerId,
      mode,
      payment_method_types: ['card'],
      line_items: [
        {
          price: priceId,
          quantity: 1,
        },
      ],
      success_url: `${appUrl}/dashboard?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${appUrl}/pricing`,
      metadata: {
        user_id: user.id,
        plan_name: planName,
        type,
      },
    });

    return NextResponse.json({ url: session.url });
  } catch (error: any) {
    console.error('Error creating checkout session:', error);
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    );
  }
}

