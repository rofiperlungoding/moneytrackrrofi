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
    } catch {
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
    <div className="min-h-screen flex bg-gradient-to-br from-cinematic-dark via-cinematic-base to-cinematic-surface text-cinematic-text font-editorial overflow-x-hidden">
      {/* Cinematic Background Effects */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none z-0">
        <div className="absolute inset-0 bg-cinematic-radial opacity-60" />
        <motion.div
          animate={{
            scale: [1, 1.2, 1],
            opacity: [0.3, 0.6, 0.3],
          }}
          transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
          className="absolute top-1/4 left-1/3 w-80 h-80 bg-cinema-green/20 rounded-full blur-3xl"
        />
        <motion.div
          animate={{
            scale: [1.2, 1, 1.2],
            opacity: [0.2, 0.5, 0.2],
          }}
          transition={{ duration: 6, repeat: Infinity, ease: "easeInOut", delay: 2 }}
          className="absolute bottom-1/3 right-1/4 w-72 h-72 bg-cinema-emerald/15 rounded-full blur-3xl"
        />
        <div className="absolute inset-0 opacity-[0.02]" style={{
          backgroundImage: `radial-gradient(circle at 1px 1px, rgba(34, 197, 94, 0.5) 1px, transparent 0)`,
          backgroundSize: '40px 40px'
        }} />
      </div>

      {/* Two-Column Layout */}
      <div className="relative z-10 w-full flex flex-col md:flex-row min-h-screen">
        {/* Left Column - Hero Content */}
        <motion.div
          initial={{ opacity: 0, x: -50 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 1, ease: "easeOut" }}
          className="w-full md:w-1/2 flex items-center justify-center p-8 md:p-16 lg:p-24"
        >
          <div className="max-w-lg text-center md:text-left">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.4 }}
              className="flex flex-col md:flex-row items-center md:items-start gap-2"
            >
              <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold text-white font-cinematic leading-tight whitespace-nowrap">
                Track your
                <span className="block md:inline ml-0 md:ml-3">
                  <RotatingText
                    phrases={['financial.', 'money.', 'future.', 'yourself.']}
                    interval={2800}
                    textClassName="text-cinema-green"
                  />
                </span>
              </h1>
            </motion.div>
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 1.2 }}
              className="mt-6 text-cinematic-text-secondary text-lg max-w-md hidden md:block"
            >
              Experience a premium cinematic interface for managing your wealth with elegance and precision.
            </motion.p>
          </div>
        </motion.div>

        {/* Right Column - Auth Panel */}
        <motion.div
          initial={{ opacity: 0, x: 50 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 1, ease: "easeOut", delay: 0.3 }}
          className="w-full md:w-1/2 flex items-center justify-center p-6 md:p-12 lg:p-20"
        >
          <motion.div
            layout
            className="w-full max-w-md relative bg-cinematic-surface/80 backdrop-blur-premium border-2 border-cinema-green/20 rounded-[2.5rem] p-10 shadow-premium overflow-hidden"
          >
            {/* Glossy Top Edge */}
            <div className="absolute top-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-white/20 to-transparent z-20" />

            <div className="relative z-10">
              <div className="text-center mb-10">
                <motion.div
                  initial={{ scale: 0.5, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  className="mb-6 inline-block"
                >
                  <img src="/Money (2).png" alt="MoneyTrackr Logo" className="h-14 w-auto drop-shadow-glow-green" />
                </motion.div>
                <h2 className="text-2xl font-bold text-white mb-2">{isSignUp ? 'Join MoneyTrackr' : 'Welcome Back'}</h2>
                <p className="text-cinematic-text-muted text-sm px-4">
                  {isSignUp ? 'Create an account to start tracking your wealth in style.' : 'Sign in to access your cinematic dashboard.'}
                </p>
              </div>

              <AnimatePresence>
                {message && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    className={`mb-6 p-4 rounded-2xl flex items-center space-x-3 border ${message.type === 'success' ? 'bg-cinema-green/10 border-cinema-green/30 text-cinema-green' : 'bg-red-500/10 border-red-500/30 text-red-500'
                      }`}
                  >
                    {message.type === 'success' ? <CheckCircle size={18} /> : <AlertCircle size={18} />}
                    <span className="text-sm font-medium">{message.text}</span>
                  </motion.div>
                )}
              </AnimatePresence>

              <form onSubmit={handleSubmit} className="space-y-6">
                <AnimatePresence mode="popLayout">
                  {isSignUp && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      exit={{ opacity: 0, height: 0 }}
                      className="overflow-hidden"
                    >
                      <div className="relative group">
                        <div className="absolute left-0 top-0 bottom-0 w-12 flex items-center justify-center border-r border-white/5 bg-cinematic-dark/60 rounded-l-2xl z-10 transition-colors group-focus-within:bg-cinema-green/10">
                          <User size={18} className="text-cinematic-text-muted group-focus-within:text-cinema-green transition-colors" />
                        </div>
                        <input
                          type="text"
                          required={isSignUp}
                          value={formData.fullName}
                          onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                          className="peer w-full pl-16 pr-4 py-4 bg-cinematic-dark/40 border-2 border-cinematic-border/20 rounded-2xl text-white placeholder-transparent focus:outline-none focus:border-cinema-green/50 focus:ring-4 focus:ring-cinema-green/5 transition-all"
                          placeholder="Full Name"
                          id="fullName"
                        />
                        <label htmlFor="fullName" className="absolute left-16 top-1/2 -translate-y-1/2 text-sm text-cinematic-text-muted transition-all peer-focus:top-0 peer-focus:scale-75 peer-focus:-translate-y-3 peer-[:not(:placeholder-shown)]:top-0 peer-[:not(:placeholder-shown)]:scale-75 peer-[:not(:placeholder-shown)]:-translate-y-3 pointer-events-none origin-left bg-cinematic-surface-elevated px-1 rounded">Full Name</label>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>

                <div className="relative group">
                  <div className="absolute left-0 top-0 bottom-0 w-12 flex items-center justify-center border-r border-white/5 bg-cinematic-dark/60 rounded-l-2xl z-10 transition-colors group-focus-within:bg-cinema-green/10">
                    <Mail size={18} className="text-cinematic-text-muted group-focus-within:text-cinema-green transition-colors" />
                  </div>
                  <input
                    type="email"
                    required
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="peer w-full pl-16 pr-4 py-4 bg-cinematic-dark/40 border-2 border-cinematic-border/20 rounded-2xl text-white placeholder-transparent focus:outline-none focus:border-cinema-green/50 focus:ring-4 focus:ring-cinema-green/5 transition-all"
                    placeholder="Email"
                    id="email"
                  />
                  <label htmlFor="email" className="absolute left-16 top-1/2 -translate-y-1/2 text-sm text-cinematic-text-muted transition-all peer-focus:top-0 peer-focus:scale-75 peer-focus:-translate-y-3 peer-[:not(:placeholder-shown)]:top-0 peer-[:not(:placeholder-shown)]:scale-75 peer-[:not(:placeholder-shown)]:-translate-y-3 pointer-events-none origin-left bg-cinematic-surface-elevated px-1 rounded">Email Address</label>
                </div>

                <div className="relative group">
                  <div className="absolute left-0 top-0 bottom-0 w-12 flex items-center justify-center border-r border-white/5 bg-cinematic-dark/60 rounded-l-2xl z-10 transition-colors group-focus-within:bg-cinema-green/10">
                    <Lock size={18} className="text-cinematic-text-muted group-focus-within:text-cinema-green transition-colors" />
                  </div>
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    minLength={6}
                    value={formData.password}
                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                    className="peer w-full pl-16 pr-12 py-4 bg-cinematic-dark/40 border-2 border-cinematic-border/20 rounded-2xl text-white placeholder-transparent focus:outline-none focus:border-cinema-green/50 focus:ring-4 focus:ring-cinema-green/5 transition-all"
                    placeholder="Password"
                    id="password"
                  />
                  <label htmlFor="password" className="absolute left-16 top-1/2 -translate-y-1/2 text-sm text-cinematic-text-muted transition-all peer-focus:top-0 peer-focus:scale-75 peer-focus:-translate-y-3 peer-[:not(:placeholder-shown)]:top-0 peer-[:not(:placeholder-shown)]:scale-75 peer-[:not(:placeholder-shown)]:-translate-y-3 pointer-events-none origin-left bg-cinematic-surface-elevated px-1 rounded">Password</label>
                  <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-4 top-1/2 -translate-y-1/2 text-cinematic-text-muted hover:text-white transition-colors">
                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>

                <AnimatePresence mode="popLayout">
                  {isSignUp && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      exit={{ opacity: 0, height: 0 }}
                      className="overflow-hidden"
                    >
                      <div className="relative group">
                        <div className="absolute left-0 top-0 bottom-0 w-12 flex items-center justify-center border-r border-white/5 bg-cinematic-dark/60 rounded-l-2xl z-10 transition-colors group-focus-within:bg-cinema-green/10">
                          <Lock size={18} className="text-cinematic-text-muted group-focus-within:text-cinema-green transition-colors" />
                        </div>
                        <input
                          type="password"
                          required={isSignUp}
                          value={formData.confirmPassword}
                          onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                          className="peer w-full pl-16 pr-4 py-4 bg-cinematic-dark/40 border-2 border-cinematic-border/20 rounded-2xl text-white placeholder-transparent focus:outline-none focus:border-cinema-green/50 focus:ring-4 focus:ring-cinema-green/5 transition-all"
                          placeholder="Confirm Password"
                          id="confirmPassword"
                        />
                        <label htmlFor="confirmPassword" className="absolute left-16 top-1/2 -translate-y-1/2 text-sm text-cinematic-text-muted transition-all peer-focus:top-0 peer-focus:scale-75 peer-focus:-translate-y-3 peer-[:not(:placeholder-shown)]:top-0 peer-[:not(:placeholder-shown)]:scale-75 peer-[:not(:placeholder-shown)]:-translate-y-3 pointer-events-none origin-left bg-cinematic-surface-elevated px-1 rounded">Confirm Password</label>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>

                <motion.button
                  whileHover={{ scale: 1.02, boxShadow: '0 0 30px rgba(34, 197, 94, 0.4)' }}
                  whileTap={{ scale: 0.98 }}
                  type="submit"
                  disabled={loading}
                  className="w-full py-5 bg-premium-green rounded-2xl text-white font-bold text-lg relative overflow-hidden group shadow-glow-green disabled:opacity-50"
                >
                  <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent skew-x-12 translate-x-[-150%] group-hover:animate-shimmer" />
                  <div className="relative z-10 flex items-center justify-center space-x-2">
                    {loading ? (
                      <div className="w-6 h-6 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    ) : (
                      <>
                        <span>{isSignUp ? 'Create My Account' : 'Sign In To Vault'}</span>
                        <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform" />
                      </>
                    )}
                  </div>
                </motion.button>
              </form>

              {!isSignUp && (
                <button
                  onClick={handleForgotPassword}
                  className="w-full mt-4 text-cinema-green hover:text-cinema-green-light text-sm font-medium transition-colors"
                >
                  Forgot password?
                </button>
              )}

              <div className="mt-10 pt-8 border-t border-white/5 text-center">
                <p className="text-cinematic-text-muted text-sm">
                  {isSignUp ? 'Already a member?' : "New to MoneyTrackr?"}{' '}
                  <button
                    onClick={() => {
                      setIsSignUp(!isSignUp);
                      setMessage(null);
                    }}
                    className="text-cinema-green hover:text-cinema-green-light font-bold transition-colors ml-1"
                  >
                    {isSignUp ? 'Sign In' : 'Join Now'}
                  </button>
                </p>
                <div className="flex justify-center space-x-6 mt-8">
                  <div className="flex flex-col items-center">
                    <Shield size={16} className="text-cinema-green mb-1 opacity-60" />
                    <span className="text-[10px] uppercase tracking-widest text-cinematic-text-muted">Secure Vault</span>
                  </div>
                  <div className="flex flex-col items-center">
                    <Zap size={16} className="text-cinema-green mb-1 opacity-60" />
                    <span className="text-[10px] uppercase tracking-widest text-cinematic-text-muted">Instant Access</span>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        </motion.div>
      </div>
    </div>
  );
};