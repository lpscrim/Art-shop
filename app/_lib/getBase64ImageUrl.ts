import 'server-only';

type CacheEntry = {
  dataUrl: string;
  createdAt: number;
};

const GLOBAL_CACHE_KEY = '__art_shop_blurDataUrlCache__';

function getGlobalCache(): Map<string, CacheEntry> {
  const globalObj = globalThis as unknown as Record<string, unknown>;
  const existing = globalObj[GLOBAL_CACHE_KEY] as Map<string, CacheEntry> | undefined;
  if (existing) return existing;

  const cache = new Map<string, CacheEntry>();
  globalObj[GLOBAL_CACHE_KEY] = cache;
  return cache;
}

/**
 * Fetch a remote image URL and return a tiny base64 data-URL
 * suitable for use as a blur placeholder.
 */
export async function getBase64ImageUrl(imageUrl: string): Promise<string> {
  if (!imageUrl) {
    throw new Error('imageUrl is required');
  }

  const cache = getGlobalCache();
  const cached = cache.get(imageUrl);
  if (cached) return cached.dataUrl;

  const response = await fetch(imageUrl, {
    next: { revalidate: 60 * 60 * 24 * 365 },
  });

  if (!response.ok) {
    throw new Error(`Failed to fetch placeholder for ${imageUrl} (${response.status})`);
  }

  const arrayBuffer = await response.arrayBuffer();
  const contentType = response.headers.get('content-type') ?? 'image/jpeg';
  const base64 = Buffer.from(arrayBuffer).toString('base64');
  const dataUrl = `data:${contentType};base64,${base64}`;

  if (cache.size > 2000) cache.clear();
  cache.set(imageUrl, { dataUrl, createdAt: Date.now() });

  return dataUrl;
}
