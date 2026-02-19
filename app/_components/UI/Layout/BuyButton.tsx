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

  const displayPrice = (priceHw / 100).toFixed(0);

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
      <div className="relative inline-flex">
        <span className={`transition-opacity duration-200 ${loading || outOfStock ? 'opacity-100' : 'group-hover:opacity-0 opacity-100'}`}>
          {loading
            ? '…'
            : outOfStock
              ? 'N/A'
              : `BUY`}
        </span>
        {!loading && !outOfStock && (
          <span className="absolute inset-0 flex items-center justify-center transition-opacity duration-200 opacity-0 group-hover:opacity-100">
            £{displayPrice}
          </span>
        )}
      </div>
    </Button>
  );
}
