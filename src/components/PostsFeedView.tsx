import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  ArrowLeft,
  Share2,
  Heart,
  MessageCircle,
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
  ChevronRight,
  Maximize2,
  Tag,
  Loader2,
} from 'lucide-react';
import { FeedPost, PostComment, Language, AdminUser } from '../types';
import {
  subscribeToFeedPosts,
  createFeedPost,
  deleteFeedPost,
  toggleFeedPostLike,
  checkUserLikedPost,
  subscribeToPostComments,
  addPostComment,
  signInWithGoogle,
  logoutAdmin,
  subscribeToAuth,
  isUserAdmin,
  compressImageFile,
  testFirestoreConnection,
  ADMIN_EMAILS,
} from '../services/firebase';

interface PostsFeedViewProps {
  language: Language;
  onBackToHome: () => void;
  onShowToast: (message: string, type: 'success' | 'info' | 'warning' | 'error') => void;
}

const CATEGORIES = [
  { id: 'Announcement', en: '📢 Announcement', ne: '📢 घोषणा' },
  { id: 'Article', en: '💡 Thoughts & Article', ne: '💡 विचार र लेख' },
  { id: 'Clipzone', en: '🚀 AI Clipzone Updates', ne: '🚀 एआई क्लिपजोन अपडेट' },
  { id: 'Tech', en: '💻 Tech & Innovation', ne: '💻 प्रविधि र विकास' },
  { id: 'Personal', en: '📸 Behind The Scenes', ne: '📸 व्यक्तिगत पलहरू' },
];

