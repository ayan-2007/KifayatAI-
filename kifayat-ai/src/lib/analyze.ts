import type { ScanResult, ComparisonItem, CurrencyCode, DataSource } from '@/types';
import { analyzeWithBina } from './apis/groq';
import { searchWithTalashkaar, searchWithTalashkaarFallback } from './apis/serpapi';
import { convertPrice, getCurrencySymbol } from './currency';
import { computeAverageWebPrice, computeKifayatScore, computeVerdict, computeSavings, computeSimilarityScore } from './scoring';
import { validatePriceAgainstCategory, assessConfidence, sanitizeCategoryBrand } from './validator';
import { generateMockResult } from './mock-data';

interface AnalyzeOptions {
  imageData: string;
  askingPrice: number;
  currency: CurrencyCode;
  details?: string;
}

export async function analyzeProduct(options: AnalyzeOptions): Promise<ScanResult> {
  const { imageData, askingPrice, currency, details } = options;

  const searchQuery = details || 'product';

  const binaResult = await analyzeWithBina(imageData, details);
  const { category, brand } = sanitizeCategoryBrand(binaResult.category, binaResult.brand);
  const features = binaResult.features?.length ? binaResult.features : [];

  if (binaResult.success) {
    console.log('[Rehnuma] Bina (vision) analysis succeeded');

    const talashkaarResult = await searchWithTalashkaar(
      `${brand !== 'Unknown' ? brand : ''} ${category !== 'Product' ? category : searchQuery}`,
      currency
    );

    if (talashkaarResult.success && talashkaarResult.results && talashkaarResult.results.length > 0) {
      console.log('[Rehnuma] Talashkaar (web search) succeeded');
      return buildResult(
        imageData, askingPrice, currency, details,
        category, brand, features, binaResult.estimatedPrice,
        talashkaarResult.results, true, true
      );
    }

    console.log('[Rehnuma] Talashkaar failed, trying fallback to USD');
    const usFallback = await searchWithTalashkaarFallback(
      `${brand !== 'Unknown' ? brand : ''} ${category !== 'Product' ? category : searchQuery}`
    );

    if (usFallback.success && usFallback.results && usFallback.results.length > 0) {
      const converted = await convertSerpResults(usFallback.results, 'USD', currency);
      console.log('[Rehnuma] Fallback Talashkaar with conversion succeeded');
      return buildResult(
        imageData, askingPrice, currency, details,
        category, brand, features, binaResult.estimatedPrice,
        converted, true, false
      );
    }

    console.log('[Rehnuma] Talashkaar completely failed, using Bina estimates');
    return buildResult(
      imageData, askingPrice, currency, details,
      category, brand, features, binaResult.estimatedPrice,
      undefined, true, false
    );
  }

  console.log('[Rehnuma] Bina failed, trying Talashkaar alone');
  const talashkaarAlone = await searchWithTalashkaar(searchQuery, currency);

  if (talashkaarAlone.success && talashkaarAlone.results && talashkaarAlone.results.length > 0) {
    console.log('[Rehnuma] Talashkaar standalone succeeded');
    return buildResult(
      imageData, askingPrice, currency, details,
      'Product', 'Unknown', [], undefined,
      talashkaarAlone.results, false, true
    );
  }

  const usFallbackAlone = await searchWithTalashkaarFallback(searchQuery);
  if (usFallbackAlone.success && usFallbackAlone.results && usFallbackAlone.results.length > 0) {
    const converted = await convertSerpResults(usFallbackAlone.results, 'USD', currency);
    console.log('[Rehnuma] Fallback Talashkaar standalone with conversion');
    return buildResult(
      imageData, askingPrice, currency, details,
      'Product', 'Unknown', [], undefined,
      converted, false, false
    );
  }

  console.log('[Rehnuma] All APIs failed, using estimated mock data');
  return generateMockResult(imageData, askingPrice, currency, details);
}

async function convertSerpResults(
  results: { title: string; merchant: string; price: number; priceRaw: string; imageUrl: string; productUrl: string }[],
  from: CurrencyCode,
  to: CurrencyCode
): Promise<{ title: string; merchant: string; price: number; priceRaw: string; imageUrl: string; productUrl: string }[]> {
  if (from === to) return results;
  return Promise.all(results.map(async (r) => ({
    ...r,
    price: await convertPrice(r.price, from, to),
  })));
}

function buildResult(
  imageData: string,
  askingPrice: number,
  currency: CurrencyCode,
  details: string | undefined,
  category: string,
  brand: string,
  features: string[],
  estimatedPrice: number | undefined,
  webResults: { title: string; merchant: string; price: number; priceRaw?: string; imageUrl: string; productUrl: string }[] | undefined,
  groqSuccess: boolean,
  serpSuccess: boolean
): ScanResult {
  const priceRangeValid = validatePriceAgainstCategory(askingPrice, category, currency).valid;

  const webPrices = webResults?.map(r => r.price) || [];
  const averageWebPrice = webPrices.length > 0
    ? computeAverageWebPrice(webPrices)
    : estimatedPrice
      ? Math.round(estimatedPrice * (currency === 'USD' ? 1 :
          currency === 'PKR' ? 280 : currency === 'INR' ? 83 :
          currency === 'EUR' ? 1 : currency === 'GBP' ? 0.79 : 3.67))
      : Math.round(askingPrice * 0.85);

  const kifayatScore = computeKifayatScore(askingPrice, averageWebPrice);
  const verdict = computeVerdict(kifayatScore);
  const { savingsAmount, savingsPercentage } = computeSavings(askingPrice, averageWebPrice);
  const { confidence, dataSource } = assessConfidence(groqSuccess, serpSuccess, webPrices.length, priceRangeValid);

  const comparisons: ComparisonItem[] = (webResults || []).map((r, i) => {
    const isLower = r.price < askingPrice;
    const simScore = computeSimilarityScore(r.title, brand, category);
    return {
      id: `web-${i}`,
      title: r.title,
      merchant: r.merchant,
      price: Math.round(r.price * 100) / 100,
      currency,
      imageUrl: r.imageUrl,
      productUrl: r.productUrl,
      similarityScore: simScore,
      isLowerPrice: isLower,
      dataSource,
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
    features: features.length ? features : ['Detected item'],
    averageWebPrice,
    savingsAmount,
    savingsPercentage,
    verdict,
    comparisons,
    details,
    confidence,
    dataSource,
    webPriceCount: webPrices.length,
  };
}
