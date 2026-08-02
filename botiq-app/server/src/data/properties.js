/** Client property inventory — curated so every BHK × budget combo has 3+ listings */

const IMG = (id) => `https://images.unsplash.com/${id}?w=800&h=520&fit=crop&q=80`;

/** Apartment flats — building exteriors + living spaces (2BHK / 3BHK) */
const APARTMENT_IMAGES = [
  IMG('photo-1545324418-cc1a3fa10c00'), // apartment tower
  IMG('photo-1600596542815-ffad4c1539a9'), // modern flat exterior
  IMG('photo-1600585154340-be6161a56a0c'), // white contemporary home
  IMG('photo-1600607687939-ce8a6c25118c'), // bright living room
  IMG('photo-1605276374104-dee2a0ed3cd6'), // residential block
  IMG('photo-1600585152915-d208bec867a1'), // open-plan living
  IMG('photo-1600607687644-c7171b42498f'), // furnished interior
  IMG('photo-1600585154526-990dced4db0d'), // suburban apartment
  IMG('photo-1600585153490-76fb20a32601'), // cozy living room
  IMG('photo-1600607687920-4e2a09cf159d'), // modern kitchen
  IMG('photo-1502672260266-1c1ef2d93688'), // apartment lounge
  IMG('photo-1522708323590-d24dbb6b0267'), // furnished flat
  IMG('photo-1513584684374-8bab748fbf90'), // bedroom
  IMG('photo-1449844908441-8829872d2607'), // gated community
  IMG('photo-1570129477492-45c003edd2be'), // family home front
  IMG('photo-1582268611958-ebfd161ef9cf'), // residential facade
];

/** Independent villas — larger homes, lawns, premium finishes */
const VILLA_IMAGES = [
  IMG('photo-1512917774080-9991f1c4c750'), // luxury villa
  IMG('photo-1613490493576-7fde63acd811'), // modern villa exterior
  IMG('photo-1605146769289-440113cc3d00'), // contemporary villa
  IMG('photo-1580587771525-78b9dba3b914'), // villa with garden
  IMG('photo-1600607688969-a5bfcd646154'), // premium interior
  IMG('photo-1564013799919-ab600027ffc6'), // pool villa
  IMG('photo-1600596542815-ffad4c1539a9'), // large modern home
  IMG('photo-1600585154340-be6161a56a0c'), // spacious villa
  IMG('photo-1570129477492-45c003edd2be'), // standalone house
  IMG('photo-1605276374104-dee2a0ed3cd6'), // villa driveway
  IMG('photo-1582268611958-ebfd161ef9cf'), // estate home
  IMG('photo-1449844908441-8829872d2607'), // bungalow
];

/** Commercial — offices, retail, business parks */
const COMMERCIAL_IMAGES = [
  IMG('photo-1486406146926-c627a92ad1ab'), // glass office tower
  IMG('photo-1497366216548-37526070297c'), // open-plan office
  IMG('photo-1497366811353-6870744d04b2'), // corporate workspace
  IMG('photo-1480714378408-67cf0d13bc1b'), // city skyline
  IMG('photo-1541888946425-d81bb19240f5'), // commercial building
  IMG('photo-1503387762-592deb58ef4e'), // business architecture
  IMG('photo-1560518883-ce09059eeffa'), // commercial real estate
  IMG('photo-1497366216548-37526070297c'), // co-working space
  IMG('photo-1486406146926-c627a92ad1ab'), // grade-A office
  IMG('photo-1480714378408-67cf0d13bc1b'), // IT park view
];

function hashName(name) {
  let h = 0;
  for (const c of name) h = (Math.imul(31, h) + c.charCodeAt(0)) | 0;
  return Math.abs(h);
}

/** Stable, type-appropriate image per property */
function propertyImage(name, type) {
  const pool =
    type === 'Commercial' ? COMMERCIAL_IMAGES
    : type === 'Villa' ? VILLA_IMAGES
    : APARTMENT_IMAGES;
  return pool[hashName(name) % pool.length];
}

