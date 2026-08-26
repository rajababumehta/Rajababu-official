import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { AlertTriangle, Trash2, X, ShieldAlert } from 'lucide-react';
import { Moment, Language } from '../types';

interface DeleteConfirmModalProps {
  isOpen: boolean;
  moment: Moment | null;
  language: Language;
  onClose: () => void;
  onConfirmDelete: (momentId: string) => void;
}

export const DeleteConfirmModal: React.FC<DeleteConfirmModalProps> = ({
  isOpen,
  moment,
  language,
  onClose,
  onConfirmDelete,
}) => {
  const handleConfirm = () => {
    if (moment) {
      onConfirmDelete(moment.id);
      onClose();
    }
  };

  return (
    <AnimatePresence>
      {isOpen && moment && (
        <motion.div
          key="delete-confirm-overlay"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-950/90 backdrop-blur-md"
          onClick={onClose}
        >
          <motion.div
            key="delete-confirm-modal"
            initial={{ scale: 0.95, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.95, opacity: 0, y: 20 }}
            onClick={(e) => e.stopPropagation()}
            className="w-full max-w-md bg-slate-900 border border-rose-500/30 rounded-3xl p-6 shadow-2xl shadow-rose-950/60 overflow-hidden relative"
          >
            {/* Ambient Red Glow */}
            <div className="absolute -top-24 -right-24 w-48 h-48 bg-rose-600/20 rounded-full blur-3xl pointer-events-none" />

            {/* Header */}
            <div className="flex items-center justify-between mb-4 relative z-10">
              <div className="flex items-center gap-2.5 text-rose-400">
                <div className="p-2 rounded-xl bg-rose-500/10 border border-rose-500/20">
                  <ShieldAlert className="w-5 h-5 text-rose-500" />
                </div>
                <h3 className="text-base font-bold text-slate-100">
                  {language === 'NE' ? 'तस्बिर स्थायी रूपमा मेटाउनुहोस्' : 'Delete Photo Permanently'}
                </h3>
              </div>
              <button
                onClick={onClose}
                className="p-1.5 rounded-xl bg-slate-800/80 hover:bg-slate-700 text-slate-400 hover:text-slate-200 transition-colors"
                aria-label="Close dialog"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Photo Preview & Details */}
            <div className="relative z-10 mb-5 p-3 rounded-2xl bg-slate-950 border border-slate-800 flex items-center gap-3.5">
              <img
                src={moment.imgUrl}
                alt={moment.titleEn}
                referrerPolicy="no-referrer"
                className="w-16 h-16 rounded-xl object-cover border border-slate-800 bg-slate-900 shrink-0"
              />
              <div className="min-w-0 flex-1">
                <span className="px-2 py-0.5 rounded-md bg-blue-500/10 border border-blue-500/20 text-[10px] font-bold text-blue-400 mb-1 inline-block">
                  {moment.category}
                </span>
                <h4 className="text-xs font-bold text-slate-200 truncate">
                  {language === 'NE' ? moment.titleNe : moment.titleEn}
                </h4>
                <p className="text-[11px] text-slate-400 font-mono mt-0.5">
                  {moment.date}
                </p>
              </div>
            </div>

            {/* Warning Text */}
            <div className="relative z-10 mb-6 p-3.5 rounded-2xl bg-rose-950/30 border border-rose-500/20 flex items-start gap-3">
              <AlertTriangle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
              <p className="text-xs text-rose-200/90 leading-relaxed">
                {language === 'NE'
                  ? 'यो तस्बिर ग्यालरीबाट स्थायी रूपमा हटाइनेछ। मेटाइसकेपछि यसलाई पुनः रिकभर वा फिर्ता ल्याउन सकिँदैन।'
                  : 'This photo will be permanently deleted from the gallery and storage. It cannot be recovered or restored.'}
              </p>
            </div>

            {/* Action Buttons */}
            <div className="relative z-10 flex items-center justify-end gap-3">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold transition-colors"
              >
                {language === 'NE' ? 'रद्द गर्नुहोस्' : 'Cancel'}
              </button>

              <button
                type="button"
                onClick={handleConfirm}
                className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-500 text-white text-xs font-bold shadow-lg shadow-rose-600/30 transition-all active:scale-95"
              >
                <Trash2 className="w-4 h-4" />
                <span>{language === 'NE' ? 'हो, स्थायी मेटाउनुहोस्' : 'Yes, Delete Permanently'}</span>
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
