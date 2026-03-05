import React, { createContext, useContext, useState } from 'react';

const CartCtx = createContext();
export const useCart = () => useContext(CartCtx);

export default function CartProvider({ children }) {
  const [items, setItems] = useState([]); // {product, quantity}

  function add(product, quantity = 1) {
    setItems(prev => {
      const idx = prev.findIndex(p => p.product.id === product.id);
      if (idx >= 0) {
        const copy = [...prev];
        copy[idx].quantity += quantity;
        return copy;
      }
      return [...prev, { product, quantity }];
    });
  }

  function update(productId, quantity) {
    setItems(prev =>
      prev.map(it =>
        it.product.id === productId ? { ...it, quantity } : it
      )
    );
  }

  function remove(productId) {
    setItems(prev => prev.filter(it => it.product.id !== productId));
  }

  function clear() {
    setItems([]);
  }

  const total = items.reduce((s, it) => s + it.product.price * it.quantity, 0);

  return (
    <CartCtx.Provider value={{ items, add, update, remove, clear, total }}>
      {children}
    </CartCtx.Provider>
  );
}
