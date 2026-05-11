import { createContext, useContext, useState } from 'react'

const CartContext = createContext()

export function CartProvider({ children }) {
  const [cart, setCart] = useState({})

  function addToCart(product) {
    setCart(prev => {
      const existing = prev[product.id]
      if (existing) {
        if (existing.qty >= product.stock) return prev
        return { ...prev, [product.id]: { ...existing, qty: existing.qty + 1 } }
      }
      return { ...prev, [product.id]: { ...product, qty: 1 } }
    })
  }

  function removeFromCart(id) {
    setCart(prev => {
      const next = { ...prev }
      delete next[id]
      return next
    })
  }

  function changeQty(id, delta) {
    setCart(prev => {
      if (!prev[id]) return prev
      const newQty = prev[id].qty + delta
      if (newQty <= 0) {
        const next = { ...prev }
        delete next[id]
        return next
      }
      if (newQty > prev[id].stock) return prev
      return { ...prev, [id]: { ...prev[id], qty: newQty } }
    })
  }

  function clearCart() { setCart({}) }

  const items = Object.values(cart)
  const subtotal = items.reduce((a, i) => a + i.price * i.qty, 0)
  const discount = subtotal >= 500 ? subtotal * 0.1 : 0
  const total = subtotal - discount
  const count = items.reduce((a, i) => a + i.qty, 0)

  return (
    <CartContext.Provider value={{ cart, items, count, subtotal, discount, total, addToCart, removeFromCart, changeQty, clearCart }}>
      {children}
    </CartContext.Provider>
  )
}

export function useCart() { return useContext(CartContext) }