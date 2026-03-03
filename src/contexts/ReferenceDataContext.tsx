import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { supabase } from '../lib/supabase';

// ============================================
// Types
// ============================================

export interface DbCurrency {
  id: string;
  code: string;
  symbol: string;
  name: string;
  rate: number;
  decimal_places: number;
  is_default: boolean;
  user_id: string | null;
}

export interface DbCategory {
  id: string;
  name: string;
  type: 'expense' | 'income' | 'goal';
  description: string | null;
  icon: string | null;
  color: string | null;
  sort_order: number;
  is_default: boolean;
  user_id: string | null;
}

export interface DbPaymentMethod {
  id: string;
  name: string;
  icon: string | null;
  sort_order: number;
  is_default: boolean;
  user_id: string | null;
}

export interface DbIncomeSource {
  id: string;
  name: string;
  icon: string | null;
  sort_order: number;
  is_default: boolean;
  user_id: string | null;
}

// ============================================
// Fallback data (used when Supabase is unavailable)
// ============================================

const FALLBACK_CURRENCIES: DbCurrency[] = [
  { id: '1', code: 'USD', symbol: '$', name: 'US Dollar', rate: 1, decimal_places: 2, is_default: true, user_id: null },
  { id: '2', code: 'EUR', symbol: '€', name: 'Euro', rate: 0.85, decimal_places: 2, is_default: true, user_id: null },
  { id: '3', code: 'GBP', symbol: '£', name: 'British Pound', rate: 0.73, decimal_places: 2, is_default: true, user_id: null },
  { id: '4', code: 'JPY', symbol: '¥', name: 'Japanese Yen', rate: 110.0, decimal_places: 0, is_default: true, user_id: null },
  { id: '5', code: 'IDR', symbol: 'Rp', name: 'Indonesian Rupiah', rate: 15000.0, decimal_places: 0, is_default: true, user_id: null },
];

const FALLBACK_EXPENSE_CATEGORIES: DbCategory[] = [
  'Food & Dining', 'Transportation', 'Housing', 'Entertainment', 'Utilities',
  'Healthcare', 'Shopping', 'Education', 'Other'
].map((name, i) => ({
  id: `exp-${i}`, name, type: 'expense' as const, description: null, icon: null,
  color: null, sort_order: i, is_default: true, user_id: null,
}));

const FALLBACK_INCOME_CATEGORIES: DbCategory[] = [
  'Employment', 'Freelance', 'Investment', 'Business', 'Allowance', 'Gifts', 'Other'
].map((name, i) => ({
  id: `inc-${i}`, name, type: 'income' as const, description: null, icon: null,
  color: null, sort_order: i, is_default: true, user_id: null,
}));

const FALLBACK_GOAL_CATEGORIES: DbCategory[] = [
  { id: 'goal-0', name: 'savings', type: 'goal', description: 'Save money for something specific', icon: null, color: null, sort_order: 0, is_default: true, user_id: null },
  { id: 'goal-1', name: 'expense-limit', type: 'goal', description: 'Set spending limits for categories', icon: null, color: null, sort_order: 1, is_default: true, user_id: null },
  { id: 'goal-2', name: 'income-target', type: 'goal', description: 'Set income goals to achieve', icon: null, color: null, sort_order: 2, is_default: true, user_id: null },
];

const FALLBACK_PAYMENT_METHODS: DbPaymentMethod[] = [
  'Cash', 'Credit Card', 'Debit Card', 'Digital Wallet', 'Bank Transfer', 'Other'
].map((name, i) => ({
  id: `pm-${i}`, name, icon: null, sort_order: i, is_default: true, user_id: null,
}));

const FALLBACK_INCOME_SOURCES: DbIncomeSource[] = [
  'Salary', 'Freelance', 'Investment', 'Business', 'Allowance', 'Gifts', 'Commission', 'Bonus', 'Other'
].map((name, i) => ({
  id: `is-${i}`, name, icon: null, sort_order: i, is_default: true, user_id: null,
}));

// ============================================
// Context
// ============================================

interface ReferenceDataContextType {
  currencies: DbCurrency[];
  expenseCategories: DbCategory[];
  incomeCategories: DbCategory[];
  goalCategories: DbCategory[];
  paymentMethods: DbPaymentMethod[];
  incomeSources: DbIncomeSource[];
  loading: boolean;
  error: string | null;
  refresh: () => Promise<void>;
  // Helper: get currency map for quick lookups
  currencyMap: Record<string, DbCurrency>;
}

const ReferenceDataContext = createContext<ReferenceDataContextType | undefined>(undefined);

// eslint-disable-next-line react-refresh/only-export-components
export const useReferenceData = () => {
  const context = useContext(ReferenceDataContext);
  if (!context) {
    throw new Error('useReferenceData must be used within a ReferenceDataProvider');
  }
  return context;
};

export const ReferenceDataProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currencies, setCurrencies] = useState<DbCurrency[]>(FALLBACK_CURRENCIES);
  const [categories, setCategories] = useState<DbCategory[]>([
    ...FALLBACK_EXPENSE_CATEGORIES,
    ...FALLBACK_INCOME_CATEGORIES,
    ...FALLBACK_GOAL_CATEGORIES,
  ]);
  const [paymentMethods, setPaymentMethods] = useState<DbPaymentMethod[]>(FALLBACK_PAYMENT_METHODS);
  const [incomeSources, setIncomeSources] = useState<DbIncomeSource[]>(FALLBACK_INCOME_SOURCES);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchAll = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const [currRes, catRes, pmRes, isRes] = await Promise.all([
        supabase.from('currencies').select('*').order('sort_order', { ascending: true }).order('code'),
        supabase.from('categories').select('*').order('sort_order', { ascending: true }),
        supabase.from('payment_methods').select('*').order('sort_order', { ascending: true }),
        supabase.from('income_sources').select('*').order('sort_order', { ascending: true }),
      ]);

      // Only update state if we got data (table exists and has rows)
      if (currRes.data && currRes.data.length > 0) setCurrencies(currRes.data);
      if (catRes.data && catRes.data.length > 0) setCategories(catRes.data);
      if (pmRes.data && pmRes.data.length > 0) setPaymentMethods(pmRes.data);
      if (isRes.data && isRes.data.length > 0) setIncomeSources(isRes.data);

      // Log errors but don't crash (tables might not exist yet)
      const errors = [currRes.error, catRes.error, pmRes.error, isRes.error].filter(Boolean);
      if (errors.length > 0) {
        console.warn('ReferenceData: Some tables not available yet, using fallbacks:', errors);
      }
    } catch (err) {
      console.warn('ReferenceData: Failed to fetch, using fallback data:', err);
      setError('Using offline data');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchAll();
  }, [fetchAll]);

  // Derived data
  const expenseCategories = categories.filter(c => c.type === 'expense');
  const incomeCategories = categories.filter(c => c.type === 'income');
  const goalCategories = categories.filter(c => c.type === 'goal');

  const currencyMap = currencies.reduce<Record<string, DbCurrency>>((acc, c) => {
    acc[c.code] = c;
    return acc;
  }, {});

  return (
    <ReferenceDataContext.Provider value={{
      currencies,
      expenseCategories,
      incomeCategories,
      goalCategories,
      paymentMethods,
      incomeSources,
      loading,
      error,
      refresh: fetchAll,
      currencyMap,
    }}>
      {children}
    </ReferenceDataContext.Provider>
  );
};
