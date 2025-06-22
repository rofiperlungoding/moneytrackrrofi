import React, { createContext, useContext, useState, useEffect } from 'react';
import { SUPPORTED_CURRENCIES, convertCurrency, formatCurrency, updateExchangeRates } from '../utils/currency';

interface CurrencyContextType {
  currentCurrency: string;
  exchangeRates: Record<string, number>;
  setCurrency: (currency: string) => void;
  convertAmount: (amount: number, fromCurrency?: string) => number;
  formatAmount: (amount: number, currency?: string) => string;
  refreshRates: () => Promise<void>;
  isLoading: boolean;
}

const CurrencyContext = createContext<CurrencyContextType | undefined>(undefined);

export const useCurrency = () => {
  const context = useContext(CurrencyContext);
  if (!context) {
    throw new Error('useCurrency must be used within a CurrencyProvider');
  }
  return context;
};

export const CurrencyProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentCurrency, setCurrentCurrency] = useState('USD');
  const [exchangeRates, setExchangeRates] = useState<Record<string, number>>({});
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const saved = localStorage.getItem('currency');
    if (saved && SUPPORTED_CURRENCIES[saved]) {
      setCurrentCurrency(saved);
    }
  }, []);

  useEffect(() => {
    localStorage.setItem('currency', currentCurrency);
  }, [currentCurrency]);

  useEffect(() => {
    // Initialize exchange rates
    const rates: Record<string, number> = {};
    Object.entries(SUPPORTED_CURRENCIES).forEach(([code, currency]) => {
      rates[code] = currency.rate;
    });
    setExchangeRates(rates);

    // Set up periodic rate updates (every 5 minutes in demo)
    const interval = setInterval(refreshRates, 5 * 60 * 1000);
    return () => clearInterval(interval);
  }, []);

  const setCurrency = (currency: string) => {
    if (SUPPORTED_CURRENCIES[currency]) {
      setCurrentCurrency(currency);
    }
  };

  const convertAmount = (amount: number, fromCurrency = 'USD'): number => {
    return convertCurrency(amount, fromCurrency, currentCurrency);
  };

  const formatAmount = (amount: number, currency = currentCurrency): string => {
    return formatCurrency(amount, currency);
  };

  const refreshRates = async () => {
    setIsLoading(true);
    try {
      await updateExchangeRates();
      const rates: Record<string, number> = {};
      Object.entries(SUPPORTED_CURRENCIES).forEach(([code, currency]) => {
        rates[code] = currency.rate;
      });
      setExchangeRates(rates);
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
      isLoading
    }}>
      {children}
    </CurrencyContext.Provider>
  );
};