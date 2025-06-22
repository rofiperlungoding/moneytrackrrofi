import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { supabase } from '../lib/supabase';
import { useAuth } from './AuthContext';

export interface DataSnapshot {
  id: string;
  userId: string;
  timestamp: string;
  version: number;
  operation: 'create' | 'update' | 'delete' | 'bulk_update';
  entityType: 'transaction' | 'goal' | 'settings' | 'full_backup';
  entityId?: string;
  previousData?: any;
  newData?: any;
  changeDescription: string;
  deviceInfo: {
    userAgent: string;
    platform: string;
    sessionId: string;
  };
  metadata: {
    size: number;
    checksum: string;
    syncStatus: 'pending' | 'synced' | 'failed';
  };
}

export interface CloudUser {
  id: string;
  email: string;
  storageQuota: number;
  storageUsed: number;
  lastSyncTime: string;
  deviceSessions: string[];
}

export interface DataRestorePoint {
  id: string;
  timestamp: string;
  description: string;
  dataSize: number;
  version: number;
  isAutoBackup: boolean;
}

interface CloudStorageContextType {
  isOnline: boolean;
  syncStatus: 'idle' | 'syncing' | 'error';
  lastSyncTime: string | null;
  storageUsed: number;
  storageQuota: number;
  dataHistory: DataSnapshot[];
  restorePoints: DataRestorePoint[];
  
  // Core functions
  syncToCloud: (data: any, operation: DataSnapshot['operation'], entityType: DataSnapshot['entityType'], entityId?: string, description?: string) => Promise<void>;
  forceSync: () => Promise<void>;
  
  // History and versioning
  getDataHistory: (filters?: HistoryFilter) => Promise<DataSnapshot[]>;
  restoreFromSnapshot: (snapshotId: string) => Promise<void>;
  createRestorePoint: (description: string) => Promise<void>;
  
  // Search and filtering
  searchHistory: (query: string) => DataSnapshot[];
  filterHistory: (filter: HistoryFilter) => DataSnapshot[];
  
  // Backup management
  createBackup: (description?: string) => Promise<string>;
  getBackups: () => Promise<DataRestorePoint[]>;
  restoreFromBackup: (backupId: string) => Promise<void>;
  deleteBackup: (backupId: string) => Promise<void>;
  
  // Storage management
  getStorageStats: () => Promise<{ used: number; quota: number; breakdown: any }>;
  cleanupOldVersions: (olderThanDays: number) => Promise<void>;
}

export interface HistoryFilter {
  startDate?: string;
  endDate?: string;
  entityType?: DataSnapshot['entityType'];
  operation?: DataSnapshot['operation'];
  entityId?: string;
  searchQuery?: string;
}

const CloudStorageContext = createContext<CloudStorageContextType | undefined>(undefined);

export const useCloudStorage = () => {
  const context = useContext(CloudStorageContext);
  if (!context) {
    throw new Error('useCloudStorage must be used within a CloudStorageProvider');
  }
  return context;
};

// Generate device fingerprint for session tracking
const generateDeviceFingerprint = (): string => {
  const canvas = document.createElement('canvas');
  const ctx = canvas.getContext('2d');
  ctx?.fillText('fingerprint', 2, 2);
  const canvasData = canvas.toDataURL();
  
  const fingerprint = {
    userAgent: navigator.userAgent,
    language: navigator.language,
    platform: navigator.platform,
    screen: `${screen.width}x${screen.height}`,
    timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
    canvas: canvasData.slice(-50), // Last 50 chars of canvas data
  };
  
  return btoa(JSON.stringify(fingerprint)).slice(0, 32);
};

// Generate checksum for data integrity
const generateChecksum = (data: any): string => {
  const str = JSON.stringify(data);
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash; // Convert to 32bit integer
  }
  return hash.toString(16);
};

