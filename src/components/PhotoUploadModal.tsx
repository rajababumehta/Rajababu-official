import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  X,
  Image as ImageIcon,
  Heart,
  Calendar,
  Tag,
  CheckCircle2,
  Trash2,
  Sparkles,
  Link,
  Plus,
  ExternalLink,
  AlertCircle,
} from 'lucide-react';
import { Language, Moment } from '../types';
import { generateLikesFromPreset, formatLikes } from '../utils/likesFormatter';

interface UrlItem {
  id: string;
  url: string;
  name: string;
}

interface PhotoUploadModalProps {
  isOpen: boolean;
  onClose: () => void;
  language: Language;
  onAddMoment: (moment: Moment) => void;
  onShowToast: (text: string, type: 'success' | 'error' | 'info') => void;
}

export const PhotoUploadModal: React.FC<PhotoUploadModalProps> = ({
  isOpen,
  onClose,
  language,
  onAddMoment,
  onShowToast,
}) => {
  const [currentUrl, setCurrentUrl] = useState('');
  const [urlList, setUrlList] = useState<UrlItem[]>([]);
  const [activeUrlIndex, setActiveUrlIndex] = useState<number>(0);
  const [urlError, setUrlError] = useState(false);

  // Metadata form states
  const [titleEn, setTitleEn] = useState('');
  const [titleNe, setTitleNe] = useState('');
  const [descEn, setDescEn] = useState('');
  const [descNe, setDescNe] = useState('');
  const [category, setCategory] = useState('Technology');
  const [customCategory, setCustomCategory] = useState('');
  const [eventDate, setEventDate] = useState(new Date().toISOString().split('T')[0]);

  // Auto-likes preset selection
  const [likePreset, setLikePreset] = useState<'200' | '300' | '1k' | 'random' | 'custom'>('200');
  const [customLikesVal, setCustomLikesVal] = useState<number>(350);

  const predefinedCategories = ['Technology', 'Community', 'Networking', 'Professional', 'Milestone', 'Personal', 'Other'];

  const handleAddUrl = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const cleanUrl = currentUrl.trim();
    if (!cleanUrl) {
      onShowToast(
        language === 'NE' ? 'कृपया तस्बिरको मान्य वेब लिङ्क (URL) राख्नुहोस्।' : 'Please enter a valid image web URL link.',
        'error'
      );
      return;
    }

    if (!cleanUrl.startsWith('http://') && !cleanUrl.startsWith('https://') && !cleanUrl.startsWith('data:image/')) {
      onShowToast(
        language === 'NE' ? 'URL https:// वा http:// बाट सुरु हुनुपर्छ।' : 'URL must begin with https:// or http://',
        'error'
      );
      return;
    }

    const newItem: UrlItem = {
      id: `link-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
      url: cleanUrl,
      name: `Photo Link ${urlList.length + 1}`,
    };

    setUrlList((prev) => [...prev, newItem]);
    setCurrentUrl('');
    setUrlError(false);
    onShowToast(
      language === 'NE' ? 'तस्बिर लिङ्क सफलतापूर्वक थपियो!' : 'Image link attached successfully!',
      'success'
    );
  };

  const handleRemoveUrl = (indexToRemove: number) => {
    setUrlList((prev) => {
      const updated = prev.filter((_, idx) => idx !== indexToRemove);
      if (activeUrlIndex >= updated.length) {
        setActiveUrlIndex(Math.max(0, updated.length - 1));
      }
      return updated;
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    // If no queued items but user has an input in the field, add it automatically
    let itemsToProcess = [...urlList];
    if (itemsToProcess.length === 0 && currentUrl.trim()) {
      const cleanUrl = currentUrl.trim();
      itemsToProcess = [
        {
          id: `link-${Date.now()}`,
          url: cleanUrl,
          name: titleEn.trim() || 'Photo Link 1',
        },
      ];
    }

    if (itemsToProcess.length === 0) {
      onShowToast(
        language === 'NE'
          ? 'कृपया पहिले तस्बिरको लिङ्क (URL) प्रविष्ट गर्नुहोस्।'
          : 'Please enter at least one photo link URL.',
        'error'
      );
      return;
    }

    const finalCategory = category === 'Other' ? (customCategory.trim() || 'General') : category;

    if (itemsToProcess.length === 1) {
      const targetItem = itemsToProcess[0];
      const generatedLikes = generateLikesFromPreset(likePreset, customLikesVal);

      const newMoment: Moment = {
        id: `moment-user-${Date.now()}`,
        titleEn: titleEn.trim() || 'Visual Milestone Moment',
        titleNe: titleNe.trim() || (titleEn.trim() || 'दृश्यात्मक माइलस्टोन'),
        descEn: descEn.trim() || 'Empowering leadership, community collaboration, and technological growth.',
        descNe: descNe.trim() || (descEn.trim() || 'सशक्त नेतृत्व, सामुदायिक सहकार्य र प्राविधिक विकास।'),
        imgUrl: targetItem.url,
        likes: generatedLikes,
        category: finalCategory,
        date: eventDate,
        isUserUploaded: true,
        uploadedAt: new Date().toISOString(),
      };

      onAddMoment(newMoment);
    } else {
      // Multiple image links batch addition
      itemsToProcess.forEach((item, index) => {
        const generatedLikes = generateLikesFromPreset(likePreset, customLikesVal);
        const itemTitleEn = index === 0 && titleEn.trim() ? titleEn.trim() : `Visual Moment ${index + 1}`;
        const itemTitleNe = index === 0 && titleNe.trim() ? titleNe.trim() : itemTitleEn;

        const newMoment: Moment = {
          id: `moment-user-${Date.now()}-${index}`,
          titleEn: itemTitleEn,
          titleNe: itemTitleNe,
          descEn: descEn.trim() || 'Empowering leadership, community collaboration, and technological growth.',
          descNe: descNe.trim() || 'सशक्त नेतृत्व, सामुदायिक सहकार्य र प्राविधिक विकास।',
          imgUrl: item.url,
          likes: generatedLikes,
          category: finalCategory,
          date: eventDate,
          isUserUploaded: true,
          uploadedAt: new Date().toISOString(),
        };

        onAddMoment(newMoment);
      });
    }

    onShowToast(
      language === 'NE'
        ? `${itemsToProcess.length} नयाँ तस्बिर लिङ्क(हरू) ग्यालरीमा सुरक्षित भयो!`
        : `${itemsToProcess.length} photo link(s) added to gallery!`,
      'success'
    );

    // Reset & close
    setUrlList([]);
    setCurrentUrl('');
    setTitleEn('');
    setTitleNe('');
    setDescEn('');
    setDescNe('');
    setCustomCategory('');
    onClose();
  };

  const activePreviewUrl = urlList[activeUrlIndex]?.url || currentUrl.trim();

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
            className="relative w-full max-w-3xl rounded-3xl bg-slate-900 border border-slate-800 shadow-2xl p-6 sm:p-8 my-auto overflow-hidden max-h-[90vh] flex flex-col"
          >
            {/* Modal Header */}
            <div className="flex items-center justify-between pb-4 border-b border-slate-800 mb-6 shrink-0">
              <div className="flex items-center gap-3">
                <div className="p-2.5 rounded-xl bg-blue-600/10 border border-blue-500/20 text-blue-400">
                  <Link className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-slate-100 font-heading">
                    {language === 'NE' ? 'तस्बिर लिङ्क (URL) मार्फत थप्नुहोस्' : 'Add Photo via Image Link (URL)'}
                  </h3>
                  <p className="text-xs text-slate-400">
                    {language === 'NE'
                      ? 'वेब, गुगल वा ब्लगरबाट सिधै तस्बिरको URL लिङ्क राख्नुहोस्'
                      : 'Attach and showcase photos using direct public web image URLs'}
                  </p>
                </div>
              </div>
              <button
                onClick={onClose}
                className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
                aria-label="Close modal"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Scrollable Form Body */}
            <form onSubmit={handleSubmit} className="space-y-6 overflow-y-auto pr-1 flex-1">
              
              {/* PRIMARY URL INPUT ZONE */}
              <div className="p-4 sm:p-5 rounded-2xl bg-slate-950 border border-blue-500/20 shadow-inner space-y-4">
                <div className="flex items-center justify-between">
                  <label className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-blue-400">
                    <Link className="w-4 h-4 text-blue-400" />
                    <span>{language === 'NE' ? 'तस्बिरको वेब URL लिङ्क' : 'Photo Image URL'}</span>
                  </label>
                  <span className="text-[11px] text-slate-400 font-mono">
                    Direct JPG, PNG, WebP or Blogger link
                  </span>
                </div>

                <div className="flex flex-col sm:flex-row items-stretch gap-2">
                  <div className="relative flex-1">
                    <input
                      type="url"
                      value={currentUrl}
                      onChange={(e) => {
                        setCurrentUrl(e.target.value);
                        setUrlError(false);
                      }}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                          e.preventDefault();
                          handleAddUrl();
                        }
                      }}
                      placeholder="https://blogger.googleusercontent.com/img/b/... or https://images.unsplash.com/..."
                      className="w-full pl-3.5 pr-10 py-3 rounded-xl bg-slate-900 border border-slate-700 text-slate-100 text-xs font-mono focus:outline-none focus:border-blue-500 transition-colors"
                    />
                    {currentUrl.trim() && !urlError && (
                      <CheckCircle2 className="w-4 h-4 text-emerald-400 absolute right-3.5 top-3.5" />
                    )}
                  </div>

                  <button
                    type="button"
                    onClick={() => handleAddUrl()}
                    className="inline-flex items-center justify-center gap-1.5 px-5 py-3 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold shadow-lg shadow-blue-600/30 transition-all active:scale-95 shrink-0"
                  >
                    <Plus className="w-4 h-4" />
                    <span>{language === 'NE' ? 'लिङ्क थप्नुहोस्' : 'Attach Link'}</span>
                  </button>
                </div>

                {/* Queue of attached links */}
                {urlList.length > 0 && (
                  <div className="space-y-2 pt-2 border-t border-slate-800">
                    <div className="flex items-center justify-between text-xs text-slate-300">
                      <span className="font-bold">
                        {language === 'NE' ? 'थपिएका तस्बिर लिङ्कहरू' : 'Attached Photo Links'} ({urlList.length})
                      </span>
                      <button
                        type="button"
                        onClick={() => setUrlList([])}
                        className="text-[11px] text-rose-400 hover:text-rose-300 font-medium"
                      >
                        {language === 'NE' ? 'सबै हटाउनुहोस्' : 'Clear all'}
                      </button>
                    </div>

                    <div className="flex items-center gap-3 overflow-x-auto pb-2 no-scrollbar">
                      {urlList.map((item, idx) => (
                        <div
                          key={item.id}
                          onClick={() => setActiveUrlIndex(idx)}
                          className={`relative shrink-0 w-20 h-20 rounded-2xl overflow-hidden cursor-pointer border-2 transition-all group ${
                            activeUrlIndex === idx
                              ? 'border-blue-500 scale-105 shadow-md shadow-blue-500/20'
                              : 'border-slate-800 opacity-70 hover:opacity-100'
                          }`}
                        >
                          <img
                            src={item.url}
                            alt={item.name}
                            onError={(e) => {
                              (e.target as HTMLImageElement).src =
                                'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=500&auto=format&fit=crop&q=80';
                            }}
                            referrerPolicy="no-referrer"
                            className="w-full h-full object-cover"
                          />
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleRemoveUrl(idx);
                            }}
                            className="absolute top-1 right-1 p-1 rounded-lg bg-slate-950/80 text-rose-400 hover:bg-rose-600 hover:text-white transition-colors"
                            title="Remove link"
                          >
                            <Trash2 className="w-3 h-3" />
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Live Preview Display */}
                {activePreviewUrl && (
                  <div className="relative rounded-2xl overflow-hidden bg-slate-900 border border-slate-800 p-2 flex items-center justify-center min-h-[180px] max-h-[260px]">
                    <img
                      src={activePreviewUrl}
                      alt="Link Preview"
                      referrerPolicy="no-referrer"
                      onError={() => setUrlError(true)}
                      className="max-h-[240px] max-w-full object-contain rounded-xl drop-shadow-xl"
                    />
                    {urlError ? (
                      <div className="absolute inset-0 bg-slate-950/90 flex flex-col items-center justify-center p-4 text-center">
                        <AlertCircle className="w-8 h-8 text-rose-400 mb-2" />
                        <p className="text-xs text-rose-300 font-semibold">
                          {language === 'NE' ? 'तस्बिर लोड हुन सकेन। कृपया URL जाँच गर्नुहोस्।' : 'Unable to load image preview. Please verify URL is accessible.'}
                        </p>
                      </div>
                    ) : (
                      <div className="absolute bottom-3 left-3 px-2.5 py-1 rounded-lg bg-slate-950/80 backdrop-blur text-[11px] font-mono text-slate-300 border border-slate-800 flex items-center gap-1.5">
                        <CheckCircle2 className="w-3 h-3 text-emerald-400" />
                        <span>Live Preview Ready</span>
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* Auto-Likes Engine Selector */}
              <div className="p-4 rounded-2xl bg-slate-950/80 border border-slate-800">
                <div className="flex items-center justify-between mb-3">
                  <label className="text-xs font-bold uppercase tracking-wider text-pink-400 flex items-center gap-1.5">
                    <Heart className="w-4 h-4 fill-pink-400" />
                    <span>{language === 'NE' ? 'स्वतः-लाइक्स इन्जिन (Auto-Likes)' : 'Auto-Likes Generator Engine'}</span>
                  </label>
                  <span className="text-xs font-mono font-bold text-slate-300">
                    Est: ~{formatLikes(generateLikesFromPreset(likePreset, customLikesVal))} likes
                  </span>
                </div>

                <div className="grid grid-cols-3 sm:grid-cols-5 gap-2">
                  <button
                    type="button"
                    onClick={() => setLikePreset('200')}
                    className={`py-2 px-2 rounded-xl text-xs font-bold transition-all ${
                      likePreset === '200'
                        ? 'bg-pink-600 text-white shadow-md shadow-pink-600/30'
                        : 'bg-slate-900 text-slate-400 hover:text-slate-200 border border-slate-800'
                    }`}
                  >
                    200+
                  </button>

                  <button
                    type="button"
                    onClick={() => setLikePreset('300')}
                    className={`py-2 px-2 rounded-xl text-xs font-bold transition-all ${
                      likePreset === '300'
                        ? 'bg-pink-600 text-white shadow-md shadow-pink-600/30'
                        : 'bg-slate-900 text-slate-400 hover:text-slate-200 border border-slate-800'
                    }`}
                  >
                    300+
                  </button>

                  <button
                    type="button"
                    onClick={() => setLikePreset('1k')}
                    className={`py-2 px-2 rounded-xl text-xs font-bold transition-all ${
                      likePreset === '1k'
                        ? 'bg-pink-600 text-white shadow-md shadow-pink-600/30'
                        : 'bg-slate-900 text-slate-400 hover:text-slate-200 border border-slate-800'
                    }`}
                  >
                    1.0k+
                  </button>

                  <button
                    type="button"
                    onClick={() => setLikePreset('random')}
                    className={`py-2 px-2 rounded-xl text-xs font-bold transition-all ${
                      likePreset === 'random'
                        ? 'bg-purple-600 text-white shadow-md shadow-purple-600/30'
                        : 'bg-slate-900 text-slate-400 hover:text-slate-200 border border-slate-800'
                    }`}
                  >
                    Random
                  </button>

                  <button
                    type="button"
                    onClick={() => setLikePreset('custom')}
                    className={`py-2 px-2 rounded-xl text-xs font-bold transition-all ${
                      likePreset === 'custom'
                        ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/30'
                        : 'bg-slate-900 text-slate-400 hover:text-slate-200 border border-slate-800'
                    }`}
                  >
                    Custom
                  </button>
                </div>

                {likePreset === 'custom' && (
                  <div className="mt-3">
                    <input
                      type="number"
                      min={0}
                      value={customLikesVal}
                      onChange={(e) => setCustomLikesVal(parseInt(e.target.value, 10) || 0)}
                      placeholder="Enter exact like count"
                      className="w-full px-3.5 py-2 rounded-xl bg-slate-900 border border-slate-700 text-slate-100 text-xs font-mono focus:outline-none focus:border-pink-500"
                    />
                  </div>
                )}
              </div>

              {/* Title & Description Fields */}
              <div className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                      {language === 'NE' ? 'शीर्षक (अंग्रेजी)' : 'Moment Title (English)'}
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. Community Tech Summit 2026"
                      value={titleEn}
                      onChange={(e) => setTitleEn(e.target.value)}
                      className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-slate-100 text-xs focus:outline-none focus:border-blue-500"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                      {language === 'NE' ? 'शीर्षक (नेपाली)' : 'Moment Title (Nepali)'}
                    </label>
                    <input
                      type="text"
                      placeholder="उदा: सामुदायिक प्रविधि सम्मेलन"
                      value={titleNe}
                      onChange={(e) => setTitleNe(e.target.value)}
                      className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-slate-100 text-xs focus:outline-none focus:border-blue-500"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                      {language === 'NE' ? 'विवरण (अंग्रेजी)' : 'Description (English)'}
                    </label>
                    <textarea
                      rows={2}
                      placeholder="Key highlights and context of this moment..."
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
                      placeholder="यस क्षणका मुख्य उपलब्धि र सन्दर्भ..."
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
                      {predefinedCategories.map((c) => (
                        <option key={c} value={c}>
                          {c}
                        </option>
                      ))}
                    </select>

                    {category === 'Other' && (
                      <input
                        type="text"
                        placeholder="Custom category name"
                        value={customCategory}
                        onChange={(e) => setCustomCategory(e.target.value)}
                        className="mt-2 w-full px-3.5 py-2 rounded-xl bg-slate-950 border border-slate-800 text-slate-100 text-xs focus:outline-none focus:border-blue-500"
                      />
                    )}
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1.5 flex items-center gap-1.5">
                      <Calendar className="w-3.5 h-3.5 text-indigo-400" />
                      <span>{language === 'NE' ? 'मिति' : 'Event Date'}</span>
                    </label>
                    <input
                      type="date"
                      value={eventDate}
                      onChange={(e) => setEventDate(e.target.value)}
                      className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-slate-100 text-xs focus:outline-none focus:border-blue-500"
                    />
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="pt-4 border-t border-slate-800 flex items-center justify-between shrink-0">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-5 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold transition-colors"
                >
                  {language === 'NE' ? 'रद्द गर्नुहोस्' : 'Cancel'}
                </button>

                <button
                  type="submit"
                  disabled={urlList.length === 0 && !currentUrl.trim()}
                  className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 disabled:opacity-50 disabled:cursor-not-allowed text-white text-xs font-semibold shadow-lg shadow-blue-600/30 transition-all active:scale-95"
                >
                  <CheckCircle2 className="w-4 h-4" />
                  <span>
                    {language === 'NE'
                      ? `${urlList.length || 1} तस्बिर लिङ्क ग्यालरीमा राख्नुहोस्`
                      : `Save ${urlList.length || 1} Photo Link(s) to Gallery`}
                  </span>
                </button>
              </div>
            </form>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
