import type { Confidence, DataSource } from '@/types';

const CATEGORY_PRICE_RANGES_PKR: Record<string, { min: number; max: number }> = {
  'Mobile Phone': { min: 3000, max: 500000 },
  'Phone': { min: 3000, max: 500000 },
  'Smartphone': { min: 5000, max: 500000 },
  'Kurti': { min: 500, max: 50000 },
  'Shalwar Kameez': { min: 1000, max: 50000 },
  'Sneakers': { min: 1000, max: 50000 },
  'Shoes': { min: 800, max: 50000 },
  'Perfume': { min: 500, max: 30000 },
  'Fragrance': { min: 500, max: 30000 },
  'Watch': { min: 500, max: 5000000 },
  'Wrist Watch': { min: 500, max: 5000000 },
  'LED TV': { min: 15000, max: 1000000 },
  'Television': { min: 15000, max: 1000000 },
  'TV': { min: 15000, max: 1000000 },
  'Laptop': { min: 20000, max: 800000 },
  'Computer': { min: 10000, max: 800000 },
  'Tablet': { min: 5000, max: 300000 },
  'iPad': { min: 30000, max: 300000 },
  'Air Conditioner': { min: 35000, max: 500000 },
  'AC': { min: 35000, max: 500000 },
  'Refrigerator': { min: 25000, max: 500000 },
  'Fridge': { min: 25000, max: 500000 },
  'Home Appliance': { min: 3000, max: 500000 },
  'Clothing': { min: 300, max: 100000 },
  'Dress': { min: 500, max: 80000 },
  'Shirt': { min: 300, max: 30000 },
  'T-Shirt': { min: 200, max: 20000 },
  'Bottle': { min: 200, max: 10000 },
  'Bag': { min: 500, max: 100000 },
  'Backpack': { min: 800, max: 30000 },
  'Handbag': { min: 1000, max: 100000 },
  'Leather Bag': { min: 2000, max: 100000 },
  'Headphones': { min: 500, max: 50000 },
  'Earphones': { min: 200, max: 30000 },
  'Speaker': { min: 500, max: 50000 },
  'Bluetooth Speaker': { min: 500, max: 50000 },
  'Bicycle': { min: 5000, max: 150000 },
  'Cycle': { min: 5000, max: 150000 },
  'Cricket Bat': { min: 1000, max: 30000 },
  'Cricket Kit': { min: 2000, max: 100000 },
  'Sports': { min: 500, max: 100000 },
  'Toy': { min: 100, max: 30000 },
  'Car Accessory': { min: 200, max: 50000 },
  'Jacket': { min: 1000, max: 50000 },
  'Blazer': { min: 2000, max: 50000 },
  'Sweater': { min: 500, max: 30000 },
  'Jeans': { min: 800, max: 30000 },
  'Sunglasses': { min: 200, max: 50000 },
  'Camera': { min: 5000, max: 500000 },
  'Monitor': { min: 5000, max: 200000 },
  'Printer': { min: 5000, max: 200000 },
  'Router': { min: 500, max: 30000 },
  // Electronics components & hardware
  'Microchip': { min: 20, max: 50000 },
  'IC': { min: 10, max: 50000 },
  'Chip': { min: 10, max: 50000 },
  'Integrated Circuit': { min: 10, max: 50000 },
  'Microcontroller': { min: 100, max: 30000 },
  'Arduino': { min: 300, max: 30000 },
  'Raspberry Pi': { min: 2000, max: 50000 },
  'PCB': { min: 50, max: 50000 },
  'Circuit Board': { min: 50, max: 50000 },
  'Resistor': { min: 5, max: 2000 },
  'Capacitor': { min: 5, max: 10000 },
  'Transistor': { min: 10, max: 5000 },
  'Diode': { min: 5, max: 3000 },
  'LED': { min: 5, max: 5000 },
  'LED Bulb': { min: 50, max: 10000 },
  'Sensor': { min: 50, max: 30000 },
  'Module': { min: 100, max: 50000 },
  'Electronic Component': { min: 5, max: 50000 },
  'Breadboard': { min: 50, max: 5000 },
  'Soldering Iron': { min: 200, max: 15000 },
  'Multimeter': { min: 500, max: 50000 },
  'Battery': { min: 50, max: 30000 },
  'Charger': { min: 100, max: 15000 },
  'Cable': { min: 50, max: 10000 },
  'Connector': { min: 10, max: 5000 },
  'Switch': { min: 10, max: 10000 },
  'Relay': { min: 50, max: 10000 },
  'Motor': { min: 100, max: 100000 },
  'Servo': { min: 200, max: 20000 },
  // Hardware & Tools
  'Tool': { min: 50, max: 100000 },
  'Wrench': { min: 100, max: 15000 },
  'Screwdriver': { min: 50, max: 10000 },
  'Hammer': { min: 100, max: 10000 },
  'Drill': { min: 1000, max: 100000 },
  'Power Tool': { min: 1000, max: 150000 },
  'Pliers': { min: 100, max: 10000 },
  'Hardware': { min: 20, max: 100000 },
  'Fastener': { min: 5, max: 5000 },
  'Pipe': { min: 50, max: 50000 },
  'Valve': { min: 100, max: 50000 },
  'Fitting': { min: 30, max: 20000 },
  'Plumbing': { min: 100, max: 100000 },
  // Sanitary
  'Sanitary': { min: 200, max: 100000 },
  'Sanitary Ware': { min: 500, max: 200000 },
  'Faucet': { min: 200, max: 50000 },
  'Tap': { min: 200, max: 50000 },
  'Shower': { min: 500, max: 50000 },
  'Toilet': { min: 3000, max: 100000 },
  'Sink': { min: 1000, max: 50000 },
  'Tiles': { min: 50, max: 10000 },
  // Automotive
  'Car Part': { min: 200, max: 200000 },
  'Auto Part': { min: 100, max: 200000 },
  'Engine Oil': { min: 500, max: 20000 },
  'Tyre': { min: 3000, max: 100000 },
  'Tire': { min: 3000, max: 100000 },
  // Food & Groceries
  'Food': { min: 20, max: 50000 },
  'Grocery': { min: 20, max: 50000 },
  'Snack': { min: 10, max: 5000 },
  'Beverage': { min: 20, max: 10000 },
  // Books & Stationery
  'Book': { min: 100, max: 30000 },
  'Notebook': { min: 50, max: 5000 },
  'Stationery': { min: 10, max: 10000 },
  // Furniture & Home
  'Furniture': { min: 1000, max: 500000 },
  'Chair': { min: 1000, max: 100000 },
  'Table': { min: 2000, max: 200000 },
  'Bed': { min: 5000, max: 300000 },
  'Sofa': { min: 10000, max: 500000 },
  'Lamp': { min: 500, max: 30000 },
  'Fan': { min: 1000, max: 50000 },
  // Medical & Health
  'Medicine': { min: 10, max: 50000 },
  'Medical': { min: 10, max: 100000 },
  'Mask': { min: 20, max: 5000 },
  // Beauty & Personal Care
  'Cosmetic': { min: 100, max: 30000 },
  'Makeup': { min: 100, max: 30000 },
  'Soap': { min: 20, max: 5000 },
  'Shampoo': { min: 100, max: 10000 },
  // Baby & Kids
  'Baby': { min: 50, max: 100000 },
  'Diaper': { min: 200, max: 10000 },
  // Pet Supplies
  'Pet': { min: 100, max: 50000 },
  'Pet Food': { min: 200, max: 20000 },
  // Garden & Outdoor
  'Garden': { min: 100, max: 50000 },
  'Plant': { min: 50, max: 50000 },
  // Musical Instruments
  'Guitar': { min: 2000, max: 200000 },
  'Musical Instrument': { min: 500, max: 500000 },
  // Generic fallback
  'Product': { min: 50, max: 5000000 },
  'Unidentified Item': { min: 50, max: 5000000 },
};

