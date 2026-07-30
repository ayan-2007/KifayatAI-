export type CurrencyCode = 'PKR';

export type DataSource = 'ai_vision_plus_web' | 'ai_vision' | 'web' | 'estimated';

export type Confidence = 'high' | 'medium' | 'low';

export interface ComparisonItem {
  id: string;
  title: string;
  merchant: string;
  merchantDomain: string;
  price: number;
  imageUrl: string;
  productUrl: string;
  similarityScore: number;
  isLowerPrice: boolean;
  dataSource: DataSource;
  supportsCOD: boolean;
}

export interface ScanResult {
  id: string;
  timestamp: number;
  imageData: string;
  askingPrice: number;
  kifayatScore: number;
  category: string;
  brand: string;
  exactModel: string;
  features: string[];
  averageWebPrice: number;
  savingsAmount: number;
  savingsPercentage: number;
  verdict: 'must_buy' | 'fair_value' | 'overpriced';
  comparisons: ComparisonItem[];
  details?: string;
  confidence: Confidence;
  dataSource: DataSource;
  webPriceCount: number;
  groqRawAnalysis: string;
}

export type ScanState = 'idle' | 'uploading' | 'analyzing' | 'complete' | 'error';
