import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ShieldCheck, Sparkles, Lock, ArrowRight } from 'lucide-react';
import { Language } from '../types';

interface AdminShieldOverlayProps {
  isOpen: boolean;
  onClose: () => void;
  language: Language;
}

export const AdminShieldOverlay: React.FC<AdminShieldOverlayProps> = ({
  isOpen,
  onClose,
  language,
}) => {
  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-xl"
        >
          <motion.div
            initial={{ scale: 0.8, y: 20, opacity: 0 }}
            animate={{ scale: 1, y: 0, opacity: 1 }}
            exit={{ scale: 0.8, y: 20, opacity: 0 }}
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
            className="relative w-full max-w-md p-8 rounded-3xl bg-gradient-to-b from-slate-900 via-slate-900 to-slate-950 border border-blue-500/30 shadow-[0_0_50px_rgba(37,99,235,0.25)] text-center overflow-hidden"
          >
            {/* Ambient background glow */}
            <div className="absolute -top-24 -left-24 w-48 h-48 bg-blue-500/20 rounded-full blur-3xl pointer-events-none" />
            <div className="absolute -bottom-24 -right-24 w-48 h-48 bg-indigo-500/20 rounded-full blur-3xl pointer-events-none" />

            <div className="relative z-10 flex flex-col items-center">
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.15, type: 'spring', damping: 15 }}
                className="w-20 h-20 rounded-2xl bg-gradient-to-tr from-blue-600 to-indigo-500 p-0.5 shadow-lg shadow-blue-500/30 mb-6 flex items-center justify-center"
              >
                <div className="w-full h-full bg-slate-950 rounded-[14px] flex items-center justify-center relative">
                  <ShieldCheck className="w-10 h-10 text-blue-400 animate-pulse" />
                  <Sparkles className="w-4 h-4 text-emerald-400 absolute top-2 right-2" />
                </div>
              </motion.div>

              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-400 text-xs font-semibold uppercase tracking-wider mb-3">
                <Lock className="w-3.5 h-3.5" />
                {language === 'NE' ? 'सुरक्षित प्रशासक प्रमाणीकरण' : 'Secret Access Authorized'}
              </div>

              <h3 className="text-2xl font-bold text-slate-100 font-heading mb-2">
                {language === 'NE' ? 'प्रशासक पहुँच सक्रिय भयो!' : 'Admin Mode Unlocked!'}
              </h3>

              <p className="text-sm text-slate-400 leading-relaxed mb-6">
                {language === 'NE'
                  ? 'राजाबाबु मेहताको पोर्टफोलियो व्यवस्थापन प्रणालीमा स्वागत छ। अब तपाईँ नयाँ तस्बिर थप्न, मेटाउन र सम्पूर्ण सामग्री व्यवस्थापन गर्न सक्नुहुन्छ।'
                  : 'Welcome to Rajababu Mehta’s Content Management Engine. You now have privileged permissions to manage gallery moments, configure auto-likes, and customize all portfolio sections.'}
              </p>

              <button
                id="btn-confirm-admin-unlock"
                onClick={onClose}
                className="w-full flex items-center justify-center gap-2 py-3 px-6 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-medium shadow-lg shadow-blue-600/30 transition-all active:scale-[0.98]"
              >
                <span>{language === 'NE' ? 'ग्यालरी व्यवस्थापनमा जानुहोस्' : 'Proceed to Gallery CMS'}</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
