export interface PakistaniMerchant {
  name: string;
  domains: string[];
  priority: number;
  cod: boolean;
  category: 'marketplace' | 'electronics' | 'fashion' | 'general' | 'components';
}

export const PAKISTANI_MERCHANTS: PakistaniMerchant[] = [
  { name: 'Daraz', domains: ['daraz.pk'], priority: 1, cod: true, category: 'marketplace' },
  { name: 'PriceOye', domains: ['priceoye.pk'], priority: 2, cod: true, category: 'electronics' },
  { name: 'Shophive', domains: ['shophive.pk'], priority: 3, cod: true, category: 'electronics' },
  { name: 'Mega', domains: ['mega.pk'], priority: 4, cod: true, category: 'electronics' },
  { name: 'HomeShopping', domains: ['homeshopping.pk'], priority: 5, cod: true, category: 'general' },
  { name: 'Symbios', domains: ['symbios.pk'], priority: 6, cod: true, category: 'electronics' },
  { name: 'Telemart', domains: ['telemart.pk'], priority: 7, cod: true, category: 'electronics' },
  { name: 'GOTO', domains: ['goto.com.pk'], priority: 8, cod: true, category: 'general' },
  { name: 'iShopping', domains: ['ishop.pk'], priority: 9, cod: true, category: 'general' },
  { name: 'CZone', domains: ['czone.com.pk'], priority: 10, cod: true, category: 'electronics' },
  { name: 'Sapphire', domains: ['sapphireonline.pk'], priority: 11, cod: true, category: 'fashion' },
  { name: 'Gul Ahmed', domains: ['gulahmedshop.com'], priority: 12, cod: true, category: 'fashion' },
  { name: 'Junaid Jamshed', domains: ['junaidjamshed.com'], priority: 13, cod: true, category: 'fashion' },
  { name: 'Bonanza', domains: ['bonanzagt.com'], priority: 14, cod: true, category: 'fashion' },
  { name: 'Limelight', domains: ['limelight.pk'], priority: 15, cod: true, category: 'fashion' },
  { name: 'Sana Safinaz', domains: ['sanasafinaz.com'], priority: 16, cod: true, category: 'fashion' },
  { name: 'Maria B', domains: ['maria-b.pk'], priority: 17, cod: true, category: 'fashion' },
  { name: 'Nishat Linens', domains: ['nishatlinen.com'], priority: 18, cod: true, category: 'fashion' },
  { name: 'Alkaram', domains: ['alkaramstudio.com'], priority: 19, cod: true, category: 'fashion' },
  { name: 'Servis', domains: ['servis.com.pk'], priority: 20, cod: true, category: 'fashion' },
  { name: 'Borjan', domains: ['borjan.pk'], priority: 21, cod: true, category: 'fashion' },
  { name: 'Metro Shoes', domains: ['metroshoes.com.pk'], priority: 22, cod: true, category: 'fashion' },
  { name: 'Stylo', domains: ['stylo.pk'], priority: 23, cod: true, category: 'fashion' },
  { name: 'Jafferjees', domains: ['jafferjees.com'], priority: 24, cod: false, category: 'fashion' },
  { name: 'Daachi', domains: ['daachi.com.pk'], priority: 25, cod: true, category: 'fashion' },
  { name: 'Insight', domains: ['insightout.com.pk'], priority: 26, cod: true, category: 'fashion' },
  { name: 'Scents', domains: ['scents.com.pk'], priority: 27, cod: true, category: 'general' },
  { name: 'Dawlance', domains: ['dawlance.com.pk'], priority: 28, cod: false, category: 'electronics' },
  { name: 'Haier', domains: ['haierpk.com'], priority: 29, cod: false, category: 'electronics' },
  { name: 'Orient', domains: ['orientelectronics.com'], priority: 30, cod: false, category: 'electronics' },
  { name: 'PEL', domains: ['pel.com.pk'], priority: 31, cod: false, category: 'electronics' },
  { name: 'QMobile', domains: ['qmobile.com.pk'], priority: 32, cod: true, category: 'electronics' },
  { name: 'Zebronics', domains: ['zebronics.com.pk'], priority: 33, cod: true, category: 'electronics' },
  { name: 'HF Car Accessories', domains: ['hfcaraccessories.com'], priority: 34, cod: true, category: 'general' },
  { name: 'Digilog', domains: ['digilog.pk'], priority: 35, cod: true, category: 'components' },
  { name: 'Hall Road', domains: ['hallroad.org', 'hallroad.com.pk'], priority: 36, cod: true, category: 'components' },
  { name: 'Electronics Hub', domains: ['electronicshub.pk'], priority: 37, cod: true, category: 'components' },
  { name: 'ROBOZONE', domains: ['robozone.pk'], priority: 38, cod: true, category: 'components' },
  { name: 'Arduino Pakistan', domains: ['arduinopakistan.com'], priority: 39, cod: true, category: 'components' },
  { name: 'Circuit.pk', domains: ['circuit.pk'], priority: 40, cod: true, category: 'components' },
  { name: 'Micro Electronics', domains: ['microelect.com.pk'], priority: 41, cod: true, category: 'components' },
  { name: 'Techtronix', domains: ['techtronix.pk'], priority: 42, cod: false, category: 'components' },
  { name: 'Elink', domains: ['elinkpk.com'], priority: 43, cod: true, category: 'components' },
  { name: 'PakElectronics', domains: ['pakelectronics.pk'], priority: 44, cod: false, category: 'components' },
  { name: 'Robotech', domains: ['robotech.pk'], priority: 45, cod: true, category: 'components' },
];

export function identifyMerchant(source: string): PakistaniMerchant | null {
  const lower = source.toLowerCase();
  for (const m of PAKISTANI_MERCHANTS) {
    if (m.domains.some(d => lower.includes(d.replace('.', '')) || lower.includes(d.split('.')[0]))) {
      return m;
    }
  }
  if (lower.includes('pk') || lower.includes('pakistan') || lower.includes('.pk')) {
    return { name: source, domains: [], priority: 99, cod: true, category: 'general' };
  }
  return null;
}

export const PAKISTAN_SEARCH_SITES = PAKISTANI_MERCHANTS
  .map(m => `site:${m.domains[0]}`)
  .join(' OR ');
