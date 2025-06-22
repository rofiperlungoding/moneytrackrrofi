import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, DollarSign, Briefcase, TrendingUp, Target, Edit2, Trash2, Gift, Wallet } from 'lucide-react';
import { useFinance, Transaction } from '../contexts/FinanceContext';
import { useCurrency } from '../contexts/CurrencyContext';
import { IncomeForm } from './IncomeForm';
import { CountUp } from './CountUp';

const sourceIcons = {
  'Salary': Briefcase,
  'Freelance': TrendingUp,
  'Investment': Target,
  'Business': DollarSign,
  'Allowance': Gift,
  'Gifts': Gift,
  'Other': Wallet
};

const categoryColors = {
  'Employment': 'bg-cinema-green-light/20 text-cinema-green-light border-cinema-green-light/30',
  'Freelance': 'bg-premium-gold/20 text-premium-gold border-premium-gold/30',
  'Investment': 'bg-cinema-emerald/20 text-cinema-emerald border-cinema-emerald/30',
  'Business': 'bg-premium-copper/20 text-premium-copper border-premium-copper/30',
  'Allowance': 'bg-fun-pink/20 text-fun-pink border-fun-pink/30',
  'Gifts': 'bg-premium-gold/20 text-premium-gold border-premium-gold/30',
  'Other': 'bg-cinematic-text-muted/20 text-cinematic-text-muted border-cinematic-text-muted/30',
};

