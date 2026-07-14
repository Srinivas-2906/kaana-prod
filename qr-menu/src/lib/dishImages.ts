import curryVeg from '../assets/dishes/dish-curry-veg.webp'
import curryNonVeg from '../assets/dishes/dish-curry-nonveg.webp'
import biryani from '../assets/dishes/dish-biryani.webp'
import tandoor from '../assets/dishes/dish-tandoor.webp'
import noodles from '../assets/dishes/dish-noodles.webp'
import chineseStarter from '../assets/dishes/dish-chinese-starter.webp'
import dosa from '../assets/dishes/dish-dosa.webp'
import bread from '../assets/dishes/dish-bread.webp'
import soup from '../assets/dishes/dish-soup.webp'
import beverage from '../assets/dishes/dish-beverage.webp'
import friedRice from '../assets/dishes/dish-fried-rice.webp'
import type { MenuItem } from '../types/menu'

interface CategoryRule {
  image: string
  keywords: string[]
}

const NON_VEG_KEYWORDS = [
  'chicken',
  'mutton',
  'fish',
  'prawn',
  'egg',
  'shawarma',
  'kebab',
]

const RULES: CategoryRule[] = [
  { image: bread, keywords: ['naan', 'roti', 'kulcha', 'paratha', 'parotta', 'chapati', 'poori', 'kulche'] },
  { image: biryani, keywords: ['biryani'] },
  { image: friedRice, keywords: ['fried rice'] },
  { image: noodles, keywords: ['noodles'] },
  { image: dosa, keywords: ['dosa', 'uttapam', 'idli', 'pesarattu', 'vada', 'upma'] },
  { image: soup, keywords: ['soup'] },
  { image: beverage, keywords: ['juice', 'milkshake', 'shake', 'water bottle'] },
  {
    image: tandoor,
    keywords: ['tikka', 'kebab', 'grilled', 'tandoori', 'malai tikka', 'lollipop', 'shawarma'],
  },
  {
    image: chineseStarter,
    keywords: [
      'manchurian',
      '65',
      'chilli',
      'schezwan',
      '555',
      'garlic chicken',
      'ginger chicken',
    ],
  },
]

export function getDishImage(item: MenuItem): string {
  const name = item.name.toLowerCase()

  for (const rule of RULES) {
    if (rule.keywords.some((keyword) => name.includes(keyword))) {
      return rule.image
    }
  }

  const isNonVegDish = !item.isVeg && NON_VEG_KEYWORDS.some((k) => name.includes(k))
  if (isNonVegDish) return curryNonVeg

  return curryVeg
}
