import { identifyMerchant, type PakistaniMerchant } from '@/lib/merchants';
import { parsePriceRaw } from '@/lib/currency';

const SERPAPI_KEY = () => process.env.SERPAPI_API_KEY;

const MAX_BASE64_LEN = 200000;

export interface SerpapiPriceMatch {
  title: string;
  merchant: string;
  merchantDomain: string;
  price: number;
  imageUrl: string;
  productUrl: string;
  supportsCOD: boolean;
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

interface LensResult {
  search_metadata?: { status?: string };
  visual_matches?: {
    title: string;
    source: string;
    price: string;
    thumbnail: string;
    link: string;
  }[];
  shopping_results?: {
    title: string;
    source: string;
    price: string;
    thumbnail: string;
    link: string;
  }[];
}

function extractBase64(dataUri: string): string | null {
  const match = dataUri.match(/^data:image\/(png|jpeg|jpg|gif|webp);base64,(.+)$/);
  return match ? match[2] : null;
}

export async function searchGoogleLensPakistan(
  imageDataUri: string,
  query: string
): Promise<{ success: boolean; results?: SerpapiPriceMatch[] }> {
  const key = SERPAPI_KEY();
  if (!key) return { success: false };

  const base64 = extractBase64(imageDataUri);
  if (!base64) return { success: false };

  try {
    const params = new URLSearchParams({
      engine: 'google_lens',
      api_key: key,
      image_base64: base64.slice(0, MAX_BASE64_LEN),
      hl: 'en',
      country: 'pk',
    });

    const res = await fetch(`https://serpapi.com/search?${params}`, {
      signal: AbortSignal.timeout(15000),
    });

    if (!res.ok) return { success: false };

    const data: LensResult = await res.json();
    if (data.search_metadata?.status === 'error') return { success: false };

    const allItems = [
      ...(data.visual_matches || []),
      ...(data.shopping_results || []),
    ];

    if (!allItems.length) return { success: false };

    const deduped = new Map<string, SerpapiPriceMatch>();
    for (const item of allItems) {
      const link = item.link || '';
      if (deduped.has(link)) continue;

      const merchantInfo = identifyMerchantFromLink(link, item.source);
      if (!merchantInfo) continue;

      deduped.set(link, {
        title: item.title || '',
        merchant: merchantInfo.name,
        merchantDomain: merchantInfo.domains[0] || '',
        price: parsePriceRaw(item.price || '0'),
        imageUrl: item.thumbnail || '',
        productUrl: link,
        supportsCOD: merchantInfo.cod,
      });
    }

    const results = Array.from(deduped.values()).slice(0, 8);

    if (results.length === 0) {
      return fallbackShoppingSearch(query);
    }

    return { success: true, results };
  } catch (err) {
    console.warn('[Talashkaar] Lens error:', err instanceof Error ? err.message : err);
    return fallbackShoppingSearch(query);
  }
}

function identifyMerchantFromLink(link: string, source: string): PakistaniMerchant | null {
  let domain = '';
  try {
    domain = new URL(link).hostname.replace('www.', '');
  } catch {
    return identifyMerchant(source);
  }

  const byDomain = identifyMerchant(domain);
  if (byDomain) return byDomain;

  return identifyMerchant(source);
}

async function fallbackShoppingSearch(
  query: string
): Promise<{ success: boolean; results?: SerpapiPriceMatch[] }> {
  const key = SERPAPI_KEY();
  if (!key) return { success: false };

  try {
    const params = new URLSearchParams({
      engine: 'google_shopping',
      q: `${query} Pakistan`,
      api_key: key,
      num: '8',
      gl: 'pk',
      hl: 'en',
      google_domain: 'google.com.pk',
    });

    const res = await fetch(`https://serpapi.com/search?${params}`, {
      signal: AbortSignal.timeout(10000),
    });

    if (!res.ok) return { success: false };

    const data: SerpapiResult = await res.json();
    if (!data.shopping_results?.length) return { success: false };

    const results: SerpapiPriceMatch[] = [];
    for (const item of data.shopping_results) {
      const merchantInfo = identifyMerchantFromLink(item.link, item.source);
      results.push({
        title: item.title,
        merchant: merchantInfo?.name || item.source,
        merchantDomain: merchantInfo?.domains[0] || '',
        price: parsePriceRaw(item.price),
        imageUrl: item.thumbnail,
        productUrl: item.link,
        supportsCOD: merchantInfo?.cod ?? true,
      });
    }

    return { success: true, results };
  } catch (err) {
    console.warn('[Talashkaar] Fallback error:', err instanceof Error ? err.message : err);
    return { success: false };
  }
}

export async function searchWithTalashkaar(
  query: string,
  imageDataUri?: string
): Promise<{ success: boolean; results?: SerpapiPriceMatch[] }> {
  if (imageDataUri) {
    const lensResult = await searchGoogleLensPakistan(imageDataUri, query);
    if (lensResult.success) return lensResult;
  }
  return fallbackShoppingSearch(query);
}
