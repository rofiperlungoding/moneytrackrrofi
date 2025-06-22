import React, { useEffect } from 'react';
import { motion, useSpring, useTransform } from 'framer-motion';
import { useCurrency } from '../contexts/CurrencyContext';

interface CountUpProps {
  to: number;
  from?: number;
  direction?: 'up' | 'down';
  delay?: number;
  duration?: number;
  className?: string;
  startWhen?: boolean;
  separator?: string;
  decimals?: number;
  prefix?: string;
  suffix?: string;
  onStart?: () => void;
  onEnd?: () => void;
  currency?: string;
  useCurrencyConversion?: boolean;
}

export const CountUp: React.FC<CountUpProps> = ({
  to,
  from = 0,
  direction = 'up',
  delay = 0,
  duration = 2,
  className = '',
  startWhen = true,
  separator = '',
  decimals = 0,
  prefix = '',
  suffix = '',
  onStart,
  onEnd,
  currency,
  useCurrencyConversion = false
}) => {
  const { convertAmount, formatAmount, currentCurrency } = useCurrency();
  
  // Convert the values if currency conversion is enabled
  const convertedTo = useCurrencyConversion ? convertAmount(to, currency || 'USD') : to;
  const convertedFrom = useCurrencyConversion ? convertAmount(from, currency || 'USD') : from;
  
  const spring = useSpring(convertedFrom, { 
    damping: 20, 
    stiffness: 100,
    mass: 1
  });

  const display = useTransform(spring, (current) => {
    const value = direction === 'down' ? convertedTo - current + convertedFrom : current;
    
    if (useCurrencyConversion) {
      // Use currency formatting which includes the symbol
      const formattedCurrency = formatAmount(value);
      // If there's a prefix (like + or -), prepend it to the formatted currency
      return prefix ? `${prefix}${formattedCurrency}` : formattedCurrency;
    }
    
    // Fallback to manual formatting for non-currency values
    const formattedValue = value.toLocaleString(undefined, {
      minimumFractionDigits: decimals,
      maximumFractionDigits: decimals
    });
    
    // Apply custom separator if provided
    const finalValue = separator ? formattedValue.replace(/,/g, separator) : formattedValue;
    
    return `${prefix}${finalValue}${suffix}`;
  });

  useEffect(() => {
    if (startWhen) {
      const timer = setTimeout(() => {
        onStart?.();
        spring.set(direction === 'down' ? convertedFrom : convertedTo);
        
        // Call onEnd after animation completes
        const endTimer = setTimeout(() => {
          onEnd?.();
        }, duration * 1000);
        
        return () => clearTimeout(endTimer);
      }, delay * 1000);
      
      return () => clearTimeout(timer);
    } else {
      // If not starting animation, set to final value immediately
      spring.set(direction === 'down' ? convertedFrom : convertedTo);
    }
  }, [startWhen, convertedTo, convertedFrom, direction, delay, duration, spring, onStart, onEnd]);

  return (
    <motion.span className={className}>
      {display}
    </motion.span>
  );
};