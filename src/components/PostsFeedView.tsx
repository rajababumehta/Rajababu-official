import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  ArrowLeft,
  Share2,
  Image as ImageIcon,
  Send,
  Trash2,
  Globe,
  Sparkles,
  CheckCircle2,
  LogIn,
  LogOut,
  X,
  ExternalLink,
  Shield,
  Clock,
  Maximize2,
  Loader2,
  Copy,
  Check,
  BookOpen,
  ArrowRight,
} from 'lucide-react';
import { FeedPost, Language, AdminUser } from '../types';
import {
  subscribeToFeedPosts,
  createFeedPost,
  deleteFeedPost,
  signInWithGoogle,
  logoutAdmin,
  subscribeToAuth,
  isUserAdmin,
  compressImageFile,
  testFirestoreConnection,
} from '../services/firebase';
import { updatePostSeo, resetPostSeo } from '../utils/seo';

interface PostsFeedViewProps {
  language: Language;
  onBackToHome: () => void;
  onShowToast: (message: string, type: 'success' | 'info' | 'warning' | 'error') => void;
  initialPostId?: string | null;
}

const CATEGORIES = [
  { id: 'Announcement', en: '📢 Announcement', ne: '📢 मुख्य घोषणा' },
  { id: 'Article', en: '💡 Thoughts & Article', ne: '💡 विचार र लेख' },
  { id: 'Clipzone', en: '🚀 AI Clipzone News', ne: '🚀 एआई क्लिपजोन समाचार' },
  { id: 'Tech', en: '💻 Tech & Innovation', ne: '💻 प्रविधि तथा विकास' },
  { id: 'Personal', en: '📸 Behind The Scenes', ne: '📸 व्यक्तिगत पलहरू' },
];

