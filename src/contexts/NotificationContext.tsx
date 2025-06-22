import React, { createContext, useContext, useState, useEffect } from 'react';

export interface Notification {
  id: string;
  type: 'success' | 'warning' | 'error' | 'info';
  title: string;
  message: string;
  timestamp: string;
  read: boolean;
  action?: {
    label: string;
    onClick: () => void;
  };
}

interface NotificationContextType {
  notifications: Notification[];
  unreadCount: number;
  addNotification: (notification: Omit<Notification, 'id' | 'timestamp' | 'read'>) => void;
  markAsRead: (id: string) => void;
  markAllAsRead: () => void;
  removeNotification: (id: string) => void;
  clearAllNotifications: () => void;
  requestNotificationPermission: () => Promise<boolean>;
  sendPushNotification: (title: string, message: string) => void;
  generateFinancialNotifications: (goals: any[], transactions: any[], currentCurrency: string) => void;
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

export const useNotifications = () => {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error('useNotifications must be used within a NotificationProvider');
  }
  return context;
};

export const NotificationProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [notifications, setNotifications] = useState<Notification[]>([]);

  useEffect(() => {
    const saved = localStorage.getItem('notifications');
    if (saved) {
      setNotifications(JSON.parse(saved));
    }
  }, []);

  useEffect(() => {
    localStorage.setItem('notifications', JSON.stringify(notifications));
  }, [notifications]);

  const unreadCount = notifications.filter(n => !n.read).length;

  const addNotification = (notification: Omit<Notification, 'id' | 'timestamp' | 'read'>) => {
    const newNotification: Notification = {
      ...notification,
      id: Date.now().toString(),
      timestamp: new Date().toISOString(),
      read: false
    };
    setNotifications(prev => [newNotification, ...prev]);
  };

  const markAsRead = (id: string) => {
    setNotifications(prev => 
      prev.map(n => n.id === id ? { ...n, read: true } : n)
    );
  };

  const markAllAsRead = () => {
    setNotifications(prev => 
      prev.map(n => ({ ...n, read: true }))
    );
  };

  const removeNotification = (id: string) => {
    setNotifications(prev => prev.filter(n => n.id !== id));
  };

  const clearAllNotifications = () => {
    setNotifications([]);
  };

  const requestNotificationPermission = async (): Promise<boolean> => {
    if (!('Notification' in window)) {
      console.log('This browser does not support notifications');
      return false;
    }

    if (Notification.permission === 'granted') {
      return true;
    }

    if (Notification.permission !== 'denied') {
      const permission = await Notification.requestPermission();
      return permission === 'granted';
    }

    return false;
  };

  const sendPushNotification = (title: string, message: string) => {
    if (Notification.permission === 'granted') {
      new Notification(title, {
        body: message,
        icon: '/vite.svg',
        badge: '/vite.svg'
      });
    }
  };

  const generateFinancialNotifications = (goals: any[], transactions: any[], currentCurrency: string) => {
    const now = new Date();
    const currentMonth = now.getMonth();
    const currentYear = now.getFullYear();
    
    // Get transactions from current month
    const monthlyTransactions = transactions.filter(t => {
      const transactionDate = new Date(t.date);
      return transactionDate.getMonth() === currentMonth && 
             transactionDate.getFullYear() === currentYear;
    });

    // Check budget goals (expense-limit type)
    const budgetGoals = goals.filter(g => g.category === 'expense-limit' && g.status === 'active');
    
    budgetGoals.forEach(goal => {
      // Determine target category from goal title
      let targetCategory = goal.targetCategory;
      if (!targetCategory) {
        const cleanTitle = goal.title.replace(/budget|limit|spending/i, '').trim();
        if (cleanTitle.toLowerCase().includes('food')) targetCategory = 'Food & Dining';
        else if (cleanTitle.toLowerCase().includes('entertainment')) targetCategory = 'Entertainment';
        else if (cleanTitle.toLowerCase().includes('transport')) targetCategory = 'Transportation';
        else targetCategory = cleanTitle || 'Other';
      }

      // Calculate spent amount in this category
      const spent = monthlyTransactions
        .filter(t => t.type === 'expense' && t.category === targetCategory)
        .reduce((sum, t) => sum + t.amount, 0);

      const percentage = goal.targetAmount > 0 ? (spent / goal.targetAmount) * 100 : 0;

      // Generate budget alert if over 80%
      if (percentage > 80) {
        const existingBudgetAlert = notifications.find(n => 
          n.title === 'Budget Alert' && 
          n.message.includes(targetCategory.toLowerCase()) &&
          new Date(n.timestamp) > new Date(now.getTime() - 24 * 60 * 60 * 1000) // Within last 24 hours
        );

        if (!existingBudgetAlert) {
          const isOverBudget = percentage > 100;
          addNotification({
            type: isOverBudget ? 'error' : 'warning',
            title: 'Budget Alert',
            message: isOverBudget 
              ? `You've exceeded your ${targetCategory.toLowerCase()} budget by ${(percentage - 100).toFixed(0)}%`
              : `You've spent ${percentage.toFixed(0)}% of your ${targetCategory.toLowerCase()} budget`,
          });
        }
      }
    });

    // Check savings goals progress
    const savingsGoals = goals.filter(g => g.category === 'savings' && g.status === 'active');
    
    savingsGoals.forEach(goal => {
      const progress = goal.targetAmount > 0 ? (goal.currentAmount / goal.targetAmount) * 100 : 0;
      
      // Generate progress notification for major milestones
      if (progress >= 75 && progress < 100) {
        const existingProgressAlert = notifications.find(n => 
          n.title === 'Goal Progress' && 
          n.message.includes(goal.title.toLowerCase()) &&
          new Date(n.timestamp) > new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000) // Within last 7 days
        );

        if (!existingProgressAlert) {
          addNotification({
            type: 'success',
            title: 'Goal Progress',
            message: `You're ${progress.toFixed(0)}% towards your ${goal.title.toLowerCase()} goal!`,
          });
        }
      } else if (progress >= 100) {
        const existingCompletionAlert = notifications.find(n => 
          n.title === 'Goal Completed' && 
          n.message.includes(goal.title.toLowerCase()) &&
          new Date(n.timestamp) > new Date(now.getTime() - 24 * 60 * 60 * 1000) // Within last 24 hours
        );

        if (!existingCompletionAlert) {
          addNotification({
            type: 'success',
            title: 'Goal Completed',
            message: `Congratulations! You've completed your ${goal.title.toLowerCase()} goal!`,
          });
        }
      }
    });

    // Check for overdue goals
    goals.forEach(goal => {
      if (goal.status === 'active' && new Date(goal.deadline) < now) {
        const existingOverdueAlert = notifications.find(n => 
          n.title === 'Goal Overdue' && 
          n.message.includes(goal.title.toLowerCase()) &&
          new Date(n.timestamp) > new Date(now.getTime() - 24 * 60 * 60 * 1000) // Within last 24 hours
        );

        if (!existingOverdueAlert) {
          addNotification({
            type: 'warning',
            title: 'Goal Overdue',
            message: `Your goal "${goal.title}" has passed its deadline. Consider updating or extending it.`,
          });
        }
      }
    });

    // Generate currency update notification occasionally
    const lastCurrencyUpdate = localStorage.getItem('last_currency_update');
    const now24HoursAgo = now.getTime() - 24 * 60 * 60 * 1000;
    
    if (!lastCurrencyUpdate || parseInt(lastCurrencyUpdate) < now24HoursAgo) {
      const existingCurrencyAlert = notifications.find(n => 
        n.title === 'Currency Update' &&
        new Date(n.timestamp) > new Date(now24HoursAgo)
      );

      if (!existingCurrencyAlert) {
        addNotification({
          type: 'info',
          title: 'Currency Update',
          message: `Exchange rates have been updated for ${currentCurrency}`,
        });
        localStorage.setItem('last_currency_update', now.getTime().toString());
      }
    }

    // Weekly spending summary
    const lastWeeklySummary = localStorage.getItem('last_weekly_summary');
    const oneWeekAgo = now.getTime() - 7 * 24 * 60 * 60 * 1000;
    
    if (!lastWeeklySummary || parseInt(lastWeeklySummary) < oneWeekAgo) {
      const weeklyExpenses = monthlyTransactions
        .filter(t => t.type === 'expense' && new Date(t.date) > new Date(oneWeekAgo))
        .reduce((sum, t) => sum + t.amount, 0);

      if (weeklyExpenses > 0) {
        const existingWeeklySummary = notifications.find(n => 
          n.title === 'Weekly Summary' &&
          new Date(n.timestamp) > new Date(oneWeekAgo)
        );

        if (!existingWeeklySummary) {
          addNotification({
            type: 'info',
            title: 'Weekly Summary',
            message: `This week you spent $${weeklyExpenses.toFixed(2)} across ${monthlyTransactions.filter(t => t.type === 'expense').length} transactions`,
          });
          localStorage.setItem('last_weekly_summary', now.getTime().toString());
        }
      }
    }
  };

  return (
    <NotificationContext.Provider value={{
      notifications,
      unreadCount,
      addNotification,
      markAsRead,
      markAllAsRead,
      removeNotification,
      clearAllNotifications,
      requestNotificationPermission,
      sendPushNotification,
      generateFinancialNotifications
    }}>
      {children}
    </NotificationContext.Provider>
  );
};