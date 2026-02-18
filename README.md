# Art Shop  Photography Portfolio & Store

A photography & visual art portfolio built with **Next.js 16 App Router**, **Tailwind CSS 4**, **Framer Motion**, **Supabase**, and **Stripe**.

## Features

- **Supabase-powered galleries**  products stored in PostgreSQL, images in Supabase Storage
- **Stripe integration**  checkout with automatic stock management via webhooks
- **Photo modal** with swipe support, thumbnails, and loading progress
- **Category filtering** across projects and individual photos
- **Responsive hero** with animated reveal
- **SEO**  sitemap, robots.txt, Open Graph / Twitter meta via Next.js metadata API
- **Blur placeholders** generated on demand via `/api/blur`
- **On-demand revalidation**  call `/api/revalidate?secret=...` after updating products
- **Standalone output**  ready for Docker / serverless deployment

## Quick Start

```bash
npm install
npm run dev
```

Open `http://localhost:3000`.

## Scripts

| Command | Description |
| --- | --- |
| `npm run dev` | Start Next.js dev server |
| `npm run build` | Production build |
| `npm run start` | Run production server |
| `npm run lint` | Run ESLint |
| `npm run clean` | Remove `.next`, `.turbo`, `node_modules/.cache` |

## Environment Variables

Create a `.env.local` file:

```bash
# Supabase (required)
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key

# Stripe (required)
STRIPE_SECRET_KEY=sk_...
STRIPE_WEBHOOK_SECRET=whsec_...

# Site URL (recommended  used for sitemap / metadata)
NEXT_PUBLIC_SITE_URL=https://your-domain.com

# Revalidation secret (recommended)
REVALIDATE_SECRET=some-long-random-string
```

## Supabase Schema

Create a `products` table in Supabase with these columns:

| Column | Type | Notes |
| --- | --- | --- |
| `id` | uuid | Primary key |
| `name` | text | Product name |
| `description` | text | Product description |
| `price_hw` | integer | Price in cents (for Stripe) |
| `image_url` | text | Cover image public URL |
| `stock_level` | integer | Current stock |
| `categories` | text[] | Array of category strings |
| `year` | text | Year of the project |
| `stripe_product_id` | text, nullable | Auto-filled on sync |
| `stripe_price_id` | text, nullable | Auto-filled on sync |

Gallery images for each product are stored in a Supabase Storage bucket called `product-images`, organised as `{product_id}/0.webp`, `{product_id}/1.webp`, etc.

### Decrement Stock RPC

Create this SQL function in Supabase for the webhook:

```sql
CREATE OR REPLACE FUNCTION decrement_stock(product_id uuid, quantity int)
RETURNS void AS $$
BEGIN
  UPDATE products
  SET stock_level = stock_level - quantity
  WHERE id = product_id AND stock_level >= quantity;
END;
$$ LANGUAGE plpgsql;
```

## Customisation Checklist

- [ ] Replace hero images in `public/` (`tree1.JPG`, `pic1.JPG`)
- [ ] Replace `Me_Sun2.svg` (about section) or swap for your own image
- [ ] Update site name in `app/layout.tsx` metadata and `Header.tsx`
- [ ] Update About section bio in `app/components/Sections/Home/About.tsx`
- [ ] Update Contact section links in `app/components/Sections/Home/Contact.tsx`
- [ ] Update Footer name in `app/components/Sections/Footer.tsx`
- [ ] Replace favicons in `public/`
- [ ] Set your Supabase credentials in `.env.local`
- [ ] Set your Stripe credentials in `.env.local`
- [ ] Set `NEXT_PUBLIC_SITE_URL` for correct SEO URLs

## Revalidating Cache

After updating products in Supabase:

```bash
curl "https://your-domain.com/api/revalidate?secret=YOUR_SECRET"
```

## License

MIT
