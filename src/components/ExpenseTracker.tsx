import React, { useState, useCallback, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, Filter, Search, Edit2, Trash2, ShoppingBag, Coffee, Car, Home, Gamepad2, Zap, Heart, Package, Loader2 } from 'lucide-react';
import { 
  startOfDay, 
  endOfDay, 
  startOfWeek, 
  endOfWeek, 
  startOfMonth, 
  endOfMonth, 
  subMonths, 
  startOfYear, 
  endOfYear, 
  isWithinInterval,
  parseISO 
} from 'date-fns';
import { useFinance, Transaction } from '../contexts/FinanceContext';
import { useCurrency } from '../contexts/CurrencyContext';
import { ExpenseForm } from './ExpenseForm';
import { CountUp } from './CountUp';

const categoryIcons = {
  'Food & Dining': Coffee,
  'Transportation': Car,
  'Housing': Home,
  'Entertainment': Gamepad2,
  'Utilities': Zap,
  'Healthcare': Heart,
  'Shopping': ShoppingBag,
  'Education': Package,
  'Other': Package
};

const categoryColors = {
  'Food & Dining': 'bg-premium-copper/20 text-premium-copper border-premium-copper/30',
  'Transportation': 'bg-cinema-green-light/20 text-cinema-green-light border-cinema-green-light/30',
  'Housing': 'bg-premium-gold/20 text-premium-gold border-premium-gold/30',
  'Entertainment': 'bg-fun-pink/20 text-fun-pink border-fun-pink/30',
  'Utilities': 'bg-cinema-emerald/20 text-cinema-emerald border-cinema-emerald/30',
  'Healthcare': 'bg-financial-negative/20 text-financial-negative border-financial-negative/30',
  'Shopping': 'bg-premium-gold/20 text-premium-gold border-premium-gold/30',
  'Education': 'bg-cinema-jade/20 text-cinema-jade border-cinema-jade/30',
  'Other': 'bg-cinematic-text-muted/20 text-cinematic-text-muted border-cinematic-text-muted/30',
};

