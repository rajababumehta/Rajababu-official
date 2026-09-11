import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Camera,
  Heart,
  Calendar,
  Zap,
  Eye,
  MessageSquare,
  Share2,
  X,
  Send,
  Layers,
} from 'lucide-react';
import { Moment, Comment, Language } from '../types';
import { formatLikes } from '../utils/likesFormatter';

interface JourneySectionProps {
  language: Language;
  moments: Moment[];
  onLikeMoment: (id: string) => void;
  userLikedMoments: string[];
  onAutoBoostAllLikes: () => void;
  commentsMap: Record<string, Comment[]>;
  onAddComment: (momentId: string, author: string, text: string) => void;
  onShowToast: (text: string, type: 'success' | 'error' | 'info') => void;
}

export const JourneySection: React.FC<JourneySectionProps> = ({
  language,
  moments,
  onLikeMoment,
  userLikedMoments,
  onAutoBoostAllLikes,
  commentsMap,
  onAddComment,
  onShowToast,
}) => {
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [activeLightboxMoment, setActiveLightboxMoment] = useState<Moment | null>(null);

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
    <section id="projects" className="py-20 sm:py-28 bg-slate-950 relative scroll-mt-24">
      <div id="journey" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Heading & Global Boost Bar */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12">
          <div>
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-400 text-xs font-semibold uppercase tracking-wider mb-3">
              <Camera className="w-3.5 h-3.5" />
              <span>{language === 'NE' ? 'परियोजनाहरू तथा दृश्य यात्रा' : 'Projects & Visual Journey'}</span>
            </div>
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-slate-100 font-heading tracking-tight">
              {language === 'NE' ? 'प्रमुख परियोजनाहरू तथा उपलब्धिहरू' : 'Featured Projects & Creations'}
            </h2>
            <p className="text-sm sm:text-base text-slate-400 mt-2 max-w-xl">
              {language === 'NE'
                ? 'वेब विकास कार्यहरू, प्राविधिक अन्वेषण र वास्तविक परियोजनाहरू।'
                : 'A showcase of web applications, client solutions, digital workshops, and technical milestones.'}
            </p>
          </div>

          {/* Action Bar (Auto-Boost) */}
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
          </div>
        </div>

        {/* Dynamic Category Filter Pills (Only when moments exist) */}
        {moments.length > 0 && categories.length > 1 && (
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
        )}

        {/* Uncropped Media Grid */}
        {filteredMoments.length === 0 ? (
          <div className="py-20 text-center rounded-3xl bg-slate-900/30 border border-slate-800/60 p-8 sm:p-12">
            <div className="w-16 h-16 rounded-2xl bg-blue-500/10 border border-blue-500/20 text-blue-400 flex items-center justify-center mx-auto mb-4">
              <Camera className="w-8 h-8" />
            </div>
            <h3 className="text-xl font-bold text-slate-200 mb-2">
              {language === 'NE' ? 'तस्बिरहरू थप्न तयार छ' : 'Ready for Moments & Photo Links'}
            </h3>
            <p className="text-sm sm:text-base text-slate-400 max-w-lg mx-auto leading-relaxed">
              {language === 'NE'
                ? 'तपाईँले प्रदान गर्नुहुने तस्बिर लिंकहरू यहाँ उच्च गुणस्तर र पूर्ण आकारमा प्रस्तुत गरिनेछन्।'
                : 'All previous sample photos have been cleared. Send your image links to feature them in this gallery.'}
            </p>
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
                      alt=""
                      aria-hidden="true"
                      referrerPolicy="no-referrer"
                      className="absolute inset-0 w-full h-full object-cover filter blur-2xl opacity-25 scale-125 pointer-events-none"
                    />

                    {/* Main Uncropped Photo */}
                    <img
                      src={moment.imgUrl}
                      alt={`Rajababu Mehta - ${moment.titleEn || 'Moments & Tech Journey'}`}
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

                    {/* Top Right Date Badge */}
                    <div className="absolute top-4 right-4 z-20 flex items-center gap-1.5">
                      <span className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-slate-950/80 backdrop-blur-md border border-slate-800 text-[11px] font-medium text-slate-300">
                        <Calendar className="w-3 h-3 text-slate-400" />
                        {moment.date}
                      </span>
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
                            ? 'bg-rose-500/20 text-rose-400 border border-rose-500/40 shadow-inner'
                            : 'bg-slate-950 text-slate-400 hover:text-rose-400 border border-slate-800'
                        }`}
                        title={isLiked ? 'Unlike photo' : 'Like photo'}
                      >
                        <Heart className={`w-3.5 h-3.5 ${isLiked ? 'fill-rose-400 text-rose-400' : ''}`} />
                        <span>{formatLikes(moment.likes || 0)}</span>
                      </button>

                      {/* Right info: comments count & lightbox open */}
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => setActiveLightboxMoment(moment)}
                          className="flex items-center gap-1 px-2.5 py-1.5 rounded-xl bg-slate-950 text-slate-400 hover:text-slate-200 border border-slate-800 text-xs font-medium transition-colors"
                          title="View comments"
                        >
                          <MessageSquare className="w-3.5 h-3.5 text-blue-400" />
                          <span>{momentComments.length}</span>
                        </button>

                        <button
                          onClick={() => handleCopyShareLink(moment)}
                          className="p-1.5 rounded-xl bg-slate-950 text-slate-400 hover:text-slate-200 border border-slate-800 transition-colors"
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

      {/* Lightbox Modal: Uncropped Full-Resolution View with Comments & Likes */}
      <AnimatePresence>
        {activeLightboxMoment && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-slate-950/90 backdrop-blur-md p-4 sm:p-6 lg:p-8 flex items-center justify-center overflow-y-auto"
            onClick={() => setActiveLightboxMoment(null)}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-slate-900 border border-slate-800 rounded-3xl overflow-hidden max-w-5xl w-full grid grid-cols-1 lg:grid-cols-12 shadow-2xl my-auto max-h-[90vh]"
            >
              {/* Left Column: Full Uncropped Image */}
              <div className="lg:col-span-7 bg-slate-950 flex items-center justify-center p-4 sm:p-6 relative min-h-[300px] lg:min-h-[500px]">
                <img
                  src={activeLightboxMoment.imgUrl}
                  alt={`Rajababu Mehta - ${activeLightboxMoment.titleEn || 'Moments & Tech Journey'}`}
                  referrerPolicy="no-referrer"
                  className="max-h-[70vh] w-auto max-w-full object-contain rounded-2xl drop-shadow-2xl"
                />

                <div className="absolute top-4 left-4 flex gap-2">
                  <span className="px-3 py-1 rounded-xl bg-slate-950/80 backdrop-blur-md border border-slate-800 text-xs font-bold text-blue-400">
                    {getCategoryBadgeLabel(activeLightboxMoment.category)}
                  </span>
                </div>
              </div>

              {/* Right Column: Information, Likes & Visitor Comments */}
              <div className="lg:col-span-5 p-6 sm:p-8 flex flex-col justify-between bg-slate-900/90 overflow-y-auto max-h-[85vh]">
                <div>
                  {/* Top Bar with Close Button */}
                  <div className="flex items-center justify-between pb-4 border-b border-slate-800 mb-6">
                    <div className="flex items-center gap-2 text-xs text-slate-400">
                      <Calendar className="w-3.5 h-3.5" />
                      <span>{activeLightboxMoment.date}</span>
                    </div>
                    <button
                      onClick={() => setActiveLightboxMoment(null)}
                      className="p-2 rounded-xl bg-slate-950 hover:bg-slate-800 text-slate-400 hover:text-white border border-slate-800 transition-colors"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>

                  {/* Title & Description */}
                  <h3 className="text-xl sm:text-2xl font-bold text-slate-100 font-heading mb-3 leading-snug">
                    {language === 'NE' ? activeLightboxMoment.titleNe : activeLightboxMoment.titleEn}
                  </h3>
                  <p className="text-sm text-slate-300 leading-relaxed mb-6">
                    {language === 'NE' ? activeLightboxMoment.descNe : activeLightboxMoment.descEn}
                  </p>

                  {/* Interactions Row */}
                  <div className="flex items-center gap-3 pb-6 border-b border-slate-800 mb-6">
                    <button
                      onClick={() => onLikeMoment(activeLightboxMoment.id)}
                      className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-2xl text-xs font-bold transition-all active:scale-95 ${
                        userLikedMoments.includes(activeLightboxMoment.id)
                          ? 'bg-rose-500/20 text-rose-400 border border-rose-500/40 shadow-inner'
                          : 'bg-slate-950 text-slate-300 hover:text-rose-400 border border-slate-800'
                      }`}
                    >
                      <Heart
                        className={`w-4 h-4 ${
                          userLikedMoments.includes(activeLightboxMoment.id) ? 'fill-rose-400 text-rose-400' : ''
                        }`}
                      />
                      <span>{formatLikes(activeLightboxMoment.likes || 0)} {language === 'NE' ? 'प्रतिक्रियाहरू' : 'Likes'}</span>
                    </button>

                    <button
                      onClick={() => handleCopyShareLink(activeLightboxMoment)}
                      className="p-3 rounded-2xl bg-slate-950 hover:bg-slate-800 text-slate-300 border border-slate-800 transition-colors"
                      title="Copy link"
                    >
                      <Share2 className="w-4 h-4" />
                    </button>
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
                            className="p-3 rounded-xl bg-slate-950/60 border border-slate-800/80 text-xs"
                          >
                            <div className="flex items-center justify-between font-semibold text-slate-200 mb-1">
                              <span>{comment.author}</span>
                              <span className="text-[10px] text-slate-500">
                                {new Date(comment.createdAt).toLocaleDateString()}
                              </span>
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
    </section>
  );
};
