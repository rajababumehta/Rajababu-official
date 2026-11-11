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
  LogOut,
  X,
  ExternalLink,
  Clock,
  Maximize2,
  Loader2,
  BookOpen,
  ArrowRight,
  Mail,
  Smartphone,
  MessageCircle,
} from 'lucide-react';
import { FeedPost, Language, AdminUser } from '../types';
import {
  subscribeToFeedPosts,
  getSingleFeedPost,
  createFeedPost,
  deleteFeedPost,
  logoutAdmin,
  subscribeToAuth,
  isUserAdmin,
  compressImageFile,
  testFirestoreConnection,
} from '../services/firebase';
import { updatePostSeo, resetPostSeo } from '../utils/seo';

// Real Official Brand SVG Logos
export const WhatsAppLogo: React.FC<{ className?: string }> = ({ className = 'w-4 h-4' }) => (
  <svg className={className} viewBox="0 0 24 24" fill="currentColor">
    <path d="M17.472 14.382c-.301-.15-1.78-.877-2.056-.977-.276-.1-.477-.15-.678.15-.2.301-.778.977-.954 1.177-.175.2-.351.226-.652.075-.301-.151-1.27-.468-2.42-1.493-.895-.798-1.5-1.784-1.676-2.085-.175-.301-.019-.464.132-.614.135-.135.301-.351.451-.527.151-.176.201-.301.302-.502.1-.2.05-.376-.025-.526-.075-.151-.678-1.633-.929-2.237-.244-.588-.493-.508-.678-.517-.175-.009-.376-.01-.577-.01-.2 0-.527.075-.803.376s-1.054 1.029-1.054 2.509 1.079 2.909 1.23 3.11c.15.2 2.122 3.24 5.141 4.544.718.31 1.278.496 1.716.634.722.23 1.379.197 1.899.12.579-.087 1.78-.727 2.031-1.43.25-.702.25-1.303.175-1.43-.075-.126-.276-.201-.577-.352zm-5.464 7.606c-1.922 0-3.805-.517-5.45-1.498l-.391-.232-4.049 1.062 1.081-3.948-.255-.406c-1.077-1.716-1.646-3.693-1.646-5.716 0-5.932 4.827-10.759 10.763-10.759 2.875 0 5.578 1.12 7.61 3.153 2.032 2.033 3.15 4.736 3.149 7.612 0 5.933-4.827 10.76-10.763 10.76zm9.176-19.932c-2.454-2.455-5.717-3.806-9.18-3.806-7.154 0-12.974 5.82-12.977 12.978 0 2.287.6 4.519 1.739 6.495l-1.848 6.752 6.911-1.813c1.905 1.039 4.058 1.587 6.25 1.587h.005c7.152 0 12.973-5.821 12.976-12.979.002-3.468-1.348-6.731-3.876-9.214z" />
  </svg>
);

export const FacebookLogo: React.FC<{ className?: string }> = ({ className = 'w-4 h-4' }) => (
  <svg className={className} viewBox="0 0 24 24" fill="currentColor">
    <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
  </svg>
);

export const XTwitterLogo: React.FC<{ className?: string }> = ({ className = 'w-4 h-4' }) => (
  <svg className={className} viewBox="0 0 24 24" fill="currentColor">
    <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
  </svg>
);

export const TelegramLogo: React.FC<{ className?: string }> = ({ className = 'w-4 h-4' }) => (
  <svg className={className} viewBox="0 0 24 24" fill="currentColor">
    <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm4.64 6.8c-.15 1.58-.8 5.42-1.13 7.19-.14.75-.42 1-.68 1.03-.58.05-1.02-.38-1.58-.75-.88-.58-1.38-.94-2.23-1.5-.99-.65-.35-1.01.22-1.59.15-.15 2.71-2.48 2.76-2.69a.2.2 0 00-.05-.18c-.06-.05-.14-.03-.21-.02-.09.02-1.49.95-4.22 2.79-.4.27-.76.41-1.08.4-.36-.01-1.04-.2-1.55-.37-.63-.2-1.12-.31-1.08-.66.02-.18.27-.36.74-.55 2.92-1.27 4.86-2.11 5.83-2.51 2.78-1.16 3.35-1.36 3.73-1.36.08 0 .27.02.39.12.1.08.13.19.14.27-.01.06.01.24 0 .38z"/>
  </svg>
);

export const LinkedInLogo: React.FC<{ className?: string }> = ({ className = 'w-4 h-4' }) => (
  <svg className={className} viewBox="0 0 24 24" fill="currentColor">
    <path d="M19 3a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h14m-.5 15.5v-5.3a3.26 3.26 0 0 0-3.26-3.26c-.85 0-1.84.52-2.28 1.3v-1.11h-2.79v8.37h2.79v-4.93c0-.77.62-1.4 1.39-1.4a1.4 1.4 0 0 1 1.4 1.4v4.93h2.75M6.46 8.76c-.97 0-1.75-.79-1.75-1.76s.78-1.75 1.75-1.75c.97 0 1.76.78 1.76 1.75s-.79 1.76-1.76 1.76m1.4 9.74v-8.37H5.06v8.37h2.8z" />
  </svg>
);

