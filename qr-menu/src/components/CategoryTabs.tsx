import type { TopCategoryId } from '../types/menu'
import { TOP_CATEGORIES } from '../data/menuData'
import { DietToggle } from './DietToggle'

export type DietFilter = 'all' | 'veg' | 'non-veg'

interface CategoryTabsProps {
  activeCategory: TopCategoryId
  onCategoryChange: (category: TopCategoryId) => void
  dietFilter: DietFilter
  onDietFilterChange: (filter: DietFilter) => void
}

export function CategoryTabs({
  activeCategory,
  onCategoryChange,
  dietFilter,
  onDietFilterChange,
}: CategoryTabsProps) {
  return (
    <nav
      className="sticky top-[57px] z-20 flex items-center gap-2 overflow-x-auto border-b border-gray-100 bg-white px-4 py-2.5 scrollbar-hide"
      aria-label="Menu categories and diet filter"
    >
      {TOP_CATEGORIES.map((category) => {
        const isActive = category.id === activeCategory
        return (
          <button
            key={category.id}
            type="button"
            onClick={() => onCategoryChange(category.id)}
            className={`shrink-0 rounded-full px-4 py-2 text-sm font-semibold transition-colors ${
              isActive
                ? 'bg-[#FC8019] text-white shadow-sm'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            {category.label}
          </button>
        )
      })}

      <span className="mx-1 h-6 w-px shrink-0 bg-gray-200" aria-hidden />

      <div className="flex shrink-0 items-center gap-2">
        <DietToggle
          type="veg"
          active={dietFilter === 'veg'}
          onToggle={() =>
            onDietFilterChange(dietFilter === 'veg' ? 'all' : 'veg')
          }
        />
        <DietToggle
          type="non-veg"
          active={dietFilter === 'non-veg'}
          onToggle={() =>
            onDietFilterChange(dietFilter === 'non-veg' ? 'all' : 'non-veg')
          }
        />
      </div>
    </nav>
  )
}
