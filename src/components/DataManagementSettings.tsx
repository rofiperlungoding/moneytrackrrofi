import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, Edit2, Trash2, X, AlertTriangle } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { useReferenceData } from '../contexts/ReferenceDataContext';
import { useAuth } from '../contexts/AuthContext';

type TabType = 'currencies' | 'categories' | 'paymentMethods' | 'incomeSources';
type ActionType = 'list' | 'add' | 'edit' | 'delete';

export const DataManagementSettings: React.FC = () => {
  const {
    currencies,
    expenseCategories,
    incomeCategories,
    goalCategories,
    paymentMethods,
    incomeSources,
    refresh
  } = useReferenceData();
  const { user } = useAuth();

  const [activeTab, setActiveTab] = useState<TabType>('categories');
  const [action, setAction] = useState<ActionType>('list');
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [selectedItem, setSelectedItem] = useState<any>(null);

  // State for forms
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [formData, setFormData] = useState<any>({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Helper to format category lists
  const allCategories = [
    ...expenseCategories,
    ...incomeCategories,
    ...goalCategories
  ];

  const getListData = () => {
    switch (activeTab) {
      case 'currencies': return currencies;
      case 'categories': return allCategories;
      case 'paymentMethods': return paymentMethods;
      case 'incomeSources': return incomeSources;
      default: return [];
    }
  };

  const getTableName = () => {
    switch (activeTab) {
      case 'currencies': return 'currencies';
      case 'categories': return 'categories';
      case 'paymentMethods': return 'payment_methods';
      case 'incomeSources': return 'income_sources';
    }
  };

  const handleCreate = () => {
    setSelectedItem(null);
    setFormData(activeTab === 'categories' ? { type: 'expense' } : {});
    setAction('add');
    setError(null);
  };

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const handleEdit = (item: any) => {
    setSelectedItem(item);
    setFormData({ ...item });
    setAction('edit');
    setError(null);
  };

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const handleDelete = (item: any) => {
    setSelectedItem(item);
    setAction('delete');
    setError(null);
  };

  const submitForm = async () => {
    if (!user) return;
    setLoading(true);
    setError(null);

    try {
      const table = getTableName();
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const payload: any = { ...formData, user_id: user.id, is_default: false };

      // Remove any fields we don't want to update/insert directly if they exist
      delete payload.id;
      delete payload.created_at;
      delete payload.updated_at;

      let result;
      if (action === 'add') {
        result = await supabase.from(table).insert([payload]);
      } else if (action === 'edit' && selectedItem) {
        result = await supabase.from(table).update(payload).eq('id', selectedItem.id);
      }

      if (result?.error) throw result.error;

      await refresh();
      setAction('list');
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (err: any) {
      setError(err.message || 'An error occurred while saving.');
    } finally {
      setLoading(false);
    }
  };

  const submitDelete = async () => {
    if (!user || !selectedItem) return;
    setLoading(true);
    setError(null);

    try {
      const table = getTableName();
      const { error } = await supabase.from(table).delete().eq('id', selectedItem.id);

      if (error) throw error;

      await refresh();
      setAction('list');
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (err: any) {
      setError(err.message || 'An error occurred while deleting.');
    } finally {
      setLoading(false);
    }
  };

  const renderTabs = () => (
    <div className="flex space-x-2 mb-6 overflow-x-auto pb-2 scrollbar-none">
      {[
        { id: 'categories', label: 'Categories' },
        { id: 'paymentMethods', label: 'Payment Methods' },
        { id: 'incomeSources', label: 'Income Sources' },
        { id: 'currencies', label: 'Currencies' },
      ].map(tab => (
        <button
          key={tab.id}
          onClick={() => { setActiveTab(tab.id as TabType); setAction('list'); }}
          className={`px-4 py-2 rounded-xl text-sm font-medium whitespace-nowrap transition-all ${activeTab === tab.id
            ? 'bg-cinema-green text-white shadow-glow-green'
            : 'bg-cinematic-glass text-cinematic-text-secondary hover:text-cinematic-text hover:bg-cinematic-border'
            }`}
        >
          {tab.label}
        </button>
      ))}
    </div>
  );

  const renderList = () => {
    const data = getListData();
    return (
      <div className="space-y-4">
        <div className="flex justify-between items-center mb-4">
          <p className="text-sm text-cinematic-text-secondary">
            Manage your custom items. Default items are read-only.
          </p>
          <button
            onClick={handleCreate}
            className="p-2 bg-cinema-green/20 text-cinema-green hover:bg-cinema-green hover:text-white rounded-lg transition-colors flex items-center space-x-1 text-xs font-medium"
          >
            <Plus className="w-4 h-4" />
            <span>Add New</span>
          </button>
        </div>

        <div className="space-y-2 max-h-96 overflow-y-auto pr-2 custom-scrollbar">
          {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
          {data.map((item: any) => (
            <div key={item.id} className="flex items-center justify-between p-3 bg-cinematic-glass border border-cinematic-border rounded-xl">
              <div>
                <p className="text-cinematic-text font-medium text-sm">
                  {item.name || item.code} {item.symbol ? `(${item.symbol})` : ''}
                </p>
                {(item.type || item.description) && (
                  <p className="text-xs text-cinematic-text-secondary capitalize">
                    {item.type} {item.description ? `- ${item.description}` : ''}
                  </p>
                )}
              </div>

              <div className="flex items-center space-x-2">
                {item.is_default ? (
                  <span className="text-[10px] px-2 py-1 bg-cinematic-surface rounded-md text-cinematic-text-muted">
                    DEFAULT
                  </span>
                ) : (
                  <>
                    <button onClick={() => handleEdit(item)} className="p-1.5 text-cinema-green hover:bg-cinema-green/10 rounded-lg transition-colors">
                      <Edit2 className="w-4 h-4" />
                    </button>
                    <button onClick={() => handleDelete(item)} className="p-1.5 text-financial-negative hover:bg-financial-negative/10 rounded-lg transition-colors">
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </>
                )}
              </div>
            </div >
          ))}
          {
            data.length === 0 && (
              <div className="p-6 text-center text-cinematic-text-secondary bg-cinematic-glass rounded-xl border border-cinematic-border border-dashed">
                No items found.
              </div>
            )
          }
        </div >
      </div >
    );
  };

  const renderForm = () => {
    return (
      <div className="space-y-4">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-bold text-cinematic-text">
            {action === 'add' ? 'Add New' : 'Edit'} {activeTab.replace(/([A-Z])/g, ' $1').trim()}
          </h3>
          <button onClick={() => setAction('list')} className="text-cinematic-text-secondary hover:text-cinematic-text">
            <X className="w-5 h-5" />
          </button>
        </div>

        {error && (
          <div className="p-3 mb-4 bg-financial-negative/10 border border-financial-negative/20 rounded-xl text-financial-negative text-sm">
            {error}
          </div>
        )}

        <div className="space-y-4">
          {/* Common name/code field */}
          <div>
            <label className="block text-xs font-medium text-cinematic-text-secondary mb-1">
              {activeTab === 'currencies' ? 'Currency Code (e.g., USD)' : 'Name'}
            </label>
            <input
              type="text"
              value={activeTab === 'currencies' ? (formData.code || '') : (formData.name || '')}
              onChange={(e) => setFormData({
                ...formData,
                ...(activeTab === 'currencies' ? { code: e.target.value } : { name: e.target.value })
              })}
              className="w-full px-3 py-2 bg-cinematic-surface border border-cinematic-border rounded-lg text-cinematic-text focus:outline-none focus:border-cinema-green/50"
              placeholder={activeTab === 'currencies' ? 'e.g. AUD' : 'Enter name...'}
            />
          </div>

          {/* Currencies specific fields */}
          {activeTab === 'currencies' && (
            <>
              <div>
                <label className="block text-xs font-medium text-cinematic-text-secondary mb-1">Symbol</label>
                <input
                  type="text"
                  value={formData.symbol || ''}
                  onChange={(e) => setFormData({ ...formData, symbol: e.target.value })}
                  className="w-full px-3 py-2 bg-cinematic-surface border border-cinematic-border rounded-lg text-cinematic-text focus:outline-none focus:border-cinema-green/50"
                  placeholder="e.g. $"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-cinematic-text-secondary mb-1">Currency Name</label>
                <input
                  type="text"
                  value={formData.name || ''}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-3 py-2 bg-cinematic-surface border border-cinematic-border rounded-lg text-cinematic-text focus:outline-none focus:border-cinema-green/50"
                  placeholder="e.g. Australian Dollar"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-cinematic-text-secondary mb-1">Exchange Rate (to USD)</label>
                <input
                  type="number"
                  step="0.0001"
                  value={formData.rate || ''}
                  onChange={(e) => setFormData({ ...formData, rate: parseFloat(e.target.value) })}
                  className="w-full px-3 py-2 bg-cinematic-surface border border-cinematic-border rounded-lg text-cinematic-text focus:outline-none focus:border-cinema-green/50"
                  placeholder="e.g. 1.5"
                />
              </div>
            </>
          )}

          {/* Categories specific fields */}
          {activeTab === 'categories' && (
            <>
              <div>
                <label className="block text-xs font-medium text-cinematic-text-secondary mb-1">Type</label>
                <select
                  value={formData.type || 'expense'}
                  onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                  className="w-full px-3 py-2 bg-cinematic-surface border border-cinematic-border rounded-lg text-cinematic-text focus:outline-none focus:border-cinema-green/50"
                >
                  <option value="expense">Expense</option>
                  <option value="income">Income</option>
                  <option value="goal">Goal</option>
                </select>
              </div>
              <div>
                <label className="block text-xs font-medium text-cinematic-text-secondary mb-1">Description (Optional)</label>
                <textarea
                  value={formData.description || ''}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="w-full px-3 py-2 bg-cinematic-surface border border-cinematic-border rounded-lg text-cinematic-text focus:outline-none focus:border-cinema-green/50 resize-none h-20"
                  placeholder="Description..."
                />
              </div>
            </>
          )}
        </div>

        <div className="flex space-x-3 mt-6">
          <button
            onClick={() => setAction('list')}
            className="flex-1 py-2 bg-cinematic-surface border border-cinematic-border text-cinematic-text rounded-lg hover:bg-cinematic-border transition-colors text-sm font-medium"
          >
            Cancel
          </button>
          <button
            onClick={submitForm}
            disabled={loading}
            className="flex-1 py-2 bg-cinema-green text-white rounded-lg hover:shadow-glow-green transition-all flex justify-center items-center text-sm font-medium disabled:opacity-50"
          >
            {loading ? 'Saving...' : 'Save'}
          </button>
        </div>
      </div>
    );
  };

  const renderDelete = () => (
    <div className="space-y-4">
      <div className="flex items-center space-x-3 text-financial-negative mb-4">
        <AlertTriangle className="w-8 h-8" />
        <h3 className="text-xl font-bold">Delete Item</h3>
      </div>

      <p className="text-sm text-cinematic-text-secondary">
        Are you sure you want to delete <strong className="text-cinematic-text">{selectedItem?.name || selectedItem?.code}</strong>?
        This action cannot be undone and may affect existing transactions.
      </p>

      {error && (
        <div className="p-3 bg-financial-negative/10 border border-financial-negative/20 rounded-xl text-financial-negative text-sm">
          {error}
        </div>
      )}

      <div className="flex space-x-3 mt-6">
        <button
          onClick={() => setAction('list')}
          className="flex-1 py-2 bg-cinematic-surface border border-cinematic-border text-cinematic-text rounded-lg hover:bg-cinematic-border transition-colors text-sm font-medium"
        >
          Cancel
        </button>
        <button
          onClick={submitDelete}
          disabled={loading}
          className="flex-1 py-2 bg-financial-negative text-white rounded-lg hover:bg-financial-negative/80 transition-colors flex justify-center items-center text-sm font-medium disabled:opacity-50"
        >
          {loading ? 'Deleting...' : 'Yes, Delete'}
        </button>
      </div>
    </div>
  );

  return (
    <div className="p-2">
      {action === 'list' && renderTabs()}

      <AnimatePresence mode="wait">
        <motion.div
          key={action}
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -20 }}
          transition={{ duration: 0.2 }}
        >
          {action === 'list' && renderList()}
          {(action === 'add' || action === 'edit') && renderForm()}
          {action === 'delete' && renderDelete()}
        </motion.div>
      </AnimatePresence>
    </div>
  );
};
