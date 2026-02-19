'use client';

import { useState } from 'react';

interface BuyButtonProps {
  stripePriceId: string | null;
  stockLevel: number;
  /** Price in cents */
  priceHw: number;
}

export function BuyButton({ stripePriceId, stockLevel, priceHw }: BuyButtonProps) {
  const [loading, setLoading] = useState(false);

  const outOfStock = stockLevel <= 0;
  const notAvailable = !stripePriceId;

  const displayPrice = (priceHw / 100).toFixed(2);

  async function handleClick() {
    if (outOfStock || notAvailable || loading) return;
    setLoading(true);

    try {
      const res = await fetch('/api/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ priceId: stripePriceId }),
      });

      const data = await res.json();

      if (data.url) {
        window.location.href = data.url;
      } else {
        console.error('Checkout error:', data.error);
      }
    } catch (err) {
      console.error('Checkout error:', err);
    } finally {
      setLoading(false);
    }
  }

  return (
    <button
      onClick={handleClick}
      disabled={outOfStock || notAvailable || loading}
      className={`rounded-md px-5 py-2.5 text-sm font-medium transition-opacity ${
        outOfStock
          ? 'bg-muted text-muted-foreground cursor-not-allowed'
          : 'bg-foreground text-background hover:opacity-90 disabled:opacity-50'
      }`}
    >
      {loading
        ? 'Redirecting…'
        : outOfStock
          ? 'Out of Stock'
          : `Buy Now — £${displayPrice}`}
    </button>
  );
}
