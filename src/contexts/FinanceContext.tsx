import React, { createContext, useContext, useState, useEffect } from 'react';
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
  targetCategory?: string; // For expense-limit goals, which expense category to track
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
  syncing: boolean;
  addTransaction: (transaction: Omit<Transaction, 'id'>) => Promise<void>;
  updateTransaction: (id: string, transaction: Partial<Transaction>) => Promise<void>;
  deleteTransaction: (id: string) => Promise<void>;
  addGoal: (goal: Omit<Goal, 'id' | 'createdAt'>) => Promise<void>;
  updateGoal: (id: string, goal: Partial<Goal>) => Promise<void>;
  deleteGoal: (id: string) => Promise<void>;
  updateSettings: (settings: Partial<UserSettings>) => Promise<void>;
  syncData: () => Promise<void>;
  getTotalIncome: () => number;
  getTotalExpenses: () => number;
  getNetWorth: () => number;
  getCategoryTotals: () => Record<string, number>;
  getLargestTransactionAmount: () => number;
  getUniqueCategoriesCount: () => number;
  getTotalTransactionsCount: () => number;
  getDailyAverageExpense: () => number;
  getRecentChange: (type: 'income' | 'expense' | 'networth') => { amount: number; percentage: number };
}

const FinanceContext = createContext<FinanceContextType | undefined>(undefined);

export const useFinance = () => {
  const context = useContext(FinanceContext);
  if (!context) {
    throw new Error('useFinance must be used within a FinanceProvider');
  }
  return context;
};