const LOCATIONS = [
  'Banjara Hills', 'Jubilee Hills', 'Gachibowli', 'Kondapur', 'Madhapur',
  'HITEC City', 'Kokapet', 'Financial District', 'Nanakramguda', 'Uppal',
  'Kukatpally', 'Miyapur', 'Narsingi', 'Manikonda', 'Tellapur',
];

const STATUSES = ['Ready to move', 'Dec 2025', 'Mar 2026', 'Jun 2026', 'Under construction'];

function fmtPrice(lakhs) {
  if (lakhs >= 100) return `₹${(lakhs / 100).toFixed(1)}Cr`.replace('.0Cr', 'Cr');
  return `₹${lakhs}L`;
}

function sqftFor(type, i) {
  if (type === '2BHK') return `${920 + (i % 5) * 35} sqft`;
  if (type === '3BHK') return `${1280 + (i % 6) * 40} sqft`;
  if (type === 'Villa') return `${2400 + (i % 8) * 120} sqft`;
  return `${1800 + (i % 10) * 220} sqft`;
}

/** Normalize WhatsApp filter labels → inventory bhk key */
export function normalizeBhkFilter(bhk) {
  if (!bhk) return null;
  const map = {
    '2BHK Apartment': '2BHK',
    '3BHK Apartment': '3BHK',
    Villa: 'Villa',
    Commercial: 'Commercial',
  };
  return map[bhk] ?? bhk.replace(' Apartment', '');
}

