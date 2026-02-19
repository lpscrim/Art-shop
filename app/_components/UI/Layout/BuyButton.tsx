'use client';
import Button from './Button';
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
    <Button
      onClick={handleClick}
      disabled={outOfStock || notAvailable || loading}
      size='sm'
    >
      {loading
        ? '…'
        : outOfStock
          ? 'N/A'
          : `BUY`}
    </Button>
  );
}
