import type { ComparisonItem } from '@/types';

function rejectOutliers(prices: number[]): number[] {
  if (prices.length <= 2) return prices;
  const sorted = [...prices].sort((a, b) => a - b);
  const q1Idx = Math.floor(sorted.length * 0.25);
  const q3Idx = Math.floor(sorted.length * 0.75);
  return sorted.slice(q1Idx, q3Idx + 1);
}

export function computeAverageWebPrice(prices: number[]): number {
  const filtered = rejectOutliers(prices);
  if (filtered.length === 0) return 0;
  return Math.round(filtered.reduce((s, p) => s + p, 0) / filtered.length);
}

export function computeKifayatScore(askingPrice: number, averageWebPrice: number): number {
  if (averageWebPrice <= 0) return 50;
  const priceRatio = askingPrice / averageWebPrice;

  let score: number;
  if (priceRatio <= 0.7) {
    score = Math.min(100, Math.round(80 + (1 - priceRatio / 0.7) * 20));
  } else if (priceRatio <= 1.0) {
    score = Math.round(50 + (1 - (priceRatio - 0.7) / 0.3) * 30);
  } else if (priceRatio <= 1.3) {
    score = Math.round(30 + (1 - (priceRatio - 1.0) / 0.3) * 20);
  } else {
    score = Math.max(0, Math.round(30 - (priceRatio - 1.3) / 0.3 * 30));
  }
  return Math.max(0, Math.min(100, score));
}

export function computeVerdict(score: number): 'must_buy' | 'fair_value' | 'overpriced' {
  if (score >= 80) return 'must_buy';
  if (score >= 50) return 'fair_value';
  return 'overpriced';
}

export function computeSavings(askingPrice: number, averageWebPrice: number): {
  savingsAmount: number;
  savingsPercentage: number;
} {
  const savingsAmount = Math.max(0, averageWebPrice - askingPrice);
  const savingsPercentage = averageWebPrice > 0
    ? Math.round((savingsAmount / averageWebPrice) * 100)
    : 0;
  return { savingsAmount, savingsPercentage };
}

export function computeSimilarityScore(
  title: string,
  brand: string,
  category: string
): number {
  const lower = title.toLowerCase();
  let matches = 0;
  if (brand && brand !== 'Unknown' && lower.includes(brand.toLowerCase())) matches += 40;
  if (category && lower.includes(category.toLowerCase())) matches += 30;

  const modelWords = title.split(/\s+/).filter(w => w.length > 3);
  const catWords = category.split(/\s+/).filter(w => w.length > 3);
  const matchCount = catWords.filter(w => lower.includes(w.toLowerCase())).length;
  matches += catWords.length > 0 ? (matchCount / catWords.length) * 30 : 0;

  return Math.min(99, Math.max(50, matches));
}
