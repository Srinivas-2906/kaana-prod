import type { MenuSection } from '../types/menu'
import { DishCard } from './DishCard'

interface MenuSectionBlockProps {
  section: MenuSection
  onOpenItem: (item: MenuSection['items'][number]) => void
  hideRecommendedTag?: boolean
}

export function MenuSectionBlock({
  section,
  onOpenItem,
  hideRecommendedTag,
}: MenuSectionBlockProps) {
  if (section.items.length === 0) return null

  const isRecommendedSection =
    section.title.toLowerCase() === 'recommended' || section.id.endsWith('-recommended')

  return (
    <section
      id={section.id}
      data-section-id={section.id}
      className="scroll-mt-32 px-4"
    >
      <h2
        className={
          isRecommendedSection
            ? 'py-3 text-base font-bold text-gray-900'
            : 'py-3 text-sm font-extrabold uppercase tracking-wide text-gray-700'
        }
      >
        {section.title}
      </h2>

      <div className="rounded-xl border border-gray-100 bg-white px-3 shadow-sm">
        {section.items.map((item) => (
          <DishCard
            key={item.id}
            item={item}
            onOpen={onOpenItem}
            showRecommendedTag={!hideRecommendedTag}
          />
        ))}
      </div>
    </section>
  )
}