export function validatePriceAgainstCategory(
  price: number,
  category: string
): { valid: boolean; reason?: string } {
  if (price <= 0) return { valid: false, reason: 'Price must be greater than zero' };

  if (!category || category === 'Product' || category === 'Detected item') {
    return { valid: price >= 50 && price <= 5000000 };
  }

  for (const [key, range] of Object.entries(CATEGORY_PRICE_RANGES_PKR)) {
    if (category.toLowerCase().includes(key.toLowerCase())) {
      const tooLow = price < range.min * 0.3;
      const tooHigh = price > range.max * 3;
      if (tooLow && price < 50) return { valid: false, reason: `Price seems too low for a ${category} in Pakistan` };
      if (tooHigh) return { valid: false, reason: `Price seems unreasonably high for a ${category} in Pakistan` };
      return { valid: true };
    }
  }

  if (price < 50) return { valid: false, reason: 'Price seems unrealistically low' };
  if (price > 10000000) return { valid: false, reason: 'Price seems unrealistically high' };

  return { valid: true };
}

export function assessConfidence(
  groqSuccess: boolean,
  serpSuccess: boolean,
  comparisonCount: number,
  highSimilarityCount: number,
  priceRangeValid: boolean
): { confidence: Confidence; dataSource: DataSource } {
  if (groqSuccess && serpSuccess && comparisonCount >= 3 && highSimilarityCount >= 2 && priceRangeValid) {
    return { confidence: 'high', dataSource: 'ai_vision_plus_web' };
  }
  if (groqSuccess && serpSuccess) {
    return { confidence: 'medium', dataSource: 'ai_vision_plus_web' };
  }
  if (groqSuccess && priceRangeValid) {
    return { confidence: 'medium', dataSource: 'ai_vision' };
  }
  if (serpSuccess && comparisonCount >= 2) {
    return { confidence: 'medium', dataSource: 'web' };
  }
  return { confidence: 'low', dataSource: 'estimated' };
}

export function sanitizeCategoryBrand(
  category: string | undefined,
  brand: string | undefined
): { category: string; brand: string } {
  const clean = (s: string | undefined) => {
    if (!s || s === 'Unknown' || s === 'Product') return undefined;
    return s.trim().slice(0, 50).replace(/[<>"']/g, '');
  };
  return {
    category: clean(category) || 'Product',
    brand: clean(brand) || 'Unknown',
  };
}
