import type { ScanResult, Confidence, DataSource } from '@/types';

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
  'Arduino': { min: 300, max: 15000 },
  'Microcontroller': { min: 200, max: 30000 },
  'MCU': { min: 200, max: 30000 },
  'Development Board': { min: 300, max: 80000 },
  'Raspberry Pi': { min: 3000, max: 80000 },
  'ESP32': { min: 300, max: 5000 },
  'ESP8266': { min: 200, max: 3000 },
  'Sensor': { min: 50, max: 15000 },
  'Sensor Module': { min: 50, max: 15000 },
  'Motor Driver': { min: 100, max: 5000 },
  'Display': { min: 200, max: 25000 },
  'OLED Display': { min: 200, max: 8000 },
  'LCD Display': { min: 200, max: 15000 },
  'IC': { min: 10, max: 5000 },
  'Integrated Circuit': { min: 10, max: 5000 },
  'Transistor': { min: 5, max: 2000 },
  'MOSFET': { min: 20, max: 3000 },
  'Diode': { min: 2, max: 500 },
  'Resistor': { min: 1, max: 500 },
  'Capacitor': { min: 2, max: 1000 },
  'Potentiometer': { min: 10, max: 500 },
  'Voltage Regulator': { min: 10, max: 2000 },
  'Breadboard': { min: 100, max: 3000 },
  'Jumper Wire': { min: 30, max: 500 },
  'Battery Module': { min: 50, max: 5000 },
  'Power Module': { min: 50, max: 8000 },
  'Relay Module': { min: 50, max: 3000 },
  'LED Module': { min: 20, max: 2000 },
  'Audio Module': { min: 50, max: 5000 },
  'Bluetooth Module': { min: 200, max: 4000 },
  'WiFi Module': { min: 200, max: 5000 },
  'GPS Module': { min: 500, max: 8000 },
  'RFID Module': { min: 200, max: 3000 },
  'STM32': { min: 300, max: 15000 },
  'FPGA': { min: 2000, max: 50000 },
  'Soldering Iron': { min: 300, max: 15000 },
  'Soldering Station': { min: 1000, max: 30000 },
  'Multimeter': { min: 300, max: 15000 },
  'Oscilloscope': { min: 3000, max: 150000 },
  'Power Supply': { min: 500, max: 30000 },
  'PCB': { min: 50, max: 5000 },
  'Battery Cell': { min: 50, max: 5000 },
  '18650 Battery': { min: 100, max: 3000 },
  'LiPo Battery': { min: 300, max: 15000 },
  'Charger Module': { min: 20, max: 2000 },
  'BMS': { min: 50, max: 3000 },
  'Solar Charger': { min: 200, max: 15000 },
  'Inverter Module': { min: 200, max: 20000 },
  'DC DC Converter': { min: 50, max: 5000 },
  'Buck Converter': { min: 50, max: 3000 },
  'Boost Converter': { min: 50, max: 3000 },
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