export const IncomeTracker: React.FC = () => {
  const { transactions, addTransaction, updateTransaction, deleteTransaction } = useFinance();
  const { convertAmount, currentCurrency } = useCurrency();
  const [showForm, setShowForm] = useState(false);
  const [editingTransaction, setEditingTransaction] = useState<Transaction | null>(null);

  const incomes = transactions.filter(t => t.type === 'income');
  
  const totalIncome = incomes.reduce((sum, income) => sum + income.amount, 0);
  const recurringIncome = incomes
    .filter(income => income.recurring)
    .reduce((sum, income) => sum + income.amount, 0);
  const oneTimeIncome = totalIncome - recurringIncome;
  const averageIncome = incomes.length > 0 ? totalIncome / incomes.length : 0;

  const handleAddIncome = (incomeData: any) => {
    addTransaction({
      type: 'income',
      amount: parseFloat(incomeData.amount),
      description: incomeData.description,
      category: incomeData.category,
      date: incomeData.date,
      time: new Date().toTimeString().slice(0, 5),
      source: incomeData.source,
      notes: incomeData.notes,
      recurring: incomeData.recurring,
      currency: currentCurrency
    });
    setShowForm(false);
  };

  const handleEditIncome = (incomeData: any) => {
    if (editingTransaction) {
      updateTransaction(editingTransaction.id, {
        amount: parseFloat(incomeData.amount),
        description: incomeData.description,
        category: incomeData.category,
        date: incomeData.date,
        source: incomeData.source,
        notes: incomeData.notes,
        recurring: incomeData.recurring,
        currency: currentCurrency
      });
      setEditingTransaction(null);
    }
  };

  const handleDeleteIncome = (id: string) => {
    if (confirm('Are you sure you want to delete this income?')) {
      deleteTransaction(id);
    }
  };

  const incomeStats = [
    { label: 'Total Income', value: totalIncome, change: '+5.2%', color: 'text-cinema-green' },
    { label: 'Recurring Income', value: recurringIncome, change: '+2.1%', color: 'text-cinema-green-light' },
    { label: 'One-time Income', value: oneTimeIncome, change: '+12.8%', color: 'text-premium-gold' },
    { label: 'Average Income', value: averageIncome, change: '+3.5%', color: 'text-premium-copper' }
  ];

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
          <h1 className="text-3xl font-bold text-cinematic-text font-cinematic">Income Tracker</h1>
          <p className="text-cinematic-text-secondary mt-1 text-base">Monitor and manage your revenue streams</p>
        </div>
        <motion.button
          whileHover={{ scale: 1.05, boxShadow: '0 0 25px rgba(34, 197, 94, 0.4)' }}
          whileTap={{ scale: 0.95 }}
          onClick={() => setShowForm(true)}
          className="flex items-center space-x-2 bg-premium-green text-white px-6 py-3 rounded-2xl font-medium hover:shadow-glow-green transition-all"
        >
          <Plus className="w-4 h-4" />
          <span>Add Income</span>
        </motion.button>
      </motion.div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {incomeStats.map((stat, index) => (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: index * 0.1 }}
            className="bg-cinematic-surface/60 backdrop-blur-premium border border-cinematic-border rounded-2xl p-4 hover:border-cinema-green/30 transition-all hover:shadow-glow-green group duration-300 shadow-cinematic"
          >
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-xs text-cinematic-text-secondary">{stat.label}</h3>
              <div className={`text-xs ${stat.color}`}>
                {stat.change}
              </div>
            </div>
            <div className={`text-xl font-bold font-cinematic ${stat.color}`}>
              <CountUp
                to={stat.value}
                duration={1.2}
                delay={0.2 + index * 0.1}
                decimals={2}
                useCurrencyConversion={true}
              />
            </div>
          </motion.div>
        ))}
      </div>

      {/* Income Sources */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.4 }}
        className="bg-cinematic-surface/60 backdrop-blur-premium border border-cinematic-border rounded-2xl shadow-cinematic"
      >
        <div className="p-4 border-b border-cinematic-border">
          <h3 className="text-lg font-bold text-cinematic-text font-cinematic">Income Sources</h3>
          <p className="text-cinematic-text-secondary text-xs">Your revenue streams</p>
        </div>

        <div className="divide-y divide-cinematic-border">
          {incomes.map((income, index) => {
            const IconComponent = sourceIcons[income.source as keyof typeof sourceIcons] || Wallet;
            
            return (
              <motion.div
                key={income.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.3, delay: 0.5 + index * 0.1 }}
                whileHover={{ backgroundColor: 'rgba(34, 197, 94, 0.05)' }}
                className="p-4 hover:bg-cinematic-glass transition-all duration-300 group"
              >
                <div className="flex items-center space-x-3">
                  {/* Icon */}
                  <div className="p-2.5 bg-cinema-green/10 rounded-full group-hover:bg-cinema-green/20 transition-colors">
                    <IconComponent className="w-4 h-4 text-cinema-green" />
                  </div>

                  {/* Details */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center space-x-2 mb-0.5">
                      <h4 className="font-medium text-cinematic-text font-cinematic text-sm">
                        {income.description}
                      </h4>
                      {income.recurring && (
                        <span className="px-1.5 py-0.5 bg-cinema-green-light/20 text-cinema-green-light border border-cinema-green-light/30 rounded-full text-xs font-medium">
                          Recurring
                        </span>
                      )}
                      <span className={`px-1.5 py-0.5 rounded-full text-xs font-medium border ${
                        categoryColors[income.category as keyof typeof categoryColors] || 'bg-cinematic-text-muted/20 text-cinematic-text-muted border-cinematic-text-muted/30'
                      }`}>
                        {income.category}
                      </span>
                    </div>
                    
                    <div className="flex items-center space-x-3 text-xs text-cinematic-text-secondary">
                      {income.source && (
                        <>
                          <span>{income.source}</span>
                          <span>•</span>
                        </>
                      )}
                      <span>{new Date(income.date).toLocaleDateString()}</span>
                      {income.notes && (
                        <>
                          <span>•</span>
                          <span className="truncate">{income.notes}</span>
                        </>
                      )}
                    </div>
                  </div>

                  {/* Amount */}
                  <div className="text-right">
                    <div className="text-lg font-bold text-cinema-green font-cinematic">
                      <CountUp
                        to={income.amount}
                        duration={0.8}
                        delay={0.1 + index * 0.05}
                        prefix="+"
                        decimals={2}
                        useCurrencyConversion={true}
                        currency={income.currency}
                      />
                    </div>
                    <p className="text-xs text-cinematic-text-secondary">
                      {new Date(income.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                    </p>
                  </div>

                  {/* Actions */}
                  <div className="flex space-x-1.5 opacity-0 group-hover:opacity-100 transition-opacity">
                    <motion.button
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.9 }}
                      onClick={() => {
                        setEditingTransaction(income);
                        setShowForm(true);
                      }}
                      className="p-1.5 bg-cinema-green-light/10 text-cinema-green-light rounded-lg hover:bg-cinema-green-light/20 transition-colors"
                    >
                      <Edit2 className="w-3.5 h-3.5" />
                    </motion.button>
                    <motion.button
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.9 }}
                      onClick={() => handleDeleteIncome(income.id)}
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

        {/* Empty State */}
        {incomes.length === 0 && (
          <div className="p-8 text-center">
            <Wallet className="w-10 h-10 text-cinematic-text-secondary mx-auto mb-3" />
            <h3 className="text-base font-medium text-cinematic-text mb-2">No income recorded</h3>
            <p className="text-cinematic-text-secondary text-sm">
              Start by adding your first income source
            </p>
          </div>
        )}
      </motion.div>

      {/* Income Form Modal */}
      <AnimatePresence>
        {showForm && (
          <IncomeForm 
            income={editingTransaction}
            onClose={() => {
              setShowForm(false);
              setEditingTransaction(null);
            }}
            onSubmit={editingTransaction ? handleEditIncome : handleAddIncome}
          />
        )}
      </AnimatePresence>
    </div>
  );
};