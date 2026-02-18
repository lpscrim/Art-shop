import 'server-only';

function encodeCloudinaryPublicId(publicId: string): string {
  return publicId
    .split('/')
    .map((segment) => encodeURIComponent(segment))
    .join('/');
}

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

export async function getBase64ImageUrl(publicId: string): Promise<string> {
  const cloudName = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME;
  if (!cloudName) {
    throw new Error('NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME is not set');
  }

  const cache = getGlobalCache();
  const cacheKey = `${cloudName}:${publicId}`;
  const cached = cache.get(cacheKey);
  if (cached) return cached.dataUrl;

  // Very small, very low quality, heavily blurred placeholder.
  // This keeps payload tiny and renders instantly.
  const transformedUrl = `https://res.cloudinary.com/${cloudName}/image/upload/w_32,q_10,e_blur:2000,f_jpg/${encodeCloudinaryPublicId(publicId)}`;

  const response = await fetch(transformedUrl, {
    next: { revalidate: 60 * 60 * 24 * 365 },
  });

  if (!response.ok) {
    throw new Error(`Failed to fetch placeholder for ${publicId} (${response.status})`);
  }

  const arrayBuffer = await response.arrayBuffer();
  const contentType = response.headers.get('content-type') ?? 'image/jpeg';
  const base64 = Buffer.from(arrayBuffer).toString('base64');
  const dataUrl = `data:${contentType};base64,${base64}`;

  // Simple bound to avoid unbounded memory usage during dev.
  if (cache.size > 2000) cache.clear();
  cache.set(cacheKey, { dataUrl, createdAt: Date.now() });

  return dataUrl;
}
