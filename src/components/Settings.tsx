import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Settings as SettingsIcon, Palette, Bell, Shield, User, Save, X, Download, Trash2, Eye, EyeOff, AlertTriangle, UserX, KeyRound, CheckCircle, Loader2 } from 'lucide-react';
import { useFinance, UserSettings } from '../contexts/FinanceContext';
import { useCurrency } from '../contexts/CurrencyContext';
import { usePrivacy } from '../contexts/PrivacyContext';
import { useAuth } from '../contexts/AuthContext';
import { SecurityDashboard } from './SecurityDashboard';
import { TwoFactorAuthSetup } from './TwoFactorAuthSetup';
import { SUPPORTED_CURRENCIES } from '../utils/currency';

interface SettingsModalProps {
  category: string;
  onClose: () => void;
}

const SettingsModal: React.FC<SettingsModalProps> = ({ category, onClose }) => {
  const { settings, updateSettings, loading } = useFinance();
  const { currentCurrency, setCurrency } = useCurrency();
  const { deleteAccount } = useAuth();
  const { 
    settings: privacySettings, 
    updatePrivacySettings,
    requestDataExport,
    requestDataDeletion,
    generatePrivacyReport,
    clearAllData
  } = usePrivacy();
  
  const [formData, setFormData] = useState(settings);
  const [deleteReason, setDeleteReason] = useState('');
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [showAccountDeleteConfirm, setShowAccountDeleteConfirm] = useState(false);
  const [accountDeleteStep, setAccountDeleteStep] = useState(1);
  const [accountDeleteConfirmText, setAccountDeleteConfirmText] = useState('');
  const [accountDeleteReason, setAccountDeleteReason] = useState('');
  const [deletingAccount, setDeletingAccount] = useState(false);
  const [saving, setSaving] = useState(false);

  const handleSave = async () => {
    setSaving(true);
    try {
      await updateSettings(formData);
      // Also update currency context if changed
      if (formData.profile.currency !== currentCurrency) {
        setCurrency(formData.profile.currency);
      }
      onClose();
    } catch (error) {
      console.error('Error saving settings:', error);
    } finally {
      setSaving(false);
    }
  };

  const handleAccountDeletion = async () => {
    if (accountDeleteConfirmText !== 'DELETE MY ACCOUNT') {
      return;
    }

    setDeletingAccount(true);
    try {
      const result = await deleteAccount(accountDeleteReason);
      
      if (result.error) {
        console.error('Error deleting account:', result.error);
        alert(`Failed to delete account: ${result.error.message}`);
      } else if (result.warning) {
        alert(`Account deletion initiated: ${result.warning}`);
        // Close the modal since the user will be signed out
        setShowAccountDeleteConfirm(false);
      } else if (result.success) {
        if (result.localOnly) {
          alert('Account signed out locally. Since Supabase is not configured, no server-side deletion was performed.');
        } else {
          alert('Account deleted successfully from the server.');
        }
        // Close the modal since the user will be signed out
        setShowAccountDeleteConfirm(false);
      }
    } catch (error) {
      console.error('Unexpected error during account deletion:', error);
      alert('An unexpected error occurred. Your account has been signed out locally. Please contact support if you need server-side deletion.');
    } finally {
      setDeletingAccount(false);
      setAccountDeleteStep(1);
      setAccountDeleteConfirmText('');
      setAccountDeleteReason('');
    }
  };

  const renderProfileSettings = () => (
    <div className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-cinematic-text mb-2">Name</label>
        <input
          type="text"
          value={formData.profile.name}
          onChange={(e) => setFormData({
            ...formData,
            profile: { ...formData.profile, name: e.target.value }
          })}
          className="w-full px-3 py-2.5 bg-cinematic-glass border border-cinematic-border rounded-lg text-cinematic-text focus:outline-none focus:border-cinema-green/50 transition-colors duration-300"
        />
      </div>
      
      <div>
        <label className="block text-sm font-medium text-cinematic-text mb-2">Avatar</label>
        <div className="flex space-x-2">
          {['👤', '😊', '🤓', '😎', '🚀', '💰'].map((avatar) => (
            <button
              key={avatar}
              onClick={() => setFormData({
                ...formData,
                profile: { ...formData.profile, avatar }
              })}
              className={`w-12 h-12 text-xl rounded-xl border-2 transition-all ${
                formData.profile.avatar === avatar
                  ? 'border-cinema-green bg-cinema-green/10'
                  : 'border-cinematic-border hover:border-cinema-green/30'
              }`}
            >
              {avatar}
            </button>
          ))}
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-cinematic-text mb-2">Currency</label>
        <select
          value={formData.profile.currency}
          onChange={(e) => setFormData({
            ...formData,
            profile: { ...formData.profile, currency: e.target.value }
          })}
          className="w-full px-3 py-2.5 bg-cinematic-glass border border-cinematic-border rounded-lg text-cinematic-text focus:outline-none focus:border-cinema-green/50 transition-colors duration-300"
        >
          {Object.entries(SUPPORTED_CURRENCIES).map(([code, currency]) => (
            <option key={code} value={code} className="bg-cinematic-surface text-cinematic-text">
              {code} ({currency.symbol}) - {currency.name}
            </option>
          ))}
        </select>
      </div>

      {/* Account Deletion Section */}
      <div className="mt-8 pt-6 border-t border-financial-negative/20">
        <h4 className="font-bold text-financial-negative mb-4 flex items-center space-x-2">
          <UserX className="w-5 h-5" />
          <span>Danger Zone</span>
        </h4>
        <div className="bg-financial-negative/5 border border-financial-negative/20 rounded-xl p-4">
          <h5 className="font-bold text-financial-negative mb-2">Delete Account Permanently</h5>
          <p className="text-xs text-cinematic-text-secondary mb-4">
            This action will permanently delete your account and all your financial data, goals, and settings. 
            This action cannot be undone and you will not be able to recover your data.
          </p>
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => setShowAccountDeleteConfirm(true)}
            className="w-full flex items-center justify-center space-x-2 p-3 bg-financial-negative text-white rounded-xl font-medium hover:bg-financial-negative/90 transition-all"
          >
            <UserX className="w-4 h-4" />
            <span>Delete My Account</span>
          </motion.button>
        </div>

        {/* Account Deletion Confirmation Modal */}
        <AnimatePresence>
          {showAccountDeleteConfirm && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/70 flex items-center justify-center z-[60] p-4 backdrop-blur-sm"
              onClick={() => {
                if (!deletingAccount) {
                  setShowAccountDeleteConfirm(false);
                  setAccountDeleteStep(1);
                  setAccountDeleteConfirmText('');
                  setAccountDeleteReason('');
                }
              }}
            >
              <motion.div
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.9, opacity: 0 }}
                className="bg-cinematic-surface/95 backdrop-blur-premium border border-financial-negative/30 rounded-2xl p-6 w-full max-w-md shadow-premium"
                onClick={(e) => e.stopPropagation()}
              >
                <div className="text-center mb-6">
                  <div className="w-16 h-16 bg-financial-negative/20 rounded-full flex items-center justify-center mx-auto mb-4">
                    <AlertTriangle className="w-8 h-8 text-financial-negative" />
                  </div>
                  <h3 className="text-xl font-bold text-financial-negative mb-2">Delete Account</h3>
                  <p className="text-sm text-cinematic-text-secondary">
                    This action is permanent and cannot be undone
                  </p>
                </div>

                {accountDeleteStep === 1 && (
                  <div className="space-y-4">
                    <div className="bg-financial-negative/10 border border-financial-negative/20 rounded-xl p-4">
                      <h4 className="font-bold text-financial-negative mb-2">What will be deleted:</h4>
                      <ul className="text-sm text-cinematic-text-secondary space-y-1">
                        <li>• Your account and login credentials</li>
                        <li>• All financial transactions and data</li>
                        <li>• Personal goals and settings</li>
                        <li>• Privacy and security preferences</li>
                        <li>• All stored information on our servers</li>
                      </ul>
                    </div>

                    <div className="bg-cinema-green/10 border border-cinema-green/20 rounded-xl p-4">
                      <h4 className="font-bold text-cinema-green mb-2">Before you continue:</h4>
                      <ul className="text-sm text-cinematic-text-secondary space-y-1">
                        <li>• Consider exporting your data first</li>
                        <li>• Make sure you have backup records</li>
                        <li>• This will completely remove your account</li>
                      </ul>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-cinematic-text mb-2">
                        Reason for deletion (optional)
                      </label>
                      <textarea
                        value={accountDeleteReason}
                        onChange={(e) => setAccountDeleteReason(e.target.value)}
                        placeholder="Let us know why you're deleting your account (optional)"
                        className="w-full px-3 py-2 bg-cinematic-glass border border-cinematic-border rounded-lg text-cinematic-text placeholder-cinematic-text-muted focus:outline-none focus:border-cinema-green/50 transition-all resize-none"
                        rows={3}
                      />
                    </div>

                    <div className="flex space-x-3">
                      <motion.button
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={() => {
                          setShowAccountDeleteConfirm(false);
                          setAccountDeleteStep(1);
                          setAccountDeleteReason('');
                        }}
                        className="flex-1 py-3 bg-cinematic-glass border border-cinematic-border rounded-xl text-cinematic-text hover:border-cinema-green/30 transition-all"
                      >
                        Cancel
                      </motion.button>
                      <motion.button
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={() => setAccountDeleteStep(2)}
                        className="flex-1 py-3 bg-financial-negative text-white rounded-xl font-medium hover:bg-financial-negative/90 transition-all"
                      >
                        Continue
                      </motion.button>
                    </div>
                  </div>
                )}

                {accountDeleteStep === 2 && (
                  <div className="space-y-4">
                    <div className="text-center">
                      <p className="text-sm text-cinematic-text-secondary mb-4">
                        To confirm account deletion, please type <strong className="text-financial-negative">DELETE MY ACCOUNT</strong> below:
                      </p>
                      <input
                        type="text"
                        value={accountDeleteConfirmText}
                        onChange={(e) => setAccountDeleteConfirmText(e.target.value)}
                        placeholder="Type DELETE MY ACCOUNT"
                        className="w-full px-4 py-3 bg-cinematic-glass border border-cinematic-border rounded-xl text-cinematic-text placeholder-cinematic-text-muted focus:outline-none focus:border-financial-negative/50 transition-all text-center"
                        autoFocus
                        disabled={deletingAccount}
                      />
                    </div>

                    <div className="bg-financial-negative/10 border border-financial-negative/20 rounded-xl p-3">
                      <p className="text-xs text-financial-negative text-center">
                        ⚠️ This will permanently delete your account. You will be immediately signed out.
                      </p>
                    </div>

                    <div className="flex space-x-3">
                      <motion.button
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={() => setAccountDeleteStep(1)}
                        disabled={deletingAccount}
                        className="flex-1 py-3 bg-cinematic-glass border border-cinematic-border rounded-xl text-cinematic-text hover:border-cinema-green/30 transition-all disabled:opacity-50"
                      >
                        Back
                      </motion.button>
                      <motion.button
                        whileHover={{ scale: accountDeleteConfirmText === 'DELETE MY ACCOUNT' && !deletingAccount ? 1.02 : 1 }}
                        whileTap={{ scale: accountDeleteConfirmText === 'DELETE MY ACCOUNT' && !deletingAccount ? 0.98 : 1 }}
                        onClick={handleAccountDeletion}
                        disabled={accountDeleteConfirmText !== 'DELETE MY ACCOUNT' || deletingAccount}
                        className="flex-1 py-3 bg-financial-negative text-white rounded-xl font-medium disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center justify-center space-x-2"
                      >
                        {deletingAccount ? (
                          <>
                            <Loader2 className="w-4 h-4 animate-spin" />
                            <span>Deleting...</span>
                          </>
                        ) : (
                          <>
                            <UserX className="w-4 h-4" />
                            <span>Delete Forever</span>
                          </>
                        )}
                      </motion.button>
                    </div>
                  </div>
                )}
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );

  const renderAppearanceSettings = () => (
    <div className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-cinematic-text mb-2">Color Scheme</label>
        <div className="grid grid-cols-3 gap-3">
          {[
            { value: 'green', color: 'bg-cinema-green', name: 'Green' },
            { value: 'emerald', color: 'bg-cinema-emerald', name: 'Emerald' },
            { value: 'gold', color: 'bg-premium-gold', name: 'Gold' },
            { value: 'copper', color: 'bg-premium-copper', name: 'Copper' },
            { value: 'jade', color: 'bg-cinema-jade', name: 'Jade' },
            { value: 'lime', color: 'bg-cinema-lime', name: 'Lime' }
          ].map((scheme) => (
            <button
              key={scheme.value}
              onClick={() => setFormData({
                ...formData,
                appearance: { ...formData.appearance, colorScheme: scheme.value }
              })}
              className={`p-3 rounded-xl border-2 transition-all ${
                formData.appearance.colorScheme === scheme.value
                  ? 'border-cinema-green bg-cinema-green/10'
                  : 'border-cinematic-border hover:border-cinema-green/30'
              }`}
            >
              <div className={`w-full h-6 ${scheme.color} rounded-lg mb-2`} />
              <span className="text-xs text-cinematic-text">{scheme.name}</span>
            </button>
          ))}
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-cinematic-text mb-2">Font Size</label>
        <div className="flex space-x-2">
          {[
            { value: 'small', label: 'Small' },
            { value: 'medium', label: 'Medium' },
            { value: 'large', label: 'Large' }
          ].map((size) => (
            <button
              key={size.value}
              onClick={() => setFormData({
                ...formData,
                appearance: { ...formData.appearance, fontSize: size.value as any }
              })}
              className={`flex-1 py-2.5 px-3 rounded-xl border transition-all ${
                formData.appearance.fontSize === size.value
                  ? 'border-cinema-green bg-cinema-green/10 text-cinema-green'
                  : 'border-cinematic-border text-cinematic-text hover:border-cinema-green/30'
              }`}
            >
              {size.label}
            </button>
          ))}
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-cinematic-text mb-2">Layout</label>
        <div className="flex space-x-2">
          {[
            { value: 'compact', label: 'Compact' },
            { value: 'comfortable', label: 'Comfortable' }
          ].map((layout) => (
            <button
              key={layout.value}
              onClick={() => setFormData({
                ...formData,
                appearance: { ...formData.appearance, layout: layout.value as any }
              })}
              className={`flex-1 py-2.5 px-3 rounded-xl border transition-all ${
                formData.appearance.layout === layout.value
                  ? 'border-cinema-green bg-cinema-green/10 text-cinema-green'
                  : 'border-cinematic-border text-cinematic-text hover:border-cinema-green/30'
              }`}
            >
              {layout.label}
            </button>
          ))}
        </div>
      </div>
    </div>
  );

  const renderNotificationSettings = () => (
    <div className="space-y-4">
      {Object.entries(formData.notifications).map(([key, value]) => (
        <div key={key} className="flex items-center justify-between p-3 bg-cinematic-glass rounded-xl">
          <div>
            <h4 className="font-medium text-cinematic-text text-sm">
              {key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())}
            </h4>
            <p className="text-xs text-cinematic-text-secondary">
              {key === 'budgetAlerts' && 'Get notified when you approach budget limits'}
              {key === 'goalReminders' && 'Receive reminders about your financial goals'}
              {key === 'weeklyReports' && 'Get weekly summary of your finances'}
              {key === 'emailNotifications' && 'Receive notifications via email'}
            </p>
          </div>
          <label className="relative inline-flex items-center cursor-pointer">
            <input
              type="checkbox"
              checked={value}
              onChange={(e) => setFormData({
                ...formData,
                notifications: { ...formData.notifications, [key]: e.target.checked }
              })}
              className="sr-only peer"
            />
            <div className="w-9 h-5 bg-cinematic-border peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-cinema-green" />
          </label>
        </div>
      ))}
    </div>
  );

  const renderPrivacySettings = () => (
    <div className="space-y-4">
      {Object.entries(formData.privacy).map(([key, value]) => (
        <div key={key} className="flex items-center justify-between p-3 bg-cinematic-glass rounded-xl">
          <div>
            <h4 className="font-medium text-cinematic-text text-sm">
              {key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())}
            </h4>
            <p className="text-xs text-cinematic-text-secondary">
              {key === 'showBalances' && 'Display account balances and amounts'}
              {key === 'dataBackup' && 'Automatically backup your financial data'}
              {key === 'analytics' && 'Allow anonymous usage analytics'}
            </p>
          </div>
          <label className="relative inline-flex items-center cursor-pointer">
            <input
              type="checkbox"
              checked={value}
              onChange={(e) => setFormData({
                ...formData,
                privacy: { ...formData.privacy, [key]: e.target.checked }
              })}
              className="sr-only peer"
            />
            <div className="w-9 h-5 bg-cinematic-border peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-cinema-green" />
          </label>
        </div>
      ))}

      {/* GDPR Controls */}
      <div className="mt-6 pt-4 border-t border-cinematic-border">
        <h4 className="font-bold text-cinematic-text mb-4">Data Rights (GDPR)</h4>
        <div className="grid grid-cols-2 gap-3">
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={requestDataExport}
            className="flex items-center space-x-2 p-3 bg-cinema-green/10 border border-cinema-green/30 rounded-xl text-cinema-green hover:bg-cinema-green/20 transition-all"
          >
            <Download className="w-4 h-4" />
            <span className="text-sm">Export Data</span>
          </motion.button>

          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={generatePrivacyReport}
            className="flex items-center space-x-2 p-3 bg-premium-gold/10 border border-premium-gold/30 rounded-xl text-premium-gold hover:bg-premium-gold/20 transition-all"
          >
            <Eye className="w-4 h-4" />
            <span className="text-sm">Privacy Report</span>
          </motion.button>

          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => setShowDeleteConfirm(true)}
            className="flex items-center space-x-2 p-3 bg-financial-negative/10 border border-financial-negative/30 rounded-xl text-financial-negative hover:bg-financial-negative/20 transition-all col-span-2"
          >
            <Trash2 className="w-4 h-4" />
            <span className="text-sm">Delete All Data</span>
          </motion.button>
        </div>

        {/* Delete Confirmation */}
        <AnimatePresence>
          {showDeleteConfirm && (
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="mt-4 p-4 bg-financial-negative/10 border border-financial-negative/30 rounded-xl"
            >
              <h5 className="font-bold text-financial-negative mb-2">Confirm Data Deletion</h5>
              <p className="text-xs text-cinematic-text-secondary mb-3">
                This will permanently delete all your data. Please provide a reason:
              </p>
              <textarea
                value={deleteReason}
                onChange={(e) => setDeleteReason(e.target.value)}
                placeholder="Reason for deletion..."
                className="w-full p-2 bg-cinematic-glass border border-cinematic-border rounded-lg text-cinematic-text text-xs mb-3 resize-none"
                rows={2}
              />
              <div className="flex space-x-2">
                <button
                  onClick={() => {
                    if (deleteReason.trim()) {
                      requestDataDeletion(deleteReason);
                      setShowDeleteConfirm(false);
                      setDeleteReason('');
                    }
                  }}
                  disabled={!deleteReason.trim()}
                  className="flex-1 py-2 bg-financial-negative text-white rounded-lg text-xs font-medium disabled:opacity-50"
                >
                  Confirm Delete
                </button>
                <button
                  onClick={() => {
                    setShowDeleteConfirm(false);
                    setDeleteReason('');
                  }}
                  className="flex-1 py-2 bg-cinematic-glass border border-cinematic-border rounded-lg text-cinematic-text text-xs"
                >
                  Cancel
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 backdrop-blur-sm"
        onClick={onClose}
      >
        <motion.div
          initial={{ scale: 0.95, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.95, opacity: 0 }}
          className="bg-cinematic-surface/90 backdrop-blur-premium border border-cinematic-border rounded-2xl p-5 w-full max-w-lg max-h-[90vh] overflow-y-auto shadow-premium"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold text-cinematic-text font-cinematic">
              {category.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())}
            </h2>
            <button
              onClick={onClose}
              className="p-1.5 hover:bg-cinematic-glass rounded-lg transition-colors"
            >
              <X className="w-4 h-4 text-cinematic-text-secondary" />
            </button>
          </div>

          {/* Content */}
          <div className="mb-4">
            {category === 'profile' && renderProfileSettings()}
            {category === 'appearance' && renderAppearanceSettings()}
            {category === 'notifications' && renderNotificationSettings()}
            {category === 'privacy' && renderPrivacySettings()}
            {category === 'security' && <SecurityDashboard />}
            {category === 'twoFactorAuth' && <TwoFactorAuthSetup />}
          </div>

          {/* Actions - Only show save/cancel for non-security and non-2FA settings */}
          {category !== 'security' && category !== 'twoFactorAuth' && (
            <div className="flex space-x-3">
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={onClose}
                className="flex-1 py-2.5 bg-cinematic-glass border border-cinematic-border rounded-lg text-cinematic-text hover:border-cinema-green/30 transition-all duration-300"
              >
                Cancel
              </motion.button>
              <motion.button
                whileHover={{ scale: 1.02, boxShadow: '0 0 20px rgba(34, 197, 94, 0.4)' }}
                whileTap={{ scale: 0.98 }}
                onClick={handleSave}
                disabled={saving || loading}
                className="flex-1 py-2.5 bg-premium-green text-white rounded-lg font-medium hover:shadow-glow-green transition-all flex items-center justify-center space-x-1.5 disabled:opacity-50"
              >
                {saving ? (
                  <>
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    <span>Saving...</span>
                  </>
                ) : (
                  <>
                    <Save className="w-3.5 h-3.5" />
                    <span>Save Changes</span>
                  </>
                )}
              </motion.button>
            </div>
          )}
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

export const Settings: React.FC = () => {
  const { settings, loading } = useFinance();
  const { currentCurrency } = useCurrency();
  const [activeModal, setActiveModal] = useState<string | null>(null);

  const settingsCategories = [
    {
      title: 'Profile Settings',
      icon: User,
      color: 'cinema-green-light',
      description: 'Manage your personal information',
      items: ['Name', 'Profile Picture', 'Currency'],
      key: 'profile'
    },
    {
      title: 'Appearance',
      icon: Palette,
      color: 'premium-gold',
      description: 'Customize colors and layout',
      items: ['Color Scheme', 'Font Size', 'Layout'],
      key: 'appearance'
    },
    {
      title: 'Notifications',
      icon: Bell,
      color: 'premium-copper',
      description: 'Control when the app reminds you',
      items: ['Budget Alerts', 'Goal Reminders', 'Weekly Reports'],
      key: 'notifications'
    },
    {
      title: 'Privacy & Security',
      icon: Shield,
      color: 'cinema-emerald',
      description: 'Keep your financial data safe',
      items: ['Show Balances', 'Data Backup', 'Security Logs'],
      key: 'privacy'
    },
    {
      title: 'Security Dashboard',
      icon: Shield,
      color: 'financial-negative',
      description: 'Advanced security controls',
      items: ['Two-Factor Auth', 'Session Control', 'Audit Logs'],
      key: 'security'
    },
    {
      title: 'Two-Factor Authentication',
      icon: KeyRound,
      color: 'cinema-green',
      description: 'Add an extra layer of security to your account',
      items: ['Email Verification', 'Phone Verification'],
      key: 'twoFactorAuth'
    }
  ];

  return (
    <div className="space-y-8">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="text-center"
      >
        <div className="flex items-center justify-center space-x-2 mb-2">
          <SettingsIcon className="w-6 h-6 text-premium-copper" />
          <h1 className="text-3xl font-bold text-cinematic-text font-cinematic">Settings</h1>
          {loading && <Loader2 className="w-5 h-5 animate-spin text-cinema-green" />}
        </div>
        <p className="text-lg text-cinematic-text-secondary">Customize your financial experience</p>
      </motion.div>

      {/* Current Profile Display */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.1 }}
        className="flex justify-center"
      >
        <div className="bg-cinematic-surface/60 backdrop-blur-premium border-2 border-cinema-green-light/20 rounded-3xl p-6 shadow-cinematic">
          <div className="flex items-center space-x-4">
            <div className="w-16 h-16 bg-cinema-green-light/10 rounded-2xl flex items-center justify-center text-3xl">
              {settings.profile.avatar}
            </div>
            <div>
              <h3 className="text-xl font-bold text-cinematic-text">Hello, {settings.profile.name}!</h3>
              <p className="text-cinematic-text-secondary text-base">
                Currency: {SUPPORTED_CURRENCIES[currentCurrency]?.symbol} {currentCurrency} • Theme: {settings.appearance.colorScheme}
              </p>
              <div className="flex items-center space-x-3 mt-2 text-xs">
                <span className={`px-2.5 py-0.5 rounded-full ${
                  settings.privacy.showBalances ? 'bg-cinema-green/20 text-cinema-green' : 'bg-financial-negative/20 text-financial-negative'
                }`}>
                  {settings.privacy.showBalances ? <Eye className="w-3 h-3 inline mr-1" /> : <EyeOff className="w-3 h-3 inline mr-1" />}
                  Balances {settings.privacy.showBalances ? 'Visible' : 'Hidden'}
                </span>
                <span className={`px-2.5 py-0.5 rounded-full ${
                  settings.notifications.budgetAlerts ? 'bg-cinema-green-light/20 text-cinema-green-light' : 'bg-cinematic-text-muted/20 text-cinematic-text-muted'
                }`}>
                  <Bell className="w-3 h-3 inline mr-1" />
                  Alerts {settings.notifications.budgetAlerts ? 'On' : 'Off'}
                </span>
              </div>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Settings Categories */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {settingsCategories.map((category, index) => (
          <motion.div
            key={category.title}
            initial={{ opacity: 0, y: 30, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{ duration: 0.5, delay: 0.2 + index * 0.1, type: "spring" }}
            whileHover={{ scale: 1.05, y: -5, boxShadow: '0 25px 50px rgba(34, 197, 94, 0.2)' }}
            className={`bg-cinematic-surface/60 backdrop-blur-premium border-2 border-${category.color}/20 rounded-3xl p-6 hover:border-${category.color}/40 transition-all duration-500 relative overflow-hidden cursor-pointer shadow-cinematic`}
            onClick={() => setActiveModal(category.key)}
          >
            {/* Background decoration */}
            <div className={`absolute top-0 right-0 w-24 h-24 bg-${category.color}/10 rounded-full blur-2xl`} />
            
            <div className="relative">
              <div className="flex items-center space-x-3 mb-4">
                <div className={`p-3 bg-${category.color}/20 rounded-2xl`}>
                  <category.icon className={`w-6 h-6 text-${category.color}`} />
                </div>
              </div>
              
              <div className="mb-4">
                <h3 className={`text-lg font-bold text-${category.color} font-cinematic mb-2`}>{category.title}</h3>
                <p className="text-cinematic-text-secondary text-sm">{category.description}</p>
              </div>

              <div className="space-y-2">
                {category.items.map((item, itemIndex) => (
                  <motion.div
                    key={item}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.3, delay: 0.3 + index * 0.1 + itemIndex * 0.05 }}
                    className="flex items-center justify-between p-2.5 bg-cinematic-glass rounded-xl hover:bg-cinematic-border transition-colors"
                  >
                    <span className="text-cinematic-text font-medium text-xs">{item}</span>
                    <div className="w-1.5 h-1.5 bg-cinematic-text-secondary rounded-full opacity-50" />
                  </motion.div>
                ))}
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Settings Modal */}
      {activeModal && (
        <SettingsModal
          category={activeModal}
          onClose={() => setActiveModal(null)}
        />
      )}
    </div>
  );
};