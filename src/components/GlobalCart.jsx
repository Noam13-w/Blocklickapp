
import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';

const CartContext = createContext();

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
};

export const CartProvider = ({ children }) => {
  const [cartItems, setCartItems] = useState([]);
  const [isLoading, setIsLoading] = useState(false);

  // טעינת הסל מ-localStorage בטעינת הדף - מייוח
  useEffect(() => {
    try {
      const savedCart = localStorage.getItem('blockclick_cart');
      if (savedCart) {
        const parsedCart = JSON.parse(savedCart);
        const validItems = parsedCart.filter(item => 
          item && 
          item.type && 
          item.size && 
          typeof item.price === 'number' && 
          item.image_url && 
          !item.image_url.startsWith('blob:')
        );
        setCartItems(validItems);
      }
    } catch (error) {
      console.error('Error loading cart:', error);
      localStorage.removeItem('blockclick_cart');
    }
  }, []);

  // שמירה אסינכרונית - שיפור ביצועים
  const saveCartToStorage = useCallback((items) => {
    try {
      if (items.length === 0) {
        localStorage.removeItem('blockclick_cart');
        return;
      }

      const itemsToSave = items.map(item => ({
        id: item.id,
        type: item.type,
        size: item.size,
        price: parseFloat(item.price) || 0,
        quantity: parseInt(item.quantity) || 1,
        added_at: item.added_at,
        image_url: item.image_url
      }));

      localStorage.setItem('blockclick_cart', JSON.stringify(itemsToSave));
    } catch (error) {
      console.error('Failed to save cart:', error);
    }
  }, []);

  // שמירת הסל עם debounce לשיפור ביצועים
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      saveCartToStorage(cartItems);
    }, 100);

    return () => clearTimeout(timeoutId);
  }, [cartItems, saveCartToStorage]);

  const addToCart = useCallback((item) => {
    if (!item.image_url || item.image_url.startsWith('blob:')) {
      console.error('Cannot add item without valid server URL');
      return null;
    }
    
    const newItem = {
      ...item,
      id: `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      added_at: new Date().toISOString(),
      price: parseFloat(item.price) || 0,
      quantity: parseInt(item.quantity) || 1
    };

    setCartItems(prev => {
      const updated = [...prev, newItem];
      // הסרת הגבלה של 50 פריטים
      return updated;
    });
    
    return newItem;
  }, []);

  const removeFromCart = useCallback((itemId) => {
    setCartItems(prev => prev.filter(item => item.id !== itemId));
  }, []);

  const clearCart = useCallback(() => {
    setCartItems([]);
    localStorage.removeItem('blockclick_cart');
  }, []);

  const getTotalPrice = useCallback(() => {
    return cartItems.reduce((sum, item) => {
      const itemPrice = parseFloat(item.price) || 0;
      const itemQuantity = parseInt(item.quantity) || 1;
      
      // עבור סימניות - המחיר הוא לתמונה (3 שח), כפול כמות התמונות
      if (item.type === 'bookmark') {
        // item.images.length מכיל את מספר התמונות בסימניה
        const imageCount = item.images ? item.images.length : 2;
        return sum + (itemPrice * imageCount);
      }
      
      return sum + (itemPrice * itemQuantity);
    }, 0);
  }, [cartItems]);

  const getTotalItems = useCallback(() => {
    return cartItems.length;
  }, [cartItems]);

  const updateCartItem = useCallback((itemId, updates) => {
    setCartItems(prev => prev.map(item => 
      item.id === itemId ? { 
        ...item, 
        ...updates,
        price: parseFloat(updates.price || item.price) || 0,
        quantity: parseInt(updates.quantity || item.quantity) || 1
      } : item
    ));
  }, []);

  return (
    <CartContext.Provider value={{
      cartItems,
      addToCart,
      removeFromCart,
      clearCart,
      getTotalPrice,
      getTotalItems,
      updateCartItem,
      isLoading
    }}>
      {children}
    </CartContext.Provider>
  );
};
