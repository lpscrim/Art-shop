import { NextRequest, NextResponse } from 'next/server';
import { getStripe } from '@/app/_lib/stripe';

export async function POST(req: NextRequest) {
  try {
    const { priceId } = (await req.json()) as { priceId?: string };

    if (!priceId) {
      return NextResponse.json({ error: 'Missing priceId' }, { status: 400 });
    }

    const stripe = getStripe();

    const siteUrl =
      process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000';

    const session = await stripe.checkout.sessions.create({
      mode: 'payment',
      line_items: [{ price: priceId, quantity: 1 }],
      success_url: `${siteUrl}/work?checkout=success`,
      cancel_url: `${siteUrl}/work?checkout=cancelled`,
    });

    return NextResponse.json({ url: session.url });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Checkout failed';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
