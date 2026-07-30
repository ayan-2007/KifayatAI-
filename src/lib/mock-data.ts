import type { ScanResult } from '@/types';

export async function generateMockResult(
  imageData: string,
  askingPrice: number,
  details?: string
): Promise<ScanResult> {
  return {
    id: `scan-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
    timestamp: Date.now(),
    imageData,
    askingPrice,
    kifayatScore: 50,
    category: 'Product',
    brand: 'Unknown',
    exactModel: '',
    features: [],
    averageWebPrice: 0,
    savingsAmount: 0,
    savingsPercentage: 0,
    verdict: 'fair_value',
    comparisons: [],
    details,
    confidence: 'low',
    dataSource: 'estimated',
    webPriceCount: 0,
    groqRawAnalysis: '',
  };
}
