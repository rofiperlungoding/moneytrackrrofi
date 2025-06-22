import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Cookie, Settings, Check, X } from 'lucide-react';
import { usePrivacy } from '../contexts/PrivacyContext';

export const CookieBanner: React.FC = () => {
  const { 
    showCookieBanner, 
    acceptAllCookies, 
    rejectAllCookies, 
    customizeCookies,
    settings 
  } = usePrivacy();
  
  const [showCustomize, setShowCustomize] = React.useState(false);
  const [customSettings, setCustomSettings] = React.useState({
    cookieConsent: true,
    analyticsConsent: false,
    marketingConsent: false
  });

  const handleCustomize = () => {
    customizeCookies(customSettings);
    setShowCustomize(false);
  };

  return (
    <AnimatePresence>
      {showCookieBanner && (
        <motion.div
          initial={{ opacity: 0, y: 100 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 100 }}
          className="fixed bottom-0 left-0 right-0 z-50 p-4"
        >
          <div className="max-w-4xl mx-auto bg-cinematic-surface/95 backdrop-blur-premium border border-cinematic-border rounded-2xl shadow-premium">
            {!showCustomize ? (
              <div className="p-6">
                <div className="flex items-start space-x-4">
                  <div className="p-3 bg-cinema-green/10 rounded-full">
                    <Cookie className="w-6 h-6 text-cinema-green" />
                  </div>
                  
                  <div className="flex-1">
                    <h3 className="text-lg font-bold text-cinematic-text mb-2">
                      We value your privacy
                    </h3>
                    <p className="text-sm text-cinematic-text-secondary mb-4">
                      MoneyTrackr uses cookies to improve your experience, analyze usage, and provide personalized features. 
                      You can choose which cookies to accept below.
                    </p>
                    
                    <div className="flex flex-wrap items-center space-x-3">
                      <motion.button
                        whileHover={{ scale: 1.02, boxShadow: '0 0 20px rgba(34, 197, 94, 0.4)' }}
                        whileTap={{ scale: 0.98 }}
                        onClick={acceptAllCookies}
                        className="flex items-center space-x-2 bg-premium-green text-white px-4 py-2 rounded-xl font-medium hover:shadow-glow-green transition-all"
                      >
                        <Check className="w-4 h-4" />
                        <span>Accept All</span>
                      </motion.button>
                      
                      <motion.button
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={rejectAllCookies}
                        className="flex items-center space-x-2 bg-cinematic-glass border border-cinematic-border text-cinematic-text px-4 py-2 rounded-xl hover:border-cinema-green/30 transition-all"
                      >
                        <X className="w-4 h-4" />
                        <span>Reject All</span>
                      </motion.button>
                      
                      <motion.button
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={() => setShowCustomize(true)}
                        className="flex items-center space-x-2 text-cinema-green hover:text-cinema-green-light transition-colors"
                      >
                        <Settings className="w-4 h-4" />
                        <span>Customize</span>
                      </motion.button>
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <div className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-bold text-cinematic-text">Customize Cookie Preferences</h3>
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => setShowCustomize(false)}
                    className="text-cinematic-text-secondary hover:text-cinematic-text transition-colors"
                  >
                    <X className="w-5 h-5" />
                  </motion.button>
                </div>
                
                <div className="space-y-4 mb-6">
                  <div className="flex items-center justify-between p-3 bg-cinematic-glass rounded-xl">
                    <div>
                      <h4 className="font-medium text-cinematic-text">Essential Cookies</h4>
                      <p className="text-xs text-cinematic-text-secondary">Required for basic functionality</p>
                    </div>
                    <div className="text-cinema-green font-medium text-sm">Always Active</div>
                  </div>
                  
                  <div className="flex items-center justify-between p-3 bg-cinematic-glass rounded-xl">
                    <div>
                      <h4 className="font-medium text-cinematic-text">Analytics Cookies</h4>
                      <p className="text-xs text-cinematic-text-secondary">Help us understand how you use our app</p>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        checked={customSettings.analyticsConsent}
                        onChange={(e) => setCustomSettings(prev => ({ ...prev, analyticsConsent: e.target.checked }))}
                        className="sr-only peer"
                      />
                      <div className="w-9 h-5 bg-cinematic-border peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-cinema-green" />
                    </label>
                  </div>
                  
                  <div className="flex items-center justify-between p-3 bg-cinematic-glass rounded-xl">
                    <div>
                      <h4 className="font-medium text-cinematic-text">Marketing Cookies</h4>
                      <p className="text-xs text-cinematic-text-secondary">Used to show relevant content and ads</p>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        checked={customSettings.marketingConsent}
                        onChange={(e) => setCustomSettings(prev => ({ ...prev, marketingConsent: e.target.checked }))}
                        className="sr-only peer"
                      />
                      <div className="w-9 h-5 bg-cinematic-border peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-cinema-green" />
                    </label>
                  </div>
                </div>
                
                <div className="flex space-x-3">
                  <motion.button
                    whileHover={{ scale: 1.02, boxShadow: '0 0 20px rgba(34, 197, 94, 0.4)' }}
                    whileTap={{ scale: 0.98 }}
                    onClick={handleCustomize}
                    className="flex-1 bg-premium-green text-white py-2 rounded-xl font-medium hover:shadow-glow-green transition-all"
                  >
                    Save Preferences
                  </motion.button>
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => setShowCustomize(false)}
                    className="bg-cinematic-glass border border-cinematic-border text-cinematic-text px-6 py-2 rounded-xl hover:border-cinema-green/30 transition-all"
                  >
                    Cancel
                  </motion.button>
                </div>
              </div>
            )}
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};