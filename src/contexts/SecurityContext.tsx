import React, { createContext, useContext, useState, useEffect } from 'react';

interface SecurityLog {
  id: string;
  type: 'login' | 'logout' | 'failed_login' | 'password_change' | 'settings_change' | 'data_export';
  timestamp: string;
  details: string;
  ipAddress?: string;
  userAgent?: string;
}

interface SecurityContextType {
  twoFactorEnabled: boolean;
  securityLogs: SecurityLog[];
  sessionTimeout: number;
  encryptionEnabled: boolean;
  toggleTwoFactor: () => void;
  addSecurityLog: (log: Omit<SecurityLog, 'id' | 'timestamp'>) => void;
  setSessionTimeout: (minutes: number) => void;
  toggleEncryption: () => void;
  clearSecurityLogs: () => void;
  exportSecurityLogs: () => void;
  checkPasswordStrength: (password: string) => {
    score: number;
    feedback: string[];
  };
}

const SecurityContext = createContext<SecurityContextType | undefined>(undefined);

export const useSecurity = () => {
  const context = useContext(SecurityContext);
  if (!context) {
    throw new Error('useSecurity must be used within a SecurityProvider');
  }
  return context;
};

const initialLogs: SecurityLog[] = [
  {
    id: '1',
    type: 'login',
    timestamp: new Date().toISOString(),
    details: 'Successful login',
    ipAddress: '192.168.1.1',
    userAgent: 'Mozilla/5.0...'
  },
  {
    id: '2',
    type: 'settings_change',
    timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
    details: 'Currency preference updated to IDR',
    ipAddress: '192.168.1.1'
  }
];

export const SecurityProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [twoFactorEnabled, setTwoFactorEnabled] = useState(false);
  const [securityLogs, setSecurityLogs] = useState<SecurityLog[]>(initialLogs);
  const [sessionTimeout, setSessionTimeoutState] = useState(30); // minutes
  const [encryptionEnabled, setEncryptionEnabled] = useState(true);

  useEffect(() => {
    const saved = localStorage.getItem('security_settings');
    if (saved) {
      const settings = JSON.parse(saved);
      setTwoFactorEnabled(settings.twoFactorEnabled || false);
      setSessionTimeoutState(settings.sessionTimeout || 30);
      setEncryptionEnabled(settings.encryptionEnabled !== false);
    }
  }, []);

  useEffect(() => {
    const settings = {
      twoFactorEnabled,
      sessionTimeout,
      encryptionEnabled
    };
    localStorage.setItem('security_settings', JSON.stringify(settings));
  }, [twoFactorEnabled, sessionTimeout, encryptionEnabled]);

  useEffect(() => {
    localStorage.setItem('security_logs', JSON.stringify(securityLogs));
  }, [securityLogs]);

  const toggleTwoFactor = () => {
    setTwoFactorEnabled(!twoFactorEnabled);
    addSecurityLog({
      type: 'settings_change',
      details: `Two-factor authentication ${!twoFactorEnabled ? 'enabled' : 'disabled'}`
    });
  };

  const addSecurityLog = (log: Omit<SecurityLog, 'id' | 'timestamp'>) => {
    const newLog: SecurityLog = {
      ...log,
      id: Date.now().toString(),
      timestamp: new Date().toISOString()
    };
    setSecurityLogs(prev => [newLog, ...prev].slice(0, 100)); // Keep last 100 logs
  };

  const setSessionTimeout = (minutes: number) => {
    setSessionTimeoutState(minutes);
    addSecurityLog({
      type: 'settings_change',
      details: `Session timeout updated to ${minutes} minutes`
    });
  };

  const toggleEncryption = () => {
    setEncryptionEnabled(!encryptionEnabled);
    addSecurityLog({
      type: 'settings_change',
      details: `Data encryption ${!encryptionEnabled ? 'enabled' : 'disabled'}`
    });
  };

  const clearSecurityLogs = () => {
    setSecurityLogs([]);
    addSecurityLog({
      type: 'settings_change',
      details: 'Security logs cleared'
    });
  };

  const exportSecurityLogs = () => {
    const dataStr = JSON.stringify(securityLogs, null, 2);
    const dataUri = 'data:application/json;charset=utf-8,'+ encodeURIComponent(dataStr);
    
    const exportFileDefaultName = `security_logs_${new Date().toISOString().split('T')[0]}.json`;
    
    const linkElement = document.createElement('a');
    linkElement.setAttribute('href', dataUri);
    linkElement.setAttribute('download', exportFileDefaultName);
    linkElement.click();

    addSecurityLog({
      type: 'data_export',
      details: 'Security logs exported'
    });
  };

  const checkPasswordStrength = (password: string) => {
    let score = 0;
    const feedback: string[] = [];

    if (password.length >= 8) score += 1;
    else feedback.push('Use at least 8 characters');

    if (/[a-z]/.test(password)) score += 1;
    else feedback.push('Include lowercase letters');

    if (/[A-Z]/.test(password)) score += 1;
    else feedback.push('Include uppercase letters');

    if (/[0-9]/.test(password)) score += 1;
    else feedback.push('Include numbers');

    if (/[^a-zA-Z0-9]/.test(password)) score += 1;
    else feedback.push('Include special characters');

    return { score, feedback };
  };

  return (
    <SecurityContext.Provider value={{
      twoFactorEnabled,
      securityLogs,
      sessionTimeout,
      encryptionEnabled,
      toggleTwoFactor,
      addSecurityLog,
      setSessionTimeout,
      toggleEncryption,
      clearSecurityLogs,
      exportSecurityLogs,
      checkPasswordStrength
    }}>
      {children}
    </SecurityContext.Provider>
  );
};