// Official Red Facebook/Meta Scalloped Verification Badge with Crisp White Checkmark
export const FacebookVerifiedBadge: React.FC<{ className?: string }> = ({ className = 'w-4 h-4' }) => (
  <svg
    viewBox="0 0 24 24"
    className={className}
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    aria-label="Verified Badge"
  >
    {/* Real Facebook/Meta Scalloped Rosette Seal */}
    <path
      d="M22.5 12.5c0-1.58-.875-2.95-2.148-3.6.154-.435.238-.905.238-1.4 0-2.21-1.79-4-4-4-.495 0-.965.084-1.4.238C14.55 2.475 13.18 1.6 11.6 1.6c-1.58 0-2.95.875-3.6 2.148-.435-.154-.905-.238-1.4-.238-2.21 0-4 1.79-4 4 0 .495.084.965.238 1.4C1.575 9.55.7 10.92.7 12.5c0 1.58.875 2.95 2.148 3.6-.154.435-.238.905-.238 1.4 0 2.21 1.79 4 4 4 .495 0 .965-.084 1.4-.238.65 1.273 2.02 2.148 3.6 2.148 1.58 0 2.95-.875 3.6-2.148.435.154.905.238 1.4.238 2.21 0 4-1.79 4-4 0-.495-.084-.965-.238-1.4 1.273-.65 2.148-2.02 2.148-3.6z"
      fill="#e4342f"
    />
    {/* Crisp White Checkmark */}
    <path
      d="M9.8 16.7L6 12.9l1.4-1.4 2.4 2.4 5.8-5.8 1.4 1.4-7.2 7.2z"
      fill="#ffffff"
    />
  </svg>
);

