import type { ScanResult, CurrencyCode, ComparisonItem, DataSource } from '@/types';
import { getCurrencySymbol, convertPrice } from './currency';
import { computeKifayatScore, computeVerdict, computeSavings, computeSimilarityScore } from './scoring';

const MOCK_PRODUCT_IMAGES = [
  'https://images.unsplash.com/photo-1576995853123-5a10305d93c0?w=400&q=80',
  'https://images.unsplash.com/photo-1591047139829-d91aecb6caea?w=400&q=80',
  'https://images.unsplash.com/photo-1551028719-00167b16eac5?w=400&q=80',
  'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=400&q=80',
  'https://images.unsplash.com/photo-1608238628129-62f3f5f27e01?w=400&q=80',
  'https://images.unsplash.com/photo-1606107557195-0e29a4b5b4aa?w=400&q=80',
  'https://images.unsplash.com/photo-1583743814966-8936f5b7be1a?w=400&q=80',
  'https://images.unsplash.com/photo-1576566588028-4147f3842f27?w=400&q=80',
];

const MERCHANTS = ['Amazon', 'eBay', 'ASOS', 'Poshmark', 'Zalando', 'Myntra', 'Daraz', 'Noon'];
const CATEGORIES = ["Men's Denim Jacket", "Women's Blazer", 'Casual Sneakers', 'Leather Handbag', "Cotton T-Shirt", 'Wool Sweater', 'Smartwatch', 'Sunglasses'];
const BRANDS = ["Levi's", 'Zara', 'Nike', 'Michael Kors', 'H&M', 'Uniqlo', 'Apple', 'Ray-Ban'];
const FEATURES_LIST: Record<string, string[]> = {
  "Men's Denim Jacket": ['Oversized Fit', 'Distressed Vintage Finish', 'Classic Blue Wash', 'Button Closure', 'Chest Pockets'],
  "Women's Blazer": ['Tailored Fit', 'Notch Lapel', 'Double-Breasted', 'Pockets', 'Stretch Fabric'],
  'Casual Sneakers': ['Low-Top Design', 'Breathable Mesh', 'Rubber Sole', 'Padded Collar', 'Lace-Up Closure'],
  'Leather Handbag': ['Genuine Leather', 'Gold Hardware', 'Top Zip Closure', 'Adjustable Strap', 'Interior Pockets'],
  "Cotton T-Shirt": ['Crew Neck', '100% Organic Cotton', 'Relaxed Fit', 'Short Sleeve', 'Ribbed Collar'],
  'Wool Sweater': ['Knit Pattern', 'Turtleneck', 'Ribbed Cuffs', 'Merino Wool', 'Relaxed Fit'],
  'Smartwatch': ['AMOLED Display', 'Heart Rate Monitor', 'GPS Tracking', 'Water Resistant', '7-Day Battery'],
  'Sunglasses': ['Polarized Lenses', 'Gold Frame', 'UV400 Protection', 'Cat-Eye Shape', 'Spring Hinges'],
};

const BASE_PRICES_USD: Record<string, number> = {
  'Smartwatch': 250, 'Leather Handbag': 200, 'Sunglasses': 150,
  'Casual Sneakers': 120, "Women's Blazer": 90, "Men's Denim Jacket": 80,
  'Wool Sweater': 70, "Cotton T-Shirt": 30,
};

const US_DOLLAR_REF: Record<CurrencyCode, number> = {
  USD: 1, PKR: 280, INR: 83, EUR: 0.92, GBP: 0.79, AED: 3.67,
};

export async function generateMockResult(
  imageData: string,
  askingPrice: number,
  currency: CurrencyCode,
  details?: string
): Promise<ScanResult> {
  const seed = Math.random();
  const categoryIndex = Math.floor(seed * CATEGORIES.length);
  const category = CATEGORIES[categoryIndex];
  const brand = BRANDS[categoryIndex];
  const features = FEATURES_LIST[category] || FEATURES_LIST[CATEGORIES[0]];

  const baseUsd = BASE_PRICES_USD[category] || 50;
  const usdRate = US_DOLLAR_REF[currency] || 1;
  const baseInCurrency = Math.round(baseUsd * usdRate);
  const variance = Math.round((Math.random() - 0.5) * baseInCurrency * 0.3);
  const averageWebPrice = Math.max(1, baseInCurrency + variance);

  const kifayatScore = computeKifayatScore(askingPrice, averageWebPrice);
  const verdict = computeVerdict(kifayatScore);
  const { savingsAmount, savingsPercentage } = computeSavings(askingPrice, averageWebPrice);

  const comparisons: ComparisonItem[] = Array.from({ length: 6 }, (_, i) => {
    const priceOffset = Math.round((Math.random() - 0.3) * averageWebPrice * 0.2);
    const compPrice = Math.max(1, averageWebPrice + priceOffset);
    const compTitle = `${brand} ${category}`;
    return {
      id: `comp-${i}`,
      title: compTitle,
      merchant: MERCHANTS[(categoryIndex + i) % MERCHANTS.length],
      price: compPrice,
      currency,
      imageUrl: MOCK_PRODUCT_IMAGES[(categoryIndex + i) % MOCK_PRODUCT_IMAGES.length],
      productUrl: '#',
      similarityScore: computeSimilarityScore(compTitle, brand, category),
      isLowerPrice: compPrice < askingPrice,
      dataSource: 'estimated' as DataSource,
    };
  });

  return {
    id: `scan-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
    timestamp: Date.now(),
    imageData,
    askingPrice,
    currency,
    kifayatScore,
    category,
    brand,
    features,
    averageWebPrice,
    savingsAmount,
    savingsPercentage,
    verdict,
    comparisons,
    details,
    confidence: 'low',
    dataSource: 'estimated',
    webPriceCount: 6,
  };
}