export const ExpenseTracker: React.FC = () => {
  const { 
    transactions, 
    addTransaction, 
    updateTransaction, 
    deleteTransaction, 
    getCategoryTotals,
    loading,
    hasMoreTransactions,
    loadMoreTransactions
  } = useFinance();
  const { convertAmount, currentCurrency } = useCurrency();
  const [showForm, setShowForm] = useState(false);
  const [editingTransaction, setEditingTransaction] = useState<Transaction | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [dateRange, setDateRange] = useState('this-month');
  const [loadingMore, setLoadingMore] = useState(false);

  const expenses = useMemo(() => 
    transactions.filter(t => t.type === 'expense'), 
    [transactions]
  );

  const categories = [
    'all',
    'Food & Dining',
    'Transportation',
    'Housing',
    'Entertainment',
    'Utilities',
    'Healthcare',
    'Shopping',
    'Education',
    'Other'
  ];

  const dateRanges = [
    { value: 'today', label: 'Today' },
    { value: 'this-week', label: 'This Week' },
    { value: 'this-month', label: 'This Month' },
    { value: 'last-month', label: 'Last Month' },
    { value: 'this-year', label: 'This Year' },
  ];

  // Helper function to get date range boundaries
  const getDateRangeBoundaries = useCallback((range: string) => {
    const now = new Date();
    
    switch (range) {
      case 'today':
        return {
          start: startOfDay(now),
          end: endOfDay(now)
        };
      case 'this-week':
        return {
          start: startOfWeek(now),
          end: endOfWeek(now)
        };
      case 'this-month':
        return {
          start: startOfMonth(now),
          end: endOfMonth(now)
        };
      case 'last-month':
        const lastMonth = subMonths(now, 1);
        return {
          start: startOfMonth(lastMonth),
          end: endOfMonth(lastMonth)
        };
      case 'this-year':
        return {
          start: startOfYear(now),
          end: endOfYear(now)
        };
      default:
        return {
          start: startOfMonth(now),
          end: endOfMonth(now)
        };
    }
  }, []);

  // Memoized filtered expenses for performance
  const filteredExpenses = useMemo(() => {
    return expenses.filter(expense => {
      // Search filter
      const matchesSearch = expense.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
                           (expense.merchant && expense.merchant.toLowerCase().includes(searchQuery.toLowerCase()));
      
      // Category filter
      const matchesCategory = selectedCategory === 'all' || expense.category === selectedCategory;
      
      // Date filter with proper date-fns handling
      const { start, end } = getDateRangeBoundaries(dateRange);
      const expenseDate = parseISO(expense.date);
      const matchesDate = isWithinInterval(expenseDate, { start, end });
      
      return matchesSearch && matchesCategory && matchesDate;
    });
  }, [expenses, searchQuery, selectedCategory, dateRange, getDateRangeBoundaries]);

  const totalAmount = useMemo(() => 
    filteredExpenses.reduce((sum, expense) => sum + expense.amount, 0),
    [filteredExpenses]
  );

  const categoryTotals = useMemo(() => getCategoryTotals(), [getCategoryTotals]);

  const averageExpense = useMemo(() => 
    filteredExpenses.length > 0 ? totalAmount / filteredExpenses.length : 0,
    [filteredExpenses.length, totalAmount]
  );

  const topCategory = useMemo(() => 
    Object.keys(categoryTotals).length > 0 
      ? Object.entries(categoryTotals).reduce((a, b) => categoryTotals[a[0]] > categoryTotals[b[0]] ? a : b)[0]
      : 'None',
    [categoryTotals]
  );

  const handleAddExpense = async (expenseData: any) => {
    try {
      await addTransaction({
        type: 'expense',
        amount: parseFloat(expenseData.amount),
        description: expenseData.description,
        category: expenseData.category,
        date: expenseData.date,
        time: expenseData.time,
        paymentMethod: expenseData.paymentMethod,
        merchant: expenseData.merchant || expenseData.description,
        notes: expenseData.notes,
        currency: currentCurrency
      });
      setShowForm(false);
    } catch (error) {
      console.error('Error adding expense:', error);
    }
  };

  const handleEditExpense = async (expenseData: any) => {
    if (editingTransaction) {
      try {
        await updateTransaction(editingTransaction.id, {
          amount: parseFloat(expenseData.amount),
          description: expenseData.description,
          category: expenseData.category,
          date: expenseData.date,
          time: expenseData.time,
          paymentMethod: expenseData.paymentMethod,
          merchant: expenseData.merchant || expenseData.description,
          notes: expenseData.notes,
          currency: currentCurrency
        });
        setEditingTransaction(null);
      } catch (error) {
        console.error('Error updating expense:', error);
      }
    }
  };

  const handleDeleteExpense = async (id: string) => {
    if (confirm('Are you sure you want to delete this expense?')) {
      try {
        await deleteTransaction(id);
      } catch (error) {
        console.error('Error deleting expense:', error);
      }
    }
  };

  const handleLoadMore = async () => {
    if (loadingMore || !hasMoreTransactions) return;
    
    setLoadingMore(true);
    try {
      await loadMoreTransactions();
    } catch (error) {
      console.error('Error loading more transactions:', error);
    } finally {
      setLoadingMore(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="flex items-center justify-between"
      >
        <div>
          <h1 className="text-3xl font-bold text-cinematic-text font-cinematic">Expense Tracker</h1>
          <p className="text-cinematic-text-secondary mt-1 text-base">Record and manage your spending</p>
        </div>
        <motion.button
          whileHover={{ scale: 1.05, boxShadow: '0 0 25px rgba(34, 197, 94, 0.4)' }}
          whileTap={{ scale: 0.95 }}
          onClick={() => setShowForm(true)}
          className="flex items-center space-x-2 bg-premium-green text-white px-6 py-3 rounded-2xl font-medium hover:shadow-glow-green transition-all"
        >
          <Plus className="w-4 h-4" />
          <span>Add Expense</span>
        </motion.button>
      </motion.div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="bg-cinematic-surface/60 backdrop-blur-premium border border-cinematic-border rounded-2xl p-4 shadow-cinematic"
        >
          <h3 className="text-xs text-cinematic-text-muted mb-1">Total Expenses</h3>
          <div className="text-xl font-bold text-financial-negative">
            <CountUp
              to={totalAmount}
              duration={1.2}
              delay={0.3}
              decimals={2}
              useCurrencyConversion={true}
            />
          </div>
        </motion.div>
        
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="bg-cinematic-surface/60 backdrop-blur-premium border border-cinematic-border rounded-2xl p-4 shadow-cinematic"
        >
          <h3 className="text-xs text-cinematic-text-muted mb-1">Transactions</h3>
          <div className="text-xl font-bold text-cinema-green-light">
            <CountUp
              to={filteredExpenses.length}
              duration={1}
              delay={0.4}
            />
          </div>
        </motion.div>
        
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.3 }}
          className="bg-cinematic-surface/60 backdrop-blur-premium border border-cinematic-border rounded-2xl p-4 shadow-cinematic"
        >
          <h3 className="text-xs text-cinematic-text-muted mb-1">Average</h3>
          <div className="text-xl font-bold text-premium-gold">
            <CountUp
              to={averageExpense}
              duration={1.3}
              delay={0.5}
              decimals={2}
              useCurrencyConversion={true}
            />
          </div>
        </motion.div>
        
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.4 }}
          className="bg-cinematic-surface/60 backdrop-blur-premium border border-cinematic-border rounded-2xl p-4 shadow-cinematic"
        >
          <h3 className="text-xs text-cinematic-text-muted mb-1">Top Category</h3>
          <p className="text-xl font-bold text-cinema-emerald">
            {topCategory}
          </p>
        </motion.div>
      </div>

      {/* Filters */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.1 }}
        className="bg-cinematic-surface/60 backdrop-blur-premium border border-cinematic-border rounded-2xl p-4 space-y-3 shadow-cinematic"
      >
        <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-3.5 h-3.5 text-cinematic-text-muted" />
            <input
              type="text"
              placeholder="Search expenses..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-3 py-2.5 bg-cinematic-glass border border-cinematic-border rounded-lg text-cinematic-text placeholder-cinematic-text-muted focus:outline-none focus:border-cinema-green/50 transition-colors duration-300"
            />
          </div>

          {/* Category Filter */}
          <div>
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="w-full px-3 py-2.5 bg-cinematic-glass border border-cinematic-border rounded-lg text-cinematic-text focus:outline-none focus:border-cinema-green/50 transition-colors duration-300"
            >
              {categories.map((category) => (
                <option key={category} value={category} className="bg-cinematic-surface text-cinematic-text">
                  {category === 'all' ? 'All Categories' : category}
                </option>
              ))}
            </select>
          </div>

          {/* Date Range */}
          <div>
            <select
              value={dateRange}
              onChange={(e) => setDateRange(e.target.value)}
              className="w-full px-3 py-2.5 bg-cinematic-glass border border-cinematic-border rounded-lg text-cinematic-text focus:outline-none focus:border-cinema-green/50 transition-colors duration-300"
            >
              {dateRanges.map((range) => (
                <option key={range.value} value={range.value} className="bg-cinematic-surface text-cinematic-text">
                  {range.label}
                </option>
              ))}
            </select>
          </div>

          {/* Filter Button */}
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="flex items-center justify-center space-x-1.5 bg-cinematic-glass border border-cinematic-border rounded-lg px-3 py-2.5 text-cinematic-text hover:border-cinema-green/30 transition-all duration-300"
          >
            <Filter className="w-3.5 h-3.5" />
            <span>Filter</span>
          </motion.button>
        </div>
      </motion.div>

      {/* Expense List */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.2 }}
        className="bg-cinematic-surface/60 backdrop-blur-premium border border-cinematic-border rounded-2xl shadow-cinematic"
      >
        {/* Summary Header */}
        <div className="p-4 border-b border-cinematic-border">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-bold text-cinematic-text font-cinematic">
                Expenses (<CountUp to={filteredExpenses.length} duration={0.8} delay={0.2} />)
              </h3>
              <p className="text-cinematic-text-secondary text-xs">
                Total: <CountUp 
                  to={totalAmount} 
                  duration={1} 
                  delay={0.3} 
                  decimals={2} 
                  useCurrencyConversion={true}
                />
              </p>
            </div>
            {loading && (
              <div className="flex items-center space-x-2 text-cinema-green">
                <Loader2 className="w-4 h-4 animate-spin" />
                <span className="text-sm">Loading...</span>
              </div>
            )}
          </div>
        </div>

        {/* Expense Items */}
        <div className="divide-y divide-cinematic-border">
          {filteredExpenses.map((expense, index) => {
            const IconComponent = categoryIcons[expense.category as keyof typeof categoryIcons] || Package;
            
            return (
              <motion.div
                key={expense.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.3, delay: index * 0.05 }}
                whileHover={{ backgroundColor: 'rgba(34, 197, 94, 0.05)' }}
                className="p-4 hover:bg-cinematic-glass transition-all duration-300 group"
              >
                {/* Fixed layout container */}
                <div className="flex items-center space-x-4">
                  {/* Icon - Fixed width */}
                  <div className="p-2.5 bg-cinema-green/10 rounded-full group-hover:bg-cinema-green/20 transition-colors flex-shrink-0">
                    <IconComponent className="w-4 h-4 text-cinema-green" />
                  </div>

                  {/* Details section - Flexible width with proper constraints */}
                  <div className="flex-1 min-w-0">
                    {/* Title and category - Fixed single line layout */}
                    <div className="flex items-center space-x-3 mb-1">
                      <h4 className="font-medium text-cinematic-text font-cinematic text-sm truncate flex-1">
                        {expense.description}
                      </h4>
                      <span className={`px-2 py-0.5 rounded-full text-xs font-medium border flex-shrink-0 ${
                        categoryColors[expense.category as keyof typeof categoryColors] || 'bg-cinematic-text-muted/20 text-cinematic-text-muted border-cinematic-text-muted/30'
                      }`}>
                        {expense.category}
                      </span>
                    </div>
                    
                    {/* Metadata row - Consistent spacing */}
                    <div className="flex items-center space-x-2 text-xs text-cinematic-text-secondary">
                      {expense.merchant && (
                        <>
                          <span className="truncate max-w-[100px]">{expense.merchant}</span>
                          <span className="text-cinematic-border">•</span>
                        </>
                      )}
                      {expense.paymentMethod && (
                        <>
                          <span className="truncate max-w-[80px]">{expense.paymentMethod}</span>
                          <span className="text-cinematic-border">•</span>
                        </>
                      )}
                      <span className="whitespace-nowrap">
                        {new Date(expense.date).toLocaleDateString()} at {expense.time}
                      </span>
                    </div>
                    
                    {/* Notes section - Controlled height */}
                    {expense.notes && (
                      <p className="text-xs text-cinematic-text-secondary mt-1 truncate">
                        {expense.notes}
                      </p>
                    )}
                  </div>

                  {/* Amount section - Fixed width */}
                  <div className="text-right flex-shrink-0 w-20">
                    <div className="text-lg font-bold text-financial-negative font-cinematic">
                      <CountUp
                        to={expense.amount}
                        duration={0.8}
                        delay={0.1 + index * 0.05}
                        decimals={2}
                        useCurrencyConversion={true}
                        currency={expense.currency}
                      />
                    </div>
                    <p className="text-xs text-cinematic-text-secondary">
                      {new Date(expense.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                    </p>
                  </div>

                  {/* Actions section - Fixed width */}
                  <div className="flex space-x-1 opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0 w-16 justify-end">
                    <motion.button
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.9 }}
                      onClick={() => {
                        setEditingTransaction(expense);
                        setShowForm(true);
                      }}
                      className="p-1.5 bg-cinema-green-light/10 text-cinema-green-light rounded-lg hover:bg-cinema-green-light/20 transition-colors"
                    >
                      <Edit2 className="w-3.5 h-3.5" />
                    </motion.button>
                    <motion.button
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.9 }}
                      onClick={() => handleDeleteExpense(expense.id)}
                      className="p-1.5 bg-financial-negative/10 text-financial-negative rounded-lg hover:bg-financial-negative/20 transition-colors"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </motion.button>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>

        {/* Load More Button */}
        {hasMoreTransactions && (
          <div className="p-4 border-t border-cinematic-border">
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={handleLoadMore}
              disabled={loadingMore}
              className="w-full py-3 bg-cinematic-glass border border-cinematic-border rounded-xl text-cinematic-text hover:border-cinema-green/30 transition-all disabled:opacity-50 flex items-center justify-center space-x-2"
            >
              {loadingMore ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Loading more...</span>
                </>
              ) : (
                <span>Load More Transactions</span>
              )}
            </motion.button>
          </div>
        )}

        {/* Empty State */}
        {filteredExpenses.length === 0 && !loading && (
          <div className="p-8 text-center">
            <Package className="w-10 h-10 text-cinematic-text-secondary mx-auto mb-3" />
            <h3 className="text-base font-medium text-cinematic-text mb-2">No expenses found</h3>
            <p className="text-cinematic-text-secondary text-sm">
              {searchQuery || selectedCategory !== 'all' || dateRange !== 'this-month'
                ? "Try adjusting your search or filter criteria"
                : "Start by adding your first expense"}
            </p>
          </div>
        )}
      </motion.div>

      {/* Expense Form Modal */}
      <AnimatePresence>
        {showForm && (
          <ExpenseForm 
            expense={editingTransaction}
            onClose={() => {
              setShowForm(false);
              setEditingTransaction(null);
            }}
            onSubmit={editingTransaction ? handleEditExpense : handleAddExpense}
          />
        )}
      </AnimatePresence>
    </div>
  );
};