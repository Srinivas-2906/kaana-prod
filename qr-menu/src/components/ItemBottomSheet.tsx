import { X } from 'lucide-react'
import type { MenuItem } from '../types/menu'
import { VegIndicator } from './VegIndicator'
import { getItemMeta } from '../lib/itemMeta'
import { getDishImage } from '../lib/dishImages'

interface ItemBottomSheetProps {
  item: MenuItem | null
  onClose: () => void
}

export function ItemBottomSheet({ item, onClose }: ItemBottomSheetProps) {
  if (!item) return null

  const meta = getItemMeta(item)

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center sm:items-center">
      <button
        type="button"
        className="absolute inset-0 bg-black/40 backdrop-blur-[1px]"
        onClick={onClose}
        aria-label="Close item details"
      />

      <div
        role="dialog"
        aria-modal="true"
        aria-label={`${item.name} details`}
        className="relative z-10 w-full max-w-lg overflow-hidden rounded-t-2xl bg-white shadow-2xl sm:rounded-2xl"
      >
        <div className="relative h-40 w-full overflow-hidden bg-gray-100">
          <img
            src={getDishImage(item)}
            alt={item.name}
            className="h-full w-full object-cover"
          />
          <button
            type="button"
            onClick={onClose}
            className="absolute right-3 top-3 rounded-full bg-black/40 p-1.5 text-white backdrop-blur-sm hover:bg-black/55"
            aria-label="Close"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="flex items-start justify-between gap-3 border-b border-gray-100 px-4 py-3">
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2">
              <VegIndicator isVeg={item.isVeg} />
              <h2 className="truncate text-base font-bold text-gray-900">{item.name}</h2>
            </div>
            <div className="mt-1 text-sm font-bold text-gray-900">₹{item.price}</div>
          </div>
        </div>

        <div className="max-h-[calc(70vh-160px)] overflow-y-auto px-4 py-4 pb-[max(1rem,env(safe-area-inset-bottom))]">
          {item.description && (
            <p className="text-sm leading-relaxed text-gray-700">{item.description}</p>
          )}

          {(meta.spiceLevel || (meta.addons && meta.addons.length > 0)) && (
            <div className="mt-4 space-y-3 rounded-xl border border-gray-100 bg-gray-50 p-3">
              {meta.spiceLevel && (
                <div className="flex items-center justify-between gap-3">
                  <span className="text-xs font-bold uppercase tracking-wide text-gray-600">
                    Spice level
                  </span>
                  <span
                    className={`rounded-full px-2.5 py-1 text-xs font-bold ${
                      meta.spiceLevel === 'Spicy'
                        ? 'bg-red-50 text-red-700'
                        : meta.spiceLevel === 'Medium'
                          ? 'bg-amber-50 text-amber-700'
                          : 'bg-emerald-50 text-emerald-700'
                    }`}
                  >
                    {meta.spiceLevel}
                  </span>
                </div>
              )}

              {meta.addons && meta.addons.length > 0 && (
                <div>
                  <div className="text-xs font-bold uppercase tracking-wide text-gray-600">
                    Add-ons
                  </div>
                  <ul className="mt-2 space-y-2">
                    {meta.addons.map((addon) => (
                      <li
                        key={addon.id}
                        className="flex items-center justify-between text-sm text-gray-700"
                      >
                        <span>{addon.name}</span>
                        <span className="font-semibold text-gray-900">+₹{addon.price}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
