import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { supabase } from '../lib/supabase';
import { useAuth } from './AuthContext';

export interface Transaction {
  id: string;
  type: 'income' | 'expense';
  amount: number;
  description: string;
  category: string;
  date: string;
  time: string;
  paymentMethod?: string;
  source?: string;
  merchant?: string;
  notes?: string;
  recurring?: boolean;
  currency?: string;
}

export interface Goal {
  id: string;
  title: string;
  description: string;
  targetAmount: number;
  currentAmount: number;
  deadline: string;
  category: 'savings' | 'expense-limit' | 'income-target';
  priority: 'low' | 'medium' | 'high';
  status: 'active' | 'completed' | 'paused';
  createdAt: string;
  currency?: string;
  targetCategory?: string;
}

export interface UserSettings {
  profile: {
    name: string;
    avatar: string;
    currency: string;
  };
  notifications: {
    budgetAlerts: boolean;
    goalReminders: boolean;
    weeklyReports: boolean;
    emailNotifications: boolean;
  };
  privacy: {
    showBalances: boolean;
    dataBackup: boolean;
    analytics: boolean;
  };
  appearance: {
    colorScheme: string;
    fontSize: 'small' | 'medium' | 'large';
    layout: 'compact' | 'comfortable';
  };
}

interface FinanceContextType {
  transactions: Transaction[];
  goals: Goal[];
  settings: UserSettings;
  loading: boolean;
  error: string | null;
  
  // Transaction methods
  addTransaction: (transaction: Omit<Transaction, 'id'>) => Promise<void>;
  updateTransaction: (id: string, transaction: Partial<Transaction>) => Promise<void>;
  deleteTransaction: (id: string) => Promise<void>;
  loadTransactions: (page?: number, limit?: number) => Promise<Transaction[]>;
  
  // Goal methods
  addGoal: (goal: Omit<Goal, 'id' | 'createdAt'>) => Promise<void>;
  updateGoal: (id: string, goal: Partial<Goal>) => Promise<void>;
  deleteGoal: (id: string) => Promise<void>;
  loadGoals: () => Promise<Goal[]>;
  
  // Settings methods
  updateSettings: (settings: Partial<UserSettings>) => Promise<void>;
  loadSettings: () => Promise<void>;
  
  // Analytics methods (optimized for performance)
  getTotalIncome: () => number;
  getTotalExpenses: () => number;
  getNetWorth: () => number;
  getCategoryTotals: () => Record<string, number>;
  getLargestTransactionAmount: () => number;
  getUniqueCategoriesCount: () => number;
  getTotalTransactionsCount: () => number;
  getDailyAverageExpense: () => number;
  getRecentChange: (type: 'income' | 'expense' | 'networth') => { amount: number; percentage: number };
  
  // Pagination state
  hasMoreTransactions: boolean;
  transactionsPage: number;
  loadMoreTransactions: () => Promise<void>;
}

const FinanceContext = createContext<FinanceContextType | undefined>(undefined);

export const useFinance = () => {
  const context = useContext(FinanceContext);
  if (!context) {
    throw new Error('useFinance must be used within a FinanceProvider');
  }
  return context;
};

const defaultSettings: UserSettings = {
  profile: {
    name: 'User',
    avatar: '👤',
    currency: 'USD'
  },
  notifications: {
    budgetAlerts: true,
    goalReminders: true,
    weeklyReports: false,
    emailNotifications: false
  },
  privacy: {
    showBalances: true,
    dataBackup: true,
    analytics: false
  },
  appearance: {
    colorScheme: 'green',
    fontSize: 'medium',
    layout: 'comfortable'
  }
};

const TRANSACTIONS_PER_PAGE = 20;

