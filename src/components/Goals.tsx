import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Target, Plus, Edit2, Trash2, CheckCircle, Clock, Pause, Play, Trophy } from 'lucide-react';
import { useFinance, Goal } from '../contexts/FinanceContext';
import { useCurrency } from '../contexts/CurrencyContext';
import { GoalForm } from './GoalForm';
import { CountUp } from './CountUp';

const priorityColors = {
  high: 'bg-financial-negative/20 text-financial-negative border-financial-negative/30',
  medium: 'bg-premium-gold/20 text-premium-gold border-premium-gold/30',
  low: 'bg-cinema-green/20 text-cinema-green border-cinema-green/30'
};

const statusColors = {
  active: 'bg-cinema-green-light/20 text-cinema-green-light border-cinema-green-light/30',
  completed: 'bg-cinema-green/20 text-cinema-green border-cinema-green/30',
  paused: 'bg-cinematic-text-muted/20 text-cinematic-text-muted border-cinematic-text-muted/30'
};

const categoryIcons = {
  savings: Target,
  'expense-limit': CheckCircle,
  'income-target': Trophy
};

export const Goals: React.FC = () => {
  const { goals, addGoal, updateGoal, deleteGoal } = useFinance();
  const { convertAmount, currentCurrency } = useCurrency();
  const [showForm, setShowForm] = useState(false);
  const [editingGoal, setEditingGoal] = useState<Goal | null>(null);
  const [filter, setFilter] = useState<'all' | 'active' | 'completed' | 'paused'>('all');

  // Button refs for sliding animation
  const buttonRefs = useRef<{ [key: string]: HTMLButtonElement | null }>({});
  const containerRef = useRef<HTMLDivElement>(null);
  const [indicatorStyle, setIndicatorStyle] = useState({
    width: 0,
    left: 0,
  });

  const filteredGoals = goals.filter(goal => 
    filter === 'all' || goal.status === filter
  );

  const completedGoals = goals.filter(g => g.status === 'completed').length;
  const activeGoals = goals.filter(g => g.status === 'active').length;
  const totalProgress = goals.length > 0 
    ? goals.reduce((sum, goal) => sum + (goal.currentAmount / goal.targetAmount * 100), 0) / goals.length 
    : 0;

  // Update indicator position when filter changes
  useEffect(() => {
    const updateIndicatorPosition = () => {
      const activeButton = buttonRefs.current[filter];
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
  }, [filter]);

  const handleAddGoal = (goalData: any) => {
    addGoal({
      title: goalData.title,
      description: goalData.description,
      targetAmount: parseFloat(goalData.targetAmount),
      currentAmount: parseFloat(goalData.currentAmount) || 0,
      deadline: goalData.deadline,
      category: goalData.category,
      priority: goalData.priority,
      status: 'active',
      currency: currentCurrency
    });
    setShowForm(false);
  };

  const handleEditGoal = (goalData: any) => {
    if (editingGoal) {
      updateGoal(editingGoal.id, {
        title: goalData.title,
        description: goalData.description,
        targetAmount: parseFloat(goalData.targetAmount),
        currentAmount: parseFloat(goalData.currentAmount),
        deadline: goalData.deadline,
        category: goalData.category,
        priority: goalData.priority,
        status: goalData.status,
        currency: currentCurrency
      });
      setEditingGoal(null);
    }
  };

  const handleDeleteGoal = (id: string) => {
    if (confirm('Are you sure you want to delete this goal?')) {
      deleteGoal(id);
    }
  };

  const handleToggleStatus = (goal: Goal) => {
    const newStatus = goal.status === 'active' ? 'paused' : 'active';
    updateGoal(goal.id, { status: newStatus });
  };

  const handleCompleteGoal = (goal: Goal) => {
    updateGoal(goal.id, { 
      status: 'completed',
      currentAmount: goal.targetAmount
    });
  };

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
          <h1 className="text-3xl font-bold text-cinematic-text font-cinematic">Financial Goals</h1>
          <p className="text-cinematic-text-secondary mt-1 text-base">Set and track your financial objectives</p>
        </div>
        <motion.button
          whileHover={{ scale: 1.05, boxShadow: '0 0 25px rgba(34, 197, 94, 0.4)' }}
          whileTap={{ scale: 0.95 }}
          onClick={() => setShowForm(true)}
          className="flex items-center space-x-2 bg-premium-green text-white px-6 py-3 rounded-2xl font-medium hover:shadow-glow-green transition-all"
        >
          <Plus className="w-4 h-4" />
          <span>Create Goal</span>
        </motion.button>
      </motion.div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="bg-cinematic-surface/60 backdrop-blur-premium border border-cinematic-border rounded-2xl p-4 shadow-cinematic"
        >
          <div className="flex items-center space-x-2 mb-1">
            <Target className="w-4 h-4 text-cinema-green-light" />
            <h3 className="text-xs text-cinematic-text-muted">Total Goals</h3>
          </div>
          <div className="text-xl font-bold text-cinema-green-light">
            <CountUp to={goals.length} duration={0.8} delay={0.2} />
          </div>
        </motion.div>
        
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="bg-cinematic-surface/60 backdrop-blur-premium border border-cinematic-border rounded-2xl p-4 shadow-cinematic"
        >
          <div className="flex items-center space-x-2 mb-1">
            <CheckCircle className="w-4 h-4 text-cinema-green" />
            <h3 className="text-xs text-cinematic-text-muted">Completed</h3>
          </div>
          <div className="text-xl font-bold text-cinema-green">
            <CountUp to={completedGoals} duration={0.8} delay={0.3} />
          </div>
        </motion.div>
        
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.3 }}
          className="bg-cinematic-surface/60 backdrop-blur-premium border border-cinematic-border rounded-2xl p-4 shadow-cinematic"
        >
          <div className="flex items-center space-x-2 mb-1">
            <Clock className="w-4 h-4 text-premium-copper" />
            <h3 className="text-xs text-cinematic-text-muted">Active</h3>
          </div>
          <div className="text-xl font-bold text-premium-copper">
            <CountUp to={activeGoals} duration={0.8} delay={0.4} />
          </div>
        </motion.div>
        
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.4 }}
          className="bg-cinematic-surface/60 backdrop-blur-premium border border-cinematic-border rounded-2xl p-4 shadow-cinematic"
        >
          <div className="flex items-center space-x-2 mb-1">
            <Trophy className="w-4 h-4 text-premium-gold" />
            <h3 className="text-xs text-cinematic-text-muted">Avg Progress</h3>
          </div>
          <div className="text-xl font-bold text-premium-gold">
            <CountUp to={totalProgress} duration={1.2} delay={0.5} suffix="%" decimals={0} />
          </div>
        </motion.div>
      </div>

      {/* Filter Tabs with Sliding Animation */}
      <div 
        ref={containerRef}
        className="relative bg-cinematic-surface/60 backdrop-blur-premium border border-cinematic-border rounded-2xl p-1.5 shadow-cinematic"
      >
        {/* Sliding Background Indicator */}
        <motion.div
          className="absolute bg-premium-green rounded-xl shadow-glow-green"
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
            height: 'calc(100% - 12px)',
            top: '6px',
          }}
        />
        
        {/* Filter Buttons */}
        <div className="relative z-10 flex space-x-1.5">
          {(['all', 'active', 'completed', 'paused'] as const).map((status, index) => (
            <motion.button
              key={status}
              ref={(el) => (buttonRefs.current[status] = el)}
              whileHover={{ 
                scale: filter !== status ? 1.02 : 1,
              }}
              whileTap={{ scale: 0.98 }}
              onClick={() => setFilter(status)}
              className={`px-3 py-1.5 rounded-xl text-xs font-medium transition-all ${
                filter === status
                  ? 'text-white font-semibold'
                  : 'text-cinematic-text-secondary hover:text-cinematic-text'
              }`}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ 
                duration: 0.3, 
                delay: index * 0.05,
                type: "spring",
                stiffness: 100
              }}
            >
              <motion.span
                animate={{
                  scale: filter === status ? 1.05 : 1,
                }}
                transition={{
                  duration: 0.2,
                  type: "spring",
                  stiffness: 200
                }}
              >
                {status.charAt(0).toUpperCase() + status.slice(1)}
              </motion.span>
              {status !== 'all' && (
                <motion.span 
                  className="ml-1.5 px-1.5 py-0.5 bg-black/10 rounded-full text-xs"
                  animate={{
                    scale: filter === status ? 1.1 : 1,
                    backgroundColor: filter === status ? 'rgba(0,0,0,0.2)' : 'rgba(0,0,0,0.1)'
                  }}
                  transition={{ duration: 0.2 }}
                >
                  <CountUp to={goals.filter(g => g.status === status).length} duration={0.5} />
                </motion.span>
              )}
            </motion.button>
          ))}
        </div>
      </div>

      {/* Goals Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredGoals.map((goal, index) => {
          const progress = (goal.currentAmount / goal.targetAmount) * 100;
          const isOverdue = new Date(goal.deadline) < new Date() && goal.status !== 'completed';
          const daysLeft = Math.ceil((new Date(goal.deadline).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24));
          const IconComponent = categoryIcons[goal.category];
          
          return (
            <motion.div
              key={goal.id}
              initial={{ opacity: 0, y: 30, scale: 0.9 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              className="bg-cinematic-surface/60 backdrop-blur-premium border border-cinematic-border rounded-2xl p-4 hover:shadow-cinematic transition-all group shadow-elevated"
            >
              {/* Header */}
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center space-x-2">
                  <div className="p-1.5 bg-cinema-green/10 rounded-lg">
                    <IconComponent className="w-4 h-4 text-cinema-green" />
                  </div>
                  <div>
                    <h3 className="font-bold text-cinematic-text font-cinematic text-sm">{goal.title}</h3>
                    <p className="text-xs text-cinematic-text-secondary">{goal.description}</p>
                  </div>
                </div>
                
                <div className="flex space-x-0.5 opacity-0 group-hover:opacity-100 transition-opacity">
                  <motion.button
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                    onClick={() => {
                      setEditingGoal(goal);
                      setShowForm(true);
                    }}
                    className="p-1 bg-cinema-green-light/10 text-cinema-green-light rounded-lg hover:bg-cinema-green-light/20 transition-colors"
                  >
                    <Edit2 className="w-3 h-3" />
                  </motion.button>
                  <motion.button
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                    onClick={() => handleDeleteGoal(goal.id)}
                    className="p-1 bg-financial-negative/10 text-financial-negative rounded-lg hover:bg-financial-negative/20 transition-colors"
                  >
                    <Trash2 className="w-3 h-3" />
                  </motion.button>
                </div>
              </div>

              {/* Progress */}
              <div className="mb-3">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-xs text-cinematic-text-secondary">Progress</span>
                  <span className="text-xs font-medium text-cinematic-text">
                    <CountUp to={progress} duration={1} delay={0.2 + index * 0.05} suffix="%" decimals={0} />
                  </span>
                </div>
                <div className="w-full bg-cinematic-border rounded-full h-1.5">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${Math.min(progress, 100)}%` }}
                    transition={{ duration: 1, delay: 0.5 + index * 0.1 }}
                    className={`h-1.5 rounded-full ${
                      goal.status === 'completed' ? 'bg-cinema-green' :
                      progress >= 100 ? 'bg-cinema-green' :
                      progress >= 75 ? 'bg-cinema-green' :
                      progress >= 50 ? 'bg-premium-gold' :
                      'bg-cinema-green-light'
                    }`}
                  />
                </div>
              </div>

              {/* Amount */}
              <div className="flex items-center justify-between mb-3">
                <div>
                  <p className="text-xs text-cinematic-text-secondary">Current</p>
                  <div className="text-base font-bold text-cinema-green">
                    <CountUp 
                      to={goal.currentAmount} 
                      duration={0.8} 
                      delay={0.3 + index * 0.05} 
                      decimals={2} 
                      useCurrencyConversion={true}
                      currency={goal.currency}
                    />
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-xs text-cinematic-text-secondary">Target</p>
                  <div className="text-base font-bold text-cinematic-text">
                    <CountUp 
                      to={goal.targetAmount} 
                      duration={0.8} 
                      delay={0.4 + index * 0.05} 
                      decimals={2} 
                      useCurrencyConversion={true}
                      currency={goal.currency}
                    />
                  </div>
                </div>
              </div>

              {/* Status and Priority Tags */}
              <div className="flex items-center justify-between mb-3">
                <div className="flex space-x-1.5">
                  <span className={`px-1.5 py-0.5 rounded-full text-xs font-medium border ${
                    statusColors[goal.status]
                  }`}>
                    {goal.status}
                  </span>
                  <span className={`px-1.5 py-0.5 rounded-full text-xs font-medium border ${
                    priorityColors[goal.priority]
                  }`}>
                    {goal.priority}
                  </span>
                </div>
              </div>

              {/* Deadline */}
              <div className="flex items-center justify-between text-xs mb-3">
                <span className="text-cinematic-text-secondary">
                
                  {isOverdue ? 'Overdue' : `${daysLeft} days left`}
                </span>
                <span className={`font-medium ${isOverdue ? 'text-financial-negative' : 'text-cinematic-text'}`}>
                  {new Date(goal.deadline).toLocaleDateString()}
                </span>
              </div>

              {/* Actions */}
              <div className="flex space-x-1.5">
                {goal.status !== 'completed' && progress >= 100 && (
                  <motion.button
                    whileHover={{ scale: 1.02, boxShadow: '0 0 20px rgba(34, 197, 94, 0.4)' }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => handleCompleteGoal(goal)}
                    className="flex-1 py-1.5 bg-cinema-green text-white rounded-lg text-xs font-medium hover:shadow-glow-green transition-all"
                  >
                    Mark Complete
                  </motion.button>
                )}
                
                {goal.status !== 'completed' && (
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => handleToggleStatus(goal)}
                    className="flex-1 py-1.5 bg-cinematic-glass border border-cinematic-border rounded-lg text-xs font-medium text-cinematic-text hover:border-cinema-green/30 transition-all flex items-center justify-center space-x-0.5"
                  >
                    {goal.status === 'active' ? (
                      <>
                        <Pause className="w-2.5 h-2.5" />
                        <span>Pause</span>
                      </>
                    ) : (
                      <>
                        <Play className="w-2.5 h-2.5" />
                        <span>Resume</span>
                      </>
                    )}
                  </motion.button>
                )}
              </div>
            </motion.div>
          );
        })}
      </div>

      {/* Empty State */}
      {filteredGoals.length === 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center py-8"
        >
          <Target className="w-12 h-12 text-cinematic-text-secondary mx-auto mb-3" />
          <h3 className="text-lg font-bold text-cinematic-text mb-2">
            {filter === 'all' ? 'No goals yet' : `No ${filter} goals`}
          </h3>
          <p className="text-cinematic-text-secondary mb-4 text-sm">
            {filter === 'all' 
              ? "Start by creating your first financial goal" 
              : `No goals with ${filter} status found`}
          </p>
          {filter === 'all' && (
            <motion.button
              whileHover={{ scale: 1.05, boxShadow: '0 0 25px rgba(34, 197, 94, 0.4)' }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setShowForm(true)}
              className="bg-premium-green text-white px-5 py-2.5 rounded-xl font-medium hover:shadow-glow-green transition-all"
            >
              Create Your First Goal
            </motion.button>
          )}
        </motion.div>
      )}

      {/* Goal Form Modal */}
      <AnimatePresence>
        {showForm && (
          <GoalForm 
            goal={editingGoal}
            onClose={() => {
              setShowForm(false);
              setEditingGoal(null);
            }}
            onSubmit={editingGoal ? handleEditGoal : handleAddGoal}
          />
        )}
      </AnimatePresence>
    </div>
  );
};