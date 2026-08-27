import React, { createContext, useContext, useState, useEffect } from 'react';

const CartContext = createContext();

export function useCart() {
  return useContext(CartContext);
}

export function CartProvider({ children }) {
  const [cart, setCart] = useState(() => {
    try {
      const saved = localStorage.getItem('cart');
      return saved ? JSON.parse(saved) : [];
    } catch (e) {
      console.error('Error loading cart from localStorage:', e);
      return [];
    }
  });

  useEffect(() => {
    try {
      localStorage.setItem('cart', JSON.stringify(cart));
    } catch (e) {
      console.error('Error saving cart to localStorage:', e);
    }
  }, [cart]);

  const addToCart = (product, size = 'Standard', qty = 1) => {
    const parsedQty = Math.max(1, parseInt(qty) || 1);
    setCart((prevCart) => {
      // Check if item with same name & size already in cart
      const existingIndex = prevCart.findIndex(
        (item) => item.product === product.name && item.size === size
      );

      if (existingIndex > -1) {
        const updated = [...prevCart];
        updated[existingIndex].qty += parsedQty;
        return updated;
      }

      return [
        ...prevCart,
        {
          id: product.id || `${Date.now()}-${Math.random()}`,
          product: product.name,
          price: product.price,
          image: product.images ? product.images[0] : '',
          size: size,
          qty: parsedQty
        }
      ];
    });
  };

  const removeFromCart = (index) => {
    setCart((prevCart) => prevCart.filter((_, i) => i !== index));
  };

  const updateQuantity = (index, newQty) => {
    const parsedQty = Math.max(1, parseInt(newQty) || 1);
    setCart((prevCart) =>
      prevCart.map((item, i) => (i === index ? { ...item, qty: parsedQty } : item))
    );
  };

  const clearCart = () => {
    setCart([]);
  };

  const getCartTotal = () => {
    return cart.reduce((sum, item) => sum + (item.price * (item.qty || 1)), 0);
  };

  const getCartCount = () => {
    return cart.reduce((count, item) => count + (item.qty || 1), 0);
  };

  return (
    <CartContext.Provider
      value={{
        cart,
        addToCart,
        removeFromCart,
        updateQuantity,
        clearCart,
        getCartTotal,
        getCartCount
      }}
    >
      {children}
    </CartContext.Provider>
  );
}
