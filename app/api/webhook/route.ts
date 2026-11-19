import { NextResponse } from 'next/server';
import Stripe from 'stripe';
import { createClient } from '@supabase/supabase-js';

export const runtime = 'nodejs';

function resolveSubscriptionTier(subscription: Stripe.Subscription): 'featured' | 'pro' | 'free' {
  const isSubscriber =
    subscription.status === 'active' || subscription.status === 'trialing';
  if (!isSubscriber) return 'free';

  const activePriceId = subscription.items.data[0]?.price?.id?.trim();
  const proPassPriceId = process.env.STRIPE_PRO_PASS_PRICE_ID?.trim();

  if (proPassPriceId && activePriceId === proPassPriceId) {
    return 'pro';
  }
  return 'featured';
}

export async function POST(req: Request) {
  const stripeSecretKey = process.env.STRIPE_SECRET_KEY?.trim();
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET?.trim();
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL?.trim();
  const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY?.trim();

  if (!stripeSecretKey || !webhookSecret || !supabaseUrl || !supabaseServiceKey) {
    return NextResponse.json(
      { error: 'Missing Stripe or Supabase webhook environment variables' },
      { status: 500 }
    );
  }

  const signature = req.headers.get('stripe-signature');
  if (!signature) {
    return NextResponse.json({ error: 'Missing webhook signature' }, { status: 400 });
  }

  const stripe = new Stripe(stripeSecretKey);
  const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey, {
    auth: { persistSession: false, autoRefreshToken: false },
  });

  const body = await req.text();
  let event: Stripe.Event;

  try {
    event = stripe.webhooks.constructEvent(body, signature, webhookSecret);
  } catch (err: any) {
    console.error(`Webhook signature verification failed: ${err.message}`);
    return NextResponse.json({ error: `Webhook Error: ${err.message}` }, { status: 400 });
  }

  try {
    switch (event.type) {
      case 'checkout.session.completed': {
        const session = event.data.object as Stripe.Checkout.Session;
        const userId = session.metadata?.supabaseUserId?.trim();
        const tier = session.metadata?.tier === 'pro' ? 'pro' : 'featured';
        const customerId =
          typeof session.customer === 'string' ? session.customer : session.customer?.id;
        const subscriptionId =
          typeof session.subscription === 'string'
            ? session.subscription
            : session.subscription?.id;

        if (userId) {
          const { error } = await supabaseAdmin
            .from('profiles')
            .update({
              stripe_customer_id: customerId ?? null,
              stripe_subscription_id: subscriptionId ?? null,
              subscription_status: 'active',
              subscription_tier: tier,
            })
            .eq('id', userId);

          if (error) {
            console.error('Supabase checkout.session.completed update failed:', error);
            return NextResponse.json({ error: error.message }, { status: 500 });
          }
        }
        break;
      }

      case 'customer.subscription.updated': {
        const subscription = event.data.object as Stripe.Subscription;
        const customerId =
          typeof subscription.customer === 'string'
            ? subscription.customer
            : subscription.customer?.id;
        const resolvedTier = resolveSubscriptionTier(subscription);

        if (customerId) {
          const { error } = await supabaseAdmin
            .from('profiles')
            .update({
              stripe_subscription_id: subscription.id,
              subscription_status: subscription.status,
              subscription_tier: resolvedTier,
            })
            .eq('stripe_customer_id', customerId);

          if (error) {
            console.error('Supabase customer.subscription.updated failed:', error);
            return NextResponse.json({ error: error.message }, { status: 500 });
          }
        }
        break;
      }

      case 'customer.subscription.deleted': {
        const subscription = event.data.object as Stripe.Subscription;
        const customerId =
          typeof subscription.customer === 'string'
            ? subscription.customer
            : subscription.customer?.id;

        if (customerId) {
          const { error } = await supabaseAdmin
            .from('profiles')
            .update({
              subscription_status: 'canceled',
              subscription_tier: 'free',
            })
            .eq('stripe_customer_id', customerId);

          if (error) {
            console.error('Supabase customer.subscription.deleted failed:', error);
            return NextResponse.json({ error: error.message }, { status: 500 });
          }
        }
        break;
      }

      default:
        console.warn(`Unhandled event type ${event.type}`);
    }

    return NextResponse.json({ received: true });
  } catch (error: any) {
    console.error('Error handling webhook event:', error);
    return NextResponse.json({ error: 'Webhook handler failed' }, { status: 500 });
  }
}
