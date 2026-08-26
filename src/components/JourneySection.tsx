import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Camera,
  Heart,
  Calendar,
  Tag,
  Zap,
  Eye,
  Edit2,
  Trash2,
  MessageSquare,
  Share2,
  X,
  Send,
  PlusCircle,
  Sparkles,
  Layers,
} from 'lucide-react';
import { Moment, Comment, Language } from '../types';
import { formatLikes } from '../utils/likesFormatter';
import { DeleteConfirmModal } from './DeleteConfirmModal';

interface JourneySectionProps {
  language: Language;
  moments: Moment[];
  isAdmin: boolean;
  onOpenUploadModal: () => void;
  onOpenEditModal: (moment: Moment) => void;
  onDeleteMoment: (id: string) => void;
  onLikeMoment: (id: string) => void;
  userLikedMoments: string[];
  onAutoBoostAllLikes: () => void;
  commentsMap: Record<string, Comment[]>;
  onAddComment: (momentId: string, author: string, text: string) => void;
  onDeleteComment?: (momentId: string, commentId: string) => void;
  onShowToast: (text: string, type: 'success' | 'error' | 'info') => void;
}

export const JourneySection: React.FC<JourneySectionProps> = ({
  language,
  moments,
  isAdmin,
  onOpenUploadModal,
  onOpenEditModal,
  onDeleteMoment,
  onLikeMoment,
  userLikedMoments,
  onAutoBoostAllLikes,
  commentsMap,
  onAddComment,
  onDeleteComment,
  onShowToast,
}) => {
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [activeLightboxMoment, setActiveLightboxMoment] = useState<Moment | null>(null);
  const [photoToDelete, setPhotoToDelete] = useState<Moment | null>(null);

  // Comment input state for Lightbox
  const [commentAuthor, setCommentAuthor] = useState('');
  const [commentText, setCommentText] = useState('');

  // Extract all categories dynamically
  const categories = useMemo(() => {
    const defaultCats = ['Technology', 'Community', 'Networking', 'Professional', 'Milestone', 'Personal'];
    const customCats = moments.map((m) => m.category).filter(Boolean);
    const set = new Set(['All', ...defaultCats, ...customCats]);
    return Array.from(set);
  }, [moments]);

  // Filter moments
  const filteredMoments = useMemo(() => {
    if (selectedCategory === 'All') return moments;
    return moments.filter((m) => m.category.toLowerCase() === selectedCategory.toLowerCase());
  }, [moments, selectedCategory]);

  const handleCommentSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeLightboxMoment) return;
    if (!commentText.trim()) return;

    const author = commentAuthor.trim() || (language === 'NE' ? 'अतिथि आगन्तुक' : 'Guest Visitor');
    onAddComment(activeLightboxMoment.id, author, commentText.trim());
    setCommentText('');
    onShowToast(language === 'NE' ? 'प्रतिक्रिया सुरक्षित भयो!' : 'Comment posted successfully!', 'success');
  };

  const handleCopyShareLink = (moment: Moment) => {
    try {
      const url = `${window.location.origin}${window.location.pathname}#moment-${moment.id}`;
      if (navigator?.clipboard?.writeText) {
        navigator.clipboard.writeText(url).catch(() => {});
      }
    } catch {
      // fallback
    }
    onShowToast(
      language === 'NE' ? 'तस्बिर लिंक क्लिपबोर्डमा प्रतिलिपि गरियो!' : 'Direct moment link copied to clipboard!',
      'info'
    );
  };

  const getCategoryBadgeLabel = (cat: string) => {
    if (language === 'EN') return cat;
    switch (cat.toLowerCase()) {
      case 'all':
        return 'सबै';
      case 'technology':
        return 'प्रविधि';
      case 'community':
        return 'समुदाय';
      case 'networking':
        return 'नेटवर्किङ';
      case 'professional':
        return 'व्यावसायिक';
      case 'milestone':
        return 'उपलब्धि';
      case 'personal':
        return 'व्यक्तिगत';
      default:
        return cat;
    }
  };

  return (
    <section id="journey" className="py-20 sm:py-28 bg-slate-950 relative">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Heading & Global Boost Bar */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12">
          <div>
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-400 text-xs font-semibold uppercase tracking-wider mb-3">
              <Camera className="w-3.5 h-3.5" />
              <span>{language === 'NE' ? 'दृश्य यात्रा तथा संस्मरण' : 'Visual Journey & Media CMS'}</span>
            </div>
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-slate-100 font-heading tracking-tight">
              {language === 'NE' ? 'जीवनका महत्वपूर्ण क्षणहरू' : 'Moments of Impact & Leadership'}
            </h2>
            <p className="text-sm sm:text-base text-slate-400 mt-2 max-w-xl">
              {language === 'NE'
                ? 'राष्ट्रिय सम्मेलनहरू, सामुदायिक कार्यशालाहरू र रणनीतिक पहलहरूका वास्तविक तस्बिरहरू।'
                : 'A curated visual archive of milestones, community youth drives, leadership roundtables, and personal journeys.'}
            </p>
          </div>

          {/* Action Bar (Auto-Boost + Add Photo for Admin) */}
          <div className="flex flex-wrap items-center gap-3">
            <button
              id="btn-auto-boost-all-likes"
              onClick={onAutoBoostAllLikes}
              className="flex items-center gap-2 px-4 py-2.5 rounded-2xl bg-gradient-to-r from-pink-600/90 to-rose-600/90 hover:from-pink-500 hover:to-rose-500 text-white text-xs sm:text-sm font-semibold shadow-lg shadow-pink-600/25 transition-all hover:scale-[1.02] active:scale-[0.98]"
              title="Boost realistic engagement likes across all photos"
            >
              <Zap className="w-4 h-4 text-amber-300 animate-bounce" />
              <span>{language === 'NE' ? '⚡ सबैमा लाइक्स बढाउनुहोस्' : '⚡ Auto-Boost Likes'}</span>
            </button>

            {isAdmin && (
              <button
                id="btn-journey-add-photo"
                onClick={onOpenUploadModal}
                className="flex items-center gap-2 px-4 py-2.5 rounded-2xl bg-blue-600 hover:bg-blue-500 text-white text-xs sm:text-sm font-semibold shadow-lg shadow-blue-600/30 transition-all active:scale-[0.98]"
              >
                <PlusCircle className="w-4 h-4" />
                <span>{language === 'NE' ? '+ तस्बिर लिङ्क थप्नुहोस्' : '+ Add Photo Link'}</span>
              </button>
            )}
          </div>
        </div>

        {/* Dynamic Category Filter Pills */}
        <div className="flex items-center gap-2 overflow-x-auto pb-4 mb-10 no-scrollbar">
          {categories.map((cat) => {
            const isSelected = selectedCategory.toLowerCase() === cat.toLowerCase();
            return (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`whitespace-nowrap px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold transition-all ${
                  isSelected
                    ? 'bg-blue-600 text-white shadow-md shadow-blue-600/30 border border-blue-500'
                    : 'bg-slate-900/80 text-slate-400 hover:text-slate-200 hover:bg-slate-850 border border-slate-800'
                }`}
              >
                {getCategoryBadgeLabel(cat)}
              </button>
            );
          })}
        </div>

        {/* Uncropped Media Grid */}
        {filteredMoments.length === 0 ? (
          <div className="py-20 text-center rounded-3xl bg-slate-900/40 border border-slate-800/80 p-8">
            <Layers className="w-12 h-12 text-slate-600 mx-auto mb-4" />
            <h3 className="text-lg font-bold text-slate-200 mb-2">
              {language === 'NE' ? 'यस श्रेणीमा कुनै तस्बिर छैन' : 'No moments found in this category'}
            </h3>
            <p className="text-sm text-slate-400 max-w-md mx-auto mb-6">
              {language === 'NE'
                ? 'नयाँ तस्बिर अपलोड गर्न कृपया माथिको बटन प्रयोग गर्नुहोस् वा अन्य श्रेणी छान्नुहोस्।'
                : 'Select another filter or upload your first photo using the admin controls.'}
            </p>
            {isAdmin && (
              <button
                onClick={onOpenUploadModal}
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold"
              >
                <PlusCircle className="w-4 h-4" />
                <span>{language === 'NE' ? '+ तस्बिर अपलोड गर्नुहोस्' : '+ Upload Photo Now'}</span>
              </button>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {filteredMoments.map((moment, idx) => {
              const isLiked = userLikedMoments.includes(moment.id);
              const momentComments = commentsMap[moment.id] || [];

              return (
                <motion.div
                  key={moment.id}
                  id={`moment-${moment.id}`}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.4, delay: idx * 0.05 }}
                  className="group relative rounded-3xl bg-slate-900/80 border border-slate-800/90 overflow-hidden flex flex-col justify-between hover:border-slate-700 transition-all duration-300 shadow-xl"
                >
                  {/* Top Image Display Area with Ambient Glow & Uncropped Containment */}
                  <div className="relative aspect-[4/3] w-full bg-slate-950 overflow-hidden flex items-center justify-center p-3">
                    {/* Ambient blurred reflection backdrop */}
                    <img
                      src={moment.imgUrl}
                      alt={moment.titleEn}
                      referrerPolicy="no-referrer"
                      className="absolute inset-0 w-full h-full object-cover filter blur-2xl opacity-25 scale-125"
                    />

                    {/* Main Uncropped Photo */}
                    <img
                      src={moment.imgUrl}
                      alt={moment.titleEn}
                      referrerPolicy="no-referrer"
                      className="relative z-10 max-h-full max-w-full object-contain rounded-xl drop-shadow-[0_15px_25px_rgba(0,0,0,0.8)] transition-transform duration-500 group-hover:scale-[1.02]"
                      loading="lazy"
                    />

                    {/* Top Overlay Badges */}
                    <div className="absolute top-4 left-4 z-20 flex items-center gap-2">
                      <span className="px-2.5 py-1 rounded-lg bg-slate-950/80 backdrop-blur-md border border-slate-800 text-[11px] font-bold text-blue-400">
                        {getCategoryBadgeLabel(moment.category)}
                      </span>
                    </div>

                    {/* Top Right Date & Quick Delete Badge */}
                    <div className="absolute top-4 right-4 z-20 flex items-center gap-1.5">
                      <span className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-slate-950/80 backdrop-blur-md border border-slate-800 text-[11px] font-medium text-slate-300">
                        <Calendar className="w-3 h-3 text-slate-400" />
                        {moment.date}
                      </span>
                      {isAdmin && (
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            setPhotoToDelete(moment);
                          }}
                          className="p-1.5 rounded-lg bg-rose-950/90 hover:bg-rose-600 border border-rose-700/80 text-rose-300 hover:text-white shadow-lg transition-all"
                          title={language === 'NE' ? 'तस्बिर स्थायी रूपमा मेटाउनुहोस्' : 'Delete photo permanently'}
                          aria-label="Delete photo permanently"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>

                    {/* Hover Toolbar overlay */}
                    <div className="absolute inset-0 z-30 bg-slate-950/60 backdrop-blur-[2px] opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex items-center justify-center gap-3">
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          setActiveLightboxMoment(moment);
                        }}
                        className="p-3 rounded-2xl bg-blue-600/90 hover:bg-blue-500 text-white shadow-lg shadow-blue-600/40 transition-transform active:scale-90"
                        title="View Full Uncropped Photo & Comments"
                        aria-label="View photo details"
                      >
                        <Eye className="w-5 h-5" />
                      </button>

                      {isAdmin && (
                        <>
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              onOpenEditModal(moment);
                            }}
                            className="p-3 rounded-2xl bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 shadow-lg transition-transform active:scale-90"
                            title="Edit metadata & Likes"
                            aria-label="Edit moment"
                          >
                            <Edit2 className="w-5 h-5" />
                          </button>

                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              setPhotoToDelete(moment);
                            }}
                            className="p-3 rounded-2xl bg-rose-600 hover:bg-rose-500 text-white shadow-lg shadow-rose-600/40 transition-transform active:scale-90"
                            title={language === 'NE' ? 'तस्बिर स्थायी रूपमा मेटाउनुहोस्' : 'Delete photo permanently'}
                            aria-label="Delete photo"
                          >
                            <Trash2 className="w-5 h-5" />
                          </button>
                        </>
                      )}
                    </div>
                  </div>

                  {/* Card Body Description & Action Footer */}
                  <div className="p-5 flex-1 flex flex-col justify-between">
                    <div>
                      <h3 className="font-heading font-bold text-base sm:text-lg text-slate-100 line-clamp-1 mb-2">
                        {language === 'NE' ? moment.titleNe : moment.titleEn}
                      </h3>
                      <p className="text-xs sm:text-sm text-slate-400 line-clamp-2 leading-relaxed mb-4">
                        {language === 'NE' ? moment.descNe : moment.descEn}
                      </p>
                    </div>

                    <div className="pt-4 border-t border-slate-800/80 flex items-center justify-between">
                      {/* Heart Like Interaction */}
                      <button
                        onClick={() => onLikeMoment(moment.id)}
                        className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all active:scale-95 ${
                          isLiked
                            ? 'bg-pink-500/20 text-pink-400 border border-pink-500/40'
                            : 'bg-slate-950 text-slate-400 hover:text-pink-400 hover:bg-pink-500/10 border border-slate-800'
                        }`}
                        title={isLiked ? 'Liked by you' : 'Leave a like'}
                      >
                        <Heart
                          className={`w-4 h-4 ${isLiked ? 'fill-pink-500 text-pink-500 animate-pulse' : ''}`}
                        />
                        <span>{formatLikes(moment.likes)}</span>
                      </button>

                      {/* Comments & Share quick triggers */}
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => setActiveLightboxMoment(moment)}
                          className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl bg-slate-950 text-slate-400 hover:text-slate-200 border border-slate-800 text-xs font-medium"
                          title="View comments"
                        >
                          <MessageSquare className="w-3.5 h-3.5 text-blue-400" />
                          <span>{momentComments.length}</span>
                        </button>

                        <button
                          onClick={() => handleCopyShareLink(moment)}
                          className="p-1.5 rounded-xl bg-slate-950 text-slate-400 hover:text-slate-200 border border-slate-800"
                          title="Share link"
                        >
                          <Share2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </div>
        )}

      </div>

      {/* Interactive Lightbox Modal */}
      <AnimatePresence>
        {activeLightboxMoment && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-slate-950/90 backdrop-blur-xl overflow-y-auto"
            onClick={() => setActiveLightboxMoment(null)}
          >
            <motion.div
              initial={{ scale: 0.92, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.92, opacity: 0 }}
              transition={{ type: 'spring', damping: 25, stiffness: 300 }}
              onClick={(e) => e.stopPropagation()}
              className="relative w-full max-w-5xl rounded-3xl bg-slate-900 border border-slate-800 shadow-2xl overflow-hidden grid grid-cols-1 lg:grid-cols-12 my-auto max-h-[90vh]"
            >
              {/* Close Button */}
              <button
                onClick={() => setActiveLightboxMoment(null)}
                className="absolute top-4 right-4 z-40 p-2 rounded-full bg-slate-950/80 hover:bg-slate-800 text-slate-300 hover:text-white border border-slate-700/80 transition-colors"
                aria-label="Close dialog"
              >
                <X className="w-5 h-5" />
              </button>

              {/* Left Column: High Res Uncropped Photo with Ambient Glow */}
              <div className="lg:col-span-7 bg-slate-950 p-6 flex items-center justify-center relative min-h-[300px] sm:min-h-[450px]">
                <img
                  src={activeLightboxMoment.imgUrl}
                  alt={activeLightboxMoment.titleEn}
                  referrerPolicy="no-referrer"
                  className="absolute inset-0 w-full h-full object-cover filter blur-3xl opacity-20"
                />
                <img
                  src={activeLightboxMoment.imgUrl}
                  alt={activeLightboxMoment.titleEn}
                  referrerPolicy="no-referrer"
                  className="relative z-10 max-h-[70vh] w-auto max-w-full object-contain rounded-2xl drop-shadow-[0_20px_40px_rgba(0,0,0,0.9)]"
                />
              </div>

              {/* Right Column: Metadata, Like, Share & Comments Feed */}
              <div className="lg:col-span-5 p-6 sm:p-8 flex flex-col justify-between bg-slate-900 border-t lg:border-t-0 lg:border-l border-slate-800 overflow-y-auto max-h-[70vh] lg:max-h-[85vh]">
                <div>
                  {/* Top Badges */}
                  <div className="flex items-center gap-2 mb-3">
                    <span className="px-3 py-1 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-400 text-xs font-bold">
                      {getCategoryBadgeLabel(activeLightboxMoment.category)}
                    </span>
                    <span className="text-xs text-slate-400 flex items-center gap-1">
                      <Calendar className="w-3.5 h-3.5" />
                      {activeLightboxMoment.date}
                    </span>
                  </div>

                  <h3 className="text-xl sm:text-2xl font-extrabold text-slate-100 font-heading mb-3">
                    {language === 'NE' ? activeLightboxMoment.titleNe : activeLightboxMoment.titleEn}
                  </h3>

                  <p className="text-sm text-slate-300 leading-relaxed mb-6">
                    {language === 'NE' ? activeLightboxMoment.descNe : activeLightboxMoment.descEn}
                  </p>

                  {/* Actions (Like + Share + Admin Edit + Delete Photo) */}
                  <div className="flex flex-wrap items-center gap-2.5 pb-6 border-b border-slate-800 mb-6">
                    <button
                      onClick={() => onLikeMoment(activeLightboxMoment.id)}
                      className={`flex-1 min-w-[120px] flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl text-sm font-bold transition-all ${
                        userLikedMoments.includes(activeLightboxMoment.id)
                          ? 'bg-pink-600 text-white shadow-lg shadow-pink-600/30'
                          : 'bg-slate-950 text-slate-300 hover:text-pink-400 border border-slate-800'
                      }`}
                    >
                      <Heart
                        className={`w-4 h-4 ${
                          userLikedMoments.includes(activeLightboxMoment.id) ? 'fill-white' : ''
                        }`}
                      />
                      <span>
                        {formatLikes(
                          // Read up to date likes
                          moments.find((m) => m.id === activeLightboxMoment.id)?.likes ?? activeLightboxMoment.likes
                        )}{' '}
                        {language === 'NE' ? 'लाइक्स' : 'Likes'}
                      </span>
                    </button>

                    <button
                      onClick={() => handleCopyShareLink(activeLightboxMoment)}
                      className="p-2.5 rounded-xl bg-slate-950 hover:bg-slate-800 text-slate-300 border border-slate-800"
                      title={language === 'NE' ? 'लिङ्क प्रतिलिपि गर्नुहोस्' : 'Copy Share Link'}
                    >
                      <Share2 className="w-4 h-4" />
                    </button>

                    {isAdmin && (
                      <button
                        onClick={() => {
                          const target = moments.find((m) => m.id === activeLightboxMoment.id) || activeLightboxMoment;
                          setActiveLightboxMoment(null);
                          onOpenEditModal(target);
                        }}
                        className="p-2.5 rounded-xl bg-slate-950 hover:bg-slate-800 text-blue-400 border border-slate-800 hover:border-blue-500/40"
                        title={language === 'NE' ? 'तस्बिर सम्पादन गर्नुहोस्' : 'Edit photo details'}
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>
                    )}

                    {isAdmin && (
                      <button
                        onClick={() => {
                          if (activeLightboxMoment) {
                            setPhotoToDelete(activeLightboxMoment);
                          }
                        }}
                        className="flex items-center gap-1.5 px-3 py-2.5 rounded-xl bg-rose-950/70 hover:bg-rose-600 border border-rose-800/80 hover:border-rose-600 text-rose-300 hover:text-white text-xs font-semibold shadow-lg shadow-rose-950/40 transition-all active:scale-95"
                        title={language === 'NE' ? 'यो तस्बिर स्थायी रूपमा मेटाउनुहोस्' : 'Delete this photo permanently'}
                      >
                        <Trash2 className="w-4 h-4 text-rose-400" />
                        <span>{language === 'NE' ? 'स्थायी मेटाउनुहोस्' : 'Delete Permanently'}</span>
                      </button>
                    )}
                  </div>

                  {/* Comments Feed */}
                  <div className="mb-4">
                    <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-3 flex items-center gap-1.5">
                      <MessageSquare className="w-3.5 h-3.5 text-blue-400" />
                      <span>
                        {language === 'NE' ? 'प्रतिक्रियाहरू' : 'Visitor Comments'} (
                        {(commentsMap[activeLightboxMoment.id] || []).length})
                      </span>
                    </h4>

                    <div className="space-y-3 max-h-48 overflow-y-auto pr-1">
                      {(commentsMap[activeLightboxMoment.id] || []).length === 0 ? (
                        <div className="text-xs text-slate-500 py-3 text-center italic">
                          {language === 'NE' ? 'पहिलो प्रतिक्रिया दिनुहोस्!' : 'Be the first to leave a comment!'}
                        </div>
                      ) : (
                        (commentsMap[activeLightboxMoment.id] || []).map((comment) => (
                          <div
                            key={comment.id}
                            className="p-3 rounded-xl bg-slate-950/60 border border-slate-800/80 text-xs group/comment"
                          >
                            <div className="flex items-center justify-between font-semibold text-slate-200 mb-1">
                              <span>{comment.author}</span>
                              <div className="flex items-center gap-2">
                                <span className="text-[10px] text-slate-500">
                                  {new Date(comment.createdAt).toLocaleDateString()}
                                </span>
                                {isAdmin && onDeleteComment && (
                                  <button
                                    type="button"
                                    onClick={() => onDeleteComment(activeLightboxMoment.id, comment.id)}
                                    className="p-1 rounded-md bg-rose-950/50 hover:bg-rose-600 text-rose-400 hover:text-white transition-colors"
                                    title={language === 'NE' ? 'प्रतिक्रिया मेटाउनुहोस्' : 'Delete comment'}
                                  >
                                    <Trash2 className="w-3 h-3" />
                                  </button>
                                )}
                              </div>
                            </div>
                            <p className="text-slate-400 leading-snug">{comment.text}</p>
                          </div>
                        ))
                      )}
                    </div>
                  </div>
                </div>

                {/* Comment Input Form */}
                <form onSubmit={handleCommentSubmit} className="mt-4 pt-4 border-t border-slate-800 space-y-2">
                  <input
                    type="text"
                    placeholder={language === 'NE' ? 'तपाईँको नाम (वैकल्पिक)' : 'Your name (optional)'}
                    value={commentAuthor}
                    onChange={(e) => setCommentAuthor(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-slate-100 text-xs focus:outline-none focus:border-blue-500"
                  />
                  <div className="flex gap-2">
                    <input
                      type="text"
                      required
                      placeholder={language === 'NE' ? 'प्रतिक्रिया लेख्नुहोस्...' : 'Write a comment...'}
                      value={commentText}
                      onChange={(e) => setCommentText(e.target.value)}
                      className="flex-1 px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-slate-100 text-xs focus:outline-none focus:border-blue-500"
                    />
                    <button
                      type="submit"
                      className="p-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white shrink-0 shadow-md shadow-blue-600/30 transition-all"
                    >
                      <Send className="w-4 h-4" />
                    </button>
                  </div>
                </form>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* In-App Delete Confirmation Modal (100% reliable inside iframe) */}
      <DeleteConfirmModal
        isOpen={!!photoToDelete}
        moment={photoToDelete}
        language={language}
        onClose={() => setPhotoToDelete(null)}
        onConfirmDelete={(id) => {
          setPhotoToDelete(null);
          if (activeLightboxMoment?.id === id) {
            setActiveLightboxMoment(null);
          }
          onDeleteMoment(id);
        }}
      />
    </section>
  );
};
