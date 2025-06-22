import React, { createContext, useContext, useState, useEffect } from 'react';

interface PrivacySettings {
  cookieConsent: boolean;
  analyticsConsent: boolean;
  marketingConsent: boolean;
  dataProcessingConsent: boolean;
  thirdPartySharing: boolean;
  dataRetentionPeriod: number; // days
  autoDataDeletion: boolean;
}

interface DataRequest {
  id: string;
  type: 'export' | 'delete' | 'rectify';
  status: 'pending' | 'processing' | 'completed' | 'rejected';
  requestDate: string;
  completedDate?: string;
  details: string;
}

interface PrivacyContextType {
  settings: PrivacySettings;
  dataRequests: DataRequest[];
  updatePrivacySettings: (settings: Partial<PrivacySettings>) => void;
  requestDataExport: () => void;
  requestDataDeletion: (reason: string) => void;
  requestDataRectification: (details: string) => void;
  generatePrivacyReport: () => void;
  clearAllData: () => void;
  showCookieBanner: boolean;
  acceptAllCookies: () => void;
  rejectAllCookies: () => void;
  customizeCookies: (settings: Partial<PrivacySettings>) => void;
}

const PrivacyContext = createContext<PrivacyContextType | undefined>(undefined);

export const usePrivacy = () => {
  const context = useContext(PrivacyContext);
  if (!context) {
    throw new Error('usePrivacy must be used within a PrivacyProvider');
  }
  return context;
};

const defaultSettings: PrivacySettings = {
  cookieConsent: false,
  analyticsConsent: false,
  marketingConsent: false,
  dataProcessingConsent: true,
  thirdPartySharing: false,
  dataRetentionPeriod: 365,
  autoDataDeletion: false
};

export const PrivacyProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [settings, setSettings] = useState<PrivacySettings>(defaultSettings);
  const [dataRequests, setDataRequests] = useState<DataRequest[]>([]);
  const [showCookieBanner, setShowCookieBanner] = useState(true);

  useEffect(() => {
    const savedSettings = localStorage.getItem('privacy_settings');
    const savedRequests = localStorage.getItem('data_requests');
    const cookieConsentGiven = localStorage.getItem('cookie_consent_given');

    if (savedSettings) {
      setSettings(JSON.parse(savedSettings));
    }
    if (savedRequests) {
      setDataRequests(JSON.parse(savedRequests));
    }
    if (cookieConsentGiven) {
      setShowCookieBanner(false);
    }
  }, []);

  useEffect(() => {
    localStorage.setItem('privacy_settings', JSON.stringify(settings));
  }, [settings]);

  useEffect(() => {
    localStorage.setItem('data_requests', JSON.stringify(dataRequests));
  }, [dataRequests]);

  const updatePrivacySettings = (newSettings: Partial<PrivacySettings>) => {
    setSettings(prev => ({ ...prev, ...newSettings }));
  };

  const requestDataExport = () => {
    const request: DataRequest = {
      id: Date.now().toString(),
      type: 'export',
      status: 'pending',
      requestDate: new Date().toISOString(),
      details: 'User requested data export'
    };
    setDataRequests(prev => [request, ...prev]);

    // Simulate processing
    setTimeout(() => {
      setDataRequests(prev => 
        prev.map(r => r.id === request.id 
          ? { ...r, status: 'completed', completedDate: new Date().toISOString() }
          : r
        )
      );
      
      // Generate and download data export
      const userData = {
        transactions: JSON.parse(localStorage.getItem('finance_transactions') || '[]'),
        goals: JSON.parse(localStorage.getItem('finance_goals') || '[]'),
        settings: JSON.parse(localStorage.getItem('finance_settings') || '{}'),
        privacySettings: settings
      };
      
      const dataStr = JSON.stringify(userData, null, 2);
      const dataUri = 'data:application/json;charset=utf-8,'+ encodeURIComponent(dataStr);
      
      const linkElement = document.createElement('a');
      linkElement.setAttribute('href', dataUri);
      linkElement.setAttribute('download', `my_data_export_${new Date().toISOString().split('T')[0]}.json`);
      linkElement.click();
    }, 2000);
  };

  const requestDataDeletion = (reason: string) => {
    const request: DataRequest = {
      id: Date.now().toString(),
      type: 'delete',
      status: 'pending',
      requestDate: new Date().toISOString(),
      details: reason
    };
    setDataRequests(prev => [request, ...prev]);
  };

  const requestDataRectification = (details: string) => {
    const request: DataRequest = {
      id: Date.now().toString(),
      type: 'rectify',
      status: 'pending',
      requestDate: new Date().toISOString(),
      details
    };
    setDataRequests(prev => [request, ...prev]);
  };

  const generatePrivacyReport = () => {
    const report = {
      dataCollected: {
        transactions: 'Financial transaction data',
        goals: 'Financial goal information',
        settings: 'User preferences and settings'
      },
      dataUsage: {
        purpose: 'Personal finance tracking and management',
        sharing: settings.thirdPartySharing ? 'Limited third-party sharing enabled' : 'No third-party sharing',
        retention: `Data retained for ${settings.dataRetentionPeriod} days`
      },
      rights: {
        access: 'You can export your data at any time',
        rectification: 'You can request corrections to your data',
        erasure: 'You can request deletion of your data',
        portability: 'Your data is exportable in JSON format'
      },
      contact: 'privacy@moneytrackr.app'
    };

    const reportStr = JSON.stringify(report, null, 2);
    const dataUri = 'data:application/json;charset=utf-8,'+ encodeURIComponent(reportStr);
    
    const linkElement = document.createElement('a');
    linkElement.setAttribute('href', dataUri);
    linkElement.setAttribute('download', `privacy_report_${new Date().toISOString().split('T')[0]}.json`);
    linkElement.click();
  };

  const clearAllData = () => {
    localStorage.clear();
    setSettings(defaultSettings);
    setDataRequests([]);
    setShowCookieBanner(true);
  };

  const acceptAllCookies = () => {
    const newSettings = {
      ...settings,
      cookieConsent: true,
      analyticsConsent: true,
      marketingConsent: true
    };
    setSettings(newSettings);
    setShowCookieBanner(false);
    localStorage.setItem('cookie_consent_given', 'true');
  };

  const rejectAllCookies = () => {
    const newSettings = {
      ...settings,
      cookieConsent: false,
      analyticsConsent: false,
      marketingConsent: false
    };
    setSettings(newSettings);
    setShowCookieBanner(false);
    localStorage.setItem('cookie_consent_given', 'true');
  };

  const customizeCookies = (cookieSettings: Partial<PrivacySettings>) => {
    setSettings(prev => ({ ...prev, ...cookieSettings }));
    setShowCookieBanner(false);
    localStorage.setItem('cookie_consent_given', 'true');
  };

  return (
    <PrivacyContext.Provider value={{
      settings,
      dataRequests,
      updatePrivacySettings,
      requestDataExport,
      requestDataDeletion,
      requestDataRectification,
      generatePrivacyReport,
      clearAllData,
      showCookieBanner,
      acceptAllCookies,
      rejectAllCookies,
      customizeCookies
    }}>
      {children}
    </PrivacyContext.Provider>
  );
};