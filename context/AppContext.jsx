'use client';

import React, { createContext, useState, useEffect } from 'react';

export const AppContext = createContext();

export const AppProvider = ({ children }) => {
  const [sellerInfo, setSellerInfo] = useState({
    name: '',
    email: '',
    businessName: '',
    productCategory: '',
    productDescription: '',
    location: '',
    productImage: null,
  });
  const [searchResults, setSearchResults] = useState([]);
  const [sentHistory, setSentHistory] = useState([]);

  useEffect(() => {
    const savedHistory = localStorage.getItem('decorconnect_history');
    if (savedHistory) {
      try {
        setSentHistory(JSON.parse(savedHistory));
      } catch (error) {
        console.error('Error parsing history:', error);
      }
    }
  }, []);

  const addToHistory = (batchRecord) => {
    setSentHistory((prev) => {
      const newHistory = [batchRecord, ...prev];
      localStorage.setItem('decorconnect_history', JSON.stringify(newHistory));
      return newHistory;
    });
  };

  return (
    <AppContext.Provider value={{
      sellerInfo, setSellerInfo,
      searchResults, setSearchResults,
      sentHistory, addToHistory
    }}>
      {children}
    </AppContext.Provider>
  );
};
