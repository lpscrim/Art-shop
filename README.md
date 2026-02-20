# Art Shop — Photography Portfolio & E-Commerce Store

A photography & visual art portfolio with integrated shopping cart and e-commerce platform. Built with **Next.js 16**, **Tailwind CSS 4**, **Framer Motion**, **Supabase**, and **Stripe**.

## Features

- **Product Gallery** — Showcase work with categories, filters, and details
- **Shopping Cart** — Real-time cart with item counts in menu
- **Stripe Checkout** — Secure payments with automatic stock management
- **Photo Modal** — Swipe gestures, thumbnails, lazy loading, blur placeholders
- **Admin Dashboard** — Secure Supabase auth with email allowlist
  - Add products with cover + up to 4 gallery images
  - Edit product info, pricing, stock, images
  - Delete products with automatic cleanup
  - HTTP-only session cookies, server-side validation
- **Responsive Design** — Mobile-first, hero animations, touch-friendly
- **SEO & Cache** — Sitemap, robots.txt, Open Graph/Twitter meta, on-demand revalidation
- **Production-Ready** — Docker-friendly, serverless-compatible

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
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key

# Stripe (required)
STRIPE_SECRET_KEY=sk_...
STRIPE_WEBHOOK_SECRET=whsec_...

# Admin auth (required for /admin routes)
ADMIN_EMAIL_ALLOWLIST=your-email@example.com

# Site URL (recommended)
NEXT_PUBLIC_SITE_URL=https://your-domain.com

# Revalidation secret (optional)
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

## Customization Checklist

- [ ] Set up Supabase project and get `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- [ ] Set up Stripe account and get `STRIPE_SECRET_KEY` and `STRIPE_WEBHOOK_SECRET`
- [ ] Add your email to `ADMIN_EMAIL_ALLOWLIST` in `.env.local`
- [ ] Create `products` table in Supabase (see schema above)
- [ ] Create `product-images` Storage bucket in Supabase
- [ ] Create `decrement_stock` RPC function in Supabase (see above)
- [ ] Replace hero images in `public/` (`tree1.JPG`, `pic1.JPG`)
- [ ] Replace `Me_Sun2.svg` (about section) with your own photo
- [ ] Update site name in [app/layout.tsx](app/layout.tsx) and [app/_components/Sections/Header.tsx](app/_components/Sections/Header.tsx)
- [ ] Update about section bio in [app/_components/Sections/Home/About.tsx](app/_components/Sections/Home/About.tsx)
- [ ] Update contact links in [app/_components/Sections/Home/Contact.tsx](app/_components/Sections/Home/Contact.tsx)
- [ ] Update footer name in [app/_components/Sections/Footer.tsx](app/_components/Sections/Footer.tsx)
- [ ] Replace favicons in `public/`
- [ ] Set `NEXT_PUBLIC_SITE_URL` for correct SEO URLs

## Admin Dashboard

The `/admin` routes are protected by Supabase authentication with an email allowlist:

- **Login**: Email/password via Supabase Auth
- **Security**: Only emails in `ADMIN_EMAIL_ALLOWLIST` can access admin
- **Session**: HTTP-only cookies prevent XSS attacks
- **Pages**:
  - `/admin` — Dashboard with Add/Edit product links
  - `/admin/add-product` — Upload new product with cover + gallery images
  - `/admin/edit-product` — Edit/delete existing products with image management

All server actions validate the user is authenticated and allowlisted before processing.

## Revalidating Cache

After updating products in Supabase, revalidate the cache:

```bash
curl "https://your-domain.com/api/revalidate?secret=YOUR_REVALIDATE_SECRET"
```

## Deployment

### Vercel (Recommended)

1. Push to GitHub/GitLab
2. Import project in Vercel
3. Add environment variables in project settings
4. Deploy with `npm run build`

### Self-Hosted

```bash
npm run build
npm start
```

Requires Node.js 18+.

## License

MIT