export const PostsFeedView: React.FC<PostsFeedViewProps> = ({
  language,
  onBackToHome,
  onShowToast,
}) => {
  const [posts, setPosts] = useState<FeedPost[]>([]);
  const [loadingPosts, setLoadingPosts] = useState(true);
  const [currentUser, setCurrentUser] = useState<AdminUser | null>(null);

  // Composer State
  const [postContent, setPostContent] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('Article');
  const [imageFiles, setImageFiles] = useState<string[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showAdminLoginModal, setShowAdminLoginModal] = useState(false);
  const [adminPinInput, setAdminPinInput] = useState('');

  // Active Lightbox Image
  const [lightboxImage, setLightboxImage] = useState<string | null>(null);

  // Track liked posts by current visitor ID
  const [visitorId, setVisitorId] = useState<string>('');
  const [likedPostIds, setLikedPostIds] = useState<Record<string, boolean>>({});

  // Active comments drawer state (postId -> boolean)
  const [openComments, setOpenComments] = useState<Record<string, boolean>>({});

  const fileInputRef = useRef<HTMLInputElement>(null);

  // Initialize Visitor ID and test connection
  useEffect(() => {
    let vid = localStorage.getItem('rajababu_visitor_id');
    if (!vid) {
      vid = `guest_${Math.random().toString(36).substring(2, 9)}_${Date.now()}`;
      localStorage.setItem('rajababu_visitor_id', vid);
    }
    setVisitorId(vid);

    testFirestoreConnection();
  }, []);

  // Subscribe to Auth state
  useEffect(() => {
    const unsub = subscribeToAuth((user) => {
      setCurrentUser(user);
    });
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
        console.warn('Posts listener:', err);
        setLoadingPosts(false);
      }
    );
    return () => unsub();
  }, []);

  // Check which posts the visitor has liked
  useEffect(() => {
    if (!visitorId || posts.length === 0) return;
    posts.forEach(async (post) => {
      const liked = await checkUserLikedPost(post.id, visitorId);
      setLikedPostIds((prev) => ({ ...prev, [post.id]: liked }));
    });
  }, [posts, visitorId]);

  // Handle Google Login
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

  // Quick fallback Admin authentication
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
      onShowToast(
        language === 'NE' ? 'गलत पासकोड!' : 'Invalid admin passcode!',
        'error'
      );
    }
  };

  // Handle Image Upload Selection
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
      console.error('Image upload compression error:', err);
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

  // Submit Post
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
      await createFeedPost({
        authorId: currentUser?.uid || 'admin-rajababu',
        authorName: 'Rajababu Mehta',
        authorEmail: currentUser?.email || 'rajababum426@gmail.com',
        authorPhoto: '/assets/aistudio/hero_photo.jpg',
        content: postContent.trim(),
        images: imageFiles,
        category: selectedCategory,
      });

      setPostContent('');
      setImageFiles([]);
      onShowToast(
        language === 'NE' ? 'पोस्ट सफलतापूर्वक प्रकाशित भयो!' : 'Post published successfully to feed!',
        'success'
      );
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
    if (!window.confirm(language === 'NE' ? 'के तपाईं यो पोस्ट मेटाउन निश्चित हुनुहुन्छ?' : 'Are you sure you want to delete this post?')) {
      return;
    }
    try {
      await deleteFeedPost(postId);
      onShowToast(
        language === 'NE' ? 'पोस्ट हटाइयो।' : 'Post deleted successfully.',
        'info'
      );
    } catch (err) {
      onShowToast(
        language === 'NE' ? 'पोस्ट मेटाउन असफल भयो।' : 'Failed to delete post.',
        'error'
      );
    }
  };

  // Toggle Like
  const handleLikePost = async (postId: string) => {
    const isCurrentlyLiked = likedPostIds[postId];
    // Optimistic UI update
    setLikedPostIds((prev) => ({ ...prev, [postId]: !isCurrentlyLiked }));
    setPosts((prev) =>
      prev.map((p) =>
        p.id === postId
          ? { ...p, likesCount: Math.max(0, p.likesCount + (isCurrentlyLiked ? -1 : 1)) }
          : p
      )
    );

    try {
      const visitorName = currentUser?.displayName || 'Visitor';
      await toggleFeedPostLike(postId, visitorId, visitorName);
    } catch (err) {
      // Revert optimistic
      setLikedPostIds((prev) => ({ ...prev, [postId]: isCurrentlyLiked }));
      setPosts((prev) =>
        prev.map((p) =>
          p.id === postId
            ? { ...p, likesCount: Math.max(0, p.likesCount + (isCurrentlyLiked ? 1 : -1)) }
            : p
        )
      );
    }
  };

  // Share Post
  const handleSharePost = async (post: FeedPost) => {
    const shareUrl = window.location.href;
    const shareText = `${post.content.slice(0, 100)}... - Rajababu Mehta (Founder & CEO, AI Clipzone)`;

    if (navigator.share) {
      try {
        await navigator.share({
          title: 'Rajababu Mehta Feed Post',
          text: shareText,
          url: shareUrl,
        });
        return;
      } catch (err) {
        // Fallback to clipboard
      }
    }

    try {
      await navigator.clipboard.writeText(`${shareText}\n${shareUrl}`);
      onShowToast(
        language === 'NE' ? 'पोस्ट लिङ्क क्लिपबोर्डमा कपी भयो!' : 'Post link copied to clipboard!',
        'success'
      );
    } catch {
      onShowToast(
        language === 'NE' ? 'कपी गर्न सकिएन।' : 'Could not copy link.',
        'warning'
      );
    }
  };

  const isAdmin = isUserAdmin(currentUser);

  return (
    <div className="min-h-screen bg-[#0d0b0a] text-[#f6f3f2] font-sans selection:bg-[#e4342f] selection:text-white pb-24">
      {/* Top Sticky Navigation Bar */}
      <header className="sticky top-0 z-40 bg-[#141211]/90 backdrop-blur-md border-b border-[rgba(255,240,238,0.08)]">
        <div className="max-w-3xl mx-auto px-4 h-16 flex items-center justify-between">
          <button
            onClick={onBackToHome}
            className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-[rgba(255,255,255,0.05)] hover:bg-[#e4342f] hover:text-white transition-all text-sm font-semibold cursor-pointer border border-[rgba(255,240,238,0.1)]"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>{language === 'NE' ? 'गृहपृष्ठमा फर्कनुहोस्' : 'Back to Portfolio'}</span>
          </button>

          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-[#e4342f] animate-pulse"></span>
            <span className="text-xs uppercase tracking-wider font-bold text-[#ff8175]">
              {language === 'NE' ? 'आधिकारिक पोस्टहरू' : 'Official Feed'}
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
                <span>{language === 'NE' ? 'एडमिन लगइन' : 'Admin Post'}</span>
              </button>
            )}
          </div>
        </div>
      </header>

      {/* Main Feed Container */}
      <main className="max-w-2xl mx-auto px-4 pt-6 space-y-6">

        {/* Facebook-style Composer (Visible to Admin or with Access Prompt) */}
        {isAdmin ? (
          <div className="bg-[#171514] border border-[rgba(255,240,238,0.12)] rounded-2xl p-4 sm:p-5 shadow-xl">
            {/* Author Topline */}
            <div className="flex items-center gap-3 mb-3">
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
                  <span>Founder & CEO, AI Clipzone</span>
                  <span>·</span>
                  <span className="flex items-center gap-0.5 text-emerald-400">
                    <Globe className="w-3 h-3" /> Public
                  </span>
                </div>
              </div>
            </div>

            {/* Post Content Input */}
            <form onSubmit={handleCreatePost} className="space-y-3">
              <textarea
                value={postContent}
                onChange={(e) => setPostContent(e.target.value)}
                placeholder={
                  language === 'NE'
                    ? 'तपाईंको मनमा के छ राजाबाबु? (कुनै नयाँ लेख, विचार वा जानकारी लेख्नुहोस्...)'
                    : "What's on your mind, Rajababu? (Share an article, thought, or announcement...)"
                }
                rows={3}
                className="w-full bg-[#12100f] border border-[rgba(255,240,238,0.08)] focus:border-[#e4342f] rounded-xl p-3 text-sm text-[#f6f3f2] placeholder-[#f6f3f2]/40 resize-none outline-none transition-colors"
              />

              {/* Attached Photos Preview */}
              {imageFiles.length > 0 && (
                <div className="grid grid-cols-3 gap-2 pt-1">
                  {imageFiles.map((img, idx) => (
                    <div key={idx} className="relative group rounded-lg overflow-hidden border border-[rgba(255,240,238,0.1)] aspect-video bg-black">
                      <img src={img} alt="Preview" className="w-full h-full object-cover" />
                      <button
                        type="button"
                        onClick={() => handleRemoveImage(idx)}
                        className="absolute top-1 right-1 p-1 rounded-full bg-black/70 hover:bg-[#e4342f] text-white transition-colors cursor-pointer"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </div>
                  ))}
                </div>
              )}

              {/* Category Pills Selector */}
              <div className="flex flex-wrap items-center gap-1.5 pt-1">
                {CATEGORIES.map((cat) => (
                  <button
                    key={cat.id}
                    type="button"
                    onClick={() => setSelectedCategory(cat.id)}
                    className={`px-2.5 py-1 rounded-full text-xs font-medium transition-colors cursor-pointer border ${
                      selectedCategory === cat.id
                        ? 'bg-[#e4342f] text-white border-[#e4342f]'
                        : 'bg-[rgba(255,255,255,0.04)] text-[#f6f3f2]/70 border-[rgba(255,240,238,0.08)] hover:bg-[rgba(255,255,255,0.08)]'
                    }`}
                  >
                    {language === 'NE' ? cat.ne : cat.en}
                  </button>
                ))}
              </div>

              {/* Composer Action Toolbar */}
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
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[rgba(255,255,255,0.04)] hover:bg-[rgba(255,255,255,0.08)] text-xs font-semibold text-[#f6f3f2] border border-[rgba(255,240,238,0.08)] transition-colors cursor-pointer"
                  >
                    <ImageIcon className="w-4 h-4 text-emerald-400" />
                    <span>{language === 'NE' ? 'फोटो थप्नुहोस्' : 'Photo / Image'}</span>
                  </button>
                  <span className="text-[11px] text-[#f6f3f2]/40 hidden sm:inline">
                    {language === 'NE' ? 'डाटाबेसमा सुरक्षित हुन्छ' : 'Saved in Firestore'}
                  </span>
                </div>

                <button
                  type="submit"
                  disabled={isSubmitting || (!postContent.trim() && imageFiles.length === 0)}
                  className="px-5 py-2 rounded-xl bg-[#e4342f] hover:bg-[#c92823] disabled:opacity-40 disabled:cursor-not-allowed text-white text-xs font-bold tracking-wide transition-all flex items-center gap-1.5 shadow-lg shadow-[#e4342f]/20 cursor-pointer"
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                      <span>{language === 'NE' ? 'पोस्ट हुँदैछ...' : 'Posting...'}</span>
                    </>
                  ) : (
                    <>
                      <Send className="w-3.5 h-3.5" />
                      <span>{language === 'NE' ? 'पोस्ट गर्नुहोस्' : 'Post'}</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        ) : (
          /* Subtle Admin Hint for Rajababu */
          <div className="bg-[#171514]/60 border border-[rgba(255,240,238,0.08)] rounded-2xl p-4 flex items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <img
                src="/assets/aistudio/hero_photo.jpg"
                alt="Rajababu Mehta"
                className="w-10 h-10 rounded-full object-cover border border-[#e4342f]"
              />
              <div>
                <p className="text-xs font-semibold text-[#f6f3f2]">
                  {language === 'NE' ? 'राजाबाबु मेहताको आधिकारिक फिड' : "Rajababu Mehta's Official Feed"}
                </p>
                <p className="text-[11px] text-[#f6f3f2]/50">
                  {language === 'NE' ? 'नयाँ पोस्ट गर्न एडमिन लगइन गर्नुहोस्' : 'Sign in as admin to publish updates'}
                </p>
              </div>
            </div>
            <button
              onClick={() => setShowAdminLoginModal(true)}
              className="px-3 py-1.5 rounded-lg bg-[rgba(255,255,255,0.06)] hover:bg-[#e4342f] hover:text-white text-xs font-bold transition-all text-[#f6f3f2] cursor-pointer"
            >
              {language === 'NE' ? 'लगइन' : 'Sign In'}
            </button>
          </div>
        )}

        {/* Posts Feed List */}
        {loadingPosts ? (
          <div className="py-16 text-center space-y-3">
            <Loader2 className="w-8 h-8 text-[#e4342f] animate-spin mx-auto" />
            <p className="text-xs text-[#f6f3f2]/60">
              {language === 'NE' ? 'डाटाबेसबाट पोस्टहरू लोड हुँदैछ...' : 'Fetching posts from Firestore database...'}
            </p>
          </div>
        ) : posts.length === 0 ? (
          <div className="bg-[#171514] border border-[rgba(255,240,238,0.08)] rounded-2xl p-8 text-center space-y-4">
            <div className="w-14 h-14 rounded-full bg-[rgba(228,52,47,0.1)] border border-[rgba(228,52,47,0.2)] flex items-center justify-center mx-auto text-[#ff8175]">
              <Sparkles className="w-7 h-7" />
            </div>
            <div>
              <h3 className="text-base font-bold text-[#f6f3f2]">
                {language === 'NE' ? 'अहिलेसम्म कुनै पोस्ट छैन' : 'No Posts Yet'}
              </h3>
              <p className="text-xs text-[#f6f3f2]/60 max-w-sm mx-auto mt-1">
                {language === 'NE'
                  ? 'राजाबाबु मेहताले पहिलो पोस्ट गरेपछि यहाँ फेसबुक जस्तै देखिनेछ।'
                  : 'Posts published by Rajababu Mehta will appear here in Facebook-style feed with images and discussions.'}
              </p>
            </div>
            {isAdmin && (
              <button
                onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
                className="px-4 py-2 rounded-xl bg-[#e4342f] text-white text-xs font-bold cursor-pointer"
              >
                {language === 'NE' ? 'पहिलो पोस्ट गर्नुहोस्' : 'Write First Post'}
              </button>
            )}
          </div>
        ) : (
          posts.map((post) => (
            <PostCard
              key={post.id}
              post={post}
              language={language}
              isAdmin={isAdmin}
              isLiked={Boolean(likedPostIds[post.id])}
              commentsOpen={Boolean(openComments[post.id])}
              onToggleComments={() =>
                setOpenComments((prev) => ({ ...prev, [post.id]: !prev[post.id] }))
              }
              onLike={() => handleLikePost(post.id)}
              onShare={() => handleSharePost(post)}
              onDelete={() => handleDeletePost(post.id)}
              onOpenImage={(imgUrl) => setLightboxImage(imgUrl)}
              visitorId={visitorId}
              currentUser={currentUser}
              onShowToast={onShowToast}
            />
          ))
        )}
      </main>

      {/* Lightbox Fullscreen Modal */}
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
              alt="Enlarged view"
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
                  {language === 'NE' ? 'राजाबाबु मेहता एडमिन प्रमाणिकरण' : 'Rajababu Mehta Admin Verification'}
                </h3>
                <p className="text-xs text-[#f6f3f2]/60">
                  {language === 'NE' ? 'पोस्ट सिर्जना गर्न वा व्यवस्थापन गर्न लगइन गर्नुहोस्' : 'Sign in to create, edit or delete posts'}
                </p>
              </div>

              {/* 1-Click Google Sign-In */}
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
                <span>Sign in with Google (rajababum426@gmail.com)</span>
              </button>

              <div className="relative flex items-center justify-center">
                <div className="border-t border-[rgba(255,240,238,0.1)] w-full"></div>
                <span className="bg-[#171514] px-2 text-[10px] uppercase tracking-wider text-[#f6f3f2]/40 absolute">
                  {language === 'NE' ? 'वा गोप्य पिन' : 'or secret pin'}
                </span>
              </div>

              {/* Passcode alternative */}
              <form onSubmit={handleAdminPinSubmit} className="space-y-3">
                <input
                  type="password"
                  value={adminPinInput}
                  onChange={(e) => setAdminPinInput(e.target.value)}
                  placeholder={language === 'NE' ? 'एडमिन पिन हाल्नुहोस् (426)' : 'Enter admin pin (426)'}
                  className="w-full bg-[#12100f] border border-[rgba(255,240,238,0.12)] focus:border-[#e4342f] rounded-xl px-3 py-2.5 text-xs text-center text-[#f6f3f2] tracking-widest outline-none"
                />
                <button
                  type="submit"
                  className="w-full py-2.5 rounded-xl bg-[rgba(255,255,255,0.08)] hover:bg-[#e4342f] text-white text-xs font-bold transition-all cursor-pointer"
                >
                  {language === 'NE' ? 'प्रवेश गर्नुहोस्' : 'Unlock Admin Post'}
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
// INDIVIDUAL POST CARD (Facebook-style)
// ==========================================

interface PostCardProps {
  post: FeedPost;
  language: Language;
  isAdmin: boolean;
  isLiked: boolean;
  commentsOpen: boolean;
  onToggleComments: () => void;
  onLike: () => void;
  onShare: () => void;
  onDelete: () => void;
  onOpenImage: (imgUrl: string) => void;
  visitorId: string;
  currentUser: AdminUser | null;
  onShowToast: (message: string, type: 'success' | 'info' | 'warning' | 'error') => void;
}

const PostCard: React.FC<PostCardProps> = ({
  post,
  language,
  isAdmin,
  isLiked,
  commentsOpen,
  onToggleComments,
  onLike,
  onShare,
  onDelete,
  onOpenImage,
  visitorId,
  currentUser,
  onShowToast,
}) => {
  const [comments, setComments] = useState<PostComment[]>([]);
  const [commentText, setCommentText] = useState('');
  const [commenterName, setCommenterName] = useState(() => {
    return localStorage.getItem('rajababu_commenter_name') || '';
  });
  const [isSubmittingComment, setIsSubmittingComment] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);

  // Subscribe to comments when comment drawer is toggled open
  useEffect(() => {
    if (!commentsOpen) return;
    const unsub = subscribeToPostComments(post.id, (loaded) => {
      setComments(loaded);
    });
    return () => unsub();
  }, [commentsOpen, post.id]);

  const handleAddComment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!commentText.trim()) return;

    const nameToUse = currentUser?.displayName || commenterName.trim() || 'Visitor';
    localStorage.setItem('rajababu_commenter_name', nameToUse);

    setIsSubmittingComment(true);
    try {
      await addPostComment(post.id, {
        authorId: currentUser?.uid || visitorId,
        authorName: nameToUse,
        authorPhoto: currentUser?.photoURL || undefined,
        content: commentText.trim(),
      });
      setCommentText('');
    } catch (err) {
      onShowToast(
        language === 'NE' ? 'टिप्पणी थप्न सकिएन।' : 'Failed to post comment.',
        'error'
      );
    } finally {
      setIsSubmittingComment(false);
    }
  };

  // Format date relative or concise
  const formattedTime = (() => {
    try {
      const d = new Date(post.createdAt);
      if (isNaN(d.getTime())) return 'Recently';
      const now = new Date();
      const diffMs = now.getTime() - d.getTime();
      const diffMins = Math.floor(diffMs / 60000);
      const diffHours = Math.floor(diffMins / 60);
      const diffDays = Math.floor(diffHours / 24);

      if (diffMins < 1) return language === 'NE' ? 'भर्खरै' : 'Just now';
      if (diffMins < 60) return `${diffMins}m`;
      if (diffHours < 24) return `${diffHours}h`;
      if (diffDays < 7) return `${diffDays}d`;
      return d.toLocaleDateString(language === 'NE' ? 'ne-NP' : 'en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
      });
    } catch {
      return 'Recently';
    }
  })();

  const isLongContent = post.content.length > 280;
  const displayContent =
    isLongContent && !isExpanded ? `${post.content.slice(0, 280)}...` : post.content;

  return (
    <article className="bg-[#171514] border border-[rgba(255,240,238,0.1)] rounded-2xl shadow-xl overflow-hidden transition-all hover:border-[rgba(255,240,238,0.16)]">
      {/* Header: Author + Meta + Delete button */}
      <div className="p-4 sm:p-5 flex items-start justify-between gap-3">
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
                {formattedTime}
              </span>
              <span>·</span>
              <Globe className="w-3 h-3 text-[#f6f3f2]/40" />
            </div>
          </div>
        </div>

        {isAdmin && (
          <button
            onClick={onDelete}
            title="Delete post"
            className="p-1.5 rounded-lg text-stone-500 hover:text-rose-400 hover:bg-rose-950/30 transition-colors cursor-pointer"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        )}
      </div>

      {/* Body: Post text */}
      <div className="px-4 sm:px-5 pb-3">
        <p className="text-sm text-[#f6f3f2]/90 leading-relaxed whitespace-pre-line">
          {displayContent}
        </p>
        {isLongContent && (
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="mt-1 text-xs font-bold text-[#ff8175] hover:underline cursor-pointer"
          >
            {isExpanded
              ? language === 'NE'
                ? 'कम देखाउनुहोस्'
                : 'See less'
              : language === 'NE'
              ? 'थप पढ्नुहोस्'
              : 'See more'}
          </button>
        )}
      </div>

      {/* Body: Facebook-style Image Grid */}
      {post.images && post.images.length > 0 && (
        <div className="border-t border-b border-[rgba(255,240,238,0.06)] bg-black/40">
          {post.images.length === 1 ? (
            <div
              onClick={() => onOpenImage(post.images[0])}
              className="relative cursor-pointer group max-h-[520px] overflow-hidden flex items-center justify-center bg-black"
            >
              <img
                src={post.images[0]}
                alt="Post attachment"
                className="w-full max-h-[520px] object-cover group-hover:scale-[1.01] transition-transform duration-300"
              />
              <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                <span className="px-3 py-1.5 rounded-full bg-black/70 text-white text-xs font-medium flex items-center gap-1.5">
                  <Maximize2 className="w-3.5 h-3.5" /> Full View
                </span>
              </div>
            </div>
          ) : post.images.length === 2 ? (
            <div className="grid grid-cols-2 gap-1 bg-black">
              {post.images.map((img, i) => (
                <div
                  key={i}
                  onClick={() => onOpenImage(img)}
                  className="aspect-square cursor-pointer group relative overflow-hidden bg-black"
                >
                  <img
                    src={img}
                    alt={`Attachment ${i + 1}`}
                    className="w-full h-full object-cover group-hover:scale-[1.02] transition-transform duration-300"
                  />
                </div>
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-1 bg-black">
              {post.images.slice(0, 4).map((img, i) => (
                <div
                  key={i}
                  onClick={() => onOpenImage(img)}
                  className="aspect-square cursor-pointer group relative overflow-hidden bg-black"
                >
                  <img
                    src={img}
                    alt={`Attachment ${i + 1}`}
                    className="w-full h-full object-cover group-hover:scale-[1.02] transition-transform duration-300"
                  />
                  {i === 3 && post.images.length > 4 && (
                    <div className="absolute inset-0 bg-black/75 flex items-center justify-center text-white text-xl font-bold">
                      +{post.images.length - 4}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Engagement Counter Strip */}
      <div className="px-4 sm:px-5 py-2.5 flex items-center justify-between text-xs text-[#f6f3f2]/50 border-b border-[rgba(255,240,238,0.06)]">
        <div className="flex items-center gap-1.5">
          <span className="w-5 h-5 rounded-full bg-[#e4342f] flex items-center justify-center text-white text-[10px]">
            👍
          </span>
          <span className="font-medium text-[#f6f3f2]/70">
            {post.likesCount || 0} {language === 'NE' ? 'लाइक' : 'Likes'}
          </span>
        </div>

        <button
          onClick={onToggleComments}
          className="hover:underline cursor-pointer"
        >
          {post.commentsCount || comments.length || 0} {language === 'NE' ? 'टिप्पणीहरू' : 'Comments'}
        </button>
      </div>

      {/* Facebook-style Action Bar */}
      <div className="px-2 py-1.5 grid grid-cols-3 gap-1">
        <button
          onClick={onLike}
          className={`py-2 rounded-xl flex items-center justify-center gap-2 text-xs font-bold transition-all cursor-pointer ${
            isLiked
              ? 'text-[#e4342f] bg-[#e4342f]/10'
              : 'text-[#f6f3f2]/70 hover:bg-[rgba(255,255,255,0.05)] hover:text-[#f6f3f2]'
          }`}
        >
          <Heart className={`w-4 h-4 ${isLiked ? 'fill-[#e4342f] text-[#e4342f]' : ''}`} />
          <span>{language === 'NE' ? 'लाइक' : 'Like'}</span>
        </button>

        <button
          onClick={onToggleComments}
          className={`py-2 rounded-xl flex items-center justify-center gap-2 text-xs font-bold transition-all cursor-pointer ${
            commentsOpen
              ? 'text-[#ff8175] bg-[rgba(255,255,255,0.05)]'
              : 'text-[#f6f3f2]/70 hover:bg-[rgba(255,255,255,0.05)] hover:text-[#f6f3f2]'
          }`}
        >
          <MessageCircle className="w-4 h-4" />
          <span>{language === 'NE' ? 'टिप्पणी' : 'Comment'}</span>
        </button>

        <button
          onClick={onShare}
          className="py-2 rounded-xl flex items-center justify-center gap-2 text-xs font-bold text-[#f6f3f2]/70 hover:bg-[rgba(255,255,255,0.05)] hover:text-[#f6f3f2] transition-all cursor-pointer"
        >
          <Share2 className="w-4 h-4" />
          <span>{language === 'NE' ? 'सेयर' : 'Share'}</span>
        </button>
      </div>

      {/* Comments Section Drawer */}
      <AnimatePresence>
        {commentsOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="border-t border-[rgba(255,240,238,0.08)] bg-[#12100f] p-4 sm:p-5 space-y-4"
          >
            {/* New Comment Input */}
            <form onSubmit={handleAddComment} className="space-y-2">
              {!currentUser && (
                <input
                  type="text"
                  value={commenterName}
                  onChange={(e) => setCommenterName(e.target.value)}
                  placeholder={language === 'NE' ? 'तपाईंको नाम (वैकल्पिक)...' : 'Your name (optional)...'}
                  className="w-full bg-[#171514] border border-[rgba(255,240,238,0.08)] rounded-lg px-3 py-1.5 text-xs text-[#f6f3f2] placeholder-[#f6f3f2]/40 outline-none focus:border-[#e4342f]"
                />
              )}
              <div className="flex gap-2">
                <input
                  type="text"
                  value={commentText}
                  onChange={(e) => setCommentText(e.target.value)}
                  placeholder={
                    language === 'NE'
                      ? 'आफ्नो विचार वा प्रतिक्रिया लेख्नुहोस्...'
                      : 'Write a public comment...'
                  }
                  className="flex-1 bg-[#171514] border border-[rgba(255,240,238,0.08)] focus:border-[#e4342f] rounded-xl px-3.5 py-2 text-xs text-[#f6f3f2] placeholder-[#f6f3f2]/40 outline-none transition-colors"
                />
                <button
                  type="submit"
                  disabled={isSubmittingComment || !commentText.trim()}
                  className="px-3.5 py-2 rounded-xl bg-[#e4342f] hover:bg-[#c92823] disabled:opacity-40 text-white text-xs font-bold transition-all flex items-center justify-center cursor-pointer"
                >
                  <Send className="w-3.5 h-3.5" />
                </button>
              </div>
            </form>

            {/* Comments List */}
            {comments.length === 0 ? (
              <p className="text-center text-xs text-[#f6f3f2]/40 py-2">
                {language === 'NE' ? 'पहिलो टिप्पणी तपाईंको होस्!' : 'No comments yet. Be the first to comment!'}
              </p>
            ) : (
              <div className="space-y-2.5 max-h-80 overflow-y-auto pr-1">
                {comments.map((comm) => (
                  <div key={comm.id} className="flex items-start gap-2.5 text-xs">
                    <div className="w-7 h-7 rounded-full bg-[#e4342f]/20 border border-[#e4342f]/40 flex items-center justify-center text-[11px] font-bold text-[#ff8175] shrink-0">
                      {comm.authorName.charAt(0).toUpperCase()}
                    </div>
                    <div className="flex-1 bg-[#171514] rounded-xl p-2.5 border border-[rgba(255,240,238,0.06)]">
                      <div className="flex items-center justify-between gap-2 mb-1">
                        <span className="font-bold text-[#f6f3f2]">{comm.authorName}</span>
                        <span className="text-[10px] text-[#f6f3f2]/40">
                          {new Date(comm.createdAt).toLocaleTimeString([], {
                            hour: '2-digit',
                            minute: '2-digit',
                          })}
                        </span>
                      </div>
                      <p className="text-[#f6f3f2]/80 leading-relaxed whitespace-pre-wrap">
                        {comm.content}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </article>
  );
};
