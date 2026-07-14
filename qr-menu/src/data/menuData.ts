import type { MenuSection, TopCategory } from '../types/menu'
import sections from './menuSections.json'

export const RESTAURANT = {
  name: 'New Ram Sai',
  location: 'Madhavadhara',
  address: 'Lig, Vuda Layout, Madhavadhara, Visakhapatnam, Andhra Pradesh 530009',
  priceForTwo: 200,
  cuisines: ['North Indian', 'South Indian', 'Chinese', 'Tandoor'],
  isOpen: false,
  opensAt: '7:00 am',
}

export const TOP_CATEGORIES: TopCategory[] = [
  { id: 'indian', label: 'Indian' },
  { id: 'chinese', label: 'Chinese' },
  { id: 'south-indian', label: 'South Indian' },
]

export const menuData = sections as MenuSection[]
