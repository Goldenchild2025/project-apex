import { NextResponse } from 'next/server';
import Stripe from 'stripe';
import { createClient } from '@supabase/supabase-js';

export const runtime = 'nodejs';

export async function POST(req: Request) {
  try {
    const stripeSecretKey = process.env.STRIPE_SECRET_KEY?.trim();
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL?.trim();
    const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY?.trim();

    if (!stripeSecretKey) {
      return NextResponse.json(
        { error: 'Missing STRIPE_SECRET_KEY in environment variables' },
        { status: 500 }
      );
    }

    if (!supabaseUrl || !supabaseServiceKey) {
      return NextResponse.json(
        { error: 'Missing Supabase URL or service role key in environment variables' },
        { status: 500 }
      );
    }

    const stripe = new Stripe(stripeSecretKey);
    const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey, {
      auth: { persistSession: false, autoRefreshToken: false },
    });

    const body = await req.json().catch(() => ({}));
    const userId = typeof body?.userId === 'string' ? body.userId.trim() : '';
    const email = typeof body?.email === 'string' ? body.email.trim() : undefined;
    const tier = typeof body?.tier === 'string' ? body.tier.trim() : '';

    if (!userId) {
      return NextResponse.json({ error: 'Missing userId in request body' }, { status: 400 });
    }

    const selectedTier = tier === 'pro' || tier === 'pro_pass' ? 'pro' : 'featured';

    const priceId = (
      selectedTier === 'pro'
        ? process.env.STRIPE_PRO_PASS_PRICE_ID
        : process.env.STRIPE_CREATOR_PRO_PRICE_ID
    )?.trim();

    if (!priceId) {
      return NextResponse.json(
        { error: 'Selected price ID is not configured in environment variables' },
        { status: 400 }
      );
    }

    // 1. Get or create Stripe customer ID securely via service role
    const { data: profile, error: profileError } = await supabaseAdmin
      .from('profiles')
      .select('stripe_customer_id')
      .eq('id', userId)
      .maybeSingle();

    if (profileError) {
      console.error('SUPABASE PROFILE SELECT ERROR:', profileError);
      return NextResponse.json(
        { error: `Failed to query profile: ${profileError.message}` },
        { status: 500 }
      );
    }

    let customerId = profile?.stripe_customer_id?.trim() || '';

    if (!customerId) {
      const customer = await stripe.customers.create({
        email: email || undefined,
        metadata: { supabaseUserId: userId },
      });
      customerId = customer.id;

      const { error: updateError } = await supabaseAdmin
        .from('profiles')
        .update({ stripe_customer_id: customerId })
        .eq('id', userId);

      if (updateError) {
        console.error('SUPABASE PROFILE UPDATE ERROR:', updateError);
      }
    }

    // 2. Create Checkout Session (mode must be 'subscription' for recurring prices)
    const rawSiteUrl = process.env.NEXT_PUBLIC_SITE_URL?.trim() || 'http://localhost:3000';
    const siteUrl = rawSiteUrl.replace(/\/+$/, '');

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

    if (!session.url) {
      return NextResponse.json(
        { error: 'Stripe did not return a Checkout session URL' },
        { status: 500 }
      );
    }

    return NextResponse.json({ url: session.url });
  } catch (error: any) {
    console.error('STRIPE CHECKOUT EXCEPTION:', error?.raw?.message || error?.message || error);
    return NextResponse.json(
      { error: error?.raw?.message || error?.message || 'Internal Server Error' },
      { status: 500 }
    );
  }
}