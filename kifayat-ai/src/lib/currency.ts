import type { CurrencyCode } from '@/types';

export const COUNTRY_MAP: Record<CurrencyCode, string> = {
  USD: 'us',
  PKR: 'pk',
  INR: 'in',
  EUR: 'de',
  GBP: 'gb',
  AED: 'ae',
};

export const LOCALE_MAP: Record<CurrencyCode, string> = {
  USD: 'en-US',
  PKR: 'ur-PK',
  INR: 'hi-IN',
  EUR: 'de-DE',
  GBP: 'en-GB',
  AED: 'ar-AE',
};

const FALLBACK_RATES: Record<string, number> = {
  USD: 1, PKR: 280, INR: 83, EUR: 0.92, GBP: 0.79, AED: 3.67,
};

let ratesCache: { rates: Record<string, number>; timestamp: number } | null = null;
const CACHE_TTL = 3_600_000;

export async function loadExchangeRates(): Promise<Record<string, number>> {
  if (ratesCache && Date.now() - ratesCache.timestamp < CACHE_TTL) {
    return ratesCache.rates;
  }
  try {
    const res = await fetch('https://open.er-api.com/v6/latest/USD', {
      signal: AbortSignal.timeout(5000),
    });
    const data = await res.json();
    if (data?.rates && typeof data.rates === 'object') {
      ratesCache = { rates: { ...FALLBACK_RATES, ...data.rates }, timestamp: Date.now() };
      return ratesCache.rates;
    }
  } catch {}
  ratesCache = { rates: FALLBACK_RATES, timestamp: Date.now() };
  return FALLBACK_RATES;
}

export async function convertPrice(
  amount: number,
  from: CurrencyCode,
  to: CurrencyCode
): Promise<number> {
  if (from === to) return amount;
  const rates = await loadExchangeRates();
  const inUsd = amount / (rates[from] ?? 1);
  return inUsd * (rates[to] ?? 1);
}

export function formatPrice(amount: number, currency: CurrencyCode): string {
  try {
    return new Intl.NumberFormat(LOCALE_MAP[currency], {
      style: 'currency',
      currency,
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(amount);
  } catch {
    const sym = { USD: '$', PKR: '₨', INR: '₹', EUR: '€', GBP: '£', AED: 'د.إ' }[currency] ?? '$';
    return `${sym}${amount.toFixed(2)}`;
  }
}

export function getCurrencySymbol(currency: CurrencyCode): string {
  return { USD: '$', PKR: '₨', INR: '₹', EUR: '€', GBP: '£', AED: 'د.إ' }[currency] ?? '$';
}

export function parsePriceRaw(raw: string): number {
  let cleaned = raw.replace(/[^0-9.,]/g, '').trim();
  if (!cleaned) return 0;

  const dots = (cleaned.match(/\./g) || []).length;
  const commas = (cleaned.match(/,/g) || []).length;

  if (dots > 0 && commas > 0) {
    const lastComma = cleaned.lastIndexOf(',');
    const lastDot = cleaned.lastIndexOf('.');
    if (lastDot < lastComma) {
      cleaned = cleaned.replace(/\./g, '').replace(',', '.');
    } else {
      cleaned = cleaned.replace(/,/g, '');
    }
  } else if (commas > 0) {
    const parts = cleaned.split(',');
    if (parts.length === 2 && parts[1].length <= 2) {
      cleaned = cleaned.replace(',', '.');
    } else {
      cleaned = cleaned.replace(/,/g, '');
    }
  }

  cleaned = cleaned.replace(/,/g, '');
  const num = parseFloat(cleaned);
  return isNaN(num) ? 0 : num;
}
