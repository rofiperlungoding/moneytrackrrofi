import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Sidebar } from './components/Sidebar';
import { TopBar } from './components/TopBar';
import { Dashboard } from './components/Dashboard';
import { ExpenseTracker } from './components/ExpenseTracker';
import { IncomeTracker } from './components/IncomeTracker';
import { Goals } from './components/Goals';
import { Settings } from './components/Settings';
import { QuickAddButton } from './components/QuickAddButton';
import { CookieBanner } from './components/CookieBanner';
import { ProfileSetup } from './components/ProfileSetup';
import { FinanceProvider } from './contexts/FinanceContext';
import { CurrencyProvider } from './contexts/CurrencyContext';
import { NotificationProvider } from './contexts/NotificationContext';
import { PrivacyProvider } from './contexts/PrivacyContext';
import { SecurityProvider } from './contexts/SecurityContext';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { AuthPage } from './components/AuthPage';

function AppContent() {
  const [activeSection, setActiveSection] = useState('dashboard');
  const { isLoggedIn, needsProfileSetup, loading } = useAuth();

  const renderMainContent = () => {
    switch (activeSection) {
      case 'dashboard':
        return <Dashboard onSectionChange={setActiveSection} />;
      case 'expenses':
        return <ExpenseTracker />;
      case 'income':
        return <IncomeTracker />;
      case 'goals':
        return <Goals />;
      case 'settings':
        return <Settings />;
      default:
        return <Dashboard onSectionChange={setActiveSection} />;
    }
  };

  // Show loading state
  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-cinematic-dark via-cinematic-base to-cinematic-surface text-cinematic-text font-editorial flex items-center justify-center">
        <div className="text-center">
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
            className="w-16 h-16 border-4 border-cinema-green/20 border-t-cinema-green rounded-full mx-auto mb-4"
          />
          <p className="text-lg text-cinematic-text-secondary">Loading MoneyTrackr...</p>
        </div>
      </div>
    );
  }

  // Show auth page if not logged in
  if (!isLoggedIn) {
    return <AuthPage />;
  }

  // Show profile setup if user needs to complete it
  if (needsProfileSetup) {
    return <ProfileSetup />;
  }

  // Show main application
  return (
    <div className="min-h-screen bg-gradient-to-br from-cinematic-dark via-cinematic-base to-cinematic-surface text-cinematic-text font-editorial">
      {/* Cinematic Background Effects */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        {/* Main gradient overlay */}
        <div className="absolute inset-0 bg-cinematic-radial opacity-60" />
        
        {/* Floating orbs */}
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
        
        <motion.div
          animate={{
            scale: [1, 1.3, 1],
            opacity: [0.1, 0.4, 0.1],
          }}
          transition={{
            duration: 5,
            repeat: Infinity,
            ease: "easeInOut",
            delay: 1
          }}
          className="absolute top-1/2 left-1/4 w-56 h-56 bg-cinema-green-light/10 rounded-full blur-3xl"
        />
        
        {/* Subtle grid pattern */}
        <div className="absolute inset-0 opacity-[0.02]" style={{
          backgroundImage: `radial-gradient(circle at 1px 1px, rgba(34, 197, 94, 0.5) 1px, transparent 0)`,
          backgroundSize: '40px 40px'
        }} />
      </div>

      <div className="flex h-screen relative z-10">
        {/* Sidebar */}
        <Sidebar activeSection={activeSection} onSectionChange={setActiveSection} />
        
        {/* Main Content */}
        <div className="flex-1 flex flex-col min-w-0">
          <TopBar onSectionChange={setActiveSection} />
          
          {/* Content Area */}
          <div className="flex-1 overflow-auto">
            <div className="p-6">
              <AnimatePresence mode="wait">
                <motion.div
                  key={activeSection}
                  initial={{ opacity: 0, y: 20, scale: 0.98 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: -20, scale: 0.98 }}
                  transition={{ 
                    duration: 0.5, 
                    ease: [0.25, 0.46, 0.45, 0.94],
                    type: "spring",
                    stiffness: 100
                  }}
                >
                  {renderMainContent()}
                </motion.div>
              </AnimatePresence>
            </div>
          </div>
        </div>
      </div>

      {/* Quick Add Button */}
      <QuickAddButton onSectionChange={setActiveSection} />

      {/* Cookie Banner */}
      <CookieBanner />
    </div>
  );
}

function App() {
  return (
    <AuthProvider>
      <SecurityProvider>
        <PrivacyProvider>
          <NotificationProvider>
            <CurrencyProvider>
              <FinanceProvider>
                <AppContent />
              </FinanceProvider>
            </CurrencyProvider>
          </NotificationProvider>
        </PrivacyProvider>
      </SecurityProvider>
    </AuthProvider>
  );
}

export default App;