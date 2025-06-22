import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Bell, X, Check, AlertTriangle, Info, CheckCircle, Trash2, MailSearch as MarkEmailRead } from 'lucide-react';
import { useNotifications } from '../contexts/NotificationContext';

export const NotificationCenter: React.FC = () => {
  const {
    notifications,
    unreadCount,
    markAsRead,
    markAllAsRead,
    removeNotification,
    clearAllNotifications
  } = useNotifications();
  
  const [isOpen, setIsOpen] = useState(false);

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'success':
        return CheckCircle;
      case 'warning':
        return AlertTriangle;
      case 'error':
        return AlertTriangle;
      case 'info':
      default:
        return Info;
    }
  };

  const getNotificationColors = (type: string) => {
    switch (type) {
      case 'success':
        return 'text-cinema-green border-cinema-green/30 bg-cinema-green/10';
      case 'warning':
        return 'text-premium-gold border-premium-gold/30 bg-premium-gold/10';
      case 'error':
        return 'text-financial-negative border-financial-negative/30 bg-financial-negative/10';
      case 'info':
      default:
        return 'text-cinema-emerald border-cinema-emerald/30 bg-cinema-emerald/10';
    }
  };

  return (
    <div className="relative">
      <motion.button
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={() => setIsOpen(!isOpen)}
        className="relative flex items-center justify-center p-1.5 sm:p-2 bg-cinematic-glass backdrop-blur-glass rounded-lg border border-cinema-green/20 hover:border-cinema-green/40 transition-all duration-300 min-w-[32px] min-h-[32px] sm:min-w-[36px] sm:min-h-[36px]"
      >
        <Bell className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-cinema-green" />
        {unreadCount > 0 && (
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            className="absolute -top-0.5 -right-0.5 w-3.5 h-3.5 sm:w-4 sm:h-4 bg-financial-negative rounded-full flex items-center justify-center"
          >
            <span className="text-xs font-bold text-white">
              {unreadCount > 9 ? '9+' : unreadCount}
            </span>
          </motion.div>
        )}
      </motion.button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: -6, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -6, scale: 0.95 }}
            className="absolute top-full right-0 mt-1 w-72 max-w-[90vw] bg-cinematic-surface/95 backdrop-blur-premium border border-cinematic-border rounded-xl shadow-premium z-[60] max-h-80 overflow-hidden"
          >
            {/* Header */}
            <div className="p-2.5 border-b border-cinematic-border">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-bold text-cinematic-text">Notifications</h3>
                <div className="flex items-center space-x-1">
                  {unreadCount > 0 && (
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={markAllAsRead}
                      className="text-xs text-cinema-green hover:text-cinema-green-light transition-colors p-1"
                    >
                      <MarkEmailRead className="w-3 h-3" />
                    </motion.button>
                  )}
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => setIsOpen(false)}
                    className="text-cinematic-text-secondary hover:text-cinematic-text transition-colors p-1"
                  >
                    <X className="w-3 h-3" />
                  </motion.button>
                </div>
              </div>
              {unreadCount > 0 && (
                <p className="text-xs text-cinematic-text-secondary mt-0.5">
                  {unreadCount} unread
                </p>
              )}
            </div>

            {/* Notifications List */}
            <div className="max-h-60 overflow-y-auto">
              {notifications.length === 0 ? (
                <div className="p-4 text-center">
                  <Bell className="w-6 h-6 text-cinematic-text-secondary mx-auto mb-2" />
                  <p className="text-xs text-cinematic-text-secondary">No notifications</p>
                </div>
              ) : (
                <div className="divide-y divide-cinematic-border">
                  {notifications.map((notification, index) => {
                    const IconComponent = getNotificationIcon(notification.type);
                    const colors = getNotificationColors(notification.type);
                    
                    return (
                      <motion.div
                        key={notification.id}
                        initial={{ opacity: 0, x: 15 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: index * 0.03 }}
                        className={`p-2.5 hover:bg-cinematic-glass transition-all group ${
                          !notification.read ? 'border-l-2 border-cinema-green' : ''
                        }`}
                      >
                        <div className="flex items-start space-x-2">
                          <div className={`p-1 rounded-lg border ${colors} flex-shrink-0`}>
                            <IconComponent className="w-3 h-3" />
                          </div>
                          
                          <div className="flex-1 min-w-0">
                            <div className="flex items-start justify-between">
                              <div>
                                <h4 className={`text-xs font-bold ${!notification.read ? 'text-cinematic-text' : 'text-cinematic-text-secondary'}`}>
                                  {notification.title}
                                </h4>
                                <p className="text-xs text-cinematic-text-secondary mt-0.5">
                                  {notification.message}
                                </p>
                                <p className="text-xs text-cinematic-text-muted mt-1">
                                  {new Date(notification.timestamp).toLocaleString()}
                                </p>
                              </div>
                              
                              <div className="flex space-x-0.5 opacity-0 group-hover:opacity-100 transition-opacity ml-2">
                                {!notification.read && (
                                  <motion.button
                                    whileHover={{ scale: 1.1 }}
                                    whileTap={{ scale: 0.9 }}
                                    onClick={() => markAsRead(notification.id)}
                                    className="p-1 text-cinema-green hover:text-cinema-green-light transition-colors"
                                  >
                                    <Check className="w-2.5 h-2.5" />
                                  </motion.button>
                                )}
                                <motion.button
                                  whileHover={{ scale: 1.1 }}
                                  whileTap={{ scale: 0.9 }}
                                  onClick={() => removeNotification(notification.id)}
                                  className="p-1 text-financial-negative hover:text-financial-negative-light transition-colors"
                                >
                                  <Trash2 className="w-2.5 h-2.5" />
                                </motion.button>
                              </div>
                            </div>
                            
                            {notification.action && (
                              <motion.button
                                whileHover={{ scale: 1.01 }}
                                whileTap={{ scale: 0.99 }}
                                onClick={notification.action.onClick}
                                className="mt-2 text-xs text-cinema-green hover:text-cinema-green-light font-medium"
                              >
                                {notification.action.label}
                              </motion.button>
                            )}
                          </div>
                        </div>
                      </motion.div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Footer */}
            {notifications.length > 0 && (
              <div className="p-2 border-t border-cinematic-border">
                <motion.button
                  whileHover={{ scale: 1.01 }}
                  whileTap={{ scale: 0.99 }}
                  onClick={clearAllNotifications}
                  className="w-full text-xs text-financial-negative hover:text-financial-negative-light transition-colors"
                >
                  Clear All
                </motion.button>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 z-50"
          onClick={() => setIsOpen(false)}
        />
      )}
    </div>
  );
};