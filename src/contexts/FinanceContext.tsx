import React, { createContext, useContext, useState, useEffect } from 'react';

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
  addTransaction: (transaction: Omit<Transaction, 'id'>) => void;
  updateTransaction: (id: string, transaction: Partial<Transaction>) => void;
  deleteTransaction: (id: string) => void;
  addGoal: (goal: Omit<Goal, 'id' | 'createdAt'>) => void;
  updateGoal: (id: string, goal: Partial<Goal>) => void;
  deleteGoal: (id: string) => void;
  updateSettings: (settings: Partial<UserSettings>) => void;
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

// Empty initial data - users will add their own
const initialTransactions: Transaction[] = [];

const initialGoals: Goal[] = [];

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
  const [transactions, setTransactions] = useState<Transaction[]>(initialTransactions);
  const [goals, setGoals] = useState<Goal[]>(initialGoals);
  const [settings, setSettings] = useState<UserSettings>(initialSettings);

  // Load data from localStorage on mount
  useEffect(() => {
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
  }, []);

  // Save data to localStorage whenever state changes
  useEffect(() => {
    localStorage.setItem('finance_transactions', JSON.stringify(transactions));
  }, [transactions]);

  useEffect(() => {
    localStorage.setItem('finance_goals', JSON.stringify(goals));
  }, [goals]);

  useEffect(() => {
    localStorage.setItem('finance_settings', JSON.stringify(settings));
  }, [settings]);

  const addTransaction = (transaction: Omit<Transaction, 'id'>) => {
    const newTransaction: Transaction = {
      ...transaction,
      id: Date.now().toString(),
      currency: transaction.currency || settings.profile.currency
    };
    setTransactions(prev => [newTransaction, ...prev]);
  };

  const updateTransaction = (id: string, updatedTransaction: Partial<Transaction>) => {
    setTransactions(prev => 
      prev.map(t => t.id === id ? { ...t, ...updatedTransaction } : t)
    );
  };

  const deleteTransaction = (id: string) => {
    setTransactions(prev => prev.filter(t => t.id !== id));
  };

  const addGoal = (goal: Omit<Goal, 'id' | 'createdAt'>) => {
    const newGoal: Goal = {
      ...goal,
      id: Date.now().toString(),
      createdAt: new Date().toISOString(),
      currency: goal.currency || settings.profile.currency
    };
    setGoals(prev => [newGoal, ...prev]);
  };

  const updateGoal = (id: string, updatedGoal: Partial<Goal>) => {
    setGoals(prev => 
      prev.map(g => g.id === id ? { ...g, ...updatedGoal } : g)
    );
  };

  const deleteGoal = (id: string) => {
    setGoals(prev => prev.filter(g => g.id !== id));
  };

  const updateSettings = (newSettings: Partial<UserSettings>) => {
    setSettings(prev => ({
      ...prev,
      ...newSettings,
      profile: { ...prev.profile, ...(newSettings.profile || {}) },
      notifications: { ...prev.notifications, ...(newSettings.notifications || {}) },
      privacy: { ...prev.privacy, ...(newSettings.privacy || {}) },
      appearance: { ...prev.appearance, ...(newSettings.appearance || {}) }
    }));
  };

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

    // Get unique dates
    const dates = new Set(expenses.map(t => t.date));
    const totalExpenseAmount = expenses.reduce((sum, t) => sum + t.amount, 0);
    
    return dates.size > 0 ? totalExpenseAmount / dates.size : 0;
  };

  const getRecentChange = (type: 'income' | 'expense' | 'networth') => {
    // Get transactions from last 30 days and previous 30 days for comparison
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
      addTransaction,
      updateTransaction,
      deleteTransaction,
      addGoal,
      updateGoal,
      deleteGoal,
      updateSettings,
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