const CATALOG = [
  // ── 2BHK · ₹50L–₹75L (6) ──
  { type: '2BHK', price: 55, name: 'Green Valley Residency' },
  { type: '2BHK', price: 58, name: 'Rainbow Vistas' },
  { type: '2BHK', price: 62, name: 'Phoenix Trivium' },
  { type: '2BHK', price: 65, name: 'SMR Vinay Harmony' },
  { type: '2BHK', price: 68, name: 'Alekhya Homes' },
  { type: '2BHK', price: 72, name: 'Pooja Crafted Homes' },
  // ── 2BHK · ₹75L–₹1Cr (6) ──
  { type: '2BHK', price: 78, name: 'Aparna Zenon' },
  { type: '2BHK', price: 82, name: 'My Home Twizzle' },
  { type: '2BHK', price: 85, name: 'Prestige High Fields' },
  { type: '2BHK', price: 88, name: 'Brigade Cornerstone' },
  { type: '2BHK', price: 92, name: 'Lodha Palava Central' },
  { type: '2BHK', price: 96, name: 'Godrej Palm Retreat' },
  // ── 2BHK · ₹1Cr–₹1.5Cr (5) ──
  { type: '2BHK', price: 105, name: 'Skyon Penthouse' },
  { type: '2BHK', price: 115, name: 'The Botanika Suite' },
  { type: '2BHK', price: 125, name: 'Taj Skyline Residence' },
  { type: '2BHK', price: 135, name: 'Hillcrest Premium 2BHK' },
  { type: '2BHK', price: 142, name: 'Oakwood Elite Homes' },
  // ── 2BHK · Above ₹1.5Cr (3) ──
  { type: '2BHK', price: 155, name: 'Banjara Sky Villa Flat' },
  { type: '2BHK', price: 168, name: 'Jubilee Crown Penthouse' },
  { type: '2BHK', price: 185, name: 'The Peak Luxury 2BHK' },

  // ── 3BHK · ₹50L–₹75L (5) ──
  { type: '3BHK', price: 52, name: 'Vertex Lake View' },
  { type: '3BHK', price: 58, name: 'Hallmark County' },
  { type: '3BHK', price: 65, name: 'Vasavi Lake City' },
  { type: '3BHK', price: 70, name: 'Ramky One North' },
  { type: '3BHK', price: 74, name: 'Cybercity Oriana' },
  // ── 3BHK · ₹75L–₹1Cr (8) ──
  { type: '3BHK', price: 78, name: 'My Home Jewel' },
  { type: '3BHK', price: 82, name: 'Prestige Clairemont' },
  { type: '3BHK', price: 85, name: 'Prestige Skyline' },
  { type: '3BHK', price: 88, name: 'Brigade Gateway' },
  { type: '3BHK', price: 92, name: 'Aparna Serene' },
  { type: '3BHK', price: 95, name: 'Sobha Dream Acres' },
  { type: '3BHK', price: 98, name: 'Lodha Belmondo' },
  { type: '3BHK', price: 99, name: 'Auro Realty The Regent' },
  // ── 3BHK · ₹1Cr–₹1.5Cr (6) ──
  { type: '3BHK', price: 102, name: 'Phoenix Equinox' },
  { type: '3BHK', price: 110, name: 'Aparna Luxor' },
  { type: '3BHK', price: 118, name: 'My Home Bhooja' },
  { type: '3BHK', price: 128, name: 'Prestige Beverly Hills' },
  { type: '3BHK', price: 138, name: 'NSL East County' },
  { type: '3BHK', price: 145, name: 'Hallmark Treasor' },
  // ── 3BHK · Above ₹1.5Cr (4) ──
  { type: '3BHK', price: 155, name: 'The Olympus' },
  { type: '3BHK', price: 172, name: 'Aparna Zen Earth' },
  { type: '3BHK', price: 188, name: 'Prestige Glenbrook' },
  { type: '3BHK', price: 210, name: 'Jubilee Hills Grand 3BHK' },

  // ── Villa · ₹50L–₹75L (4) ──
  { type: 'Villa', price: 58, name: 'Gated Greens Villa' },
  { type: 'Villa', price: 62, name: 'County Craft Villa' },
  { type: 'Villa', price: 68, name: 'Lake Breeze Villa' },
  { type: 'Villa', price: 72, name: 'Palm Grove Villa' },
  // ── Villa · ₹75L–₹1Cr (5) ──
  { type: 'Villa', price: 78, name: 'Serene County Villa' },
  { type: 'Villa', price: 85, name: 'Hill Ridge Villa' },
  { type: 'Villa', price: 88, name: 'Oakwood Villa' },
  { type: 'Villa', price: 92, name: 'Greenstone Villa' },
  { type: 'Villa', price: 98, name: 'Prestige Villa Park' },
  // ── Villa · ₹1Cr–₹1.5Cr (6) ──
  { type: 'Villa', price: 105, name: 'Jubilee Villas' },
  { type: 'Villa', price: 112, name: 'Gachibowli Park Villa' },
  { type: 'Villa', price: 120, name: 'Nanakramguda Estate' },
  { type: 'Villa', price: 128, name: 'Banjara Villa Crest' },
  { type: 'Villa', price: 138, name: 'Tellapur Lake Villa' },
  { type: 'Villa', price: 148, name: 'Narsingi Green Villa' },
  // ── Villa · Above ₹1.5Cr (6) ──
  { type: 'Villa', price: 165, name: 'Jubilee Hills Signature Villa' },
  { type: 'Villa', price: 185, name: 'Banjara Presidential Villa' },
  { type: 'Villa', price: 210, name: 'Prestige Royale Villa' },
  { type: 'Villa', price: 250, name: 'Sky Mansion Villa' },
  { type: 'Villa', price: 285, name: 'The Opus Villa' },
  { type: 'Villa', price: 350, name: 'Infinity Estate Villa' },

  // ── Commercial · ₹50L–₹75L (5) ──
  { type: 'Commercial', price: 55, name: 'Uppal Retail Plaza' },
  { type: 'Commercial', price: 58, name: 'Kukatpally Shop Hub' },
  { type: 'Commercial', price: 62, name: 'Miyapur Business Bay' },
  { type: 'Commercial', price: 68, name: 'Ameerpet Office Square' },
  { type: 'Commercial', price: 72, name: 'Secunderabad Trade Center' },
  // ── Commercial · ₹75L–₹1Cr (5) ──
  { type: 'Commercial', price: 78, name: 'Madhapur Tech Park Suite' },
  { type: 'Commercial', price: 82, name: 'Kondapur Co-work Hub' },
  { type: 'Commercial', price: 88, name: 'HITEC City Office Block' },
  { type: 'Commercial', price: 92, name: 'Gachibowli Business Loft' },
  { type: 'Commercial', price: 98, name: 'Financial District Suite' },
  // ── Commercial · ₹1Cr–₹1.5Cr (5) ──
  { type: 'Commercial', price: 105, name: 'Nanakramguda Corporate Hub' },
  { type: 'Commercial', price: 112, name: 'Raidurgam Office Tower' },
  { type: 'Commercial', price: 120, name: 'Banjara Corporate Center' },
  { type: 'Commercial', price: 128, name: 'Jubilee Business Park' },
  { type: 'Commercial', price: 140, name: 'Kokapet Commercial Hub' },
  // ── Commercial · Above ₹1.5Cr (5) ──
  { type: 'Commercial', price: 165, name: 'Financial District Tower A' },
  { type: 'Commercial', price: 195, name: 'HITEC City Grade-A Office' },
  { type: 'Commercial', price: 220, name: 'Banjara Hills Corporate Plaza' },
  { type: 'Commercial', price: 280, name: 'Waverock Business Campus' },
  { type: 'Commercial', price: 350, name: 'Phoenix Equinox Commercial' },
];

