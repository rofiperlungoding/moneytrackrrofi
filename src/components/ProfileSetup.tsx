import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { User, Globe, Sparkles, ArrowRight, CheckCircle } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { useFinance } from '../contexts/FinanceContext';
import { useCurrency } from '../contexts/CurrencyContext';
import { SUPPORTED_CURRENCIES } from '../utils/currency';

export const ProfileSetup: React.FC = () => {
  const { user, completeProfileSetup, updateProfile } = useAuth();
  const { updateSettings } = useFinance();
  const { setCurrency } = useCurrency();
  
  const [currentStep, setCurrentStep] = useState(1);
  const [profileData, setProfileData] = useState({
    name: user?.user_metadata?.full_name || '',
    avatar: '👤',
    currency: 'USD'
  });

  const avatarOptions = [
    '👤', '😊', '🤓', '😎', '🚀', '💰', '🎯', '⭐', '🌟', '💎', '🔥', '🎨'
  ];

  const totalSteps = 3;

  const handleNext = () => {
    if (currentStep < totalSteps) {
      setCurrentStep(currentStep + 1);
    } else {
      handleComplete();
    }
  };

  const handleComplete = async () => {
    // Update Supabase user metadata
    await updateProfile({
      full_name: profileData.name,
      avatar_url: profileData.avatar,
    });

    // Update finance settings
    updateSettings({
      profile: {
        name: profileData.name,
        avatar: profileData.avatar,
        currency: profileData.currency
      }
    });

    // Set currency in currency context
    setCurrency(profileData.currency);

    // Mark profile setup as complete
    completeProfileSetup();
  };

  const canProceed = () => {
    switch (currentStep) {
      case 1:
        return profileData.name.trim().length > 0;
      case 2:
        return profileData.avatar !== '';
      case 3:
        return profileData.currency !== '';
      default:
        return false;
    }
  };

  const renderStep = () => {
    switch (currentStep) {
      case 1:
        return (
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="text-center"
          >
            <div className="w-16 h-16 bg-cinema-green/20 rounded-3xl flex items-center justify-center mx-auto mb-4">
              <User className="w-8 h-8 text-cinema-green" />
            </div>
            <h2 className="text-2xl font-bold text-cinematic-text font-cinematic mb-2">
              What's your name?
            </h2>
            <p className="text-cinematic-text-secondary mb-6 text-base">
              Let's personalize your MoneyTrackr experience
            </p>
            
            <div className="max-w-xs mx-auto">
              <input
                type="text"
                value={profileData.name}
                onChange={(e) => setProfileData({ ...profileData, name: e.target.value })}
                placeholder="Enter your name"
                className="w-full px-4 py-3 bg-cinematic-glass border border-cinematic-border rounded-xl text-cinematic-text placeholder-cinematic-text-muted focus:outline-none focus:border-cinema-green/50 focus:ring-2 focus:ring-cinema-green/20 transition-all duration-300 text-center text-lg"
                autoFocus
              />
            </div>
          </motion.div>
        );

      case 2:
        return (
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="text-center"
          >
            <div className="w-16 h-16 bg-premium-gold/20 rounded-3xl flex items-center justify-center mx-auto mb-4">
              <Sparkles className="w-8 h-8 text-premium-gold" />
            </div>
            <h2 className="text-2xl font-bold text-cinematic-text font-cinematic mb-2">
              Choose your avatar
            </h2>
            <p className="text-cinematic-text-secondary mb-6 text-base">
              Pick an avatar that represents you
            </p>
            
            <div className="grid grid-cols-4 gap-3 max-w-xs mx-auto">
              {avatarOptions.map((avatar) => (
                <motion.button
                  key={avatar}
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => setProfileData({ ...profileData, avatar })}
                  className={`w-12 h-12 text-2xl rounded-xl border-2 transition-all ${
                    profileData.avatar === avatar
                      ? 'border-cinema-green bg-cinema-green/10 shadow-glow-green'
                      : 'border-cinematic-border hover:border-cinema-green/50 bg-cinematic-glass'
                  }`}
                >
                  {avatar}
                </motion.button>
              ))}
            </div>
          </motion.div>
        );

      case 3:
        return (
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="text-center"
          >
            <div className="w-16 h-16 bg-cinema-emerald/20 rounded-3xl flex items-center justify-center mx-auto mb-4">
              <Globe className="w-8 h-8 text-cinema-emerald" />
            </div>
            <h2 className="text-2xl font-bold text-cinematic-text font-cinematic mb-2">
              Select your currency
            </h2>
            <p className="text-cinematic-text-secondary mb-6 text-base">
              Choose your preferred currency for tracking finances
            </p>
            
            <div className="max-w-sm mx-auto space-y-2">
              {Object.entries(SUPPORTED_CURRENCIES).map(([code, currency]) => (
                <motion.button
                  key={code}
                  whileHover={{ scale: 1.02, x: 4 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => setProfileData({ ...profileData, currency: code })}
                  className={`w-full flex items-center justify-between p-3 rounded-xl border-2 transition-all ${
                    profileData.currency === code
                      ? 'border-cinema-green bg-cinema-green/10 shadow-glow-green'
                      : 'border-cinematic-border hover:border-cinema-green/50 bg-cinematic-glass'
                  }`}
                >
                  <div className="flex items-center space-x-3">
                    <span className="text-xl">{currency.symbol}</span>
                    <div className="text-left">
                      <p className="font-bold text-cinematic-text text-sm">{code}</p>
                      <p className="text-xs text-cinematic-text-secondary">{currency.name}</p>
                    </div>
                  </div>
                  {profileData.currency === code && (
                    <CheckCircle className="w-4 h-4 text-cinema-green" />
                  )}
                </motion.button>
              ))}
            </div>
          </motion.div>
        );

      default:
        return null;
    }
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
      </div>

      {/* Main Content */}
      <div className="relative z-10 w-full flex items-center justify-center p-8">
        <motion.div
          initial={{ opacity: 0, scale: 0.9, y: 50 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          transition={{ duration: 0.8, type: "spring", stiffness: 100 }}
          className="relative bg-cinematic-surface/90 backdrop-blur-premium border-2 border-cinema-green/20 rounded-3xl p-8 shadow-premium w-full max-w-md"
        >
          {/* Background Effects */}
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
            {/* Header */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-center mb-6"
            >
              <img 
                src="/Money (2).png" 
                alt="MoneyTrackr Logo" 
                className="h-10 w-auto object-contain mx-auto mb-3"
              />
              <h1 className="text-xl font-bold text-cinematic-text font-cinematic mb-1">
                Set up your profile
              </h1>
              <p className="text-cinematic-text-secondary text-sm">
                Step {currentStep} of {totalSteps}
              </p>
            </motion.div>

            {/* Progress Bar */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="mb-8"
            >
              <div className="flex items-center justify-center space-x-2 mb-3">
                {Array.from({ length: totalSteps }, (_, i) => (
                  <div
                    key={i}
                    className={`w-2.5 h-2.5 rounded-full transition-all duration-300 ${
                      i + 1 <= currentStep 
                        ? 'bg-cinema-green shadow-glow-green' 
                        : 'bg-cinematic-border'
                    }`}
                  />
                ))}
              </div>
              <div className="w-full bg-cinematic-border rounded-full h-1.5">
                <motion.div
                  initial={{ width: '0%' }}
                  animate={{ width: `${(currentStep / totalSteps) * 100}%` }}
                  transition={{ duration: 0.5, ease: "easeOut" }}
                  className="h-1.5 bg-gradient-to-r from-cinema-green to-cinema-green-light rounded-full"
                />
              </div>
            </motion.div>

            {/* Step Content */}
            <div className="mb-8 min-h-[250px] flex items-center justify-center">
              {renderStep()}
            </div>

            {/* Navigation */}
            <div className="flex justify-between">
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => setCurrentStep(Math.max(1, currentStep - 1))}
                disabled={currentStep === 1}
                className={`px-4 py-2.5 rounded-xl font-medium transition-all text-sm ${
                  currentStep === 1
                    ? 'bg-cinematic-glass text-cinematic-text-muted cursor-not-allowed'
                    : 'bg-cinematic-glass border border-cinematic-border text-cinematic-text hover:border-cinema-green/30'
                }`}
              >
                Back
              </motion.button>

              <motion.button
                whileHover={{ 
                  scale: canProceed() ? 1.02 : 1, 
                  boxShadow: canProceed() ? '0 0 30px rgba(34, 197, 94, 0.4)' : undefined 
                }}
                whileTap={{ scale: canProceed() ? 0.98 : 1 }}
                onClick={handleNext}
                disabled={!canProceed()}
                className={`flex items-center space-x-2 px-4 py-2.5 rounded-xl font-medium transition-all text-sm ${
                  canProceed()
                    ? 'bg-premium-green text-white hover:shadow-glow-green'
                    : 'bg-cinematic-glass text-cinematic-text-muted cursor-not-allowed'
                }`}
              >
                <span>{currentStep === totalSteps ? 'Complete Setup' : 'Continue'}</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </motion.button>
            </div>

            {/* Preview Card (shown on all steps) */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="mt-6 bg-cinematic-glass backdrop-blur-glass border border-cinema-green/20 rounded-xl p-3"
            >
              <h3 className="text-xs font-medium text-cinematic-text-secondary mb-2 text-center">
                Profile Preview
              </h3>
              <div className="flex items-center justify-center space-x-3">
                <div className="w-10 h-10 bg-cinema-green/10 rounded-xl flex items-center justify-center text-lg">
                  {profileData.avatar}
                </div>
                <div className="text-center">
                  <p className="font-bold text-cinematic-text text-sm">
                    {profileData.name || 'Your Name'}
                  </p>
                  <p className="text-xs text-cinematic-text-secondary">
                    {SUPPORTED_CURRENCIES[profileData.currency]?.symbol} {profileData.currency}
                  </p>
                </div>
              </div>
            </motion.div>
          </div>
        </motion.div>
      </div>
    </div>
  );
};