import type { MenuItem } from '../types/menu'

export type SpiceLevel = 'Mild' | 'Medium' | 'Spicy'

export interface AddonOption {
  id: string
  name: string
  price: number
}

export interface ItemMeta {
  spiceLevel?: SpiceLevel
  addons?: AddonOption[]
}

function containsAny(haystack: string, needles: string[]) {
  return needles.some((n) => haystack.includes(n))
}

function makeAddons(addons: Array<[string, number]>): AddonOption[] {
  return addons.map(([name, price]) => ({
    id: name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, ''),
    name,
    price,
  }))
}

export function getItemMeta(item: MenuItem): ItemMeta {
  const name = item.name.toLowerCase()

  if (name.includes('biryani')) {
    return {
      spiceLevel: 'Spicy',
      addons: makeAddons([
        ['Extra Raita', 20],
        ['Extra Gravy', 30],
        ['Boiled Egg', 25],
      ]),
    }
  }

  if (containsAny(name, ['chilli ', '65', 'schezwan', 'hot & sour', 'hot and sour'])) {
    return {
      spiceLevel: 'Spicy',
      addons: makeAddons([
        ['Extra Schezwan', 20],
        ['Extra Capsicum', 20],
      ]),
    }
  }

  if (containsAny(name, ['noodles', 'fried rice', 'manchurian'])) {
    return {
      spiceLevel: 'Medium',
      addons: makeAddons([
        ['Extra Schezwan', 20],
        ['Extra Veggies', 30],
      ]),
    }
  }

  if (name.includes('dosa') || name.includes('uttapam') || name.includes('idli')) {
    return {
      spiceLevel: 'Medium',
      addons: makeAddons([
        ['Extra Chutney', 10],
        ['Extra Sambar', 15],
        ['Butter', 10],
      ]),
    }
  }

  if (containsAny(name, ['butter chicken', 'kadai', 'rogan josh'])) {
    return {
      spiceLevel: 'Medium',
      addons: makeAddons([
        ['Extra Masala', 20],
        ['Extra Cream', 20],
      ]),
    }
  }

  return {}
}