const initialSettings: UserSettings = {
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

export const FinanceProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user } = useAuth();
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [goals, setGoals] = useState<Goal[]>([]);
  const [settings, setSettings] = useState<UserSettings>(initialSettings);
  const [loading, setLoading] = useState(true);
  const [syncing, setSyncing] = useState(false);

  // Load data when user changes
  useEffect(() => {
    if (user) {
      loadAllData();
      setupRealtimeSubscriptions();
    } else {
      // Reset data when user logs out
      setTransactions([]);
      setGoals([]);
      setSettings(initialSettings);
      setLoading(false);
    }
  }, [user]);

  // Migrate localStorage data to Supabase on first login
  useEffect(() => {
    if (user) {
      migrateLocalStorageData();
    }
  }, [user]);

  const isSupabaseConfigured = () => {
    const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
    const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY;
    return supabaseUrl && supabaseUrl !== 'your_supabase_url_here' && 
           supabaseKey && supabaseKey !== 'your_supabase_anon_key_here';
  };

  const migrateLocalStorageData = async () => {
    if (!user || !isSupabaseConfigured()) return;

    try {
      // Check if user already has data in Supabase
      const { data: existingTransactions } = await supabase
        .from('transactions')
        .select('count')
        .eq('user_id', user.id);

      if (existingTransactions && existingTransactions.length > 0 && existingTransactions[0].count > 0) {
        // User already has data in Supabase, skip migration
        return;
      }

      // Migrate localStorage data
      const localTransactions = localStorage.getItem('finance_transactions');
      const localGoals = localStorage.getItem('finance_goals');
      const localSettings = localStorage.getItem('finance_settings');

      if (localTransactions) {
        const transactions = JSON.parse(localTransactions);
        if (transactions.length > 0) {
          const transactionsToInsert = transactions.map((t: any) => ({
            id: t.id,
            user_id: user.id,
            type: t.type,
            amount: t.amount,
            description: t.description,
            category: t.category,
            date: t.date,
            time: t.time,
            payment_method: t.paymentMethod,
            source: t.source,
            merchant: t.merchant,
            notes: t.notes,
            recurring: t.recurring || false,
            currency: t.currency || 'USD'
          }));

          await supabase.from('transactions').insert(transactionsToInsert);
        }
      }

      if (localGoals) {
        const goals = JSON.parse(localGoals);
        if (goals.length > 0) {
          const goalsToInsert = goals.map((g: any) => ({
            id: g.id,
            user_id: user.id,
            title: g.title,
            description: g.description,
            target_amount: g.targetAmount,
            current_amount: g.currentAmount,
            deadline: g.deadline,
            category: g.category,
            priority: g.priority,
            status: g.status,
            target_category: g.targetCategory,
            currency: g.currency || 'USD'
          }));

          await supabase.from('goals').insert(goalsToInsert);
        }
      }

      if (localSettings) {
        const settings = JSON.parse(localSettings);
        await supabase
          .from('user_settings')
          .upsert({
            user_id: user.id,
            settings: settings
          });
      }

      // Clear localStorage after successful migration
      localStorage.removeItem('finance_transactions');
      localStorage.removeItem('finance_goals');
      localStorage.removeItem('finance_settings');

    } catch (error) {
      console.error('Error migrating localStorage data:', error);
    }
  };

  const loadAllData = async () => {
    if (!user) return;

    setLoading(true);
    try {
      if (isSupabaseConfigured()) {
        await Promise.all([
          loadTransactions(),
          loadGoals(),
          loadSettings()
        ]);
      } else {
        // Fallback to localStorage
        loadLocalStorageData();
      }
    } catch (error) {
      console.error('Error loading data:', error);
      // Fallback to localStorage on error
      loadLocalStorageData();
    } finally {
      setLoading(false);
    }
  };

  const loadLocalStorageData = () => {
    const savedTransactions = localStorage.getItem('finance_transactions');
    const savedGoals = localStorage.getItem('finance_goals');
    const savedSettings = localStorage.getItem('finance_settings');

    if (savedTransactions) {
      setTransactions(JSON.parse(savedTransactions));
    }
    if (savedGoals) {
      setGoals(JSON.parse(savedGoals));
    }
    if (savedSettings) {
      setSettings(JSON.parse(savedSettings));
    }
  };

  const loadTransactions = async () => {
    if (!user || !isSupabaseConfigured()) return;

    try {
      const { data, error } = await supabase
        .from('transactions')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error loading transactions:', error);
        return;
      }

      const formattedTransactions = data.map(t => ({
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

      setTransactions(formattedTransactions);
    } catch (error) {
      console.error('Error loading transactions:', error);
      setTransactions([]);
    }
  };

  const loadGoals = async () => {
    if (!user || !isSupabaseConfigured()) return;

    try {
      const { data, error } = await supabase
        .from('goals')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error loading goals:', error);
        return;
      }

      const formattedGoals = data.map(g => ({
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
        targetCategory: g.target_category,
        currency: g.currency
      }));

      setGoals(formattedGoals);
    } catch (error) {
      console.error('Error loading goals:', error);
      setGoals([]);
    }
  };

  const loadSettings = async () => {
    if (!user || !isSupabaseConfigured()) return;

    try {
      const { data, error } = await supabase
        .from('user_settings')
        .select('settings')
        .eq('user_id', user.id)
        .maybeSingle();

      if (error) {
        console.error('Error loading settings:', error);
        return;
      }

      if (data?.settings) {
        setSettings(data.settings as UserSettings);
      }
    } catch (error) {
      console.error('Error loading settings:', error);
      setSettings(initialSettings);
    }
  };

  const setupRealtimeSubscriptions = () => {
    if (!user || !isSupabaseConfigured()) return;

    const subscription = supabase
      .channel(`user_${user.id}_changes`)
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'transactions',
        filter: `user_id=eq.${user.id}`
      }, () => {
        loadTransactions();
      })
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'goals',
        filter: `user_id=eq.${user.id}`
      }, () => {
        loadGoals();
      })
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'user_settings',
        filter: `user_id=eq.${user.id}`
      }, () => {
        loadSettings();
      })
      .subscribe();

    return () => {
      subscription.unsubscribe();
    };
  };

  const addTransaction = async (transaction: Omit<Transaction, 'id'>) => {
    if (!user) return;

    const newTransaction: Transaction = {
      ...transaction,
      id: crypto.randomUUID(),
      currency: transaction.currency || settings.profile.currency
    };

    // Optimistic update
    setTransactions(prev => [newTransaction, ...prev]);

    try {
      if (isSupabaseConfigured()) {
        const { error } = await supabase
          .from('transactions')
          .insert({
            id: newTransaction.id,
            user_id: user.id,
            type: newTransaction.type,
            amount: newTransaction.amount,
            description: newTransaction.description,
            category: newTransaction.category,
            date: newTransaction.date,
            time: newTransaction.time,
            payment_method: newTransaction.paymentMethod,
            source: newTransaction.source,
            merchant: newTransaction.merchant,
            notes: newTransaction.notes,
            recurring: newTransaction.recurring || false,
            currency: newTransaction.currency
          });

        if (error) throw error;
      } else {
        // Fallback to localStorage
        const updated = [newTransaction, ...transactions];
        localStorage.setItem('finance_transactions', JSON.stringify(updated));
      }
    } catch (error) {
      console.error('Error adding transaction:', error);
      // Revert optimistic update
      setTransactions(prev => prev.filter(t => t.id !== newTransaction.id));
      throw error;
    }
  };

  const updateTransaction = async (id: string, updatedTransaction: Partial<Transaction>) => {
    if (!user) return;

    // Optimistic update
    setTransactions(prev => 
      prev.map(t => t.id === id ? { ...t, ...updatedTransaction } : t)
    );

    try {
      if (isSupabaseConfigured()) {
        const updateData: any = {};
        if (updatedTransaction.type) updateData.type = updatedTransaction.type;
        if (updatedTransaction.amount !== undefined) updateData.amount = updatedTransaction.amount;
        if (updatedTransaction.description) updateData.description = updatedTransaction.description;
        if (updatedTransaction.category) updateData.category = updatedTransaction.category;
        if (updatedTransaction.date) updateData.date = updatedTransaction.date;
        if (updatedTransaction.time) updateData.time = updatedTransaction.time;
        if (updatedTransaction.paymentMethod) updateData.payment_method = updatedTransaction.paymentMethod;
        if (updatedTransaction.source) updateData.source = updatedTransaction.source;
        if (updatedTransaction.merchant) updateData.merchant = updatedTransaction.merchant;
        if (updatedTransaction.notes) updateData.notes = updatedTransaction.notes;
        if (updatedTransaction.recurring !== undefined) updateData.recurring = updatedTransaction.recurring;
        if (updatedTransaction.currency) updateData.currency = updatedTransaction.currency;

        const { error } = await supabase
          .from('transactions')
          .update(updateData)
          .eq('id', id)
          .eq('user_id', user.id);

        if (error) throw error;
      } else {
        // Fallback to localStorage
        const updated = transactions.map(t => t.id === id ? { ...t, ...updatedTransaction } : t);
        localStorage.setItem('finance_transactions', JSON.stringify(updated));
      }
    } catch (error) {
      console.error('Error updating transaction:', error);
      // Revert optimistic update
      await loadTransactions();
      throw error;
    }
  };

  const deleteTransaction = async (id: string) => {
    if (!user) return;

    // Optimistic update
    const originalTransactions = transactions;
    setTransactions(prev => prev.filter(t => t.id !== id));

    try {
      if (isSupabaseConfigured()) {
        const { error } = await supabase
          .from('transactions')
          .delete()
          .eq('id', id)
          .eq('user_id', user.id);

        if (error) throw error;
      } else {
        // Fallback to localStorage
        const updated = transactions.filter(t => t.id !== id);
        localStorage.setItem('finance_transactions', JSON.stringify(updated));
      }
    } catch (error) {
      console.error('Error deleting transaction:', error);
      // Revert optimistic update
      setTransactions(originalTransactions);
      throw error;
    }
  };

  const addGoal = async (goal: Omit<Goal, 'id' | 'createdAt'>) => {
    if (!user) return;

    const newGoal: Goal = {
      ...goal,
      id: crypto.randomUUID(),
      createdAt: new Date().toISOString(),
      currency: goal.currency || settings.profile.currency
    };

    // Optimistic update
    setGoals(prev => [newGoal, ...prev]);

    try {
      if (isSupabaseConfigured()) {
        const { error } = await supabase
          .from('goals')
          .insert({
            id: newGoal.id,
            user_id: user.id,
            title: newGoal.title,
            description: newGoal.description,
            target_amount: newGoal.targetAmount,
            current_amount: newGoal.currentAmount,
            deadline: newGoal.deadline,
            category: newGoal.category,
            priority: newGoal.priority,
            status: newGoal.status,
            target_category: newGoal.targetCategory,
            currency: newGoal.currency
          });

        if (error) throw error;
      } else {
        // Fallback to localStorage
        const updated = [newGoal, ...goals];
        localStorage.setItem('finance_goals', JSON.stringify(updated));
      }
    } catch (error) {
      console.error('Error adding goal:', error);
      // Revert optimistic update
      setGoals(prev => prev.filter(g => g.id !== newGoal.id));
      throw error;
    }
  };

  const updateGoal = async (id: string, updatedGoal: Partial<Goal>) => {
    if (!user) return;

    // Optimistic update
    setGoals(prev => 
      prev.map(g => g.id === id ? { ...g, ...updatedGoal } : g)
    );

    try {
      if (isSupabaseConfigured()) {
        const updateData: any = {};
        if (updatedGoal.title) updateData.title = updatedGoal.title;
        if (updatedGoal.description) updateData.description = updatedGoal.description;
        if (updatedGoal.targetAmount !== undefined) updateData.target_amount = updatedGoal.targetAmount;
        if (updatedGoal.currentAmount !== undefined) updateData.current_amount = updatedGoal.currentAmount;
        if (updatedGoal.deadline) updateData.deadline = updatedGoal.deadline;
        if (updatedGoal.category) updateData.category = updatedGoal.category;
        if (updatedGoal.priority) updateData.priority = updatedGoal.priority;
        if (updatedGoal.status) updateData.status = updatedGoal.status;
        if (updatedGoal.targetCategory) updateData.target_category = updatedGoal.targetCategory;
        if (updatedGoal.currency) updateData.currency = updatedGoal.currency;

        const { error } = await supabase
          .from('goals')
          .update(updateData)
          .eq('id', id)
          .eq('user_id', user.id);

        if (error) throw error;
      } else {
        // Fallback to localStorage
        const updated = goals.map(g => g.id === id ? { ...g, ...updatedGoal } : g);
        localStorage.setItem('finance_goals', JSON.stringify(updated));
      }
    } catch (error) {
      console.error('Error updating goal:', error);
      // Revert optimistic update
      await loadGoals();
      throw error;
    }
  };

  const deleteGoal = async (id: string) => {
    if (!user) return;

    // Optimistic update
    const originalGoals = goals;
    setGoals(prev => prev.filter(g => g.id !== id));

    try {
      if (isSupabaseConfigured()) {
        const { error } = await supabase
          .from('goals')
          .delete()
          .eq('id', id)
          .eq('user_id', user.id);

        if (error) throw error;
      } else {
        // Fallback to localStorage
        const updated = goals.filter(g => g.id !== id);
        localStorage.setItem('finance_goals', JSON.stringify(updated));
      }
    } catch (error) {
      console.error('Error deleting goal:', error);
      // Revert optimistic update
      setGoals(originalGoals);
      throw error;
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

    // Optimistic update
    setSettings(updatedSettings);

    try {
      if (user && isSupabaseConfigured()) {
        const { error } = await supabase
          .from('user_settings')
          .upsert({
            user_id: user.id,
            settings: updatedSettings
          });

        if (error) throw error;
      } else {
        // Fallback to localStorage
        localStorage.setItem('finance_settings', JSON.stringify(updatedSettings));
      }
    } catch (error) {
      console.error('Error updating settings:', error);
      // Revert optimistic update
      setSettings(settings);
      throw error;
    }
  };

  const syncData = async () => {
    if (!user || !isSupabaseConfigured()) return;

    setSyncing(true);
    try {
      await loadAllData();
    } catch (error) {
      console.error('Error syncing data:', error);
    } finally {
      setSyncing(false);
    }
  };

  // Calculation functions (unchanged)
  const getTotalIncome = () => {
    return transactions
      .filter(t => t.type === 'income')
      .reduce((total, t) => total + t.amount, 0);
  };

  const getTotalExpenses = () => {
    return transactions
      .filter(t => t.type === 'expense')
      .reduce((total, t) => total + t.amount, 0);
  };

  const getNetWorth = () => {
    return getTotalIncome() - getTotalExpenses();
  };

  const getCategoryTotals = () => {
    const totals: Record<string, number> = {};
    transactions.forEach(t => {
      if (t.type === 'expense') {
        totals[t.category] = (totals[t.category] || 0) + t.amount;
      }
    });
    return totals;
  };

  const getLargestTransactionAmount = () => {
    if (transactions.length === 0) return 0;
    return Math.max(...transactions.map(t => t.amount));
  };

  const getUniqueCategoriesCount = () => {
    const categories = new Set(transactions.map(t => t.category));
    return categories.size;
  };

  const getTotalTransactionsCount = () => {
    return transactions.length;
  };

  const getDailyAverageExpense = () => {
    const expenses = transactions.filter(t => t.type === 'expense');
    if (expenses.length === 0) return 0;

    const dates = new Set(expenses.map(t => t.date));
    const totalExpenseAmount = expenses.reduce((sum, t) => sum + t.amount, 0);
    
    return dates.size > 0 ? totalExpenseAmount / dates.size : 0;
  };

  const getRecentChange = (type: 'income' | 'expense' | 'networth') => {
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
  };

  return (
    <FinanceContext.Provider value={{
      transactions,
      goals,
      settings,
      loading,
      syncing,
      addTransaction,
      updateTransaction,
      deleteTransaction,
      addGoal,
      updateGoal,
      deleteGoal,
      updateSettings,
      syncData,
      getTotalIncome,
      getTotalExpenses,
      getNetWorth,
      getCategoryTotals,
      getLargestTransactionAmount,
      getUniqueCategoriesCount,
      getTotalTransactionsCount,
      getDailyAverageExpense,
      getRecentChange
    }}>
      {children}
    </FinanceContext.Provider>
  );
};