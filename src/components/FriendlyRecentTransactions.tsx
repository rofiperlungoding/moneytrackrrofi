import React, { useMemo } from 'react';
import { motion } from 'framer-motion';
import { ShoppingBag, Coffee, Gamepad2, Gift, Sandwich, Car, BookOpen, Eye, DollarSign, ShoppingCart } from 'lucide-react';
import { useFinance } from '../contexts/FinanceContext';
import { useCurrency } from '../contexts/CurrencyContext';
import { CountUp } from './CountUp';

const categoryColors = {
  'Food & Dining': 'bg-premium-copper/20 text-premium-copper border-premium-copper/30',
  'Allowance': 'bg-cinema-green/20 text-cinema-green border-cinema-green/30',
  'Gifts': 'bg-cinema-green/20 text-cinema-green border-cinema-green/30',
  'Transportation': 'bg-cinema-green-light/20 text-cinema-green-light border-cinema-green-light/30',
  'Education': 'bg-premium-gold/20 text-premium-gold border-premium-gold/30',
  'Entertainment': 'bg-fun-pink/20 text-fun-pink border-fun-pink/30',
};

const iconMap = {
  'Food & Dining': Sandwich,
  'Allowance': Gift,
  'Gifts': Gift,
  'Transportation': Car,
  'Education': BookOpen,
  'Entertainment': Gamepad2,
  'Other': ShoppingBag
};

