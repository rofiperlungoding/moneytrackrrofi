import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, DollarSign, Calendar } from 'lucide-react';
import { Transaction } from '../contexts/FinanceContext';

interface IncomeFormProps {
  income?: Transaction | null;
  onClose: () => void;
  onSubmit: (income: any) => void;
}

const incomeSources = [
  'Salary',
  'Freelance',
  'Investment',
  'Business',
  'Allowance',
  'Gifts',
  'Commission',
  'Bonus',
  'Other'
];

const incomeCategories = [
  'Employment',
  'Freelance',
  'Investment',
  'Business',
  'Allowance',
  'Gifts',
  'Other'
];

export const IncomeForm: React.FC<IncomeFormProps> = ({ income, onClose, onSubmit }) => {
  const [formData, setFormData] = useState({
    amount: '',
    source: '',
    category: '',
    description: '',
    date: new Date().toISOString().split('T')[0],
    recurring: false,
    notes: ''
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  // Populate form when editing
  useEffect(() => {
    if (income) {
      setFormData({
        amount: income.amount.toString(),
        source: income.source || '',
        category: income.category,
        description: income.description,
        date: income.date,
        recurring: income.recurring || false,
        notes: income.notes || ''
      });
    }
  }, [income]);

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.amount || parseFloat(formData.amount) <= 0) {
      newErrors.amount = 'Please enter a valid amount';
    }
    if (!formData.description.trim()) {
      newErrors.description = 'Description is required';
    }
    if (!formData.source) {
      newErrors.source = 'Please select a source';
    }
    if (!formData.category) {
      newErrors.category = 'Please select a category';
    }
    if (!formData.date) {
      newErrors.date = 'Date is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (validateForm()) {
      onSubmit(formData);
    }
  };

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 backdrop-blur-sm"
        onClick={onClose}
      >
        <motion.div
          initial={{ scale: 0.95, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.95, opacity: 0 }}
          className="bg-cinematic-surface/90 backdrop-blur-premium border border-cinematic-border rounded-2xl p-6 w-full max-w-lg max-h-[90vh] overflow-y-auto shadow-premium"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-cinematic-text font-cinematic">
              {income ? 'Edit Income' : 'Add Income'}
            </h2>
            <button
              onClick={onClose}
              className="p-2 hover:bg-cinematic-glass rounded-lg transition-colors"
            >
              <X className="w-5 h-5 text-cinematic-text-secondary" />
            </button>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Amount */}
            <div>
              <label className="block text-sm font-medium text-cinematic-text mb-2">
                Amount *
              </label>
              <div className="relative">
                <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-cinematic-text-secondary" />
                <input
                  type="number"
                  step="0.01"
                  required
                  value={formData.amount}
                  onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                  className={`w-full pl-10 pr-4 py-3 bg-cinematic-glass border rounded-lg text-cinematic-text focus:outline-none focus:border-cinema-green/50 transition-colors duration-300 ${
                    errors.amount ? 'border-financial-negative' : 'border-cinematic-border'
                  }`}
                  placeholder="0.00"
                />
              </div>
              {errors.amount && <p className="text-financial-negative text-sm mt-1">{errors.amount}</p>}
            </div>

            {/* Description */}
            <div>
              <label className="block text-sm font-medium text-cinematic-text mb-2">
                Description *
              </label>
              <input
                type="text"
                required
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                className={`w-full px-4 py-3 bg-cinematic-glass border rounded-lg text-cinematic-text focus:outline-none focus:border-cinema-green/50 transition-colors duration-300 ${
                  errors.description ? 'border-financial-negative' : 'border-cinematic-border'
                }`}
                placeholder="What is this income for?"
              />
              {errors.description && <p className="text-financial-negative text-sm mt-1">{errors.description}</p>}
            </div>

            {/* Source and Category */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-cinematic-text mb-2">
                  Source *
                </label>
                <select
                  required
                  value={formData.source}
                  onChange={(e) => setFormData({ ...formData, source: e.target.value })}
                  className={`w-full px-4 py-3 bg-cinematic-glass border rounded-lg text-cinematic-text focus:outline-none focus:border-cinema-green/50 transition-colors duration-300 ${
                    errors.source ? 'border-financial-negative' : 'border-cinematic-border'
                  }`}
                >
                  <option value="" className="bg-cinematic-surface text-cinematic-text">Select source</option>
                  {incomeSources.map((source) => (
                    <option key={source} value={source} className="bg-cinematic-surface text-cinematic-text">
                      {source}
                    </option>
                  ))}
                </select>
                {errors.source && <p className="text-financial-negative text-sm mt-1">{errors.source}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium text-cinematic-text mb-2">
                  Category *
                </label>
                <select
                  required
                  value={formData.category}
                  onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                  className={`w-full px-4 py-3 bg-cinematic-glass border rounded-lg text-cinematic-text focus:outline-none focus:border-cinema-green/50 transition-colors duration-300 ${
                    errors.category ? 'border-financial-negative' : 'border-cinematic-border'
                  }`}
                >
                  <option value="" className="bg-cinematic-surface text-cinematic-text">Select category</option>
                  {incomeCategories.map((category) => (
                    <option key={category} value={category} className="bg-cinematic-surface text-cinematic-text">
                      {category}
                    </option>
                  ))}
                </select>
                {errors.category && <p className="text-financial-negative text-sm mt-1">{errors.category}</p>}
              </div>
            </div>

            {/* Date */}
            <div>
              <label className="block text-sm font-medium text-cinematic-text mb-2">
                Date *
              </label>
              <input
                type="date"
                required
                value={formData.date}
                onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                className={`w-full px-4 py-3 bg-cinematic-glass border rounded-lg text-cinematic-text focus:outline-none focus:border-cinema-green/50 transition-colors duration-300 ${
                  errors.date ? 'border-financial-negative' : 'border-cinematic-border'
                }`}
              />
              {errors.date && <p className="text-financial-negative text-sm mt-1">{errors.date}</p>}
            </div>

            {/* Recurring Income Toggle */}
            <div className="flex items-center space-x-3">
              <input
                type="checkbox"
                id="recurring"
                checked={formData.recurring}
                onChange={(e) => setFormData({ ...formData, recurring: e.target.checked })}
                className="w-4 h-4 text-cinema-green bg-cinematic-glass border-cinematic-border rounded focus:ring-cinema-green focus:ring-2"
              />
              <label htmlFor="recurring" className="text-sm text-cinematic-text">
                This is recurring income
              </label>
            </div>

            {/* Notes */}
            <div>
              <label className="block text-sm font-medium text-cinematic-text mb-2">
                Notes (Optional)
              </label>
              <textarea
                rows={3}
                value={formData.notes}
                onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                className="w-full px-4 py-3 bg-cinematic-glass border border-cinematic-border rounded-lg text-cinematic-text focus:outline-none focus:border-cinema-green/50 transition-colors duration-300 resize-none"
                placeholder="Additional details..."
              />
            </div>

            {/* Submit Buttons */}
            <div className="flex space-x-4 pt-4">
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                type="button"
                onClick={onClose}
                className="flex-1 py-3 bg-cinematic-glass border border-cinematic-border rounded-lg text-cinematic-text hover:border-cinema-green/30 transition-all duration-300"
              >
                Cancel
              </motion.button>
              <motion.button
                whileHover={{ scale: 1.02, boxShadow: '0 0 20px rgba(34, 197, 94, 0.4)' }}
                whileTap={{ scale: 0.98 }}
                type="submit"
                className="flex-1 py-3 bg-premium-green text-white rounded-lg font-medium hover:shadow-glow-green transition-all"
              >
                {income ? 'Update Income' : 'Add Income'}
              </motion.button>
            </div>
          </form>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};