export const CloudStorageProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user } = useAuth();
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [syncStatus, setSyncStatus] = useState<'idle' | 'syncing' | 'error'>('idle');
  const [lastSyncTime, setLastSyncTime] = useState<string | null>(null);
  const [storageUsed, setStorageUsed] = useState(0);
  const [storageQuota] = useState(100 * 1024 * 1024); // 100MB default quota
  const [dataHistory, setDataHistory] = useState<DataSnapshot[]>([]);
  const [restorePoints, setRestorePoints] = useState<DataRestorePoint[]>([]);
  const [sessionId] = useState(() => generateDeviceFingerprint());

  // Monitor online status
  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);
    
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  // Load data history on user change
  useEffect(() => {
    if (user) {
      loadDataHistory();
      loadRestorePoints();
      // Set up real-time subscription for data changes
      setupRealtimeSubscription();
    }
  }, [user]);

  // Auto-sync every 5 minutes
  useEffect(() => {
    if (!user || !isOnline) return;
    
    const interval = setInterval(() => {
      forceSync();
    }, 5 * 60 * 1000); // 5 minutes
    
    return () => clearInterval(interval);
  }, [user, isOnline]);

  // Create daily auto-backups
  useEffect(() => {
    if (!user) return;
    
    const checkAndCreateDailyBackup = async () => {
      const today = new Date().toDateString();
      const lastBackup = restorePoints
        .filter(rp => rp.isAutoBackup)
        .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())[0];
      
      if (!lastBackup || new Date(lastBackup.timestamp).toDateString() !== today) {
        await createBackup(`Auto-backup ${today}`);
      }
    };
    
    // Check daily at startup and every hour
    checkAndCreateDailyBackup();
    const interval = setInterval(checkAndCreateDailyBackup, 60 * 60 * 1000);
    
    return () => clearInterval(interval);
  }, [user, restorePoints]);

  const loadDataHistory = async () => {
    if (!user) return;
    
    try {
      const { data, error } = await supabase
        .from('data_snapshots')
        .select('*')
        .eq('userId', user.id)
        .order('timestamp', { ascending: false })
        .limit(100);
      
      if (error) {
        console.error('Error loading data history:', error);
        return;
      }
      
      setDataHistory(data || []);
    } catch (error) {
      console.error('Error loading data history:', error);
    }
  };

  const loadRestorePoints = async () => {
    if (!user) return;
    
    try {
      const { data, error } = await supabase
        .from('restore_points')
        .select('*')
        .eq('userId', user.id)
        .order('timestamp', { ascending: false });
      
      if (error) {
        console.error('Error loading restore points:', error);
        return;
      }
      
      setRestorePoints(data || []);
    } catch (error) {
      console.error('Error loading restore points:', error);
    }
  };

  const setupRealtimeSubscription = () => {
    if (!user) return;
    
    const subscription = supabase
      .channel(`user_${user.id}_data_changes`)
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'data_snapshots',
        filter: `userId=eq.${user.id}`
      }, (payload) => {
        console.log('Real-time data change:', payload);
        loadDataHistory(); // Refresh history when changes occur
      })
      .subscribe();
    
    return () => {
      subscription.unsubscribe();
    };
  };

  const syncToCloud = async (
    data: any,
    operation: DataSnapshot['operation'],
    entityType: DataSnapshot['entityType'],
    entityId?: string,
    description?: string
  ) => {
    if (!user || !isOnline) {
      // Queue for later sync
      queueOfflineOperation({ data, operation, entityType, entityId, description });
      return;
    }
    
    setSyncStatus('syncing');
    
    try {
      const snapshot: Omit<DataSnapshot, 'id'> = {
        userId: user.id,
        timestamp: new Date().toISOString(),
        version: Date.now(), // Use timestamp as version
        operation,
        entityType,
        entityId,
        previousData: operation === 'update' ? await getPreviousData(entityType, entityId) : null,
        newData: data,
        changeDescription: description || `${operation} ${entityType}${entityId ? ` (${entityId})` : ''}`,
        deviceInfo: {
          userAgent: navigator.userAgent,
          platform: navigator.platform,
          sessionId,
        },
        metadata: {
          size: JSON.stringify(data).length,
          checksum: generateChecksum(data),
          syncStatus: 'synced',
        },
      };
      
      const { error } = await supabase
        .from('data_snapshots')
        .insert([snapshot]);
      
      if (error) {
        throw error;
      }
      
      // Update storage stats
      await updateStorageStats();
      
      setLastSyncTime(new Date().toISOString());
      setSyncStatus('idle');
      
      // Refresh history
      await loadDataHistory();
      
    } catch (error) {
      console.error('Sync error:', error);
      setSyncStatus('error');
      throw error;
    }
  };

  const forceSync = async () => {
    if (!user || !isOnline) return;
    
    try {
      // Sync all local data to cloud
      const localData = {
        transactions: JSON.parse(localStorage.getItem('finance_transactions') || '[]'),
        goals: JSON.parse(localStorage.getItem('finance_goals') || '[]'),
        settings: JSON.parse(localStorage.getItem('finance_settings') || '{}'),
      };
      
      await syncToCloud(localData, 'bulk_update', 'full_backup', undefined, 'Full sync');
      
    } catch (error) {
      console.error('Force sync error:', error);
    }
  };

  const getPreviousData = async (entityType: string, entityId?: string) => {
    if (!user || !entityId) return null;
    
    try {
      const { data } = await supabase
        .from('data_snapshots')
        .select('newData')
        .eq('userId', user.id)
        .eq('entityType', entityType)
        .eq('entityId', entityId)
        .order('timestamp', { ascending: false })
        .limit(1);
      
      return data?.[0]?.newData || null;
    } catch (error) {
      console.error('Error getting previous data:', error);
      return null;
    }
  };

  const queueOfflineOperation = (operation: any) => {
    const offlineQueue = JSON.parse(localStorage.getItem('offline_sync_queue') || '[]');
    offlineQueue.push({
      ...operation,
      queuedAt: new Date().toISOString(),
    });
    localStorage.setItem('offline_sync_queue', JSON.stringify(offlineQueue));
  };

  const getDataHistory = async (filters?: HistoryFilter): Promise<DataSnapshot[]> => {
    if (!user) return [];
    
    try {
      let query = supabase
        .from('data_snapshots')
        .select('*')
        .eq('userId', user.id);
      
      if (filters?.startDate) {
        query = query.gte('timestamp', filters.startDate);
      }
      if (filters?.endDate) {
        query = query.lte('timestamp', filters.endDate);
      }
      if (filters?.entityType) {
        query = query.eq('entityType', filters.entityType);
      }
      if (filters?.operation) {
        query = query.eq('operation', filters.operation);
      }
      if (filters?.entityId) {
        query = query.eq('entityId', filters.entityId);
      }
      
      const { data, error } = await query
        .order('timestamp', { ascending: false })
        .limit(1000);
      
      if (error) throw error;
      
      let results = data || [];
      
      // Apply search filter if provided
      if (filters?.searchQuery) {
        const searchLower = filters.searchQuery.toLowerCase();
        results = results.filter(snapshot => 
          snapshot.changeDescription.toLowerCase().includes(searchLower) ||
          JSON.stringify(snapshot.newData).toLowerCase().includes(searchLower)
        );
      }
      
      return results;
    } catch (error) {
      console.error('Error getting data history:', error);
      return [];
    }
  };

  const restoreFromSnapshot = async (snapshotId: string) => {
    if (!user) return;
    
    try {
      const { data, error } = await supabase
        .from('data_snapshots')
        .select('*')
        .eq('id', snapshotId)
        .eq('userId', user.id)
        .single();
      
      if (error || !data) throw error || new Error('Snapshot not found');
      
      // Restore data to local storage
      if (data.entityType === 'full_backup') {
        const backupData = data.newData;
        if (backupData.transactions) {
          localStorage.setItem('finance_transactions', JSON.stringify(backupData.transactions));
        }
        if (backupData.goals) {
          localStorage.setItem('finance_goals', JSON.stringify(backupData.goals));
        }
        if (backupData.settings) {
          localStorage.setItem('finance_settings', JSON.stringify(backupData.settings));
        }
      } else {
        // Restore individual entity
        const storageKey = `finance_${data.entityType}s`;
        const currentData = JSON.parse(localStorage.getItem(storageKey) || '[]');
        
        if (data.operation === 'delete') {
          // Remove the item
          const filtered = currentData.filter((item: any) => item.id !== data.entityId);
          localStorage.setItem(storageKey, JSON.stringify(filtered));
        } else {
          // Update or add the item
          const index = currentData.findIndex((item: any) => item.id === data.entityId);
          if (index >= 0) {
            currentData[index] = data.newData;
          } else {
            currentData.push(data.newData);
          }
          localStorage.setItem(storageKey, JSON.stringify(currentData));
        }
      }
      
      // Create a restore snapshot
      await syncToCloud(
        { restoredFrom: snapshotId, timestamp: data.timestamp },
        'update',
        'full_backup',
        undefined,
        `Restored from snapshot: ${data.changeDescription}`
      );
      
      // Reload the page to reflect changes
      window.location.reload();
      
    } catch (error) {
      console.error('Error restoring from snapshot:', error);
      throw error;
    }
  };

  const createRestorePoint = async (description: string) => {
    if (!user) return;
    
    try {
      const currentData = {
        transactions: JSON.parse(localStorage.getItem('finance_transactions') || '[]'),
        goals: JSON.parse(localStorage.getItem('finance_goals') || '[]'),
        settings: JSON.parse(localStorage.getItem('finance_settings') || '{}'),
      };
      
      const restorePoint: Omit<DataRestorePoint, 'id'> = {
        timestamp: new Date().toISOString(),
        description,
        dataSize: JSON.stringify(currentData).length,
        version: Date.now(),
        isAutoBackup: false,
      };
      
      const { data, error } = await supabase
        .from('restore_points')
        .insert([{ ...restorePoint, userId: user.id, data: currentData }])
        .select()
        .single();
      
      if (error) throw error;
      
      await loadRestorePoints();
      
    } catch (error) {
      console.error('Error creating restore point:', error);
      throw error;
    }
  };

  const searchHistory = (query: string): DataSnapshot[] => {
    const searchLower = query.toLowerCase();
    return dataHistory.filter(snapshot => 
      snapshot.changeDescription.toLowerCase().includes(searchLower) ||
      JSON.stringify(snapshot.newData).toLowerCase().includes(searchLower) ||
      snapshot.entityType.toLowerCase().includes(searchLower)
    );
  };

  const filterHistory = (filter: HistoryFilter): DataSnapshot[] => {
    return dataHistory.filter(snapshot => {
      if (filter.startDate && snapshot.timestamp < filter.startDate) return false;
      if (filter.endDate && snapshot.timestamp > filter.endDate) return false;
      if (filter.entityType && snapshot.entityType !== filter.entityType) return false;
      if (filter.operation && snapshot.operation !== filter.operation) return false;
      if (filter.entityId && snapshot.entityId !== filter.entityId) return false;
      
      if (filter.searchQuery) {
        const searchLower = filter.searchQuery.toLowerCase();
        const matchesSearch = 
          snapshot.changeDescription.toLowerCase().includes(searchLower) ||
          JSON.stringify(snapshot.newData).toLowerCase().includes(searchLower);
        if (!matchesSearch) return false;
      }
      
      return true;
    });
  };

  const createBackup = async (description?: string): Promise<string> => {
    if (!user) throw new Error('User not authenticated');
    
    try {
      const currentData = {
        transactions: JSON.parse(localStorage.getItem('finance_transactions') || '[]'),
        goals: JSON.parse(localStorage.getItem('finance_goals') || '[]'),
        settings: JSON.parse(localStorage.getItem('finance_settings') || '{}'),
      };
      
      const backupDescription = description || `Backup ${new Date().toLocaleString()}`;
      
      const { data, error } = await supabase
        .from('restore_points')
        .insert([{
          userId: user.id,
          timestamp: new Date().toISOString(),
          description: backupDescription,
          dataSize: JSON.stringify(currentData).length,
          version: Date.now(),
          isAutoBackup: !description, // Auto-backup if no description provided
          data: currentData,
        }])
        .select()
        .single();
      
      if (error) throw error;
      
      await loadRestorePoints();
      return data.id;
      
    } catch (error) {
      console.error('Error creating backup:', error);
      throw error;
    }
  };

  const getBackups = async (): Promise<DataRestorePoint[]> => {
    return restorePoints;
  };

  const restoreFromBackup = async (backupId: string) => {
    if (!user) return;
    
    try {
      const { data, error } = await supabase
        .from('restore_points')
        .select('*')
        .eq('id', backupId)
        .eq('userId', user.id)
        .single();
      
      if (error || !data) throw error || new Error('Backup not found');
      
      const backupData = data.data;
      
      // Restore all data
      if (backupData.transactions) {
        localStorage.setItem('finance_transactions', JSON.stringify(backupData.transactions));
      }
      if (backupData.goals) {
        localStorage.setItem('finance_goals', JSON.stringify(backupData.goals));
      }
      if (backupData.settings) {
        localStorage.setItem('finance_settings', JSON.stringify(backupData.settings));
      }
      
      // Create a restore snapshot
      await syncToCloud(
        { restoredFromBackup: backupId, timestamp: data.timestamp },
        'update',
        'full_backup',
        undefined,
        `Restored from backup: ${data.description}`
      );
      
      // Reload the page to reflect changes
      window.location.reload();
      
    } catch (error) {
      console.error('Error restoring from backup:', error);
      throw error;
    }
  };

  const deleteBackup = async (backupId: string) => {
    if (!user) return;
    
    try {
      const { error } = await supabase
        .from('restore_points')
        .delete()
        .eq('id', backupId)
        .eq('userId', user.id);
      
      if (error) throw error;
      
      await loadRestorePoints();
      
    } catch (error) {
      console.error('Error deleting backup:', error);
      throw error;
    }
  };

  const getStorageStats = async () => {
    if (!user) return { used: 0, quota: storageQuota, breakdown: {} };
    
    try {
      const { data, error } = await supabase
        .from('data_snapshots')
        .select('metadata')
        .eq('userId', user.id);
      
      if (error) throw error;
      
      const used = data?.reduce((total, snapshot) => total + (snapshot.metadata?.size || 0), 0) || 0;
      
      // Calculate breakdown by entity type
      const breakdown = data?.reduce((acc, snapshot) => {
        if (!acc[snapshot.entityType]) acc[snapshot.entityType] = 0;
        acc[snapshot.entityType] += snapshot.metadata?.size || 0;
        return acc;
      }, {} as any) || {};
      
      setStorageUsed(used);
      
      return { used, quota: storageQuota, breakdown };
    } catch (error) {
      console.error('Error getting storage stats:', error);
      return { used: 0, quota: storageQuota, breakdown: {} };
    }
  };

  const updateStorageStats = async () => {
    await getStorageStats();
  };

  const cleanupOldVersions = async (olderThanDays: number) => {
    if (!user) return;
    
    try {
      const cutoffDate = new Date();
      cutoffDate.setDate(cutoffDate.getDate() - olderThanDays);
      
      const { error } = await supabase
        .from('data_snapshots')
        .delete()
        .eq('userId', user.id)
        .lt('timestamp', cutoffDate.toISOString())
        .neq('entityType', 'full_backup'); // Keep full backups
      
      if (error) throw error;
      
      await loadDataHistory();
      await updateStorageStats();
      
    } catch (error) {
      console.error('Error cleaning up old versions:', error);
      throw error;
    }
  };

  return (
    <CloudStorageContext.Provider value={{
      isOnline,
      syncStatus,
      lastSyncTime,
      storageUsed,
      storageQuota,
      dataHistory,
      restorePoints,
      syncToCloud,
      forceSync,
      getDataHistory,
      restoreFromSnapshot,
      createRestorePoint,
      searchHistory,
      filterHistory,
      createBackup,
      getBackups,
      restoreFromBackup,
      deleteBackup,
      getStorageStats,
      cleanupOldVersions,
    }}>
      {children}
    </CloudStorageContext.Provider>
  );
};