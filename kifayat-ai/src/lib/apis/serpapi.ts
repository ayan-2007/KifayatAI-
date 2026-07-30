import type { CurrencyCode } from '@/types';
import { COUNTRY_MAP, parsePriceRaw } from '@/lib/currency';

const SERPAPI_KEY = () => process.env.SERPAPI_API_KEY;

export interface SerpapiPriceMatch {
  title: string;
  merchant: string;
  price: number;
  priceRaw: string;
  imageUrl: string;
  productUrl: string;
}

interface SerpapiResult {
  search_metadata?: { status?: string };
  shopping_results?: {
    title: string;
    source: string;
    price: string;
    thumbnail: string;
    link: string;
    rating?: number;
    reviews?: number;
  }[];
}

const LANGUAGE_MAP: Record<CurrencyCode, string> = {
  USD: 'en',
  PKR: 'ur',
  INR: 'hi',
  EUR: 'de',
  GBP: 'en',
  AED: 'ar',
};

export async function searchWithTalashkaar(
  query: string,
  currency: CurrencyCode
): Promise<{ success: boolean; results?: SerpapiPriceMatch[] }> {
  const key = SERPAPI_KEY();
  if (!key) return { success: false };

  const gl = COUNTRY_MAP[currency];
  const hl = LANGUAGE_MAP[currency];

  try {
    const params = new URLSearchParams({
      engine: 'google_shopping',
      q: query,
      api_key: key,
      num: '8',
      gl,
      hl,
    });

    const res = await fetch(`https://serpapi.com/search?${params}`, {
      signal: AbortSignal.timeout(10000),
    });

    if (!res.ok) {
      const errText = await res.text().catch(() => '');
      console.warn(`[Talashkaar] HTTP ${res.status}: ${errText}`);
      return { success: false };
    }

    const data: SerpapiResult = await res.json();

    if (data.search_metadata?.status === 'error') {
      console.warn('[Talashkaar] API returned error status');
      return { success: false };
    }

    if (!data.shopping_results?.length) {
      return { success: false };
    }

    const results: SerpapiPriceMatch[] = data.shopping_results.map((item) => ({
      title: item.title,
      merchant: item.source,
      price: parsePriceRaw(item.price),
      priceRaw: item.price,
      imageUrl: item.thumbnail,
      productUrl: item.link,
    }));

    return { success: true, results };
  } catch (err) {
    console.warn('[Talashkaar] Error:', err instanceof Error ? err.message : err);
    return { success: false };
  }
}

export async function searchWithTalashkaarFallback(
  query: string
): Promise<{ success: boolean; results?: SerpapiPriceMatch[] }> {
  const key = SERPAPI_KEY();
  if (!key) return { success: false };

  try {
    const params = new URLSearchParams({
      engine: 'google_shopping',
      q: query,
      api_key: key,
      num: '8',
      gl: 'us',
      hl: 'en',
    });

    const res = await fetch(`https://serpapi.com/search?${params}`, {
      signal: AbortSignal.timeout(10000),
    });

    if (!res.ok) return { success: false };

    const data: SerpapiResult = await res.json();
    if (!data.shopping_results?.length) return { success: false };

    const results: SerpapiPriceMatch[] = data.shopping_results.map((item) => ({
      title: item.title,
      merchant: item.source,
      price: parsePriceRaw(item.price),
      priceRaw: item.price,
      imageUrl: item.thumbnail,
      productUrl: item.link,
    }));

    return { success: true, results };
  } catch {
    return { success: false };
  }
}
