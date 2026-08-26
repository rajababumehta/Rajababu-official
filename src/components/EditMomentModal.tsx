import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  X,
  Edit2,
  Heart,
  Calendar,
  Tag,
  Trash2,
  CheckCircle2,
  Sparkles,
  Link,
  Image as ImageIcon,
} from 'lucide-react';
import { Language, Moment } from '../types';
import { generateLikesFromPreset, formatLikes } from '../utils/likesFormatter';

interface EditMomentModalProps {
  moment: Moment | null;
  isOpen: boolean;
  onClose: () => void;
  language: Language;
  onUpdateMoment: (updated: Moment) => void;
  onDeleteMoment: (id: string) => void;
  onShowToast: (text: string, type: 'success' | 'error' | 'info') => void;
}

export const EditMomentModal: React.FC<EditMomentModalProps> = ({
  moment,
  isOpen,
  onClose,
  language,
  onUpdateMoment,
  onDeleteMoment,
  onShowToast,
}) => {
  const [titleEn, setTitleEn] = useState('');
  const [titleNe, setTitleNe] = useState('');
  const [descEn, setDescEn] = useState('');
  const [descNe, setDescNe] = useState('');
  const [category, setCategory] = useState('Technology');
  const [eventDate, setEventDate] = useState('');
  const [imgUrl, setImgUrl] = useState('');
  const [likes, setLikes] = useState<number>(0);
  const [customLikesInput, setCustomLikesInput] = useState<string>('');
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  useEffect(() => {
    if (moment) {
      setTitleEn(moment.titleEn);
      setTitleNe(moment.titleNe);
      setDescEn(moment.descEn);
      setDescNe(moment.descNe);
      setCategory(moment.category);
      setEventDate(moment.date);
      setImgUrl(moment.imgUrl);
      setLikes(moment.likes);
      setCustomLikesInput(moment.likes.toString());
      setShowDeleteConfirm(false);
    }
  }, [moment]);

  if (!moment) return null;

  const categories = ['Technology', 'Community', 'Networking', 'Professional', 'Milestone', 'Personal'];

  const handleApplyPreset = (preset: '200' | '300' | '1k' | 'random') => {
    const newLikes = generateLikesFromPreset(preset);
    setLikes(newLikes);
    setCustomLikesInput(newLikes.toString());
  };

  const handleCustomLikesChange = (val: string) => {
    setCustomLikesInput(val);
    const parsed = parseInt(val, 10);
    if (!isNaN(parsed)) {
      setLikes(parsed);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!imgUrl.trim()) {
      onShowToast(
        language === 'NE' ? 'कृपया मान्य तस्बिर लिंक (URL) प्रविष्ट गर्नुहोस्।' : 'Please provide a valid image link URL.',
        'error'
      );
      return;
    }

    const updated: Moment = {
      ...moment,
      titleEn: titleEn.trim() || moment.titleEn,
      titleNe: titleNe.trim() || moment.titleNe,
      descEn: descEn.trim() || moment.descEn,
      descNe: descNe.trim() || moment.descNe,
      imgUrl: imgUrl.trim(),
      category,
      date: eventDate,
      likes: Math.max(0, likes),
    };

    onUpdateMoment(updated);
    onShowToast(
      language === 'NE' ? 'तस्बिर विवरण अद्यावधिक भयो!' : 'Moment details updated successfully!',
      'success'
    );
    onClose();
  };

  const handleDelete = () => {
    onDeleteMoment(moment.id);
    onShowToast(
      language === 'NE'
        ? 'तस्बिर स्थायी रूपमा मेटाइयो (रिकभर हुने छैन)।'
        : 'Moment permanently deleted (cannot be recovered).',
      'info'
    );
    onClose();
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
            className="relative w-full max-w-2xl rounded-3xl bg-slate-900 border border-slate-800 shadow-2xl p-6 sm:p-8 my-auto overflow-hidden max-h-[90vh] flex flex-col"
          >
            {/* Header */}
            <div className="flex items-center justify-between pb-4 border-b border-slate-800 mb-6 shrink-0">
              <div className="flex items-center gap-3">
                <div className="p-2.5 rounded-xl bg-blue-600/10 border border-blue-500/20 text-blue-400">
                  <Edit2 className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-slate-100 font-heading">
                    {language === 'NE' ? 'तस्बिर विवरण सम्पादन (लिङ्क मार्फत)' : 'Edit Moment & Photo Link'}
                  </h3>
                  <p className="text-xs text-slate-400">
                    ID: <span className="font-mono text-slate-300">{moment.id}</span>
                  </p>
                </div>
              </div>
              <button
                onClick={onClose}
                className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
                aria-label="Close dialog"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit} className="space-y-5 overflow-y-auto pr-1 flex-1">
              {/* Photo Display & Direct Image Link URL */}
              <div className="p-4 sm:p-5 rounded-2xl bg-slate-950 border border-blue-500/20 space-y-4">
                <label className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-blue-400">
                  <Link className="w-4 h-4 text-blue-400" />
                  <span>{language === 'NE' ? 'तस्बिर वेब लिंक (Image URL)' : 'Photo Web Link (Image URL)'}</span>
                </label>

                <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
                  <div className="relative w-28 h-28 rounded-2xl overflow-hidden bg-slate-900 border-2 border-slate-800 flex items-center justify-center shrink-0 shadow-lg">
                    {imgUrl ? (
                      <img
                        src={imgUrl}
                        alt={titleEn}
                        referrerPolicy="no-referrer"
                        className="max-h-full max-w-full object-cover"
                      />
                    ) : (
                      <ImageIcon className="w-8 h-8 text-slate-600" />
                    )}
                  </div>

                  <div className="flex-1 w-full space-y-2">
                    <div className="relative">
                      <input
                        type="url"
                        value={imgUrl}
                        onChange={(e) => setImgUrl(e.target.value)}
                        placeholder="https://blogger.googleusercontent.com/..."
                        className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-slate-100 text-xs font-mono focus:outline-none focus:border-blue-500"
                        required
                      />
                    </div>
                    <p className="text-[11px] text-slate-400">
                      {language === 'NE'
                        ? 'तस्बिर केवल वेब लिंक (URL) मार्फत परिवर्तन गर्न सकिन्छ।'
                        : 'Photo is changed strictly through image link URL.'}
                    </p>
                  </div>
                </div>
              </div>

              {/* Likes Adjustment Box */}
              <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800">
                <div className="flex items-center justify-between mb-3">
                  <label className="text-xs font-bold uppercase tracking-wider text-pink-400 flex items-center gap-1.5">
                    <Heart className="w-4 h-4 fill-pink-400" />
                    <span>{language === 'NE' ? 'लाइक्स संख्या समायोजन' : 'Engagement Likes Adjustment'}</span>
                  </label>
                  <span className="text-sm font-mono font-bold text-pink-400">
                    {formatLikes(likes)} likes ({likes})
                  </span>
                </div>

                <div className="grid grid-cols-4 gap-2 mb-3">
                  <button
                    type="button"
                    onClick={() => handleApplyPreset('200')}
                    className="py-1.5 px-2 rounded-xl bg-slate-900 hover:bg-pink-600/20 text-slate-300 hover:text-pink-300 border border-slate-800 text-xs font-bold transition-all"
                  >
                    +200
                  </button>
                  <button
                    type="button"
                    onClick={() => handleApplyPreset('300')}
                    className="py-1.5 px-2 rounded-xl bg-slate-900 hover:bg-pink-600/20 text-slate-300 hover:text-pink-300 border border-slate-800 text-xs font-bold transition-all"
                  >
                    +300
                  </button>
                  <button
                    type="button"
                    onClick={() => handleApplyPreset('1k')}
                    className="py-1.5 px-2 rounded-xl bg-slate-900 hover:bg-pink-600/20 text-slate-300 hover:text-pink-300 border border-slate-800 text-xs font-bold transition-all"
                  >
                    +1.0k
                  </button>
                  <button
                    type="button"
                    onClick={() => handleApplyPreset('random')}
                    className="py-1.5 px-2 rounded-xl bg-slate-900 hover:bg-purple-600/20 text-slate-300 hover:text-purple-300 border border-slate-800 text-xs font-bold transition-all"
                  >
                    Random
                  </button>
                </div>

                <div>
                  <input
                    type="number"
                    min={0}
                    value={customLikesInput}
                    onChange={(e) => handleCustomLikesChange(e.target.value)}
                    placeholder="Enter custom count"
                    className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-800 text-slate-100 text-xs font-mono focus:outline-none focus:border-pink-500"
                  />
                </div>
              </div>

              {/* Title EN & NE */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                    {language === 'NE' ? 'शीर्षक (English)' : 'Title (English)'}
                  </label>
                  <input
                    type="text"
                    value={titleEn}
                    onChange={(e) => setTitleEn(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-slate-100 text-xs focus:outline-none focus:border-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                    {language === 'NE' ? 'शीर्षक (नेपाली)' : 'Title (Nepali)'}
                  </label>
                  <input
                    type="text"
                    value={titleNe}
                    onChange={(e) => setTitleNe(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-slate-100 text-xs focus:outline-none focus:border-blue-500"
                  />
                </div>
              </div>

              {/* Description EN & NE */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                    {language === 'NE' ? 'विवरण (English)' : 'Description (English)'}
                  </label>
                  <textarea
                    rows={2}
                    value={descEn}
                    onChange={(e) => setDescEn(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-slate-100 text-xs focus:outline-none focus:border-blue-500 resize-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                    {language === 'NE' ? 'विवरण (नेपाली)' : 'Description (Nepali)'}
                  </label>
                  <textarea
                    rows={2}
                    value={descNe}
                    onChange={(e) => setDescNe(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-slate-100 text-xs focus:outline-none focus:border-blue-500 resize-none"
                  />
                </div>
              </div>

              {/* Category & Date */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1.5 flex items-center gap-1.5">
                    <Tag className="w-3.5 h-3.5 text-blue-400" />
                    <span>{language === 'NE' ? 'विधा / श्रेणी' : 'Category'}</span>
                  </label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-slate-100 text-xs focus:outline-none focus:border-blue-500"
                  >
                    {categories.map((c) => (
                      <option key={c} value={c}>
                        {c}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1.5 flex items-center gap-1.5">
                    <Calendar className="w-3.5 h-3.5 text-indigo-400" />
                    <span>{language === 'NE' ? 'मिति' : 'Date'}</span>
                  </label>
                  <input
                    type="date"
                    value={eventDate}
                    onChange={(e) => setEventDate(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-slate-100 text-xs focus:outline-none focus:border-blue-500"
                  />
                </div>
              </div>

              {/* Actions Footer */}
              <div className="pt-4 border-t border-slate-800 flex items-center justify-between shrink-0">
                <button
                  type="button"
                  onClick={() => setShowDeleteConfirm(true)}
                  className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-rose-600/10 hover:bg-rose-600 text-rose-400 hover:text-white border border-rose-500/20 text-xs font-semibold transition-all active:scale-95"
                >
                  <Trash2 className="w-4 h-4" />
                  <span>{language === 'NE' ? 'तस्बिर मेटाउनुहोस्' : 'Delete Photo'}</span>
                </button>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={onClose}
                    className="px-5 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold transition-colors"
                  >
                    {language === 'NE' ? 'रद्द गर्नुहोस्' : 'Cancel'}
                  </button>

                  <button
                    type="submit"
                    className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold shadow-lg shadow-blue-600/30 transition-all active:scale-95"
                  >
                    <CheckCircle2 className="w-4 h-4" />
                    <span>{language === 'NE' ? 'परिवर्तन सुरक्षित गर्नुहोस्' : 'Save Changes'}</span>
                  </button>
                </div>
              </div>
            </form>

            {/* Permanent Delete Confirmation Submodal */}
            <AnimatePresence>
              {showDeleteConfirm && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="absolute inset-0 z-50 bg-slate-950/90 backdrop-blur-md flex items-center justify-center p-6"
                >
                  <motion.div
                    initial={{ scale: 0.9, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    exit={{ scale: 0.9, opacity: 0 }}
                    className="w-full max-w-md bg-slate-900 border border-rose-500/40 rounded-2xl p-6 shadow-2xl space-y-4"
                  >
                    <div className="flex items-center gap-3 text-rose-400">
                      <Trash2 className="w-6 h-6" />
                      <h4 className="text-base font-bold text-slate-100">
                        {language === 'NE' ? 'के तपाईँ यो तस्बिर मेटाउन निश्चित हुनुहुन्छ?' : 'Permanently Delete this Photo?'}
                      </h4>
                    </div>

                    <p className="text-xs text-slate-300 leading-relaxed">
                      {language === 'NE'
                        ? 'यो कार्य स्थायी हुनेछ र ग्यालरीबाट यो तस्बिर हट्नेछ।'
                        : 'This action is irreversible and will remove this moment permanently from your portfolio gallery.'}
                    </p>

                    <div className="flex items-center justify-end gap-3 pt-2">
                      <button
                        type="button"
                        onClick={() => setShowDeleteConfirm(false)}
                        className="px-4 py-2 rounded-xl bg-slate-800 text-slate-300 text-xs font-semibold hover:bg-slate-700 transition-colors"
                      >
                        {language === 'NE' ? 'रद्द गर्नुहोस्' : 'Cancel'}
                      </button>
                      <button
                        type="button"
                        onClick={handleDelete}
                        className="px-4 py-2 rounded-xl bg-rose-600 text-white text-xs font-bold hover:bg-rose-500 shadow-lg shadow-rose-600/30 transition-colors"
                      >
                        {language === 'NE' ? 'हो, मेटाउनुहोस्' : 'Yes, Delete Permanently'}
                      </button>
                    </div>
                  </motion.div>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
