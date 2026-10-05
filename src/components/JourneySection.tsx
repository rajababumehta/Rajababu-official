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
  ArrowLeft,
  Search,
  Sparkles,
  FileText,
  Clock,
  Radio,
  CheckCircle2,
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
  onAddMoment?: (moment: Moment) => void;
  onEditMoment?: (moment: Moment) => void;
  onDeleteMoment?: (id: string) => void;
  onBackToHome?: () => void;
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
  onAddMoment,
  onEditMoment,
  onDeleteMoment,
  onBackToHome,
}) => {
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [activeLightboxMoment, setActiveLightboxMoment] = useState<Moment | null>(null);

  // Admin In-Section News Article Composer Form state
  const [newsTitleEn, setNewsTitleEn] = useState('');
  const [newsTitleNe, setNewsTitleNe] = useState('');
  const [newsCategory, setNewsCategory] = useState('AI & Technology');
  const [newsContentEn, setNewsContentEn] = useState('');
  const [newsContentNe, setNewsContentNe] = useState('');
  const [newsImageUrl, setNewsImageUrl] = useState('');
  const [isPublishing, setIsPublishing] = useState(false);

  // Comment input state for Lightbox
  const [commentAuthor, setCommentAuthor] = useState('');
  const [commentText, setCommentText] = useState('');

  // Categories list
  const categories = useMemo(() => {
    const defaultCats = [
      'Breaking News',
      'AI & Technology',
      'Web Development',
      'Notice & Announcement',
      'Editorial',
    ];
    const safeMoments = moments || [];
    const customCats = safeMoments.map((m) => m.category).filter(Boolean);
    const set = new Set(['All', ...defaultCats, ...customCats]);
    return Array.from(set);
  }, [moments]);

  // Filter moments by category and search query
  const filteredMoments = useMemo(() => {
    let list = moments || [];
    if (selectedCategory !== 'All') {
      list = list.filter((m) => m.category?.toLowerCase() === selectedCategory.toLowerCase());
    }
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      list = list.filter(
        (m) =>
          m.titleEn?.toLowerCase().includes(q) ||
          m.titleNe?.toLowerCase().includes(q) ||
          m.descEn?.toLowerCase().includes(q) ||
          m.descNe?.toLowerCase().includes(q)
      );
    }
    return list;
  }, [moments, selectedCategory, searchQuery]);

  // Handle Admin Direct News Publishing
  const handlePublishNews = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newsTitleEn.trim()) {
      onShowToast(
        language === 'NE' ? 'कृपया समाचार/लेखको शीर्षक लेख्नुहोस्।' : 'Please provide a headline.',
        'error'
      );
      return;
    }
    if (!newsContentEn.trim()) {
      onShowToast(
        language === 'NE' ? 'कृपया समाचार/लेखको विवरण लेख्नुहोस्।' : 'Please write article content.',
        'error'
      );
      return;
    }

    setIsPublishing(true);

    const newMoment: Moment = {
      id: `post-${Date.now()}`,
      titleEn: newsTitleEn.trim(),
      titleNe: newsTitleNe.trim() || newsTitleEn.trim(),
      descEn: newsContentEn.trim(),
      descNe: newsContentNe.trim() || newsContentEn.trim(),
      imgUrl: newsImageUrl.trim(),
      likes: 0,
      category: newsCategory,
      date: new Date().toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
      }),
      isUserUploaded: true,
    };

    if (onAddMoment) {
      onAddMoment(newMoment);
    }

    onShowToast(
      language === 'NE'
        ? '🚀 समाचार तथा लेख सफलतापूर्वक प्रकाशित भयो!'
        : '🚀 Article published to News Channel successfully!',
      'success'
    );

    // Reset composer form
    setNewsTitleEn('');
    setNewsTitleNe('');
    setNewsContentEn('');
    setNewsContentNe('');
    setNewsImageUrl('');
    setIsPublishing(false);
  };

  const handleCommentSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeLightboxMoment) return;
    if (!commentText.trim()) return;

    const author = commentAuthor.trim() || (language === 'NE' ? 'अतिथि पाठक' : 'Guest Reader');
    onAddComment(activeLightboxMoment.id, author, commentText.trim());
    setCommentText('');
    onShowToast(
      language === 'NE' ? 'प्रतिक्रिया सुरक्षित भयो!' : 'Comment posted successfully!',
      'success'
    );
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
      language === 'NE'
        ? 'समाचार लिंक क्लिपबोर्डमा प्रतिलिपि गरियो!'
        : 'Article link copied to clipboard!',
      'info'
    );
  };

  const handleShareToWhatsApp = (moment: Moment) => {
    const title = language === 'NE' ? moment.titleNe || moment.titleEn : moment.titleEn;
    const url = `${window.location.origin}${window.location.pathname}#posts`;
    const shareText = `📰 ${title}\n\nRajababu Mehta News & Tech Channel:\n${url}`;
    window.open(`https://api.whatsapp.com/send?text=${encodeURIComponent(shareText)}`, '_blank');
  };

  const getCategoryBadgeLabel = (cat?: string) => {
    if (!cat) return language === 'NE' ? 'समाचार' : 'News';
    if (language === 'EN') return cat;
    switch (cat.toLowerCase()) {
      case 'all':
        return 'सबै समाचार';
      case 'breaking news':
        return '🔴 ताजा समाचार';
      case 'ai & technology':
      case 'technology':
        return '💡 एआई र प्रविधि';
      case 'web development':
        return '💻 वेब विकास';
      case 'notice & announcement':
      case 'milestone':
        return '📢 आधिकारिक सूचना';
      case 'editorial':
        return '✍️ सम्पादकीय विचार';
      default:
        return cat;
    }
  };

  const getCategoryBadgeColor = (cat?: string) => {
    switch (cat?.toLowerCase()) {
      case 'breaking news':
        return 'bg-rose-500/15 border-rose-500/30 text-rose-400';
      case 'ai & technology':
      case 'technology':
        return 'bg-purple-500/15 border-purple-500/30 text-purple-400';
      case 'web development':
        return 'bg-blue-500/15 border-blue-500/30 text-blue-400';
      case 'notice & announcement':
      case 'milestone':
        return 'bg-emerald-500/15 border-emerald-500/30 text-emerald-400';
      case 'editorial':
        return 'bg-amber-500/15 border-amber-500/30 text-amber-400';
      default:
        return 'bg-blue-500/15 border-blue-500/30 text-blue-400';
    }
  };

  return (
    <section id="posts" className="py-12 sm:py-20 bg-slate-950 min-h-screen relative scroll-mt-20">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Top Breadcrumb & Return to Home Navigation */}
        <div className="flex items-center justify-between gap-4 pb-6 mb-8 border-b border-slate-800/80">
          <button
            type="button"
            onClick={onBackToHome}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-slate-900/90 hover:bg-slate-800 border border-slate-800 text-slate-300 hover:text-white text-xs sm:text-sm font-semibold transition-all shadow-sm group cursor-pointer"
          >
            <ArrowLeft className="w-4 h-4 text-blue-400 group-hover:-translate-x-1 transition-transform" />
            <span>{language === 'NE' ? '← मुख्य पोर्टफोलियोमा फर्कनुहोस्' : '← Back to Home / Portfolio'}</span>
          </button>

          <div className="flex items-center gap-2 text-[11px] sm:text-xs text-slate-400">
            <Radio className="w-3.5 h-3.5 text-rose-500 animate-pulse" />
            <span className="font-semibold text-slate-300">
              {language === 'NE' ? 'लाइभ न्युज पोर्टल' : 'Live News Channel'}
            </span>
          </div>
        </div>

        {/* News Channel Masthead Banner */}
        <div className="rounded-3xl bg-gradient-to-br from-slate-900 via-slate-900/90 to-blue-950/40 border border-slate-800/90 p-6 sm:p-10 mb-10 shadow-2xl relative overflow-hidden">
          <div className="absolute top-0 right-0 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl pointer-events-none" />
          
          {/* Breaking Ticker Pill */}
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-rose-500/10 border border-rose-500/30 text-rose-400 text-xs font-bold uppercase tracking-wider mb-4">
            <span className="w-2 h-2 rounded-full bg-rose-500 animate-ping" />
            <span>{language === 'NE' ? 'ताजा प्राविधिक समाचार तथा विचार' : 'Official Tech News Desk'}</span>
          </div>

          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-white font-heading tracking-tight mb-3">
            {language === 'NE' ? 'राजाबाबु टेक न्युज तथा विचार डेस्क' : 'Rajababu Mehta Tech News & Editorial'}
          </h1>
          <p className="text-sm sm:text-base text-slate-300 max-w-2xl leading-relaxed mb-6">
            {language === 'NE'
              ? 'राजाबाबु मेहताद्वारा प्रकाशित नयाँ एआई विश्लेषण, प्राविधिक समाचार, वेब विकास अपडेट तथा सूचनाहरू।'
              : 'Articles, practical AI workflows, news dispatches, and engineering guides published directly by Rajababu Mehta.'}
          </p>

          {/* Masthead Byline Bar */}
          <div className="flex flex-wrap items-center gap-4 text-xs text-slate-400 pt-4 border-t border-slate-800/80">
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 rounded-full overflow-hidden ring-1 ring-blue-400/30">
                <img src="/brand-avatar.png" alt="Rajababu Mehta" className="w-full h-full object-cover" />
              </div>
              <span className="font-semibold text-slate-200">Editor: Rajababu Mehta</span>
            </div>
            <span>•</span>
            <div className="flex items-center gap-1.5">
              <Calendar className="w-3.5 h-3.5 text-blue-400" />
              <span>Birgunj, Nepal</span>
            </div>
            <span>•</span>
            <div className="text-blue-400 font-medium">
              {language === 'NE' ? `${moments.length} समाचार/लेख प्रकाशित` : `${moments.length} Published Articles`}
            </div>
          </div>
        </div>

        {/* ADMIN ONLY: News Article Composer (Active when Admin is logged in) */}
        {isAdmin && (
          <div className="rounded-3xl bg-slate-900 border-2 border-amber-500/40 p-6 sm:p-8 mb-12 shadow-2xl shadow-amber-950/20 relative">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-5 mb-6 border-b border-slate-800">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-amber-500/10 border border-amber-500/30 text-amber-400 flex items-center justify-center">
                  <FileText className="w-5 h-5" />
                </div>
                <div>
                  <h2 className="text-lg sm:text-xl font-bold text-white flex items-center gap-2">
                    <span>{language === 'NE' ? '📰 नयाँ समाचार / लेख सिर्जना गर्नुहोस्' : '📰 News Article Composer'}</span>
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-500/20 text-amber-300 border border-amber-500/30">
                      ADMIN ACTIVE
                    </span>
                  </h2>
                  <p className="text-xs text-slate-400">
                    {language === 'NE'
                      ? 'समाचार च्यानल शैलीमा आफ्ना लेख वा जानकारी यहाँ लेखेर सिधै प्रकाशित गर्नुहोस्।'
                      : 'Write news, articles, or announcements to publish instantly to your channel.'}
                  </p>
                </div>
              </div>

              {/* Auto-Boost Likes Button */}
              {onAutoBoostAllLikes && (
                <button
                  type="button"
                  onClick={onAutoBoostAllLikes}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-pink-600/20 hover:bg-pink-600/30 text-pink-300 border border-pink-500/30 text-xs font-semibold transition-all self-start sm:self-auto cursor-pointer"
                  title="Boost likes"
                >
                  <Zap className="w-3.5 h-3.5 text-amber-300" />
                  <span>{language === 'NE' ? '⚡ सबैमा लाइक्स बढाउनुहोस्' : '⚡ Auto-Boost Likes'}</span>
                </button>
              )}
            </div>

            {/* Logout Guidance Notice */}
            <div className="mb-6 p-3 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-xs text-amber-200/90 flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-amber-400 shrink-0" />
              <span>
                {language === 'NE'
                  ? '💡 सुझाव: एडमिन लगआउट गर्न कुनै पनि बेला माथिल्लो नेभिगेसन बारको गोलो फोटोमा क्लिक गर्नुहोस्।'
                  : '💡 Tip: To log out of admin anytime, simply click on your circle photo in the top navigation bar.'}
              </span>
            </div>

            {/* In-Section News Publishing Form */}
            <form onSubmit={handlePublishNews} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-12 gap-4">
                {/* Headline (English) */}
                <div className="sm:col-span-8">
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    {language === 'NE' ? 'समाचारको मुख्य शीर्षक (Headline - English)' : 'News Headline (English)'} *
                  </label>
                  <input
                    type="text"
                    required
                    value={newsTitleEn}
                    onChange={(e) => setNewsTitleEn(e.target.value)}
                    placeholder="e.g. AI-Powered Workflow Automations Released"
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-700 text-slate-100 text-sm focus:outline-none focus:border-blue-500"
                  />
                </div>

                {/* News Category */}
                <div className="sm:col-span-4">
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    {language === 'NE' ? 'समाचारको वर्ग (Category)' : 'Category'} *
                  </label>
                  <select
                    value={newsCategory}
                    onChange={(e) => setNewsCategory(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-700 text-slate-100 text-sm focus:outline-none focus:border-blue-500"
                  >
                    <option value="Breaking News">🔴 Breaking News / ताजा समाचार</option>
                    <option value="AI & Technology">💡 AI & Technology / एआई र प्रविधि</option>
                    <option value="Web Development">💻 Web Development / वेबसाइट विकास</option>
                    <option value="Notice & Announcement">📢 Notice & Announcement / सूचना</option>
                    <option value="Editorial">✍️ Editorial / सम्पादकीय विचार</option>
                  </select>
                </div>
              </div>

              {/* Headline (Nepali - Optional) */}
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  {language === 'NE' ? 'समाचारको मुख्य शीर्षक (नेपाली - ऐच्छिक)' : 'News Headline (Nepali - Optional)'}
                </label>
                <input
                  type="text"
                  value={newsTitleNe}
                  onChange={(e) => setNewsTitleNe(e.target.value)}
                  placeholder="उदा. एआई प्रविधिबाट वेबसाइट विकास गर्ने नयाँ तरिका"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-700 text-slate-100 text-sm focus:outline-none focus:border-blue-500"
                />
              </div>

              {/* Full Article Text / Content (English) */}
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  {language === 'NE' ? 'समाचार / लेखको सम्पूर्ण विवरण (Article Text - English)' : 'Full Article Body / Information (English)'} *
                </label>
                <textarea
                  required
                  rows={4}
                  value={newsContentEn}
                  onChange={(e) => setNewsContentEn(e.target.value)}
                  placeholder="Write the complete article details, explanation, developer insights, or official announcement here..."
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-700 text-slate-100 text-sm focus:outline-none focus:border-blue-500 resize-none leading-relaxed"
                />
              </div>

              {/* Full Article Text (Nepali - Optional) */}
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  {language === 'NE' ? 'समाचार / लेखको विवरण (नेपाली - ऐच्छिक)' : 'Article Body (Nepali - Optional)'}
                </label>
                <textarea
                  rows={3}
                  value={newsContentNe}
                  onChange={(e) => setNewsContentNe(e.target.value)}
                  placeholder="नेपाली भाषामा सम्पूर्ण समाचार, लेख वा जानकारी यहाँ लेख्नुहोस्..."
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-700 text-slate-100 text-sm focus:outline-none focus:border-blue-500 resize-none leading-relaxed"
                />
              </div>

              {/* Optional Image URL */}
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  {language === 'NE' ? 'तस्बिरको URL (ऐच्छिक - तस्बिर नभए खाली छोड्नुहोस्)' : 'Article Banner URL (Optional - leave empty for text article)'}
                </label>
                <input
                  type="url"
                  value={newsImageUrl}
                  onChange={(e) => setNewsImageUrl(e.target.value)}
                  placeholder="https://... (Optional banner image)"
                  className="w-full px-3.5 py-2 rounded-xl bg-slate-950 border border-slate-700 text-slate-100 text-xs font-mono focus:outline-none focus:border-blue-500"
                />
              </div>

              {/* Publish Action Button */}
              <div className="pt-2 flex flex-wrap items-center gap-3">
                <button
                  type="submit"
                  disabled={isPublishing || !newsTitleEn.trim() || !newsContentEn.trim()}
                  className="flex-1 sm:flex-initial flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-bold text-sm shadow-xl shadow-blue-600/30 transition-all hover:scale-[1.01] active:scale-[0.99] disabled:opacity-50 cursor-pointer"
                >
                  <Send className="w-4 h-4" />
                  <span>
                    {isPublishing
                      ? (language === 'NE' ? 'प्रकाशित गरिँदैछ...' : 'Publishing...')
                      : (language === 'NE' ? '🚀 समाचार प्रकाशित गर्नुहोस्' : '🚀 Publish Article to Channel')}
                  </span>
                </button>

                {(newsTitleEn || newsContentEn) && (
                  <button
                    type="button"
                    onClick={() => {
                      setNewsTitleEn('');
                      setNewsTitleNe('');
                      setNewsContentEn('');
                      setNewsContentNe('');
                      setNewsImageUrl('');
                    }}
                    className="px-4 py-3 rounded-xl bg-slate-800 hover:bg-slate-750 text-slate-300 text-xs font-semibold transition-colors"
                  >
                    {language === 'NE' ? 'फारम खाली गर्नुहोस्' : 'Clear Form'}
                  </button>
                )}
              </div>
            </form>
          </div>
        )}

        {/* Channel Controls: Search & Category Filter Bar */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
          {/* Dynamic Category Filter Tabs */}
          <div className="flex items-center gap-2 overflow-x-auto pb-2 sm:pb-0 no-scrollbar">
            {categories.map((cat) => {
              const isSelected = selectedCategory.toLowerCase() === cat.toLowerCase();
              return (
                <button
                  key={cat}
                  onClick={() => setSelectedCategory(cat)}
                  className={`whitespace-nowrap px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold transition-all cursor-pointer ${
                    isSelected
                      ? 'bg-blue-600 text-white shadow-md shadow-blue-600/30 border border-blue-500'
                      : 'bg-slate-900 text-slate-400 hover:text-slate-200 hover:bg-slate-850 border border-slate-800'
                  }`}
                >
                  {getCategoryBadgeLabel(cat)}
                </button>
              );
            })}
          </div>

          {/* Search Box */}
          <div className="relative min-w-[240px]">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder={language === 'NE' ? 'समाचार तथा लेख खोज्नुहोस्...' : 'Search news & articles...'}
              className="w-full pl-10 pr-4 py-2 rounded-xl bg-slate-900 border border-slate-800 text-slate-200 text-xs focus:outline-none focus:border-blue-500"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white text-xs"
              >
                ✕
              </button>
            )}
          </div>
        </div>

        {/* Clean Editorial News Cards Grid */}
        {filteredMoments.length === 0 ? (
          <div className="py-20 text-center rounded-3xl bg-slate-900/40 border border-slate-800/80 p-8 sm:p-12 mb-12">
            <div className="w-16 h-16 rounded-2xl bg-blue-500/10 border border-blue-500/20 text-blue-400 flex items-center justify-center mx-auto mb-4">
              <Newspaper className="w-8 h-8" />
            </div>
            <h3 className="text-xl font-bold text-slate-200 mb-2 font-heading">
              {language === 'NE' ? 'हाल कुनै नयाँ समाचार वा लेख प्रकाशित भएको छैन' : 'No News Articles Published Yet'}
            </h3>
            <p className="text-sm sm:text-base text-slate-400 max-w-lg mx-auto leading-relaxed mb-6">
              {language === 'NE'
                ? 'राजाबाबु मेहताका नयाँ प्राविधिक लेख, एआई गाइड र ताजा जानकारीहरू यहाँ चाँडै प्रकाशित गरिनेछ।'
                : 'Articles, news dispatches, and practical tech workflows by Rajababu Mehta will be published here.'}
            </p>

            <button
              type="button"
              onClick={onBackToHome}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-2xl bg-slate-850 hover:bg-slate-800 border border-slate-700 text-slate-200 text-xs font-semibold transition-all"
            >
              <ArrowLeft className="w-4 h-4 text-blue-400" />
              <span>{language === 'NE' ? 'मुख्य पोर्टफोलियोमा फर्कनुहोस्' : 'Explore Portfolio'}</span>
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 sm:gap-8 mb-16">
            {filteredMoments.map((moment, idx) => {
              const isLiked = (userLikedMoments || []).includes(moment.id);
              const momentComments = (commentsMap || {})[moment.id] || [];
              const hasImage = Boolean(moment.imgUrl && moment.imgUrl.trim());

              return (
                <motion.article
                  key={moment.id}
                  id={`moment-${moment.id}`}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.4, delay: idx * 0.05 }}
                  className="group relative rounded-3xl bg-slate-900/80 border border-slate-800/90 p-6 sm:p-7 flex flex-col justify-between hover:border-blue-500/40 hover:bg-slate-900 transition-all duration-300 shadow-xl hover:shadow-2xl hover:shadow-blue-950/20"
                >
                  <div>
                    {/* Top Dateline & Category Badge */}
                    <div className="flex items-center justify-between gap-3 mb-4">
                      <span
                        className={`px-3 py-1 rounded-xl text-xs font-bold border ${getCategoryBadgeColor(
                          moment.category
                        )}`}
                      >
                        {getCategoryBadgeLabel(moment.category)}
                      </span>

                      <div className="flex items-center gap-2">
                        <span className="flex items-center gap-1.5 text-xs text-slate-400">
                          <Calendar className="w-3.5 h-3.5 text-slate-500" />
                          <span>{moment.date}</span>
                        </span>

                        {/* Admin Edit/Delete Controls */}
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
                                  if (
                                    window.confirm(
                                      language === 'NE'
                                        ? 'के तपाईं यो समाचार हटाउन निश्चित हुनुहुन्छ?'
                                        : 'Are you sure you want to delete this article?'
                                    )
                                  ) {
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

                    {/* Optional Image Banner if provided */}
                    {hasImage && (
                      <div
                        onClick={() => setActiveLightboxMoment(moment)}
                        className="w-full h-48 rounded-2xl overflow-hidden mb-4 bg-slate-950 border border-slate-800 cursor-pointer"
                      >
                        <img
                          src={moment.imgUrl}
                          alt={moment.titleEn}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                        />
                      </div>
                    )}

                    {/* Headline */}
                    <h3
                      onClick={() => setActiveLightboxMoment(moment)}
                      className="font-heading font-bold text-lg sm:text-xl text-slate-100 group-hover:text-blue-300 transition-colors mb-3 leading-snug cursor-pointer"
                    >
                      {language === 'NE' ? moment.titleNe || moment.titleEn : moment.titleEn}
                    </h3>

                    {/* Article Excerpt */}
                    <p className="text-sm text-slate-300/90 leading-relaxed mb-5 line-clamp-4">
                      {language === 'NE' ? moment.descNe || moment.descEn : moment.descEn}
                    </p>

                    {/* Byline / Author Credit */}
                    <div className="flex items-center justify-between py-3 border-t border-slate-800/70 text-xs text-slate-400">
                      <div className="flex items-center gap-2">
                        <div className="w-6 h-6 rounded-full overflow-hidden bg-slate-800 ring-1 ring-blue-500/30 shrink-0">
                          <img src="/brand-avatar.png" alt="Rajababu Mehta" className="w-full h-full object-cover" />
                        </div>
                        <span className="font-semibold text-slate-200">Rajababu Mehta</span>
                      </div>

                      <div className="flex items-center gap-1 text-[11px] text-slate-400">
                        <Clock className="w-3 h-3 text-slate-500" />
                        <span>{language === 'NE' ? '२ मिनेट' : '2 min read'}</span>
                      </div>
                    </div>
                  </div>

                  {/* Card Action Footer */}
                  <div className="pt-4 border-t border-slate-800/80 flex items-center justify-between mt-2">
                    {/* Like Counter */}
                    <button
                      type="button"
                      onClick={() => onLikeMoment(moment.id)}
                      className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all active:scale-95 cursor-pointer ${
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
                        type="button"
                        onClick={() => setActiveLightboxMoment(moment)}
                        className="flex items-center gap-1 px-2.5 py-1.5 rounded-xl bg-slate-950 text-slate-400 hover:text-slate-200 border border-slate-800 text-xs font-medium transition-colors cursor-pointer"
                        title="View comments"
                      >
                        <MessageSquare className="w-3.5 h-3.5 text-blue-400" />
                        <span>{momentComments.length}</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => handleCopyShareLink(moment)}
                        className="p-1.5 rounded-xl bg-slate-950 text-slate-400 hover:text-slate-200 border border-slate-800 transition-colors cursor-pointer"
                        title="Copy article link"
                      >
                        <Share2 className="w-3.5 h-3.5" />
                      </button>

                      <button
                        type="button"
                        onClick={() => setActiveLightboxMoment(moment)}
                        className="flex items-center gap-1 px-3 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold shadow-md shadow-blue-600/30 transition-all hover:scale-[1.02] active:scale-95 cursor-pointer ml-1"
                      >
                        <span>{language === 'NE' ? 'पूरा पढ्नुहोस्' : 'Read'}</span>
                        <BookOpen className="w-3 h-3" />
                      </button>
                    </div>
                  </div>
                </motion.article>
              );
            })}
          </div>
        )}

        {/* Bottom Return to Home Navigation Banner */}
        <div className="text-center pt-8 border-t border-slate-800/80">
          <button
            type="button"
            onClick={onBackToHome}
            className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-slate-900 hover:bg-slate-850 border border-slate-700 text-slate-200 hover:text-white text-sm font-semibold transition-all shadow-md group cursor-pointer"
          >
            <ArrowLeft className="w-4 h-4 text-blue-400 group-hover:-translate-x-1 transition-transform" />
            <span>
              {language === 'NE'
                ? 'राजाबाबु मेहताको मुख्य पोर्टफोलियोमा फर्कनुहोस्'
                : 'Return to Rajababu Mehta Portfolio'}
            </span>
          </button>
        </div>

      </div>

      {/* Article Detail / Full Reading Mode Modal */}
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
                    <span
                      className={`px-3 py-1 rounded-xl text-xs font-bold border ${getCategoryBadgeColor(
                        activeLightboxMoment.category
                      )}`}
                    >
                      {getCategoryBadgeLabel(activeLightboxMoment.category)}
                    </span>
                    <span className="flex items-center gap-1.5 text-xs text-slate-400">
                      <Calendar className="w-3.5 h-3.5 text-slate-500" />
                      {activeLightboxMoment.date}
                    </span>
                  </div>

                  <div className="flex items-center gap-2">
                    {isAdmin && (
                      <>
                        {onEditMoment && (
                          <button
                            type="button"
                            onClick={() => {
                              const m = activeLightboxMoment;
                              setActiveLightboxMoment(null);
                              onEditMoment(m);
                            }}
                            className="p-2 rounded-xl bg-slate-950 hover:bg-slate-800 text-amber-400 border border-slate-800 transition-colors"
                            title="Edit"
                          >
                            <Edit3 className="w-4 h-4" />
                          </button>
                        )}
                        {onDeleteMoment && (
                          <button
                            type="button"
                            onClick={() => {
                              if (
                                window.confirm(
                                  language === 'NE'
                                    ? 'के तपाईं यो समाचार हटाउन निश्चित हुनुहुन्छ?'
                                    : 'Delete article?'
                                )
                              ) {
                                const id = activeLightboxMoment.id;
                                setActiveLightboxMoment(null);
                                onDeleteMoment(id);
                              }
                            }}
                            className="p-2 rounded-xl bg-slate-950 hover:bg-slate-800 text-rose-400 border border-slate-800 transition-colors"
                            title="Delete"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        )}
                      </>
                    )}
                    <button
                      onClick={() => setActiveLightboxMoment(null)}
                      className="p-2 rounded-xl bg-slate-950 hover:bg-slate-800 text-slate-400 hover:text-white border border-slate-800 transition-colors cursor-pointer"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                {/* Optional Banner Image inside modal */}
                {activeLightboxMoment.imgUrl && (
                  <div className="w-full h-56 sm:h-64 rounded-2xl overflow-hidden mb-6 bg-slate-950 border border-slate-800">
                    <img
                      src={activeLightboxMoment.imgUrl}
                      alt={activeLightboxMoment.titleEn}
                      className="w-full h-full object-cover"
                    />
                  </div>
                )}

                {/* Article Headline */}
                <h2 className="text-xl sm:text-2xl lg:text-3xl font-bold text-slate-100 font-heading mb-4 leading-snug">
                  {language === 'NE'
                    ? activeLightboxMoment.titleNe || activeLightboxMoment.titleEn
                    : activeLightboxMoment.titleEn}
                </h2>

                {/* Byline Dateline */}
                <div className="flex items-center gap-2.5 pb-5 border-b border-slate-800/80 mb-6">
                  <div className="w-7 h-7 rounded-full overflow-hidden bg-slate-800 ring-1 ring-blue-500/30 shrink-0">
                    <img src="/brand-avatar.png" alt="Rajababu Mehta" className="w-full h-full object-cover" />
                  </div>
                  <div className="flex items-center gap-1.5 text-xs">
                    <span className="font-semibold text-slate-200">Rajababu Mehta</span>
                    <span className="text-slate-600">•</span>
                    <span className="text-blue-400 font-medium">
                      {language === 'NE'
                        ? 'एआई वेबसाइट डेभलपर • वीरगञ्ज, नेपाल'
                        : 'AI Website Developer • Birgunj, Nepal'}
                    </span>
                  </div>
                </div>

                {/* Full Article Content */}
                <div className="text-slate-200 text-sm sm:text-base leading-relaxed mb-8 whitespace-pre-line space-y-4">
                  {language === 'NE'
                    ? activeLightboxMoment.descNe || activeLightboxMoment.descEn
                    : activeLightboxMoment.descEn}
                </div>

                {/* Interactions Row: Like + WhatsApp + Copy */}
                <div className="flex flex-wrap items-center gap-3 pb-6 border-b border-slate-800 mb-6">
                  <button
                    type="button"
                    onClick={() => onLikeMoment(activeLightboxMoment.id)}
                    className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-2xl text-xs font-bold transition-all active:scale-95 cursor-pointer ${
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
                    <span>
                      {formatLikes(activeLightboxMoment.likes || 0)}{' '}
                      {language === 'NE' ? 'प्रतिक्रियाहरू' : 'Likes'}
                    </span>
                  </button>

                  <button
                    type="button"
                    onClick={() => handleShareToWhatsApp(activeLightboxMoment)}
                    className="flex items-center gap-1.5 px-4 py-3 rounded-2xl bg-emerald-600/20 hover:bg-emerald-600/30 text-emerald-300 border border-emerald-500/30 text-xs font-semibold transition-colors cursor-pointer"
                    title="Share to WhatsApp"
                  >
                    <span>WhatsApp</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => handleCopyShareLink(activeLightboxMoment)}
                    className="p-3 rounded-2xl bg-slate-950 hover:bg-slate-800 text-slate-300 border border-slate-800 transition-colors cursor-pointer"
                    title="Copy link"
                  >
                    <Share2 className="w-4 h-4" />
                  </button>
                </div>

                {/* Reader Comments */}
                <div className="mb-4">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-3 flex items-center gap-1.5">
                    <MessageSquare className="w-3.5 h-3.5 text-blue-400" />
                    <span>
                      {language === 'NE' ? 'पाठकहरूको प्रतिक्रिया' : 'Reader Comments'} (
                      {(commentsMap[activeLightboxMoment.id] || []).length})
                    </span>
                  </h4>

                  <div className="space-y-3 max-h-48 overflow-y-auto pr-1">
                    {(commentsMap[activeLightboxMoment.id] || []).length === 0 ? (
                      <div className="text-xs text-slate-500 py-3 text-center italic">
                        {language === 'NE' ? 'पहिलो प्रतिक्रिया दिनुहोस्!' : 'Be the first to share your thoughts!'}
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
                    placeholder={language === 'NE' ? 'प्रतिक्रिया लेख्नुहोस्...' : 'Write your comment or insight...'}
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
