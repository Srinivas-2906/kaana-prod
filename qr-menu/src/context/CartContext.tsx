import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from 'react'

interface CartContextValue {
  quantities: Record<string, number>
  totalItems: number
  addItem: (itemId: string) => void
  removeItem: (itemId: string) => void
  getQuantity: (itemId: string) => number
}

const CartContext = createContext<CartContextValue | null>(null)

export function CartProvider({ children }: { children: ReactNode }) {
  const [quantities, setQuantities] = useState<Record<string, number>>({})

  const addItem = useCallback((itemId: string) => {
    setQuantities((prev) => ({
      ...prev,
      [itemId]: (prev[itemId] ?? 0) + 1,
    }))
  }, [])

  const removeItem = useCallback((itemId: string) => {
    setQuantities((prev) => {
      const current = prev[itemId] ?? 0
      if (current <= 1) {
        const next = { ...prev }
        delete next[itemId]
        return next
      }
      return { ...prev, [itemId]: current - 1 }
    })
  }, [])

  const getQuantity = useCallback(
    (itemId: string) => quantities[itemId] ?? 0,
    [quantities],
  )

  const totalItems = useMemo(
    () => Object.values(quantities).reduce((sum, count) => sum + count, 0),
    [quantities],
  )

  const value = useMemo(
    () => ({ quantities, totalItems, addItem, removeItem, getQuantity }),
    [quantities, totalItems, addItem, removeItem, getQuantity],
  )

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>
}

export function useCart() {
  const context = useContext(CartContext)
  if (!context) {
    throw new Error('useCart must be used within CartProvider')
  }
  return context
}
