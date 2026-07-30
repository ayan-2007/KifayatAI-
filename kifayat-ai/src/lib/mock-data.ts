import type { ScanResult, ComparisonItem } from '@/types';
import { computeKifayatScore, computeVerdict, computeSavings, computeProductSimilarity } from './scoring';

const MOCK_PRODUCT_IMAGES = [
  'https://images.unsplash.com/photo-1576995853123-5a05d93c0?w=400&q=80',
  'https://images.unsplash.com/photo-1591047139829-d91aecb6caea?w=400&q=80',
  'https://images.unsplash.com/photo-1551028719-00167b16eac5?w=400&q=80',
  'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=400&q=80',
  'https://images.unsplash.com/photo-1606107557195-0e29a4b5b4aa?w=400&q=80',
  'https://images.unsplash.com/photo-1620799140408-edc6dcb6d633?w=400&q=80',
  'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=400&q=80',
  'https://images.unsplash.com/photo-1491553895911-0055eca6402d?w=400&q=80',
];

const CATEGORIES = [
  'Mobile Phone', 'Kurti', 'Sneakers', 'Perfume',
  'Wrist Watch', 'Leather Bag', 'LED TV', 'Cricket Bat'
];

const BRANDS: Record<string, string[]> = {
  'Mobile Phone': ['Samsung', 'Xiaomi', 'Infinix', 'Tecno', 'Oppo', 'Vivo', 'Realme', 'iPhone'],
  'Kurti': ['Sana Safinaz', 'Maria B', 'Nishat Linen', 'Limelight', 'Gul Ahmed', 'Alkaram', 'Bonanza'],
  'Sneakers': ['Servis', 'Borjan', 'Metro', 'Stylo', 'Lancer', 'Adidas', 'Nike'],
  'Perfume': ['J.', 'Scents', 'Bonanza', 'Sapphire', 'Lataffa', 'Armaf'],
  'Wrist Watch': ['Casio', 'Seiko', 'Fossil', 'Rado', 'Citizen', 'Tissot'],
  'Leather Bag': ['Sapphire', 'Jafferjees', 'Daachi', 'Insight', 'Bonanza'],
  'LED TV': ['Samsung', 'Sony', 'TCL', 'Changhong', 'Dawlance', 'Haier'],
  'Cricket Bat': ['CA', 'SS', 'Kookaburra', 'Gray-Nicolls', 'BDM'],
};

const FEATURES_LIST: Record<string, string[]> = {
  'Mobile Phone': ['Dual SIM', '5G Support', 'AMOLED Display', '5000mAh Battery', '108MP Camera', 'Fast Charging'],
  'Kurti': ['Cotton Fabric', 'Embroidered', 'Straight Cut', '3-Piece', 'Unstitched'],
  'Sneakers': ['Mesh Upper', 'Non-Slip Sole', 'Padded Collar', 'Lightweight', 'Lace-Up'],
  'Perfume': ['Eau de Parfum', 'Long Lasting', 'Woody Scent', '100ml', 'Gift Pack'],
  'Wrist Watch': ['Stainless Steel', 'Water Resistant', 'Quartz Movement', 'Leather Strap', 'Analog Display'],
  'Leather Bag': ['Genuine Leather', 'Gold Hardware', 'Multiple Compartments', 'Adjustable Strap'],
  'LED TV': ['4K UHD', 'Smart TV', 'HDR10+', 'Dolby Audio', '3 HDMI Ports'],
  'Cricket Bat': ['Grade 1 Willow', 'Kashmir Willow', 'Full Size', 'Toe Guard', 'Semi-Oval Handle'],
};

const MERCHANTS: Record<string, string[]> = {
  'Mobile Phone': ['Daraz', 'PriceOye', 'Shophive', 'Mega', 'Telemart'],
  'Kurti': ['Daraz', 'Sapphire', 'Gul Ahmed', 'Limelight', 'Bonanza'],
  'Sneakers': ['Daraz', 'Servis', 'Borjan', 'Metro', 'Stylo'],
  'Perfume': ['Daraz', 'Scents', 'PriceOye', 'iShopping'],
  'Wrist Watch': ['Daraz', 'PriceOye', 'Shophive', 'Mega'],
  'Leather Bag': ['Daraz', 'Sapphire', 'Jafferjees', 'Daachi'],
  'LED TV': ['Daraz', 'HomeShopping', 'Mega', 'PriceOye'],
  'Cricket Bat': ['Daraz', 'PriceOye', 'Shophive'],
};

