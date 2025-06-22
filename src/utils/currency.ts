// Currency conversion and formatting utilities
interface Currency {
  code: string;
  symbol: string;
  name: string;
  rate: number; // Rate relative to USD
  decimalPlaces: number;
}

export const SUPPORTED_CURRENCIES: Record<string, Currency> = {
  USD: {
    code: 'USD',
    symbol: '$',
    name: 'US Dollar',
    rate: 1,
    decimalPlaces: 2
  },
  EUR: {
    code: 'EUR',
    symbol: '€',
    name: 'Euro',
    rate: 0.85,
    decimalPlaces: 2
  },
  GBP: {
    code: 'GBP',
    symbol: '£',
    name: 'British Pound',
    rate: 0.73,
    decimalPlaces: 2
  },
  JPY: {
    code: 'JPY',
    symbol: '¥',
    name: 'Japanese Yen',
    rate: 110.0,
    decimalPlaces: 0
  },
  IDR: {
    code: 'IDR',
    symbol: 'Rp',
    name: 'Indonesian Rupiah',
    rate: 15000.0,
    decimalPlaces: 0
  }
};

// Exchange rates (in a real app, fetch from API)
const EXCHANGE_RATES: Record<string, number> = {
  USD: 1.0,
  EUR: 0.85,
  GBP: 0.73,
  JPY: 110.0,
  IDR: 15000.0
};

export const convertCurrency = (amount: number, fromCurrency: string, toCurrency: string): number => {
  if (fromCurrency === toCurrency) return amount;
  
  // Convert to USD first, then to target currency
  const usdAmount = amount / EXCHANGE_RATES[fromCurrency];
  return usdAmount * EXCHANGE_RATES[toCurrency];
};

export const formatCurrency = (amount: number, currencyCode: string): string => {
  const currency = SUPPORTED_CURRENCIES[currencyCode];
  if (!currency) return `${amount}`;
  
  const formatted = new Intl.NumberFormat('en-US', {
    minimumFractionDigits: currency.decimalPlaces,
    maximumFractionDigits: currency.decimalPlaces
  }).format(Math.abs(amount)); // Use absolute value for formatting, handle sign separately
  
  return `${currency.symbol}${formatted}`;
};

const getCurrencySymbol = (currencyCode: string): string => {
  return SUPPORTED_CURRENCIES[currencyCode]?.symbol || '$';
};

export const updateExchangeRates = async (): Promise<void> => {
  // In a real app, fetch from API like exchangerate-api.com
  // For demo, simulate rate fluctuations
  Object.keys(EXCHANGE_RATES).forEach(currency => {
    if (currency !== 'USD') {
      const fluctuation = (Math.random() - 0.5) * 0.02; // ±1% fluctuation
      EXCHANGE_RATES[currency] *= (1 + fluctuation);
      // Update the currency definition as well
      if (SUPPORTED_CURRENCIES[currency]) {
        SUPPORTED_CURRENCIES[currency].rate = EXCHANGE_RATES[currency];
      }
    }
  });
};