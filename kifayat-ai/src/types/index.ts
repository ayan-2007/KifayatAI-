export type CurrencyCode = 'USD' | 'PKR' | 'INR' | 'EUR' | 'GBP' | 'AED';

export type DataSource = 'ai_vision_plus_web' | 'ai_vision' | 'web' | 'estimated';

export type Confidence = 'high' | 'medium' | 'low';

export interface ComparisonItem {
  id: string;
  title: string;
  merchant: string;
  price: number;
  currency: CurrencyCode;
  imageUrl: string;
  productUrl: string;
  similarityScore: number;
  isLowerPrice: boolean;
  dataSource: DataSource;
}

export interface ScanResult {
  id: string;
  timestamp: number;
  imageData: string;
  askingPrice: number;
  currency: CurrencyCode;
  kifayatScore: number;
  category: string;
  brand: string;
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
}

export type ScanState = 'idle' | 'uploading' | 'analyzing' | 'complete' | 'error';

export interface CurrencyInfo {
  code: CurrencyCode;
  symbol: string;
  label: string;
  flag: string;
}

export const CURRENCIES: CurrencyInfo[] = [
  { code: 'USD', symbol: '$', label: 'US Dollar', flag: '🇺🇸' },
  { code: 'PKR', symbol: '₨', label: 'Pakistani Rupee', flag: '🇵🇰' },
  { code: 'INR', symbol: '₹', label: 'Indian Rupee', flag: '🇮🇳' },
  { code: 'EUR', symbol: '€', label: 'Euro', flag: '🇪🇺' },
  { code: 'GBP', symbol: '£', label: 'British Pound', flag: '🇬🇧' },
  { code: 'AED', symbol: 'د.إ', label: 'UAE Dirham', flag: '🇦🇪' },
];
