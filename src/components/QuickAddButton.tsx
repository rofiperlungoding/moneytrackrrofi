import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, ShoppingCart, Wallet } from 'lucide-react';

interface QuickAddButtonProps {
  onSectionChange: (section: string) => void;
}

export const QuickAddButton: React.FC<QuickAddButtonProps> = ({ onSectionChange }) => {
  const [isOpen, setIsOpen] = useState(false);

  const quickActions = [
    {
      label: 'Add Expense',
      icon: ShoppingCart,
      action: () => onSectionChange('expenses'),
      gradient: 'from-financial-negative to-financial-negative-light'
    },
    {
      label: 'Add Income',
      icon: Wallet,
      action: () => onSectionChange('income'),
      gradient: 'from-cinema-green to-cinema-green-light'
    }
  ];

  return (
    <div className="fixed bottom-4 right-4 sm:bottom-5 sm:right-5 lg:bottom-6 lg:right-6 z-40">
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, scale: 0.8, y: 15 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.8, y: 15 }}
            className="absolute bottom-14 sm:bottom-16 right-0 space-y-2"
          >
            {quickActions.map((action, index) => (
              <motion.button
                key={action.label}
                initial={{ opacity: 0, y: 20, x: 20 }}
                animate={{ opacity: 1, y: 0, x: 0 }}
                exit={{ opacity: 0, y: 20, x: 20 }}
                transition={{ 
                  delay: index * 0.05, 
                  type: "spring",
                  stiffness: 200,
                  damping: 20
                }}
                whileHover={{ 
                  scale: 1.02, 
                  x: -6,
                  boxShadow: '0 15px 30px rgba(34, 197, 94, 0.25)'
                }}
                whileTap={{ scale: 0.98 }}
                onClick={() => {
                  action.action();
                  setIsOpen(false);
                }}
                className="flex items-center space-x-2 bg-cinematic-surface/90 backdrop-blur-premium border border-cinematic-border rounded-xl px-3 sm:px-4 py-2 shadow-premium hover:shadow-cinematic transition-all whitespace-nowrap group min-h-[36px]"
              >
                <div className={`p-1.5 sm:p-2 bg-gradient-to-br ${action.gradient} rounded-lg group-hover:scale-110 transition-transform shadow-glow-green flex-shrink-0`}>
                  <action.icon className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-white" />
                </div>
                <div className="text-left hidden sm:block">
                  <span className="text-xs font-bold text-cinematic-text">
                    {action.label}
                  </span>
                  <p className="text-xs text-cinematic-text-muted">
                    {action.label.includes('Expense') ? 'Track spending' : 'Record income'}
                  </p>
                </div>
                {/* Show icon only on mobile */}
                <div className="sm:hidden">
                  <span className="text-xs font-bold text-cinematic-text">
                    {action.label.includes('Expense') ? 'Expense' : 'Income'}
                  </span>
                </div>
              </motion.button>
            ))}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Main Button */}
      <motion.button
        whileHover={{ 
          scale: 1.05,
          boxShadow: '0 0 30px rgba(34, 197, 94, 0.5)'
        }}
        whileTap={{ scale: 0.95 }}
        onClick={() => setIsOpen(!isOpen)}
        className="w-12 h-12 sm:w-14 sm:h-14 lg:w-16 lg:h-16 bg-premium-green rounded-2xl flex items-center justify-center shadow-cinematic hover:shadow-cinematic-lg transition-all group relative overflow-hidden"
        style={{
          background: 'linear-gradient(135deg, #22C55E 0%, #4ADE80 50%, #65F578 100%)',
          minHeight: '48px', // Touch-friendly minimum
          minWidth: '48px'
        }}
      >
        {/* Rotating background */}
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 8, repeat: Infinity, ease: "linear" }}
          className="absolute inset-0 bg-gradient-to-br from-cinema-green-bright/15 to-transparent rounded-2xl"
        />
        
        {/* Subtle pulse effect */}
        <motion.div
          animate={{ 
            scale: [1, 1.1, 1],
            opacity: [0.3, 0.6, 0.3] 
          }}
          transition={{ 
            duration: 3, 
            repeat: Infinity, 
            ease: "easeInOut" 
          }}
          className="absolute inset-0 bg-cinema-green/20 rounded-2xl blur-md"
        />
        
        <motion.div
          animate={{ rotate: isOpen ? 45 : 0 }}
          transition={{ duration: 0.25, type: "spring", stiffness: 200 }}
          className="relative z-10"
        >
          <Plus className="w-5 h-5 sm:w-6 sm:h-6 lg:w-7 lg:h-7 text-white group-hover:scale-110 transition-transform" />
        </motion.div>
      </motion.button>
    </div>
  );
};