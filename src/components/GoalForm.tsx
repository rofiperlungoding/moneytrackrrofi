import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Target, DollarSign, Calendar } from 'lucide-react';
import { Goal } from '../contexts/FinanceContext';

interface GoalFormProps {
  goal?: Goal | null;
  onClose: () => void;
  onSubmit: (goal: any) => void;
}

const categories = [
  { value: 'savings', label: 'Savings Goal', description: 'Save money for something specific' },
  { value: 'expense-limit', label: 'Expense Limit', description: 'Set spending limits for categories' },
  { value: 'income-target', label: 'Income Target', description: 'Set income goals to achieve' }
];

const priorities = [
  { value: 'low', label: 'Low Priority', color: 'text-cinema-green' },
  { value: 'medium', label: 'Medium Priority', color: 'text-premium-gold' },
  { value: 'high', label: 'High Priority', color: 'text-financial-negative' }
];

const statuses = [
  { value: 'active', label: 'Active' },
  { value: 'paused', label: 'Paused' },
  { value: 'completed', label: 'Completed' }
];

export const GoalForm: React.FC<GoalFormProps> = ({ goal, onClose, onSubmit }) => {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    targetAmount: '',
    currentAmount: '',
    deadline: '',
    category: 'savings' as 'savings' | 'expense-limit' | 'income-target',
    priority: 'medium' as 'low' | 'medium' | 'high',
    status: 'active' as 'active' | 'paused' | 'completed'
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  // Populate form when editing
  useEffect(() => {
    if (goal) {
      setFormData({
        title: goal.title,
        description: goal.description,
        targetAmount: goal.targetAmount.toString(),
        currentAmount: goal.currentAmount.toString(),
        deadline: goal.deadline,
        category: goal.category,
        priority: goal.priority,
        status: goal.status
      });
    }
  }, [goal]);

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.title.trim()) {
      newErrors.title = 'Title is required';
    }
    if (!formData.description.trim()) {
      newErrors.description = 'Description is required';
    }
    if (!formData.targetAmount || parseFloat(formData.targetAmount) <= 0) {
      newErrors.targetAmount = 'Please enter a valid target amount';
    }
    if (formData.currentAmount && parseFloat(formData.currentAmount) < 0) {
      newErrors.currentAmount = 'Current amount cannot be negative';
    }
    if (!formData.deadline) {
      newErrors.deadline = 'Deadline is required';
    } else if (new Date(formData.deadline) <= new Date()) {
      newErrors.deadline = 'Deadline must be in the future';
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
              {goal ? 'Edit Goal' : 'Create New Goal'}
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
            {/* Title */}
            <div>
              <label className="block text-sm font-medium text-cinematic-text mb-2">
                Goal Title *
              </label>
              <input
                type="text"
                required
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                className={`w-full px-4 py-3 bg-cinematic-glass border rounded-lg text-cinematic-text focus:outline-none focus:border-cinema-green/50 transition-colors duration-300 ${
                  errors.title ? 'border-financial-negative' : 'border-cinematic-border'
                }`}
                placeholder="e.g., Emergency Fund, New Laptop, etc."
              />
              {errors.title && <p className="text-financial-negative text-sm mt-1">{errors.title}</p>}
            </div>

            {/* Description */}
            <div>
              <label className="block text-sm font-medium text-cinematic-text mb-2">
                Description *
              </label>
              <textarea
                rows={3}
                required
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                className={`w-full px-4 py-3 bg-cinematic-glass border rounded-lg text-cinematic-text focus:outline-none focus:border-cinema-green/50 transition-colors duration-300 resize-none ${
                  errors.description ? 'border-financial-negative' : 'border-cinematic-border'
                }`}
                placeholder="Describe your goal and why it's important to you"
              />
              {errors.description && <p className="text-financial-negative text-sm mt-1">{errors.description}</p>}
            </div>

            {/* Category */}
            <div>
              <label className="block text-sm font-medium text-cinematic-text mb-2">
                Goal Type *
              </label>
              <div className="grid grid-cols-1 gap-3">
                {categories.map((category) => (
                  <motion.label
                    key={category.value}
                    whileHover={{ scale: 1.02 }}
                    className={`flex items-center space-x-3 p-3 border rounded-lg cursor-pointer transition-all ${
                      formData.category === category.value
                        ? 'border-cinema-green bg-cinema-green/5'
                        : 'border-cinematic-border hover:border-cinema-green/30'
                    }`}
                  >
                    <input
                      type="radio"
                      name="category"
                      value={category.value}
                      checked={formData.category === category.value}
                      onChange={(e) => setFormData({ ...formData, category: e.target.value as any })}
                      className="text-cinema-green focus:ring-cinema-green"
                    />
                    <div>
                      <p className="font-medium text-cinematic-text">{category.label}</p>
                      <p className="text-sm text-cinematic-text-secondary">{category.description}</p>
                    </div>
                  </motion.label>
                ))}
              </div>
            </div>

            {/* Target Amount */}
            <div>
              <label className="block text-sm font-medium text-cinematic-text mb-2">
                Target Amount *
              </label>
              <div className="relative">
                <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-cinematic-text-secondary" />
                <input
                  type="number"
                  step="0.01"
                  required
                  value={formData.targetAmount}
                  onChange={(e) => setFormData({ ...formData, targetAmount: e.target.value })}
                  className={`w-full pl-10 pr-4 py-3 bg-cinematic-glass border rounded-lg text-cinematic-text focus:outline-none focus:border-cinema-green/50 transition-colors duration-300 ${
                    errors.targetAmount ? 'border-financial-negative' : 'border-cinematic-border'
                  }`}
                  placeholder="0.00"
                />
              </div>
              {errors.targetAmount && <p className="text-financial-negative text-sm mt-1">{errors.targetAmount}</p>}
            </div>

            {/* Current Amount */}
            <div>
              <label className="block text-sm font-medium text-cinematic-text mb-2">
                Current Amount
              </label>
              <div className="relative">
                <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-cinematic-text-secondary" />
                <input
                  type="number"
                  step="0.01"
                  value={formData.currentAmount}
                  onChange={(e) => setFormData({ ...formData, currentAmount: e.target.value })}
                  className={`w-full pl-10 pr-4 py-3 bg-cinematic-glass border rounded-lg text-cinematic-text focus:outline-none focus:border-cinema-green/50 transition-colors duration-300 ${
                    errors.currentAmount ? 'border-financial-negative' : 'border-cinematic-border'
                  }`}
                  placeholder="0.00"
                />
              </div>
              {errors.currentAmount && <p className="text-financial-negative text-sm mt-1">{errors.currentAmount}</p>}
            </div>

            {/* Priority and Status (if editing) */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-cinematic-text mb-2">
                  Priority
                </label>
                <select
                  value={formData.priority}
                  onChange={(e) => setFormData({ ...formData, priority: e.target.value as any })}
                  className="w-full px-4 py-3 bg-cinematic-glass border border-cinematic-border rounded-lg text-cinematic-text focus:outline-none focus:border-cinema-green/50 transition-colors duration-300"
                >
                  {priorities.map((priority) => (
                    <option key={priority.value} value={priority.value} className="bg-cinematic-surface text-cinematic-text">
                      {priority.label}
                    </option>
                  ))}
                </select>
              </div>

              {goal && (
                <div>
                  <label className="block text-sm font-medium text-cinematic-text mb-2">
                    Status
                  </label>
                  <select
                    value={formData.status}
                    onChange={(e) => setFormData({ ...formData, status: e.target.value as any })}
                    className="w-full px-4 py-3 bg-cinematic-glass border border-cinematic-border rounded-lg text-cinematic-text focus:outline-none focus:border-cinema-green/50 transition-colors duration-300"
                  >
                    {statuses.map((status) => (
                      <option key={status.value} value={status.value} className="bg-cinematic-surface text-cinematic-text">
                        {status.label}
                      </option>
                    ))}
                  </select>
                </div>
              )}
            </div>

            {/* Deadline */}
            <div>
              <label className="block text-sm font-medium text-cinematic-text mb-2">
                Target Deadline *
              </label>
              <input
                type="date"
                required
                value={formData.deadline}
                onChange={(e) => setFormData({ ...formData, deadline: e.target.value })}
                min={new Date().toISOString().split('T')[0]}
                className={`w-full px-4 py-3 bg-cinematic-glass border rounded-lg text-cinematic-text focus:outline-none focus:border-cinema-green/50 transition-colors duration-300 ${
                  errors.deadline ? 'border-financial-negative' : 'border-cinematic-border'
                }`}
              />
              {errors.deadline && <p className="text-financial-negative text-sm mt-1">{errors.deadline}</p>}
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
                {goal ? 'Update Goal' : 'Create Goal'}
              </motion.button>
            </div>
          </form>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};