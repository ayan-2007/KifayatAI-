export function rejectOutliers(prices: number[]): number[] {
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

export function computeProductSimilarity(
  title: string,
  brand: string,
  exactModel: string,
  category: string,
  features: string[]
): number {
  const lowerTitle = title.toLowerCase();
  let score = 0;
  const reasons: string[] = [];

  if (brand && brand !== 'Unknown' && lowerTitle.includes(brand.toLowerCase())) {
    score += 35;
    reasons.push('brand');
  }

  if (exactModel && exactModel.length > 2) {
    const modelWords = exactModel.toLowerCase().split(/[\s,/-]+/).filter(w => w.length > 1);
    const matches = modelWords.filter(w => lowerTitle.includes(w));
    const ratio = modelWords.length > 0 ? matches.length / modelWords.length : 0;
    score += Math.round(ratio * 35);
    if (ratio >= 0.8) reasons.push('exactModel');
    else if (ratio >= 0.5) reasons.push('partialModel');
  }

  if (category && category !== 'Product') {
    const catWords = category.toLowerCase().split(/\s+/).filter(w => w.length > 2);
    const catMatches = catWords.filter(w => lowerTitle.includes(w));
    const catRatio = catWords.length > 0 ? catMatches.length / catWords.length : 0;
    score += Math.round(catRatio * 20);
    if (catRatio >= 0.8) reasons.push('category');
  }

  if (features.length > 0) {
    const featureMatches = features.filter(f =>
      f.length > 3 && lowerTitle.includes(f.toLowerCase())
    );
    score += Math.round((featureMatches.length / Math.min(features.length, 4)) * 10);
  }

  return Math.min(100, Math.max(0, score));
}

export function isSufficientlySimilar(score: number): boolean {
  return score >= 80;
}
