import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Globe, Shield, RefreshCw, LogOut, Settings, ChevronDown, Loader2 } from 'lucide-react';
import { CurrencySelector } from './CurrencySelector';
import { NotificationCenter } from './NotificationCenter';
import { useCurrency } from '../contexts/CurrencyContext';
import { useAuth } from '../contexts/AuthContext';
import { useFinance } from '../contexts/FinanceContext';

interface TopBarProps {
  onSectionChange?: (section: string) => void;
}

export const TopBar: React.FC<TopBarProps> = ({ onSectionChange }) => {
  const { refreshRates, isLoading } = useCurrency();
  const { signOut, user } = useAuth();
  const { settings, syncing, syncData } = useFinance();
  const [showUserMenu, setShowUserMenu] = useState(false);

  const handleProfileClick = () => {
    if (onSectionChange) {
      onSectionChange('settings');
    }
    setShowUserMenu(false);
  };

  const handleGoToSettings = () => {
    if (onSectionChange) {
      onSectionChange('settings');
    }
  };

  const handleLogout = async () => {
    await signOut();
    setShowUserMenu(false);
  };

  const handleSyncData = async () => {
    try {
      await syncData();
    } catch (error) {
      console.error('Sync failed:', error);
    }
  };

  const displayName = settings.profile.name || user?.user_metadata?.full_name || user?.email?.split('@')[0] || 'User';
  const displayAvatar = settings.profile.avatar !== '👤' ? settings.profile.avatar : displayName.charAt(0).toUpperCase();

  const isSupabaseConfigured = () => {
    const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
    const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY;
    return supabaseUrl && supabaseUrl !== 'your_supabase_url_here' && 
           supabaseKey && supabaseKey !== 'your_supabase_anon_key_here';
  };

  return (
    <motion.div
      initial={{ y: -20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.5 }}
      className="bg-cinematic-surface/60 backdrop-blur-premium border-b border-cinematic-border px-2 sm:px-3 py-1.5 sm:py-2 flex items-center justify-between sticky top-0 z-40 min-h-[50px] sm:min-h-[56px]"
      style={{
        background: 'linear-gradient(90deg, rgba(34, 197, 94, 0.05) 0%, rgba(22, 67, 22, 0.8) 100%)',
        boxShadow: '0 1px 0 rgba(34, 197, 94, 0.1), 0 4px 20px rgba(34, 197, 94, 0.05)'
      }}
    >
      {/* Left section - Currency and Exchange Rate */}
      <div className="flex items-center space-x-1 sm:space-x-2 overflow-hidden">
        <div className="flex-shrink-0">
          <CurrencySelector onGoToSettings={handleGoToSettings} />
        </div>
        
        {/* Compact refresh button */}
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={refreshRates}
          disabled={isLoading}
          className="flex items-center justify-center bg-cinematic-glass backdrop-blur-glass px-1.5 sm:px-2 py-1.5 rounded-lg border border-cinema-green/20 hover:border-cinema-green/40 transition-all duration-300 disabled:opacity-50 flex-shrink-0 min-w-[32px] min-h-[32px] sm:min-w-[36px] sm:min-h-[36px]"
        >
          <RefreshCw className={`w-3 h-3 sm:w-3.5 sm:h-3.5 text-cinema-green ${isLoading ? 'animate-spin' : ''}`} />
          <span className="text-xs text-cinematic-text font-medium hidden lg:inline ml-1">
            {isLoading ? 'Update' : 'Refresh'}
          </span>
        </motion.button>

        {/* Sync button (only show if Supabase is configured) */}
        {isSupabaseConfigured() && (
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={handleSyncData}
            disabled={syncing}
            className="flex items-center justify-center bg-cinematic-glass backdrop-blur-glass px-1.5 sm:px-2 py-1.5 rounded-lg border border-cinema-green/20 hover:border-cinema-green/40 transition-all duration-300 disabled:opacity-50 flex-shrink-0 min-w-[32px] min-h-[32px] sm:min-w-[36px] sm:min-h-[36px]"
          >
            {syncing ? (
              <Loader2 className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-cinema-green animate-spin" />
            ) : (
              <RefreshCw className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-cinema-green" />
            )}
            <span className="text-xs text-cinematic-text font-medium hidden lg:inline ml-1">
              {syncing ? 'Syncing' : 'Sync'}
            </span>
          </motion.button>
        )}
      </div>

      {/* Right section */}
      <div className="flex items-center space-x-1 sm:space-x-2">
        {/* Sync status indicator */}
        {isSupabaseConfigured() && (
          <div className="hidden sm:flex items-center space-x-1">
            <motion.div
              animate={{ 
                scale: [1, 1.2, 1],
                opacity: [0.5, 1, 0.5]
              }}
              transition={{
                duration: 2,
                repeat: Infinity,
                ease: "easeInOut"
              }}
              className={`w-2 h-2 rounded-full ${syncing ? 'bg-premium-gold' : 'bg-cinema-green'}`}
            />
            <span className="text-xs text-cinematic-text-muted">
              {syncing ? 'Syncing...' : 'Synced'}
            </span>
          </div>
        )}

        {/* Trust indicators - Hidden on mobile and tablet */}
        <div className="hidden xl:flex items-center space-x-1">
          <motion.div
            whileHover={{ 
              scale: 1.05,
              boxShadow: '0 0 15px rgba(34, 197, 94, 0.3)'
            }}
            className="flex items-center space-x-1 bg-cinematic-glass backdrop-blur-glass px-2 py-1 rounded-lg border border-cinema-green/20 transition-all duration-300 min-h-[28px]"
          >
            <Shield className="w-2 h-2 text-cinema-green" />
            <span className="text-xs text-cinematic-text-muted font-medium">Secure</span>
          </motion.div>
          
          <motion.div
            whileHover={{ 
              scale: 1.05,
              boxShadow: '0 0 15px rgba(34, 197, 94, 0.3)'
            }}
            className="flex items-center space-x-1 bg-cinematic-glass backdrop-blur-glass px-2 py-1 rounded-lg border border-cinema-green/20 transition-all duration-300 min-h-[28px]"
          >
            <Globe className="w-2 h-2 text-cinema-emerald" />
            <span className="text-xs text-cinematic-text-muted font-medium">Cloud</span>
          </motion.div>
        </div>

        {/* Notifications */}
        <div className="flex-shrink-0">
          <NotificationCenter />
        </div>

        {/* User Profile Dropdown */}
        <div className="relative flex-shrink-0">
          <motion.button
            whileHover={{ 
              scale: 1.05,
              boxShadow: '0 0 20px rgba(34, 197, 94, 0.4)'
            }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setShowUserMenu(!showUserMenu)}
            className="flex items-center justify-center space-x-1 sm:space-x-1.5 bg-cinematic-glass backdrop-blur-glass px-1.5 sm:px-2 py-1.5 rounded-lg border border-cinema-green/20 hover:border-cinema-green/40 transition-all duration-300 min-w-[32px] min-h-[32px] sm:min-w-[36px] sm:min-h-[36px]"
          >
            {/* User Avatar */}
            <div className="w-5 h-5 sm:w-6 sm:h-6 bg-premium-green rounded-lg flex items-center justify-center shadow-glow-green border border-cinema-green/30 flex-shrink-0">
              <span className="text-white font-bold text-xs">
                {displayAvatar}
              </span>
            </div>
            
            {/* User Name - Hidden on small screens */}
            <div className="hidden md:block text-left min-w-0">
              <p className="text-xs font-medium text-cinematic-text truncate max-w-[80px]">{displayName}</p>
              <div className="flex items-center space-x-1">
                <p className="text-xs text-cinematic-text-secondary">Finance</p>
                {isSupabaseConfigured() && (
                  <div className={`w-1.5 h-1.5 rounded-full ${syncing ? 'bg-premium-gold animate-pulse' : 'bg-cinema-green'}`} />
                )}
              </div>
            </div>
            
            {/* Dropdown Arrow */}
            <motion.div
              animate={{ rotate: showUserMenu ? 180 : 0 }}
              transition={{ duration: 0.2 }}
              className="hidden sm:block flex-shrink-0"
            >
              <ChevronDown className="w-3 h-3 text-cinematic-text-secondary" />
            </motion.div>
          </motion.button>
          
          {/* User Menu Dropdown */}
          <AnimatePresence>
            {showUserMenu && (
              <motion.div
                initial={{ opacity: 0, y: 8, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 8, scale: 0.95 }}
                className="absolute top-full right-0 mt-1 w-48 max-w-[90vw] bg-cinematic-surface/90 backdrop-blur-premium border border-cinematic-border rounded-xl shadow-premium z-50"
              >
                <div className="p-2.5">
                  {/* Profile Header */}
                  <div className="flex items-center space-x-2 mb-2.5 pb-2.5 border-b border-cinematic-border">
                    <div className="w-7 h-7 bg-premium-green rounded-xl flex items-center justify-center shadow-glow-green flex-shrink-0">
                      <span className="text-white font-bold text-sm">
                        {displayAvatar}
                      </span>
                    </div>
                    <div className="min-w-0 flex-1">
                      <h3 className="text-sm font-bold text-cinematic-text font-cinematic truncate">
                        {displayName}
                      </h3>
                      <p className="text-xs text-cinematic-text-secondary truncate">{user?.email}</p>
                      <div className="flex items-center space-x-1">
                        <p className="text-xs text-cinema-green">Active</p>
                        {isSupabaseConfigured() && (
                          <>
                            <span className="text-xs text-cinematic-text-muted">•</span>
                            <p className={`text-xs ${syncing ? 'text-premium-gold' : 'text-cinema-green'}`}>
                              {syncing ? 'Syncing' : 'Cloud'}
                            </p>
                          </>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Menu Items */}
                  <div className="space-y-1">
                    <motion.button
                      whileHover={{ scale: 1.01, x: 2 }}
                      whileTap={{ scale: 0.99 }}
                      onClick={handleProfileClick}
                      className="w-full flex items-center space-x-2 p-2 text-left hover:bg-cinematic-glass rounded-lg transition-all min-h-[32px]"
                    >
                      <div className="w-5 h-5 bg-premium-gold/10 rounded-lg flex items-center justify-center flex-shrink-0">
                        <Settings className="w-3 h-3 text-premium-gold" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="text-xs font-medium text-cinematic-text">Settings</p>
                        <p className="text-xs text-cinematic-text-secondary">Manage account</p>
                      </div>
                    </motion.button>

                    {/* Sync Data Button (only if Supabase configured) */}
                    {isSupabaseConfigured() && (
                      <motion.button
                        whileHover={{ scale: 1.01, x: 2 }}
                        whileTap={{ scale: 0.99 }}
                        onClick={handleSyncData}
                        disabled={syncing}
                        className="w-full flex items-center space-x-2 p-2 text-left hover:bg-cinematic-glass rounded-lg transition-all min-h-[32px] disabled:opacity-50"
                      >
                        <div className="w-5 h-5 bg-cinema-green/10 rounded-lg flex items-center justify-center flex-shrink-0">
                          {syncing ? (
                            <Loader2 className="w-3 h-3 text-cinema-green animate-spin" />
                          ) : (
                            <RefreshCw className="w-3 h-3 text-cinema-green" />
                          )}
                        </div>
                        <div className="min-w-0 flex-1">
                          <p className="text-xs font-medium text-cinematic-text">
                            {syncing ? 'Syncing...' : 'Sync Data'}
                          </p>
                          <p className="text-xs text-cinematic-text-secondary">Update from cloud</p>
                        </div>
                      </motion.button>
                    )}
                  </div>

                  {/* Logout Button */}
                  <div className="mt-2 pt-2 border-t border-cinematic-border">
                    <motion.button
                      whileHover={{ scale: 1.01, x: 2 }}
                      whileTap={{ scale: 0.99 }}
                      onClick={handleLogout}
                      className="w-full flex items-center space-x-2 p-2 text-left hover:bg-financial-negative/10 rounded-lg transition-all min-h-[32px]"
                    >
                      <div className="w-5 h-5 bg-financial-negative/10 rounded-lg flex items-center justify-center flex-shrink-0">
                        <LogOut className="w-3 h-3 text-financial-negative" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="text-xs font-medium text-financial-negative">Sign Out</p>
                        <p className="text-xs text-cinematic-text-secondary">See you later!</p>
                      </div>
                    </motion.button>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Overlay to close menu */}
          {showUserMenu && (
            <div
              className="fixed inset-0 z-40"
              onClick={() => setShowUserMenu(false)}
            />
          )}
        </div>
      </div>
    </motion.div>
  );
};