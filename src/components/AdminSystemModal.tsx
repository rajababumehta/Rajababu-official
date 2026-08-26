import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  X,
  Settings,
  User,
  Info,
  Briefcase,
  Mail,
  Zap,
  Save,
  RotateCcw,
  Plus,
  Trash2,
  CheckCircle2,
  Sparkles,
  Image,
  Eye,
  Edit2,
  Calendar,
  Layers,
  Link,
  Upload,
  Camera,
  FolderOpen,
  Loader2,
} from 'lucide-react';
import { SystemSettings, Language, StatItem, SkillItem, MilestoneItem, Moment } from '../types';
import { DEFAULT_SYSTEM_SETTINGS } from '../data/defaults';
import { uploadProfilePhoto } from '../services/firebase';

interface AdminSystemModalProps {
  isOpen: boolean;
  onClose: () => void;
  language: Language;
  systemSettings: SystemSettings;
  onSaveSystemSettings: (updated: SystemSettings) => void;
  onResetToDefaults: () => void;
  onAutoBoostAllLikes: () => void;
  onShowToast: (text: string, type: 'success' | 'error' | 'info') => void;
  moments?: Moment[];
  onDeleteMoment?: (id: string) => void;
  onOpenUploadModal?: () => void;
}

export const AdminSystemModal: React.FC<AdminSystemModalProps> = ({
  isOpen,
  onClose,
  language,
  systemSettings,
  onSaveSystemSettings,
  onResetToDefaults,
  onAutoBoostAllLikes,
  onShowToast,
  moments = [],
  onDeleteMoment,
  onOpenUploadModal,
}) => {
  const [activeTab, setActiveTab] = useState<'profile' | 'about' | 'experience' | 'contact' | 'autoLikes' | 'photos'>('profile');
  const [photoSearch, setPhotoSearch] = useState('');
  const [deletingMomentId, setDeletingMomentId] = useState<string | null>(null);
  const [showResetConfirm, setShowResetConfirm] = useState(false);
  const [draft, setDraft] = useState<SystemSettings>(systemSettings);

  // Profile image upload state
  const [isUploadingPhoto, setIsUploadingPhoto] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [showGalleryPicker, setShowGalleryPicker] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    setDraft(systemSettings);
  }, [systemSettings, isOpen]);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    const settingsWithTimestamp: SystemSettings = {
      ...draft,
      lastModified: Date.now(),
    };
    onSaveSystemSettings(settingsWithTimestamp);
    onShowToast(
      language === 'NE' ? 'साइट सेटिङ्स सफलतापूर्वक सुरक्षित भयो!' : 'System CMS settings saved successfully!',
      'success'
    );
    onClose();
  };

  const handleProfilePhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;
    const file = files[0];

    if (!file.type.startsWith('image/')) {
      onShowToast('Please select a valid image file (JPG, PNG, WebP).', 'error');
      return;
    }

    try {
      setIsUploadingPhoto(true);
      setUploadProgress(15);
      const result = await uploadProfilePhoto(file, (percent) => {
        setUploadProgress(percent);
      });

      updateProfile('heroImage', result.url);
      onShowToast(
        language === 'NE' ? 'प्रोफाइल तस्बिर सफलतापूर्वक लोड भयो!' : 'Profile photo updated successfully!',
        'success'
      );
    } catch (err: any) {
      console.error(err);
      onShowToast(err?.message || 'Failed to upload profile photo.', 'error');
    } finally {
      setIsUploadingPhoto(false);
      setUploadProgress(0);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const handleReset = () => {
    onResetToDefaults();
    onShowToast(language === 'NE' ? 'पूर्वनिर्धारित सेटिङ्स पुन:स्थापित भयो।' : 'System settings reset to default.', 'info');
    setShowResetConfirm(false);
    onClose();
  };

  // Helper state updates
  const updateProfile = (key: keyof SystemSettings['profile'], val: string) => {
    setDraft((prev) => ({
      ...prev,
      profile: { ...prev.profile, [key]: val },
    }));
  };

  const updateAbout = (key: keyof SystemSettings['about'], val: any) => {
    setDraft((prev) => ({
      ...prev,
      about: { ...prev.about, [key]: val },
    }));
  };

  const updateExperience = (key: keyof SystemSettings['experience'], val: any) => {
    setDraft((prev) => ({
      ...prev,
      experience: { ...prev.experience, [key]: val },
    }));
  };

  const updateContact = (key: keyof SystemSettings['contact'], val: string) => {
    setDraft((prev) => ({
      ...prev,
      contact: { ...prev.contact, [key]: val },
    }));
  };

  const updateAutoLikes = (key: keyof SystemSettings['autoLikes'], val: any) => {
    setDraft((prev) => ({
      ...prev,
      autoLikes: { ...prev.autoLikes, [key]: val },
    }));
  };

  // Stat item handlers
  const updateStatItem = (index: number, field: keyof StatItem, val: string) => {
    const nextStats = [...draft.about.stats];
    nextStats[index] = { ...nextStats[index], [field]: val };
    updateAbout('stats', nextStats);
  };

  // Skill item handlers
  const updateSkillItem = (index: number, field: keyof SkillItem, val: any) => {
    const nextSkills = [...draft.experience.skills];
    nextSkills[index] = { ...nextSkills[index], [field]: val };
    updateExperience('skills', nextSkills);
  };

  // Milestone item handlers
  const updateMilestoneItem = (index: number, field: keyof MilestoneItem, val: string) => {
    const nextMilestones = [...draft.experience.milestones];
    nextMilestones[index] = { ...nextMilestones[index], [field]: val };
    updateExperience('milestones', nextMilestones);
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
            className="relative w-full max-w-4xl rounded-3xl bg-slate-900 border border-slate-800 shadow-2xl p-6 sm:p-8 my-auto overflow-hidden max-h-[90vh] flex flex-col"
          >
            {/* Header */}
            <div className="flex items-center justify-between pb-4 border-b border-slate-800 mb-6 shrink-0">
              <div className="flex items-center gap-3">
                <div className="p-2.5 rounded-xl bg-blue-600/10 border border-blue-500/20 text-blue-400">
                  <Settings className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-slate-100 font-heading">
                    {language === 'NE' ? 'प्रणालीगत CMS व्यवस्थापन' : 'System-Wide Content CMS'}
                  </h3>
                  <p className="text-xs text-slate-400">
                    {language === 'NE' ? 'पोर्टफोलियोको सम्पूर्ण पाठ र सेटिङ्स अनुकूलित गर्नुहोस्' : 'Manage portfolio content, localized texts, and engagement parameters'}
                  </p>
                </div>
              </div>
              <button
                onClick={onClose}
                className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Tab Switcher Bar */}
            <div className="flex items-center gap-2 overflow-x-auto pb-3 mb-6 shrink-0 no-scrollbar border-b border-slate-800/80">
              <button
                type="button"
                onClick={() => setActiveTab('profile')}
                className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all ${
                  activeTab === 'profile'
                    ? 'bg-blue-600 text-white shadow-md shadow-blue-600/30'
                    : 'bg-slate-950 text-slate-400 hover:text-slate-200 border border-slate-800'
                }`}
              >
                <User className="w-3.5 h-3.5" />
                <span>{language === 'NE' ? '१. प्रोफाइल र हिरो' : '1. Profile & Hero'}</span>
              </button>

              <button
                type="button"
                onClick={() => setActiveTab('about')}
                className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all ${
                  activeTab === 'about'
                    ? 'bg-blue-600 text-white shadow-md shadow-blue-600/30'
                    : 'bg-slate-950 text-slate-400 hover:text-slate-200 border border-slate-800'
                }`}
              >
                <Info className="w-3.5 h-3.5" />
                <span>{language === 'NE' ? '२. बारेमा (About)' : '2. About CMS'}</span>
              </button>

              <button
                type="button"
                onClick={() => setActiveTab('experience')}
                className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all ${
                  activeTab === 'experience'
                    ? 'bg-blue-600 text-white shadow-md shadow-blue-600/30'
                    : 'bg-slate-950 text-slate-400 hover:text-slate-200 border border-slate-800'
                }`}
              >
                <Briefcase className="w-3.5 h-3.5" />
                <span>{language === 'NE' ? '३. अनुभव र सीप' : '3. Experience & Skills'}</span>
              </button>

              <button
                type="button"
                onClick={() => setActiveTab('contact')}
                className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all ${
                  activeTab === 'contact'
                    ? 'bg-blue-600 text-white shadow-md shadow-blue-600/30'
                    : 'bg-slate-950 text-slate-400 hover:text-slate-200 border border-slate-800'
                }`}
              >
                <Mail className="w-3.5 h-3.5" />
                <span>{language === 'NE' ? '४. सम्पर्क र सञ्जाल' : '4. Contact & Socials'}</span>
              </button>

              <button
                type="button"
                onClick={() => setActiveTab('autoLikes')}
                className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all ${
                  activeTab === 'autoLikes'
                    ? 'bg-pink-600 text-white shadow-md shadow-pink-600/30'
                    : 'bg-slate-950 text-slate-400 hover:text-slate-200 border border-slate-800'
                }`}
              >
                <Zap className="w-3.5 h-3.5 text-amber-300" />
                <span>{language === 'NE' ? '५. स्वतः-लाइक्स' : '5. Auto-Likes'}</span>
              </button>

              <button
                type="button"
                onClick={() => setActiveTab('photos')}
                className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all ${
                  activeTab === 'photos'
                    ? 'bg-emerald-600 text-white shadow-md shadow-emerald-600/30'
                    : 'bg-slate-950 text-slate-400 hover:text-slate-200 border border-slate-800'
                }`}
              >
                <Image className="w-3.5 h-3.5 text-emerald-400" />
                <span>{language === 'NE' ? '६. तस्बिर व्यवस्थापन' : '6. Photos CMS & Delete'}</span>
                {moments.length > 0 && (
                  <span className="px-1.5 py-0.5 rounded-full bg-slate-900 text-[10px] font-mono text-emerald-300">
                    {moments.length}
                  </span>
                )}
              </button>
            </div>

            {/* Tab Form Contents */}
            <form onSubmit={handleSave} className="overflow-y-auto pr-1 flex-1 space-y-6">
              
              {/* TAB 1: PROFILE & HERO */}
              {activeTab === 'profile' && (
                <div className="space-y-5">
                  {/* Hero Portrait Configuration (Upload, Gallery Pick, URL) */}
                  <div className="p-4 sm:p-5 rounded-2xl bg-slate-950 border border-blue-500/20 shadow-inner space-y-4">
                    <div className="flex items-center justify-between">
                      <label className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-blue-400">
                        <Camera className="w-4 h-4 text-blue-400" />
                        <span>{language === 'NE' ? 'शीर्ष प्रोफाइल तथा हिरो तस्बिर' : 'Profile & Hero Portrait Photo'}</span>
                      </label>
                      <button
                        type="button"
                        onClick={() => {
                          updateProfile('heroImage', DEFAULT_SYSTEM_SETTINGS.profile.heroImage);
                          onShowToast(
                            language === 'NE' ? 'पूर्वनिर्धारित तस्बिर पुनर्स्थापित भयो!' : 'Restored default portrait photo!',
                            'info'
                          );
                        }}
                        className="text-[11px] font-semibold text-blue-400 hover:text-blue-300 transition-colors"
                      >
                        {language === 'NE' ? 'पूर्वनिर्धारित फोटो राख्नुहोस्' : 'Reset to Default'}
                      </button>
                    </div>

                    <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
                      {/* Live Image Preview */}
                      <div className="relative w-28 h-28 rounded-2xl overflow-hidden bg-slate-900 border-2 border-blue-500/40 flex items-center justify-center shrink-0 shadow-lg shadow-blue-950/50 group">
                        {draft.profile.heroImage ? (
                          <img
                            src={draft.profile.heroImage}
                            alt={draft.profile.name}
                            referrerPolicy="no-referrer"
                            className="w-full h-full object-cover object-top"
                          />
                        ) : (
                          <User className="w-12 h-12 text-slate-600" />
                        )}
                        <button
                          type="button"
                          onClick={() => fileInputRef.current?.click()}
                          className="absolute inset-0 bg-slate-950/70 backdrop-blur-xs opacity-0 group-hover:opacity-100 flex flex-col items-center justify-center text-white transition-opacity gap-1"
                          title="Change Photo"
                        >
                          <Upload className="w-5 h-5 text-blue-400" />
                          <span className="text-[10px] font-bold">Upload</span>
                        </button>
                      </div>

                      {/* Action Buttons & Quick Pickers */}
                      <div className="flex-1 w-full space-y-3">
                        <div className="flex flex-wrap items-center gap-2">
                          {/* Hidden File Input */}
                          <input
                            ref={fileInputRef}
                            type="file"
                            accept="image/*"
                            onChange={handleProfilePhotoUpload}
                            className="hidden"
                          />
                          
                          {/* Browse Device Button */}
                          <button
                            type="button"
                            onClick={() => fileInputRef.current?.click()}
                            disabled={isUploadingPhoto}
                            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold shadow-md shadow-blue-600/30 transition-all active:scale-95 disabled:opacity-50"
                          >
                            {isUploadingPhoto ? (
                              <>
                                <Loader2 className="w-4 h-4 animate-spin" />
                                <span>Uploading ({uploadProgress}%)...</span>
                              </>
                            ) : (
                              <>
                                <Upload className="w-4 h-4" />
                                <span>Upload New Photo</span>
                              </>
                            )}
                          </button>

                          {/* Pick from Gallery Button */}
                          {moments.length > 0 && (
                            <button
                              type="button"
                              onClick={() => setShowGalleryPicker(!showGalleryPicker)}
                              className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-700 text-slate-200 text-xs font-semibold transition-all active:scale-95"
                            >
                              <FolderOpen className="w-4 h-4 text-amber-400" />
                              <span>{showGalleryPicker ? 'Close Gallery' : 'Choose From Gallery'}</span>
                            </button>
                          )}
                        </div>

                        {/* Direct Image URL input */}
                        <div className="relative">
                          <input
                            type="url"
                            value={draft.profile.heroImage}
                            onChange={(e) => updateProfile('heroImage', e.target.value)}
                            placeholder="Or paste direct image URL (https://...)"
                            className="w-full pl-3.5 pr-10 py-2.5 rounded-xl bg-slate-900 border border-slate-800 text-slate-100 text-xs font-mono focus:outline-none focus:border-blue-500 transition-colors"
                          />
                          {draft.profile.heroImage && (
                            <CheckCircle2 className="w-4 h-4 text-emerald-400 absolute right-3.5 top-3" />
                          )}
                        </div>

                        <p className="text-[11px] text-slate-400 leading-relaxed">
                          {language === 'NE'
                            ? 'तपाईँ सिधै कम्प्युटर/मोबाइलबाट फोटो अपलोड गर्न, ग्यालरीबाट छान्न वा वेब URL राख्न सक्नुहुन्छ।'
                            : 'Upload from your device (saved to Firebase Storage), select an AI Clipzone photo, or paste any image URL.'}
                        </p>
                      </div>
                    </div>

                    {/* Gallery Quick Thumbnail Selector */}
                    {showGalleryPicker && moments.length > 0 && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        className="pt-3 border-t border-slate-800/80 space-y-2"
                      >
                        <div className="flex items-center justify-between text-xs text-slate-400">
                          <span className="font-semibold text-slate-300">Click any photo below to set as your profile portrait:</span>
                          <span className="text-[11px]">{moments.length} available</span>
                        </div>
                        <div className="grid grid-cols-4 sm:grid-cols-6 gap-2.5 max-h-48 overflow-y-auto p-1 bg-slate-900/60 rounded-xl border border-slate-800">
                          {moments.map((m) => (
                            <button
                              key={m.id}
                              type="button"
                              onClick={() => {
                                updateProfile('heroImage', m.imgUrl);
                                setShowGalleryPicker(false);
                                onShowToast('Profile photo updated from gallery!', 'success');
                              }}
                              className={`relative aspect-square rounded-lg overflow-hidden border-2 transition-all hover:scale-105 active:scale-95 group ${
                                draft.profile.heroImage === m.imgUrl
                                  ? 'border-emerald-500 shadow-md shadow-emerald-500/20'
                                  : 'border-slate-800 hover:border-blue-500'
                              }`}
                            >
                              <img
                                src={m.imgUrl}
                                alt={m.titleEn || 'Photo'}
                                className="w-full h-full object-cover"
                              />
                              {draft.profile.heroImage === m.imgUrl && (
                                <div className="absolute inset-0 bg-emerald-600/30 flex items-center justify-center">
                                  <CheckCircle2 className="w-4 h-4 text-emerald-300" />
                                </div>
                              )}
                            </button>
                          ))}
                        </div>
                      </motion.div>
                    )}
                  </div>

                  <div className="grid grid-cols-1 gap-4">
                    <div>
                      <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                        Full Name
                      </label>
                      <input
                        type="text"
                        value={draft.profile.name}
                        onChange={(e) => updateProfile('name', e.target.value)}
                        className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-slate-100 text-sm focus:outline-none focus:border-blue-500"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                        Title / Role (English)
                      </label>
                      <input
                        type="text"
                        value={draft.profile.titleEn}
                        onChange={(e) => updateProfile('titleEn', e.target.value)}
                        className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-slate-100 text-sm focus:outline-none focus:border-blue-500"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                        पद / भूमिका (नेपाली)
                      </label>
                      <input
                        type="text"
                        value={draft.profile.titleNe}
                        onChange={(e) => updateProfile('titleNe', e.target.value)}
                        className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-slate-100 text-sm focus:outline-none focus:border-blue-500"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                        Tagline Narrative (English)
                      </label>
                      <textarea
                        rows={3}
                        value={draft.profile.taglineEn}
                        onChange={(e) => updateProfile('taglineEn', e.target.value)}
                        className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-slate-100 text-xs focus:outline-none focus:border-blue-500 resize-none"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                        ट्यागलाइन सन्देश (नेपाली)
                      </label>
                      <textarea
                        rows={3}
                        value={draft.profile.taglineNe}
                        onChange={(e) => updateProfile('taglineNe', e.target.value)}
                        className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-slate-100 text-xs focus:outline-none focus:border-blue-500 resize-none"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                        Primary CTA Button (EN / NE)
                      </label>
                      <div className="grid grid-cols-2 gap-2">
                        <input
                          type="text"
                          value={draft.profile.ctaPrimaryEn}
                          onChange={(e) => updateProfile('ctaPrimaryEn', e.target.value)}
                          className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-slate-100 text-xs"
                        />
                        <input
                          type="text"
                          value={draft.profile.ctaPrimaryNe}
                          onChange={(e) => updateProfile('ctaPrimaryNe', e.target.value)}
                          className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-slate-100 text-xs"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                        Secondary CTA Button (EN / NE)
                      </label>
                      <div className="grid grid-cols-2 gap-2">
                        <input
                          type="text"
                          value={draft.profile.ctaSecondaryEn}
                          onChange={(e) => updateProfile('ctaSecondaryEn', e.target.value)}
                          className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-slate-100 text-xs"
                        />
                        <input
                          type="text"
                          value={draft.profile.ctaSecondaryNe}
                          onChange={(e) => updateProfile('ctaSecondaryNe', e.target.value)}
                          className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-slate-100 text-xs"
                        />
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* TAB 2: ABOUT CMS */}
              {activeTab === 'about' && (
                <div className="space-y-6">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                        Section Heading (English)
                      </label>
                      <input
                        type="text"
                        value={draft.about.headingEn}
                        onChange={(e) => updateAbout('headingEn', e.target.value)}
                        className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-slate-100 text-sm focus:outline-none focus:border-blue-500"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                        शीर्षक (नेपाली)
                      </label>
                      <input
                        type="text"
                        value={draft.about.headingNe}
                        onChange={(e) => updateAbout('headingNe', e.target.value)}
                        className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-slate-100 text-sm focus:outline-none focus:border-blue-500"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                        Bio Paragraph 1 (English)
                      </label>
                      <textarea
                        rows={3}
                        value={draft.about.bioParagraph1En}
                        onChange={(e) => updateAbout('bioParagraph1En', e.target.value)}
                        className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-slate-100 text-xs resize-none"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                        बायो अनुच्छेद १ (नेपाली)
                      </label>
                      <textarea
                        rows={3}
                        value={draft.about.bioParagraph1Ne}
                        onChange={(e) => updateAbout('bioParagraph1Ne', e.target.value)}
                        className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-slate-100 text-xs resize-none"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                        Motto Quote (English)
                      </label>
                      <input
                        type="text"
                        value={draft.about.mottoEn}
                        onChange={(e) => updateAbout('mottoEn', e.target.value)}
                        className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-slate-100 text-sm"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                        आदर्श वाक्य (नेपाली)
                      </label>
                      <input
                        type="text"
                        value={draft.about.mottoNe}
                        onChange={(e) => updateAbout('mottoNe', e.target.value)}
                        className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-slate-100 text-sm"
                      />
                    </div>
                  </div>

                  {/* 4 Metric Stats Editor */}
                  <div className="pt-4 border-t border-slate-800">
                    <h4 className="text-xs font-bold uppercase tracking-wider text-slate-300 mb-3">
                      Achievement Counters (4 Metric Cards)
                    </h4>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      {draft.about.stats.map((stat, idx) => (
                        <div key={stat.id} className="p-3 rounded-xl bg-slate-950 border border-slate-800 space-y-2">
                          <div className="flex items-center gap-2">
                            <input
                              type="text"
                              value={stat.value}
                              onChange={(e) => updateStatItem(idx, 'value', e.target.value)}
                              placeholder="Value (e.g. 45)"
                              className="w-1/2 px-2.5 py-1.5 rounded-lg bg-slate-900 border border-slate-700 text-slate-100 text-xs font-bold"
                            />
                            <input
                              type="text"
                              value={stat.suffix}
                              onChange={(e) => updateStatItem(idx, 'suffix', e.target.value)}
                              placeholder="Suffix (e.g. +)"
                              className="w-1/2 px-2.5 py-1.5 rounded-lg bg-slate-900 border border-slate-700 text-slate-100 text-xs"
                            />
                          </div>
                          <input
                            type="text"
                            value={stat.labelEn}
                            onChange={(e) => updateStatItem(idx, 'labelEn', e.target.value)}
                            placeholder="Label (EN)"
                            className="w-full px-2.5 py-1.5 rounded-lg bg-slate-900 border border-slate-700 text-slate-100 text-xs"
                          />
                          <input
                            type="text"
                            value={stat.labelNe}
                            onChange={(e) => updateStatItem(idx, 'labelNe', e.target.value)}
                            placeholder="लेबल (नेपाली)"
                            className="w-full px-2.5 py-1.5 rounded-lg bg-slate-900 border border-slate-700 text-slate-100 text-xs"
                          />
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {/* TAB 3: EXPERIENCE CMS */}
              {activeTab === 'experience' && (
                <div className="space-y-6">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                        Vision Quote (English)
                      </label>
                      <input
                        type="text"
                        value={draft.experience.quoteEn}
                        onChange={(e) => updateExperience('quoteEn', e.target.value)}
                        className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-slate-100 text-sm"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                        दूरदृष्टि भनाइ (नेपाली)
                      </label>
                      <input
                        type="text"
                        value={draft.experience.quoteNe}
                        onChange={(e) => updateExperience('quoteNe', e.target.value)}
                        className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-slate-100 text-sm"
                      />
                    </div>
                  </div>

                  {/* Skills Editor */}
                  <div className="pt-4 border-t border-slate-800">
                    <h4 className="text-xs font-bold uppercase tracking-wider text-slate-300 mb-3">
                      Competency Progress Skills
                    </h4>
                    <div className="space-y-3">
                      {draft.experience.skills.map((skill, idx) => (
                        <div key={skill.id} className="p-3 rounded-xl bg-slate-950 border border-slate-800 space-y-2">
                          <div className="flex items-center justify-between gap-3">
                            <input
                              type="text"
                              value={skill.nameEn}
                              onChange={(e) => updateSkillItem(idx, 'nameEn', e.target.value)}
                              placeholder="Skill Name (EN)"
                              className="flex-1 px-2.5 py-1.5 rounded-lg bg-slate-900 border border-slate-700 text-slate-100 text-xs font-semibold"
                            />
                            <div className="flex items-center gap-1.5 w-24">
                              <input
                                type="number"
                                min={10}
                                max={100}
                                value={skill.level}
                                onChange={(e) => updateSkillItem(idx, 'level', parseInt(e.target.value, 10) || 0)}
                                className="w-14 px-2 py-1.5 rounded-lg bg-slate-900 border border-slate-700 text-slate-100 text-xs font-mono text-center"
                              />
                              <span className="text-xs text-slate-400 font-mono">%</span>
                            </div>
                          </div>
                          <input
                            type="text"
                            value={skill.nameNe}
                            onChange={(e) => updateSkillItem(idx, 'nameNe', e.target.value)}
                            placeholder="सीपको नाम (नेपाली)"
                            className="w-full px-2.5 py-1.5 rounded-lg bg-slate-900 border border-slate-700 text-slate-100 text-xs"
                          />
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Milestones Timeline Editor */}
                  <div className="pt-4 border-t border-slate-800">
                    <h4 className="text-xs font-bold uppercase tracking-wider text-slate-300 mb-3">
                      Career Timeline Milestones
                    </h4>
                    <div className="space-y-4">
                      {draft.experience.milestones.map((m, idx) => (
                        <div key={m.id} className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 space-y-2">
                          <div className="grid grid-cols-3 gap-2">
                            <input
                              type="text"
                              value={m.year}
                              onChange={(e) => updateMilestoneItem(idx, 'year', e.target.value)}
                              placeholder="Year range"
                              className="px-2 py-1.5 rounded-lg bg-slate-900 border border-slate-700 text-blue-400 font-mono text-xs"
                            />
                            <input
                              type="text"
                              value={m.roleType}
                              onChange={(e) => updateMilestoneItem(idx, 'roleType', e.target.value)}
                              placeholder="Role Type"
                              className="px-2 py-1.5 rounded-lg bg-slate-900 border border-slate-700 text-slate-300 text-xs"
                            />
                            <input
                              type="text"
                              value={m.orgEn}
                              onChange={(e) => updateMilestoneItem(idx, 'orgEn', e.target.value)}
                              placeholder="Organization"
                              className="px-2 py-1.5 rounded-lg bg-slate-900 border border-slate-700 text-indigo-300 text-xs font-semibold"
                            />
                          </div>
                          <input
                            type="text"
                            value={m.titleEn}
                            onChange={(e) => updateMilestoneItem(idx, 'titleEn', e.target.value)}
                            placeholder="Title (EN)"
                            className="w-full px-2.5 py-1.5 rounded-lg bg-slate-900 border border-slate-700 text-slate-100 text-xs font-bold"
                          />
                          <input
                            type="text"
                            value={m.descEn}
                            onChange={(e) => updateMilestoneItem(idx, 'descEn', e.target.value)}
                            placeholder="Description"
                            className="w-full px-2.5 py-1.5 rounded-lg bg-slate-900 border border-slate-700 text-slate-300 text-xs"
                          />
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {/* TAB 4: CONTACT & SOCIALS */}
              {activeTab === 'contact' && (
                <div className="space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                        Primary Email
                      </label>
                      <input
                        type="email"
                        value={draft.contact.email}
                        onChange={(e) => updateContact('email', e.target.value)}
                        className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-slate-100 text-sm"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                        Phone / WhatsApp
                      </label>
                      <input
                        type="text"
                        value={draft.contact.phone}
                        onChange={(e) => updateContact('phone', e.target.value)}
                        className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-slate-100 text-sm"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                        Location (English)
                      </label>
                      <input
                        type="text"
                        value={draft.contact.locationEn}
                        onChange={(e) => updateContact('locationEn', e.target.value)}
                        className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-slate-100 text-sm"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                        स्थान (नेपाली)
                      </label>
                      <input
                        type="text"
                        value={draft.contact.locationNe}
                        onChange={(e) => updateContact('locationNe', e.target.value)}
                        className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-slate-100 text-sm"
                      />
                    </div>
                  </div>

                  <div className="pt-4 border-t border-slate-800">
                    <h4 className="text-xs font-bold uppercase tracking-wider text-slate-300 mb-3">
                      Social Profiles URLs
                    </h4>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div>
                        <label className="block text-[11px] text-slate-400 mb-1">Facebook URL</label>
                        <input
                          type="url"
                          value={draft.contact.facebookUrl}
                          onChange={(e) => updateContact('facebookUrl', e.target.value)}
                          className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-slate-100 text-xs"
                        />
                      </div>
                      <div>
                        <label className="block text-[11px] text-slate-400 mb-1">LinkedIn URL</label>
                        <input
                          type="url"
                          value={draft.contact.linkedinUrl}
                          onChange={(e) => updateContact('linkedinUrl', e.target.value)}
                          className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-slate-100 text-xs"
                        />
                      </div>
                      <div>
                        <label className="block text-[11px] text-slate-400 mb-1">GitHub URL</label>
                        <input
                          type="url"
                          value={draft.contact.githubUrl}
                          onChange={(e) => updateContact('githubUrl', e.target.value)}
                          className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-slate-100 text-xs"
                        />
                      </div>
                      <div>
                        <label className="block text-[11px] text-slate-400 mb-1">Instagram URL</label>
                        <input
                          type="url"
                          value={draft.contact.instagramUrl}
                          onChange={(e) => updateContact('instagramUrl', e.target.value)}
                          className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-slate-100 text-xs"
                        />
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* TAB 5: AUTO-LIKES CONFIG */}
              {activeTab === 'autoLikes' && (
                <div className="space-y-6">
                  <div className="p-5 rounded-2xl bg-slate-950 border border-slate-800 space-y-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2 text-pink-400 font-bold text-sm">
                        <Zap className="w-4 h-4" />
                        <span>System-Wide Engagement Auto-Boost</span>
                      </div>
                      <button
                        type="button"
                        onClick={onAutoBoostAllLikes}
                        className="px-4 py-2 rounded-xl bg-gradient-to-r from-pink-600 to-rose-600 hover:from-pink-500 hover:to-rose-500 text-white text-xs font-bold shadow-lg shadow-pink-600/30 transition-all active:scale-95"
                      >
                        ⚡ Trigger Global Auto-Boost
                      </button>
                    </div>
                    <p className="text-xs text-slate-400 leading-relaxed">
                      This immediately boosts likes across all current photos in the visual gallery based on the configured randomized parameters below.
                    </p>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                        Default Boost Minimum Range
                      </label>
                      <input
                        type="number"
                        value={draft.autoLikes.defaultBoostRangeMin}
                        onChange={(e) => updateAutoLikes('defaultBoostRangeMin', parseInt(e.target.value, 10) || 100)}
                        className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-slate-100 text-sm font-mono"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                        Default Boost Maximum Range
                      </label>
                      <input
                        type="number"
                        value={draft.autoLikes.defaultBoostRangeMax}
                        onChange={(e) => updateAutoLikes('defaultBoostRangeMax', parseInt(e.target.value, 10) || 500)}
                        className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-slate-100 text-sm font-mono"
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* TAB 6: PHOTOS CMS & DELETE MANAGER */}
              {activeTab === 'photos' && (
                <div className="space-y-6">
                  <div className="p-4 rounded-2xl bg-emerald-950/20 border border-emerald-500/30 flex flex-wrap items-center justify-between gap-4">
                    <div>
                      <h4 className="text-sm font-bold text-emerald-300 mb-1">
                        {language === 'NE' ? 'तस्बिर ग्यालरी व्यवस्थापन तथा मेटाउने प्रणाली' : 'Gallery Photos Management & Delete Control'}
                      </h4>
                      <p className="text-xs text-slate-400">
                        {language === 'NE'
                          ? `हाल कुल ${moments.length} तस्बिरहरू उपलब्ध छन्। यहाँबाट कुनै पनि तस्बिर तुरुन्तै मेटाउन सक्नुहुन्छ।`
                          : `Currently ${moments.length} photos in gallery. You can inspect and delete any photo immediately with 1-click.`}
                      </p>
                    </div>
                    {onOpenUploadModal && (
                      <button
                        type="button"
                        onClick={() => {
                          onClose();
                          onOpenUploadModal();
                        }}
                        className="flex items-center gap-2 px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold shadow-lg shadow-blue-600/30 transition-all active:scale-95"
                      >
                        <Plus className="w-3.5 h-3.5" />
                        <span>{language === 'NE' ? '+ नयाँ तस्बिर लिङ्क थप्नुहोस्' : '+ Add Photo via Link'}</span>
                      </button>
                    )}
                  </div>

                  {/* Search / Filter bar */}
                  <div className="flex items-center gap-3">
                    <input
                      type="text"
                      placeholder={language === 'NE' ? 'तस्बिर खोज्नुहोस्...' : 'Filter photos by title or category...'}
                      value={photoSearch}
                      onChange={(e) => setPhotoSearch(e.target.value)}
                      className="flex-1 px-4 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-slate-100 text-xs focus:outline-none focus:border-blue-500"
                    />
                    {photoSearch && (
                      <button
                        type="button"
                        onClick={() => setPhotoSearch('')}
                        className="px-3 py-2 rounded-xl bg-slate-800 text-slate-300 text-xs font-medium"
                      >
                        {language === 'NE' ? 'खाली गर्नुहोस्' : 'Clear'}
                      </button>
                    )}
                  </div>

                  {/* Photo List Cards */}
                  <div className="space-y-3 max-h-[420px] overflow-y-auto pr-1">
                    {moments.filter((m) =>
                      m.titleEn.toLowerCase().includes(photoSearch.toLowerCase()) ||
                      m.titleNe.includes(photoSearch) ||
                      m.category.toLowerCase().includes(photoSearch.toLowerCase())
                    ).length === 0 ? (
                      <div className="py-12 text-center rounded-2xl bg-slate-950/60 border border-slate-800 text-xs text-slate-400">
                        {language === 'NE' ? 'कुनै तस्बिर भेटिएन।' : 'No photos matching your search.'}
                      </div>
                    ) : (
                      moments
                        .filter((m) =>
                          m.titleEn.toLowerCase().includes(photoSearch.toLowerCase()) ||
                          m.titleNe.includes(photoSearch) ||
                          m.category.toLowerCase().includes(photoSearch.toLowerCase())
                        )
                        .map((moment) => (
                          <div
                            key={moment.id}
                            className="p-3 sm:p-4 rounded-2xl bg-slate-950 border border-slate-800/80 hover:border-slate-700 flex items-center justify-between gap-4 transition-all"
                          >
                            <div className="flex items-center gap-3.5 min-w-0">
                              <img
                                src={moment.imgUrl}
                                alt={moment.titleEn}
                                referrerPolicy="no-referrer"
                                className="w-14 h-14 rounded-xl object-cover bg-slate-900 border border-slate-800 shrink-0"
                              />
                              <div className="min-w-0">
                                <div className="flex items-center gap-2 mb-1">
                                  <span className="px-2 py-0.5 rounded-md bg-blue-500/10 border border-blue-500/20 text-[10px] font-bold text-blue-400">
                                    {moment.category}
                                  </span>
                                  <span className="text-[10px] text-slate-400 flex items-center gap-1 font-mono">
                                    <Calendar className="w-3 h-3 text-slate-500" />
                                    {moment.date}
                                  </span>
                                </div>
                                <h5 className="text-xs sm:text-sm font-bold text-slate-200 truncate">
                                  {language === 'NE' ? moment.titleNe : moment.titleEn}
                                </h5>
                                <p className="text-[11px] text-slate-400 truncate max-w-sm sm:max-w-md">
                                  {language === 'NE' ? moment.descNe : moment.descEn}
                                </p>
                              </div>
                            </div>

                            {/* Delete & Action Controls */}
                            <div className="flex items-center gap-2 shrink-0">
                              <span className="text-xs font-mono font-bold text-pink-400 px-2.5 py-1 rounded-lg bg-pink-950/40 border border-pink-500/20 hidden sm:inline-block">
                                ❤️ {moment.likes}
                              </span>

                              {onDeleteMoment && (
                                <>
                                  {deletingMomentId === moment.id ? (
                                    <div className="flex items-center gap-1.5">
                                      <button
                                        type="button"
                                        onClick={() => {
                                          onDeleteMoment(moment.id);
                                          setDeletingMomentId(null);
                                          onShowToast(
                                            language === 'NE'
                                              ? 'तस्बिर स्थायी रूपमा मेटाइयो (रिकभर हुने छैन)।'
                                              : 'Photo permanently deleted (cannot be recovered).',
                                            'info'
                                          );
                                        }}
                                        className="flex items-center gap-1 px-3 py-1.5 rounded-xl bg-rose-600 hover:bg-rose-500 text-white text-xs font-bold shadow-md animate-pulse active:scale-95 transition-all"
                                      >
                                        <Trash2 className="w-3.5 h-3.5" />
                                        <span>{language === 'NE' ? 'पक्का मेटाउने ?' : 'Confirm?'}</span>
                                      </button>
                                      <button
                                        type="button"
                                        onClick={() => setDeletingMomentId(null)}
                                        className="px-2 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-medium"
                                      >
                                        {language === 'NE' ? 'रद्द' : 'Cancel'}
                                      </button>
                                    </div>
                                  ) : (
                                    <button
                                      type="button"
                                      onClick={() => setDeletingMomentId(moment.id)}
                                      className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-rose-950/60 hover:bg-rose-600 border border-rose-800/80 hover:border-rose-600 text-rose-300 hover:text-white text-xs font-semibold shadow-md transition-all active:scale-95"
                                      title={language === 'NE' ? 'तस्बिर स्थायी रूपमा मेटाउनुहोस्' : 'Delete photo permanently'}
                                    >
                                      <Trash2 className="w-3.5 h-3.5" />
                                      <span className="hidden sm:inline">
                                        {language === 'NE' ? 'मेटाउनुहोस्' : 'Delete'}
                                      </span>
                                    </button>
                                  )}
                                </>
                              )}
                            </div>
                          </div>
                        ))
                    )}
                  </div>
                </div>
              )}

              {/* Action Buttons */}
              <div className="pt-6 border-t border-slate-800 flex items-center justify-between shrink-0">
                {showResetConfirm ? (
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={handleReset}
                      className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-500 text-white text-xs font-bold shadow-md animate-pulse active:scale-95 transition-all"
                    >
                      <RotateCcw className="w-3.5 h-3.5" />
                      <span>{language === 'NE' ? 'पक्का रिसेट गर्ने ?' : 'Confirm Reset Now'}</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => setShowResetConfirm(false)}
                      className="px-3 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-medium"
                    >
                      {language === 'NE' ? 'रद्द' : 'Cancel'}
                    </button>
                  </div>
                ) : (
                  <button
                    type="button"
                    onClick={() => setShowResetConfirm(true)}
                    className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-slate-950 hover:bg-rose-950/30 text-rose-400 border border-rose-500/20 text-xs font-semibold transition-all"
                    title="Reset settings to factory defaults"
                  >
                    <RotateCcw className="w-3.5 h-3.5" />
                    <span>{language === 'NE' ? 'पूर्वनिर्धारितमा फर्काउनुहोस्' : 'Reset Defaults'}</span>
                  </button>
                )}

                <div className="flex items-center gap-3">
                  <button
                    type="button"
                    onClick={onClose}
                    className="px-5 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold"
                  >
                    {language === 'NE' ? 'रद्द गर्नुहोस्' : 'Cancel'}
                  </button>

                  <button
                    type="submit"
                    className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold shadow-lg shadow-blue-600/30 transition-all active:scale-95"
                  >
                    <Save className="w-4 h-4" />
                    <span>{language === 'NE' ? 'सेटिङ्स सेभ गर्नुहोस्' : 'Save System Settings'}</span>
                  </button>
                </div>
              </div>
            </form>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
