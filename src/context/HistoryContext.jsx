import React, { createContext, useContext, useState, useEffect } from 'react';

const HistoryContext = createContext();

export function useHistory() {
  return useContext(HistoryContext);
}

export function HistoryProvider({ children }) {
  const [history, setHistory] = useState(() => {
    try {
      const saved = localStorage.getItem('history');
      return saved ? JSON.parse(saved) : [];
    } catch (e) {
      console.error('Error loading history from localStorage:', e);
      return [];
    }
  });

  useEffect(() => {
    try {
      localStorage.setItem('history', JSON.stringify(history));
    } catch (e) {
      console.error('Error saving history to localStorage:', e);
    }
  }, [history]);

  const addOrder = (order) => {
    const newEntry = {
      id: `${Date.now()}-${Math.random()}`,
      product: order.product,
      size: order.size || 'Standard',
      qty: order.qty || 1,
      price: order.price,
      time: order.time || new Date().toLocaleString()
    };
    setHistory((prev) => [newEntry, ...prev]);
  };

  const addMultipleOrders = (items) => {
    const time = new Date().toLocaleString();
    const newEntries = items.map((item) => ({
      id: `${Date.now()}-${Math.random()}`,
      product: item.product,
      size: item.size || 'Standard',
      qty: item.qty || 1,
      price: item.price,
      time
    }));
    setHistory((prev) => [...newEntries, ...prev]);
  };

  const clearHistory = () => {
    setHistory([]);
  };

  return (
    <HistoryContext.Provider value={{ history, addOrder, addMultipleOrders, clearHistory }}>
      {children}
    </HistoryContext.Provider>
  );
}
