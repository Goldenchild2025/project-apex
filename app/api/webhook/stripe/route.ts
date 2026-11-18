import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import Stripe from 'stripe';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || '', {
  apiVersion: '2025-02-24.acacia' as any,
});

const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET || '';

// Disable body parsing in Next.js App Router for raw body signature verification
export const dynamic = 'force-dynamic';

export async function POST(req: Request) {
  try {
    const bodyText = await req.text();
    const signature = req.headers.get('stripe-signature');

    if (!signature) {
      return NextResponse.json({ error: 'Missing stripe-signature header' }, { status: 400 });
    }

    let event: Stripe.Event;

    try {
      event = stripe.webhooks.constructEvent(bodyText, signature, webhookSecret);
    } catch (err: any) {
      console.error(`⚠️ Webhook signature verification failed:`, err.message);
      return NextResponse.json({ error: `Webhook Error: ${err.message}` }, { status: 400 });
    }

    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
    const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || '';
    const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey);

    // Handle checkout session completion
    if (event.type === 'checkout.session.completed') {
      const session = event.data.object as Stripe.Checkout.Session;
      
      const filmId = session.metadata?.filmId;
      const tier = session.metadata?.tier || 'featured';
      const userId = session.metadata?.userId;

      console.log(`✅ Checkout completed for Film ID: ${filmId}, Tier: ${tier}, User ID: ${userId}`);

      if (filmId) {
        // Update the film record to active featured status and tier
        const { error: updateError } = await supabaseAdmin
          .from('films')
          .update({
            is_featured: true,
            tier: tier,
          })
          .eq('id', filmId);

        if (updateError) {
          console.error('Supabase Film Fulfillment Error:', updateError);
          throw updateError;
        }
      }

      if (userId) {
        // Optionally update the user's profile or subscription record if tracked separately
        await supabaseAdmin
          .from('profiles')
          .update({ subscription_tier: tier })
          .eq('id', userId);
      }
    }

    return NextResponse.json({ received: true });
  } catch (err: any) {
    console.error('Stripe Webhook Handler Error:', err);
    return NextResponse.json({ error: err.message || 'Webhook internal error' }, { status: 500 });
  }
}