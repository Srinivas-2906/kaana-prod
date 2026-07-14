import { X } from 'lucide-react'
import { menuData } from '../data/menuData'
import { useCart } from '../context/CartContext'
import { VegIndicator } from './VegIndicator'

interface CartDrawerProps {
  isOpen: boolean
  onClose: () => void
}

export function CartDrawer({ isOpen, onClose }: CartDrawerProps) {
  const { quantities, totalItems, addItem, removeItem } = useCart()

  if (!isOpen) return null

  const cartItems = menuData
    .flatMap((section) => section.items)
    .filter((item) => (quantities[item.id] ?? 0) > 0)
    .map((item) => ({
      ...item,
      quantity: quantities[item.id] ?? 0,
    }))

  const totalAmount = cartItems.reduce(
    (sum, item) => sum + item.price * item.quantity,
    0,
  )

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center sm:items-center">
      <button
        type="button"
        className="absolute inset-0 bg-black/40 backdrop-blur-[1px]"
        onClick={onClose}
        aria-label="Close cart"
      />

      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="cart-drawer-title"
        className="relative z-10 flex max-h-[80vh] w-full max-w-lg flex-col overflow-hidden rounded-t-2xl bg-white shadow-2xl sm:rounded-2xl"
      >
        <div className="flex items-center justify-between border-b border-gray-100 px-4 py-3">
          <h2 id="cart-drawer-title" className="text-base font-bold text-gray-900">
            Your Cart
          </h2>
          <button
            type="button"
            onClick={onClose}
            className="rounded-full p-1.5 text-gray-500 hover:bg-gray-100"
            aria-label="Close"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto px-4 py-3">
          {cartItems.length === 0 ? (
            <p className="py-8 text-center text-sm text-gray-500">Your cart is empty</p>
          ) : (
            <ul className="space-y-4">
              {cartItems.map((item) => (
                <li key={item.id} className="flex items-start justify-between gap-3">
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <VegIndicator isVeg={item.isVeg} size="sm" />
                      <span className="text-sm font-semibold text-gray-900">{item.name}</span>
                    </div>
                    <p className="mt-1 text-sm font-bold text-gray-700">
                      ₹{item.price}
                    </p>
                  </div>

                  <div className="flex items-center overflow-hidden rounded-lg border border-[#FC8019]">
                    <button
                      type="button"
                      onClick={() => removeItem(item.id)}
                      className="px-2.5 py-1 text-sm font-bold text-[#FC8019] hover:bg-orange-50"
                    >
                      −
                    </button>
                    <span className="min-w-[28px] px-1 text-center text-sm font-bold text-[#FC8019]">
                      {item.quantity}
                    </span>
                    <button
                      type="button"
                      onClick={() => addItem(item.id)}
                      className="px-2.5 py-1 text-sm font-bold text-[#FC8019] hover:bg-orange-50"
                    >
                      +
                    </button>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>

        {totalItems > 0 && (
          <div className="border-t border-gray-100 px-4 py-4 pb-[max(1rem,env(safe-area-inset-bottom))]">
            <div className="mb-3 flex items-center justify-between text-sm">
              <span className="text-gray-600">Subtotal</span>
              <span className="font-bold text-gray-900">₹{totalAmount}</span>
            </div>
            <button
              type="button"
              className="w-full rounded-xl bg-[#FC8019] py-3 text-sm font-bold uppercase tracking-wide text-white shadow-md"
            >
              Place Order — ₹{totalAmount}
            </button>
          </div>
        )}
      </div>
    </div>
  )
}
