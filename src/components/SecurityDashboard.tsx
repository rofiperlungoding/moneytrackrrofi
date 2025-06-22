import React from 'react';
import { motion } from 'framer-motion';
import { Shield, Key, Clock, Download, AlertTriangle, CheckCircle } from 'lucide-react';
import { useSecurity } from '../contexts/SecurityContext';

export const SecurityDashboard: React.FC = () => {
  const {
    twoFactorEnabled,
    securityLogs,
    sessionTimeout,
    encryptionEnabled,
    toggleTwoFactor,
    setSessionTimeout,
    toggleEncryption,
    exportSecurityLogs
  } = useSecurity();

  const recentLogs = securityLogs.slice(0, 5);

  const getLogIcon = (type: string) => {
    switch (type) {
      case 'login':
        return CheckCircle;
      case 'failed_login':
        return AlertTriangle;
      case 'password_change':
        return Key;
      default:
        return Shield;
    }
  };

  const getLogColor = (type: string) => {
    switch (type) {
      case 'login':
        return 'text-cinema-green';
      case 'failed_login':
        return 'text-financial-negative';
      case 'password_change':
        return 'text-premium-gold';
      default:
        return 'text-cinema-emerald';
    }
  };

  return (
    <div className="space-y-6">
      {/* Security Status */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-cinematic-surface/60 backdrop-blur-premium border border-cinematic-border rounded-2xl p-4"
        >
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center space-x-2">
              <Key className="w-5 h-5 text-cinema-green" />
              <h3 className="font-bold text-cinematic-text">Two-Factor Auth</h3>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={twoFactorEnabled}
                onChange={toggleTwoFactor}
                className="sr-only peer"
              />
              <div className="w-9 h-5 bg-cinematic-border peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-cinema-green" />
            </label>
          </div>
          <p className="text-xs text-cinematic-text-secondary">
            {twoFactorEnabled ? 'Your account is protected with 2FA' : 'Enable for extra security'}
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-cinematic-surface/60 backdrop-blur-premium border border-cinematic-border rounded-2xl p-4"
        >
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center space-x-2">
              <Clock className="w-5 h-5 text-premium-gold" />
              <h3 className="font-bold text-cinematic-text">Session Timeout</h3>
            </div>
            <select
              value={sessionTimeout}
              onChange={(e) => setSessionTimeout(parseInt(e.target.value))}
              className="text-xs bg-cinematic-glass border border-cinematic-border rounded-lg px-2 py-1 text-cinematic-text"
            >
              <option value={15} className="bg-cinematic-surface text-cinematic-text">15 min</option>
              <option value={30} className="bg-cinematic-surface text-cinematic-text">30 min</option>
              <option value={60} className="bg-cinematic-surface text-cinematic-text">1 hour</option>
              <option value={120} className="bg-cinematic-surface text-cinematic-text">2 hours</option>
            </select>
          </div>
          <p className="text-xs text-cinematic-text-secondary">
            Auto-logout after {sessionTimeout} minutes of inactivity
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-cinematic-surface/60 backdrop-blur-premium border border-cinematic-border rounded-2xl p-4"
        >
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center space-x-2">
              <Shield className="w-5 h-5 text-cinema-emerald" />
              <h3 className="font-bold text-cinematic-text">Data Encryption</h3>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={encryptionEnabled}
                onChange={toggleEncryption}
                className="sr-only peer"
              />
              <div className="w-9 h-5 bg-cinematic-border peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-cinema-green" />
            </label>
          </div>
          <p className="text-xs text-cinematic-text-secondary">
            {encryptionEnabled ? 'Your data is encrypted at rest' : 'Enable data encryption'}
          </p>
        </motion.div>
      </div>

      {/* Security Logs */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="bg-cinematic-surface/60 backdrop-blur-premium border border-cinematic-border rounded-2xl p-6"
      >
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-bold text-cinematic-text">Recent Security Activity</h3>
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={exportSecurityLogs}
            className="flex items-center space-x-2 text-cinema-green hover:text-cinema-green-light transition-colors"
          >
            <Download className="w-4 h-4" />
            <span className="text-sm">Export</span>
          </motion.button>
        </div>

        <div className="space-y-3">
          {recentLogs.map((log, index) => {
            const IconComponent = getLogIcon(log.type);
            const color = getLogColor(log.type);
            
            return (
              <motion.div
                key={log.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.4 + index * 0.1 }}
                className="flex items-center space-x-3 p-3 bg-cinematic-glass rounded-xl"
              >
                <div className={`p-2 rounded-full bg-cinematic-surface ${color}`}>
                  <IconComponent className="w-4 h-4" />
                </div>
                <div className="flex-1">
                  <p className="text-sm font-medium text-cinematic-text">{log.details}</p>
                  <div className="flex items-center space-x-2 text-xs text-cinematic-text-secondary">
                    <span>{new Date(log.timestamp).toLocaleString()}</span>
                    {log.ipAddress && (
                      <>
                        <span>•</span>
                        <span>{log.ipAddress}</span>
                      </>
                    )}
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>
      </motion.div>
    </div>
  );
};