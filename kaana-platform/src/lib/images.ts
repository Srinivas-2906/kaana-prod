import type { IndustryId } from '../data/industries';

/** Curated Unsplash images per vertical — demo cards & mini-site */
export const INDUSTRY_IMAGES: Record<
  IndustryId,
  { hero: string; card: string; listings: [string, string, string] }
> = {
  'real-estate': {
    hero: 'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=400&q=80',
    card: 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=200&q=80',
    listings: [
      'https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?w=300&q=80',
      'https://images.unsplash.com/photo-1600566753190-17f0baa2a6c3?w=300&q=80',
      'https://images.unsplash.com/photo-1600047509807-ba8f99d2cdde?w=300&q=80',
    ],
  },
  clinic: {
    hero: 'https://images.unsplash.com/photo-1519494026892-80bbd2d6fd0d?w=400&q=80',
    card: 'https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?w=200&q=80',
    listings: [
      'https://images.unsplash.com/photo-1631217868264-e5b165bb5e3b?w=300&q=80',
      'https://images.unsplash.com/photo-1586773866418-de279enff741?w=300&q=80',
      'https://images.unsplash.com/photo-1629909613654-28e377c37b09?w=300&q=80',
    ],
  },
  coaching: {
    hero: 'https://images.unsplash.com/photo-1524178232363-1fb2b755073c?w=400&q=80',
    card: 'https://images.unsplash.com/photo-1434030216411-0b793f4b4173?w=200&q=80',
    listings: [
      'https://images.unsplash.com/photo-1522202176988-66273c2fd55f?w=300&q=80',
      'https://images.unsplash.com/photo-1503676260728-1c00da094a0b?w=300&q=80',
      'https://images.unsplash.com/photo-1523240795612-9a054b0db644?w=300&q=80',
    ],
  },
  salon: {
    hero: 'https://images.unsplash.com/photo-1560066984-138dadb4c035?w=400&q=80',
    card: 'https://images.unsplash.com/photo-1522337360788-8eee13da2871?w=200&q=80',
    listings: [
      'https://images.unsplash.com/photo-1633681926022-84c23e8cb2d6?w=300&q=80',
      'https://images.unsplash.com/photo-1595476108010-b1735973db35?w=300&q=80',
      'https://images.unsplash.com/photo-1521590832167-bcbcfc5a602f?w=300&q=80',
    ],
  },
  retail: {
    hero: 'https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=400&q=80',
    card: 'https://images.unsplash.com/photo-1472851294601-062e8248fe5f?w=200&q=80',
    listings: [
      'https://images.unsplash.com/photo-1445205170230-053b83016050?w=300&q=80',
      'https://images.unsplash.com/photo-1555529669-2269763671c0?w=300&q=80',
      'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=300&q=80',
    ],
  },
  restaurant: {
    hero: 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=400&q=80',
    card: 'https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=200&q=80',
    listings: [
      'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=300&q=80',
      'https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?w=300&q=80',
      'https://images.unsplash.com/photo-1565958011703-44f982e59a48?w=300&q=80',
    ],
  },
  ecommerce: {
    hero: 'https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?w=400&q=80',
    card: 'https://images.unsplash.com/photo-1472851294601-062e8248fe5f?w=200&q=80',
    listings: [
      'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=300&q=80',
      'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=300&q=80',
      'https://images.unsplash.com/photo-1572635196233-1594d0750f0c?w=300&q=80',
    ],
  },
  professional: {
    hero: 'https://images.unsplash.com/photo-1497366216548-37526070297c?w=400&q=80',
    card: 'https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?w=200&q=80',
    listings: [
      'https://images.unsplash.com/photo-1450101499163-c8848c66ca85?w=300&q=80',
      'https://images.unsplash.com/photo-1553877522-43269d4ea984?w=300&q=80',
      'https://images.unsplash.com/photo-1556761175-b413da4baf72?w=300&q=80',
    ],
  },
  fitness: {
    hero: 'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=400&q=80',
    card: 'https://images.unsplash.com/photo-1571019614242-c5c5dee9f50b?w=200&q=80',
    listings: [
      'https://images.unsplash.com/photo-1540497077202-7a8a3998166f?w=300&q=80',
      'https://images.unsplash.com/photo-1517836357463-d25dfeac3438?w=300&q=80',
      'https://images.unsplash.com/photo-1574680096145-d05b474e2655?w=300&q=80',
    ],
  },
  education: {
    hero: 'https://images.unsplash.com/photo-1523050854058-8df90110c9f1?w=400&q=80',
    card: 'https://images.unsplash.com/photo-1427504494785-3a9ca7044f45?w=200&q=80',
    listings: [
      'https://images.unsplash.com/photo-1509062522246-3755977927d7?w=300&q=80',
      'https://images.unsplash.com/photo-1524178232363-1fb2b755073c?w=300&q=80',
      'https://images.unsplash.com/photo-1523240795612-9a054b0db644?w=300&q=80',
    ],
  },
  'home-services': {
    hero: 'https://images.unsplash.com/photo-1581578731548-c64695cc6952?w=400&q=80',
    card: 'https://images.unsplash.com/photo-1504148455328-c376907f0817?w=200&q=80',
    listings: [
      'https://images.unsplash.com/photo-1621905252507-b35492cc74b4?w=300&q=80',
      'https://images.unsplash.com/photo-1607472586893-a37c7364bfd0?w=300&q=80',
      'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=300&q=80',
    ],
  },
  automotive: {
    hero: 'https://images.unsplash.com/photo-1492144534655-ae79c964c9d7?w=400&q=80',
    card: 'https://images.unsplash.com/photo-1503376780353-7e6692767b70?w=200&q=80',
    listings: [
      'https://images.unsplash.com/photo-1549317661-bd32c8ce0db2?w=300&q=80',
      'https://images.unsplash.com/photo-1552519507-da3b142c6e3d?w=300&q=80',
      'https://images.unsplash.com/photo-1494976388531-d105849445bf?w=300&q=80',
    ],
  },
};

export function getIndustryImages(id: IndustryId) {
  return INDUSTRY_IMAGES[id] ?? INDUSTRY_IMAGES['real-estate'];
}
