import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { useReferenceData, DbCurrency } from './ReferenceDataContext';

interface CurrencyContextType {
  currentCurrency: string;
  exchangeRates: Record<string, number>;
  setCurrency: (currency: string) => void;
  convertAmount: (amount: number, fromCurrency?: string) => number;
  formatAmount: (amount: number, currency?: string) => string;
  refreshRates: () => Promise<void>;
  isLoading: boolean;
  availableCurrencies: DbCurrency[];
}

const CurrencyContext = createContext<CurrencyContextType | undefined>(undefined);

// eslint-disable-next-line react-refresh/only-export-components
export const useCurrency = () => {
  const context = useContext(CurrencyContext);
  if (!context) {
    throw new Error('useCurrency must be used within a CurrencyProvider');
  }
  return context;
};

export const CurrencyProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { currencies, currencyMap, refresh } = useReferenceData();
  const [currentCurrency, setCurrentCurrency] = useState('USD');
  const [exchangeRates, setExchangeRates] = useState<Record<string, number>>({});
  const [isLoading, setIsLoading] = useState(false);

  // Load saved currency preference
  useEffect(() => {
    const saved = localStorage.getItem('currency');
    if (saved && currencyMap[saved]) {
      setCurrentCurrency(saved);
    }
  }, [currencyMap]);

  // Save currency preference
  useEffect(() => {
    localStorage.setItem('currency', currentCurrency);
  }, [currentCurrency]);

  // Build exchange rates from database currencies
  useEffect(() => {
    const rates: Record<string, number> = {};
    currencies.forEach((c) => {
      rates[c.code] = c.rate;
    });
    setExchangeRates(rates);
  }, [currencies]);

  const setCurrency = (currency: string) => {
    if (currencyMap[currency]) {
      setCurrentCurrency(currency);
    }
  };

  const convertAmount = useCallback((amount: number, fromCurrency = 'USD'): number => {
    if (fromCurrency === currentCurrency) return amount;
    const fromRate = exchangeRates[fromCurrency] || 1;
    const toRate = exchangeRates[currentCurrency] || 1;
    const usdAmount = amount / fromRate;
    return usdAmount * toRate;
  }, [currentCurrency, exchangeRates]);

  const formatAmount = useCallback((amount: number, currency = currentCurrency): string => {
    const curr = currencyMap[currency];
    if (!curr) return `${amount}`;

    const formatted = new Intl.NumberFormat('en-US', {
      minimumFractionDigits: curr.decimal_places,
      maximumFractionDigits: curr.decimal_places,
    }).format(Math.abs(amount));

    return `${curr.symbol}${formatted}`;
  }, [currentCurrency, currencyMap]);

  const refreshRates = async () => {
    setIsLoading(true);
    try {
      await refresh();
    } catch (error) {
      console.error('Failed to update exchange rates:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <CurrencyContext.Provider value={{
      currentCurrency,
      exchangeRates,
      setCurrency,
      convertAmount,
      formatAmount,
      refreshRates,
      isLoading,
      availableCurrencies: currencies,
    }}>
      {children}
    </CurrencyContext.Provider>
  );
};