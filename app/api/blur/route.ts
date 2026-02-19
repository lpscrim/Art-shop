import { NextRequest, NextResponse } from 'next/server';

import { getBase64ImageUrl } from '@/app/_lib/getBase64ImageUrl';

export const runtime = 'nodejs';

export async function GET(req: NextRequest) {
  const src = req.nextUrl.searchParams.get('src');
  if (!src) {
    return NextResponse.json({ error: 'Missing src query param' }, { status: 400 });
  }

  try {
    const blurDataURL = await getBase64ImageUrl(src);

    return NextResponse.json(
      { blurDataURL },
      {
        headers: {
          // Let the browser cache these for a long time.
          'Cache-Control': 'public, max-age=31536000, immutable',
        },
      }
    );
  } catch {
    return NextResponse.json(
      { error: 'Failed to generate blur placeholder' },
      { status: 500 }
    );
  }
}
