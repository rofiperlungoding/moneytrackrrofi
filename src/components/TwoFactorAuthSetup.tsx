import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Mail, Phone, CheckCircle, AlertCircle, ArrowRight, ArrowLeft, KeyRound, Loader2, ShieldCheck } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { useSecurity } from '../contexts/SecurityContext';

export const TwoFactorAuthSetup: React.FC = () => {
  const { user } = useAuth();
  const { twoFactorEnabled, toggleTwoFactor } = useSecurity();
  
  const [currentStep, setCurrentStep] = useState(1);
  const [selectedMethod, setSelectedMethod] = useState<'email' | 'phone' | null>(null);
  const [emailOtp, setEmailOtp] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [phoneOtp, setPhoneOtp] = useState('');
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [loading, setLoading] = useState(false);
  const [cooldown, setCooldown] = useState(0);

  const totalSteps = 4;

  useEffect(() => {
    if (cooldown > 0) {
      const timer = setTimeout(() => setCooldown(cooldown - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [cooldown]);

  const handleNext = () => {
    setMessage(null);
    setCurrentStep(prev => prev + 1);
  };

  const handleBack = () => {
    setMessage(null);
    setCurrentStep(prev => prev - 1);
  };

  const handleEnable2FA = () => {
    toggleTwoFactor();
    setMessage({ type: 'success', text: 'Two-Factor Authentication enabled!' });
    setCurrentStep(totalSteps);
  };

  const handleSendEmailOtp = async () => {
    setLoading(true);
    setMessage(null);
    await new Promise(resolve => setTimeout(resolve, 1500));
    setMessage({ type: 'success', text: `OTP sent to ${user?.email || 'your email'}. It expires in 5 minutes.` });
    setCooldown(60);
    setLoading(false);
    handleNext();
  };

  const handleVerifyEmailOtp = async () => {
    setLoading(true);
    setMessage(null);
    await new Promise(resolve => setTimeout(resolve, 1500));
    if (emailOtp === '123456') {
      setMessage({ type: 'success', text: 'Email verified successfully!' });
      handleEnable2FA();
    } else {
      setMessage({ type: 'error', text: 'Invalid OTP. Please try again.' });
    }
    setLoading(false);
  };

  const handleSendPhoneOtp = async () => {
    setLoading(true);
    setMessage(null);
    await new Promise(resolve => setTimeout(resolve, 1500));
    setMessage({ type: 'success', text: `OTP sent to ${phoneNumber}. It expires in 3 minutes.` });
    setCooldown(60);
    setLoading(false);
    handleNext();
  };

  const handleVerifyPhoneOtp = async () => {
    setLoading(true);
    setMessage(null);
    await new Promise(resolve => setTimeout(resolve, 1500));
    if (phoneOtp === '654321') {
      setMessage({ type: 'success', text: 'Phone verified successfully!' });
      handleEnable2FA();
    } else {
      setMessage({ type: 'error', text: 'Invalid OTP. Please try again.' });
    }
    setLoading(false);
  };

  const renderStepContent = () => {
    switch (currentStep) {
      case 1:
        return (
          <motion.div
            key="step1"
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -50 }}
            transition={{ duration: 0.3 }}
            className="space-y-6 text-center"
          >
            <KeyRound className="w-16 h-16 text-cinema-green mx-auto mb-4" />
            <h3 className="text-2xl font-bold text-cinematic-text font-cinematic">Enable Two-Factor Authentication</h3>
            <p className="text-cinematic-text-secondary">
              Add an extra layer of security to your account by enabling 2FA.
              You'll need to verify your identity with a code from your chosen method.
            </p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-6">
              <motion.button
                whileHover={{ scale: 1.02, boxShadow: '0 0 20px rgba(34, 197, 94, 0.4)' }}
                whileTap={{ scale: 0.98 }}
                onClick={() => { setSelectedMethod('email'); handleNext(); }}
                className="flex flex-col items-center justify-center p-6 bg-cinematic-glass border border-cinema-green/20 rounded-2xl shadow-premium hover:border-cinema-green/50 transition-all"
              >
                <Mail className="w-8 h-8 text-cinema-green mb-3" />
                <span className="font-bold text-cinematic-text">Email Verification</span>
                <span className="text-xs text-cinematic-text-secondary mt-1">Send codes to your email</span>
              </motion.button>
              <motion.button
                whileHover={{ scale: 1.02, boxShadow: '0 0 20px rgba(34, 197, 94, 0.4)' }}
                whileTap={{ scale: 0.98 }}
                onClick={() => { setSelectedMethod('phone'); handleNext(); }}
                className="flex flex-col items-center justify-center p-6 bg-cinematic-glass border border-cinema-green/20 rounded-2xl shadow-premium hover:border-cinema-green/50 transition-all"
              >
                <Phone className="w-8 h-8 text-cinema-green mb-3" />
                <span className="font-bold text-cinematic-text">Phone Verification</span>
                <span className="text-xs text-cinematic-text-secondary mt-1">Send codes via SMS</span>
              </motion.button>
            </div>
          </motion.div>
        );
      case 2:
        if (selectedMethod === 'email') {
          return (
            <motion.div
              key="step2-email"
              initial={{ opacity: 0, x: 50 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -50 }}
              transition={{ duration: 0.3 }}
              className="space-y-6 text-center"
            >
              <Mail className="w-16 h-16 text-cinema-green mx-auto mb-4" />
              <h3 className="text-2xl font-bold text-cinematic-text font-cinematic">Verify Your Email</h3>
              <p className="text-cinematic-text-secondary">
                A 6-digit code will be sent to your registered email address: <br />
                <span className="font-medium text-cinematic-text">{user?.email || 'N/A'}</span>
              </p>
              <motion.button
                whileHover={{ scale: 1.02, boxShadow: '0 0 20px rgba(34, 197, 94, 0.4)' }}
                whileTap={{ scale: 0.98 }}
                onClick={handleSendEmailOtp}
                disabled={loading}
                className="w-full flex items-center justify-center space-x-2 bg-premium-green text-white px-6 py-3 rounded-xl font-medium hover:shadow-glow-green transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Mail className="w-5 h-5" />}
                <span>{loading ? 'Sending Code...' : 'Send Code'}</span>
              </motion.button>
            </motion.div>
          );
        } else if (selectedMethod === 'phone') {
          return (
            <motion.div
              key="step2-phone"
              initial={{ opacity: 0, x: 50 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -50 }}
              transition={{ duration: 0.3 }}
              className="space-y-6 text-center"
            >
              <Phone className="w-16 h-16 text-cinema-green mx-auto mb-4" />
              <h3 className="text-2xl font-bold text-cinematic-text font-cinematic">Enter Your Phone Number</h3>
              <p className="text-cinematic-text-secondary">
                A 6-digit code will be sent via SMS to this number.
              </p>
              <input
                type="tel"
                value={phoneNumber}
                onChange={(e) => setPhoneNumber(e.target.value)}
                placeholder="+1 (555) 123-4567"
                className="w-full px-4 py-3 bg-cinematic-glass border border-cinematic-border rounded-xl text-cinematic-text placeholder-cinematic-text-muted focus:outline-none focus:border-cinema-green/50 focus:ring-2 focus:ring-cinema-green/20 transition-all duration-300 text-center"
              />
              <motion.button
                whileHover={{ scale: 1.02, boxShadow: '0 0 20px rgba(34, 197, 94, 0.4)' }}
                whileTap={{ scale: 0.98 }}
                onClick={handleSendPhoneOtp}
                disabled={loading || !phoneNumber}
                className="w-full flex items-center justify-center space-x-2 bg-premium-green text-white px-6 py-3 rounded-xl font-medium hover:shadow-glow-green transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Phone className="w-5 h-5" />}
                <span>{loading ? 'Sending Code...' : 'Send Code'}</span>
              </motion.button>
            </motion.div>
          );
        }
        return null;
      case 3:
        if (selectedMethod === 'email') {
          return (
            <motion.div
              key="step3-email"
              initial={{ opacity: 0, x: 50 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -50 }}
              transition={{ duration: 0.3 }}
              className="space-y-6 text-center"
            >
              <Mail className="w-16 h-16 text-cinema-green mx-auto mb-4" />
              <h3 className="text-2xl font-bold text-cinematic-text font-cinematic">Enter Email OTP</h3>
              <p className="text-cinematic-text-secondary">
                Please enter the 6-digit code sent to <span className="font-medium text-cinematic-text">{user?.email || 'your email'}</span>.
              </p>
              <input
                type="text"
                value={emailOtp}
                onChange={(e) => setEmailOtp(e.target.value)}
                maxLength={6}
                placeholder="------"
                className="w-full px-4 py-3 bg-cinematic-glass border border-cinematic-border rounded-xl text-cinematic-text placeholder-cinematic-text-muted focus:outline-none focus:border-cinema-green/50 focus:ring-2 focus:ring-cinema-green/20 transition-all duration-300 text-center text-2xl tracking-widest"
              />
              <motion.button
                whileHover={{ scale: 1.02, boxShadow: '0 0 20px rgba(34, 197, 94, 0.4)' }}
                whileTap={{ scale: 0.98 }}
                onClick={handleVerifyEmailOtp}
                disabled={loading || emailOtp.length !== 6}
                className="w-full flex items-center justify-center space-x-2 bg-premium-green text-white px-6 py-3 rounded-xl font-medium hover:shadow-glow-green transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <CheckCircle className="w-5 h-5" />}
                <span>{loading ? 'Verifying...' : 'Verify Code'}</span>
              </motion.button>
              <button
                onClick={handleSendEmailOtp}
                disabled={cooldown > 0 || loading}
                className="text-sm text-cinema-green hover:text-cinema-green-light transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Resend Code {cooldown > 0 && `(${cooldown}s)`}
              </button>
            </motion.div>
          );
        } else if (selectedMethod === 'phone') {
          return (
            <motion.div
              key="step3-phone"
              initial={{ opacity: 0, x: 50 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -50 }}
              transition={{ duration: 0.3 }}
              className="space-y-6 text-center"
            >
              <Phone className="w-16 h-16 text-cinema-green mx-auto mb-4" />
              <h3 className="text-2xl font-bold text-cinematic-text font-cinematic">Enter Phone OTP</h3>
              <p className="text-cinematic-text-secondary">
                Please enter the 6-digit code sent to <span className="font-medium text-cinematic-text">{phoneNumber}</span>.
              </p>
              <input
                type="text"
                value={phoneOtp}
                onChange={(e) => setPhoneOtp(e.target.value)}
                maxLength={6}
                placeholder="------"
                className="w-full px-4 py-3 bg-cinematic-glass border border-cinematic-border rounded-xl text-cinematic-text placeholder-cinematic-text-muted focus:outline-none focus:border-cinema-green/50 focus:ring-2 focus:ring-cinema-green/20 transition-all duration-300 text-center text-2xl tracking-widest"
              />
              <motion.button
                whileHover={{ scale: 1.02, boxShadow: '0 0 20px rgba(34, 197, 94, 0.4)' }}
                whileTap={{ scale: 0.98 }}
                onClick={handleVerifyPhoneOtp}
                disabled={loading || phoneOtp.length !== 6}
                className="w-full flex items-center justify-center space-x-2 bg-premium-green text-white px-6 py-3 rounded-xl font-medium hover:shadow-glow-green transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <CheckCircle className="w-5 h-5" />}
                <span>{loading ? 'Verifying...' : 'Verify Code'}</span>
              </motion.button>
              <button
                onClick={handleSendPhoneOtp}
                disabled={cooldown > 0 || loading}
                className="text-sm text-cinema-green hover:text-cinema-green-light transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Resend Code {cooldown > 0 && `(${cooldown}s)`}
              </button>
            </motion.div>
          );
        }
        return null;
      case 4:
        return (
          <motion.div
            key="step4"
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -50 }}
            transition={{ duration: 0.3 }}
            className="space-y-6 text-center"
          >
            <ShieldCheck className="w-16 h-16 text-cinema-green mx-auto mb-4" />
            <h3 className="text-2xl font-bold text-cinematic-text font-cinematic">2FA Enabled Successfully!</h3>
            <p className="text-cinematic-text-secondary">
              Your account is now more secure with Two-Factor Authentication.
            </p>
            <motion.button
              whileHover={{ scale: 1.02, boxShadow: '0 0 20px rgba(34, 197, 94, 0.4)' }}
              whileTap={{ scale: 0.98 }}
              onClick={() => setCurrentStep(1)}
              className="w-full flex items-center justify-center space-x-2 bg-premium-green text-white px-6 py-3 rounded-xl font-medium hover:shadow-glow-green transition-all"
            >
              <span>Done</span>
            </motion.button>
          </motion.div>
        );
      default:
        return null;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-bold text-cinematic-text font-cinematic">Two-Factor Authentication</h2>
        {twoFactorEnabled && (
          <span className="px-3 py-1 bg-cinema-green/10 text-cinema-green text-sm rounded-full flex items-center space-x-1">
            <CheckCircle className="w-4 h-4" />
            <span>Enabled</span>
          </span>
        )}
      </div>

      {/* Progress Bar */}
      <div className="w-full bg-cinematic-border rounded-full h-2 mb-6">
        <motion.div
          initial={{ width: '0%' }}
          animate={{ width: `${(currentStep / totalSteps) * 100}%` }}
          transition={{ duration: 0.5, ease: "easeOut" }}
          className="h-2 bg-gradient-to-r from-cinema-green to-cinema-green-light rounded-full"
        />
      </div>

      {/* Message Display */}
      <AnimatePresence>
        {message && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className={`mb-4 p-3 rounded-xl border flex items-center space-x-2 ${
              message.type === 'success' 
                ? 'bg-cinema-green/10 border-cinema-green/30 text-cinema-green' 
                : 'bg-financial-negative/10 border-financial-negative/30 text-financial-negative'
            }`}
          >
            {message.type === 'success' ? (
              <CheckCircle className="w-4 h-4 flex-shrink-0" />
            ) : (
              <AlertCircle className="w-4 h-4 flex-shrink-0" />
            )}
            <span className="text-sm">{message.text}</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Step Content */}
      <AnimatePresence mode="wait">
        {renderStepContent()}
      </AnimatePresence>

      {/* Navigation Buttons */}
      {currentStep < totalSteps && (
        <div className="flex justify-between mt-6">
          {currentStep > 1 && (
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={handleBack}
              className="flex items-center space-x-2 px-4 py-2.5 rounded-xl font-medium transition-all text-sm bg-cinematic-glass border border-cinematic-border text-cinematic-text hover:border-cinema-green/30"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Back</span>
            </motion.button>
          )}
        </div>
      )}
    </div>
  );
};