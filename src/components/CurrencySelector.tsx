import React from 'react';
import { motion } from 'framer-motion';
import { Globe, Settings } from 'lucide-react';
import { useCurrency } from '../contexts/CurrencyContext';
import { SUPPORTED_CURRENCIES } from '../utils/currency';

interface CurrencySelectorProps {
  onGoToSettings: () => void;
}

export const CurrencySelector: React.FC<CurrencySelectorProps> = ({ onGoToSettings }) => {
  const { currentCurrency } = useCurrency();

  return (
    <motion.button
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      onClick={onGoToSettings}
      className="flex items-center justify-center space-x-1 bg-cinematic-glass backdrop-blur-glass px-1.5 sm:px-2 py-1.5 rounded-lg border border-cinema-green/20 hover:border-cinema-green/40 transition-all duration-300 min-w-[32px] min-h-[32px] sm:min-w-[36px] sm:min-h-[36px]"
    >
      <Globe className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-cinema-green flex-shrink-0" />
      <span className="text-xs font-medium text-cinematic-text hidden sm:inline">
        {SUPPORTED_CURRENCIES[currentCurrency]?.symbol}
      </span>
      <span className="text-xs font-medium text-cinematic-text hidden md:inline">
        {currentCurrency}
      </span>
      <Settings className="w-2.5 h-2.5 text-cinematic-text-secondary hidden sm:block" />
    </motion.button>
  );
};