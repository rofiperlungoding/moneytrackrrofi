import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Home, 
  ShoppingCart, 
  Wallet, 
  Target, 
  Settings, 
  ChevronLeft, 
  ChevronRight,
  Sparkles,
  X,
  Menu
} from 'lucide-react';

interface SidebarProps {
  activeSection: string;
  onSectionChange: (section: string) => void;
}

const navigation = [
  { id: 'dashboard', label: 'Overview', icon: Home },
  { id: 'expenses', label: 'Expenses', icon: ShoppingCart },
  { id: 'income', label: 'Income', icon: Wallet },
  { id: 'goals', label: 'Goals', icon: Target },
  { id: 'settings', label: 'Settings', icon: Settings },
];

export const Sidebar: React.FC<SidebarProps> = ({ activeSection, onSectionChange }) => {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkMobile = () => {
      const mobile = window.innerWidth < 768;
      setIsMobile(mobile);
      if (mobile) {
        setIsCollapsed(true);
      }
    };

    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  const handleNavigation = (sectionId: string) => {
    onSectionChange(sectionId);
    if (isMobile) {
      setIsCollapsed(true);
    }
  };

  return (
    <>
      {/* Mobile Overlay */}
      <AnimatePresence>
        {isMobile && !isCollapsed && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 z-40 md:hidden backdrop-blur-sm"
            onClick={() => setIsCollapsed(true)}
          />
        )}
      </AnimatePresence>

      {/* Mobile Toggle Button - Bottom Left */}
      {isMobile && isCollapsed && (
        <motion.button
          initial={{ opacity: 0, scale: 0.8, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          onClick={() => setIsCollapsed(false)}
          className="fixed bottom-3 left-3 z-50 w-12 h-12 bg-cinematic-surface/90 backdrop-blur-premium rounded-xl shadow-premium border-2 border-cinema-green/30 flex items-center justify-center md:hidden"
          whileHover={{ 
            scale: 1.05,
            boxShadow: '0 0 25px rgba(34, 197, 94, 0.5)',
            borderColor: 'rgba(34, 197, 94, 0.6)'
          }}
          whileTap={{ scale: 0.95 }}
          style={{
            background: 'linear-gradient(135deg, rgba(34, 197, 94, 0.15) 0%, rgba(22, 67, 22, 0.9) 100%)',
          }}
        >
          {/* Background glow effect */}
          <div className="absolute inset-0 bg-gradient-to-br from-cinema-green/20 to-transparent rounded-xl" />
          
          {/* Icon with subtle animation */}
          <motion.div
            animate={{ 
              scale: [1, 1.1, 1],
              rotate: [0, 5, -5, 0] 
            }}
            transition={{ 
              duration: 2, 
              repeat: Infinity, 
              ease: "easeInOut" 
            }}
            className="relative z-10"
          >
            <Menu className="w-5 h-5 text-cinema-green" />
          </motion.div>
          
          {/* Subtle pulse effect */}
          <motion.div
            animate={{ 
              scale: [1, 1.3, 1],
              opacity: [0.5, 0.8, 0.5] 
            }}
            transition={{ 
              duration: 3, 
              repeat: Infinity, 
              ease: "easeInOut" 
            }}
            className="absolute inset-0 bg-cinema-green/20 rounded-xl blur-md"
          />
        </motion.button>
      )}

      {/* Sidebar */}
      <motion.div
        initial={{ width: isMobile ? 0 : 240 }}
        animate={{ 
          width: isCollapsed ? (isMobile ? 0 : 64) : (isMobile ? 240 : 240),
          x: isMobile && isCollapsed ? -240 : 0
        }}
        transition={{ duration: 0.3, ease: "easeInOut" }}
        className={`bg-cinematic-surface/90 backdrop-blur-premium border-r border-cinematic-border flex flex-col h-full z-50 relative ${
          isMobile ? 'fixed' : 'relative'
        }`}
        style={{
          background: 'linear-gradient(180deg, rgba(34, 197, 94, 0.08) 0%, rgba(22, 67, 22, 0.9) 100%)',
          boxShadow: '0 0 50px rgba(34, 197, 94, 0.1), inset 1px 0 0 rgba(34, 197, 94, 0.1)'
        }}
      >
        {/* Header */}
        <div className="px-3 py-3 border-b border-cinematic-border/50">
          <div className="flex items-center justify-between">
            <motion.div
              initial={{ opacity: 1 }}
              animate={{ opacity: isCollapsed ? 0 : 1 }}
              transition={{ duration: 0.2, delay: isCollapsed ? 0 : 0.2 }}
              className="flex items-center space-x-2"
            >
              {!isCollapsed && (
                <img 
                  src="/Money (2).png" 
                  alt="MoneyTrackr Logo" 
                  className="h-7 md:h-8 w-auto object-contain"
                />
              )}
            </motion.div>
            
            <div className="flex items-center space-x-1">
              {/* Close button for mobile */}
              {isMobile && !isCollapsed && (
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => setIsCollapsed(true)}
                  className="flex items-center justify-center w-7 h-7 p-0 rounded-lg transition-all duration-300 border border-financial-negative/20 hover:border-financial-negative/40 bg-financial-negative/10"
                >
                  <X className="w-3.5 h-3.5 text-financial-negative" />
                </motion.button>
              )}
              
              {/* Desktop toggle */}
              {!isMobile && (
                <motion.button
                  whileHover={{ 
                    scale: 1.05, 
                    backgroundColor: 'rgba(34, 197, 94, 0.1)',
                    boxShadow: '0 0 10px rgba(34, 197, 94, 0.3)'
                  }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => setIsCollapsed(!isCollapsed)}
                  className="flex items-center justify-center w-7 h-7 p-0 rounded-lg transition-all duration-300 border border-cinema-green/20 hover:border-cinema-green/40"
                >
                  {isCollapsed ? (
                    <ChevronRight className="w-3.5 h-3.5 text-cinema-green" />
                  ) : (
                    <ChevronLeft className="w-3.5 h-3.5 text-cinema-green" />
                  )}
                </motion.button>
              )}
            </div>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 px-2 py-3 overflow-y-auto">
          <div className="space-y-1.5">
            {navigation.map((item, index) => (
              <motion.button
                key={item.id}
                onClick={() => handleNavigation(item.id)}
                className={`w-full group relative transition-all duration-300 border backdrop-blur-glass ${
                  activeSection === item.id
                    ? 'bg-premium-green border-cinema-green/50 shadow-glow-green text-white'
                    : 'border-transparent hover:bg-cinematic-glass hover:border-cinema-green/30 text-cinematic-text-secondary hover:text-cinematic-text'
                } ${isCollapsed ? 'flex items-center justify-center w-12 h-12 mx-auto' : 'flex items-center'}`}
                style={{
                  borderRadius: '14px',
                  padding: isCollapsed ? '0' : '12px 16px',
                  minHeight: isMobile ? '40px' : '44px' // Smaller on mobile, touch-friendly on desktop
                }}
                whileHover={{ 
                  scale: 1.02,
                  boxShadow: activeSection === item.id 
                    ? '0 0 25px rgba(34, 197, 94, 0.4)' 
                    : '0 0 15px rgba(34, 197, 94, 0.2)'
                }}
                whileTap={{ scale: 0.98 }}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.3, delay: index * 0.05 }}
              >
                {isCollapsed ? (
                  <div className={`transition-all duration-300 ${
                    activeSection === item.id 
                      ? 'text-white scale-110' 
                      : 'text-cinema-green group-hover:text-cinema-green-light group-hover:scale-105'
                  }`}>
                    <item.icon className="w-4 h-4" strokeWidth={1.5} />
                  </div>
                ) : (
                  <div className="flex items-center space-x-2.5 w-full">
                    <div className={`relative transition-all duration-300 flex-shrink-0 ${
                      activeSection === item.id 
                        ? 'text-white scale-110' 
                        : 'text-cinema-green group-hover:text-cinema-green-light group-hover:scale-105'
                    }`}>
                      <item.icon className="w-4 h-4" strokeWidth={1.5} />
                    </div>
                    
                    <motion.span
                      initial={{ opacity: 1 }}
                      animate={{ opacity: isCollapsed ? 0 : 1 }}
                      transition={{ duration: 0.2, delay: isCollapsed ? 0 : 0.1 }}
                      className={`text-sm font-medium transition-all duration-300 ${
                        activeSection === item.id 
                          ? 'text-white font-semibold' 
                          : 'text-cinematic-text-secondary group-hover:text-cinematic-text'
                      }`}
                    >
                      {item.label}
                    </motion.span>
                  </div>
                )}

                {/* Active indicator */}
                {activeSection === item.id && (
                  <motion.div
                    layoutId="activeIndicator"
                    className="absolute inset-0 bg-premium-green rounded-2xl"
                    style={{ zIndex: -1 }}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ duration: 0.3 }}
                  />
                )}

                {/* Tooltip for collapsed state */}
                {isCollapsed && !isMobile && (
                  <div className="absolute left-full ml-2 px-2.5 py-1.5 bg-cinematic-surface border border-cinema-green/30 text-cinematic-text text-xs rounded-lg opacity-0 group-hover:opacity-100 transition-all duration-200 pointer-events-none whitespace-nowrap z-50 shadow-premium">
                    {item.label}
                    <div className="absolute left-0 top-1/2 transform -translate-x-1 -translate-y-1/2 w-1.5 h-1.5 bg-cinematic-surface border-l border-t border-cinema-green/30 rotate-45" />
                  </div>
                )}
              </motion.button>
            ))}
          </div>
        </nav>

        {/* Footer */}
        <div className="px-2 pb-3">
          <motion.div 
            whileHover={{ scale: 1.02, boxShadow: '0 0 20px rgba(34, 197, 94, 0.3)' }}
            className={`bg-gradient-to-r from-cinema-green/10 to-cinema-emerald/10 border border-cinema-green/20 rounded-xl transition-all duration-300 backdrop-blur-glass ${
              isCollapsed ? 'w-12 h-12 mx-auto flex items-center justify-center p-0' : 'p-3'
            }`}
          >
            {isCollapsed ? (
              <div className="w-6 h-6 bg-premium-green rounded-lg flex items-center justify-center shadow-glow-green">
                <span className="text-white text-xs font-bold">✓</span>
              </div>
            ) : (
              <div className="flex items-center space-x-2.5">
                <div className="w-6 h-6 bg-premium-green rounded-lg flex items-center justify-center shadow-glow-green flex-shrink-0">
                  <span className="text-white text-xs font-bold">✓</span>
                </div>
                <motion.div
                  initial={{ opacity: 1 }}
                  animate={{ opacity: isCollapsed ? 0 : 1 }}
                  transition={{ duration: 0.2 }}
                >
                  <p className="text-xs font-medium text-cinematic-text">All set!</p>
                  <p className="text-xs text-cinematic-text-muted">Keep tracking</p>
                </motion.div>
              </div>
            )}
          </motion.div>
        </div>
      </motion.div>
    </>
  );
};