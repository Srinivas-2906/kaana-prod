import { ChevronDown } from 'lucide-react'
import type { MenuItem } from '../types/menu'
import { VegIndicator } from './VegIndicator'
import { getDishImage } from '../lib/dishImages'
import { getItemMeta } from '../lib/itemMeta'

interface DishCardProps {
  item: MenuItem
  onOpen: (item: MenuItem) => void
  showRecommendedTag?: boolean
}

export function DishCard({ item, onOpen, showRecommendedTag = true }: DishCardProps) {
  const meta = getItemMeta(item)
  const hasDetails = Boolean(item.description) || Boolean(meta.spiceLevel) || Boolean(meta.addons?.length)

  return (
    <article className="flex gap-3 border-b border-gray-100 py-3 last:border-b-0">
      <div className="min-w-0 flex-1">
        <div className="flex items-start gap-2">
          <VegIndicator isVeg={item.isVeg} />
          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-center gap-2">
              <h3 className="text-[15px] font-semibold leading-snug text-gray-900">
                {item.name}
              </h3>
              {showRecommendedTag && item.isBestseller && (
                <span className="rounded border border-emerald-200 bg-emerald-50 px-1.5 py-0.5 text-[10px] font-bold uppercase tracking-wide text-emerald-700">
                  Recommended
                </span>
              )}
            </div>

            <div className="mt-0.5 text-sm font-bold text-gray-900">₹{item.price}</div>

            {hasDetails && (
              <button
                type="button"
                onClick={() => onOpen(item)}
                className="mt-1.5 inline-flex items-center gap-1 rounded-full border border-gray-200 bg-gray-50 px-2 py-1 text-[11px] font-semibold text-gray-600 hover:bg-gray-100 hover:text-gray-800"
              >
                View details
                <ChevronDown className="h-3 w-3" aria-hidden />
              </button>
            )}
          </div>
        </div>
      </div>

      <button
        type="button"
        onClick={() => onOpen(item)}
        className="block h-[84px] w-[84px] shrink-0 overflow-hidden rounded-xl bg-gray-100 ring-1 ring-gray-100"
        aria-label={`View ${item.name} details`}
      >
        <img
          src={getDishImage(item)}
          alt={item.name}
          loading="lazy"
          className="h-full w-full object-cover"
        />
      </button>
    </article>
  )
}