export const FriendlyRecentTransactions: React.FC = () => {
  const { transactions } = useFinance();
  const { convertAmount } = useCurrency();
  
  // Get the 5 most recent transactions (memoized for performance)
  const recentTransactions = useMemo(() => 
    transactions.slice(0, 5),
    [transactions]
  );
  
  const totalSpent = useMemo(() => 
    recentTransactions
      .filter(t => t.type === 'expense')
      .reduce((sum, t) => sum + t.amount, 0),
    [recentTransactions]
  );
  
  const totalReceived = useMemo(() => 
    recentTransactions
      .filter(t => t.type === 'income')
      .reduce((sum, t) => sum + t.amount, 0),
    [recentTransactions]
  );

  // Convert totals for display
  const convertedSpent = useMemo(() => convertAmount(totalSpent), [convertAmount, totalSpent]);
  const convertedReceived = useMemo(() => convertAmount(totalReceived), [convertAmount, totalReceived]);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.4 }}
      className="bg-cinematic-surface/60 backdrop-blur-premium border-2 border-premium-gold/20 rounded-3xl p-6 shadow-cinematic relative overflow-hidden"
      style={{
        background: 'linear-gradient(135deg, rgba(245, 158, 11, 0.1) 0%, rgba(22, 67, 22, 0.85) 100%)',
      }}
    >
      {/* Background decorations */}
      <div className="absolute top-0 right-0 w-32 h-32 bg-premium-gold/8 rounded-full blur-3xl" />
      <div className="absolute bottom-0 left-0 w-24 h-24 bg-fun-pink/5 rounded-full blur-2xl" />
      
      <div className="relative">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-premium-gold/20 rounded-2xl flex items-center justify-center">
              <ShoppingBag className="w-5 h-5 text-premium-gold" />
            </div>
            <div>
              <h3 className="text-xl font-bold text-cinematic-text font-cinematic">Recent Activity</h3>
              <p className="text-cinematic-text-muted text-sm">Your latest transactions</p>
            </div>
          </div>
          
          <div className="text-right">
            <div className="flex items-center space-x-3 mb-2">
              <div className="text-center">
                <div className="flex items-center justify-center space-x-1 mb-1">
                  <DollarSign className="w-3 h-3 text-cinematic-text-muted" />
                  <p className="text-xs text-cinematic-text-muted">Earned</p>
                </div>
                <div className="text-base font-bold text-cinema-green">
                  <CountUp 
                    to={totalReceived} 
                    duration={1} 
                    delay={0.3} 
                    decimals={2} 
                    useCurrencyConversion={true}
                  />
                </div>
              </div>
              <div className="text-center">
                <div className="flex items-center justify-center space-x-1 mb-1">
                  <ShoppingCart className="w-3 h-3 text-cinematic-text-muted" />
                  <p className="text-xs text-cinematic-text-muted">Spent</p>
                </div>
                <div className="text-base font-bold text-financial-negative">
                  <CountUp 
                    to={totalSpent} 
                    duration={1} 
                    delay={0.4} 
                    decimals={2} 
                    useCurrencyConversion={true}
                  />
                </div>
              </div>
            </div>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="text-xs text-cinema-green-light hover:text-cinema-green-light/80 transition-colors font-medium bg-cinema-green-light/10 px-2.5 py-1 rounded-xl flex items-center space-x-1"
            >
              <Eye className="w-3 h-3" />
              <span>See All</span>
            </motion.button>
          </div>
        </div>

        {/* Transaction List */}
        <div className="space-y-3">
          {recentTransactions.length === 0 ? (
            <div className="text-center py-6">
              <ShoppingBag className="w-10 h-10 text-cinematic-text-secondary mx-auto mb-3" />
              <h3 className="text-base font-medium text-cinematic-text mb-2">No transactions yet</h3>
              <p className="text-cinematic-text-secondary text-sm">Start by adding your first transaction!</p>
            </div>
          ) : (
            recentTransactions.map((transaction, index) => {
              const IconComponent = iconMap[transaction.category as keyof typeof iconMap] || ShoppingBag;
              
              return (
                <motion.div
                  key={transaction.id}
                  initial={{ opacity: 0, x: -30, scale: 0.95 }}
                  animate={{ opacity: 1, x: 0, scale: 1 }}
                  transition={{ duration: 0.5, delay: 0.5 + index * 0.1, type: "spring" }}
                  whileHover={{ scale: 1.02, x: 6 }}
                  className="flex items-center space-x-3 p-4 rounded-2xl hover:bg-cinematic-glass transition-all group relative duration-300 border border-transparent hover:border-cinema-green-light/20"
                >
                  {/* Transaction Icon */}
                  <div className={`p-2.5 rounded-2xl ${
                    transaction.type === 'expense' ? 'bg-financial-negative/20' : 'bg-cinema-green/20'
                  } group-hover:scale-110 transition-transform`}>
                    <div className="flex items-center space-x-1">
                      <IconComponent className={`w-4 h-4 ${
                        transaction.type === 'expense' ? 'text-financial-negative' : 'text-cinema-green'
                      }`} />
                    </div>
                  </div>

                  {/* Transaction Details */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center space-x-2 mb-1">
                      <p className="font-bold text-cinematic-text font-cinematic text-sm truncate">
                        {transaction.description}
                      </p>
                      <span className={`px-2 py-0.5 rounded-xl text-xs font-medium border ${
                        categoryColors[transaction.category as keyof typeof categoryColors] || 
                        'bg-cinematic-text-muted/20 text-cinematic-text-muted border-cinematic-text-muted/30'
                      }`}>
                        {transaction.category}
                      </span>
                    </div>
                    <div className="flex items-center space-x-2">
                      {transaction.merchant && (
                        <>
                          <p className="text-cinematic-text-secondary font-medium text-xs">
                            {transaction.merchant}
                          </p>
                          <span className="text-cinematic-text-secondary">•</span>
                        </>
                      )}
                      <p className="text-xs text-cinematic-text-secondary">
                        {new Date(transaction.date).toLocaleDateString()}
                      </p>
                    </div>
                  </div>

                  {/* Amount */}
                  <div className="text-right">
                    <motion.div
                      initial={{ scale: 0.8 }}
                      animate={{ scale: 1 }}
                      transition={{ duration: 0.3, delay: 0.6 + index * 0.1, type: "spring" }}
                      className={`font-bold font-cinematic text-lg ${
                        transaction.amount > 0 ? 'text-cinema-green' : 'text-financial-negative'
                      }`}
                    >
                      <CountUp
                        to={transaction.amount}
                        duration={0.8}
                        delay={0.1 + index * 0.05}
                        prefix={transaction.type === 'income' ? '+' : '-'}
                        decimals={2}
                        useCurrencyConversion={true}
                        currency={transaction.currency}
                      />
                    </motion.div>
                    <p className="text-xs text-cinematic-text-secondary mt-0.5">
                      {new Date(transaction.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                    </p>
                  </div>

                  {/* Hover effect line */}
                  <motion.div
                    initial={{ width: 0 }}
                    whileHover={{ width: '100%' }}
                    className={`absolute bottom-0 left-0 h-1 rounded-full ${
                      transaction.type === 'income' ? 'bg-cinema-green/30' : 'bg-financial-negative/30'
                    }`}
                  />
                </motion.div>
              );
            })
          )}
        </div>
      </div>
    </motion.div>
  );
};