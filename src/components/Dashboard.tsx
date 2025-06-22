import React, { useEffect } from 'react';
import { motion } from 'framer-motion';
import { Coins, TrendingUp, TrendingDown, Target, Star, Gift, Sparkles, Quote } from 'lucide-react';
import { useFinance } from '../contexts/FinanceContext';
import { useCurrency } from '../contexts/CurrencyContext';
import { useNotifications } from '../contexts/NotificationContext';
import { FriendlyFinancialOverview } from './FriendlyFinancialOverview';
import { FriendlyRecentTransactions } from './FriendlyRecentTransactions';
import { FriendlySpendingChart } from './FriendlySpendingChart';
import { FriendlyBudgetProgress } from './FriendlyBudgetProgress';
import { CountUp } from './CountUp';
import SplitText from './SplitText';

interface DashboardProps {
  onSectionChange: (section: string) => void;
}

export const Dashboard: React.FC<DashboardProps> = ({ onSectionChange }) => {
  const { getTotalIncome, getTotalExpenses, getNetWorth, goals, getRecentChange, transactions } = useFinance();
  const { convertAmount, formatAmount, currentCurrency } = useCurrency();
  const { generateFinancialNotifications } = useNotifications();

  // Generate notifications based on real data when dashboard loads
  useEffect(() => {
    generateFinancialNotifications(goals, transactions, currentCurrency);
  }, [goals, transactions, currentCurrency, generateFinancialNotifications]);

  const totalIncome = getTotalIncome();
  const totalExpenses = getTotalExpenses();
  const netWorth = getNetWorth();
  const activeGoals = goals.filter(g => g.status === 'active').length;
  const completedGoals = goals.filter(g => g.status === 'completed').length;
  const goalProgress = goals.length > 0 
    ? goals.reduce((sum, goal) => sum + (goal.currentAmount / goal.targetAmount * 100), 0) / goals.length 
    : 0;

  // Get real percentage changes
  const networthChange = getRecentChange('networth');
  const expenseChange = getRecentChange('expense');
  const incomeChange = getRecentChange('income');

  // Convert all amounts for display
  const convertedIncome = convertAmount(totalIncome);
  const convertedExpenses = convertAmount(totalExpenses);
  const convertedNetWorth = convertAmount(netWorth);

  const stats = [
    {
      title: 'Total Balance',
      value: netWorth,
      convertedValue: convertedNetWorth,
      change: networthChange.percentage !== 0 ? `${networthChange.percentage > 0 ? '+' : ''}${networthChange.percentage.toFixed(1)}%` : '0%',
      changeType: networthChange.percentage >= 0 ? 'positive' : 'negative',
      icon: Coins,
      description: 'Net worth',
      gradient: 'from-cinema-green to-cinema-green-light'
    },
    {
      title: 'Total Expenses',
      value: totalExpenses,
      convertedValue: convertedExpenses,
      change: expenseChange.percentage !== 0 ? `${expenseChange.percentage > 0 ? '+' : ''}${expenseChange.percentage.toFixed(1)}%` : '0%',
      changeType: expenseChange.percentage <= 0 ? 'positive' : 'negative', // Lower expenses are good
      icon: TrendingDown,
      description: 'Recent period',
      gradient: 'from-financial-negative to-financial-negative-light'
    },
    {
      title: 'Total Income',
      value: totalIncome,
      convertedValue: convertedIncome,
      change: incomeChange.percentage !== 0 ? `${incomeChange.percentage > 0 ? '+' : ''}${incomeChange.percentage.toFixed(1)}%` : '0%',
      changeType: incomeChange.percentage >= 0 ? 'positive' : 'negative',
      icon: TrendingUp,
      description: 'Recent period',
      gradient: 'from-cinema-emerald to-cinema-green-bright'
    },
    {
      title: 'Goals Progress',
      value: goalProgress,
      convertedValue: goalProgress, // Percentage doesn't need conversion
      change: `${activeGoals} active`,
      changeType: 'positive',
      icon: Target,
      description: `${completedGoals} completed`,
      gradient: 'from-premium-gold to-premium-copper'
    }
  ];

  return (
    <div className="space-y-3 sm:space-y-4 lg:space-y-6 px-1 sm:px-0">
      {/* Motivational Banner */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: "easeOut" }}
        className="relative overflow-hidden"
      >
        {/* Background effects */}
        <div className="absolute inset-0 bg-gradient-to-r from-cinema-green/15 via-cinema-emerald/10 to-premium-gold/15 rounded-xl sm:rounded-2xl" />
        <motion.div
          animate={{
            scale: [1, 1.1, 1],
            opacity: [0.2, 0.4, 0.2],
          }}
          transition={{
            duration: 4,
            repeat: Infinity,
            ease: "easeInOut"
          }}
          className="absolute top-0 left-1/4 w-32 sm:w-48 h-32 sm:h-48 bg-cinema-green/15 rounded-full blur-2xl"
        />

        {/* Banner Content */}
        <div className="relative bg-cinematic-surface/50 backdrop-blur-glass border border-cinema-green/20 rounded-xl sm:rounded-2xl p-3 sm:p-4 lg:p-6 shadow-cinematic">
          <div className="text-center">
            {/* Quote Icon */}
            <motion.div
              initial={{ scale: 0, rotate: -180 }}
              animate={{ scale: 1, rotate: 0 }}
              transition={{ duration: 0.6, delay: 0.1, type: "spring" }}
              className="mb-3 sm:mb-4"
            >
              <div className="w-8 h-8 sm:w-12 sm:h-12 bg-premium-gold/15 rounded-full flex items-center justify-center mx-auto backdrop-blur-glass border border-premium-gold/20">
                <Quote className="w-4 h-4 sm:w-6 sm:h-6 text-premium-gold" />
              </div>
            </motion.div>

            {/* Main Quote */}
            <div className="mb-3 sm:mb-4">
              <SplitText
                text="The most important investment you can make is in yourself."
                className="text-base sm:text-lg md:text-xl lg:text-2xl font-bold font-cinematic leading-tight"
                textClasses="bg-gradient-to-r from-cinema-green-dark via-cinema-green to-cinema-green-light bg-clip-text text-transparent"
                delay={30}
                duration={0.6}
                ease="power3.out"
                splitType="chars"
                from={{ opacity: 0, y: 30, rotationX: -60 }}
                to={{ opacity: 1, y: 0, rotationX: 0 }}
                threshold={0.3}
                rootMargin="-30px"
                textAlign="center"
              />
            </div>

            {/* Author Attribution */}
            <motion.div
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 1.2 }}
              className="flex items-center justify-center space-x-2"
            >
              <div className="h-px bg-gradient-to-r from-transparent via-cinema-green to-transparent flex-1 max-w-8 sm:max-w-16" />
              <div className="flex items-center space-x-1.5 sm:space-x-2">
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ duration: 15, repeat: Infinity, ease: "linear" }}
                >
                  <Sparkles className="w-3 h-3 sm:w-4 sm:h-4 text-cinema-green-bright" />
                </motion.div>
                <span className="text-xs sm:text-sm font-semibold text-cinematic-text-secondary bg-cinema-green/10 px-2 sm:px-3 py-1 rounded-full border border-cinema-green/15">
                  Warren Buffett
                </span>
                <motion.div
                  animate={{ rotate: -360 }}
                  transition={{ duration: 12, repeat: Infinity, ease: "linear" }}
                >
                  <Star className="w-3 h-3 sm:w-4 sm:h-4 text-premium-gold" />
                </motion.div>
              </div>
              <div className="h-px bg-gradient-to-r from-transparent via-cinema-green to-transparent flex-1 max-w-8 sm:max-w-16" />
            </motion.div>

            {/* Subtitle */}
            <motion.p
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 1.4 }}
              className="text-xs sm:text-sm text-cinematic-text-muted mt-2 sm:mt-3 font-medium"
            >
              Master your finances, master your future
            </motion.p>
          </div>
        </div>
      </motion.div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-2 sm:gap-3 lg:gap-4">
        {stats.map((stat, index) => (
          <motion.div
            key={stat.title}
            initial={{ opacity: 0, y: 30, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{ 
              duration: 0.5, 
              delay: index * 0.1, 
              type: "spring",
              stiffness: 120
            }}
            className="bg-cinematic-surface/50 backdrop-blur-glass border border-cinematic-border rounded-xl sm:rounded-2xl p-2.5 sm:p-3 lg:p-4 transition-all duration-300 relative overflow-hidden group shadow-elevated min-h-[90px] sm:min-h-[110px]"
            style={{
              background: 'linear-gradient(135deg, rgba(34, 197, 94, 0.08) 0%, rgba(22, 67, 22, 0.7) 100%)',
            }}
          >
            {/* Background gradient effect */}
            <div className={`absolute inset-0 bg-gradient-to-br ${stat.gradient} opacity-5 group-hover:opacity-10 transition-opacity duration-500`} />
            
            <div className="relative z-10">
              <div className="flex items-center justify-between mb-2 sm:mb-3">
                <div className={`p-1.5 sm:p-2 bg-gradient-to-br ${stat.gradient} rounded-lg transition-transform duration-300`}>
                  <stat.icon className="w-3 h-3 sm:w-4 sm:h-4 text-white" />
                </div>
                <div className={`flex items-center space-x-1 text-xs ${
                  stat.changeType === 'positive' ? 'text-cinema-green-bright' : 'text-financial-negative-light'
                }`}>
                  <span className="font-bold text-xs">{stat.change}</span>
                  <motion.span
                    animate={{ scale: [1, 1.1, 1] }}
                    transition={{ duration: 2, repeat: Infinity }}
                    className="text-xs"
                  >
                    {stat.changeType === 'positive' ? '📈' : '📉'}
                  </motion.span>
                </div>
              </div>
              
              <div>
                <h3 className="text-xs text-cinematic-text-muted mb-1 font-medium">{stat.title}</h3>
                {stat.title === 'Goals Progress' ? (
                  <CountUp
                    to={stat.convertedValue}
                    duration={1.2}
                    delay={0.3 + index * 0.05}
                    suffix="%"
                    decimals={0}
                    className="text-sm sm:text-base lg:text-lg font-bold text-cinematic-text font-cinematic mb-1 transition-transform duration-300"
                  />
                ) : (
                  <CountUp
                    to={stat.value}
                    duration={1.2}
                    delay={0.3 + index * 0.05}
                    decimals={2}
                    useCurrencyConversion={true}
                    className="text-sm sm:text-base lg:text-lg font-bold text-cinematic-text font-cinematic mb-1 transition-transform duration-300"
                  />
                )}
                <p className="text-xs text-cinematic-text-secondary flex items-center space-x-1">
                  <span>{stat.description}</span>
                  {stat.title.includes('Goal') && <Gift className="w-2.5 h-2.5 text-premium-gold" />}
                </p>
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-3 sm:gap-4 lg:gap-6">
        {/* Left Column - Overview and Transactions */}
        <div className="xl:col-span-2 space-y-3 sm:space-y-4 lg:space-y-6">
          <FriendlyFinancialOverview />
          <FriendlyRecentTransactions />
        </div>

        {/* Right Column - Charts and Progress */}
        <div className="space-y-3 sm:space-y-4 lg:space-y-6">
          <FriendlySpendingChart />
          <FriendlyBudgetProgress onSectionChange={onSectionChange} />
        </div>
      </div>
    </div>
  );
};