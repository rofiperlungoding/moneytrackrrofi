import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Shield, 
  Download, 
  Upload, 
  Trash2, 
  RotateCcw, 
  Clock,
  AlertTriangle,
  CheckCircle,
  FileText,
  Calendar,
  HardDrive,
  Loader2,
  X
} from 'lucide-react';
import { useCloudStorage, DataRestorePoint } from '../contexts/CloudStorageContext';
import { CountUp } from './CountUp';

export const BackupManager: React.FC = () => {
  const {
    restorePoints,
    createBackup,
    restoreFromBackup,
    deleteBackup,
    getBackups
  } = useCloudStorage();

  const [showRestoreConfirm, setShowRestoreConfirm] = useState<string | null>(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState<string | null>(null);
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [backupDescription, setBackupDescription] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [selectedBackups, setSelectedBackups] = useState<string[]>([]);

  const handleCreateBackup = async () => {
    setIsLoading(true);
    try {
      await createBackup(backupDescription || undefined);
      setShowCreateDialog(false);
      setBackupDescription('');
    } catch (error) {
      console.error('Error creating backup:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleRestoreBackup = async (backupId: string) => {
    setIsLoading(true);
    try {
      await restoreFromBackup(backupId);
    } catch (error) {
      console.error('Error restoring backup:', error);
    } finally {
      setIsLoading(false);
      setShowRestoreConfirm(null);
    }
  };

  const handleDeleteBackup = async (backupId: string) => {
    setIsLoading(true);
    try {
      await deleteBackup(backupId);
    } catch (error) {
      console.error('Error deleting backup:', error);
    } finally {
      setIsLoading(false);
      setShowDeleteConfirm(null);
    }
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const getBackupIcon = (backup: DataRestorePoint) => {
    if (backup.isAutoBackup) {
      return <Clock className="w-4 h-4 text-cinema-emerald" />;
    }
    return <Shield className="w-4 h-4 text-premium-gold" />;
  };

  const getBackupColor = (backup: DataRestorePoint) => {
    if (backup.isAutoBackup) {
      return 'bg-cinema-emerald/10 border-cinema-emerald/30 text-cinema-emerald';
    }
    return 'bg-premium-gold/10 border-premium-gold/30 text-premium-gold';
  };

  const totalBackupSize = restorePoints.reduce((sum, backup) => sum + backup.dataSize, 0);
  const autoBackups = restorePoints.filter(bp => bp.isAutoBackup);
  const manualBackups = restorePoints.filter(bp => !bp.isAutoBackup);

  return (
    <div className="space-y-6">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-center justify-between"
      >
        <div>
          <h1 className="text-3xl font-bold text-cinematic-text font-cinematic">Backup Manager</h1>
          <p className="text-cinematic-text-secondary mt-1">Secure backup and restore for your financial data</p>
        </div>
        
        <motion.button
          whileHover={{ scale: 1.02, boxShadow: '0 0 20px rgba(34, 197, 94, 0.4)' }}
          whileTap={{ scale: 0.98 }}
          onClick={() => setShowCreateDialog(true)}
          className="flex items-center space-x-2 bg-premium-green text-white px-6 py-3 rounded-2xl font-medium hover:shadow-glow-green transition-all"
        >
          <Download className="w-4 h-4" />
          <span>Create Backup</span>
        </motion.button>
      </motion.div>

      {/* Backup Stats */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="grid grid-cols-1 md:grid-cols-4 gap-4"
      >
        <div className="bg-cinematic-surface/60 backdrop-blur-premium border border-cinematic-border rounded-2xl p-4">
          <div className="flex items-center space-x-2 mb-2">
            <Shield className="w-4 h-4 text-cinema-green" />
            <h3 className="text-sm font-bold text-cinematic-text">Total Backups</h3>
          </div>
          <div className="text-xl font-bold text-cinema-green">
            <CountUp to={restorePoints.length} duration={1} />
          </div>
          <p className="text-xs text-cinematic-text-secondary">Restore points</p>
        </div>

        <div className="bg-cinematic-surface/60 backdrop-blur-premium border border-cinematic-border rounded-2xl p-4">
          <div className="flex items-center space-x-2 mb-2">
            <Clock className="w-4 h-4 text-cinema-emerald" />
            <h3 className="text-sm font-bold text-cinematic-text">Auto Backups</h3>
          </div>
          <div className="text-xl font-bold text-cinema-emerald">
            <CountUp to={autoBackups.length} duration={1} delay={0.1} />
          </div>
          <p className="text-xs text-cinematic-text-secondary">Automated</p>
        </div>

        <div className="bg-cinematic-surface/60 backdrop-blur-premium border border-cinematic-border rounded-2xl p-4">
          <div className="flex items-center space-x-2 mb-2">
            <FileText className="w-4 h-4 text-premium-gold" />
            <h3 className="text-sm font-bold text-cinematic-text">Manual Backups</h3>
          </div>
          <div className="text-xl font-bold text-premium-gold">
            <CountUp to={manualBackups.length} duration={1} delay={0.2} />
          </div>
          <p className="text-xs text-cinematic-text-secondary">User created</p>
        </div>

        <div className="bg-cinematic-surface/60 backdrop-blur-premium border border-cinematic-border rounded-2xl p-4">
          <div className="flex items-center space-x-2 mb-2">
            <HardDrive className="w-4 h-4 text-premium-copper" />
            <h3 className="text-sm font-bold text-cinematic-text">Total Size</h3>
          </div>
          <div className="text-lg font-bold text-premium-copper">
            {formatFileSize(totalBackupSize)}
          </div>
          <p className="text-xs text-cinematic-text-secondary">Storage used</p>
        </div>
      </motion.div>

      {/* Action Bar */}
      {selectedBackups.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-cinema-green/10 backdrop-blur-glass border border-cinema-green/30 rounded-xl p-4"
        >
          <div className="flex items-center justify-between">
            <span className="text-cinema-green font-medium">
              {selectedBackups.length} backup(s) selected
            </span>
            <div className="flex items-center space-x-2">
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => selectedBackups.length === 1 && setShowRestoreConfirm(selectedBackups[0])}
                disabled={selectedBackups.length !== 1 || isLoading}
                className="flex items-center space-x-2 bg-cinema-green text-white px-3 py-1.5 rounded-lg font-medium disabled:opacity-50 transition-all"
              >
                <RotateCcw className="w-4 h-4" />
                <span>Restore</span>
              </motion.button>
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => setSelectedBackups([])}
                className="text-cinematic-text-secondary hover:text-cinematic-text transition-colors"
              >
                <X className="w-4 h-4" />
              </motion.button>
            </div>
          </div>
        </motion.div>
      )}

      {/* Backup List */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="bg-cinematic-surface/60 backdrop-blur-premium border border-cinematic-border rounded-2xl"
      >
        <div className="p-4 border-b border-cinematic-border">
          <h3 className="text-lg font-bold text-cinematic-text">Backup History</h3>
          <p className="text-sm text-cinematic-text-secondary">
            {restorePoints.length} backups available
          </p>
        </div>

        <div className="divide-y divide-cinematic-border max-h-96 overflow-y-auto">
          {restorePoints.map((backup, index) => (
            <motion.div
              key={backup.id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.05 }}
              className="p-4 hover:bg-cinematic-glass transition-all group"
            >
              <div className="flex items-center space-x-3">
                <input
                  type="checkbox"
                  checked={selectedBackups.includes(backup.id)}
                  onChange={(e) => {
                    if (e.target.checked) {
                      setSelectedBackups([...selectedBackups, backup.id]);
                    } else {
                      setSelectedBackups(selectedBackups.filter(id => id !== backup.id));
                    }
                  }}
                  className="w-4 h-4 text-cinema-green bg-cinematic-glass border-cinematic-border rounded focus:ring-cinema-green"
                />

                <div className="flex-1 min-w-0">
                  <div className="flex items-center space-x-2 mb-1">
                    {getBackupIcon(backup)}
                    <span className={`px-2 py-0.5 rounded-full text-xs font-medium border ${getBackupColor(backup)}`}>
                      {backup.isAutoBackup ? 'Auto' : 'Manual'}
                    </span>
                    <span className="text-xs text-cinematic-text-secondary">
                      v{backup.version}
                    </span>
                  </div>

                  <p className="text-sm text-cinematic-text font-medium mb-1">
                    {backup.description}
                  </p>

                  <div className="flex items-center space-x-4 text-xs text-cinematic-text-secondary">
                    <span className="flex items-center space-x-1">
                      <Calendar className="w-3 h-3" />
                      <span>{new Date(backup.timestamp).toLocaleString()}</span>
                    </span>
                    <span className="flex items-center space-x-1">
                      <HardDrive className="w-3 h-3" />
                      <span>{formatFileSize(backup.dataSize)}</span>
                    </span>
                  </div>
                </div>

                <div className="flex space-x-1 opacity-0 group-hover:opacity-100 transition-opacity">
                  <motion.button
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                    onClick={() => setShowRestoreConfirm(backup.id)}
                    className="p-2 bg-cinema-green/10 text-cinema-green rounded-lg hover:bg-cinema-green/20 transition-colors"
                    title="Restore backup"
                  >
                    <RotateCcw className="w-4 h-4" />
                  </motion.button>
                  
                  {!backup.isAutoBackup && (
                    <motion.button
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.9 }}
                      onClick={() => setShowDeleteConfirm(backup.id)}
                      className="p-2 bg-financial-negative/10 text-financial-negative rounded-lg hover:bg-financial-negative/20 transition-colors"
                      title="Delete backup"
                    >
                      <Trash2 className="w-4 h-4" />
                    </motion.button>
                  )}
                </div>
              </div>
            </motion.div>
          ))}

          {restorePoints.length === 0 && (
            <div className="p-8 text-center">
              <Shield className="w-12 h-12 text-cinematic-text-secondary mx-auto mb-3" />
              <h3 className="text-lg font-medium text-cinematic-text mb-2">No backups yet</h3>
              <p className="text-cinematic-text-secondary">
                Create your first backup to secure your financial data
              </p>
            </div>
          )}
        </div>
      </motion.div>

      {/* Create Backup Dialog */}
      <AnimatePresence>
        {showCreateDialog && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 backdrop-blur-sm"
            onClick={() => setShowCreateDialog(false)}
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
                <h3 className="text-xl font-bold text-cinematic-text mb-2">Create New Backup</h3>
                <p className="text-cinematic-text-secondary">
                  Create a secure backup of all your financial data
                </p>
              </div>

              <div className="mb-6">
                <label className="block text-sm font-medium text-cinematic-text mb-2">
                  Backup Description
                </label>
                <input
                  type="text"
                  value={backupDescription}
                  onChange={(e) => setBackupDescription(e.target.value)}
                  placeholder="Enter backup description..."
                  className="w-full px-3 py-2 bg-cinematic-glass border border-cinematic-border rounded-lg text-cinematic-text placeholder-cinematic-text-muted focus:outline-none focus:border-cinema-green/50 transition-colors"
                  autoFocus
                />
                <p className="text-xs text-cinematic-text-muted mt-1">
                  Leave empty for automatic description
                </p>
              </div>

              <div className="flex space-x-3">
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => setShowCreateDialog(false)}
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
                <h3 className="text-xl font-bold text-cinematic-text mb-2">Restore Backup</h3>
                <p className="text-cinematic-text-secondary">
                  This will replace all your current data with the selected backup. This action cannot be undone.
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
                  onClick={() => handleRestoreBackup(showRestoreConfirm)}
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

      {/* Delete Confirmation Dialog */}
      <AnimatePresence>
        {showDeleteConfirm && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 backdrop-blur-sm"
            onClick={() => setShowDeleteConfirm(null)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-cinematic-surface/90 backdrop-blur-premium border border-cinematic-border rounded-2xl p-6 w-full max-w-md shadow-premium"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="text-center mb-6">
                <div className="w-16 h-16 bg-financial-negative/20 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Trash2 className="w-8 h-8 text-financial-negative" />
                </div>
                <h3 className="text-xl font-bold text-cinematic-text mb-2">Delete Backup</h3>
                <p className="text-cinematic-text-secondary">
                  This will permanently delete the selected backup. This action cannot be undone.
                </p>
              </div>

              <div className="flex space-x-3">
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => setShowDeleteConfirm(null)}
                  className="flex-1 py-3 bg-cinematic-glass border border-cinematic-border rounded-xl text-cinematic-text hover:border-cinema-green/30 transition-all"
                >
                  Cancel
                </motion.button>
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => handleDeleteBackup(showDeleteConfirm)}
                  disabled={isLoading}
                  className="flex-1 py-3 bg-financial-negative text-white rounded-xl font-medium hover:bg-financial-negative/90 transition-all disabled:opacity-50 flex items-center justify-center space-x-2"
                >
                  {isLoading ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <Trash2 className="w-4 h-4" />
                  )}
                  <span>Delete</span>
                </motion.button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};