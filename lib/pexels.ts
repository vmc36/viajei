type Photo = {
  url: string;
  alt: string;
  photographer: { name: string; profileUrl: string };
};

const CACHE_TTL_MS = 24 * 60 * 60 * 1000;
const MAX_CACHE = 500;
const cache = new Map<string, { value: Photo | null; expiresAt: number }>();

function cacheGet(key: string): Photo | null | undefined {
  const hit = cache.get(key);
  if (!hit) return undefined;
  if (hit.expiresAt <= Date.now()) {
    cache.delete(key);
    return undefined;
  }
  cache.delete(key);
  cache.set(key, hit);
  return hit.value;
}

function cacheSet(key: string, value: Photo | null) {
  cache.set(key, { value, expiresAt: Date.now() + CACHE_TTL_MS });
  while (cache.size > MAX_CACHE) {
    const first = cache.keys().next().value;
    if (first === undefined) break;
    cache.delete(first);
  }
}

export async function searchPhoto(rawQuery: string): Promise<Photo | null> {
  const query = rawQuery.trim().slice(0, 100);
  if (!query) return null;

  const cacheKey = query.toLowerCase();
  const cached = cacheGet(cacheKey);
  if (cached !== undefined) return cached;

  const apiKey = process.env.PEXELS_API_KEY;
  if (!apiKey) return null;

  const url = new URL("https://api.pexels.com/v1/search");
  url.searchParams.set("query", query);
  url.searchParams.set("per_page", "1");
  url.searchParams.set("orientation", "landscape");
  url.searchParams.set("size", "medium");

  try {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), 4000);
    const res = await fetch(url.toString(), {
      headers: { Authorization: apiKey },
      signal: controller.signal,
    });
    clearTimeout(timer);

    if (!res.ok) {
      cacheSet(cacheKey, null);
      return null;
    }

    const data = (await res.json()) as {
      photos?: Array<{
        src?: { large?: string; medium?: string; landscape?: string };
        alt?: string | null;
        photographer?: string;
        photographer_url?: string;
      }>;
    };

    const photo = data.photos?.[0];
    const imgUrl = photo?.src?.large ?? photo?.src?.landscape ?? photo?.src?.medium;
    if (!photo || !imgUrl) {
      cacheSet(cacheKey, null);
      return null;
    }

    const value: Photo = {
      url: imgUrl,
      alt: photo.alt || query,
      photographer: {
        name: photo.photographer ?? "Pexels",
        profileUrl: photo.photographer_url ?? "https://www.pexels.com",
      },
    };
    cacheSet(cacheKey, value);
    return value;
  } catch {
    return null;
  }
}
