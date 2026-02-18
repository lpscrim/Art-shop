import { revalidatePath, revalidateTag } from 'next/cache';
import { NextRequest, NextResponse } from 'next/server';

export const runtime = 'nodejs';

const SUPABASE_CACHE_TAG = 'supabase-projects';

export async function GET(req: NextRequest) {
  const expectedSecret = process.env.REVALIDATE_SECRET;
  if (!expectedSecret) {
    return NextResponse.json(
      { error: 'REVALIDATE_SECRET is not configured' },
      { status: 500 }
    );
  }

  const secret = req.nextUrl.searchParams.get('secret');
  if (secret !== expectedSecret) {
    return NextResponse.json({ error: 'Invalid secret' }, { status: 401 });
  }

  revalidateTag(SUPABASE_CACHE_TAG);
  revalidatePath('/');
  revalidatePath('/work');

  return NextResponse.json({ revalidated: true, tag: SUPABASE_CACHE_TAG });
}
