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
  'https://images.unsplash.com/photo-1597528662465-55ece5734101?w=400&q=80',
  'https://images.unsplash.com/photo-1553408227-2340e234bcea?w=400&q=80',
  'https://images.unsplash.com/photo-1619508423646-21ed67ae6d1d?w=400&q=80',
  'https://images.unsplash.com/photo-1588501430641-9f1c18c3b85b?w=400&q=80',
];

const CATEGORIES = [
  'Mobile Phone', 'Kurti', 'Sneakers', 'Perfume',
  'Wrist Watch', 'Leather Bag', 'LED TV', 'Cricket Bat',
  'Arduino', 'ESP32', 'Sensor Module', 'Motor Driver',
  'Raspberry Pi', 'Power Module', 'Soldering Iron',
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
  'Arduino': ['Arduino', 'Elegoo', 'Keyestudio', 'DFRobot', 'Seeed Studio'],
  'ESP32': ['Espressif', 'NodeMCU', 'Lolin', 'TinyPICO', 'MH ET Live'],
  'Sensor Module': ['DHT', 'HC-SR04', 'MQ', 'BMP280', 'MPU6050', 'MAX30102', 'BH1750', 'DS18B20'],
  'Motor Driver': ['L298N', 'L293D', 'A4988', 'DRV8825', 'TB6600', 'BTS7960'],
  'Raspberry Pi': ['Raspberry Pi', 'Orange Pi', 'Banana Pi', 'NVIDIA Jetson'],
  'Power Module': ['LM2596', 'XL4015', 'TP4056', 'LM317', 'AMS1117', 'MT3608'],
  'Soldering Iron': ['Bakon', 'Quicko', 'TS100', 'KSGER', 'YiHua', 'Hakko'],
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
  'Arduino': ['ATmega328P', 'USB Interface', '14 Digital I/O Pins', '6 Analog Inputs', '16MHz Clock'],
  'ESP32': ['Dual Core', 'WiFi + Bluetooth', 'Low Power', '18 ADC Channels', 'BLE 5.0'],
  'Sensor Module': ['Digital Output', 'Low Power', 'High Sensitivity', '3.3V-5V Compatible'],
  'Motor Driver': ['Dual Channel', 'Overcurrent Protection', 'PWM Control', ' heatsink Included'],
  'Raspberry Pi': ['Quad Core CPU', 'HDMI Output', 'GPIO Pins', 'USB 3.0', 'microSD Storage'],
  'Power Module': ['Adjustable Output', 'Overcurrent Protection', 'High Efficiency', 'Input Reverse Polarity Protection'],
  'Soldering Iron': ['Adjustable Temperature', 'Ceramic Heater', 'LED Display', 'Sleep Mode', 'ESD Safe'],
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
  'Arduino': ['Daraz', 'Digilog', 'Hall Road Lahore', 'Techsharks', 'KitHub'],
  'ESP32': ['Daraz', 'Digilog', 'Hall Road Lahore', 'Pak Robotics', 'Wavetronics'],
  'Sensor Module': ['Daraz', 'Digilog', 'Hall Road Lahore', 'Faran Electronics', 'Scientific Cart'],
  'Motor Driver': ['Daraz', 'Digilog', 'ElectroStore', 'Hall Road Lahore', 'Wavetronics'],
  'Raspberry Pi': ['Daraz', 'Digilog', 'Hall Road Lahore', 'Techsharks', 'Pak Robotics'],
  'Power Module': ['Daraz', 'Digilog', 'ElectroStore', 'Hall Road Lahore', 'Wavetronics'],
  'Soldering Iron': ['Daraz', 'Digilog', 'Hall Road Lahore', 'Wavetronics', 'Electronics Garage'],
};

const BASE_PRICES_PKR: Record<string, number> = {
  'Mobile Phone': 35000, 'Kurti': 3000, 'Sneakers': 5000, 'Perfume': 3500,
  'Wrist Watch': 12000, 'Leather Bag': 8000, 'LED TV': 75000, 'Cricket Bat': 5000,
  'Arduino': 1100, 'ESP32': 1500, 'Sensor Module': 400, 'Motor Driver': 600,
  'Raspberry Pi': 12000, 'Power Module': 300, 'Soldering Iron': 2500,
};

const MERCHANT_DOMAINS: Record<string, string> = {
  'Daraz': 'daraz.pk', 'PriceOye': 'priceoye.pk', 'Shophive': 'shophive.pk',
  'Mega': 'mega.pk', 'Telemart': 'telemart.pk', 'Sapphire': 'sapphireonline.pk',
  'Gul Ahmed': 'gulahmedshop.com', 'Limelight': 'limelight.pk', 'Bonanza': 'bonanzagt.com',
  'Servis': 'servis.com.pk', 'Borjan': 'borjan.pk', 'Metro': 'metroshoes.com.pk',
  'Stylo': 'stylo.pk', 'Scents': 'scents.com.pk', 'iShopping': 'ishop.pk',
  'Jafferjees': 'jafferjees.com', 'Daachi': 'daachi.com.pk', 'HomeShopping': 'homeshopping.pk',
  'Digilog': 'digilog.pk', 'Hall Road Lahore': 'hallroadlahore.pk', 'ElectroStore': 'electrostore.pk',
  'Pak Robotics': 'pakrobotics.com', 'Techsharks': 'techsharks.pk', 'KitHub': 'kithub.pk',
  'Faran Electronics': 'faranelectronics.com', 'Wavetronics': 'wavetronics.pk',
  'Scientific Cart': 'scientificcart.com', 'Innovat Electronics': 'innovatlectronics.pk',
  'Electronics Garage': 'electronicsgarage.pk',
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