export const FinanceProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user } = useAuth();
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [goals, setGoals] = useState<Goal[]>([]);
  const [settings, setSettings] = useState<UserSettings>(defaultSettings);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // Pagination state
  const [hasMoreTransactions, setHasMoreTransactions] = useState(true);
  const [transactionsPage, setTransactionsPage] = useState(0);

  // Check if Supabase is configured
  const isSupabaseConfigured = useCallback(() => {
    const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
    const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY;
    return supabaseUrl && supabaseUrl !== 'YOUR_SUPABASE_URL' && 
           supabaseKey && supabaseKey !== 'YOUR_SUPABASE_ANON_KEY';
  }, []);

  // Fallback to localStorage for compatibility
  const getLocalStorageKey = useCallback((type: string) => {
    return user ? `finance_${type}_${user.id}` : `finance_${type}`;
  }, [user]);

  // Load initial data
  useEffect(() => {
    if (user) {
      loadInitialData();
    } else {
      // Load from localStorage if not authenticated
      loadFromLocalStorage();
    }
  }, [user]);

  const loadInitialData = async () => {
    setLoading(true);
    setError(null);
    
    try {
      await Promise.all([
        loadSettings(),
        loadGoals(),
        loadTransactions(0, TRANSACTIONS_PER_PAGE)
      ]);
    } catch (err) {
      console.error('Error loading initial data:', err);
      setError('Failed to load data');
      // Fallback to localStorage
      loadFromLocalStorage();
    } finally {
      setLoading(false);
    }
  };

  const loadFromLocalStorage = () => {
    try {
      const savedTransactions = localStorage.getItem(getLocalStorageKey('transactions'));
      const savedGoals = localStorage.getItem(getLocalStorageKey('goals'));
      const savedSettings = localStorage.getItem(getLocalStorageKey('settings'));

      if (savedTransactions) {
        setTransactions(JSON.parse(savedTransactions));
      }
      if (savedGoals) {
        setGoals(JSON.parse(savedGoals));
      }
      if (savedSettings) {
        setSettings(JSON.parse(savedSettings));
      }
    } catch (err) {
      console.error('Error loading from localStorage:', err);
    }
  };

  const saveToLocalStorage = useCallback((type: string, data: any) => {
    try {
      localStorage.setItem(getLocalStorageKey(type), JSON.stringify(data));
    } catch (err) {
      console.error(`Error saving ${type} to localStorage:`, err);
    }
  }, [getLocalStorageKey]);

  // Transaction methods
  const loadTransactions = async (page = 0, limit = TRANSACTIONS_PER_PAGE): Promise<Transaction[]> => {
    if (!user || !isSupabaseConfigured()) {
      return transactions.slice(page * limit, (page + 1) * limit);
    }

    try {
      const start = page * limit;
      const end = start + limit - 1;

      const { data, error, count } = await supabase
        .from('transactions')
        .select('*', { count: 'exact' })
        .eq('user_id', user.id)
        .order('date', { ascending: false })
        .order('time', { ascending: false })
        .range(start, end);

      if (error) throw error;

      const mappedTransactions = data.map(t => ({
        id: t.id,
        type: t.type,
        amount: parseFloat(t.amount),
        description: t.description,
        category: t.category,
        date: t.date,
        time: t.time,
        paymentMethod: t.payment_method,
        source: t.source,
        merchant: t.merchant,
        notes: t.notes,
        recurring: t.recurring,
        currency: t.currency
      }));

      if (page === 0) {
        setTransactions(mappedTransactions);
      } else {
        setTransactions(prev => [...prev, ...mappedTransactions]);
      }

      setHasMoreTransactions((count || 0) > (page + 1) * limit);
      setTransactionsPage(page);

      return mappedTransactions;
    } catch (err) {
      console.error('Error loading transactions:', err);
      throw err;
    }
  };

  const loadMoreTransactions = async () => {
    if (!hasMoreTransactions || loading) return;
    await loadTransactions(transactionsPage + 1, TRANSACTIONS_PER_PAGE);
  };

  const addTransaction = async (transaction: Omit<Transaction, 'id'>) => {
    if (!user || !isSupabaseConfigured()) {
      const newTransaction: Transaction = {
        ...transaction,
        id: Date.now().toString(),
        currency: transaction.currency || settings.profile.currency
      };
      const newTransactions = [newTransaction, ...transactions];
      setTransactions(newTransactions);
      saveToLocalStorage('transactions', newTransactions);
      return;
    }

    try {
      const { data, error } = await supabase
        .from('transactions')
        .insert([{
          user_id: user.id,
          type: transaction.type,
          amount: transaction.amount,
          description: transaction.description,
          category: transaction.category,
          date: transaction.date,
          time: transaction.time,
          payment_method: transaction.paymentMethod,
          source: transaction.source,
          merchant: transaction.merchant,
          notes: transaction.notes,
          recurring: transaction.recurring,
          currency: transaction.currency || settings.profile.currency
        }])
        .select()
        .single();

      if (error) throw error;

      const newTransaction: Transaction = {
        id: data.id,
        type: data.type,
        amount: parseFloat(data.amount),
        description: data.description,
        category: data.category,
        date: data.date,
        time: data.time,
        paymentMethod: data.payment_method,
        source: data.source,
        merchant: data.merchant,
        notes: data.notes,
        recurring: data.recurring,
        currency: data.currency
      };

      setTransactions(prev => [newTransaction, ...prev]);
    } catch (err) {
      console.error('Error adding transaction:', err);
      setError('Failed to add transaction');
      throw err;
    }
  };

  const updateTransaction = async (id: string, updatedTransaction: Partial<Transaction>) => {
    if (!user || !isSupabaseConfigured()) {
      const newTransactions = transactions.map(t => 
        t.id === id ? { ...t, ...updatedTransaction } : t
      );
      setTransactions(newTransactions);
      saveToLocalStorage('transactions', newTransactions);
      return;
    }

    try {
      const { error } = await supabase
        .from('transactions')
        .update({
          type: updatedTransaction.type,
          amount: updatedTransaction.amount,
          description: updatedTransaction.description,
          category: updatedTransaction.category,
          date: updatedTransaction.date,
          time: updatedTransaction.time,
          payment_method: updatedTransaction.paymentMethod,
          source: updatedTransaction.source,
          merchant: updatedTransaction.merchant,
          notes: updatedTransaction.notes,
          recurring: updatedTransaction.recurring,
          currency: updatedTransaction.currency
        })
        .eq('id', id)
        .eq('user_id', user.id);

      if (error) throw error;

      setTransactions(prev => 
        prev.map(t => t.id === id ? { ...t, ...updatedTransaction } : t)
      );
    } catch (err) {
      console.error('Error updating transaction:', err);
      setError('Failed to update transaction');
      throw err;
    }
  };

  const deleteTransaction = async (id: string) => {
    if (!user || !isSupabaseConfigured()) {
      const newTransactions = transactions.filter(t => t.id !== id);
      setTransactions(newTransactions);
      saveToLocalStorage('transactions', newTransactions);
      return;
    }

    try {
      const { error } = await supabase
        .from('transactions')
        .delete()
        .eq('id', id)
        .eq('user_id', user.id);

      if (error) throw error;

      setTransactions(prev => prev.filter(t => t.id !== id));
    } catch (err) {
      console.error('Error deleting transaction:', err);
      setError('Failed to delete transaction');
      throw err;
    }
  };

  // Goal methods
  const loadGoals = async (): Promise<Goal[]> => {
    if (!user || !isSupabaseConfigured()) {
      return goals;
    }

    try {
      const { data, error } = await supabase
        .from('goals')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;

      const mappedGoals = data.map(g => ({
        id: g.id,
        title: g.title,
        description: g.description,
        targetAmount: parseFloat(g.target_amount),
        currentAmount: parseFloat(g.current_amount),
        deadline: g.deadline,
        category: g.category,
        priority: g.priority,
        status: g.status,
        createdAt: g.created_at,
        currency: g.currency,
        targetCategory: g.target_category
      }));

      setGoals(mappedGoals);
      return mappedGoals;
    } catch (err) {
      console.error('Error loading goals:', err);
      throw err;
    }
  };

  const addGoal = async (goal: Omit<Goal, 'id' | 'createdAt'>) => {
    if (!user || !isSupabaseConfigured()) {
      const newGoal: Goal = {
        ...goal,
        id: Date.now().toString(),
        createdAt: new Date().toISOString(),
        currency: goal.currency || settings.profile.currency
      };
      const newGoals = [newGoal, ...goals];
      setGoals(newGoals);
      saveToLocalStorage('goals', newGoals);
      return;
    }

    try {
      const { data, error } = await supabase
        .from('goals')
        .insert([{
          user_id: user.id,
          title: goal.title,
          description: goal.description,
          target_amount: goal.targetAmount,
          current_amount: goal.currentAmount,
          deadline: goal.deadline,
          category: goal.category,
          priority: goal.priority,
          status: goal.status,
          target_category: goal.targetCategory,
          currency: goal.currency || settings.profile.currency
        }])
        .select()
        .single();

      if (error) throw error;

      const newGoal: Goal = {
        id: data.id,
        title: data.title,
        description: data.description,
        targetAmount: parseFloat(data.target_amount),
        currentAmount: parseFloat(data.current_amount),
        deadline: data.deadline,
        category: data.category,
        priority: data.priority,
        status: data.status,
        createdAt: data.created_at,
        currency: data.currency,
        targetCategory: data.target_category
      };

      setGoals(prev => [newGoal, ...prev]);
    } catch (err) {
      console.error('Error adding goal:', err);
      setError('Failed to add goal');
      throw err;
    }
  };

  const updateGoal = async (id: string, updatedGoal: Partial<Goal>) => {
    if (!user || !isSupabaseConfigured()) {
      const newGoals = goals.map(g => 
        g.id === id ? { ...g, ...updatedGoal } : g
      );
      setGoals(newGoals);
      saveToLocalStorage('goals', newGoals);
      return;
    }

    try {
      const { error } = await supabase
        .from('goals')
        .update({
          title: updatedGoal.title,
          description: updatedGoal.description,
          target_amount: updatedGoal.targetAmount,
          current_amount: updatedGoal.currentAmount,
          deadline: updatedGoal.deadline,
          category: updatedGoal.category,
          priority: updatedGoal.priority,
          status: updatedGoal.status,
          target_category: updatedGoal.targetCategory,
          currency: updatedGoal.currency
        })
        .eq('id', id)
        .eq('user_id', user.id);

      if (error) throw error;

      setGoals(prev => 
        prev.map(g => g.id === id ? { ...g, ...updatedGoal } : g)
      );
    } catch (err) {
      console.error('Error updating goal:', err);
      setError('Failed to update goal');
      throw err;
    }
  };

  const deleteGoal = async (id: string) => {
    if (!user || !isSupabaseConfigured()) {
      const newGoals = goals.filter(g => g.id !== id);
      setGoals(newGoals);
      saveToLocalStorage('goals', newGoals);
      return;
    }

    try {
      const { error } = await supabase
        .from('goals')
        .delete()
        .eq('id', id)
        .eq('user_id', user.id);

      if (error) throw error;

      setGoals(prev => prev.filter(g => g.id !== id));
    } catch (err) {
      console.error('Error deleting goal:', err);
      setError('Failed to delete goal');
      throw err;
    }
  };

  // Settings methods
  const loadSettings = async () => {
    if (!user || !isSupabaseConfigured()) {
      return;
    }

    try {
      const { data, error } = await supabase
        .from('user_settings')
        .select('settings')
        .eq('user_id', user.id)
        .single();

      if (error && error.code !== 'PGRST116') { // Not found error
        throw error;
      }

      if (data?.settings) {
        setSettings(prev => ({ ...prev, ...data.settings }));
      }
    } catch (err) {
      console.error('Error loading settings:', err);
    }
  };

  const updateSettings = async (newSettings: Partial<UserSettings>) => {
    const updatedSettings = {
      ...settings,
      ...newSettings,
      profile: { ...settings.profile, ...(newSettings.profile || {}) },
      notifications: { ...settings.notifications, ...(newSettings.notifications || {}) },
      privacy: { ...settings.privacy, ...(newSettings.privacy || {}) },
      appearance: { ...settings.appearance, ...(newSettings.appearance || {}) }
    };
    
    setSettings(updatedSettings);

    if (!user || !isSupabaseConfigured()) {
      saveToLocalStorage('settings', updatedSettings);
      return;
    }

    try {
      const { error } = await supabase
        .from('user_settings')
        .upsert({
          user_id: user.id,
          settings: updatedSettings
        });

      if (error) throw error;
    } catch (err) {
      console.error('Error updating settings:', err);
      setError('Failed to update settings');
      // Fallback to localStorage
      saveToLocalStorage('settings', updatedSettings);
    }
  };

  // Analytics methods (cached for performance)
  const getTotalIncome = useCallback(() => {
    return transactions
      .filter(t => t.type === 'income')
      .reduce((total, t) => total + t.amount, 0);
  }, [transactions]);

  const getTotalExpenses = useCallback(() => {
    return transactions
      .filter(t => t.type === 'expense')
      .reduce((total, t) => total + t.amount, 0);
  }, [transactions]);

  const getNetWorth = useCallback(() => {
    return getTotalIncome() - getTotalExpenses();
  }, [getTotalIncome, getTotalExpenses]);

  const getCategoryTotals = useCallback(() => {
    const totals: Record<string, number> = {};
    transactions.forEach(t => {
      if (t.type === 'expense') {
        totals[t.category] = (totals[t.category] || 0) + t.amount;
      }
    });
    return totals;
  }, [transactions]);

  const getLargestTransactionAmount = useCallback(() => {
    if (transactions.length === 0) return 0;
    return Math.max(...transactions.map(t => t.amount));
  }, [transactions]);

  const getUniqueCategoriesCount = useCallback(() => {
    const categories = new Set(transactions.map(t => t.category));
    return categories.size;
  }, [transactions]);

  const getTotalTransactionsCount = useCallback(() => {
    return transactions.length;
  }, [transactions]);

  const getDailyAverageExpense = useCallback(() => {
    const expenses = transactions.filter(t => t.type === 'expense');
    if (expenses.length === 0) return 0;

    const dates = new Set(expenses.map(t => t.date));
    const totalExpenseAmount = expenses.reduce((sum, t) => sum + t.amount, 0);
    
    return dates.size > 0 ? totalExpenseAmount / dates.size : 0;
  }, [transactions]);

  const getRecentChange = useCallback((type: 'income' | 'expense' | 'networth') => {
    const now = new Date();
    const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
    const sixtyDaysAgo = new Date(now.getTime() - 60 * 24 * 60 * 60 * 1000);

    const recent = transactions.filter(t => {
      const transactionDate = new Date(t.date);
      return transactionDate >= thirtyDaysAgo && transactionDate <= now;
    });

    const previous = transactions.filter(t => {
      const transactionDate = new Date(t.date);
      return transactionDate >= sixtyDaysAgo && transactionDate < thirtyDaysAgo;
    });

    let currentValue = 0;
    let previousValue = 0;

    switch (type) {
      case 'income':
        currentValue = recent.filter(t => t.type === 'income').reduce((sum, t) => sum + t.amount, 0);
        previousValue = previous.filter(t => t.type === 'income').reduce((sum, t) => sum + t.amount, 0);
        break;
      case 'expense':
        currentValue = recent.filter(t => t.type === 'expense').reduce((sum, t) => sum + t.amount, 0);
        previousValue = previous.filter(t => t.type === 'expense').reduce((sum, t) => sum + t.amount, 0);
        break;
      case 'networth':
        const currentIncome = recent.filter(t => t.type === 'income').reduce((sum, t) => sum + t.amount, 0);
        const currentExpenses = recent.filter(t => t.type === 'expense').reduce((sum, t) => sum + t.amount, 0);
        const previousIncome = previous.filter(t => t.type === 'income').reduce((sum, t) => sum + t.amount, 0);
        const previousExpenses = previous.filter(t => t.type === 'expense').reduce((sum, t) => sum + t.amount, 0);
        currentValue = currentIncome - currentExpenses;
        previousValue = previousIncome - previousExpenses;
        break;
    }

    const amount = currentValue - previousValue;
    const percentage = previousValue !== 0 ? (amount / Math.abs(previousValue)) * 100 : 0;

    return { amount, percentage };
  }, [transactions]);

  const value = {
    transactions,
    goals,
    settings,
    loading,
    error,
    addTransaction,
    updateTransaction,
    deleteTransaction,
    loadTransactions,
    addGoal,
    updateGoal,
    deleteGoal,
    loadGoals,
    updateSettings,
    loadSettings,
    getTotalIncome,
    getTotalExpenses,
    getNetWorth,
    getCategoryTotals,
    getLargestTransactionAmount,
    getUniqueCategoriesCount,
    getTotalTransactionsCount,
    getDailyAverageExpense,
    getRecentChange,
    hasMoreTransactions,
    transactionsPage,
    loadMoreTransactions
  };

  return (
    <FinanceContext.Provider value={value}>
      {children}
    </FinanceContext.Provider>
  );
};