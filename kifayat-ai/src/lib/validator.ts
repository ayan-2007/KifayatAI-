import type { ScanResult, Confidence, DataSource, CurrencyCode, ComparisonItem } from '@/types';

const CATEGORY_PRICE_RANGES: Record<string, { min: number; max: number; currency: CurrencyCode }> = {
  'Smartwatch': { min: 20, max: 2000, currency: 'USD' },
  'Handbag': { min: 15, max: 5000, currency: 'USD' },
  'Sunglasses': { min: 5, max: 1000, currency: 'USD' },
  'Sneakers': { min: 15, max: 2000, currency: 'USD' },
  'Shoes': { min: 15, max: 2000, currency: 'USD' },
  'Jacket': { min: 20, max: 3000, currency: 'USD' },
  'Blazer': { min: 20, max: 3000, currency: 'USD' },
  'T-Shirt': { min: 3, max: 500, currency: 'USD' },
  'Sweater': { min: 10, max: 1500, currency: 'USD' },
  'Watch': { min: 10, max: 50000, currency: 'USD' },
  'Bag': { min: 10, max: 5000, currency: 'USD' },
  'Backpack': { min: 10, max: 500, currency: 'USD' },
  'Headphones': { min: 10, max: 1000, currency: 'USD' },
  'Phone': { min: 50, max: 3000, currency: 'USD' },
  'Laptop': { min: 150, max: 5000, currency: 'USD' },
  'Tablet': { min: 50, max: 3000, currency: 'USD' },
  'Camera': { min: 50, max: 10000, currency: 'USD' },
  'Shoe': { min: 15, max: 2000, currency: 'USD' },
  'Dress': { min: 10, max: 3000, currency: 'USD' },
  'Shirt': { min: 5, max: 1000, currency: 'USD' },
  'Jeans': { min: 10, max: 1000, currency: 'USD' },
};

const US_DOLLAR_REF_RATES: Record<CurrencyCode, number> = {
  USD: 1, PKR: 280, INR: 83, EUR: 0.92, GBP: 0.79, AED: 3.67,
};

function findPriceRange(category: string, currency: CurrencyCode): { min: number; max: number } | null {
  if (!category || category === 'Product') return null;

  for (const [key, range] of Object.entries(CATEGORY_PRICE_RANGES)) {
    if (category.toLowerCase().includes(key.toLowerCase())) {
      const rate = US_DOLLAR_REF_RATES[currency] ?? 1;
      const toUsd = US_DOLLAR_REF_RATES[range.currency] ?? 1;
      return {
        min: Math.round(range.min * rate / toUsd * 0.3),
        max: Math.round(range.max * rate / toUsd * 3),
      };
    }
  }
  return null;
}

export function validatePriceAgainstCategory(
  price: number,
  category: string,
  currency: CurrencyCode
): { valid: boolean; reason?: string } {
  const range = findPriceRange(category, currency);
  if (!range) return { valid: true };
  if (price <= 0) return { valid: false, reason: 'Price must be greater than zero' };
  if (price < range.min * 0.5 && price < 5) return { valid: false, reason: `Price seems too low for a ${category}` };
  if (price > range.max * 3) return { valid: false, reason: `Price seems unreasonably high for a ${category}` };
  return { valid: true };
}

export function assessConfidence(
  groqSuccess: boolean,
  serpSuccess: boolean,
  comparisonCount: number,
  priceRangeValid: boolean
): { confidence: Confidence; dataSource: DataSource } {
  if (groqSuccess && serpSuccess && comparisonCount >= 2 && priceRangeValid) {
    return { confidence: 'high', dataSource: 'ai_vision_plus_web' };
  }
  if (groqSuccess && serpSuccess) {
    return { confidence: 'medium', dataSource: 'ai_vision_plus_web' };
  }
  if (groqSuccess && priceRangeValid) {
    return { confidence: 'medium', dataSource: 'ai_vision' };
  }
  if (serpSuccess && comparisonCount >= 2) {
    return { confidence: 'medium', dataSource: 'web' };
  }
  return { confidence: 'low', dataSource: 'estimated' };
}

export function sanitizeCategoryBrand(
  category: string | undefined,
  brand: string | undefined
): { category: string; brand: string } {
  const clean = (s: string | undefined) => {
    if (!s || s === 'Unknown' || s === 'Product') return undefined;
    return s.trim().slice(0, 50).replace(/[<>"']/g, '');
  };
  return {
    category: clean(category) || 'Product',
    brand: clean(brand) || 'Unknown',
  };
}
