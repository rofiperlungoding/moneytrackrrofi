import React, { useState, useRef, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Calendar, Smile, Frown, Meh, TrendingUp, CalendarDays, CalendarRange, DollarSign, Wallet, ShoppingCart, BarChart, Target, Trophy, LayoutGrid, ListOrdered, Loader2 } from 'lucide-react';
import { useFinance } from '../contexts/FinanceContext';
import { useCurrency } from '../contexts/CurrencyContext';
import { CountUp } from './CountUp';

const timeframes = [
  { value: '7D', label: 'Week', icon: CalendarDays },
  { value: '1M', label: 'Month', icon: Calendar },
  { value: '3M', label: '3M', icon: CalendarRange },
];

export const FriendlyFinancialOverview: React.FC = () => {
  const { getTotalIncome, getTotalExpenses, getNetWorth, settings, getLargestTransactionAmount, getUniqueCategoriesCount, getTotalTransactionsCount, getDailyAverageExpense, getRecentChange, loading } = useFinance();
  const { convertAmount, formatAmount } = useCurrency();
  const [selectedTimeframe, setSelectedTimeframe] = useState('1M');

  // Button refs for sliding animation
  const buttonRefs = useRef<{ [key: string]: HTMLButtonElement | null }>({});
  const containerRef = useRef<HTMLDivElement>(null);
  const [indicatorStyle, setIndicatorStyle] = useState({
    width: 0,
    left: 0,
  });

  const monthlyIncome = getTotalIncome();
  const monthlyExpenses = getTotalExpenses();
  const netWorth = getNetWorth();
  const savingsRate = monthlyIncome > 0 ? ((monthlyIncome - monthlyExpenses) / monthlyIncome * 100) : 0;
  const showBalances = settings.privacy.showBalances;

  // Get real data
  const largestTransaction = getLargestTransactionAmount();
  const categoriesCount = getUniqueCategoriesCount();
  const transactionsCount = getTotalTransactionsCount();
  const dailyAverage = getDailyAverageExpense();

  // Convert amounts for display
  const convertedIncome = convertAmount(monthlyIncome);
  const convertedExpenses = convertAmount(monthlyExpenses);
  const convertedNetWorth = convertAmount(netWorth);

  // Update indicator position when selected timeframe changes
  useEffect(() => {
    const updateIndicatorPosition = () => {
      const activeButton = buttonRefs.current[selectedTimeframe];
      const container = containerRef.current;
      
      if (activeButton && container) {
        const containerRect = container.getBoundingClientRect();
        const buttonRect = activeButton.getBoundingClientRect();
        
        setIndicatorStyle({
          width: buttonRect.width,
          left: buttonRect.left - containerRect.left,
        });
      }
    };

    // Update position immediately
    updateIndicatorPosition();
    
    // Update position on window resize
    const handleResize = () => updateIndicatorPosition();
    window.addEventListener('resize', handleResize);
    
    return () => window.removeEventListener('resize', handleResize);
  }, [selectedTimeframe]);

  const getMoodIcon = () => {
    if (savingsRate > 50) return <Smile className="w-4 h-4 text-cinema-green-bright" />;
    if (savingsRate > 30) return <Meh className="w-4 h-4 text-premium-gold" />;
    return <Frown className="w-4 h-4 text-financial-negative" />;
  };

  const getMoodMessage = () => {
    if (savingsRate > 50) return "Outstanding! You're building wealth!";
    if (savingsRate > 30) return "Good progress! Keep going!";
    return "Let's optimize your savings!";
  };

  const getMoodGradient = () => {
    if (savingsRate > 50) return 'from-cinema-green/15 to-cinema-green-bright/8';
    if (savingsRate > 30) return 'from-premium-gold/15 to-cinema-green/8';
    return 'from-financial-negative/10 to-cinema-green/5';
  };

  if (loading) {
    return (
      <div className="bg-cinematic-surface/50 backdrop-blur-glass border border-cinema-green/15 rounded-xl sm:rounded-2xl p-3 sm:p-4 lg:p-5 shadow-cinematic relative overflow-hidden flex items-center justify-center min-h-[200px]">
        <div className="text-center">
          <Loader2 className="w-8 h-8 animate-spin text-cinema-green mx-auto mb-2" />
          <p className="text-sm text-cinematic-text-secondary">Loading overview...</p>
        </div>
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.2 }}
      className="bg-cinematic-surface/50 backdrop-blur-glass border border-cinema-green/15 rounded-xl sm:rounded-2xl p-3 sm:p-4 lg:p-5 shadow-cinematic relative overflow-hidden transition-all duration-300"
      style={{
        background: 'linear-gradient(135deg, rgba(34, 197, 94, 0.1) 0%, rgba(22, 67, 22, 0.8) 100%)',
      }}
    >
      {/* Background decorative effects */}
      <div className="absolute top-0 right-0 w-24 h-24 bg-cinema-green/8 rounded-full blur-2xl" />
      <div className="absolute bottom-0 left-0 w-16 h-16 bg-cinema-emerald/6 rounded-full blur-xl" />
      
      <div className="relative z-10">
        {/* Header */}
        <div className="flex items-center justify-between mb-4 sm:mb-5">
          <div className="flex items-center space-x-2">
            <div className="w-7 h-7 sm:w-8 sm:h-8 bg-premium-green rounded-xl flex items-center justify-center shadow-glow-green">
              <Calendar className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-white" />
            </div>
            <div>
              <h2 className="text-sm sm:text-base lg:text-lg font-bold text-cinematic-text font-cinematic">Money Overview</h2>
              <p className="text-xs text-cinematic-text-muted">Track your progress</p>
            </div>
          </div>
          
          <div className="flex items-center space-x-2">
            {/* Timeframe Selector with Sliding Animation */}
            <div 
              ref={containerRef}
              className="relative flex items-center bg-cinematic-glass backdrop-blur-glass rounded-xl p-0.5 border border-cinema-green/15"
            >
              {/* Sliding Background Indicator */}
              <motion.div
                className="absolute bg-premium-green rounded-lg shadow-glow-green"
                animate={{
                  width: indicatorStyle.width,
                  x: indicatorStyle.left,
                }}
                initial={false}
                transition={{
                  type: "spring",
                  stiffness: 400,
                  damping: 30,
                  mass: 0.8,
                }}
                style={{
                  height: 'calc(100% - 4px)',
                  top: '2px',
                }}
              />
              
              {/* Timeframe Buttons */}
              {timeframes.map((timeframe, index) => (
                <motion.button
                  key={timeframe.value}
                  ref={(el) => (buttonRefs.current[timeframe.value] = el)}
                  onClick={() => setSelectedTimeframe(timeframe.value)}
                  className={`relative z-10 px-2 py-1 text-xs rounded-lg transition-all flex items-center space-x-1 ${
                    selectedTimeframe === timeframe.value
                      ? 'text-white font-semibold'
                      : 'text-cinematic-text-muted hover:text-cinematic-text'
                  }`}
                  whileHover={{
                    scale: selectedTimeframe !== timeframe.value ? 1.02 : 1,
                  }}
                  whileTap={{ scale: 0.98 }}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ 
                    duration: 0.25, 
                    delay: index * 0.05,
                    type: "spring",
                    stiffness: 120
                  }}
                >
                  <motion.div
                    animate={{
                      scale: selectedTimeframe === timeframe.value ? 1.05 : 1,
                    }}
                    transition={{
                      duration: 0.2,
                      type: "spring",
                      stiffness: 300
                    }}
                  >
                    <timeframe.icon className="w-2.5 h-2.5" />
                  </motion.div>
                  <motion.span
                    className="font-medium hidden sm:inline"
                    animate={{
                      scale: selectedTimeframe === timeframe.value ? 1.02 : 1,
                    }}
                    transition={{
                      duration: 0.2,
                      type: "spring",
                      stiffness: 200
                    }}
                  >
                    {timeframe.label}
                  </motion.span>
                </motion.button>
              ))}
            </div>
          </div>
        </div>

        {/* Savings Score Indicator */}
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ duration: 0.4, delay: 0.3, type: "spring" }}
          className={`bg-gradient-to-r ${getMoodGradient()} rounded-xl p-3 mb-4 border border-cinema-green/15 backdrop-blur-glass`}
        >
          <div className="flex items-center space-x-2">
            {getMoodIcon()}
            <div>
              <h3 className="text-sm sm:text-base font-bold text-cinematic-text flex items-center space-x-1.5">
                <span>
                  Savings: <CountUp to={savingsRate} duration={1.2} delay={0.4} suffix="%" decimals={0} />
                </span>
                <motion.div
                  animate={{ rotate: [0, 8, -8, 0] }}
                  transition={{ duration: 2, repeat: Infinity }}
                >
                  <TrendingUp className="w-3 h-3 text-cinema-green-bright" />
                </motion.div>
              </h3>
              <p className="text-xs text-cinematic-text-secondary">{getMoodMessage()}</p>
            </div>
          </div>
        </motion.div>

        {/* Balance Display */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 sm:gap-4">
          <div className="text-center">
            <div className="bg-cinema-green/8 backdrop-blur-glass rounded-xl p-3 border border-cinema-green/15 hover:border-cinema-green/25 transition-all duration-300 hover:shadow-glow-green">
              <div className="flex items-center justify-center space-x-1 mb-1.5">
                <DollarSign className="w-3 h-3 text-cinematic-text-muted" />
                <p className="text-xs text-cinematic-text-muted font-medium">Total Balance</p>
              </div>
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ duration: 0.6, delay: 0.35, type: "spring" }}
                className="text-lg sm:text-xl font-bold text-cinema-green font-cinematic"
              >
                {showBalances ? (
                  <CountUp 
                    to={netWorth} 
                    duration={1} 
                    delay={0.5} 
                    decimals={2} 
                    useCurrencyConversion={true}
                  />
                ) : (
                  '••••••••'
                )}
              </motion.div>
              <div className="flex items-center justify-center space-x-1 mt-1">
                <TrendingUp className="w-2.5 h-2.5 text-cinema-green-bright" />
                <span className="text-cinema-green-bright text-xs font-medium">
                  {netWorth > 0 ? 'Growing!' : 'Start building!'}
                </span>
              </div>
            </div>
          </div>

          <div className="text-center">
            <div className="bg-cinema-emerald/8 backdrop-blur-glass rounded-xl p-3 border border-cinema-emerald/15 hover:border-cinema-emerald/25 transition-all duration-300">
              <div className="flex items-center justify-center space-x-1 mb-1.5">
                <Wallet className="w-3 h-3 text-cinematic-text-muted" />
                <p className="text-xs text-cinematic-text-muted font-medium">Money Earned</p>
              </div>
              <div className="text-lg sm:text-xl font-bold text-cinema-emerald font-cinematic">
                {showBalances ? (
                  <CountUp 
                    to={monthlyIncome} 
                    duration={1} 
                    delay={0.6} 
                    decimals={2} 
                    useCurrencyConversion={true}
                  />
                ) : (
                  '••••••••'
                )}
              </div>
              <div className="flex items-center justify-center space-x-1 mt-1">
                <TrendingUp className="w-2.5 h-2.5 text-cinema-green-bright" />
                <span className="text-cinema-green-bright text-xs font-medium">
                  {monthlyIncome > 0 ? 'Great job!' : 'Add income!'}
                </span>
              </div>
            </div>
          </div>

          <div className="text-center">
            <div className="bg-financial-negative/8 backdrop-blur-glass rounded-xl p-3 border border-financial-negative/15 hover:border-financial-negative/25 transition-all duration-300">
              <div className="flex items-center justify-center space-x-1 mb-1.5">
                <ShoppingCart className="w-3 h-3 text-cinematic-text-muted" />
                <p className="text-xs text-cinematic-text-muted font-medium">Money Spent</p>
              </div>
              <div className="text-lg sm:text-xl font-bold text-financial-negative font-cinematic">
                {showBalances ? (
                  <CountUp 
                    to={monthlyExpenses} 
                    duration={1} 
                    delay={0.7} 
                    decimals={2} 
                    useCurrencyConversion={true}
                  />
                ) : (
                  '••••••••'
                )}
              </div>
              <div className="flex items-center justify-center space-x-1 mt-1">
                <BarChart className="w-2.5 h-2.5 text-cinema-green-bright" />
                <span className="text-cinema-green-bright text-xs font-medium">
                  {monthlyExpenses > 0 ? 'Track spending!' : 'No expenses yet!'}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Quick Insights */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-2 sm:gap-3 mt-4 pt-3 border-t border-cinema-green/15">
          <div className="text-center bg-premium-gold/8 backdrop-blur-glass rounded-lg p-2 border border-premium-gold/15">
            <div className="flex items-center justify-center space-x-0.5 mb-0.5">
              <Target className="w-2.5 h-2.5 text-cinematic-text-muted" />
              <p className="text-xs text-cinematic-text-muted">Daily Avg</p>
            </div>
            <div className="text-sm font-bold text-premium-gold">
              {showBalances ? (
                <CountUp to={dailyAverage} duration={0.8} delay={0.8} useCurrencyConversion={true} decimals={2} />
              ) : (
                '••••'
              )}
            </div>
          </div>
          <div className="text-center bg-cinema-jade/8 backdrop-blur-glass rounded-lg p-2 border border-cinema-jade/15">
            <div className="flex items-center justify-center space-x-0.5 mb-0.5">
              <Trophy className="w-2.5 h-2.5 text-cinematic-text-muted" />
              <p className="text-xs text-cinematic-text-muted">Largest</p>
            </div>
            <div className="text-sm font-bold text-cinema-jade">
              {showBalances ? (
                <CountUp to={largestTransaction} duration={0.8} delay={0.9} useCurrencyConversion={true} decimals={2} />
              ) : (
                '••••'
              )}
            </div>
          </div>
          <div className="text-center bg-cinema-green-dark/8 backdrop-blur-glass rounded-lg p-2 border border-cinema-green-dark/15">
            <div className="flex items-center justify-center space-x-0.5 mb-0.5">
              <LayoutGrid className="w-2.5 h-2.5 text-cinematic-text-muted" />
              <p className="text-xs text-cinematic-text-muted">Categories</p>
            </div>
            <div className="text-sm font-bold text-cinema-green-dark">
              <CountUp to={categoriesCount} duration={0.6} delay={1.0} />
            </div>
          </div>
          <div className="text-center bg-cinema-green-light/8 backdrop-blur-glass rounded-lg p-2 border border-cinema-green-light/15">
            <div className="flex items-center justify-center space-x-0.5 mb-0.5">
              <ListOrdered className="w-2.5 h-2.5 text-cinematic-text-muted" />
              <p className="text-xs text-cinematic-text-muted">Transactions</p>
            </div>
            <div className="text-sm font-bold text-cinema-green-light">
              <CountUp to={transactionsCount} duration={0.6} delay={1.1} />
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
};