import { useMemo } from 'react'
import { useCart } from '../context/CartContext'
import { menuData } from '../data/menuData'

interface CartBarProps {
  onViewCart: () => void
}

export function CartBar({ onViewCart }: CartBarProps) {
  const { totalItems, quantities } = useCart()

  const itemPriceById = useMemo(() => {
    const map = new Map<string, number>()
    for (const section of menuData) {
      for (const item of section.items) {
        map.set(item.id, item.price)
      }
    }
    return map
  }, [])

  const totalAmount = useMemo(() => {
    let sum = 0
    for (const [itemId, qty] of Object.entries(quantities)) {
      const price = itemPriceById.get(itemId) ?? 0
      sum += price * qty
    }
    return sum
  }, [quantities, itemPriceById])

  return (
    <div className="fixed inset-x-0 bottom-0 z-40 px-4 pb-[max(1rem,env(safe-area-inset-bottom))]">
      <button
        type="button"
        onClick={onViewCart}
        disabled={totalItems === 0}
        className={`flex w-full items-center gap-3 rounded-xl px-4 py-3.5 text-sm font-semibold shadow-lg transition active:scale-[0.99] ${
          totalItems === 0
            ? 'cursor-not-allowed bg-gray-200 text-gray-500 shadow-none'
            : 'bg-gray-900 text-white'
        }`}
        aria-disabled={totalItems === 0}
      >
        <span className="shrink-0">
          {totalItems} {totalItems === 1 ? 'item' : 'items'}
        </span>
        <span className="shrink-0">₹{totalAmount}</span>
        <span className="ml-auto font-bold uppercase tracking-wide">
          Review order
        </span>
      </button>
    </div>
  )
}
