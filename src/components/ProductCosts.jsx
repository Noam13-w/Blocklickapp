import React, { useState, useEffect } from 'react';

// עלויות ברירת מחדל
const DEFAULT_PRODUCT_COSTS = {
  block: {
    '10x10': 3.7,
    '10x15': 4.7,
    '15x20': 9.2
  },
  magnet: {
    '7.5x10': 0.7,
    '10x15': 1.2,
    '15x20': 1.7
  },
  photo: {
    '7.5x10': 0.3,
    '10x15': 0.5,
    '15x20': 0.9
  },
  bookmark: 0.9
};

// קבלת עלויות מוצרים
export const getProductCosts = () => {
  try {
    const saved = localStorage.getItem('product_costs');
    return saved ? JSON.parse(saved) : DEFAULT_PRODUCT_COSTS;
  } catch (error) {
    console.error('Error loading product costs:', error);
    return DEFAULT_PRODUCT_COSTS;
  }
};

// שמירת עלויות מוצרים
export const saveProductCosts = (costs) => {
  try {
    localStorage.setItem('product_costs', JSON.stringify(costs));
    window.dispatchEvent(new CustomEvent('productCostsUpdated', { detail: costs }));
    return true;
  } catch (error) {
    console.error('Error saving product costs:', error);
    return false;
  }
};

// חישוב עלות פריט
export const calculateItemCost = (item, costs = null) => {
  const productCosts = costs || getProductCosts();
  
  if (item.type === 'bookmark') {
    return productCosts.bookmark || 0;
  }
  
  if (productCosts[item.type] && productCosts[item.type][item.size]) {
    return productCosts[item.type][item.size];
  }
  
  return 0;
};

// חישוב עלות הזמנה
export const calculateOrderCost = (order, costs = null) => {
  if (!order.items || !Array.isArray(order.items)) return 0;
  
  return order.items.reduce((total, item) => {
    const itemCost = calculateItemCost(item, costs);
    const quantity = item.quantity || 1;
    return total + (itemCost * quantity);
  }, 0);
};

// חישוב רווח הזמנה
export const calculateOrderProfit = (order, costs = null) => {
  const revenue = order.total_price || 0;
  const cost = calculateOrderCost(order, costs);
  return revenue - cost;
};

// hook לשימוש בעלויות מוצרים עם עדכון אוטומטי
export const useProductCosts = () => {
  const [costs, setCosts] = useState(getProductCosts);
  
  useEffect(() => {
    const handleCostsUpdate = (event) => {
      setCosts(event.detail);
    };
    
    window.addEventListener('productCostsUpdated', handleCostsUpdate);
    return () => window.removeEventListener('productCostsUpdated', handleCostsUpdate);
  }, []);
  
  return costs;
};