export const PostsFeedView: React.FC<PostsFeedViewProps> = ({
  language,
  onBackToHome,
  onShowToast,
  initialPostId,
}) => {
  const [posts, setPosts] = useState<FeedPost[]>([]);
  const [loadingPosts, setLoadingPosts] = useState(true);
  const [currentUser, setCurrentUser] = useState<AdminUser | null>(null);

  // Active Selected Post for Dedicated News View
  const [activePostId, setActivePostId] = useState<string | null>(initialPostId || null);

  // Composer State (for Admin)
  const [postTitle, setPostTitle] = useState('');
  const [postContent, setPostContent] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('Article');
  const [imageFiles, setImageFiles] = useState<string[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showAdminLoginModal, setShowAdminLoginModal] = useState(false);
  const [adminPinInput, setAdminPinInput] = useState('');

  // Active Lightbox Image
  const [lightboxImage, setLightboxImage] = useState<string | null>(null);

  // Track copied link state for visual feedback
  const [copiedPostId, setCopiedPostId] = useState<string | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);

  // Read URL query param ?post=ID or hash #post-ID on load
  useEffect(() => {
    const handleUrlPostParam = () => {
      const urlParams = new URLSearchParams(window.location.search);
      const postParam = urlParams.get('post');
      const hash = window.location.hash;
      let targetId: string | null = null;

      if (postParam) {
        targetId = postParam;
      } else if (hash.startsWith('#post-')) {
        targetId = hash.replace('#post-', '');
      } else if (hash.startsWith('#post/')) {
        targetId = hash.replace('#post/', '');
      }

      if (targetId) {
        setActivePostId(targetId);
      }
    };

    handleUrlPostParam();
    window.addEventListener('popstate', handleUrlPostParam);
    window.addEventListener('hashchange', handleUrlPostParam);

    return () => {
      window.removeEventListener('popstate', handleUrlPostParam);
      window.removeEventListener('hashchange', handleUrlPostParam);
    };
  }, []);

  // Subscribe to Auth state
  useEffect(() => {
    const unsub = subscribeToAuth((user) => {
      setCurrentUser(user);
    });
    testFirestoreConnection();
    return () => unsub();
  }, []);

  // Subscribe to real-time posts
  useEffect(() => {
    setLoadingPosts(true);
    const unsub = subscribeToFeedPosts(
      (loadedPosts) => {
        setPosts(loadedPosts);
        setLoadingPosts(false);
      },
      (err) => {
        console.warn('Posts listener error:', err);
        setLoadingPosts(false);
      }
    );
    return () => unsub();
  }, []);

  // Active Post Object
  const currentActivePost = activePostId ? posts.find((p) => p.id === activePostId) || null : null;

  // Dynamically update SEO structured data and title for Google search
  useEffect(() => {
    if (currentActivePost) {
      updatePostSeo(currentActivePost);
    } else if (posts.length > 0 && !activePostId) {
      // In the feed, update to latest post's news summary or general news
      updatePostSeo(posts[0]);
    } else {
      resetPostSeo();
    }

    return () => {
      resetPostSeo();
    };
  }, [currentActivePost, posts, activePostId]);

  // Google Login for Admin
  const handleGoogleSignIn = async () => {
    try {
      const user = await signInWithGoogle();
      if (isUserAdmin(user)) {
        onShowToast(
          language === 'NE'
            ? 'स्वागत छ राजाबाबु! एडमिन लगइन सफल भयो।'
            : 'Welcome Rajababu! Admin authenticated successfully.',
          'success'
        );
      } else {
        onShowToast(
          language === 'NE'
            ? `लगइन सफल भयो (${user.displayName || user.email})`
            : `Signed in as ${user.displayName || user.email}`,
          'info'
        );
      }
      setShowAdminLoginModal(false);
    } catch (e: any) {
      console.warn('Google sign in error:', e);
      onShowToast(
        e?.message?.includes('popup-closed')
          ? (language === 'NE' ? 'साइन-इन पपअप बन्द गरियो।' : 'Sign-in popup closed.')
          : (language === 'NE' ? 'लगइन हुन सकेन, पुन: प्रयास गर्नुहोस्।' : 'Sign in failed, please try again.'),
        'warning'
      );
    }
  };

  // Quick PIN Fallback
  const handleAdminPinSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (adminPinInput.trim() === 'rajababu2026' || adminPinInput.trim() === '426') {
      const admin: AdminUser = {
        uid: 'admin-rajababu-mehta',
        email: 'rajababum426@gmail.com',
        displayName: 'Rajababu Mehta',
        photoURL: '/assets/aistudio/hero_photo.jpg',
        isLocalFallback: true,
      };
      localStorage.setItem('ai_clipzone_local_admin', JSON.stringify(admin));
      window.dispatchEvent(new CustomEvent('admin-auth-changed', { detail: admin }));
      setCurrentUser(admin);
      setShowAdminLoginModal(false);
      setAdminPinInput('');
      onShowToast(
        language === 'NE'
          ? 'राजाबाबु मेहता एडमिन मोड अनलक भयो!'
          : 'Rajababu Mehta Admin mode unlocked!',
        'success'
      );
    } else {
      onShowToast(language === 'NE' ? 'गलत पासकोड!' : 'Invalid admin passcode!', 'error');
    }
  };

  // Image Upload Selection
  const handleImageSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    if (imageFiles.length + files.length > 6) {
      onShowToast(
        language === 'NE' ? 'अधिकतम ६ वटा तस्विर मात्र राख्न सकिन्छ।' : 'Maximum 6 images per post.',
        'warning'
      );
      return;
    }

    onShowToast(
      language === 'NE' ? 'तस्विरहरू प्रोसेसिङ हुँदैछ...' : 'Optimizing photos for database...',
      'info'
    );

    try {
      const newImages: string[] = [];
      for (let i = 0; i < files.length; i++) {
        const compressed = await compressImageFile(files[i], 1200, 0.75);
        newImages.push(compressed);
      }
      setImageFiles((prev) => [...prev, ...newImages]);
    } catch (err) {
      console.error('Image compression error:', err);
      onShowToast(
        language === 'NE' ? 'तस्विर प्रोसेस गर्दा त्रुटि भयो।' : 'Failed to process image.',
        'error'
      );
    } finally {
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const handleRemoveImage = (index: number) => {
    setImageFiles((prev) => prev.filter((_, i) => i !== index));
  };

  // Create Post
  const handleCreatePost = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!postContent.trim() && imageFiles.length === 0) {
      onShowToast(
        language === 'NE' ? 'कृपया केही लेख वा तस्विर थप्नुहोस्।' : 'Please enter post content or attach a photo.',
        'warning'
      );
      return;
    }

    setIsSubmitting(true);
    try {
      // Combine title and content if title provided
      const fullContent = postTitle.trim()
        ? `${postTitle.trim()}\n\n${postContent.trim()}`
        : postContent.trim();

      const newId = await createFeedPost({
        authorId: currentUser?.uid || 'admin-rajababu',
        authorName: 'Rajababu Mehta',
        authorEmail: currentUser?.email || 'rajababum426@gmail.com',
        authorPhoto: '/assets/aistudio/hero_photo.jpg',
        content: fullContent,
        images: imageFiles,
        category: selectedCategory,
      });

      setPostTitle('');
      setPostContent('');
      setImageFiles([]);
      onShowToast(
        language === 'NE'
          ? 'समाचार/लेख प्रकाशित भयो र गुगल सर्चका लागि उपलब्ध छ!'
          : 'Post published and direct article link created!',
        'success'
      );

      // Open new post directly
      if (newId) {
        window.history.pushState(null, '', `?post=${newId}#post-${newId}`);
        setActivePostId(newId);
      }
    } catch (err: any) {
      console.error('Create post error:', err);
      onShowToast(
        language === 'NE' ? 'पोस्ट गर्न सकिएन।' : 'Failed to publish post. Please check connection.',
        'error'
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  // Delete Post
  const handleDeletePost = async (postId: string) => {
    if (
      !window.confirm(
        language === 'NE'
          ? 'के तपाईं यो पोस्ट मेटाउन निश्चित हुनुहुन्छ?'
          : 'Are you sure you want to delete this post?'
      )
    ) {
      return;
    }
    try {
      await deleteFeedPost(postId);
      if (activePostId === postId) {
        setActivePostId(null);
        window.history.pushState(null, '', window.location.pathname);
      }
      onShowToast(language === 'NE' ? 'पोस्ट हटाइयो।' : 'Post deleted successfully.', 'info');
    } catch (err) {
      onShowToast(language === 'NE' ? 'पोस्ट मेटाउन असफल भयो।' : 'Failed to delete post.', 'error');
    }
  };

  // Direct Post URL Generator
  const getDirectPostUrl = (postId: string) => {
    return `${window.location.origin}/?post=${postId}#post-${postId}`;
  };

  // Share Actions specifically for this post
  const handleCopyPostLink = async (post: FeedPost) => {
    const directUrl = getDirectPostUrl(post.id);
    try {
      await navigator.clipboard.writeText(directUrl);
      setCopiedPostId(post.id);
      setTimeout(() => setCopiedPostId(null), 2500);
      onShowToast(
        language === 'NE'
          ? 'यस पोस्टको प्रत्यक्ष लिङ्क कपी भयो!'
          : 'Direct Article Link copied to clipboard!',
        'success'
      );
    } catch {
      onShowToast(language === 'NE' ? 'लिङ्क कपी हुन सकेन।' : 'Could not copy link.', 'warning');
    }
  };

  const handleNativeShare = async (post: FeedPost) => {
    const directUrl = getDirectPostUrl(post.id);
    const firstLine = post.content.split('\n')[0].replace(/^#+\s*/, '').trim();
    const headline = firstLine || 'Rajababu Mehta Post';
    const summary = post.content.slice(0, 140).replace(/\n/g, ' ');

    if (navigator.share) {
      try {
        await navigator.share({
          title: headline,
          text: `${headline}\n\n${summary}...`,
          url: directUrl,
        });
        return;
      } catch (err) {
        // user cancelled or fallback
      }
    }

    handleCopyPostLink(post);
  };

  const handleWhatsAppShare = (post: FeedPost) => {
    const directUrl = getDirectPostUrl(post.id);
    const firstLine = post.content.split('\n')[0].replace(/^#+\s*/, '').trim();
    const text = encodeURIComponent(
      `*${firstLine}*\n\nRead the full update by Rajababu Mehta (Founder & CEO, AI Clipzone):\n${directUrl}`
    );
    window.open(`https://api.whatsapp.com/send?text=${text}`, '_blank');
  };

  const handleFacebookShare = (post: FeedPost) => {
    const directUrl = getDirectPostUrl(post.id);
    window.open(
      `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(directUrl)}`,
      '_blank'
    );
  };

  const handleTwitterShare = (post: FeedPost) => {
    const directUrl = getDirectPostUrl(post.id);
    const firstLine = post.content.split('\n')[0].replace(/^#+\s*/, '').trim();
    const text = encodeURIComponent(`${firstLine}\n\nBy @mrrajababumehta`);
    window.open(
      `https://twitter.com/intent/tweet?text=${text}&url=${encodeURIComponent(directUrl)}`,
      '_blank'
    );
  };

  const handleOpenSinglePost = (postId: string) => {
    setActivePostId(postId);
    window.history.pushState(null, '', `?post=${postId}#post-${postId}`);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleBackToFeed = () => {
    setActivePostId(null);
    window.history.pushState(null, '', window.location.pathname);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const isAdmin = isUserAdmin(currentUser);

  return (
    <div className="min-h-screen bg-[#0d0b0a] text-[#f6f3f2] font-sans selection:bg-[#e4342f] selection:text-white pb-24">
      {/* Top Sticky Header */}
      <header className="sticky top-0 z-40 bg-[#141211]/90 backdrop-blur-md border-b border-[rgba(255,240,238,0.08)]">
        <div className="max-w-3xl mx-auto px-4 h-16 flex items-center justify-between">
          {currentActivePost ? (
            <button
              onClick={handleBackToFeed}
              className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-[rgba(255,255,255,0.05)] hover:bg-[#e4342f] hover:text-white transition-all text-sm font-semibold cursor-pointer border border-[rgba(255,240,238,0.1)]"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>{language === 'NE' ? 'सबै पोस्टहरू' : 'All Articles'}</span>
            </button>
          ) : (
            <button
              onClick={onBackToHome}
              className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-[rgba(255,255,255,0.05)] hover:bg-[#e4342f] hover:text-white transition-all text-sm font-semibold cursor-pointer border border-[rgba(255,240,238,0.1)]"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>{language === 'NE' ? 'गृहपृष्ठमा फर्कनुहोस्' : 'Back to Portfolio'}</span>
            </button>
          )}

          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-[#e4342f] animate-pulse"></span>
            <span className="text-xs uppercase tracking-wider font-bold text-[#ff8175]">
              {language === 'NE' ? 'समाचार तथा विचार' : 'News & Articles'}
            </span>
          </div>

          <div>
            {isAdmin ? (
              <div className="flex items-center gap-2">
                <span className="hidden sm:inline-flex items-center gap-1 text-xs px-2.5 py-1 rounded-full bg-emerald-950/60 border border-emerald-500/30 text-emerald-400 font-medium">
                  <Shield className="w-3 h-3 text-emerald-400" />
                  Admin
                </span>
                <button
                  onClick={() => {
                    logoutAdmin();
                    setCurrentUser(null);
                    onShowToast(language === 'NE' ? 'लगआउट भयो।' : 'Logged out.', 'info');
                  }}
                  title="Sign out"
                  className="p-1.5 rounded-lg bg-[rgba(255,255,255,0.05)] hover:bg-rose-900/40 text-stone-300 hover:text-white transition-colors cursor-pointer"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <button
                onClick={() => setShowAdminLoginModal(true)}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-[rgba(228,52,47,0.12)] border border-[rgba(228,52,47,0.3)] hover:bg-[#e4342f] hover:text-white text-xs font-semibold text-[#ff8175] transition-all cursor-pointer"
              >
                <LogIn className="w-3.5 h-3.5" />
                <span>{language === 'NE' ? 'एडमिन' : 'Admin'}</span>
              </button>
            )}
          </div>
        </div>
      </header>

      {/* Main Container */}
      <main className="max-w-3xl mx-auto px-4 pt-6 space-y-6">

        {/* ------------------------------------------------------------- */}
        {/* SINGLE ARTICLE VIEW (News Portal Reader Mode with Direct Link) */}
        {/* ------------------------------------------------------------- */}
        {currentActivePost ? (
          <article className="bg-[#171514] border border-[rgba(255,240,238,0.12)] rounded-3xl p-6 sm:p-8 shadow-2xl space-y-6">
            {/* Breadcrumb & Category */}
            <div className="flex items-center justify-between gap-3 text-xs flex-wrap border-b border-[rgba(255,240,238,0.08)] pb-4">
              <div className="flex items-center gap-2 text-[#f6f3f2]/60">
                <span className="text-[#ff8175] font-semibold">
                  {currentActivePost.category || 'News'}
                </span>
                <span>/</span>
                <span>Direct Link</span>
              </div>

              {/* Direct Post URL Indicator */}
              <div className="flex items-center gap-2">
                <span className="text-[11px] font-mono text-emerald-400 bg-emerald-950/40 border border-emerald-500/20 px-2.5 py-0.5 rounded-full flex items-center gap-1">
                  <Globe className="w-3 h-3" />
                  Indexed on Google
                </span>
                {isAdmin && (
                  <button
                    onClick={() => handleDeletePost(currentActivePost.id)}
                    title="Delete article"
                    className="p-1 rounded text-stone-500 hover:text-rose-400 hover:bg-rose-950/40 cursor-pointer"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                )}
              </div>
            </div>

            {/* Author Header Bar */}
            <div className="flex items-center gap-3.5">
              <img
                src={currentActivePost.authorPhoto || '/assets/aistudio/hero_photo.jpg'}
                alt={currentActivePost.authorName}
                className="w-12 h-12 rounded-full object-cover border-2 border-[#e4342f]"
              />
              <div>
                <div className="flex items-center gap-1.5">
                  <span className="font-bold text-base text-[#f6f3f2]">
                    {currentActivePost.authorName}
                  </span>
                  <CheckCircle2 className="w-4 h-4 text-[#e4342f] fill-[#e4342f] text-black" />
                </div>
                <div className="text-xs text-[#f6f3f2]/60 flex items-center gap-2 mt-0.5">
                  <span>Founder & CEO, AI Clipzone</span>
                  <span>·</span>
                  <span className="flex items-center gap-1">
                    <Clock className="w-3.5 h-3.5" />
                    {new Date(currentActivePost.createdAt).toLocaleDateString('en-US', {
                      month: 'long',
                      day: 'numeric',
                      year: 'numeric',
                    })}
                  </span>
                </div>
              </div>
            </div>

            {/* Post Images Gallery (News Style) */}
            {currentActivePost.images && currentActivePost.images.length > 0 && (
              <div className="space-y-3 pt-2">
                <div
                  onClick={() => setLightboxImage(currentActivePost.images[0])}
                  className="rounded-2xl overflow-hidden cursor-pointer group relative bg-black border border-[rgba(255,240,238,0.1)]"
                >
                  <img
                    src={currentActivePost.images[0]}
                    alt="Article Featured Attachment"
                    className="w-full max-h-[500px] object-cover group-hover:scale-[1.01] transition-transform duration-300"
                  />
                  <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                    <span className="px-3.5 py-1.5 rounded-full bg-black/75 text-white text-xs font-semibold flex items-center gap-1.5">
                      <Maximize2 className="w-3.5 h-3.5" /> Full View
                    </span>
                  </div>
                </div>

                {/* Additional photos if any */}
                {currentActivePost.images.length > 1 && (
                  <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
                    {currentActivePost.images.slice(1).map((img, idx) => (
                      <div
                        key={idx}
                        onClick={() => setLightboxImage(img)}
                        className="aspect-square rounded-xl overflow-hidden cursor-pointer bg-black border border-[rgba(255,240,238,0.08)] group"
                      >
                        <img
                          src={img}
                          alt={`Gallery photo ${idx + 2}`}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                        />
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* Article Content / Lekh */}
            <div className="pt-2">
              <div className="text-base text-[#f6f3f2]/95 leading-relaxed font-sans whitespace-pre-line space-y-4">
                {currentActivePost.content}
              </div>
            </div>

            {/* DIRECT NEWS PORTAL SHARE BAR (ONLY SHARE, NO LIKE, NO COMMENT) */}
            <div className="pt-6 border-t border-[rgba(255,240,238,0.12)] space-y-3">
              <div className="flex items-center justify-between text-xs text-[#f6f3f2]/60">
                <span className="font-semibold uppercase tracking-wider text-[#ff8175] flex items-center gap-1.5">
                  <Share2 className="w-3.5 h-3.5" />
                  {language === 'NE' ? 'यो समाचार / लेख सेयर गर्नुहोस्:' : 'Share this news article:'}
                </span>
                <span className="text-[11px] font-mono opacity-60">
                  ID: {currentActivePost.id.slice(0, 10)}
                </span>
              </div>

              {/* Direct Social Share Buttons */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                {/* WhatsApp Direct Share */}
                <button
                  type="button"
                  onClick={() => handleWhatsAppShare(currentActivePost)}
                  className="py-2.5 px-3 rounded-xl bg-[#25D366]/15 hover:bg-[#25D366] text-[#25D366] hover:text-white border border-[#25D366]/30 text-xs font-bold transition-all flex items-center justify-center gap-2 cursor-pointer shadow-sm"
                >
                  <span className="text-base leading-none">💬</span>
                  <span>WhatsApp</span>
                </button>

                {/* Facebook Share */}
                <button
                  type="button"
                  onClick={() => handleFacebookShare(currentActivePost)}
                  className="py-2.5 px-3 rounded-xl bg-[#1877F2]/15 hover:bg-[#1877F2] text-[#1877F2] hover:text-white border border-[#1877F2]/30 text-xs font-bold transition-all flex items-center justify-center gap-2 cursor-pointer shadow-sm"
                >
                  <span className="text-base leading-none">📘</span>
                  <span>Facebook</span>
                </button>

                {/* X / Twitter Share */}
                <button
                  type="button"
                  onClick={() => handleTwitterShare(currentActivePost)}
                  className="py-2.5 px-3 rounded-xl bg-white/10 hover:bg-white text-white hover:text-black border border-white/20 text-xs font-bold transition-all flex items-center justify-center gap-2 cursor-pointer shadow-sm"
                >
                  <span className="text-sm font-black">𝕏</span>
                  <span>X / Twitter</span>
                </button>

                {/* Copy Direct Post URL */}
                <button
                  type="button"
                  onClick={() => handleCopyPostLink(currentActivePost)}
                  className="py-2.5 px-3 rounded-xl bg-[#e4342f]/15 hover:bg-[#e4342f] text-[#ff8175] hover:text-white border border-[#e4342f]/30 text-xs font-bold transition-all flex items-center justify-center gap-2 cursor-pointer shadow-sm"
                >
                  {copiedPostId === currentActivePost.id ? (
                    <>
                      <Check className="w-4 h-4 text-emerald-400" />
                      <span>{language === 'NE' ? 'कपी भयो!' : 'Copied!'}</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-4 h-4" />
                      <span>{language === 'NE' ? 'लिङ्क कपी' : 'Copy Link'}</span>
                    </>
                  )}
                </button>
              </div>

              {/* Direct URL Preview Box */}
              <div className="bg-[#100e0d] p-3 rounded-xl border border-[rgba(255,240,238,0.06)] flex items-center justify-between gap-2 text-xs font-mono text-[#f6f3f2]/60">
                <span className="truncate">{getDirectPostUrl(currentActivePost.id)}</span>
                <button
                  onClick={() => handleNativeShare(currentActivePost)}
                  className="shrink-0 px-2.5 py-1 rounded-lg bg-[rgba(255,255,255,0.06)] hover:bg-[#e4342f] hover:text-white text-[#f6f3f2] font-sans text-xs font-semibold cursor-pointer transition-colors"
                >
                  Share
                </button>
              </div>
            </div>

            {/* Back to all posts footer */}
            <div className="pt-2 text-center">
              <button
                onClick={handleBackToFeed}
                className="inline-flex items-center gap-2 text-xs font-bold text-[#ff8175] hover:text-white transition-colors cursor-pointer"
              >
                <span>← {language === 'NE' ? 'सबै समाचार र पोस्टहरू हेर्नुहोस्' : 'Browse All News & Posts'}</span>
              </button>
            </div>
          </article>
        ) : (
          /* ------------------------------------------------------------- */
          /* ALL POSTS FEED LIST VIEW (News Portal List) */
          /* ------------------------------------------------------------- */
          <>
            {/* Admin News Article Composer */}
            {isAdmin ? (
              <div className="bg-[#171514] border border-[rgba(255,240,238,0.12)] rounded-3xl p-5 sm:p-6 shadow-xl">
                <div className="flex items-center gap-3 mb-4">
                  <img
                    src="/assets/aistudio/hero_photo.jpg"
                    alt="Rajababu Mehta"
                    className="w-11 h-11 rounded-full object-cover border-2 border-[#e4342f]"
                  />
                  <div>
                    <div className="flex items-center gap-1.5">
                      <span className="font-bold text-sm text-[#f6f3f2]">Rajababu Mehta</span>
                      <CheckCircle2 className="w-4 h-4 text-[#e4342f] fill-[#e4342f] text-black" />
                    </div>
                    <div className="flex items-center gap-1 text-[11px] text-[#f6f3f2]/60">
                      <span>Publisher & Founder, AI Clipzone</span>
                      <span>·</span>
                      <span className="text-emerald-400 flex items-center gap-0.5">
                        <Globe className="w-3 h-3" /> Public & Google Searchable
                      </span>
                    </div>
                  </div>
                </div>

                <form onSubmit={handleCreatePost} className="space-y-3.5">
                  {/* Article Title Input (Optional Headline) */}
                  <input
                    type="text"
                    value={postTitle}
                    onChange={(e) => setPostTitle(e.target.value)}
                    placeholder={
                      language === 'NE'
                        ? 'शीर्षक वा मुख्य समाचार (वैकल्पिक)...'
                        : 'Article Headline / News Title (Optional)...'
                    }
                    className="w-full bg-[#12100f] border border-[rgba(255,240,238,0.1)] focus:border-[#e4342f] rounded-xl px-3.5 py-2.5 text-sm font-semibold text-[#f6f3f2] placeholder-[#f6f3f2]/40 outline-none transition-colors"
                  />

                  {/* Body Textarea */}
                  <textarea
                    value={postContent}
                    onChange={(e) => setPostContent(e.target.value)}
                    placeholder={
                      language === 'NE'
                        ? 'समाचार, लेख वा विस्तृत जानकारी लेख्नुहोस् (यो गुगल सर्चमा पनि देखिनेछ)...'
                        : 'Write the complete article, announcement, or news information (Google search indexed)...'
                    }
                    rows={4}
                    className="w-full bg-[#12100f] border border-[rgba(255,240,238,0.1)] focus:border-[#e4342f] rounded-xl p-3.5 text-sm text-[#f6f3f2] placeholder-[#f6f3f2]/40 resize-none outline-none transition-colors"
                  />

                  {/* Attached Photos Preview */}
                  {imageFiles.length > 0 && (
                    <div className="grid grid-cols-3 gap-2 pt-1">
                      {imageFiles.map((img, idx) => (
                        <div
                          key={idx}
                          className="relative group rounded-lg overflow-hidden border border-[rgba(255,240,238,0.1)] aspect-video bg-black"
                        >
                          <img src={img} alt="Preview" className="w-full h-full object-cover" />
                          <button
                            type="button"
                            onClick={() => handleRemoveImage(idx)}
                            className="absolute top-1 right-1 p-1 rounded-full bg-black/75 hover:bg-[#e4342f] text-white transition-colors cursor-pointer"
                          >
                            <X className="w-3 h-3" />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Category Pills */}
                  <div className="flex flex-wrap items-center gap-1.5 pt-1">
                    {CATEGORIES.map((cat) => (
                      <button
                        key={cat.id}
                        type="button"
                        onClick={() => setSelectedCategory(cat.id)}
                        className={`px-3 py-1 rounded-full text-xs font-medium transition-colors cursor-pointer border ${
                          selectedCategory === cat.id
                            ? 'bg-[#e4342f] text-white border-[#e4342f]'
                            : 'bg-[rgba(255,255,255,0.04)] text-[#f6f3f2]/70 border-[rgba(255,240,238,0.08)] hover:bg-[rgba(255,255,255,0.08)]'
                        }`}
                      >
                        {language === 'NE' ? cat.ne : cat.en}
                      </button>
                    ))}
                  </div>

                  {/* Toolbar */}
                  <div className="pt-2 border-t border-[rgba(255,240,238,0.08)] flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <input
                        type="file"
                        ref={fileInputRef}
                        onChange={handleImageSelect}
                        accept="image/*"
                        multiple
                        className="hidden"
                      />
                      <button
                        type="button"
                        onClick={() => fileInputRef.current?.click()}
                        className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[rgba(255,255,255,0.04)] hover:bg-[rgba(255,255,255,0.08)] text-xs font-semibold text-[#f6f3f2] border border-[rgba(255,240,238,0.08)] transition-colors cursor-pointer"
                      >
                        <ImageIcon className="w-4 h-4 text-emerald-400" />
                        <span>{language === 'NE' ? 'तस्विर जोड्नुहोस्' : 'Attach Photos'}</span>
                      </button>
                    </div>

                    <button
                      type="submit"
                      disabled={isSubmitting || (!postContent.trim() && imageFiles.length === 0)}
                      className="px-5 py-2.5 rounded-xl bg-[#e4342f] hover:bg-[#c92823] disabled:opacity-40 disabled:cursor-not-allowed text-white text-xs font-bold tracking-wide transition-all flex items-center gap-1.5 shadow-lg shadow-[#e4342f]/20 cursor-pointer"
                    >
                      {isSubmitting ? (
                        <>
                          <Loader2 className="w-3.5 h-3.5 animate-spin" />
                          <span>{language === 'NE' ? 'प्रकाशित हुँदैछ...' : 'Publishing...'}</span>
                        </>
                      ) : (
                        <>
                          <Send className="w-3.5 h-3.5" />
                          <span>{language === 'NE' ? 'समाचार प्रकाशित गर्नुहोस्' : 'Publish Article'}</span>
                        </>
                      )}
                    </button>
                  </div>
                </form>
              </div>
            ) : null}

            {/* Posts Feed Header */}
            <div className="flex items-center justify-between pb-1">
              <div>
                <h2 className="text-xl sm:text-2xl font-black text-[#f6f3f2] tracking-tight">
                  {language === 'NE' ? 'समाचार तथा आधिकारिक लेखहरू' : 'News, Articles & Official Updates'}
                </h2>
                <p className="text-xs text-[#f6f3f2]/60 mt-0.5">
                  {language === 'NE'
                    ? 'राजाबाबु मेहताद्वारा प्रकाशित सामग्रीहरू (प्रत्यक्ष सेयर गर्न मिल्ने)'
                    : 'Directly shareable news articles & insights by Rajababu Mehta'}
                </p>
              </div>
            </div>

            {/* Posts List */}
            {loadingPosts ? (
              <div className="py-20 text-center space-y-3">
                <Loader2 className="w-8 h-8 text-[#e4342f] animate-spin mx-auto" />
                <p className="text-xs text-[#f6f3f2]/60">
                  {language === 'NE' ? 'समाचार तथा लेखहरू लोड हुँदैछ...' : 'Loading articles from database...'}
                </p>
              </div>
            ) : posts.length === 0 ? (
              <div className="bg-[#171514] border border-[rgba(255,240,238,0.08)] rounded-3xl p-10 text-center space-y-4">
                <div className="w-14 h-14 rounded-full bg-[rgba(228,52,47,0.1)] border border-[rgba(228,52,47,0.2)] flex items-center justify-center mx-auto text-[#ff8175]">
                  <Sparkles className="w-7 h-7" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-[#f6f3f2]">
                    {language === 'NE' ? 'कुनै समाचार उपलब्ध छैन' : 'No Articles Published Yet'}
                  </h3>
                  <p className="text-xs text-[#f6f3f2]/60 max-w-sm mx-auto mt-1">
                    {language === 'NE'
                      ? 'राजाबाबु मेहताले यहाँ पहिलो समाचार वा लेख प्रकाशित गरेपछि प्रत्यक्ष रूपमा सेयर गर्न सकिनेछ।'
                      : 'Articles published here will generate direct shareable links and Google search metadata.'}
                  </p>
                </div>
              </div>
            ) : (
              posts.map((post) => (
                <NewsPostCard
                  key={post.id}
                  post={post}
                  language={language}
                  isAdmin={isAdmin}
                  onOpenPost={() => handleOpenSinglePost(post.id)}
                  onDelete={() => handleDeletePost(post.id)}
                  onCopyLink={() => handleCopyPostLink(post)}
                  onWhatsAppShare={() => handleWhatsAppShare(post)}
                  onFacebookShare={() => handleFacebookShare(post)}
                  onTwitterShare={() => handleTwitterShare(post)}
                  onOpenImage={(imgUrl) => setLightboxImage(imgUrl)}
                  copied={copiedPostId === post.id}
                />
              ))
            )}
          </>
        )}
      </main>

      {/* Lightbox Modal */}
      <AnimatePresence>
        {lightboxImage && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setLightboxImage(null)}
            className="fixed inset-0 z-50 bg-black/95 flex items-center justify-center p-4 backdrop-blur-md"
          >
            <button
              onClick={() => setLightboxImage(null)}
              className="absolute top-4 right-4 p-2 rounded-full bg-white/10 hover:bg-[#e4342f] text-white transition-colors cursor-pointer"
            >
              <X className="w-6 h-6" />
            </button>
            <img
              src={lightboxImage}
              alt="Enlarged photo"
              className="max-h-[90vh] max-w-[95vw] object-contain rounded-xl shadow-2xl"
              onClick={(e) => e.stopPropagation()}
            />
          </motion.div>
        )}
      </AnimatePresence>

      {/* Admin Login Modal */}
      <AnimatePresence>
        {showAdminLoginModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4 backdrop-blur-sm"
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="w-full max-w-sm bg-[#171514] border border-[rgba(255,240,238,0.15)] rounded-2xl p-6 shadow-2xl relative space-y-5"
            >
              <button
                onClick={() => setShowAdminLoginModal(false)}
                className="absolute top-4 right-4 p-1.5 rounded-full hover:bg-[rgba(255,255,255,0.08)] text-stone-400 hover:text-white cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>

              <div className="text-center space-y-1">
                <div className="w-12 h-12 rounded-full bg-[#e4342f]/10 border border-[#e4342f]/30 flex items-center justify-center mx-auto text-[#ff8175]">
                  <Shield className="w-6 h-6" />
                </div>
                <h3 className="text-base font-bold text-[#f6f3f2]">
                  {language === 'NE' ? 'एडमिन प्रमाणिकरण' : 'Publisher Verification'}
                </h3>
                <p className="text-xs text-[#f6f3f2]/60">
                  {language === 'NE' ? 'समाचार प्रकाशित गर्न लगइन गर्नुहोस्' : 'Sign in to publish or delete news articles'}
                </p>
              </div>

              <button
                onClick={handleGoogleSignIn}
                className="w-full py-3 px-4 rounded-xl bg-white hover:bg-stone-100 text-stone-900 font-bold text-xs flex items-center justify-center gap-2.5 shadow-md transition-all cursor-pointer"
              >
                <svg className="w-4 h-4" viewBox="0 0 24 24">
                  <path
                    fill="#4285F4"
                    d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                  />
                  <path
                    fill="#34A853"
                    d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                  />
                  <path
                    fill="#FBBC05"
                    d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                  />
                  <path
                    fill="#EA4335"
                    d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                  />
                </svg>
                <span>Google Sign-In (rajababum426@gmail.com)</span>
              </button>

              <div className="relative flex items-center justify-center">
                <div className="border-t border-[rgba(255,240,238,0.1)] w-full"></div>
                <span className="bg-[#171514] px-2 text-[10px] uppercase tracking-wider text-[#f6f3f2]/40 absolute">
                  or pin
                </span>
              </div>

              <form onSubmit={handleAdminPinSubmit} className="space-y-3">
                <input
                  type="password"
                  value={adminPinInput}
                  onChange={(e) => setAdminPinInput(e.target.value)}
                  placeholder="Enter pin (426)"
                  className="w-full bg-[#12100f] border border-[rgba(255,240,238,0.12)] focus:border-[#e4342f] rounded-xl px-3 py-2.5 text-xs text-center text-[#f6f3f2] tracking-widest outline-none"
                />
                <button
                  type="submit"
                  className="w-full py-2.5 rounded-xl bg-[rgba(255,255,255,0.08)] hover:bg-[#e4342f] text-white text-xs font-bold transition-all cursor-pointer"
                >
                  Unlock
                </button>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

// ==========================================
// NEWS ARTICLE CARD (Feed list item - NO Like, NO Comment, ONLY Direct Share)
// ==========================================

interface NewsPostCardProps {
  post: FeedPost;
  language: Language;
  isAdmin: boolean;
  onOpenPost: () => void;
  onDelete: () => void;
  onCopyLink: () => void;
  onWhatsAppShare: () => void;
  onFacebookShare: () => void;
  onTwitterShare: () => void;
  onOpenImage: (imgUrl: string) => void;
  copied: boolean;
}

const NewsPostCard: React.FC<NewsPostCardProps> = ({
  post,
  language,
  isAdmin,
  onOpenPost,
  onDelete,
  onCopyLink,
  onWhatsAppShare,
  onFacebookShare,
  onTwitterShare,
  onOpenImage,
  copied,
}) => {
  const [showShareMenu, setShowShareMenu] = useState(false);

  // Extract first line as headline
  const lines = post.content.split('\n').filter((l) => l.trim().length > 0);
  const headline = lines[0] || 'Rajababu Mehta Announcement';
  const remainingContent = lines.slice(1).join('\n').trim();

  // Format date
  const formattedDate = (() => {
    try {
      const d = new Date(post.createdAt);
      if (isNaN(d.getTime())) return 'Recently';
      return d.toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
      });
    } catch {
      return 'Recently';
    }
  })();

  return (
    <article className="bg-[#171514] border border-[rgba(255,240,238,0.1)] rounded-3xl overflow-hidden shadow-xl hover:border-[rgba(255,240,238,0.18)] transition-all">
      {/* Top Header: Author + Category + Date */}
      <div className="p-5 sm:p-6 pb-4 flex items-start justify-between gap-3">
        <div className="flex items-center gap-3">
          <img
            src={post.authorPhoto || '/assets/aistudio/hero_photo.jpg'}
            alt={post.authorName}
            className="w-11 h-11 rounded-full object-cover border-2 border-[#e4342f]"
          />
          <div>
            <div className="flex items-center gap-1.5 flex-wrap">
              <span className="font-bold text-sm text-[#f6f3f2]">{post.authorName}</span>
              <CheckCircle2 className="w-4 h-4 text-[#e4342f] fill-[#e4342f] text-black" />
              {post.category && (
                <span className="text-[10px] font-semibold uppercase tracking-wider px-2 py-0.5 rounded-full bg-[rgba(228,52,47,0.12)] text-[#ff8175] border border-[rgba(228,52,47,0.25)]">
                  {post.category}
                </span>
              )}
            </div>
            <div className="flex items-center gap-1.5 text-[11px] text-[#f6f3f2]/50 mt-0.5">
              <span>Founder & CEO, AI Clipzone</span>
              <span>·</span>
              <span className="flex items-center gap-1">
                <Clock className="w-3 h-3" />
                {formattedDate}
              </span>
            </div>
          </div>
        </div>

        {isAdmin && (
          <button
            onClick={onDelete}
            title="Delete article"
            className="p-1.5 rounded-lg text-stone-500 hover:text-rose-400 hover:bg-rose-950/30 transition-colors cursor-pointer"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        )}
      </div>

      {/* Main Headline */}
      <div className="px-5 sm:px-6 pb-2 cursor-pointer" onClick={onOpenPost}>
        <h3 className="text-lg sm:text-xl font-bold text-[#f6f3f2] hover:text-[#ff8175] transition-colors leading-snug">
          {headline}
        </h3>
        {remainingContent && (
          <p className="text-sm text-[#f6f3f2]/75 line-clamp-3 mt-2 leading-relaxed">
            {remainingContent}
          </p>
        )}
      </div>

      {/* Images Preview */}
      {post.images && post.images.length > 0 && (
        <div className="border-t border-b border-[rgba(255,240,238,0.06)] bg-black/40 mt-3">
          {post.images.length === 1 ? (
            <div
              onClick={() => onOpenImage(post.images[0])}
              className="relative cursor-pointer group max-h-[460px] overflow-hidden flex items-center justify-center bg-black"
            >
              <img
                src={post.images[0]}
                alt="Post photo"
                className="w-full max-h-[460px] object-cover group-hover:scale-[1.01] transition-transform duration-300"
              />
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-1 bg-black">
              {post.images.slice(0, 2).map((img, i) => (
                <div
                  key={i}
                  onClick={() => onOpenImage(img)}
                  className="aspect-video cursor-pointer relative overflow-hidden bg-black"
                >
                  <img
                    src={img}
                    alt={`Attachment ${i + 1}`}
                    className="w-full h-full object-cover hover:scale-105 transition-transform"
                  />
                  {i === 1 && post.images.length > 2 && (
                    <div className="absolute inset-0 bg-black/70 flex items-center justify-center text-white text-base font-bold">
                      +{post.images.length - 2} more
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Direct News Share Bar (STRICTLY NO LIKE, NO COMMENT - ONLY SHARE & READ) */}
      <div className="px-5 sm:px-6 py-3.5 bg-[#141211]/60 border-t border-[rgba(255,240,238,0.08)] flex items-center justify-between gap-2 flex-wrap">
        <button
          onClick={onOpenPost}
          className="flex items-center gap-1.5 text-xs font-bold text-[#ff8175] hover:text-white transition-colors cursor-pointer"
        >
          <span>{language === 'NE' ? 'पूरा लेख पढ्नुहोस्' : 'Read Full Article'}</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </button>

        {/* Share Buttons Strip */}
        <div className="flex items-center gap-1.5">
          {/* Quick WhatsApp Share */}
          <button
            onClick={onWhatsAppShare}
            title="Share on WhatsApp"
            className="p-2 rounded-xl bg-[#25D366]/10 hover:bg-[#25D366] text-[#25D366] hover:text-white transition-all text-xs font-bold flex items-center gap-1 cursor-pointer"
          >
            <span className="text-sm leading-none">💬</span>
            <span className="hidden sm:inline">WhatsApp</span>
          </button>

          {/* Quick Facebook Share */}
          <button
            onClick={onFacebookShare}
            title="Share on Facebook"
            className="p-2 rounded-xl bg-[#1877F2]/10 hover:bg-[#1877F2] text-[#1877F2] hover:text-white transition-all text-xs font-bold flex items-center gap-1 cursor-pointer"
          >
            <span className="text-sm leading-none">📘</span>
            <span className="hidden sm:inline">Facebook</span>
          </button>

          {/* Quick X Share */}
          <button
            onClick={onTwitterShare}
            title="Share on X"
            className="p-2 rounded-xl bg-white/5 hover:bg-white text-white hover:text-black transition-all text-xs font-bold flex items-center gap-1 cursor-pointer"
          >
            <span className="text-xs font-black">𝕏</span>
          </button>

          {/* Copy Direct Link */}
          <button
            onClick={onCopyLink}
            title="Copy Direct Article Link"
            className="py-2 px-3 rounded-xl bg-[rgba(255,255,255,0.05)] hover:bg-[#e4342f] text-[#f6f3f2] hover:text-white transition-all text-xs font-bold flex items-center gap-1.5 cursor-pointer border border-[rgba(255,240,238,0.08)]"
          >
            {copied ? (
              <>
                <Check className="w-3.5 h-3.5 text-emerald-400" />
                <span className="text-emerald-400">Copied!</span>
              </>
            ) : (
              <>
                <Share2 className="w-3.5 h-3.5 text-[#e4342f]" />
                <span>Share Link</span>
              </>
            )}
          </button>
        </div>
      </div>
    </article>
  );
};
