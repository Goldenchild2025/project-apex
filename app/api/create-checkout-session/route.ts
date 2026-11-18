import { NextResponse } from 'next/server';
import Stripe from 'stripe';
import { createClient } from '@supabase/supabase-js';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY as string);

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL as string,
  process.env.SUPABASE_SERVICE_ROLE_KEY as string
);

export async function POST(req: Request) {
  try {
    const body = await req.json().catch(() => ({}));
    const { userId, email, tier } = body;

    if (!userId) {
      return NextResponse.json({ error: 'Missing userId in request body' }, { status: 400 });
    }

    const selectedTier = tier || 'featured';

    // Dynamically select the correct Stripe Price ID
    const priceId = selectedTier === 'pro' 
      ? process.env.STRIPE_PRO_PASS_PRICE_ID 
      : process.env.STRIPE_CREATOR_PRO_PRICE_ID;

    if (!priceId) {
      return NextResponse.json({ error: 'Selected price ID is not configured in environment variables' }, { status: 400 });
    }

    // 1. Get or create Stripe customer ID securely via service role
    let { data: profile } = await supabaseAdmin
      .from('profiles')
      .select('stripe_customer_id')
      .eq('id', userId)
      .maybeSingle();

    let customerId = profile?.stripe_customer_id;

    if (!customerId) {
      const customer = await stripe.customers.create({
        email: email || undefined,
        metadata: { supabaseUserId: userId },
      });
      customerId = customer.id;

      await supabaseAdmin
        .from('profiles')
        .update({ stripe_customer_id: customerId })
        .eq('id', userId);
    }

    // 2. Create Checkout Session (mode must be 'subscription' since the Stripe prices are recurring)
    const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000';

    const session = await stripe.checkout.sessions.create({
      customer: customerId,
      line_items: [
        {
          price: priceId,
          quantity: 1,
        },
      ],
      mode: 'subscription',
      success_url: `${siteUrl}/dashboard?boost=success&tier=${selectedTier}`,
      cancel_url: `${siteUrl}/dashboard?boost=cancelled`,
      metadata: { supabaseUserId: userId, tier: selectedTier },
    });

    return NextResponse.json({ url: session.url });
  } catch (error: any) {
    console.error('STRIPE CHECKOUT EXCEPTION:', error?.raw?.message || error.message || error);
    return NextResponse.json(
      { error: error?.raw?.message || error.message || 'Internal Server Error' },
      { status: 500 }
    );
  }
}