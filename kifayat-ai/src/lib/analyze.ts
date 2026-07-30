import type { ScanResult, ComparisonItem } from '@/types';
import { analyzeWithBina } from './apis/groq';
import { searchWithTalashkaar } from './apis/serpapi';
import { computeAverageWebPrice, computeKifayatScore, computeVerdict, computeSavings, computeProductSimilarity, isSufficientlySimilar } from './scoring';
import { validatePriceAgainstCategory, assessConfidence, sanitizeCategoryBrand } from './validator';
import { generateMockResult } from './mock-data';

interface AnalyzeOptions {
  imageData: string;
  askingPrice: number;
  details?: string;
}

export async function analyzeProduct(options: AnalyzeOptions): Promise<ScanResult> {
  const { imageData, askingPrice, details } = options;

  const binaResult = await analyzeWithBina(imageData, details);
  const { category, brand } = sanitizeCategoryBrand(binaResult.category, binaResult.brand);
  const exactModel = binaResult.exactModel || '';
  const features = binaResult.features?.length ? binaResult.features : [];
  const groqRawAnalysis = binaResult.rawAnalysis || '';

  if (binaResult.success) {
    console.log('[Rehnuma] Bina vision analysis succeeded');

    const searchTerms = [brand !== 'Unknown' ? brand : '', exactModel, category !== 'Product' ? category : '']
      .filter(Boolean)
      .join(' ');

    const talashkaarResult = await searchWithTalashkaar(searchTerms || details || 'product', imageData);

    if (talashkaarResult.success && talashkaarResult.results && talashkaarResult.results.length > 0) {
      console.log('[Rehnuma] Talashkaar search succeeded');

      const scored = talashkaarResult.results.map(r => ({
        ...r,
        similarityScore: computeProductSimilarity(r.title, brand, exactModel, category, features),
      }));

      const highSimilarity = scored.filter(r => isSufficientlySimilar(r.similarityScore));
      console.log(`[Rehnuma] ${highSimilarity.length}/${scored.length} results >= 80% similar`);

      const workingSet = highSimilarity.length >= 2 ? highSimilarity : scored;

      return buildResult(
        imageData, askingPrice, details,
        category, brand, exactModel, features, binaResult.estimatedPrice,
        workingSet, true, true, groqRawAnalysis
      );
    }

    console.log('[Rehnuma] Talashkaar failed, using Bina estimates only');
    return buildResult(
      imageData, askingPrice, details,
      category, brand, exactModel, features, binaResult.estimatedPrice,
      undefined, true, false, groqRawAnalysis
    );
  }

  console.log('[Rehnuma] Bina failed, trying Talashkaar alone');
  const talashkaarAlone = await searchWithTalashkaar(details || 'product', imageData);

  if (talashkaarAlone.success && talashkaarAlone.results && talashkaarAlone.results.length > 0) {
    console.log('[Rehnuma] Talashkaar standalone succeeded');
    const scored = talashkaarAlone.results.map(r => ({
      ...r,
      similarityScore: computeProductSimilarity(r.title, '', '', details || 'Product', []),
    }));

    return buildResult(
      imageData, askingPrice, details,
      'Product', 'Unknown', '', [], undefined,
      scored, false, true, ''
    );
  }

  console.log('[Rehnuma] All APIs failed, using estimated mock data');
  return generateMockResult(imageData, askingPrice, details);
}

function buildResult(
  imageData: string,
  askingPrice: number,
  details: string | undefined,
  category: string,
  brand: string,
  exactModel: string,
  features: string[],
  estimatedPrice: number | undefined,
  webResults: {
    title: string; merchant: string; merchantDomain: string;
    price: number; imageUrl: string; productUrl: string;
    supportsCOD: boolean; similarityScore: number;
  }[] | undefined,
  groqSuccess: boolean,
  serpSuccess: boolean,
  groqRawAnalysis: string
): ScanResult {
  const priceRangeValid = validatePriceAgainstCategory(askingPrice, category).valid;

  const webPrices = webResults?.map(r => r.price) || [];
  const webSimilarityPass = webResults ? webResults.filter(r => isSufficientlySimilar(r.similarityScore)).length : 0;

  const averageWebPrice = webPrices.length > 0
    ? computeAverageWebPrice(webPrices)
    : estimatedPrice
      ? Math.round(estimatedPrice)
      : Math.round(askingPrice * 0.85);

  const kifayatScore = computeKifayatScore(askingPrice, averageWebPrice);
  const verdict = computeVerdict(kifayatScore);
  const { savingsAmount, savingsPercentage } = computeSavings(askingPrice, averageWebPrice);
  const { confidence, dataSource } = assessConfidence(
    groqSuccess, serpSuccess, webPrices.length, webSimilarityPass, priceRangeValid
  );

  const comparisons: ComparisonItem[] = (webResults || []).map((r, i) => ({
    id: `web-${i}`,
    title: r.title,
    merchant: r.merchant,
    merchantDomain: r.merchantDomain,
    price: Math.round(r.price),
    imageUrl: r.imageUrl,
    productUrl: r.productUrl,
    similarityScore: r.similarityScore,
    isLowerPrice: r.price < askingPrice,
    dataSource,
    supportsCOD: r.supportsCOD,
  }));

  return {
    id: `scan-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
    timestamp: Date.now(),
    imageData,
    askingPrice,
    kifayatScore,
    category,
    brand,
    exactModel,
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
    groqRawAnalysis,
  };
}
