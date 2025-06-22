import React from 'react';
import { motion } from 'framer-motion';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';
import { Circle } from 'lucide-react';
import { useFinance } from '../contexts/FinanceContext';
import { useCurrency } from '../contexts/CurrencyContext';
import { CountUp } from './CountUp';

const CustomTooltip = ({ active, payload }: any) => {
  const { convertAmount, formatAmount } = useCurrency();
  
  if (active && payload && payload.length) {
    const data = payload[0].payload;
    const convertedValue = convertAmount(data.value);
    
    return (
      <div className="bg-cinematic-surface/90 backdrop-blur-premium border-2 border-cinema-green/20 rounded-2xl p-3 shadow-premium">
        <div className="flex items-center space-x-2">
          <Circle className="w-4 h-4" style={{ color: data.color }} />
          <div>
            <p className="font-bold text-cinematic-text text-sm">{data.name}</p>
            <p className="text-cinema-green-light font-bold text-sm">
              {formatAmount(convertedValue)}
            </p>
          </div>
        </div>
      </div>
    );
  }
  return null;
};

const categoryColors: Record<string, string> = {
  'Food & Dining': '#EA580C',
  'Transportation': '#4ADE80',
  'Entertainment': '#EC4899',
  'Education': '#F59E0B',
  'Shopping': '#8B5CF6',
  'Healthcare': '#EF4444',
  'Utilities': '#10B981',
  'Housing': '#22C55E',
  'Other': '#6B7280'
};

export const FriendlySpendingChart: React.FC = () => {
  const { getCategoryTotals } = useFinance();
  const { convertAmount } = useCurrency();
  const categoryTotals = getCategoryTotals();

  const spendingData = Object.entries(categoryTotals).map(([category, amount]) => ({
    name: category,
    value: amount,
    convertedValue: convertAmount(amount),
    color: categoryColors[category] || '#6b7280'
  }));

  const total = spendingData.reduce((sum, item) => sum + item.value, 0);
  const convertedTotal = convertAmount(total);

  if (total === 0) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.6 }}
        className="bg-cinematic-surface/60 backdrop-blur-premium border-2 border-premium-gold/20 rounded-3xl p-6 shadow-cinematic relative overflow-hidden"
      >
        <div className="text-center py-6">
          <PieChart className="w-12 h-12 text-premium-gold mx-auto mb-3" />
          <h3 className="text-xl font-bold text-cinematic-text font-cinematic mb-3">No Spending Yet</h3>
          <p className="text-cinematic-text-secondary text-base">Start tracking your expenses to see your spending breakdown!</p>
        </div>
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.6 }}
      className="bg-cinematic-surface/60 backdrop-blur-premium border-2 border-premium-gold/20 rounded-3xl p-6 shadow-cinematic relative overflow-hidden"
      style={{
        background: 'linear-gradient(135deg, rgba(245, 158, 11, 0.1) 0%, rgba(22, 67, 22, 0.85) 100%)',
      }}
    >
      {/* Background decoration */}
      <div className="absolute top-0 right-0 w-32 h-32 bg-premium-gold/8 rounded-full blur-3xl" />
      
      <div className="relative">
        {/* Header */}
        <div className="mb-6 text-center">
          <div className="flex items-center justify-center space-x-2 mb-3">
            <PieChart className="w-6 h-6 text-premium-gold" />
            <h3 className="text-xl font-bold text-cinematic-text font-cinematic">Spending Breakdown</h3>
            <PieChart className="w-6 h-6 text-premium-gold" />
          </div>
          <p className="text-cinematic-text-muted text-base">Where your money went this month</p>
          <div className="mt-3 bg-premium-gold/10 backdrop-blur-glass rounded-2xl p-2.5 border border-premium-gold/20">
            <p className="text-premium-gold font-bold text-lg">
              Total: <CountUp 
                to={total} 
                duration={1.2} 
                delay={0.3} 
                decimals={2} 
                useCurrencyConversion={true}
              />
            </p>
          </div>
        </div>

        {/* Chart */}
        <div className="h-56 mb-5">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={spendingData}
                cx="50%"
                cy="50%"
                outerRadius={75}
                fill="#8884d8"
                dataKey="value"
                strokeWidth={3}
                stroke="rgba(34, 197, 94, 0.2)"
              >
                {spendingData.map((entry, index) => (
                  <Cell 
                    key={`cell-${index}`} 
                    fill={entry.color}
                  />
                ))}
              </Pie>
              <Tooltip content={<CustomTooltip />} />
            </PieChart>
          </ResponsiveContainer>
        </div>

        {/* Legend */}
        <div className="space-y-2">
          {spendingData.map((item, index) => (
            <motion.div
              key={item.name}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.3, delay: 0.7 + index * 0.1 }}
              className="flex items-center justify-between p-2 bg-cinematic-glass backdrop-blur-glass rounded-2xl hover:scale-105 hover:shadow-glow-green transition-all duration-300 border border-cinema-green/10"
            >
              <div className="flex items-center space-x-2">
                <div className="flex items-center space-x-1.5">
                  <Circle 
                    className="w-3 h-3"
                    style={{ color: item.color, fill: item.color }}
                  />
                </div>
                <span className="text-cinematic-text font-medium text-sm">{item.name}</span>
              </div>
              <div className="text-right">
                <span className="text-base font-bold text-cinematic-text">
                  <CountUp 
                    to={item.value} 
                    duration={0.8} 
                    delay={0.8 + index * 0.1} 
                    decimals={2} 
                    useCurrencyConversion={true}
                  />
                </span>
                <p className="text-xs text-cinematic-text-secondary">
                  <CountUp to={(item.value / total) * 100} duration={0.8} delay={0.9 + index * 0.1} suffix="%" decimals={0} />
                </p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </motion.div>
  );
};