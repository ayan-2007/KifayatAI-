export function formatPKR(amount: number): string {
  return `₨ ${Math.round(amount).toLocaleString('en-PK')}`;
}

export function getCurrencySymbol(): string {
  return '₨';
}

export function parsePriceRaw(raw: string): number {
  let cleaned = raw.replace(/[^0-9.,]/g, '').trim();
  if (!cleaned) return 0;

  const dots = (cleaned.match(/\./g) || []).length;
  const commas = (cleaned.match(/,/g) || []).length;

  if (dots > 0 && commas > 0) {
    const lastComma = cleaned.lastIndexOf(',');
    const lastDot = cleaned.lastIndexOf('.');
    if (lastDot < lastComma) {
      cleaned = cleaned.replace(/\./g, '').replace(',', '.');
    } else {
      cleaned = cleaned.replace(/,/g, '');
    }
  } else if (commas > 0) {
    const parts = cleaned.split(',');
    if (parts.length === 2 && parts[1].length <= 2) {
      cleaned = cleaned.replace(',', '.');
    } else {
      cleaned = cleaned.replace(/,/g, '');
    }
  }

  cleaned = cleaned.replace(/,/g, '');
  const num = parseFloat(cleaned);
  return isNaN(num) ? 0 : num;
}
