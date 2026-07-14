export type TopCategoryId = 'indian' | 'chinese' | 'south-indian'

export interface MenuItem {
  id: string
  name: string
  price: number
  isVeg: boolean
  isBestseller?: boolean
  description?: string
}

export interface MenuSection {
  id: string
  title: string
  topCategory: TopCategoryId
  items: MenuItem[]
}

export interface TopCategory {
  id: TopCategoryId
  label: string
}
