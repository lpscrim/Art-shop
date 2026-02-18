# Art Shop — Photography Portfolio Boilerplate

A photography & visual art portfolio built with **Next.js 16 App Router**, **Tailwind CSS 4**, **Framer Motion**, and **Cloudinary**.

## Features

- **Cloudinary-powered galleries** — projects auto-discovered from folder structure
- **Photo modal** with swipe support, thumbnails, and loading progress
- **Category filtering** across projects and individual photos
- **Responsive hero** with animated reveal
- **SEO** — sitemap, robots.txt, Open Graph / Twitter meta via Next.js metadata API
- **Blur placeholders** generated on demand via `/api/blur`
- **On-demand revalidation** — call `/api/revalidate?secret=...` after uploading new images
- **Standalone output** — ready for Docker / serverless deployment

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
# Cloudinary (required)
NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME=
CLOUDINARY_API_KEY=
CLOUDINARY_API_SECRET=

# Site URL (recommended — used for sitemap / metadata)
NEXT_PUBLIC_SITE_URL=https://your-domain.com

# Revalidation secret (recommended)
REVALIDATE_SECRET=some-long-random-string
```

## Cloudinary Folder Convention

Projects are auto-discovered from subfolders inside a `photos/` folder in your Cloudinary account:

```
photos/
  0_project-name_2024_LANDSCAPE,BW/
    0.webp          ← cover image (sorted first)
    1.webp
    description.txt ← optional project description
  1_another-project_2025_IR,ART/
    ...
```

Folder name format: `{id}_{slug}_{year}_{CATEGORY,CATEGORY,...}`

## Customisation Checklist

- [ ] Replace hero images in `public/` (`tree1.JPG`, `pic1.JPG`)
- [ ] Replace `Me_Sun2.svg` (about section) or swap for your own image
- [ ] Update site name in `app/layout.tsx` metadata and `Header.tsx`
- [ ] Update About section bio in `app/components/Sections/Home/About.tsx`
- [ ] Update Contact section links in `app/components/Sections/Home/Contact.tsx`
- [ ] Update Footer name in `app/components/Sections/Footer.tsx`
- [ ] Replace favicons in `public/`
- [ ] Set your Cloudinary credentials in `.env.local`
- [ ] Set `NEXT_PUBLIC_SITE_URL` for correct SEO URLs

## Revalidating Cloudinary Cache

After uploading or reordering images in Cloudinary:

```bash
curl "https://your-domain.com/api/revalidate?secret=YOUR_SECRET"
```

## License

MIT
