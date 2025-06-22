import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { LogIn, Shield, Zap, Target, Mail, Lock, User, ArrowRight, AlertCircle, CheckCircle, Eye, EyeOff } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { RotatingText } from './RotatingText';

export const AuthPage: React.FC = () => {
  const [isSignUp, setIsSignUp] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    fullName: '',
    confirmPassword: ''
  });

  const { signIn, signUp, resetPassword } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage(null);

    try {
      if (isSignUp) {
        // Validation for sign up
        if (formData.password !== formData.confirmPassword) {
          setMessage({ type: 'error', text: 'Passwords do not match' });
          setLoading(false);
          return;
        }

        if (formData.password.length < 6) {
          setMessage({ type: 'error', text: 'Password must be at least 6 characters' });
          setLoading(false);
          return;
        }

        const { error } = await signUp(formData.email, formData.password, formData.fullName);
        
        if (error) {
          setMessage({ type: 'error', text: error.message });
        } else {
          setMessage({ 
            type: 'success', 
            text: 'Account created successfully! Please check your email to verify your account.' 
          });
        }
      } else {
        const { error } = await signIn(formData.email, formData.password);
        
        if (error) {
          setMessage({ type: 'error', text: error.message });
        }
      }
    } catch (error: any) {
      setMessage({ type: 'error', text: 'An unexpected error occurred' });
    } finally {
      setLoading(false);
    }
  };

  const handleForgotPassword = async () => {
    if (!formData.email) {
      setMessage({ type: 'error', text: 'Please enter your email address first' });
      return;
    }

    setLoading(true);
    const { error } = await resetPassword(formData.email);
    
    if (error) {
      setMessage({ type: 'error', text: error.message });
    } else {
      setMessage({ 
        type: 'success', 
        text: 'Password reset email sent! Check your inbox.' 
      });
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen flex bg-gradient-to-br from-cinematic-dark via-cinematic-base to-cinematic-surface text-cinematic-text font-editorial">
      {/* Cinematic Background Effects */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute inset-0 bg-cinematic-radial opacity-60" />
        <motion.div
          animate={{
            scale: [1, 1.2, 1],
            opacity: [0.3, 0.6, 0.3],
          }}
          transition={{
            duration: 4,
            repeat: Infinity,
            ease: "easeInOut"
          }}
          className="absolute top-1/4 left-1/3 w-80 h-80 bg-cinema-green/20 rounded-full blur-3xl"
        />
        <motion.div
          animate={{
            scale: [1.2, 1, 1.2],
            opacity: [0.2, 0.5, 0.2],
          }}
          transition={{
            duration: 6,
            repeat: Infinity,
            ease: "easeInOut",
            delay: 2
          }}
          className="absolute bottom-1/3 right-1/4 w-72 h-72 bg-cinema-emerald/15 rounded-full blur-3xl"
        />
        <div className="absolute inset-0 opacity-[0.02]" style={{
          backgroundImage: `radial-gradient(circle at 1px 1px, rgba(34, 197, 94, 0.5) 1px, transparent 0)`,
          backgroundSize: '40px 40px'
        }} />
      </div>

      {/* Two-Column Layout */}
      <div className="relative z-10 w-full flex flex-col md:flex-row">
        {/* Left Column - "Track your" with Rotating Text */}
        <motion.div
          initial={{ opacity: 0, x: -100 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 1, ease: "easeOut" }}
          className="w-full md:w-1/2 flex items-center justify-center p-8 md:p-16"
        >
          <div className="max-w-lg text-center md:text-left">
            {/* Main Heading with Rotating Text */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.4 }}
              className="flex flex-col md:flex-row items-center gap-2 md:gap-2"
            >
              {/* "Track your" text - white and static */}
              <h1 className="text-2xl md:text-3xl lg:text-4xl font-bold text-white font-cinematic leading-tight whitespace-nowrap">
                Track your
              </h1>

              {/* Rotating text with its own container - now green and animated */}
              <motion.div
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.8, delay: 0.8 }}
                className="relative"
              >
                <RotatingText
                  phrases={['financial.', 'money.', 'future.', 'yourself.']}
                  interval={2800}
                  textClassName="text-2xl md:text-3xl lg:text-4xl text-cinema-green"
                />
              </motion.div>
            </motion.div>
          </div>
        </motion.div>

        {/* Right Column - Auth Panel with Logo */}
        <motion.div
          initial={{ opacity: 0, x: 100 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 1, ease: "easeOut", delay: 0.3 }}
          className="w-full md:w-1/2 flex items-center justify-center p-8 md:p-16"
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 50 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.5, type: "spring", stiffness: 100 }}
            className="relative bg-cinematic-surface/90 backdrop-blur-premium border-2 border-cinema-green/20 rounded-3xl p-6 shadow-premium w-full max-w-xs"
          >
            {/* Auth Panel Background Effects */}
            <div className="absolute inset-0 bg-gradient-to-br from-cinema-green/5 to-cinema-emerald/5 rounded-3xl" />
            <motion.div
              animate={{ 
                scale: [1, 1.1, 1],
                opacity: [0.1, 0.3, 0.1]
              }}
              transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
              className="absolute top-0 right-0 w-32 h-32 bg-cinema-green/10 rounded-full blur-2xl"
            />

            <div className="relative z-10">
              {/* Logo and Auth Header */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.7 }}
                className="text-center mb-6"
              >
                {/* Logo */}
                <motion.div
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.6, delay: 0.6 }}
                  className="mb-4"
                >
                  <img 
                    src="/Money (2).png" 
                    alt="MoneyTrackr Logo" 
                    className="h-12 w-auto object-contain mx-auto"
                  />
                </motion.div>

                <h2 className="text-xl font-bold text-cinematic-text font-cinematic mb-2">
                  {isSignUp ? 'Create Account' : 'Welcome Back'}
                </h2>
                <p className="text-cinematic-text-secondary text-sm">
                  {isSignUp ? 'Start your financial journey' : 'Sign in to your account'}
                </p>
              </motion.div>

              {/* Message Display */}
              <AnimatePresence>
                {message && (
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    className={`mb-4 p-2.5 rounded-xl border flex items-center space-x-2 ${
                      message.type === 'success' 
                        ? 'bg-cinema-green/10 border-cinema-green/30 text-cinema-green' 
                        : 'bg-financial-negative/10 border-financial-negative/30 text-financial-negative'
                    }`}
                  >
                    {message.type === 'success' ? (
                      <CheckCircle className="w-3.5 h-3.5 flex-shrink-0" />
                    ) : (
                      <AlertCircle className="w-3.5 h-3.5 flex-shrink-0" />
                    )}
                    <span className="text-xs">{message.text}</span>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Auth Form */}
              <motion.form
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.9 }}
                onSubmit={handleSubmit}
                className="space-y-3"
              >
                {/* Full Name (Sign Up Only) */}
                {isSignUp && (
                  <div>
                    <label htmlFor="fullName" className="block text-xs font-medium text-cinematic-text mb-1.5">
                      Full Name
                    </label>
                    <div className="relative">
                      <User className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-cinematic-text-secondary" />
                      <input
                        type="text"
                        id="fullName"
                        value={formData.fullName}
                        onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                        placeholder="Enter your full name"
                        className="w-full pl-9 pr-3 py-3 bg-cinematic-glass border border-cinematic-border rounded-xl text-cinematic-text placeholder-cinematic-text-muted focus:outline-none focus:border-cinema-green/50 focus:ring-2 focus:ring-cinema-green/20 transition-all duration-300 text-sm"
                        required={isSignUp}
                      />
                    </div>
                  </div>
                )}

                {/* Email */}
                <div>
                  <label htmlFor="email" className="block text-xs font-medium text-cinematic-text mb-1.5">
                    Email Address
                  </label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-cinematic-text-secondary" />
                    <input
                      type="email"
                      id="email"
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      placeholder="Enter your email"
                      className="w-full pl-9 pr-3 py-3 bg-cinematic-glass border border-cinematic-border rounded-xl text-cinematic-text placeholder-cinematic-text-muted focus:outline-none focus:border-cinema-green/50 focus:ring-2 focus:ring-cinema-green/20 transition-all duration-300 text-sm"
                      required
                    />
                  </div>
                </div>

                {/* Password */}
                <div>
                  <label htmlFor="password" className="block text-xs font-medium text-cinematic-text mb-1.5">
                    Password
                  </label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-cinematic-text-secondary" />
                    <input
                      type={showPassword ? 'text' : 'password'}
                      id="password"
                      value={formData.password}
                      onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                      placeholder="Enter your password"
                      className="w-full pl-9 pr-10 py-3 bg-cinematic-glass border border-cinematic-border rounded-xl text-cinematic-text placeholder-cinematic-text-muted focus:outline-none focus:border-cinema-green/50 focus:ring-2 focus:ring-cinema-green/20 transition-all duration-300 text-sm"
                      required
                      minLength={6}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 transform -translate-y-1/2 text-cinematic-text-secondary hover:text-cinematic-text transition-colors"
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                {/* Confirm Password (Sign Up Only) */}
                {isSignUp && (
                  <div>
                    <label htmlFor="confirmPassword" className="block text-xs font-medium text-cinematic-text mb-1.5">
                      Confirm Password
                    </label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-cinematic-text-secondary" />
                      <input
                        type="password"
                        id="confirmPassword"
                        value={formData.confirmPassword}
                        onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                        placeholder="Confirm your password"
                        className="w-full pl-9 pr-3 py-3 bg-cinematic-glass border border-cinematic-border rounded-xl text-cinematic-text placeholder-cinematic-text-muted focus:outline-none focus:border-cinema-green/50 focus:ring-2 focus:ring-cinema-green/20 transition-all duration-300 text-sm"
                        required={isSignUp}
                      />
                    </div>
                  </div>
                )}

                {/* Submit Button */}
                <motion.button
                  whileHover={{ 
                    scale: 1.02, 
                    boxShadow: '0 0 30px rgba(34, 197, 94, 0.4)' 
                  }}
                  whileTap={{ scale: 0.98 }}
                  type="submit"
                  disabled={loading}
                  className="w-full flex items-center justify-center space-x-2 bg-premium-green text-white px-4 py-3 rounded-xl font-medium hover:shadow-glow-green transition-all duration-300 relative overflow-hidden group disabled:opacity-50 disabled:cursor-not-allowed text-sm"
                >
                  {/* Button Background Animation */}
                  <div className="absolute inset-0 bg-gradient-to-r from-cinema-green-dark to-cinema-green-light opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                  
                  <div className="relative z-10 flex items-center space-x-2">
                    {loading ? (
                      <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    ) : (
                      <>
                        {isSignUp ? <User className="w-4 h-4" /> : <LogIn className="w-4 h-4" />}
                        <span>{isSignUp ? 'Create Account' : 'Sign In'}</span>
                        <ArrowRight className="w-3.5 h-3.5" />
                      </>
                    )}
                  </div>
                </motion.button>

                {/* Forgot Password (Sign In Only) */}
                {!isSignUp && (
                  <motion.button
                    type="button"
                    onClick={handleForgotPassword}
                    disabled={loading}
                    className="w-full text-cinema-green hover:text-cinema-green-light transition-colors text-xs font-medium disabled:opacity-50"
                  >
                    Forgot your password?
                  </motion.button>
                )}
              </motion.form>

              {/* Toggle Auth Mode */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.6, delay: 1.1 }}
                className="mt-4 text-center"
              >
                <p className="text-xs text-cinematic-text-secondary">
                  {isSignUp ? 'Already have an account?' : "Don't have an account?"}{' '}
                  <button
                    type="button"
                    onClick={() => {
                      setIsSignUp(!isSignUp);
                      setMessage(null);
                      setFormData({ email: '', password: '', fullName: '', confirmPassword: '' });
                    }}
                    className="text-cinema-green hover:text-cinema-green-light transition-colors font-medium"
                  >
                    {isSignUp ? 'Sign In' : 'Sign Up'}
                  </button>
                </p>
              </motion.div>

              {/* Footer */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.6, delay: 1.2 }}
                className="mt-6 text-center"
              >
                <p className="text-xs text-cinematic-text-muted">
                  By continuing, you agree to our{' '}
                  <a href="#" className="text-cinema-green hover:text-cinema-green-light transition-colors">
                    Terms of Service
                  </a>{' '}
                  and{' '}
                  <a href="#" className="text-cinema-green hover:text-cinema-green-light transition-colors">
                    Privacy Policy
                  </a>
                </p>
                
                {/* Trust Indicators */}
                <div className="flex items-center justify-center space-x-3 mt-3">
                  <div className="flex items-center space-x-1">
                    <Shield className="w-2.5 h-2.5 text-cinema-emerald" />
                    <span className="text-xs text-cinematic-text-muted">Secure</span>
                  </div>
                  <div className="flex items-center space-x-1">
                    <Zap className="w-2.5 h-2.5 text-cinema-green-light" />
                    <span className="text-xs text-cinematic-text-muted">Fast</span>
                  </div>
                  <div className="flex items-center space-x-1">
                    <Target className="w-2.5 h-2.5 text-premium-gold" />
                    <span className="text-xs text-cinematic-text-muted">Reliable</span>
                  </div>
                </div>
              </motion.div>
            </div>
          </motion.div>
        </motion.div>
      </div>
    </div>
  );
};