export const allProperties = CATALOG.map((item, i) => ({
  id: `p${String(i + 1).padStart(2, '0')}`,
  title: item.name,
  location: LOCATIONS[i % LOCATIONS.length],
  bhk: item.type,
  price: fmtPrice(item.price),
  priceNum: item.price,
  sqft: sqftFor(item.type, i),
  status: STATUSES[i % STATUSES.length],
  image: propertyImage(item.name, item.type),
}));

const BUDGET_RANGES = {
  '₹50L - ₹75L': { min: 50, max: 75 },
  '₹75L - ₹1Cr': { min: 75, max: 100 },
  '₹1Cr - ₹1.5Cr': { min: 100, max: 150 },
  'Above ₹1.5Cr': { min: 150, max: 999 },
};

export function parseBudget(label) {
  return BUDGET_RANGES[label] ?? { min: 0, max: 999 };
}

export function searchProperties({ bhk, budgetLabel, excludeIds = [], limit = 3, offset = 0 }) {
  const { min, max } = parseBudget(budgetLabel);
  const norm = normalizeBhkFilter(bhk);

  const filtered = allProperties.filter((p) => {
    if (norm && p.bhk !== norm) return false;
    if (p.priceNum < min || p.priceNum > max) return false;
    return true;
  });

  const pool = excludeIds.length
    ? filtered.filter((p) => !excludeIds.includes(p.id))
    : filtered;

  const start = excludeIds.length ? 0 : offset;
  const items = pool.slice(start, start + limit);
  const total = filtered.length;
  const hasMore = excludeIds.length ? pool.length > limit : offset + limit < total;

  return { items, total, hasMore, offset: start };
}

export function getPropertyById(id) {
  return allProperties.find((p) => p.id === id) ?? null;
}

export function buildListingsUrl(baseUrl, { bhk, budget, budgetLabel }) {
  const label = budgetLabel ?? budget;
  const { min, max } = parseBudget(label);
  const params = new URLSearchParams();
  const norm = normalizeBhkFilter(bhk);
  if (norm) params.set('bhk', norm);
  if (min) params.set('budgetMin', String(min));
  if (max < 999) params.set('budgetMax', String(max));
  return `${baseUrl}?${params.toString()}`;
}

/** Dev helper — verify every combo has ≥3 listings */
export function auditCoverage() {
  const types = ['2BHK Apartment', '3BHK Apartment', 'Villa', 'Commercial'];
  const budgets = Object.keys(BUDGET_RANGES);
  const gaps = [];
  for (const t of types) {
    for (const b of budgets) {
      const { total } = searchProperties({ bhk: t, budgetLabel: b, limit: 999 });
      if (total < 3) gaps.push({ type: t, budget: b, total });
    }
  }
  return { ok: gaps.length === 0, totalProperties: allProperties.length, gaps };
}