const BASE_PRICES_PKR: Record<string, number> = {
  'Mobile Phone': 35000, 'Kurti': 3000, 'Sneakers': 5000, 'Perfume': 3500,
  'Wrist Watch': 12000, 'Leather Bag': 8000, 'LED TV': 75000, 'Cricket Bat': 5000,
};

const MERCHANT_DOMAINS: Record<string, string> = {
  'Daraz': 'daraz.pk', 'PriceOye': 'priceoye.pk', 'Shophive': 'shophive.pk',
  'Mega': 'mega.pk', 'Telemart': 'telemart.pk', 'Sapphire': 'sapphireonline.pk',
  'Gul Ahmed': 'gulahmedshop.com', 'Limelight': 'limelight.pk', 'Bonanza': 'bonanzagt.com',
  'Servis': 'servis.com.pk', 'Borjan': 'borjan.pk', 'Metro': 'metroshoes.com.pk',
  'Stylo': 'stylo.pk', 'Scents': 'scents.com.pk', 'iShopping': 'ishop.pk',
  'Jafferjees': 'jafferjees.com', 'Daachi': 'daachi.com.pk', 'HomeShopping': 'homeshopping.pk',
};

export async function generateMockResult(
  imageData: string,
  askingPrice: number,
  details?: string
): Promise<ScanResult> {
  const seed = Math.random();
  const categoryIndex = Math.floor(seed * CATEGORIES.length);
  const category = CATEGORIES[categoryIndex];
  const brandPool = BRANDS[category] || ['Unknown'];
  const brand = brandPool[Math.floor(Math.random() * brandPool.length)];
  const features = FEATURES_LIST[category] || ['Detected item'];

  const basePrice = BASE_PRICES_PKR[category] || 2000;
  const variance = Math.round((Math.random() - 0.5) * basePrice * 0.4);
  const averageWebPrice = Math.max(1, basePrice + variance);

  const kifayatScore = computeKifayatScore(askingPrice, averageWebPrice);
  const verdict = computeVerdict(kifayatScore);
  const { savingsAmount, savingsPercentage } = computeSavings(askingPrice, averageWebPrice);

  const categoryMerchants = MERCHANTS[category] || ['Daraz'];
  const comparisons: ComparisonItem[] = Array.from({ length: 5 }, (_, i) => {
    const priceOffset = Math.round((Math.random() - 0.3) * averageWebPrice * 0.2);
    const compPrice = Math.max(1, averageWebPrice + priceOffset);
    const merchant = categoryMerchants[i % categoryMerchants.length];
    const compTitle = `${brand} ${category}`;

    return {
      id: `comp-${i}`,
      title: compTitle,
      merchant,
      merchantDomain: MERCHANT_DOMAINS[merchant] || `${merchant.toLowerCase().replace(/\s+/g, '')}.pk`,
      price: compPrice,
      imageUrl: MOCK_PRODUCT_IMAGES[(categoryIndex + i) % MOCK_PRODUCT_IMAGES.length],
      productUrl: '#',
      similarityScore: computeProductSimilarity(compTitle, brand, '', category, features),
      isLowerPrice: compPrice < askingPrice,
      dataSource: 'estimated',
      supportsCOD: true,
    };
  });

  return {
    id: `scan-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
    timestamp: Date.now(),
    imageData,
    askingPrice,
    kifayatScore,
    category,
    brand,
    exactModel: '',
    features,
    averageWebPrice,
    savingsAmount,
    savingsPercentage,
    verdict,
    comparisons,
    details,
    confidence: 'low',
    dataSource: 'estimated',
    webPriceCount: 5,
    groqRawAnalysis: '',
  };
}
