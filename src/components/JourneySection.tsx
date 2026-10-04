import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Heart,
  Calendar,
  Zap,
  MessageSquare,
  Share2,
  X,
  Send,
  Edit3,
  Trash2,
  Newspaper,
  BookOpen,
} from 'lucide-react';
import { Moment, Comment, Language } from '../types';
import { formatLikes } from '../utils/likesFormatter';

interface JourneySectionProps {
  language: Language;
  moments?: Moment[];
  onLikeMoment: (id: string) => void;
  userLikedMoments?: string[];
  onAutoBoostAllLikes?: () => void;
  commentsMap?: Record<string, Comment[]>;
  onAddComment: (momentId: string, author: string, text: string) => void;
  onShowToast: (text: string, type: 'success' | 'error' | 'info') => void;
  isAdmin?: boolean;
  onOpenAdminUpload?: () => void;
  onEditMoment?: (moment: Moment) => void;
  onDeleteMoment?: (id: string) => void;
}

export const JourneySection: React.FC<JourneySectionProps> = ({
  language,
  moments = [],
  onLikeMoment,
  userLikedMoments = [],
  onAutoBoostAllLikes,
  commentsMap = {},
  onAddComment,
  onShowToast,
  isAdmin = false,
  onOpenAdminUpload,
  onEditMoment,
  onDeleteMoment,
}) => {
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [activeLightboxMoment, setActiveLightboxMoment] = useState<Moment | null>(null);

  // Comment input state for Lightbox
  const [commentAuthor, setCommentAuthor] = useState('');
  const [commentText, setCommentText] = useState('');

  // Extract all categories dynamically
  const categories = useMemo(() => {
    const defaultCats = ['Technology', 'AI Explainer', 'Web Development', 'Milestone'];
    const safeMoments = moments || [];
    const customCats = safeMoments.map((m) => m.category).filter(Boolean);
    const set = new Set(['All', ...defaultCats, ...customCats]);
    return Array.from(set);
  }, [moments]);

  // Filter moments
  const filteredMoments = useMemo(() => {
    const safeMoments = moments || [];
    if (selectedCategory === 'All') return safeMoments;
    return safeMoments.filter((m) => m.category?.toLowerCase() === selectedCategory.toLowerCase());
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
      language === 'NE' ? 'पोस्ट लिंक क्लिपबोर्डमा प्रतिलिपि गरियो!' : 'Direct post link copied to clipboard!',
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
      case 'ai explainer':
        return 'एआई व्याख्या';
      case 'web development':
        return 'वेब विकास';
      case 'milestone':
        return 'उपलब्धि';
      default:
        return cat;
    }
  };

  return (
    <section id="posts" className="py-20 sm:py-28 bg-slate-950 relative scroll-mt-24 border-t border-slate-900/60">
      <div id="projects" className="hidden" aria-hidden="true" />
      <div id="journey" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Heading & Global Boost Bar */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12">
          <div>
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-400 text-xs font-semibold uppercase tracking-wider mb-3">
              <Newspaper className="w-3.5 h-3.5 text-blue-400" />
              <span>{language === 'NE' ? 'नयाँ लेख तथा पोस्टहरू' : 'Latest Posts & Updates'}</span>
            </div>
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-slate-100 font-heading tracking-tight">
              {language === 'NE' ? 'नयाँ पोस्टहरू तथा प्राविधिक अपडेटहरू' : 'Latest Posts & Tech Insights'}
            </h2>
            <p className="text-sm sm:text-base text-slate-400 mt-2 max-w-xl leading-relaxed">
              {language === 'NE'
                ? 'राजाबाबु मेहताद्वारा प्रकाशित नयाँ एआई गाइड, वेब विकास अपडेट, लेख तथा महत्त्वपूर्ण जानकारीहरू।'
                : 'Articles, practical AI workflows, website engineering guides, and project updates by Rajababu Mehta.'}
            </p>
          </div>

          {/* Action Bar (Auto-Boost) - Only visible when Admin is logged in */}
          {isAdmin && onAutoBoostAllLikes && (
            <div className="flex flex-wrap items-center gap-3">
              <button
                id="btn-auto-boost-all-likes"
                onClick={onAutoBoostAllLikes}
                className="flex items-center gap-2 px-4 py-2.5 rounded-2xl bg-gradient-to-r from-pink-600/90 to-rose-600/90 hover:from-pink-500 hover:to-rose-500 text-white text-xs sm:text-sm font-semibold shadow-lg shadow-pink-600/25 transition-all hover:scale-[1.02] active:scale-[0.98]"
                title="Boost realistic engagement likes across all posts"
              >
                <Zap className="w-4 h-4 text-amber-300 animate-bounce" />
                <span>{language === 'NE' ? '⚡ सबैमा लाइक्स बढाउनुहोस्' : '⚡ Auto-Boost Likes'}</span>
              </button>
            </div>
          )}
        </div>

        {/* Dynamic Category Filter Pills */}
        {(moments || []).length > 0 && categories.length > 1 && (
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

        {/* Clean Editorial Post Cards Grid (NO IMAGES) */}
        {filteredMoments.length === 0 ? (
          <div className="py-20 text-center rounded-3xl bg-slate-900/30 border border-slate-800/60 p-8 sm:p-12">
            <div className="w-16 h-16 rounded-2xl bg-blue-500/10 border border-blue-500/20 text-blue-400 flex items-center justify-center mx-auto mb-4">
              <Newspaper className="w-8 h-8" />
            </div>
            <h3 className="text-xl font-bold text-slate-200 mb-2">
              {language === 'NE' ? 'हाल कुनै नयाँ पोस्ट प्रकाशित भएको छैन' : 'No Posts Published Yet'}
            </h3>
            <p className="text-sm sm:text-base text-slate-400 max-w-lg mx-auto leading-relaxed">
              {language === 'NE'
                ? 'राजाबाबु मेहताका नयाँ प्राविधिक लेख, एआई गाइड र अपडेटहरू यहाँ चाँडै प्रकाशित गरिनेछ।'
                : 'Articles, practical AI workflows, and tech engineering updates by Rajababu Mehta will appear here.'}
            </p>
            {isAdmin && onOpenAdminUpload && (
              <button
                onClick={onOpenAdminUpload}
                className="mt-6 inline-flex items-center gap-2 px-5 py-2.5 rounded-2xl bg-blue-600 hover:bg-blue-500 text-white text-xs sm:text-sm font-semibold shadow-lg shadow-blue-600/30 transition-all hover:scale-[1.02] active:scale-95 cursor-pointer"
              >
                <span>{language === 'NE' ? '✍️ नयाँ पोस्ट लेख्नुहोस्' : '✍️ Create New Post'}</span>
              </button>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-6 sm:gap-8">
            {filteredMoments.map((moment, idx) => {
              const isLiked = (userLikedMoments || []).includes(moment.id);
              const momentComments = (commentsMap || {})[moment.id] || [];

              return (
                <motion.div
                  key={moment.id}
                  id={`moment-${moment.id}`}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.4, delay: idx * 0.05 }}
                  className="group relative rounded-3xl bg-slate-900/70 border border-slate-800/80 p-6 sm:p-7 flex flex-col justify-between hover:border-blue-500/40 hover:bg-slate-900/90 transition-all duration-300 shadow-xl hover:shadow-2xl hover:shadow-blue-950/20"
                >
                  {/* Card Content Top Area */}
                  <div>
                    {/* Top Bar: Category Pill & Date */}
                    <div className="flex items-center justify-between gap-3 mb-4">
                      <span className="px-3 py-1 rounded-xl bg-blue-500/10 border border-blue-500/20 text-xs font-semibold text-blue-400">
                        {getCategoryBadgeLabel(moment.category)}
                      </span>

                      <div className="flex items-center gap-2">
                        <span className="flex items-center gap-1.5 text-xs text-slate-400 font-medium">
                          <Calendar className="w-3.5 h-3.5 text-slate-500" />
                          {moment.date}
                        </span>

                        {isAdmin && (
                          <div className="flex items-center gap-1 ml-2">
                            {onEditMoment && (
                              <button
                                type="button"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  onEditMoment(moment);
                                }}
                                className="p-1.5 rounded-lg bg-slate-950 hover:bg-slate-800 text-amber-400 border border-slate-800 text-xs transition-colors"
                                title="Edit Post"
                              >
                                <Edit3 className="w-3.5 h-3.5" />
                              </button>
                            )}
                            {onDeleteMoment && (
                              <button
                                type="button"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  if (window.confirm(language === 'NE' ? 'यो पोस्ट वेबसाइटबाट हटाउन चाहनुहुन्छ?' : 'Are you sure you want to delete this post?')) {
                                    onDeleteMoment(moment.id);
                                  }
                                }}
                                className="p-1.5 rounded-lg bg-slate-950 hover:bg-slate-800 text-rose-400 border border-slate-800 text-xs transition-colors"
                                title="Delete Post"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            )}
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Post Title */}
                    <h3
                      onClick={() => setActiveLightboxMoment(moment)}
                      className="font-heading font-bold text-lg sm:text-xl text-slate-100 group-hover:text-blue-300 transition-colors mb-3 leading-snug cursor-pointer"
                    >
                      {language === 'NE' ? moment.titleNe : moment.titleEn}
                    </h3>

                    {/* Post Description */}
                    <p className="text-sm text-slate-300/90 leading-relaxed mb-5">
                      {language === 'NE' ? moment.descNe : moment.descEn}
                    </p>

                    {/* Author Credit Pill */}
                    <div className="flex items-center gap-2.5 py-3 border-t border-slate-800/60">
                      <div className="w-6 h-6 rounded-full overflow-hidden bg-slate-800 ring-1 ring-blue-500/30 shrink-0">
                        <img src="/brand-avatar.png" alt="Rajababu Mehta" className="w-full h-full object-cover" />
                      </div>
                      <div className="flex items-center gap-1.5 text-xs text-slate-300">
                        <span className="font-semibold text-slate-200">Rajababu Mehta</span>
                        <span className="text-slate-600">•</span>
                        <span className="text-blue-400 text-[11px] font-medium">
                          {language === 'NE' ? 'एआई वेबसाइट डेभलपर' : 'AI Website Developer'}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Card Action Footer */}
                  <div className="pt-4 border-t border-slate-800/80 flex items-center justify-between mt-2">
                    {/* Heart Like Interaction */}
                    <button
                      onClick={() => onLikeMoment(moment.id)}
                      className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all active:scale-95 ${
                        isLiked
                          ? 'bg-rose-500/20 text-rose-400 border border-rose-500/40 shadow-inner'
                          : 'bg-slate-950 text-slate-400 hover:text-rose-400 border border-slate-800'
                      }`}
                      title={isLiked ? 'Unlike' : 'Like'}
                    >
                      <Heart className={`w-3.5 h-3.5 ${isLiked ? 'fill-rose-400 text-rose-400' : ''}`} />
                      <span>{formatLikes(moment.likes || 0)}</span>
                    </button>

                    {/* Right Controls */}
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

                      <button
                        onClick={() => setActiveLightboxMoment(moment)}
                        className="flex items-center gap-1 px-3 py-1.5 rounded-xl bg-blue-600/90 hover:bg-blue-500 text-white text-xs font-semibold shadow-md shadow-blue-600/30 transition-all hover:scale-[1.02] active:scale-95 cursor-pointer ml-1"
                      >
                        <span>{language === 'NE' ? 'विस्तृत' : 'Read'}</span>
                        <BookOpen className="w-3 h-3" />
                      </button>
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </div>
        )}

      </div>

      {/* Article Detail / Comments Reader Modal (Clean, No-Image Layout) */}
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
              className="bg-slate-900 border border-slate-800 rounded-3xl overflow-hidden max-w-2xl w-full shadow-2xl my-auto p-6 sm:p-8 max-h-[90vh] overflow-y-auto flex flex-col justify-between"
            >
              <div>
                {/* Modal Header */}
                <div className="flex items-center justify-between pb-4 border-b border-slate-800 mb-6">
                  <div className="flex items-center gap-2">
                    <span className="px-3 py-1 rounded-xl bg-blue-500/10 border border-blue-500/20 text-xs font-bold text-blue-400">
                      {getCategoryBadgeLabel(activeLightboxMoment.category)}
                    </span>
                    <span className="flex items-center gap-1.5 text-xs text-slate-400">
                      <Calendar className="w-3.5 h-3.5 text-slate-500" />
                      {activeLightboxMoment.date}
                    </span>
                  </div>

                  <div className="flex items-center gap-2">
                    {onEditMoment && (
                      <button
                        type="button"
                        onClick={() => {
                          const m = activeLightboxMoment;
                          setActiveLightboxMoment(null);
                          onEditMoment(m);
                        }}
                        className="p-2 rounded-xl bg-slate-950 hover:bg-slate-800 text-amber-400 border border-slate-800 transition-colors"
                        title="Edit Post"
                      >
                        <Edit3 className="w-4 h-4" />
                      </button>
                    )}
                    {onDeleteMoment && (
                      <button
                        type="button"
                        onClick={() => {
                          if (window.confirm(language === 'NE' ? 'यो पोस्ट हटाउन चाहनुहुन्छ?' : 'Are you sure you want to delete this post?')) {
                            const id = activeLightboxMoment.id;
                            setActiveLightboxMoment(null);
                            onDeleteMoment(id);
                          }
                        }}
                        className="p-2 rounded-xl bg-slate-950 hover:bg-slate-800 text-rose-400 border border-slate-800 transition-colors"
                        title="Delete Post"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    )}
                    <button
                      onClick={() => setActiveLightboxMoment(null)}
                      className="p-2 rounded-xl bg-slate-950 hover:bg-slate-800 text-slate-400 hover:text-white border border-slate-800 transition-colors cursor-pointer"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                {/* Post Title */}
                <h3 className="text-xl sm:text-2xl font-bold text-slate-100 font-heading mb-4 leading-snug">
                  {language === 'NE' ? activeLightboxMoment.titleNe : activeLightboxMoment.titleEn}
                </h3>

                {/* Author Info */}
                <div className="flex items-center gap-2.5 pb-5 border-b border-slate-800/80 mb-6">
                  <div className="w-7 h-7 rounded-full overflow-hidden bg-slate-800 ring-1 ring-blue-500/30 shrink-0">
                    <img src="/brand-avatar.png" alt="Rajababu Mehta" className="w-full h-full object-cover" />
                  </div>
                  <div className="flex items-center gap-1.5 text-xs">
                    <span className="font-semibold text-slate-200">Rajababu Mehta</span>
                    <span className="text-slate-600">•</span>
                    <span className="text-blue-400 font-medium">
                      {language === 'NE' ? 'एआई वेबसाइट डेभलपर • वीरगञ्ज, नेपाल' : 'AI Website Developer • Birgunj, Nepal'}
                    </span>
                  </div>
                </div>

                {/* Full Article Content */}
                <div className="prose prose-invert max-w-none text-slate-300 text-sm sm:text-base leading-relaxed mb-6">
                  <p>{language === 'NE' ? activeLightboxMoment.descNe : activeLightboxMoment.descEn}</p>
                </div>

                {/* Interactions Row: Like + Share */}
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
                    className="p-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white shrink-0 shadow-md shadow-blue-600/30 transition-all cursor-pointer"
                  >
                    <Send className="w-4 h-4" />
                  </button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  );
};