interface PostsFeedViewProps {
  language: Language;
  onBackToHome?: () => void;
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

const LOCAL_POSTS_CACHE_KEY = 'rajababu_news_posts_cache_v4';

export const PostsFeedView: React.FC<PostsFeedViewProps> = ({
  language,
  onBackToHome,
  onShowToast,
  initialPostId,
}) => {
  // Instant Cache Initialization for 0ms loading lag
  const [posts, setPosts] = useState<FeedPost[]>(() => {
    try {
      const raw = localStorage.getItem(LOCAL_POSTS_CACHE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch {}
    return [];
  });
  const [loadingPosts, setLoadingPosts] = useState(() => {
    try {
      const raw = localStorage.getItem(LOCAL_POSTS_CACHE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw);
        if (Array.isArray(parsed) && parsed.length > 0) return false;
      }
    } catch {}
    return true;
  });
  const [currentUser, setCurrentUser] = useState<AdminUser | null>(null);

  // Active Selected Post for Dedicated News View
  const [activePostId, setActivePostId] = useState<string | null>(initialPostId || null);

  useEffect(() => {
    if (initialPostId) {
      setActivePostId(initialPostId);
    }
  }, [initialPostId]);

  // Composer State (for Admin)
  const [postTitle, setPostTitle] = useState('');
  const [postContent, setPostContent] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('Article');
  const [imageFiles, setImageFiles] = useState<string[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Active Lightbox Image
  const [lightboxImage, setLightboxImage] = useState<string | null>(null);

  // Active Share Modal Post (Universal Share Anywhere)
  const [shareModalPost, setShareModalPost] = useState<FeedPost | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);

  // Read URL query param ?post=ID or hash #post-ID on load
  useEffect(() => {
    const handleUrlPostParam = () => {
      const urlParams = new URLSearchParams(window.location.search);
      const postParam = urlParams.get('post');
      const hash = window.location.hash;
      const pathname = window.location.pathname;
      let targetId: string | null = null;

      if (postParam) {
        targetId = postParam;
      } else {
        const pathMatch = pathname.match(/^\/(?:posts|post|news)\/([a-zA-Z0-9_\-]+)/);
        if (pathMatch) {
          targetId = pathMatch[1];
        } else if (hash.startsWith('#post-')) {
          targetId = hash.replace('#post-', '');
        } else if (hash.startsWith('#post/')) {
          targetId = hash.replace('#post/', '');
        }
      }

      if (!targetId) {
        try {
          const sessionSaved = sessionStorage.getItem('open_post_id');
          if (sessionSaved) {
            targetId = sessionSaved;
            sessionStorage.removeItem('open_post_id');
          }
        } catch {}
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

  // Subscribe to real-time posts (updates cache seamlessly in background)
  useEffect(() => {
    const unsub = subscribeToFeedPosts(
      (loadedPosts) => {
        setPosts(loadedPosts);
        setLoadingPosts(false);
        try {
          localStorage.setItem(LOCAL_POSTS_CACHE_KEY, JSON.stringify(loadedPosts));
        } catch {}
      },
      (err) => {
        console.warn('Posts listener note:', err);
        setLoadingPosts(false);
      }
    );
    return () => unsub();
  }, []);

  const [directLoadedPost, setDirectLoadedPost] = useState<FeedPost | null>(null);

  // If activePostId is set but not in posts array, fetch directly from Firestore
  useEffect(() => {
    if (activePostId && !posts.some((p) => p.id === activePostId)) {
      let isMounted = true;
      getSingleFeedPost(activePostId).then((fetched) => {
        if (isMounted && fetched) {
          setDirectLoadedPost(fetched);
        }
      });
      return () => {
        isMounted = false;
      };
    } else if (activePostId && posts.some((p) => p.id === activePostId)) {
      setDirectLoadedPost(null);
    }
  }, [activePostId, posts]);

  // Active Post Object
  const currentActivePost = activePostId
    ? posts.find((p) => p.id === activePostId) || directLoadedPost
    : null;

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
        authorPhoto: '/brand-avatar.png',
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

  // Direct News Post URL Generator (Optimized for Facebook, WhatsApp, and social crawlers)
  const getDirectPostUrl = (postId: string) => {
    return `${window.location.origin}/posts/${postId}`;
  };

  // Direct Social Share Actions specifically for this post (NO website promotional bio, pure news)
  const handleWhatsAppShare = (post: FeedPost) => {
    const directUrl = getDirectPostUrl(post.id);
    const firstLine = post.content.split('\n')[0].replace(/^#+\s*/, '').trim();
    // Exactly like RONB post: Headline followed by space and direct article URL
    const text = encodeURIComponent(`${firstLine} ${directUrl}`);
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
    const text = encodeURIComponent(firstLine);
    window.open(
      `https://twitter.com/intent/tweet?text=${text}&url=${encodeURIComponent(directUrl)}`,
      '_blank'
    );
  };

  const handleTelegramShare = (post: FeedPost) => {
    const directUrl = getDirectPostUrl(post.id);
    const firstLine = post.content.split('\n')[0].replace(/^#+\s*/, '').trim();
    window.open(
      `https://t.me/share/url?url=${encodeURIComponent(directUrl)}&text=${encodeURIComponent(firstLine)}`,
      '_blank'
    );
  };

  const handleLinkedInShare = (post: FeedPost) => {
    const directUrl = getDirectPostUrl(post.id);
    window.open(
      `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(directUrl)}`,
      '_blank'
    );
  };

  const handleEmailShare = (post: FeedPost) => {
    const directUrl = getDirectPostUrl(post.id);
    const firstLine = post.content.split('\n')[0].replace(/^#+\s*/, '').trim();
    window.open(
      `mailto:?subject=${encodeURIComponent(firstLine)}&body=${encodeURIComponent(
        `${firstLine}\n\n${directUrl}`
      )}`,
      '_blank'
    );
  };

  const handleUniversalShare = async (post: FeedPost) => {
    const directUrl = getDirectPostUrl(post.id);
    const firstLine = post.content.split('\n')[0].replace(/^#+\s*/, '').trim();
    const headline = firstLine || 'Rajababu Mehta News';
    const summary = post.content.slice(0, 140).replace(/\n/g, ' ');

    if (navigator.share) {
      try {
        await navigator.share({
          title: headline,
          text: `${headline}\n\n${summary}...`,
          url: directUrl,
        });
        return;
      } catch (err: any) {
        if (err.name === 'AbortError') return;
      }
    }

    setShareModalPost(post);
  };

  const handleOpenSinglePost = (postId: string) => {
    setActivePostId(postId);
    window.history.pushState(null, '', `/posts/${postId}`);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleBackToFeed = () => {
    setActivePostId(null);
    window.history.pushState(null, '', '/');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const isAdmin = isUserAdmin(currentUser);

  return (
    <div className="min-h-screen bg-[#0d0b0a] text-[#f6f3f2] font-sans selection:bg-[#e4342f] selection:text-white pb-24">
      {/* Top Sticky Header */}
      <header className="sticky top-0 z-40 bg-[#12100f]/95 backdrop-blur-md border-b border-[rgba(255,240,238,0.08)]">
        <div className="max-w-3xl mx-auto px-3 sm:px-4 h-14 sm:h-16 flex items-center justify-between gap-3">
          {currentActivePost ? (
            <button
              onClick={handleBackToFeed}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-[rgba(255,255,255,0.06)] hover:bg-[#e4342f] text-[#f6f3f2] hover:text-white transition-all text-xs sm:text-sm font-bold cursor-pointer border border-[rgba(255,240,238,0.12)] active:scale-95"
            >
              <ArrowLeft className="w-4 h-4 text-[#ff8175] group-hover:text-white" />
              <span>{language === 'NE' ? 'सबै समाचार' : 'All Articles'}</span>
            </button>
          ) : (
            <div className="flex items-center gap-2.5">
              <img
                src="/brand-avatar.png"
                alt="Rajababu Mehta"
                className="w-7 h-7 sm:w-8 sm:h-8 rounded-full object-cover ring-2 ring-[#e4342f] shadow-sm"
              />
              <div className="flex items-center gap-1.5">
                <span className="text-xs sm:text-sm font-bold text-[#f6f3f2] tracking-tight">
                  Rajababu Mehta
                </span>
                <FacebookVerifiedBadge className="w-3.5 h-3.5 sm:w-4 sm:h-4 shrink-0" />
              </div>
            </div>
          )}

          <div className="flex items-center gap-2">
            <span className="hidden xs:inline-flex items-center gap-1.5 text-[11px] font-semibold text-emerald-400 bg-emerald-950/40 border border-emerald-500/20 px-2.5 py-0.5 rounded-full">
              <Globe className="w-3 h-3" />
              Live Portal
            </span>

            {isAdmin && (
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
            )}
          </div>
        </div>
      </header>

      {/* Main Container */}
      <main className="max-w-3xl mx-auto px-3 sm:px-4 pt-4 sm:pt-6 space-y-4 sm:space-y-6">

        {/* ------------------------------------------------------------- */}
        {/* SINGLE ARTICLE VIEW (News Portal Reader Mode with Direct Link) */}
        {/* ------------------------------------------------------------- */}
        {activePostId && !currentActivePost && loadingPosts ? (
          <article className="bg-[#161413] border border-[rgba(255,240,238,0.1)] rounded-2xl sm:rounded-3xl p-4 sm:p-7 md:p-8 space-y-5 sm:space-y-6 animate-pulse">
            <div className="flex items-center justify-between pb-3 border-b border-[rgba(255,240,238,0.06)]">
              <div className="h-4 w-28 bg-white/10 rounded" />
              <div className="h-4 w-20 bg-white/5 rounded" />
            </div>
            <div className="h-7 sm:h-9 w-4/5 bg-white/10 rounded" />
            <div className="flex items-center gap-3">
              <div className="w-11 h-11 rounded-full bg-white/10" />
              <div className="space-y-1.5 flex-1">
                <div className="h-4 w-32 bg-white/10 rounded" />
                <div className="h-3 w-24 bg-white/5 rounded" />
              </div>
            </div>
            <div className="aspect-[16/10] sm:aspect-video w-full bg-white/5 rounded-xl sm:rounded-2xl" />
            <div className="space-y-2.5 pt-2">
              <div className="h-4 w-full bg-white/5 rounded" />
              <div className="h-4 w-5/6 bg-white/5 rounded" />
              <div className="h-4 w-3/4 bg-white/5 rounded" />
            </div>
          </article>
        ) : activePostId && !currentActivePost && !loadingPosts ? (
          <div className="bg-[#161413] border border-[rgba(255,240,238,0.1)] rounded-2xl sm:rounded-3xl p-6 sm:p-8 text-center space-y-4">
            <p className="text-stone-300 text-sm">
              {language === 'NE' ? 'यो पोस्ट वा समाचार फेला परेन।' : 'This post or article could not be found.'}
            </p>
            <button
              onClick={handleBackToFeed}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-[#e4342f] text-white text-xs font-bold hover:bg-[#c92823] transition-colors cursor-pointer active:scale-95"
            >
              <span>← {language === 'NE' ? 'सबै समाचार र पोस्टहरू हेर्नुहोस्' : 'Browse All News & Posts'}</span>
            </button>
          </div>
        ) : currentActivePost ? (
          <article className="bg-[#161413] border border-[rgba(255,240,238,0.1)] rounded-2xl sm:rounded-3xl p-4 sm:p-7 md:p-8 shadow-2xl space-y-5 sm:space-y-6">
            {/* Breadcrumb & Status */}
            <div className="flex items-center justify-between gap-2 text-xs flex-wrap border-b border-[rgba(255,240,238,0.08)] pb-3">
              <div className="flex items-center gap-2 text-[#f6f3f2]/60">
                <span className="text-[#ff8175] font-bold uppercase tracking-wider text-[11px]">
                  Official Update
                </span>
              </div>

              {/* Direct Post URL Indicator */}
              <div className="flex items-center gap-2">
                <span className="text-[10px] sm:text-[11px] font-mono text-emerald-400 bg-emerald-950/40 border border-emerald-500/20 px-2.5 py-0.5 rounded-full flex items-center gap-1">
                  <Globe className="w-3 h-3" />
                  Google Indexed
                </span>
                {isAdmin && (
                  <button
                    onClick={() => handleDeletePost(currentActivePost.id)}
                    title="Delete article"
                    className="p-1 rounded text-stone-500 hover:text-rose-400 hover:bg-rose-950/40 cursor-pointer transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                )}
              </div>
            </div>

            {/* Prominent Editorial Headline */}
            <h1 className="text-xl sm:text-2xl md:text-3xl font-black text-[#f6f3f2] tracking-tight leading-snug">
              {currentActivePost.content.split('\n').filter((l) => l.trim().length > 0)[0] || 'Official Announcement'}
            </h1>

            {/* Author Header Bar */}
            <div className="flex items-center gap-3">
              <div className="relative shrink-0">
                <img
                  src="/brand-avatar.png"
                  alt={currentActivePost.authorName || 'Rajababu Mehta'}
                  className="w-11 h-11 sm:w-12 sm:h-12 rounded-full object-cover object-center ring-2 ring-[#e4342f] shadow-md bg-stone-900"
                  onError={(e) => {
                    (e.currentTarget as HTMLImageElement).src = '/brand-avatar.png';
                  }}
                />
              </div>
              <div className="min-w-0">
                <div className="flex items-center gap-1.5">
                  <span className="font-bold text-sm sm:text-base text-[#f6f3f2] truncate">
                    {currentActivePost.authorName || 'Rajababu Mehta'}
                  </span>
                  <FacebookVerifiedBadge className="w-4 h-4 sm:w-[18px] sm:h-[18px] shrink-0" />
                </div>
                <div className="text-[11px] sm:text-xs text-[#f6f3f2]/60 flex items-center gap-1.5 mt-0.5 flex-wrap">
                  <span>Founder, AI Clipzone</span>
                  <span>·</span>
                  <span className="flex items-center gap-1">
                    <Clock className="w-3 h-3 text-[#ff8175]/80" />
                    {new Date(currentActivePost.createdAt).toLocaleDateString('en-US', {
                      month: 'short',
                      day: 'numeric',
                      year: 'numeric',
                    })}
                  </span>
                </div>
              </div>
            </div>

            {/* Post Images Gallery (News Style) */}
            {currentActivePost.images && currentActivePost.images.length > 0 && (
              <div className="space-y-3 pt-1">
                <div
                  onClick={() => setLightboxImage(currentActivePost.images[0])}
                  className="rounded-xl sm:rounded-2xl overflow-hidden cursor-pointer group relative bg-black border border-[rgba(255,240,238,0.1)] shadow-inner"
                >
                  <img
                    src={currentActivePost.images[0]}
                    alt="Article Featured Attachment"
                    className="w-full max-h-[480px] object-cover group-hover:scale-[1.01] transition-transform duration-300"
                  />
                  <div className="absolute inset-0 bg-black/25 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                    <span className="px-3 py-1.5 rounded-full bg-black/80 text-white text-xs font-semibold flex items-center gap-1.5 backdrop-blur-sm">
                      <Maximize2 className="w-3.5 h-3.5" /> Full Photo
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
              <div className="text-sm sm:text-base text-[#f6f3f2]/90 leading-relaxed font-sans whitespace-pre-line space-y-4">
                {currentActivePost.content.split('\n').filter((l) => l.trim().length > 0).slice(1).join('\n\n') || currentActivePost.content}
              </div>
            </div>

            {/* DIRECT NEWS PORTAL SHARE BAR */}
            <div className="pt-5 border-t border-[rgba(255,240,238,0.1)] space-y-3">
              <div className="flex items-center justify-between text-xs text-[#f6f3f2]/60">
                <span className="font-bold uppercase tracking-wider text-[#ff8175] flex items-center gap-1.5 text-[11px] sm:text-xs">
                  <Share2 className="w-3.5 h-3.5" />
                  {language === 'NE' ? 'यो समाचार / लेख सेयर गर्नुहोस्:' : 'Share this news article:'}
                </span>
              </div>

              {/* Direct Social Share Buttons with Real Official Logos */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 sm:gap-2.5">
                {/* Real WhatsApp Direct Share */}
                <button
                  type="button"
                  onClick={() => handleWhatsAppShare(currentActivePost)}
                  className="py-2.5 px-3 rounded-xl bg-[#25D366]/15 hover:bg-[#25D366] text-[#25D366] hover:text-white border border-[#25D366]/35 text-xs font-bold transition-all flex items-center justify-center gap-2 cursor-pointer shadow-sm active:scale-95"
                >
                  <WhatsAppLogo className="w-4 h-4 shrink-0" />
                  <span>WhatsApp</span>
                </button>

                {/* Real Facebook Direct Share */}
                <button
                  type="button"
                  onClick={() => handleFacebookShare(currentActivePost)}
                  className="py-2.5 px-3 rounded-xl bg-[#1877F2]/15 hover:bg-[#1877F2] text-[#1877F2] hover:text-white border border-[#1877F2]/35 text-xs font-bold transition-all flex items-center justify-center gap-2 cursor-pointer shadow-sm active:scale-95"
                >
                  <FacebookLogo className="w-4 h-4 shrink-0" />
                  <span>Facebook</span>
                </button>

                {/* Real X / Twitter Share */}
                <button
                  type="button"
                  onClick={() => handleTwitterShare(currentActivePost)}
                  className="py-2.5 px-3 rounded-xl bg-white/10 hover:bg-white text-white hover:text-black border border-white/20 text-xs font-bold transition-all flex items-center justify-center gap-2 cursor-pointer shadow-sm active:scale-95"
                >
                  <XTwitterLogo className="w-3.5 h-3.5 shrink-0" />
                  <span>X / Twitter</span>
                </button>

                {/* Universal Share Anywhere Button */}
                <button
                  type="button"
                  onClick={() => handleUniversalShare(currentActivePost)}
                  className="py-2.5 px-3 rounded-xl bg-gradient-to-r from-[#e4342f] to-[#ff4742] hover:from-[#c92823] hover:to-[#e4342f] text-white border border-[#e4342f]/50 text-xs font-bold transition-all flex items-center justify-center gap-2 cursor-pointer shadow-md shadow-[#e4342f]/25 active:scale-95"
                >
                  <Share2 className="w-4 h-4 shrink-0" />
                  <span>{language === 'NE' ? 'सबैतिर पठाउनुहोस्' : 'Share Anywhere'}</span>
                </button>
              </div>
            </div>

            {/* Back to all posts footer */}
            <div className="pt-2 text-center">
              <button
                onClick={handleBackToFeed}
                className="inline-flex items-center gap-2 text-xs font-bold text-[#ff8175] hover:text-white transition-colors cursor-pointer py-1.5 px-3 rounded-full hover:bg-white/5 active:scale-95"
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
                  <div className="relative shrink-0">
                    <img
                      src="/brand-avatar.png"
                      alt="Rajababu Mehta"
                      className="w-11 h-11 rounded-full object-cover object-center ring-2 ring-[#e4342f] shadow-md bg-stone-900"
                    />
                  </div>
                  <div>
                    <div className="flex items-center gap-1.5">
                      <span className="font-bold text-sm text-[#f6f3f2]">Rajababu Mehta</span>
                      <FacebookVerifiedBadge className="w-4 h-4 shrink-0" />
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
            <div className="space-y-1.5 pb-2 border-b border-[rgba(255,240,238,0.06)]">
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-[#e4342f] animate-pulse" />
                <span className="text-[10px] sm:text-[11px] font-bold uppercase tracking-wider text-[#ff8175]">
                  {language === 'NE' ? 'आधिकारिक अपडेटहरू' : 'Official Updates'}
                </span>
              </div>
              <h2 className="text-xl sm:text-2xl md:text-3xl font-black text-[#f6f3f2] tracking-tight">
                {language === 'NE' ? 'आधिकारिक सामग्री तथा अपडेटहरू' : 'Official Updates & Articles'}
              </h2>
              <p className="text-xs sm:text-sm text-[#f6f3f2]/65 leading-relaxed">
                {language === 'NE'
                  ? 'राजाबाबु मेहताद्वारा प्रकाशित आधिकारिक सामग्रीहरू'
                  : 'Official posts and announcements by Rajababu Mehta'}
              </p>
            </div>

            {/* Posts List: Fast Instant Skeleton Preview or Articles */}
            {loadingPosts && posts.length === 0 ? (
              <div className="space-y-4">
                {[1, 2].map((i) => (
                  <div
                    key={i}
                    className="bg-[#171514] border border-[rgba(255,240,238,0.06)] rounded-3xl p-5 sm:p-6 space-y-4 animate-pulse"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-11 h-11 rounded-full bg-white/10 shrink-0" />
                      <div className="space-y-1.5 flex-1">
                        <div className="h-4 w-32 bg-white/10 rounded" />
                        <div className="h-3 w-24 bg-white/5 rounded" />
                      </div>
                    </div>
                    <div className="h-6 w-3/4 bg-white/10 rounded" />
                    <div className="h-4 w-5/6 bg-white/5 rounded" />
                    <div className="h-44 sm:h-56 w-full bg-white/5 rounded-2xl" />
                  </div>
                ))}
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
                  onWhatsAppShare={() => handleWhatsAppShare(post)}
                  onFacebookShare={() => handleFacebookShare(post)}
                  onTwitterShare={() => handleTwitterShare(post)}
                  onUniversalShare={() => handleUniversalShare(post)}
                  onOpenImage={(imgUrl) => setLightboxImage(imgUrl)}
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

      {/* Universal Share Anywhere Modal (WhatsApp, Facebook, Messenger, Telegram, LinkedIn, Email, System Picker) */}
      <AnimatePresence>
        {shareModalPost && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setShareModalPost(null)}
            className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-4"
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0, y: 15 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.95, opacity: 0, y: 15 }}
              onClick={(e) => e.stopPropagation()}
              className="w-full max-w-md bg-[#161413] border border-[rgba(255,240,238,0.15)] rounded-3xl p-6 shadow-2xl space-y-5 text-[#f6f3f2]"
            >
              {/* Header */}
              <div className="flex items-center justify-between border-b border-[rgba(255,240,238,0.08)] pb-3">
                <div className="flex items-center gap-2">
                  <div className="p-2 rounded-xl bg-[#e4342f]/20 text-[#ff8175]">
                    <Share2 className="w-4 h-4" />
                  </div>
                  <div>
                    <h3 className="font-bold text-sm text-[#f6f3f2]">
                      {language === 'NE' ? 'समाचार / लेख सेयर गर्नुहोस्' : 'Share Article Anywhere'}
                    </h3>
                    <p className="text-[11px] text-[#f6f3f2]/60">
                      {language === 'NE' ? 'कुनै पनि सोसल मिडिया वा एपमा पठाउनुहोस्' : 'Send to any app, chat, or social platform'}
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => setShareModalPost(null)}
                  className="p-1.5 rounded-full hover:bg-white/10 text-stone-400 hover:text-white transition-colors cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Post Preview Snippet with Featured Photo */}
              <div className="p-3 rounded-2xl bg-[#0f0d0c] border border-[rgba(255,240,238,0.08)] flex items-center gap-3">
                {shareModalPost.images && shareModalPost.images.length > 0 ? (
                  <img
                    src={shareModalPost.images[0]}
                    alt="Article thumbnail"
                    className="w-14 h-14 rounded-xl object-cover shrink-0 border border-white/10"
                  />
                ) : (
                  <img
                    src="/brand-avatar.png"
                    alt="Author"
                    className="w-14 h-14 rounded-xl object-cover shrink-0 border border-white/10"
                  />
                )}
                <div className="min-w-0 flex-1">
                  <span className="text-[10px] font-semibold uppercase tracking-wider text-[#ff8175]">
                    {shareModalPost.category || 'News'}
                  </span>
                  <p className="text-xs font-bold text-[#f6f3f2] truncate">
                    {shareModalPost.content.split('\n')[0].replace(/^#+\s*/, '') || 'Article by Rajababu Mehta'}
                  </p>
                  <p className="text-[11px] text-[#f6f3f2]/50 truncate mt-0.5">
                    {getDirectPostUrl(shareModalPost.id)}
                  </p>
                </div>
              </div>

              {/* Share Platforms Grid with Official Real Logos */}
              <div className="grid grid-cols-3 gap-2.5">
                {/* Real WhatsApp */}
                <button
                  type="button"
                  onClick={() => handleWhatsAppShare(shareModalPost)}
                  className="p-3 rounded-2xl bg-[#25D366]/15 hover:bg-[#25D366] text-[#25D366] hover:text-white border border-[#25D366]/30 transition-all flex flex-col items-center justify-center gap-1.5 cursor-pointer shadow-sm group"
                >
                  <WhatsAppLogo className="w-6 h-6 group-hover:scale-110 transition-transform" />
                  <span className="text-xs font-semibold">WhatsApp</span>
                </button>

                {/* Real Facebook */}
                <button
                  type="button"
                  onClick={() => handleFacebookShare(shareModalPost)}
                  className="p-3 rounded-2xl bg-[#1877F2]/15 hover:bg-[#1877F2] text-[#1877F2] hover:text-white border border-[#1877F2]/30 transition-all flex flex-col items-center justify-center gap-1.5 cursor-pointer shadow-sm group"
                >
                  <FacebookLogo className="w-6 h-6 group-hover:scale-110 transition-transform" />
                  <span className="text-xs font-semibold">Facebook</span>
                </button>

                {/* Real X / Twitter */}
                <button
                  type="button"
                  onClick={() => handleTwitterShare(shareModalPost)}
                  className="p-3 rounded-2xl bg-white/10 hover:bg-white text-white hover:text-black border border-white/20 transition-all flex flex-col items-center justify-center gap-1.5 cursor-pointer shadow-sm group"
                >
                  <XTwitterLogo className="w-5 h-5 group-hover:scale-110 transition-transform" />
                  <span className="text-xs font-semibold">X / Twitter</span>
                </button>

                {/* Telegram */}
                <button
                  type="button"
                  onClick={() => handleTelegramShare(shareModalPost)}
                  className="p-3 rounded-2xl bg-[#229ED9]/15 hover:bg-[#229ED9] text-[#229ED9] hover:text-white border border-[#229ED9]/30 transition-all flex flex-col items-center justify-center gap-1.5 cursor-pointer shadow-sm group"
                >
                  <TelegramLogo className="w-6 h-6 group-hover:scale-110 transition-transform" />
                  <span className="text-xs font-semibold">Telegram</span>
                </button>

                {/* LinkedIn */}
                <button
                  type="button"
                  onClick={() => handleLinkedInShare(shareModalPost)}
                  className="p-3 rounded-2xl bg-[#0A66C2]/15 hover:bg-[#0A66C2] text-[#0A66C2] hover:text-white border border-[#0A66C2]/30 transition-all flex flex-col items-center justify-center gap-1.5 cursor-pointer shadow-sm group"
                >
                  <LinkedInLogo className="w-6 h-6 group-hover:scale-110 transition-transform" />
                  <span className="text-xs font-semibold">LinkedIn</span>
                </button>

                {/* Email */}
                <button
                  type="button"
                  onClick={() => handleEmailShare(shareModalPost)}
                  className="p-3 rounded-2xl bg-amber-500/15 hover:bg-amber-500 text-amber-400 hover:text-black border border-amber-500/30 transition-all flex flex-col items-center justify-center gap-1.5 cursor-pointer shadow-sm group"
                >
                  <Mail className="w-6 h-6 group-hover:scale-110 transition-transform" />
                  <span className="text-xs font-semibold">Email</span>
                </button>
              </div>

              {/* Native Device Share Sheet Button */}
              {typeof navigator !== 'undefined' && 'share' in navigator && (
                <button
                  type="button"
                  onClick={async () => {
                    const post = shareModalPost;
                    const directUrl = getDirectPostUrl(post.id);
                    const firstLine = post.content.split('\n')[0].replace(/^#+\s*/, '').trim();
                    try {
                      await navigator.share({
                        title: `${firstLine} | Rajababu Mehta`,
                        text: `${firstLine}\n\n${post.content.slice(0, 140)}...`,
                        url: directUrl,
                      });
                      setShareModalPost(null);
                    } catch {}
                  }}
                  className="w-full py-2.5 px-4 rounded-xl bg-white/5 hover:bg-white/10 text-[#f6f3f2] border border-white/10 text-xs font-semibold flex items-center justify-center gap-2 cursor-pointer transition-colors"
                >
                  <Smartphone className="w-4 h-4 text-[#ff8175]" />
                  <span>{language === 'NE' ? 'अन्य सबै मोबाइल एपहरूमा पठाउनुहोस्' : 'Open More Apps / System Share Sheet'}</span>
                </button>
              )}
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
  onWhatsAppShare: () => void;
  onFacebookShare: () => void;
  onTwitterShare: () => void;
  onUniversalShare: () => void;
  onOpenImage: (imgUrl: string) => void;
}

const NewsPostCard: React.FC<NewsPostCardProps> = ({
  post,
  language,
  isAdmin,
  onOpenPost,
  onDelete,
  onWhatsAppShare,
  onFacebookShare,
  onTwitterShare,
  onUniversalShare,
  onOpenImage,
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
    <article className="bg-[#151312] border border-[rgba(255,240,238,0.08)] hover:border-[rgba(255,240,238,0.18)] rounded-2xl sm:rounded-3xl overflow-hidden shadow-lg transition-all">
      {/* Top Header: Author + Date */}
      <div className="p-4 sm:p-5 pb-3 flex items-start justify-between gap-3">
        <div className="flex items-center gap-2.5 sm:gap-3 min-w-0">
          <div className="relative shrink-0">
            <img
              src="/brand-avatar.png"
              alt={post.authorName || 'Rajababu Mehta'}
              className="w-10 h-10 sm:w-11 sm:h-11 rounded-full object-cover object-center ring-2 ring-[#e4342f] shadow-md bg-stone-900"
              onError={(e) => {
                (e.currentTarget as HTMLImageElement).src = '/brand-avatar.png';
              }}
            />
          </div>
          <div className="min-w-0">
            <div className="flex items-center gap-1.5">
              <span className="font-bold text-sm text-[#f6f3f2] truncate">
                {post.authorName || 'Rajababu Mehta'}
              </span>
              <FacebookVerifiedBadge className="w-4 h-4 shrink-0" />
            </div>
            <div className="flex items-center gap-1.5 text-[11px] text-[#f6f3f2]/60 mt-0.5">
              <span className="truncate">Founder, AI Clipzone</span>
              <span>·</span>
              <span className="flex items-center gap-1 shrink-0">
                <Clock className="w-3 h-3 text-[#ff8175]/80" />
                {formattedDate}
              </span>
            </div>
          </div>
        </div>

        {isAdmin && (
          <button
            onClick={onDelete}
            title="Delete article"
            className="p-1.5 rounded-lg text-stone-500 hover:text-rose-400 hover:bg-rose-950/30 transition-colors cursor-pointer shrink-0"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        )}
      </div>

      {/* Main Headline & Excerpt */}
      <div className="px-4 sm:px-5 pb-3 cursor-pointer group" onClick={onOpenPost}>
        <h3 className="text-base sm:text-lg md:text-xl font-bold text-[#f6f3f2] group-hover:text-[#ff8175] transition-colors leading-snug line-clamp-2">
          {headline}
        </h3>
        {remainingContent && (
          <p className="text-xs sm:text-sm text-[#f6f3f2]/75 line-clamp-2 sm:line-clamp-3 mt-1.5 leading-relaxed">
            {remainingContent}
          </p>
        )}
      </div>

      {/* Images Preview */}
      {post.images && post.images.length > 0 && (
        <div className="mx-3.5 sm:mx-5 mb-3 rounded-xl sm:rounded-2xl overflow-hidden bg-black/60 border border-[rgba(255,240,238,0.06)] shadow-inner">
          {post.images.length === 1 ? (
            <div
              onClick={() => onOpenImage(post.images[0])}
              className="relative cursor-pointer group max-h-[360px] sm:max-h-[460px] overflow-hidden flex items-center justify-center bg-black"
            >
              <img
                src={post.images[0]}
                alt="Post photo"
                className="w-full max-h-[360px] sm:max-h-[460px] object-cover group-hover:scale-[1.01] transition-transform duration-300"
              />
              <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                <span className="px-3 py-1.5 rounded-full bg-black/80 text-white text-xs font-semibold flex items-center gap-1.5 backdrop-blur-sm">
                  <Maximize2 className="w-3.5 h-3.5" /> Full Photo
                </span>
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-1.5 bg-black">
              {post.images.slice(0, 2).map((img, i) => (
                <div
                  key={i}
                  onClick={() => onOpenImage(img)}
                  className="aspect-[4/3] sm:aspect-video cursor-pointer relative overflow-hidden bg-black group"
                >
                  <img
                    src={img}
                    alt={`Attachment ${i + 1}`}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                  {i === 1 && post.images.length > 2 && (
                    <div className="absolute inset-0 bg-black/70 flex items-center justify-center text-white text-sm sm:text-base font-bold">
                      +{post.images.length - 2} more
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Direct News Share Bar (Mobile optimized single-row actions) */}
      <div className="px-3.5 sm:px-5 py-2.5 sm:py-3 bg-[#110f0e] border-t border-[rgba(255,240,238,0.06)] flex items-center justify-between gap-2">
        <button
          onClick={onOpenPost}
          className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-[rgba(255,255,255,0.04)] hover:bg-[#e4342f]/20 text-xs font-bold text-[#ff8175] hover:text-white transition-all cursor-pointer shrink-0 active:scale-95"
        >
          <span>{language === 'NE' ? 'पूरा पढ्नुहोस्' : 'Read Article'}</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </button>

        {/* Share Buttons Strip with Real Official Brand Logos */}
        <div className="flex items-center gap-1 sm:gap-1.5 shrink-0">
          {/* Real WhatsApp Share Button */}
          <button
            onClick={onWhatsAppShare}
            title="Share on WhatsApp"
            aria-label="Share on WhatsApp"
            className="w-8 h-8 sm:w-auto sm:px-2.5 sm:py-1.5 rounded-lg sm:rounded-xl bg-[#25D366]/15 hover:bg-[#25D366] text-[#25D366] hover:text-white border border-[#25D366]/30 transition-all text-xs font-bold flex items-center justify-center gap-1.5 cursor-pointer shadow-sm active:scale-95"
          >
            <WhatsAppLogo className="w-3.5 h-3.5 sm:w-4 sm:h-4 shrink-0" />
            <span className="hidden md:inline">WhatsApp</span>
          </button>

          {/* Real Facebook Share Button */}
          <button
            onClick={onFacebookShare}
            title="Share on Facebook"
            aria-label="Share on Facebook"
            className="w-8 h-8 sm:w-auto sm:px-2.5 sm:py-1.5 rounded-lg sm:rounded-xl bg-[#1877F2]/15 hover:bg-[#1877F2] text-[#1877F2] hover:text-white border border-[#1877F2]/30 transition-all text-xs font-bold flex items-center justify-center gap-1.5 cursor-pointer shadow-sm active:scale-95"
          >
            <FacebookLogo className="w-3.5 h-3.5 sm:w-4 sm:h-4 shrink-0" />
            <span className="hidden md:inline">Facebook</span>
          </button>

          {/* Real X / Twitter Share Button */}
          <button
            onClick={onTwitterShare}
            title="Share on X"
            aria-label="Share on X"
            className="w-8 h-8 sm:w-auto sm:px-2 sm:py-1.5 rounded-lg sm:rounded-xl bg-white/10 hover:bg-white text-white hover:text-black border border-white/20 transition-all text-xs font-bold flex items-center justify-center gap-1 cursor-pointer shadow-sm active:scale-95"
          >
            <XTwitterLogo className="w-3.5 h-3.5 shrink-0" />
          </button>

          {/* Universal Share Anywhere Button */}
          <button
            onClick={onUniversalShare}
            title="Share Anywhere"
            aria-label="Share Anywhere"
            className="w-8 h-8 sm:w-auto sm:px-2.5 sm:py-1.5 rounded-lg sm:rounded-xl bg-[#e4342f]/20 hover:bg-[#e4342f] text-[#ff8175] hover:text-white border border-[#e4342f]/40 transition-all text-xs font-bold flex items-center justify-center gap-1.5 cursor-pointer shadow-sm active:scale-95"
          >
            <Share2 className="w-3.5 h-3.5 shrink-0" />
            <span className="hidden md:inline">{language === 'NE' ? 'सेयर' : 'Share'}</span>
          </button>
        </div>
      </div>
    </article>
  );
};
