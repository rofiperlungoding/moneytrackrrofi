import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  History, 
  Search, 
  Filter, 
  Download, 
  Trash2, 
  RotateCcw, 
  Calendar, 
  Database, 
  Clock,
  FileText,
  Layers,
  Shield,
  HardDrive,
  ChevronDown,
  RefreshCw,
  AlertTriangle,
  CheckCircle,
  X,
  Loader2
} from 'lucide-react';
import { useCloudStorage, DataSnapshot, HistoryFilter } from '../contexts/CloudStorageContext';
import { CountUp } from './CountUp';

export const DataHistoryManager: React.FC = () => {
  const {
    dataHistory,
    restorePoints,
    syncStatus,
    lastSyncTime,
    storageUsed,
    storageQuota,
    getDataHistory,
    restoreFromSnapshot,
    createRestorePoint,
    searchHistory,
    filterHistory,
    createBackup,
    restoreFromBackup,
    deleteBackup,
    getStorageStats,
    cleanupOldVersions,
    forceSync
  } = useCloudStorage();

  const [searchQuery, setSearchQuery] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const [selectedFilter, setSelectedFilter] = useState<HistoryFilter>({});
  const [filteredHistory, setFilteredHistory] = useState<DataSnapshot[]>([]);
  const [selectedSnapshots, setSelectedSnapshots] = useState<string[]>([]);
  const [showRestoreConfirm, setShowRestoreConfirm] = useState<string | null>(null);
  const [showBackupDialog, setShowBackupDialog] = useState(false);
  const [backupDescription, setBackupDescription] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [storageStats, setStorageStats] = useState<any>({});

  useEffect(() => {
    loadStorageStats();
  }, []);

  useEffect(() => {
    applyFilters();
  }, [dataHistory, searchQuery, selectedFilter]);

  const loadStorageStats = async () => {
    try {
      const stats = await getStorageStats();
      setStorageStats(stats);
    } catch (error) {
      console.error('Error loading storage stats:', error);
    }
  };

  const applyFilters = () => {
    let results = dataHistory;
    
    if (searchQuery) {
      results = searchHistory(searchQuery);
    }
    
    if (Object.keys(selectedFilter).length > 0) {
      results = filterHistory(selectedFilter);
    }
    
    setFilteredHistory(results);
  };

  const handleRestore = async (snapshotId: string) => {
    setIsLoading(true);
    try {
      await restoreFromSnapshot(snapshotId);
    } catch (error) {
      console.error('Error restoring snapshot:', error);
    } finally {
      setIsLoading(false);
      setShowRestoreConfirm(null);
    }
  };

  const handleCreateBackup = async () => {
    setIsLoading(true);
    try {
      await createBackup(backupDescription || undefined);
      setShowBackupDialog(false);
      setBackupDescription('');
    } catch (error) {
      console.error('Error creating backup:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleBulkRestore = async () => {
    if (selectedSnapshots.length !== 1) return;
    await handleRestore(selectedSnapshots[0]);
    setSelectedSnapshots([]);
  };

  const formatEntityType = (entityType: string) => {
    return entityType.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
  };

  const getOperationIcon = (operation: string) => {
    switch (operation) {
      case 'create': return <FileText className="w-3 h-3 text-cinema-green" />;
      case 'update': return <RefreshCw className="w-3 h-3 text-premium-gold" />;
      case 'delete': return <Trash2 className="w-3 h-3 text-financial-negative" />;
      case 'bulk_update': return <Layers className="w-3 h-3 text-cinema-emerald" />;
      default: return <Database className="w-3 h-3 text-cinematic-text-secondary" />;
    }
  };

  const getOperationColor = (operation: string) => {
    switch (operation) {
      case 'create': return 'bg-cinema-green/10 border-cinema-green/30 text-cinema-green';
      case 'update': return 'bg-premium-gold/10 border-premium-gold/30 text-premium-gold';
      case 'delete': return 'bg-financial-negative/10 border-financial-negative/30 text-financial-negative';
      case 'bulk_update': return 'bg-cinema-emerald/10 border-cinema-emerald/30 text-cinema-emerald';
      default: return 'bg-cinematic-text-muted/10 border-cinematic-text-muted/30 text-cinematic-text-muted';
    }
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const storagePercentage = (storageUsed / storageQuota) * 100;

  return (
    <div className="space-y-6">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-center justify-between"
      >
        <div>
          <h1 className="text-3xl font-bold text-cinematic-text font-cinematic">Data History</h1>
          <p className="text-cinematic-text-secondary mt-1">Manage your data versions and backups</p>
        </div>
        
        <div className="flex items-center space-x-3">
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={forceSync}
            disabled={syncStatus === 'syncing'}
            className="flex items-center space-x-2 bg-cinema-green/10 text-cinema-green px-4 py-2 rounded-xl border border-cinema-green/30 hover:bg-cinema-green/20 transition-all disabled:opacity-50"
          >
            {syncStatus === 'syncing' ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <RefreshCw className="w-4 h-4" />
            )}
            <span>Sync Now</span>
          </motion.button>
          
          <motion.button
            whileHover={{ scale: 1.02, boxShadow: '0 0 20px rgba(34, 197, 94, 0.4)' }}
            whileTap={{ scale: 0.98 }}
            onClick={() => setShowBackupDialog(true)}
            className="flex items-center space-x-2 bg-premium-green text-white px-4 py-2 rounded-xl font-medium hover:shadow-glow-green transition-all"
          >
            <Download className="w-4 h-4" />
            <span>Create Backup</span>
          </motion.button>
        </div>
      </motion.div>

      {/* Storage Stats */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="grid grid-cols-1 md:grid-cols-4 gap-4"
      >
        <div className="bg-cinematic-surface/60 backdrop-blur-premium border border-cinematic-border rounded-2xl p-4">
          <div className="flex items-center space-x-2 mb-2">
            <HardDrive className="w-4 h-4 text-cinema-green" />
            <h3 className="text-sm font-bold text-cinematic-text">Storage Used</h3>
          </div>
          <div className="text-xl font-bold text-cinema-green">
            <CountUp to={storagePercentage} suffix="%" decimals={1} duration={1} />
          </div>
          <p className="text-xs text-cinematic-text-secondary">
            {formatFileSize(storageUsed)} of {formatFileSize(storageQuota)}
          </p>
          <div className="w-full bg-cinematic-border rounded-full h-2 mt-2">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${Math.min(storagePercentage, 100)}%` }}
              className={`h-2 rounded-full ${
                storagePercentage > 90 ? 'bg-financial-negative' : 
                storagePercentage > 70 ? 'bg-premium-gold' : 'bg-cinema-green'
              }`}
            />
          </div>
        </div>

        <div className="bg-cinematic-surface/60 backdrop-blur-premium border border-cinematic-border rounded-2xl p-4">
          <div className="flex items-center space-x-2 mb-2">
            <History className="w-4 h-4 text-premium-gold" />
            <h3 className="text-sm font-bold text-cinematic-text">Data Versions</h3>
          </div>
          <div className="text-xl font-bold text-premium-gold">
            <CountUp to={dataHistory.length} duration={1} delay={0.2} />
          </div>
          <p className="text-xs text-cinematic-text-secondary">Total snapshots</p>
        </div>

        <div className="bg-cinematic-surface/60 backdrop-blur-premium border border-cinematic-border rounded-2xl p-4">
          <div className="flex items-center space-x-2 mb-2">
            <Shield className="w-4 h-4 text-cinema-emerald" />
            <h3 className="text-sm font-bold text-cinematic-text">Backups</h3>
          </div>
          <div className="text-xl font-bold text-cinema-emerald">
            <CountUp to={restorePoints.length} duration={1} delay={0.3} />
          </div>
          <p className="text-xs text-cinematic-text-secondary">Restore points</p>
        </div>

        <div className="bg-cinematic-surface/60 backdrop-blur-premium border border-cinematic-border rounded-2xl p-4">
          <div className="flex items-center space-x-2 mb-2">
            <Clock className="w-4 h-4 text-premium-copper" />
            <h3 className="text-sm font-bold text-cinematic-text">Last Sync</h3>
          </div>
          <div className="text-xl font-bold text-premium-copper">
            {lastSyncTime ? new Date(lastSyncTime).toLocaleTimeString() : 'Never'}
          </div>
          <p className="text-xs text-cinematic-text-secondary">
            {syncStatus === 'syncing' ? 'Syncing...' : 
             syncStatus === 'error' ? 'Sync failed' : 'Up to date'}
          </p>
        </div>
      </motion.div>

      {/* Search and Filters */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="bg-cinematic-surface/60 backdrop-blur-premium border border-cinematic-border rounded-2xl p-4"
      >
        <div className="flex items-center space-x-4 mb-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-cinematic-text-secondary" />
            <input
              type="text"
              placeholder="Search data history..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-cinematic-glass border border-cinematic-border rounded-lg text-cinematic-text placeholder-cinematic-text-muted focus:outline-none focus:border-cinema-green/50 transition-colors"
            />
          </div>
          
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => setShowFilters(!showFilters)}
            className="flex items-center space-x-2 bg-cinematic-glass border border-cinematic-border px-3 py-2 rounded-lg hover:border-cinema-green/30 transition-all"
          >
            <Filter className="w-4 h-4" />
            <span>Filters</span>
            <motion.div
              animate={{ rotate: showFilters ? 180 : 0 }}
              transition={{ duration: 0.2 }}
            >
              <ChevronDown className="w-4 h-4" />
            </motion.div>
          </motion.button>
        </div>

        <AnimatePresence>
          {showFilters && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="grid grid-cols-2 md:grid-cols-4 gap-3 pt-4 border-t border-cinematic-border"
            >
              <select
                value={selectedFilter.entityType || ''}
                onChange={(e) => setSelectedFilter({ ...selectedFilter, entityType: e.target.value as any })}
                className="bg-cinematic-glass border border-cinematic-border rounded-lg px-3 py-2 text-cinematic-text"
              >
                <option value="">All Types</option>
                <option value="transaction">Transactions</option>
                <option value="goal">Goals</option>
                <option value="settings">Settings</option>
                <option value="full_backup">Full Backups</option>
              </select>

              <select
                value={selectedFilter.operation || ''}
                onChange={(e) => setSelectedFilter({ ...selectedFilter, operation: e.target.value as any })}
                className="bg-cinematic-glass border border-cinematic-border rounded-lg px-3 py-2 text-cinematic-text"
              >
                <option value="">All Operations</option>
                <option value="create">Create</option>
                <option value="update">Update</option>
                <option value="delete">Delete</option>
                <option value="bulk_update">Bulk Update</option>
              </select>

              <input
                type="date"
                value={selectedFilter.startDate || ''}
                onChange={(e) => setSelectedFilter({ ...selectedFilter, startDate: e.target.value })}
                className="bg-cinematic-glass border border-cinematic-border rounded-lg px-3 py-2 text-cinematic-text"
                placeholder="Start Date"
              />

              <input
                type="date"
                value={selectedFilter.endDate || ''}
                onChange={(e) => setSelectedFilter({ ...selectedFilter, endDate: e.target.value })}
                className="bg-cinematic-glass border border-cinematic-border rounded-lg px-3 py-2 text-cinematic-text"
                placeholder="End Date"
              />
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>

      {/* Action Bar */}
      {selectedSnapshots.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-cinema-green/10 backdrop-blur-glass border border-cinema-green/30 rounded-xl p-4"
        >
          <div className="flex items-center justify-between">
            <span className="text-cinema-green font-medium">
              {selectedSnapshots.length} snapshot(s) selected
            </span>
            <div className="flex items-center space-x-2">
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={handleBulkRestore}
                disabled={selectedSnapshots.length !== 1 || isLoading}
                className="flex items-center space-x-2 bg-cinema-green text-white px-3 py-1.5 rounded-lg font-medium disabled:opacity-50 transition-all"
              >
                <RotateCcw className="w-4 h-4" />
                <span>Restore</span>
              </motion.button>
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => setSelectedSnapshots([])}
                className="text-cinematic-text-secondary hover:text-cinematic-text transition-colors"
              >
                <X className="w-4 h-4" />
              </motion.button>
            </div>
          </div>
        </motion.div>
      )}

      {/* Data History List */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="bg-cinematic-surface/60 backdrop-blur-premium border border-cinematic-border rounded-2xl"
      >
        <div className="p-4 border-b border-cinematic-border">
          <h3 className="text-lg font-bold text-cinematic-text">Version History</h3>
          <p className="text-sm text-cinematic-text-secondary">
            {filteredHistory.length} of {dataHistory.length} versions
          </p>
        </div>

        <div className="divide-y divide-cinematic-border max-h-96 overflow-y-auto">
          {filteredHistory.map((snapshot, index) => (
            <motion.div
              key={snapshot.id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.05 }}
              className="p-4 hover:bg-cinematic-glass transition-all group"
            >
              <div className="flex items-center space-x-3">
                <input
                  type="checkbox"
                  checked={selectedSnapshots.includes(snapshot.id)}
                  onChange={(e) => {
                    if (e.target.checked) {
                      setSelectedSnapshots([...selectedSnapshots, snapshot.id]);
                    } else {
                      setSelectedSnapshots(selectedSnapshots.filter(id => id !== snapshot.id));
                    }
                  }}
                  className="w-4 h-4 text-cinema-green bg-cinematic-glass border-cinematic-border rounded focus:ring-cinema-green"
                />

                <div className="flex-1 min-w-0">
                  <div className="flex items-center space-x-2 mb-1">
                    {getOperationIcon(snapshot.operation)}
                    <span className={`px-2 py-0.5 rounded-full text-xs font-medium border ${getOperationColor(snapshot.operation)}`}>
                      {snapshot.operation}
                    </span>
                    <span className="text-xs text-cinematic-text-secondary">
                      {formatEntityType(snapshot.entityType)}
                    </span>
                    {snapshot.entityId && (
                      <span className="text-xs text-cinematic-text-muted">
                        ID: {snapshot.entityId.slice(0, 8)}
                      </span>
                    )}
                  </div>

                  <p className="text-sm text-cinematic-text font-medium mb-1">
                    {snapshot.changeDescription}
                  </p>

                  <div className="flex items-center space-x-4 text-xs text-cinematic-text-secondary">
                    <span>{new Date(snapshot.timestamp).toLocaleString()}</span>
                    <span>{formatFileSize(snapshot.metadata.size)}</span>
                    <span>v{snapshot.version}</span>
                    <span className="flex items-center space-x-1">
                      {snapshot.metadata.syncStatus === 'synced' ? (
                        <CheckCircle className="w-3 h-3 text-cinema-green" />
                      ) : snapshot.metadata.syncStatus === 'failed' ? (
                        <AlertTriangle className="w-3 h-3 text-financial-negative" />
                      ) : (
                        <Clock className="w-3 h-3 text-premium-gold" />
                      )}
                      <span>{snapshot.metadata.syncStatus}</span>
                    </span>
                  </div>
                </div>

                <div className="flex space-x-1 opacity-0 group-hover:opacity-100 transition-opacity">
                  <motion.button
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                    onClick={() => setShowRestoreConfirm(snapshot.id)}
                    className="p-2 bg-cinema-green/10 text-cinema-green rounded-lg hover:bg-cinema-green/20 transition-colors"
                  >
                    <RotateCcw className="w-4 h-4" />
                  </motion.button>
                </div>
              </div>
            </motion.div>
          ))}

          {filteredHistory.length === 0 && (
            <div className="p-8 text-center">
              <History className="w-12 h-12 text-cinematic-text-secondary mx-auto mb-3" />
              <h3 className="text-lg font-medium text-cinematic-text mb-2">No history found</h3>
              <p className="text-cinematic-text-secondary">
                {searchQuery || Object.keys(selectedFilter).length > 0
                  ? "Try adjusting your search or filter criteria"
                  : "Start using the app to see your data history here"}
              </p>
            </div>
          )}
        </div>
      </motion.div>

      {/* Restore Confirmation Dialog */}
      <AnimatePresence>
        {showRestoreConfirm && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 backdrop-blur-sm"
            onClick={() => setShowRestoreConfirm(null)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-cinematic-surface/90 backdrop-blur-premium border border-cinematic-border rounded-2xl p-6 w-full max-w-md shadow-premium"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="text-center mb-6">
                <div className="w-16 h-16 bg-premium-gold/20 rounded-full flex items-center justify-center mx-auto mb-4">
                  <AlertTriangle className="w-8 h-8 text-premium-gold" />
                </div>
                <h3 className="text-xl font-bold text-cinematic-text mb-2">Restore Data Version</h3>
                <p className="text-cinematic-text-secondary">
                  This will replace your current data with the selected version. This action cannot be undone.
                </p>
              </div>

              <div className="flex space-x-3">
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => setShowRestoreConfirm(null)}
                  className="flex-1 py-3 bg-cinematic-glass border border-cinematic-border rounded-xl text-cinematic-text hover:border-cinema-green/30 transition-all"
                >
                  Cancel
                </motion.button>
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => handleRestore(showRestoreConfirm)}
                  disabled={isLoading}
                  className="flex-1 py-3 bg-premium-gold text-white rounded-xl font-medium hover:bg-premium-gold/90 transition-all disabled:opacity-50 flex items-center justify-center space-x-2"
                >
                  {isLoading ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <RotateCcw className="w-4 h-4" />
                  )}
                  <span>Restore</span>
                </motion.button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Backup Creation Dialog */}
      <AnimatePresence>
        {showBackupDialog && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 backdrop-blur-sm"
            onClick={() => setShowBackupDialog(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-cinematic-surface/90 backdrop-blur-premium border border-cinematic-border rounded-2xl p-6 w-full max-w-md shadow-premium"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="text-center mb-6">
                <div className="w-16 h-16 bg-cinema-green/20 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Download className="w-8 h-8 text-cinema-green" />
                </div>
                <h3 className="text-xl font-bold text-cinematic-text mb-2">Create Backup</h3>
                <p className="text-cinematic-text-secondary">
                  Create a restore point with all your current data.
                </p>
              </div>

              <div className="mb-6">
                <label className="block text-sm font-medium text-cinematic-text mb-2">
                  Backup Description (Optional)
                </label>
                <input
                  type="text"
                  value={backupDescription}
                  onChange={(e) => setBackupDescription(e.target.value)}
                  placeholder="Enter backup description..."
                  className="w-full px-3 py-2 bg-cinematic-glass border border-cinematic-border rounded-lg text-cinematic-text placeholder-cinematic-text-muted focus:outline-none focus:border-cinema-green/50 transition-colors"
                />
              </div>

              <div className="flex space-x-3">
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => setShowBackupDialog(false)}
                  className="flex-1 py-3 bg-cinematic-glass border border-cinematic-border rounded-xl text-cinematic-text hover:border-cinema-green/30 transition-all"
                >
                  Cancel
                </motion.button>
                <motion.button
                  whileHover={{ scale: 1.02, boxShadow: '0 0 20px rgba(34, 197, 94, 0.4)' }}
                  whileTap={{ scale: 0.98 }}
                  onClick={handleCreateBackup}
                  disabled={isLoading}
                  className="flex-1 py-3 bg-premium-green text-white rounded-xl font-medium hover:shadow-glow-green transition-all disabled:opacity-50 flex items-center justify-center space-x-2"
                >
                  {isLoading ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <Download className="w-4 h-4" />
                  )}
                  <span>Create</span>
                </motion.button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};