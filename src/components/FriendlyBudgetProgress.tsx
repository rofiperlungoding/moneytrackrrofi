import React from 'react';
import { motion } from 'framer-motion';
import { Target, AlertTriangle, CheckCircle, Utensils, Gamepad, Book, Bus, DollarSign, Sparkles, Plus } from 'lucide-react';
import { useFinance } from '../contexts/FinanceContext';
import { useCurrency } from '../contexts/CurrencyContext';
import { CountUp } from './CountUp';
import { startOfMonth, endOfMonth, isWithinInterval, parseISO } from 'date-fns';

// Icon mapping for categories
const categoryIcons: Record<string, any> = {
  'Food & Dining': Utensils,
  'Food & Treats': Utensils,
  'Entertainment': Gamepad,
  'Fun Activities': Gamepad,
  'Education': Book,
  'Learning': Book,
  'Transportation': Bus,
  'Shopping': DollarSign,
  'Utilities': Sparkles,
  'Healthcare': Target,
  'Housing': Target,
  'Other': Target
};

interface FriendlyBudgetProgressProps {
  onSectionChange: (section: string) => void;
}

export const FriendlyBudgetProgress: React.FC<FriendlyBudgetProgressProps> = ({ onSectionChange }) => {
  const { goals, transactions } = useFinance();
  const { convertAmount } = useCurrency();
  
  // Filter goals to get budget goals (expense-limit type)
  const budgetGoals = goals.filter(goal => 
    goal.category === 'expense-limit' && 
    goal.status === 'active'
  );

  // Handle create budget goal button click
  const handleCreateBudgetGoal = () => {
    onSectionChange('goals');
  };

  // If no budget goals exist, show empty state
  if (budgetGoals.length === 0) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.8 }}
        className="bg-cinematic-surface/60 backdrop-blur-premium border-2 border-cinema-green/20 rounded-3xl p-6 shadow-cinematic relative overflow-hidden"
        style={{
          background: 'linear-gradient(135deg, rgba(34, 197, 94, 0.12) 0%, rgba(22, 67, 22, 0.85) 100%)',
        }}
      >
        <div className="text-center py-6">
          <Target className="w-12 h-12 text-cinema-green mx-auto mb-3" />
          <h3 className="text-xl font-bold text-cinematic-text font-cinematic mb-3">No Budget Goals</h3>
          <p className="text-cinematic-text-muted text-base mb-4">Create budget goals to track your spending limits</p>
          <motion.button
            whileHover={{ scale: 1.05, boxShadow: '0 0 25px rgba(34, 197, 94, 0.4)' }}
            whileTap={{ scale: 0.95 }}
            onClick={handleCreateBudgetGoal}
            className="flex items-center space-x-2 bg-premium-green text-white px-4 py-2 rounded-xl font-medium hover:shadow-glow-green transition-all mx-auto"
          >
            <Plus className="w-4 h-4" />
            <span>Create Budget Goal</span>
          </motion.button>
        </div>
      </motion.div>
    );
  }

  // Calculate spending for each budget goal
  const budgets = budgetGoals.map(goal => {
    // Get current month date range
    const now = new Date();
    const monthStart = startOfMonth(now);
    const monthEnd = endOfMonth(now);

    // Determine the target category for this budget goal
    // First check if targetCategory is set, otherwise infer from title
    let targetCategory = goal.targetCategory;
    if (!targetCategory) {
      // Try to infer from title by removing common budget-related words
      const cleanTitle = goal.title
        .replace(/budget/i, '')
        .replace(/limit/i, '')
        .replace(/spending/i, '')
        .trim();
      
      // Map common title patterns to categories
      if (cleanTitle.toLowerCase().includes('food') || cleanTitle.toLowerCase().includes('dining') || cleanTitle.toLowerCase().includes('treats')) {
        targetCategory = 'Food & Dining';
      } else if (cleanTitle.toLowerCase().includes('entertainment') || cleanTitle.toLowerCase().includes('fun')) {
        targetCategory = 'Entertainment';
      } else if (cleanTitle.toLowerCase().includes('transport') || cleanTitle.toLowerCase().includes('travel')) {
        targetCategory = 'Transportation';
      } else if (cleanTitle.toLowerCase().includes('education') || cleanTitle.toLowerCase().includes('learning')) {
        targetCategory = 'Education';
      } else if (cleanTitle.toLowerCase().includes('shopping')) {
        targetCategory = 'Shopping';
      } else if (cleanTitle.toLowerCase().includes('utilities')) {
        targetCategory = 'Utilities';
      } else if (cleanTitle.toLowerCase().includes('healthcare') || cleanTitle.toLowerCase().includes('health')) {
        targetCategory = 'Healthcare';
      } else if (cleanTitle.toLowerCase().includes('housing') || cleanTitle.toLowerCase().includes('rent')) {
        targetCategory = 'Housing';
      } else {
        // Use the clean title as category or default to 'Other'
        targetCategory = cleanTitle || 'Other';
      }
    }

    // Calculate spent amount for this category in current month
    const spent = transactions
      .filter(transaction => {
        if (transaction.type !== 'expense') return false;
        
        // Check if transaction is in current month
        const transactionDate = parseISO(transaction.date);
        if (!isWithinInterval(transactionDate, { start: monthStart, end: monthEnd })) return false;
        
        // Check if transaction matches the target category
        return transaction.category === targetCategory;
      })
      .reduce((total, transaction) => total + transaction.amount, 0);

    // Get appropriate icon for the category
    const IconComponent = categoryIcons[targetCategory] || Target;

    return {
      goalId: goal.id,
      category: goal.title,
      targetCategory,
      spent: spent,
      budget: goal.targetAmount,
      icon: IconComponent,
      color: getColorForCategory(targetCategory),
      priority: goal.priority,
      deadline: goal.deadline
    };
  });

  const totalBudgeted = budgets.reduce((sum, budget) => sum + budget.budget, 0);
  const totalSpent = budgets.reduce((sum, budget) => sum + budget.spent, 0);
  const remainingBudget = totalBudgeted - totalSpent;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.8 }}
      className="bg-cinematic-surface/60 backdrop-blur-premium border-2 border-cinema-green/20 rounded-3xl p-6 shadow-cinematic relative overflow-hidden"
      style={{
        background: 'linear-gradient(135deg, rgba(34, 197, 94, 0.12) 0%, rgba(22, 67, 22, 0.85) 100%)',
      }}
    >
      {/* Background decoration */}
      <div className="absolute top-0 right-0 w-32 h-32 bg-cinema-green/8 rounded-full blur-3xl" />
      
      <div className="relative">
        {/* Header */}
        <div className="mb-6 text-center">
          <div className="flex items-center justify-center space-x-2 mb-3">
            <Target className="w-5 h-5 text-cinema-green" />
            <h3 className="text-xl font-bold text-cinematic-text font-cinematic">Budget Goals</h3>
            <Target className="w-5 h-5 text-cinema-green" />
          </div>
          <p className="text-cinematic-text-muted text-base">Track your spending limits</p>
          
          {/* Overall Progress */}
          <div className="mt-3 bg-cinema-green/10 backdrop-blur-glass rounded-2xl p-3 border border-cinema-green/20">
            <div className="flex items-center justify-center space-x-2">
              {remainingBudget > 0 ? (
                <>
                  <CheckCircle className="w-4 h-4 text-cinema-green" />
                  <span className="text-cinema-green font-bold text-base">
                    Excellent! <CountUp 
                      to={remainingBudget} 
                      duration={1} 
                      delay={0.3} 
                      decimals={2} 
                      useCurrencyConversion={true}
                    /> left to spend!
                  </span>
                </>
              ) : (
                <>
                  <AlertTriangle className="w-4 h-4 text-financial-negative" />
                  <span className="text-financial-negative font-bold text-base">
                    Over budget by <CountUp 
                      to={Math.abs(remainingBudget)} 
                      duration={1} 
                      delay={0.3} 
                      decimals={2} 
                      useCurrencyConversion={true}
                    />
                  </span>
                </>
              )}
            </div>
          </div>
        </div>

        {/* Budget Items */}
        <div className="space-y-4">
          {budgets.map((budget, index) => {
            const percentage = budget.budget > 0 ? (budget.spent / budget.budget) * 100 : 0;
            const isOverBudget = percentage > 100;
            const isNearLimit = percentage > 80 && percentage <= 100;
            const IconComponent = budget.icon;
            
            return (
              <motion.div
                key={budget.goalId}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.5, delay: 0.9 + index * 0.15 }}
                className="bg-cinematic-glass backdrop-blur-glass rounded-2xl p-4 hover:scale-105 transition-all duration-300 border border-cinema-green/20"
              >
                {/* Top Row: Category Name with Icon and Status Icons */}
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center space-x-2">
                    <IconComponent className="w-5 h-5" style={{ color: budget.color }} />
                    <span className="text-base font-bold text-cinematic-text">
                      {budget.category}
                    </span>
                  </div>
                  <div className="flex items-center space-x-1">
                    {isOverBudget && <AlertTriangle className="w-4 h-4 text-financial-negative" />}
                    {isNearLimit && !isOverBudget && <AlertTriangle className="w-4 h-4 text-premium-gold" />}
                    {percentage <= 80 && <CheckCircle className="w-4 h-4 text-cinema-green" />}
                  </div>
                </div>

                {/* Bottom Row: Financial Details */}
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center space-x-1.5">
                    <span className={`text-sm font-bold ${
                      isOverBudget ? 'text-financial-negative' : 'text-cinematic-text'
                    }`}>
                      <CountUp 
                        to={budget.spent} 
                        duration={0.8} 
                        delay={0.3 + index * 0.1} 
                        useCurrencyConversion={true}
                      />
                    </span>
                    <span className="text-xs text-cinematic-text-muted font-medium">of</span>
                    <span className="text-sm font-medium text-cinematic-text">
                      <CountUp 
                        to={budget.budget} 
                        duration={0.8} 
                        delay={0.4 + index * 0.1} 
                        useCurrencyConversion={true}
                      />
                    </span>
                  </div>
                  
                  <div className="flex items-center space-x-1.5">
                    <span className={`text-sm font-bold ${
                      isOverBudget ? 'text-financial-negative' : 
                      isNearLimit ? 'text-premium-gold' : 
                      'text-cinema-green'
                    }`}>
                      <CountUp to={percentage} duration={1} delay={0.5 + index * 0.1} suffix="%" decimals={0} />
                    </span>
                    <span className="text-xs text-cinematic-text-muted">used</span>
                  </div>
                </div>
                
                {/* Progress Bar */}
                <div className="w-full bg-cinematic-border rounded-full h-2.5 mb-2">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${Math.min(percentage, 100)}%` }}
                    transition={{ duration: 1, delay: 1.0 + index * 0.15, type: "spring" }}
                    className={`h-2.5 rounded-full ${
                      isOverBudget ? 'bg-financial-negative' : 
                      isNearLimit ? 'bg-premium-gold' : 
                      'bg-cinema-green'
                    }`}
                    style={{ backgroundColor: isOverBudget ? undefined : budget.color }}
                  />
                </div>
                
                {/* Status Messages */}
                {isOverBudget && (
                  <div className="bg-financial-negative/10 border border-financial-negative/20 rounded-xl p-2 flex items-center space-x-2">
                    <DollarSign className="w-3 h-3 text-financial-negative" />
                    <p className="text-xs text-financial-negative font-medium">
                      Over by <CountUp 
                        to={budget.spent - budget.budget} 
                        duration={0.5} 
                        delay={0.2} 
                        decimals={2} 
                        useCurrencyConversion={true}
                      /> - Try to spend less!
                    </p>
                  </div>
                )}
                
                {isNearLimit && !isOverBudget && (
                  <div className="bg-premium-gold/10 border border-premium-gold/20 rounded-xl p-2 flex items-center space-x-2">
                    <AlertTriangle className="w-3 h-3 text-premium-gold" />
                    <p className="text-xs text-premium-gold font-medium">
                      Almost there! Only <CountUp 
                        to={budget.budget - budget.spent} 
                        duration={0.5} 
                        delay={0.2} 
                        decimals={2} 
                        useCurrencyConversion={true}
                      /> left
                    </p>
                  </div>
                )}

                {percentage <= 50 && (
                  <div className="bg-cinema-green/10 border border-cinema-green/20 rounded-xl p-2 flex items-center space-x-2">
                    <Sparkles className="w-3 h-3 text-cinema-green" />
                    <p className="text-xs text-cinema-green font-medium">
                      Doing great! <CountUp 
                        to={budget.budget - budget.spent} 
                        duration={0.5} 
                        delay={0.2} 
                        decimals={2} 
                        useCurrencyConversion={true}
                      /> still available
                    </p>
                  </div>
                )}
              </motion.div>
            );
          })}
        </div>

        {/* Summary */}
        <div className="mt-6 pt-4 border-t border-cinema-green/20">
          <div className="grid grid-cols-2 gap-3">
            <div className="text-center bg-cinema-green-light/10 backdrop-blur-glass rounded-2xl p-3 border border-cinema-green-light/20">
              <div className="flex items-center justify-center space-x-1 mb-1">
                <DollarSign className="w-3 h-3 text-cinematic-text-muted" />
                <p className="text-xs text-cinematic-text-muted">Total Budget</p>
              </div>
              <div className="text-lg font-bold text-cinema-green-light">
                <CountUp 
                  to={totalBudgeted} 
                  duration={1} 
                  delay={0.8} 
                  useCurrencyConversion={true}
                />
              </div>
            </div>
            <div className="text-center bg-premium-gold/10 backdrop-blur-glass rounded-2xl p-3 border border-premium-gold/20">
              <div className="flex items-center justify-center space-x-1 mb-1">
                <Target className="w-3 h-3 text-cinematic-text-muted" />
                <p className="text-xs text-cinematic-text-muted">Total Spent</p>
              </div>
              <div className="text-lg font-bold text-premium-gold">
                <CountUp 
                  to={totalSpent} 
                  duration={1} 
                  delay={0.9} 
                  useCurrencyConversion={true}
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

// Helper function to get colors for different categories
function getColorForCategory(category: string): string {
  const colorMap: Record<string, string> = {
    'Food & Dining': '#EA580C',
    'Food & Treats': '#EA580C',
    'Entertainment': '#EC4899',
    'Fun Activities': '#EC4899',
    'Education': '#8B5CF6',
    'Learning': '#8B5CF6',
    'Transportation': '#22C55E',
    'Shopping': '#F59E0B',
    'Utilities': '#10B981',
    'Healthcare': '#EF4444',
    'Housing': '#8B5CF6',
    'Other': '#6B7280'
  };
  
  return colorMap[category] || '#22C55E';
}