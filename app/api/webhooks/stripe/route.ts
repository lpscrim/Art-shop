import { NextRequest, NextResponse } from 'next/server';
import Stripe from 'stripe';
import { createClient } from '@supabase/supabase-js';

// Initialize Stripe
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2023-10-16',
});

// Initialize Supabase
const supabase = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

// Stripe webhook secret
const endpointSecret = process.env.STRIPE_WEBHOOK_SECRET!;

export async function POST(req: NextRequest) {
  const sig = req.headers.get('stripe-signature');
  const rawBody = await req.text();

  let event: Stripe.Event;
  try {
    event = stripe.webhooks.constructEvent(rawBody, sig!, endpointSecret);
  } catch (err: any) {
    return NextResponse.json({ error: `Webhook Error: ${err.message}` }, { status: 400 });
  }

  if (event.type === 'checkout.session.completed') {
    const session = event.data.object as Stripe.Checkout.Session;
    const lineItems = await stripe.checkout.sessions.listLineItems(session.id);

    // For each purchased product, decrement stock in Supabase
    for (const item of lineItems.data) {
      // Assume product id is stored in price metadata or product metadata
      const stripeProductId = item.price?.product as string;
      const quantity = item.quantity || 1;

      // Find the Supabase product by stripe_product_id
      const { data: product, error } = await supabase
        .from('products')
        .select('id, stock_level')
        .eq('stripe_product_id', stripeProductId)
        .single();

      if (error || !product) continue;

      // Decrement stock_level by quantity
      await supabase.rpc('decrement_stock', {
        product_id: product.id,
        quantity,
      });
    }
  }

  return NextResponse.json({ received: true });
}
