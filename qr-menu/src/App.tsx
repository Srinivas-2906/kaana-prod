import { useCallback, useMemo, useState } from 'react'
import { menuData } from './data/menuData'
import type { MenuSection, TopCategoryId } from './types/menu'
import { Header } from './components/Header'
import { SearchBar } from './components/SearchBar'
import { CategoryTabs, type DietFilter } from './components/CategoryTabs'
import { MenuSectionBlock } from './components/MenuSectionBlock'
import { FloatingMenuButton, MenuModal } from './components/MenuModal'
import { ItemBottomSheet } from './components/ItemBottomSheet'

function filterSections(
  sections: MenuSection[],
  category: TopCategoryId,
  query: string,
  dietFilter: DietFilter,
): MenuSection[] {
  const normalizedQuery = query.trim().toLowerCase()
  const isSearching = normalizedQuery.length > 0

  const scopedSections = sections
    .filter((section) => isSearching || section.topCategory === category)
    .map((section) => ({
      ...section,
      items: section.items.filter((item) => {
        if (dietFilter === 'veg' && !item.isVeg) return false
        if (dietFilter === 'non-veg' && item.isVeg) return false
        if (isSearching) return item.name.toLowerCase().includes(normalizedQuery)
        return true
      }),
    }))
    .filter((section) => section.items.length > 0)

  if (isSearching) return scopedSections

  const recommendedItems: MenuSection['items'] = []
  const recommendedIds = new Set<string>()

  for (const section of scopedSections) {
    for (const item of section.items) {
      if (!item.isBestseller) continue
      if (recommendedIds.has(item.id)) continue
      recommendedIds.add(item.id)
      recommendedItems.push(item)
    }
  }

  const remainingSections = scopedSections
    .map((section) => ({
      ...section,
      items: section.items.filter((item) => !item.isBestseller),
    }))
    .filter((section) => section.items.length > 0)

  if (recommendedItems.length === 0) return remainingSections

  return [
    {
      id: `${category}-recommended`,
      title: 'Recommended',
      topCategory: category,
      items: recommendedItems,
    },
    ...remainingSections,
  ]
}

export default function App() {
  const [activeCategory, setActiveCategory] = useState<TopCategoryId>('indian')
  const [searchQuery, setSearchQuery] = useState('')
  const [dietFilter, setDietFilter] = useState<DietFilter>('all')
  const [menuModalOpen, setMenuModalOpen] = useState(false)
  const [activeItemId, setActiveItemId] = useState<string | null>(null)

  const { tableLabel, modeLabel } = useMemo(() => {
    if (typeof window === 'undefined') return { tableLabel: null, modeLabel: 'Dine-in' }

    const params = new URLSearchParams(window.location.search)
    const table = params.get('table')?.trim()
    const mode = params.get('mode')?.trim().toLowerCase() || 'dine-in'

    const modeLabel =
      mode === 'takeaway' || mode === 'pickup'
        ? 'Takeaway'
        : mode === 'delivery'
          ? 'Delivery'
          : 'Dine-in'

    return { tableLabel: table ? `Table ${table}` : null, modeLabel }
  }, [])

  const visibleSections = useMemo(
    () => filterSections(menuData, activeCategory, searchQuery, dietFilter),
    [activeCategory, searchQuery, dietFilter],
  )

  const activeItem = useMemo(() => {
    if (!activeItemId) return null
    for (const section of menuData) {
      const found = section.items.find((i) => i.id === activeItemId)
      if (found) return found
    }
    return null
  }, [activeItemId])

  const modalSections = useMemo(
    () => menuData.filter((section) => section.topCategory === activeCategory),
    [activeCategory],
  )

  const scrollToSection = useCallback((sectionId: string) => {
    const section = menuData.find((s) => s.id === sectionId)
    if (!section) return

    setActiveCategory(section.topCategory)
    setSearchQuery('')

    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        document.getElementById(sectionId)?.scrollIntoView({
          behavior: 'smooth',
          block: 'start',
        })
      })
    })
  }, [])

  return (
    <div className="mx-auto min-h-dvh max-w-lg bg-gray-50 pb-20">
      <Header />
      {tableLabel && (
        <div className="border-b border-gray-100 bg-white px-4 py-2 text-xs font-medium text-gray-600">
          <span className="font-semibold text-gray-900">{tableLabel}</span>
          <span className="text-gray-300"> · </span>
          <span>{modeLabel}</span>
        </div>
      )}
      <SearchBar value={searchQuery} onChange={setSearchQuery} />
      <CategoryTabs
        activeCategory={activeCategory}
        onCategoryChange={setActiveCategory}
        dietFilter={dietFilter}
        onDietFilterChange={setDietFilter}
      />

      <main className="mt-2 space-y-4">
        {visibleSections.length > 0 ? (
          visibleSections.map((section) => (
            <MenuSectionBlock
              key={section.id}
              section={section}
              onOpenItem={(item) => setActiveItemId(item.id)}
              hideRecommendedTag={section.id.endsWith('-recommended')}
            />
          ))
        ) : (
          <div className="px-4 py-16 text-center">
            <p className="text-sm font-medium text-gray-500">No dishes found</p>
            <p className="mt-1 text-xs text-gray-400">Try a different search or category</p>
          </div>
        )}
      </main>

      <FloatingMenuButton onClick={() => setMenuModalOpen(true)} />
      <MenuModal
        isOpen={menuModalOpen}
        onClose={() => setMenuModalOpen(false)}
        onSelectSection={scrollToSection}
        sections={modalSections}
      />
      <ItemBottomSheet item={activeItem} onClose={() => setActiveItemId(null)} />
    </div>
  )
}
