import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  X,
  Flame,
  CheckCircle2,
  AlertTriangle,
  RefreshCw,
  Key,
  Shield,
  Database,
  HardDrive,
  Copy,
  ExternalLink,
  Save,
  Trash2,
  HelpCircle,
  Sparkles,
} from 'lucide-react';
import { FirebaseConfig } from '../types';
import {
  getStoredFirebaseConfig,
  saveFirebaseConfig,
  clearFirebaseConfig,
  testFirebaseLiveConnection,
  isFirebaseConfigValid,
} from '../services/firebase';

interface FirebaseConfigModalProps {
  isOpen: boolean;
  onClose: () => void;
  onShowToast: (text: string, type: 'success' | 'error' | 'info') => void;
}

export const FirebaseConfigModal: React.FC<FirebaseConfigModalProps> = ({
  isOpen,
  onClose,
  onShowToast,
}) => {
  const [config, setConfig] = useState<FirebaseConfig>(getStoredFirebaseConfig());
  const [rawJsonInput, setRawJsonInput] = useState('');
  const [activeInputMode, setActiveInputMode] = useState<'form' | 'pasteJson'>('form');
  const [isTesting, setIsTesting] = useState(false);
  const [testResult, setTestResult] = useState<{
    tested: boolean;
    success: boolean;
    message: string;
    auth?: boolean;
    firestore?: boolean;
    storage?: boolean;
  } | null>(null);

  useEffect(() => {
    if (isOpen) {
      setConfig(getStoredFirebaseConfig());
      setTestResult(null);
    }
  }, [isOpen]);

  const handleFieldChange = (field: keyof FirebaseConfig, val: string) => {
    setConfig((prev) => ({ ...prev, [field]: val.trim() }));
    setTestResult(null);
  };

  const handleParseJson = () => {
    if (!rawJsonInput.trim()) {
      onShowToast('Please paste your Firebase configuration code or JSON.', 'error');
      return;
    }

    try {
      let cleaned = rawJsonInput;

      // Extract JSON object if it's inside `const firebaseConfig = { ... };`
      const match = cleaned.match(/\{[\s\S]*\}/);
      if (match) {
        cleaned = match[0];
      }

      // Convert JS object keys to valid JSON format if unquoted
      cleaned = cleaned
        .replace(/([a-zA-Z0-9_]+)\s*:/g, '"$1":')
        .replace(/'/g, '"')
        .replace(/,\s*\}/g, '}');

      const parsed = JSON.parse(cleaned);

      if (parsed.apiKey || parsed.projectId) {
        const newConfig: FirebaseConfig = {
          apiKey: parsed.apiKey || '',
          authDomain: parsed.authDomain || '',
          projectId: parsed.projectId || '',
          storageBucket: parsed.storageBucket || '',
          messagingSenderId: parsed.messagingSenderId || '',
          appId: parsed.appId || '',
          measurementId: parsed.measurementId || '',
        };

        setConfig(newConfig);
        setActiveInputMode('form');
        setRawJsonInput('');
        onShowToast('Firebase configuration keys parsed successfully!', 'success');
      } else {
        throw new Error('Keys like apiKey or projectId were not found.');
      }
    } catch (e: any) {
      onShowToast(
        'Could not automatically parse config. Please fill the fields directly.',
        'error'
      );
    }
  };

  const handleSave = () => {
    if (!isFirebaseConfigValid(config)) {
      onShowToast('Please enter at least a valid API Key and Project ID.', 'error');
      return;
    }

    const result = saveFirebaseConfig(config);
    if (result.success) {
      onShowToast('Firebase configuration saved successfully!', 'success');
      onClose();
    } else {
      onShowToast(result.message, 'error');
    }
  };

  const handleTestConnection = async () => {
    setIsTesting(true);
    try {
      const res = await testFirebaseLiveConnection(config);
      setTestResult({
        tested: true,
        success: res.connected,
        message: res.message,
        auth: res.auth,
        firestore: res.firestore,
        storage: res.storage,
      });
      if (res.connected) {
        onShowToast('Firebase connection test passed!', 'success');
      } else {
        onShowToast(res.message, 'error');
      }
    } catch (err: any) {
      setTestResult({
        tested: true,
        success: false,
        message: err?.message || 'Connection test failed.',
      });
    } finally {
      setIsTesting(false);
    }
  };

  const handleReset = () => {
    clearFirebaseConfig();
    setConfig({
      apiKey: '',
      authDomain: '',
      projectId: '',
      storageBucket: '',
      messagingSenderId: '',
      appId: '',
    });
    setTestResult(null);
    onShowToast('Firebase credentials reset to empty.', 'info');
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-slate-950/85 backdrop-blur-xl overflow-y-auto"
          onClick={onClose}
        >
          <motion.div
            initial={{ scale: 0.92, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.92, opacity: 0 }}
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
            onClick={(e) => e.stopPropagation()}
            className="relative w-full max-w-2xl rounded-3xl bg-slate-900 border border-amber-500/20 shadow-2xl p-6 sm:p-8 my-auto overflow-hidden max-h-[92vh] flex flex-col"
          >
            {/* Header */}
            <div className="flex items-center justify-between pb-4 border-b border-slate-800 mb-5 shrink-0">
              <div className="flex items-center gap-3">
                <div className="p-3 rounded-2xl bg-amber-500/10 border border-amber-500/30 text-amber-400">
                  <Flame className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-slate-100 flex items-center gap-2">
                    Firebase Configuration
                    <span className="text-[10px] px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 font-mono font-semibold border border-amber-500/30">
                      Auth • Firestore • Storage
                    </span>
                  </h3>
                  <p className="text-xs text-slate-400">
                    Connect your own Firebase project for real-time cloud storage, database, and admin login.
                  </p>
                </div>
              </div>
              <button
                onClick={onClose}
                className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
                aria-label="Close"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Sub Tabs: Form vs Quick Paste */}
            <div className="flex items-center justify-between gap-2 mb-4 shrink-0">
              <div className="flex items-center bg-slate-950 p-1 rounded-xl border border-slate-800">
                <button
                  type="button"
                  onClick={() => setActiveInputMode('form')}
                  className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                    activeInputMode === 'form'
                      ? 'bg-amber-500 text-slate-950 shadow-md shadow-amber-500/20 font-bold'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  Key Fields
                </button>
                <button
                  type="button"
                  onClick={() => setActiveInputMode('pasteJson')}
                  className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                    activeInputMode === 'pasteJson'
                      ? 'bg-amber-500 text-slate-950 shadow-md shadow-amber-500/20 font-bold'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  Quick Paste Code / JSON
                </button>
              </div>

              <a
                href="https://console.firebase.google.com"
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-1.5 text-xs text-amber-400 hover:text-amber-300 hover:underline font-medium"
              >
                <span>Firebase Console</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </a>
            </div>

            {/* Scrollable Content Body */}
            <div className="space-y-4 overflow-y-auto pr-1 flex-1">
              {activeInputMode === 'pasteJson' ? (
                /* QUICK PASTE TAB */
                <div className="space-y-3 p-4 rounded-2xl bg-slate-950 border border-slate-800">
                  <label className="block text-xs font-semibold text-slate-300">
                    Paste your Firebase config code from Firebase Console:
                  </label>
                  <textarea
                    rows={8}
                    value={rawJsonInput}
                    onChange={(e) => setRawJsonInput(e.target.value)}
                    placeholder={`const firebaseConfig = {
  apiKey: "AIzaSy...",
  authDomain: "my-app.firebaseapp.com",
  projectId: "my-app",
  storageBucket: "my-app.firebasestorage.app",
  messagingSenderId: "123456789",
  appId: "1:123456789:web:abcdef"
};`}
                    className="w-full px-3.5 py-3 rounded-xl bg-slate-900 border border-slate-800 text-amber-300 font-mono text-xs focus:outline-none focus:border-amber-500 resize-none leading-relaxed"
                  />
                  <button
                    type="button"
                    onClick={handleParseJson}
                    className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs shadow-lg shadow-amber-500/20 transition-all active:scale-[0.99]"
                  >
                    <Sparkles className="w-4 h-4" />
                    <span>Auto-Extract & Fill Fields</span>
                  </button>
                </div>
              ) : (
                /* FORM FIELDS TAB */
                <div className="space-y-3">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-[11px] font-bold text-slate-300 uppercase tracking-wider mb-1 flex items-center gap-1.5">
                        <Key className="w-3.5 h-3.5 text-amber-400" />
                        <span>API Key</span>
                      </label>
                      <input
                        type="text"
                        value={config.apiKey}
                        onChange={(e) => handleFieldChange('apiKey', e.target.value)}
                        placeholder="AIzaSy..."
                        className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-slate-100 text-xs font-mono focus:outline-none focus:border-amber-500"
                      />
                    </div>

                    <div>
                      <label className="block text-[11px] font-bold text-slate-300 uppercase tracking-wider mb-1 flex items-center gap-1.5">
                        <Database className="w-3.5 h-3.5 text-blue-400" />
                        <span>Project ID</span>
                      </label>
                      <input
                        type="text"
                        value={config.projectId}
                        onChange={(e) => handleFieldChange('projectId', e.target.value)}
                        placeholder="my-clipzone-project"
                        className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-slate-100 text-xs font-mono focus:outline-none focus:border-amber-500"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-[11px] font-bold text-slate-300 uppercase tracking-wider mb-1 flex items-center gap-1.5">
                        <Shield className="w-3.5 h-3.5 text-emerald-400" />
                        <span>Auth Domain</span>
                      </label>
                      <input
                        type="text"
                        value={config.authDomain}
                        onChange={(e) => handleFieldChange('authDomain', e.target.value)}
                        placeholder="my-clipzone.firebaseapp.com"
                        className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-slate-100 text-xs font-mono focus:outline-none focus:border-amber-500"
                      />
                    </div>

                    <div>
                      <label className="block text-[11px] font-bold text-slate-300 uppercase tracking-wider mb-1 flex items-center gap-1.5">
                        <HardDrive className="w-3.5 h-3.5 text-pink-400" />
                        <span>Storage Bucket</span>
                      </label>
                      <input
                        type="text"
                        value={config.storageBucket}
                        onChange={(e) => handleFieldChange('storageBucket', e.target.value)}
                        placeholder="my-clipzone.firebasestorage.app"
                        className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-slate-100 text-xs font-mono focus:outline-none focus:border-amber-500"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-[11px] font-bold text-slate-300 uppercase tracking-wider mb-1">
                        Messaging Sender ID
                      </label>
                      <input
                        type="text"
                        value={config.messagingSenderId}
                        onChange={(e) => handleFieldChange('messagingSenderId', e.target.value)}
                        placeholder="123456789012"
                        className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-slate-100 text-xs font-mono focus:outline-none focus:border-amber-500"
                      />
                    </div>

                    <div>
                      <label className="block text-[11px] font-bold text-slate-300 uppercase tracking-wider mb-1">
                        App ID
                      </label>
                      <input
                        type="text"
                        value={config.appId}
                        onChange={(e) => handleFieldChange('appId', e.target.value)}
                        placeholder="1:123456789012:web:..."
                        className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-slate-100 text-xs font-mono focus:outline-none focus:border-amber-500"
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* Status Test Result Banner */}
              {testResult && (
                <div
                  className={`p-3.5 rounded-2xl border text-xs flex flex-col gap-2 ${
                    testResult.success
                      ? 'bg-emerald-950/40 border-emerald-500/30 text-emerald-300'
                      : 'bg-rose-950/40 border-rose-500/30 text-rose-300'
                  }`}
                >
                  <div className="flex items-center gap-2 font-bold">
                    {testResult.success ? (
                      <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                    ) : (
                      <AlertTriangle className="w-4 h-4 text-rose-400 shrink-0" />
                    )}
                    <span>{testResult.message}</span>
                  </div>

                  {testResult.success && (
                    <div className="flex items-center gap-4 text-[11px] font-mono pl-6">
                      <span className="flex items-center gap-1 text-emerald-400">
                        ✓ Auth Ready
                      </span>
                      <span className="flex items-center gap-1 text-emerald-400">
                        ✓ Firestore Database Ready
                      </span>
                      <span className="flex items-center gap-1 text-emerald-400">
                        ✓ Storage Bucket Ready
                      </span>
                    </div>
                  )}
                </div>
              )}

              {/* Help & Documentation Guide */}
              <div className="p-3.5 rounded-2xl bg-slate-950/70 border border-slate-800 space-y-2">
                <div className="flex items-center gap-1.5 text-xs font-bold text-slate-300">
                  <HelpCircle className="w-3.5 h-3.5 text-amber-400" />
                  <span>How to get these keys from Firebase:</span>
                </div>
                <ol className="text-[11px] text-slate-400 list-decimal list-inside space-y-1 leading-relaxed">
                  <li>Go to <strong className="text-slate-200">Firebase Console</strong> & create or select your project.</li>
                  <li>Click <strong className="text-slate-200">Project Settings</strong> (gear icon at top left).</li>
                  <li>Under <strong className="text-slate-200">Your Apps</strong>, add or select your Web app (<code className="text-amber-300">&lt;/&gt;</code>).</li>
                  <li>Enable <strong className="text-slate-200">Authentication</strong> (Email/Password), <strong className="text-slate-200">Firestore Database</strong>, and <strong className="text-slate-200">Storage</strong> in test mode.</li>
                  <li>Copy and paste the configuration object above!</li>
                </ol>
              </div>
            </div>

            {/* Footer Actions */}
            <div className="pt-4 border-t border-slate-800 flex flex-wrap items-center justify-between gap-3 shrink-0">
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={handleTestConnection}
                  disabled={isTesting || !config.apiKey}
                  className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 disabled:opacity-50 text-slate-200 text-xs font-semibold border border-slate-700 transition-all active:scale-95"
                >
                  {isTesting ? (
                    <RefreshCw className="w-3.5 h-3.5 animate-spin text-amber-400" />
                  ) : (
                    <Shield className="w-3.5 h-3.5 text-amber-400" />
                  )}
                  <span>{isTesting ? 'Testing...' : 'Test Connection'}</span>
                </button>

                <button
                  type="button"
                  onClick={handleReset}
                  className="p-2.5 rounded-xl text-rose-400 hover:text-rose-300 hover:bg-rose-500/10 border border-transparent hover:border-rose-500/20 text-xs font-semibold transition-all"
                  title="Clear Config"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold transition-colors"
                >
                  Close
                </button>

                <button
                  type="button"
                  onClick={handleSave}
                  className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-bold shadow-lg shadow-amber-500/20 transition-all active:scale-95"
                >
                  <Save className="w-4 h-4" />
                  <span>Save Firebase Keys</span>
                </button>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
