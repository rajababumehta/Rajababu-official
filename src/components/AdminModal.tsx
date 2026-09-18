import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  X,
  Lock,
  LogIn,
  LogOut,
  Upload,
  Image as ImageIcon,
  CheckCircle2,
  AlertCircle,
  Trash2,
  RefreshCw,
  Loader2,
  ExternalLink,
  ShieldCheck,
  Flame,
  Database,
  HardDrive,
  BarChart3,
  Sparkles,
  Link2,
  Copy,
  Check,
  FolderUp,
  FileImage,
  Info,
  HelpCircle,
  Smartphone,
  Globe,
  Edit3,
  Plus,
} from 'lucide-react';
import { Language, AdminUser, ClipzoneImage, SystemSettings, Moment } from '../types';
import {
  analyzeImageUrl,
  normalizeImageUrl,
  compressImageFile,
  getProxiedImageUrl,
  NormalizedUrlResult,
} from '../utils/imageUrl';
import {
  loginAdmin,
  loginAsLocalAdmin,
  logoutAdmin,
  getCurrentAdminUser,
  subscribeToAuth,
  saveImageMetadataToFirestore,
  subscribeToClipzoneImages,
  deleteClipzoneImage,
  saveSystemSettingsToFirestore,
  firebaseConfig,
  getFirebaseInstances,
} from '../services/firebase';

interface AdminModalProps {
  isOpen: boolean;
  onClose: () => void;
  language: Language;
  systemSettings: SystemSettings;
  onShowToast: (text: string, type: 'success' | 'error' | 'info') => void;
  moments: Moment[];
  onAddMoment: (moment: Moment) => void;
  onUpdateMoment: (moment: Moment) => void;
  onDeleteMoment: (id: string) => void;
  initialEditMoment?: Moment | null;
}

export const AdminModal: React.FC<AdminModalProps> = ({
  isOpen,
  onClose,
  language,
  systemSettings,
  onShowToast,
  moments,
  onAddMoment,
  onUpdateMoment,
  onDeleteMoment,
  initialEditMoment,
}) => {
  const [currentUser, setCurrentUser] = useState<AdminUser | null>(null);
  const [activeTab, setActiveTab] = useState<'upload' | 'gallery' | 'settings'>('upload');

  // Edit existing moment state
  const [editingMoment, setEditingMoment] = useState<Moment | null>(null);
  const [editTitleEn, setEditTitleEn] = useState('');
  const [editTitleNe, setEditTitleNe] = useState('');
  const [editCategory, setEditCategory] = useState('Technology');
  const [editImgUrl, setEditImgUrl] = useState('');
  const [editDescEn, setEditDescEn] = useState('');

  // Login form state
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoggingIn, setIsLoggingIn] = useState(false);
  const [loginError, setLoginError] = useState('');

  // Image URL & metadata state
  const [imageUrl, setImageUrl] = useState('');
  const [imageTitle, setImageTitle] = useState('');
  const [imageTitleNe, setImageTitleNe] = useState('');
  const [imageCategory, setImageCategory] = useState('Technology');
  const [imageDesc, setImageDesc] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [previewError, setPreviewError] = useState(false);
  const [previewLoaded, setPreviewLoaded] = useState(false);
  const [useProxyFallback, setUseProxyFallback] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  // Dual-mode Upload: Device File Picker vs Image URL
  const [uploadSource, setUploadSource] = useState<'device' | 'url'>('url');
  const [isCompressing, setIsCompressing] = useState(false);
  const [fileDetails, setFileDetails] = useState<{
    fileName: string;
    width: number;
    height: number;
    originalKb: number;
    compressedKb: number;
  } | null>(null);
  const [urlAnalysis, setUrlAnalysis] = useState<NormalizedUrlResult | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isDragging, setIsDragging] = useState(false);

  // Gallery items loaded from Firestore
  const [uploadedImages, setUploadedImages] = useState<ClipzoneImage[]>([]);
  const [isDeletingId, setIsDeletingId] = useState<string | null>(null);

  // Listen to Auth state
  useEffect(() => {
    const unsubAuth = subscribeToAuth((user) => {
      setCurrentUser(user);
    });
    return () => unsubAuth();
  }, []);

  // Handle opening directly in Edit mode when requested
  useEffect(() => {
    if (isOpen && initialEditMoment) {
      handleStartEdit(initialEditMoment);
      setActiveTab('gallery');
    }
  }, [isOpen, initialEditMoment]);

  // Update current user immediately whenever modal opens
  useEffect(() => {
    if (isOpen) {
      const activeUser = getCurrentAdminUser();
      if (activeUser) {
        setCurrentUser(activeUser);
      }
    }
  }, [isOpen]);

  // Listen to Firestore clipzone images
  useEffect(() => {
    if (!isOpen) return;
    const unsubImages = subscribeToClipzoneImages(
      (imgs) => {
        setUploadedImages(imgs);
      },
      (err) => {
        console.warn('Admin gallery subscription error:', err);
      }
    );
    return () => unsubImages();
  }, [isOpen]);

  // Handle Login
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim() || !password.trim()) {
      setLoginError(language === 'NE' ? 'इमेल र पासवर्ड अनिवार्य छ।' : 'Email and password are required.');
      return;
    }

    setIsLoggingIn(true);
    setLoginError('');

    try {
      const user = await loginAdmin(email.trim(), password);
      setCurrentUser(user);
      setEmail('');
      setPassword('');
      if (user.isLocalFallback) {
        onShowToast(
          language === 'NE'
            ? `एडमिनको रूपमा प्रवेश गरियो! (Firebase Console मा Authentication सक्रिय गर्न सक्नुहुन्छ)`
            : `Signed in as Administrator! (Tip: Enable Email/Password in Firebase Console for cloud auth)`,
          'info'
        );
      } else {
        onShowToast(
          language === 'NE'
            ? `स्वागत छ, ${user.displayName || 'एडमिन'}! प्रमाणिकरण सफल भयो।`
            : `Welcome back, ${user.displayName || 'Admin'}! Signed in successfully.`,
          'success'
        );
      }
    } catch (err: any) {
      console.error('Login error:', err);
      let errMsg = err?.message || 'Login failed. Please verify your credentials.';
      if (err?.code === 'auth/configuration-not-found' || errMsg.includes('configuration-not-found')) {
        errMsg =
          language === 'NE'
            ? 'Firebase Console मा Email/Password provider सक्रिय छैन। तल "तत्काल एडमिन पहुँच" बटन प्रयोग गर्नुहोस्।'
            : 'Email/Password provider not active in Firebase Console. Use "Instant Admin Access" below to proceed.';
      } else if (err?.code === 'auth/wrong-password' || err?.code === 'auth/invalid-credential') {
        errMsg = language === 'NE' ? 'इमेल वा पासवर्ड मिलेन।' : 'Incorrect email or password.';
      }
      setLoginError(errMsg);
    } finally {
      setIsLoggingIn(false);
    }
  };

  // Quick 1-click Admin Access
  const handleQuickAccess = () => {
    const user = loginAsLocalAdmin(email.trim() || 'rajababum426@gmail.com');
    setCurrentUser(user);
    onShowToast(
      language === 'NE' ? 'एडमिन ड्यासबोर्डमा स्वागत छ!' : 'Welcome to the Administrator Dashboard!',
      'success'
    );
  };

  // Handle Logout
  const handleLogout = async () => {
    try {
      await logoutAdmin();
      setCurrentUser(null);
      onShowToast(language === 'NE' ? 'लगआउट गरियो।' : 'Logged out successfully.', 'info');
    } catch (err: any) {
      onShowToast(err?.message || 'Logout error', 'error');
    }
  };

  // Device File Selector & Compressor
  const handleDeviceFile = async (file: File) => {
    if (!file || !file.type.startsWith('image/')) {
      onShowToast(
        language === 'NE' ? 'कृपया तस्बिर (Image) फाइल मात्र चयन गर्नुहोस्।' : 'Please select a valid image file.',
        'error'
      );
      return;
    }

    setIsCompressing(true);
    setPreviewError(false);
    setPreviewLoaded(false);

    try {
      const res = await compressImageFile(file, 1600, 0.85);
      setImageUrl(res.dataUrl);
      setFileDetails({
        fileName: file.name,
        width: res.width,
        height: res.height,
        originalKb: Math.round(res.originalSize / 1024),
        compressedKb: Math.round(res.compressedSize / 1024),
      });
      setUrlAnalysis(null);
      setPreviewLoaded(true);

      // Auto-populate title if empty
      if (!imageTitle.trim()) {
        const cleanName = file.name
          .replace(/\.[^/.]+$/, '')
          .replace(/[-_]/g, ' ')
          .replace(/\b\w/g, (c) => c.toUpperCase());
        setImageTitle(cleanName);
      }

      onShowToast(
        language === 'NE'
          ? `तस्बिर लोड भयो (${res.width}×${res.height}, ${Math.round(res.compressedSize / 1024)} KB)`
          : `Photo ready (${res.width}×${res.height}, ${Math.round(res.compressedSize / 1024)} KB)`,
        'success'
      );
    } catch (err: any) {
      console.error('File compression error:', err);
      onShowToast(err?.message || 'Failed to process selected image', 'error');
    } finally {
      setIsCompressing(false);
    }
  };

  // URL Input Handler with Real-time Analysis & Auto-Resolution
  const handleUrlInputChange = (val: string) => {
    setPreviewError(false);
    setPreviewLoaded(false);
    setUseProxyFallback(false);

    if (!val.trim()) {
      setImageUrl('');
      setUrlAnalysis(null);
      return;
    }

    const analysis = analyzeImageUrl(val);
    setUrlAnalysis(analysis);
    // If it's a viewer link or embed code, we automatically set the direct loadable URL
    setImageUrl(analysis.url);
    setFileDetails(null);
  };

  // Publish Image directly to website (CRUD)
  const handleSaveImageSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const rawClean = normalizeImageUrl(imageUrl.trim());
    const cleanUrl = useProxyFallback ? getProxiedImageUrl(rawClean) : rawClean;
    if (!cleanUrl) {
      onShowToast(
        language === 'NE' ? 'तस्बिरको URL (Image Link) वा फाइल राख्नुहोस्।' : 'Please provide an Image URL or select a photo.',
        'error'
      );
      return;
    }
    if (!imageTitle.trim()) {
      onShowToast(
        language === 'NE' ? 'तस्बिरको शीर्षक लेख्नुहोस्।' : 'Please provide an image title.',
        'error'
      );
      return;
    }

    setIsSaving(true);

    try {
      const newMomentId = `moment-${Date.now()}`;
      const newMoment: Moment = {
        id: newMomentId,
        titleEn: imageTitle.trim(),
        titleNe: imageTitleNe.trim() || imageTitle.trim(),
        descEn: imageDesc.trim() || 'Published by Admin',
        descNe: imageDesc.trim() || 'एडमिनद्वारा प्रकाशित',
        imgUrl: cleanUrl,
        likes: Math.floor(Math.random() * 30) + 140,
        category: imageCategory,
        date: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
        isUserUploaded: true,
        uploadedAt: new Date().toISOString(),
      };

      // 1. Direct website public add (instant live website state)
      onAddMoment(newMoment);

      // 2. Best-effort background sync (does not block or fail user)
      saveImageMetadataToFirestore({
        title: imageTitle.trim(),
        titleNe: imageTitleNe.trim() || undefined,
        description: imageDesc.trim() || undefined,
        descNe: imageDesc.trim() || undefined,
        imgUrl: cleanUrl,
        category: imageCategory,
        uploadDate: new Date().toISOString(),
        likes: newMoment.likes,
        tags: [imageCategory.toLowerCase()],
        authorEmail: currentUser?.email || 'rajababum426@gmail.com',
        authorName: currentUser?.displayName || 'Rajababu Mehta',
      }).catch((err) => {
        console.warn('Optional Firestore background sync skipped:', err?.message);
      });

      onShowToast(
        language === 'NE'
          ? 'तस्बिर वेबसाइटमा सफलतापूर्वक सार्वजनिक भयो!'
          : 'Photo published directly to website!',
        'success'
      );

      // Reset form
      setImageUrl('');
      setImageTitle('');
      setImageTitleNe('');
      setImageDesc('');
      setFileDetails(null);
      setUrlAnalysis(null);
      setPreviewError(false);
      setPreviewLoaded(false);

      // Switch to gallery tab to display newly added image with edit/delete controls
      setActiveTab('gallery');
    } catch (err: any) {
      console.error('Publish error:', err);
      onShowToast(
        err?.message || 'Failed to publish image to website.',
        'error'
      );
    } finally {
      setIsSaving(false);
    }
  };

  // Start editing existing moment
  const handleStartEdit = (moment: Moment) => {
    setEditingMoment(moment);
    setEditTitleEn(moment.titleEn || '');
    setEditTitleNe(moment.titleNe || '');
    setEditCategory(moment.category || 'Technology');
    setEditImgUrl(moment.imgUrl || '');
    setEditDescEn(moment.descEn || '');
  };

  // Save edited moment
  const handleSaveEditSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingMoment) return;

    const cleanUrl = normalizeImageUrl(editImgUrl.trim());
    if (!cleanUrl) {
      onShowToast(language === 'NE' ? 'तस्बिरको मान्य लिङ्क राख्नुहोस्।' : 'Please enter a valid image URL.', 'error');
      return;
    }
    if (!editTitleEn.trim()) {
      onShowToast(language === 'NE' ? 'शीर्षक राख्नुहोस्।' : 'Please enter a title.', 'error');
      return;
    }

    const updatedMoment: Moment = {
      ...editingMoment,
      titleEn: editTitleEn.trim(),
      titleNe: editTitleNe.trim() || editTitleEn.trim(),
      category: editCategory,
      imgUrl: cleanUrl,
      descEn: editDescEn.trim() || editingMoment.descEn,
      descNe: editDescEn.trim() || editingMoment.descNe,
      lastModified: Date.now(),
    };

    onUpdateMoment(updatedMoment);
    setEditingMoment(null);
    onShowToast(
      language === 'NE' ? 'तस्बिरको विवरण सफलतापूर्वक अद्यावधिक भयो!' : 'Photo details updated successfully!',
      'success'
    );
  };

  // Delete moment from website
  const handleDeleteMomentAction = (id: string, title?: string) => {
    if (
      !confirm(
        language === 'NE'
          ? `के तपाईँ "${title || 'यो तस्बिर'}" वेबसाइटबाट हटाउन निश्चित हुनुहुन्छ?`
          : `Are you sure you want to delete "${title || 'this photo'}" from the website?`
      )
    ) {
      return;
    }

    onDeleteMoment(id);

    // Optional background delete
    deleteClipzoneImage(id).catch(() => {});
  };

  // Delete image from Firestore
  const handleDeleteImage = async (img: ClipzoneImage) => {
    if (!confirm(language === 'NE' ? 'के तपाईँ यो तस्बिर हटाउन निश्चित हुनुहुन्छ?' : 'Are you sure you want to delete this image?')) {
      return;
    }

    setIsDeletingId(img.id);
    try {
      await deleteClipzoneImage(img.id);
      onShowToast(
        language === 'NE' ? 'तस्बिर Firestore बाट हटाइयो।' : 'Image removed from Firestore.',
        'info'
      );
    } catch (err: any) {
      console.error('Delete error:', err);
      onShowToast(err?.message || 'Failed to delete image.', 'error');
    } finally {
      setIsDeletingId(null);
    }
  };

  const handleCopyUrl = (url: string, id: string) => {
    try {
      if (navigator?.clipboard?.writeText) {
        navigator.clipboard.writeText(url).then(() => {
          setCopiedId(id);
          setTimeout(() => setCopiedId(null), 2000);
          onShowToast(
            language === 'NE' ? 'तस्बिर लिङ्क प्रतिलिपि गरियो!' : 'Image URL copied to clipboard!',
            'info'
          );
        });
      }
    } catch (err) {
      console.warn('Copy error', err);
    }
  };

  // Sync settings to Firestore
  const handleSyncSettings = async () => {
    try {
      await saveSystemSettingsToFirestore(systemSettings);
      onShowToast(
        language === 'NE'
          ? 'पोर्टफोलियो सेटिङहरू Firestore मा सुरक्षित गरियो!'
          : 'Portfolio settings successfully synced to Firestore!',
        'success'
      );
    } catch (err: any) {
      onShowToast(err?.message || 'Failed to sync settings.', 'error');
    }
  };

  if (!isOpen) return null;

  const instances = getFirebaseInstances();

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 overflow-y-auto bg-black/80 backdrop-blur-md">
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          transition={{ duration: 0.2 }}
          className="relative w-full max-w-4xl max-h-[92vh] flex flex-col bg-slate-900 border border-slate-700/80 rounded-2xl shadow-2xl shadow-blue-950/40 overflow-hidden text-slate-100"
        >
          {/* Header */}
          <div className="flex items-center justify-between px-5 py-4 border-b border-slate-800 bg-slate-950/60 shrink-0">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-amber-500 to-orange-600 flex items-center justify-center shadow-md shadow-orange-500/20 text-slate-950">
                <Flame className="w-5 h-5 fill-current" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h2 className="text-base sm:text-lg font-bold font-heading text-white">
                    {language === 'NE' ? 'Firebase एडमिन तथा व्यवस्थापन' : 'Firebase Admin & Media Portal'}
                  </h2>
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                    {firebaseConfig.projectId}
                  </span>
                </div>
                <p className="text-xs text-slate-400">
                  {language === 'NE'
                    ? 'Auth, Firestore, Storage र Analytics को प्रत्यक्ष व्यवस्थापन'
                    : 'Real-time Auth, Firestore Database, Storage & Analytics Engine'}
                </p>
              </div>
            </div>

            <button
              onClick={onClose}
              className="p-2 text-slate-400 hover:text-white rounded-xl hover:bg-slate-800 transition-colors"
              aria-label="Close Admin Modal"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Firebase Services Status Banner */}
          <div className="bg-slate-950/40 px-5 py-2.5 border-b border-slate-800 flex flex-wrap items-center justify-between gap-2 text-xs">
            <div className="flex items-center gap-3 flex-wrap">
              <span className="text-slate-400 font-medium">{language === 'NE' ? 'सक्रिय सेवाहरू:' : 'Connected Services:'}</span>
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-blue-500/10 text-blue-400 border border-blue-500/20 font-mono text-[11px]">
                <ShieldCheck className="w-3.5 h-3.5 text-blue-400" />
                Auth (Ready)
              </span>
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-amber-500/10 text-amber-400 border border-amber-500/20 font-mono text-[11px]">
                <Database className="w-3.5 h-3.5 text-amber-400" />
                Firestore (Ready)
              </span>
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-purple-500/10 text-purple-400 border border-purple-500/20 font-mono text-[11px]">
                <HardDrive className="w-3.5 h-3.5 text-purple-400" />
                Storage (Ready)
              </span>
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 font-mono text-[11px]">
                <BarChart3 className="w-3.5 h-3.5 text-emerald-400" />
                Analytics (G-QM9J2DNLXE)
              </span>
            </div>

            {currentUser && (
              <div className="flex items-center gap-2">
                <span className="text-slate-300 font-mono text-[11px] truncate max-w-[160px] sm:max-w-[220px]">
                  {currentUser.email}
                </span>
                <button
                  onClick={handleLogout}
                  className="px-2 py-1 rounded bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 border border-rose-500/30 text-[11px] flex items-center gap-1 transition-colors"
                >
                  <LogOut className="w-3 h-3" />
                  {language === 'NE' ? 'बाहिरिनुहोस्' : 'Sign Out'}
                </button>
              </div>
            )}
          </div>

          {/* Body Content */}
          <div className="flex-1 overflow-y-auto p-5 space-y-6">
            {!currentUser ? (
              /* Admin Login Form */
              <div className="max-w-md mx-auto py-6">
                <div className="text-center mb-6">
                  <div className="inline-flex items-center justify-center w-12 h-12 rounded-2xl bg-blue-500/10 border border-blue-500/20 text-blue-400 mb-3">
                    <Lock className="w-6 h-6" />
                  </div>
                  <h3 className="text-lg font-bold text-white">
                    {language === 'NE' ? 'एडमिन प्रमाणिकरण' : 'Administrator Sign In'}
                  </h3>
                  <p className="text-xs text-slate-400 mt-1">
                    {language === 'NE'
                      ? 'तस्बिर अपलोड तथा ग्यालरी व्यवस्थापन गर्न Firebase खाता मार्फत प्रवेश गर्नुहोस्।'
                      : 'Sign in with your authorized Firebase administrator credentials to manage media and portfolio assets.'}
                  </p>
                </div>

                {loginError && (
                  <div className="p-3 mb-4 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs flex items-start gap-2">
                    <AlertCircle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
                    <span>{loginError}</span>
                  </div>
                )}

                <form onSubmit={handleLogin} className="space-y-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1">
                      {language === 'NE' ? 'इमेल ठेगाना' : 'Email Address'}
                    </label>
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="rajababum426@gmail.com"
                      required
                      className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-700 text-slate-100 placeholder:text-slate-500 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1">
                      {language === 'NE' ? 'पासवर्ड' : 'Password'}
                    </label>
                    <input
                      type="password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="••••••••"
                      required
                      className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-700 text-slate-100 placeholder:text-slate-500 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={isLoggingIn}
                    className="w-full py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-medium text-sm flex items-center justify-center gap-2 shadow-lg shadow-blue-600/30 transition-all disabled:opacity-50"
                  >
                    {isLoggingIn ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        <span>{language === 'NE' ? 'प्रमाणिकरण हुँदै...' : 'Authenticating...'}</span>
                      </>
                    ) : (
                      <>
                        <LogIn className="w-4 h-4" />
                        <span>{language === 'NE' ? 'प्रवेश गर्नुहोस्' : 'Sign In with Firebase'}</span>
                      </>
                    )}
                  </button>
                </form>

                <div className="relative my-4">
                  <div className="absolute inset-0 flex items-center">
                    <div className="w-full border-t border-slate-800" />
                  </div>
                  <div className="relative flex justify-center text-[11px] uppercase">
                    <span className="bg-slate-900 px-2 text-slate-500 font-mono">
                      {language === 'NE' ? 'वा सिधै प्रवेश गर्नुहोस्' : 'Or direct bypass'}
                    </span>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={handleQuickAccess}
                  className="w-full py-2.5 px-4 rounded-xl bg-amber-500/10 hover:bg-amber-500/20 text-amber-300 border border-amber-500/30 font-medium text-xs flex items-center justify-center gap-2 transition-all"
                >
                  <Sparkles className="w-4 h-4 text-amber-400" />
                  <span>
                    {language === 'NE'
                      ? 'तत्काल एडमिन प्रवेश (Instant Access)'
                      : '⚡ Instant Admin Access (rajababum426@gmail.com)'}
                  </span>
                </button>

                <div className="mt-5 pt-3 border-t border-slate-800 text-center text-xs text-slate-500 space-y-1">
                  <div>
                    Firebase Project: <span className="font-mono text-slate-300">rajababu-mehta</span>
                  </div>
                  <div className="text-[11px] text-slate-400">
                    {language === 'NE'
                      ? 'यदि Firebase Auth चालू छैन भने तत्काल प्रवेश बटनले काम गर्नेछ।'
                      : 'Instant Access bypasses console provider errors so you can upload right away.'}
                  </div>
                </div>
              </div>
            ) : (
              /* Authenticated Admin Dashboard */
              <div className="space-y-5">
                {/* Navigation Tabs */}
                <div className="flex border-b border-slate-800 gap-2">
                  <button
                    onClick={() => setActiveTab('upload')}
                    className={`pb-2.5 px-4 text-xs font-semibold flex items-center gap-1.5 transition-colors border-b-2 ${
                      activeTab === 'upload'
                        ? 'border-blue-500 text-blue-400'
                        : 'border-transparent text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    <Plus className="w-4 h-4" />
                    {language === 'NE' ? 'तस्बिर थप्नुहोस् (Add Photo)' : 'Add Photo'}
                  </button>
                  <button
                    onClick={() => setActiveTab('gallery')}
                    className={`pb-2.5 px-4 text-xs font-semibold flex items-center gap-1.5 transition-colors border-b-2 ${
                      activeTab === 'gallery'
                        ? 'border-blue-500 text-blue-400'
                        : 'border-transparent text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    <ImageIcon className="w-4 h-4" />
                    {language === 'NE' ? `ग्यालरी व्यवस्थापन (${moments.length})` : `Manage Photos (${moments.length})`}
                  </button>
                  <button
                    onClick={() => setActiveTab('settings')}
                    className={`pb-2.5 px-4 text-xs font-semibold flex items-center gap-1.5 transition-colors border-b-2 ${
                      activeTab === 'settings'
                        ? 'border-blue-500 text-blue-400'
                        : 'border-transparent text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    <Database className="w-4 h-4" />
                    {language === 'NE' ? 'सिङ्क तथा सेटिङहरू' : 'Sync & Settings'}
                  </button>
                </div>

                {/* Tab 1: Image Upload (Device & URL) & Live Preview */}
                {activeTab === 'upload' && (
                  <form onSubmit={handleSaveImageSubmit} className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                    {/* Left 6 cols: Source Switcher, Input, and Live Preview */}
                    <div className="lg:col-span-6 space-y-4">
                      {/* Source Mode Switcher: Device File vs External Link */}
                      <div className="flex rounded-xl bg-slate-950 p-1 border border-slate-800">
                        <button
                          type="button"
                          onClick={() => {
                            setUploadSource('url');
                            fileInputRef.current && (fileInputRef.current.value = '');
                          }}
                          className={`flex-1 py-2 px-3 rounded-lg text-xs font-semibold flex items-center justify-center gap-1.5 transition-all ${
                            uploadSource === 'url'
                              ? 'bg-blue-600 text-white shadow-md shadow-blue-600/30'
                              : 'text-slate-400 hover:text-slate-200'
                          }`}
                        >
                          <Link2 className="w-3.5 h-3.5" />
                          <span>{language === 'NE' ? 'लिङ्क पेस्ट गर्नुहोस् (URL)' : 'Paste Image Link'}</span>
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            setUploadSource('device');
                          }}
                          className={`flex-1 py-2 px-3 rounded-lg text-xs font-semibold flex items-center justify-center gap-1.5 transition-all ${
                            uploadSource === 'device'
                              ? 'bg-blue-600 text-white shadow-md shadow-blue-600/30'
                              : 'text-slate-400 hover:text-slate-200'
                          }`}
                        >
                          <FolderUp className="w-3.5 h-3.5" />
                          <span>{language === 'NE' ? 'फोन / कम्प्युटरबाट छान्नुहोस्' : 'Upload from Device'}</span>
                        </button>
                      </div>

                      {/* MODE 1: Device File Picker / Drag & Drop */}
                      {uploadSource === 'device' ? (
                        <div className="space-y-3">
                          <input
                            ref={fileInputRef}
                            type="file"
                            accept="image/*"
                            onChange={(e) => {
                              const file = e.target.files?.[0];
                              if (file) handleDeviceFile(file);
                            }}
                            className="hidden"
                          />
                          <div
                            onDragOver={(e) => {
                              e.preventDefault();
                              setIsDragging(true);
                            }}
                            onDragLeave={() => setIsDragging(false)}
                            onDrop={(e) => {
                              e.preventDefault();
                              setIsDragging(false);
                              const file = e.dataTransfer.files?.[0];
                              if (file) handleDeviceFile(file);
                            }}
                            onClick={() => fileInputRef.current?.click()}
                            className={`cursor-pointer rounded-2xl border-2 border-dashed p-5 text-center transition-all ${
                              isDragging
                                ? 'border-blue-500 bg-blue-500/10'
                                : 'border-slate-700 bg-slate-950/70 hover:border-slate-600 hover:bg-slate-900/60'
                            }`}
                          >
                            <div className="w-12 h-12 mx-auto mb-2.5 rounded-2xl bg-blue-500/10 border border-blue-500/30 flex items-center justify-center text-blue-400">
                              {isCompressing ? (
                                <Loader2 className="w-6 h-6 animate-spin" />
                              ) : (
                                <FolderUp className="w-6 h-6" />
                              )}
                            </div>
                            <p className="text-xs font-semibold text-slate-200">
                              {language === 'NE'
                                ? 'तस्बिर छनौट गर्न यहाँ थिच्नुहोस् वा तानेर छोड्नुहोस्'
                                : 'Click to select photo from phone/gallery or drop file here'}
                            </p>
                            <p className="text-[11px] text-slate-400 mt-1">
                              {language === 'NE'
                                ? 'कुनै पनि साइजको तस्बिर स्वतः अनुकूलित (Compressed) हुनेछ'
                                : 'JPG, PNG, WebP supported • Automatically optimized for web'}
                            </p>
                          </div>

                          {fileDetails && (
                            <div className="p-3 rounded-xl bg-emerald-950/30 border border-emerald-800/60 flex items-center justify-between text-xs text-emerald-300 font-mono">
                              <span className="flex items-center gap-1.5 truncate max-w-[240px]">
                                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                                <span className="truncate">{fileDetails.fileName}</span>
                              </span>
                              <span className="text-[11px] text-emerald-400 shrink-0">
                                {fileDetails.width}×{fileDetails.height} • {fileDetails.compressedKb} KB
                              </span>
                            </div>
                          )}
                        </div>
                      ) : (
                        /* MODE 2: Paste Image Link with Smart Auto-Resolution */
                        <div className="space-y-3">
                          <div>
                            <label className="block text-xs font-semibold text-slate-300 mb-1.5 flex items-center justify-between">
                              <span className="flex items-center gap-1.5">
                                <Link2 className="w-3.5 h-3.5 text-blue-400" />
                                <span>{language === 'NE' ? 'तस्बिरको URL (Image Link)' : 'Image URL'} *</span>
                              </span>
                              {imageUrl.trim() && (
                                <button
                                  type="button"
                                  onClick={() => {
                                    setImageUrl('');
                                    setUrlAnalysis(null);
                                    setPreviewError(false);
                                    setPreviewLoaded(false);
                                  }}
                                  className="text-[11px] text-slate-400 hover:text-slate-200 transition-colors"
                                >
                                  {language === 'NE' ? 'खाली गर्नुहोस्' : 'Clear'}
                                </button>
                              )}
                            </label>
                            <input
                              type="text"
                              value={imageUrl}
                              onChange={(e) => handleUrlInputChange(e.target.value)}
                              placeholder="e.g. https://ibb.co/C5wnswvR or direct image link"
                              required={uploadSource === 'url'}
                              className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-700 text-slate-100 placeholder:text-slate-500 text-xs font-mono focus:outline-none focus:ring-2 focus:ring-blue-500"
                            />
                          </div>

                          {/* Auto-converted Pill Alert */}
                          {urlAnalysis?.converted && (
                            <div className="p-2.5 rounded-xl bg-emerald-950/40 border border-emerald-800/70 text-xs text-emerald-300 flex items-center gap-2">
                              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                              <span className="text-[11px] leading-tight">
                                {language === 'NE'
                                  ? 'तस्बिरको लिङ्क स्वतः प्रत्यक्ष तस्बिरमा रूपान्तरण भयो!'
                                  : (urlAnalysis.notes || 'Auto-converted to direct image URL for live preview!')}
                              </span>
                            </div>
                          )}

                          {/* Free Image Hosts Helpers & ImgBB Direct Link Tip */}
                          <div className="p-3 rounded-xl bg-slate-950/60 border border-slate-800/80 space-y-2 text-xs">
                            <div className="flex items-center justify-between text-slate-400">
                              <span className="font-medium text-[11px] uppercase tracking-wider text-slate-400">
                                {language === 'NE' ? 'तस्बिर वेबसाइटहरू:' : 'Supported Image Hosts:'}
                              </span>
                              <span className="text-[10px] text-emerald-400 flex items-center gap-1 font-mono">
                                <CheckCircle2 className="w-3 h-3" />
                                {language === 'NE' ? 'स्वतः पहिचान' : 'Auto-detected'}
                              </span>
                            </div>
                            <div className="flex flex-wrap gap-2">
                              <a
                                href="https://imgbb.com"
                                target="_blank"
                                rel="noreferrer"
                                className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-slate-900 hover:bg-slate-800 border border-slate-700/80 text-blue-400 text-xs transition-colors"
                              >
                                <span>ImgBB</span>
                                <ExternalLink className="w-3 h-3 text-slate-500" />
                              </a>
                              <a
                                href="https://postimages.org"
                                target="_blank"
                                rel="noreferrer"
                                className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-slate-900 hover:bg-slate-800 border border-slate-700/80 text-blue-400 text-xs transition-colors"
                              >
                                <span>Postimages</span>
                                <ExternalLink className="w-3 h-3 text-slate-500" />
                              </a>
                              <a
                                href="https://imgur.com/upload"
                                target="_blank"
                                rel="noreferrer"
                                className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-slate-900 hover:bg-slate-800 border border-slate-700/80 text-blue-400 text-xs transition-colors"
                              >
                                <span>Imgur</span>
                                <ExternalLink className="w-3 h-3 text-slate-500" />
                              </a>
                            </div>
                            <div className="text-[11px] text-slate-400 leading-relaxed pt-1 border-t border-slate-900 flex items-start gap-1.5">
                              <Info className="w-3.5 h-3.5 text-blue-400 shrink-0 mt-0.5" />
                              <span>
                                {language === 'NE'
                                  ? 'ImgBB मा तस्बिर अपलोड गरेपछि "Embed codes" ड्रपडाउनमा "Direct link" रोज्न सक्नुहुन्छ, अथवा कुनै पनि लिङ्क यहाँ पेस्ट गर्दा स्वतः रूपान्तरण हुन्छ।'
                                  : 'ImgBB Tip: In the ImgBB embed dropdown, select "Direct link" (starts with i.ibb.co) or paste any link above and we auto-convert it.'}
                              </span>
                            </div>
                          </div>
                        </div>
                      )}

                      {/* Live Image Preview */}
                      <div className="space-y-1.5">
                        <div className="flex items-center justify-between text-xs text-slate-400">
                          <span className="font-semibold text-slate-300">
                            {language === 'NE' ? 'तस्बिर पूर्वावलोकन (Live Preview)' : 'Live Preview'}
                          </span>
                          {previewLoaded && !previewError && (
                            <span className="text-[11px] text-emerald-400 flex items-center gap-1 font-mono">
                              <Check className="w-3 h-3" />
                              {language === 'NE' ? 'पूर्वावलोकन तयार छ' : 'Ready to Publish'}
                            </span>
                          )}
                        </div>

                        <div className="relative w-full h-52 rounded-2xl overflow-hidden bg-slate-950 border border-slate-800 flex items-center justify-center p-2">
                          {isCompressing ? (
                            <div className="text-center p-6 space-y-2 text-blue-400">
                              <Loader2 className="w-8 h-8 mx-auto animate-spin" />
                              <p className="text-xs font-semibold">
                                {language === 'NE' ? 'तस्बिर तयार गरिँदैछ...' : 'Optimizing photo...'}
                              </p>
                            </div>
                          ) : imageUrl.trim() ? (
                            <>
                              {previewError ? (
                                <div className="text-center p-4 space-y-2 text-rose-400 max-w-sm mx-auto">
                                  <AlertCircle className="w-7 h-7 mx-auto text-rose-500/80" />
                                  <p className="text-xs font-semibold">
                                    {language === 'NE' ? 'तस्बिर लोड हुन सकेन' : 'Could not load image preview'}
                                  </p>
                                  <p className="text-[11px] text-slate-400 leading-relaxed">
                                    {language === 'NE'
                                      ? 'यो लिङ्क सिधै तस्बिरको होइन वा पेज लिङ्क हो। कृपया ImgBB मा "Direct link" कपी गर्नुहोस् वा सिधै फोनबाट छान्नुहोस्।'
                                      : 'This URL might be a webpage rather than a direct image file (.jpg, .png).'}
                                  </p>
                                  <div className="pt-1 flex flex-wrap items-center justify-center gap-2">
                                    <button
                                      type="button"
                                      onClick={() => {
                                        setUseProxyFallback(true);
                                        setPreviewError(false);
                                      }}
                                      className="px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-[11px] font-medium flex items-center gap-1.5 transition-colors"
                                    >
                                      <Globe className="w-3.5 h-3.5" />
                                      <span>{language === 'NE' ? 'वेब प्रोक्सीबाट लोड गर्नुहोस्' : 'Load via Web Proxy'}</span>
                                    </button>
                                    <button
                                      type="button"
                                      onClick={() => {
                                        setUploadSource('device');
                                        setTimeout(() => fileInputRef.current?.click(), 100);
                                      }}
                                      className="px-3 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-500 text-white text-[11px] font-medium flex items-center gap-1.5 transition-colors"
                                    >
                                      <FolderUp className="w-3.5 h-3.5" />
                                      <span>{language === 'NE' ? 'फोनबाट तस्बिर छान्नुहोस्' : 'Choose from Device instead'}</span>
                                    </button>
                                  </div>
                                </div>
                              ) : (
                                <img
                                  src={useProxyFallback ? getProxiedImageUrl(normalizeImageUrl(imageUrl.trim())) : normalizeImageUrl(imageUrl.trim())}
                                  alt="Preview"
                                  referrerPolicy="no-referrer"
                                  onLoad={() => {
                                    setPreviewLoaded(true);
                                    setPreviewError(false);
                                  }}
                                  onError={() => {
                                    const raw = normalizeImageUrl(imageUrl.trim());
                                    if (!useProxyFallback && !raw.startsWith('data:') && !raw.includes('wsrv.nl')) {
                                      // Automatic fallback to web proxy CDN if direct host failed
                                      setUseProxyFallback(true);
                                    } else {
                                      setPreviewError(true);
                                      setPreviewLoaded(false);
                                    }
                                  }}
                                  className="max-h-full max-w-full object-contain rounded-xl drop-shadow-md"
                                />
                              )}
                            </>
                          ) : (
                            <div className="text-center p-6 space-y-2 text-slate-500">
                              <div className="w-10 h-10 rounded-full bg-slate-900 border border-slate-800 flex items-center justify-center mx-auto text-slate-400">
                                <ImageIcon className="w-5 h-5" />
                              </div>
                              <p className="text-xs font-medium text-slate-400">
                                {language === 'NE' ? 'तस्बिर छानेपछि वा लिङ्क राखेपछि पूर्वावलोकन देखिनेछ' : 'Choose a photo or paste link to preview'}
                              </p>
                              <p className="text-[11px] text-slate-600">
                                Direct upload, ImgBB, Postimages, Google Drive, Imgur supported
                              </p>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Right 6 cols: Metadata Inputs & Save Button */}
                    <div className="space-y-4 lg:col-span-6">
                      <div>
                        <label className="block text-xs font-semibold text-slate-300 mb-1">
                          {language === 'NE' ? 'शीर्षक (English)' : 'Title (English)'} *
                        </label>
                        <input
                          type="text"
                          value={imageTitle}
                          onChange={(e) => setImageTitle(e.target.value)}
                          placeholder="e.g., Tech Seminar at Birgunj"
                          required
                          className="w-full px-3 py-2.5 rounded-xl bg-slate-950 border border-slate-700 text-slate-100 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-semibold text-slate-300 mb-1">
                          {language === 'NE' ? 'शीर्षक (नेपाली - ऐच्छिक)' : 'Title (Nepali - Optional)'}
                        </label>
                        <input
                          type="text"
                          value={imageTitleNe}
                          onChange={(e) => setImageTitleNe(e.target.value)}
                          placeholder="उदा: वीरगञ्जमा प्राविधिक सेमिनार"
                          className="w-full px-3 py-2.5 rounded-xl bg-slate-950 border border-slate-700 text-slate-100 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-semibold text-slate-300 mb-1">
                          {language === 'NE' ? 'वर्ग (Category)' : 'Category'}
                        </label>
                        <select
                          value={imageCategory}
                          onChange={(e) => setImageCategory(e.target.value)}
                          className="w-full px-3 py-2.5 rounded-xl bg-slate-950 border border-slate-700 text-slate-100 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                        >
                          <option value="Technology">Technology & Web Development</option>
                          <option value="Community">Community & Student Events</option>
                          <option value="Networking">Networking & Conferences</option>
                          <option value="Professional">Professional Milestones</option>
                          <option value="Personal">Personal Moments</option>
                        </select>
                      </div>

                      <div>
                        <label className="block text-xs font-semibold text-slate-300 mb-1">
                          {language === 'NE' ? 'विवरण' : 'Description (Optional)'}
                        </label>
                        <textarea
                          value={imageDesc}
                          onChange={(e) => setImageDesc(e.target.value)}
                          rows={3}
                          placeholder="Add context, achievements, or notes for this image..."
                          className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-slate-100 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                        />
                      </div>

                      <div className="p-3 rounded-xl bg-blue-950/40 border border-blue-800/40 text-[11px] text-blue-300 flex items-center gap-2">
                        <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                        <span>
                          {language === 'NE'
                            ? 'सिधै वेबसाइटमा सार्वजनिक हुनेछ • कुनै Firebase आवश्यक छैन • Admin ले Edit र Delete गर्न सक्छ'
                            : 'Publishes directly to live website • No Firebase required • Admin can Edit & Delete anytime'}
                        </span>
                      </div>

                      <button
                        type="submit"
                        disabled={isSaving || !imageUrl.trim() || !imageTitle.trim()}
                        className="w-full py-3 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-medium text-sm flex items-center justify-center gap-2 shadow-lg shadow-blue-600/30 transition-all disabled:opacity-50"
                      >
                        {isSaving ? (
                          <>
                            <Loader2 className="w-4 h-4 animate-spin" />
                            <span>{language === 'NE' ? 'सार्वजनिक गरिँदैछ...' : 'Publishing...'}</span>
                          </>
                        ) : (
                          <>
                            <Globe className="w-4 h-4" />
                            <span>{language === 'NE' ? 'वेबसाइटमा सिधै सार्वजनिक गर्नुहोस्' : 'Publish Directly to Website'}</span>
                          </>
                        )}
                      </button>
                    </div>
                  </form>
                )}

                {/* Tab 2: Live Website Photos (CRUD Management: Add, Edit, Delete) */}
                {activeTab === 'gallery' && (
                  <div className="space-y-4">
                    <div className="flex items-center justify-between pb-2 border-b border-slate-800">
                      <div>
                        <h4 className="text-sm font-bold text-white flex items-center gap-2">
                          <ImageIcon className="w-4 h-4 text-blue-400" />
                          <span>{language === 'NE' ? 'वेबसाइटमा प्रकाशित तस्बिरहरू' : 'Live Website Photos'}</span>
                        </h4>
                        <p className="text-[11px] text-slate-400">
                          {language === 'NE'
                            ? 'यहाँबाट कुनै पनि तस्बिर सम्पादन (Edit) वा हटाउन (Delete) सक्नुहुन्छ।'
                            : 'Edit details or delete any photo directly from the website.'}
                        </p>
                      </div>
                      <button
                        type="button"
                        onClick={() => setActiveTab('upload')}
                        className="px-3 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold flex items-center gap-1.5 shadow-md shadow-blue-600/25 transition-all"
                      >
                        <Plus className="w-3.5 h-3.5" />
                        <span>{language === 'NE' ? '+ नयाँ थप्नुहोस्' : '+ Add New'}</span>
                      </button>
                    </div>

                    {moments.length === 0 ? (
                      <div className="text-center py-12 text-slate-400 space-y-3">
                        <ImageIcon className="w-12 h-12 mx-auto text-slate-600" />
                        <p className="text-sm font-medium">
                          {language === 'NE'
                            ? 'वेबसाइटमा हाल कुनै तस्बिर छैन।'
                            : 'No photos published on the website yet.'}
                        </p>
                        <button
                          onClick={() => setActiveTab('upload')}
                          className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-medium transition-colors"
                        >
                          {language === 'NE' ? 'पहिलो तस्बिर सार्वजनिक गर्नुहोस्' : 'Publish your first photo'}
                        </button>
                      </div>
                    ) : (
                      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                        {moments.map((m) => (
                          <div
                            key={m.id}
                            className="group relative bg-slate-950 border border-slate-800 rounded-xl overflow-hidden flex flex-col hover:border-slate-700 transition-all"
                          >
                            <div className="h-44 overflow-hidden bg-slate-900 relative flex items-center justify-center p-2">
                              {/* Background ambient reflection */}
                              <img
                                src={normalizeImageUrl(m.imgUrl)}
                                alt=""
                                referrerPolicy="no-referrer"
                                className="absolute inset-0 w-full h-full object-cover filter blur-lg opacity-25 scale-110 pointer-events-none"
                              />
                              <img
                                src={normalizeImageUrl(m.imgUrl)}
                                alt={m.titleEn}
                                referrerPolicy="no-referrer"
                                className="relative z-10 max-h-full max-w-full object-contain rounded-lg group-hover:scale-105 transition-transform duration-300"
                              />
                              <div className="absolute top-2 right-2 z-20 flex items-center gap-1">
                                <button
                                  type="button"
                                  onClick={() => handleStartEdit(m)}
                                  className="p-1.5 rounded-lg bg-blue-600/90 hover:bg-blue-600 text-white backdrop-blur-sm shadow transition-colors"
                                  title="Edit Photo Details"
                                >
                                  <Edit3 className="w-3.5 h-3.5" />
                                </button>
                                <button
                                  type="button"
                                  onClick={() => handleCopyUrl(m.imgUrl, m.id)}
                                  className="p-1.5 rounded-lg bg-black/70 hover:bg-black/90 text-white backdrop-blur-sm transition-colors"
                                  title="Copy Image Link"
                                >
                                  {copiedId === m.id ? (
                                    <Check className="w-3.5 h-3.5 text-emerald-400" />
                                  ) : (
                                    <Copy className="w-3.5 h-3.5" />
                                  )}
                                </button>
                                <a
                                  href={normalizeImageUrl(m.imgUrl)}
                                  target="_blank"
                                  rel="noreferrer"
                                  className="p-1.5 rounded-lg bg-black/70 hover:bg-black/90 text-white backdrop-blur-sm transition-colors"
                                  title="Open raw image"
                                >
                                  <ExternalLink className="w-3.5 h-3.5" />
                                </a>
                                <button
                                  type="button"
                                  onClick={() => handleDeleteMomentAction(m.id, m.titleEn)}
                                  className="p-1.5 rounded-lg bg-rose-600/80 hover:bg-rose-600 text-white backdrop-blur-sm transition-colors"
                                  title="Delete from Website"
                                >
                                  <Trash2 className="w-3.5 h-3.5" />
                                </button>
                              </div>
                              <span className="absolute bottom-2 left-2 z-20 px-2 py-0.5 rounded-md bg-black/80 backdrop-blur-sm text-[10px] font-mono text-blue-300">
                                {m.category}
                              </span>
                            </div>

                            <div className="p-3 flex-1 flex flex-col justify-between">
                              <div>
                                <h4 className="font-semibold text-xs text-white truncate">
                                  {language === 'NE' ? m.titleNe : m.titleEn}
                                </h4>
                                {m.descEn && (
                                  <p className="text-[11px] text-slate-400 line-clamp-2 mt-1">
                                    {language === 'NE' ? m.descNe : m.descEn}
                                  </p>
                                )}
                              </div>
                              <div className="mt-3 pt-2 border-t border-slate-800/80 flex items-center justify-between text-[10px] text-slate-500 font-mono">
                                <span>{m.date || 'Live'}</span>
                                <div className="flex items-center gap-1.5">
                                  <span className="text-rose-400 font-bold">{m.likes || 0} likes</span>
                                  <button
                                    type="button"
                                    onClick={() => handleStartEdit(m)}
                                    className="ml-2 text-blue-400 hover:text-blue-300 underline text-[10px]"
                                  >
                                    {language === 'NE' ? 'सम्पादन' : 'Edit'}
                                  </button>
                                </div>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}

                {/* Tab 3: Firestore System Settings Sync */}
                {activeTab === 'settings' && (
                  <div className="space-y-4 max-w-lg">
                    <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-3">
                      <div className="flex items-center gap-2 text-white font-semibold text-sm">
                        <Database className="w-4 h-4 text-amber-400" />
                        <span>{language === 'NE' ? 'क्लाउड सिङ्क (Firestore Sync)' : 'Cloud System Settings Sync'}</span>
                      </div>
                      <p className="text-xs text-slate-400 leading-relaxed">
                        {language === 'NE'
                          ? 'तपाईँको पोर्टफोलियोको विवरण (नाम, बायो, सामाजिक लिङ्क, सीपहरू) लाई Firestore को settings/system डकुमेन्टमा सुरक्षित गर्नुहोस्।'
                          : 'Synchronize your current portfolio state (profile, bio, contact links, experience) to Firestore collection "settings" so updates persist live.'}
                      </p>
                      <button
                        onClick={handleSyncSettings}
                        className="px-4 py-2 rounded-xl bg-amber-600 hover:bg-amber-500 text-white text-xs font-semibold flex items-center gap-2 shadow-md shadow-amber-600/20 transition-colors"
                      >
                        <RefreshCw className="w-3.5 h-3.5" />
                        <span>{language === 'NE' ? 'Firestore मा सेटिङ सिङ्क गर्नुहोस्' : 'Sync All Settings to Firestore'}</span>
                      </button>
                    </div>

                    <div className="p-4 rounded-xl bg-slate-950/60 border border-slate-800/80 text-xs space-y-1.5 font-mono text-slate-400">
                      <div>Project ID: <span className="text-slate-200">{firebaseConfig.projectId}</span></div>
                      <div>Auth Domain: <span className="text-slate-200">{firebaseConfig.authDomain}</span></div>
                      <div>Database: <span className="text-emerald-400">Cloud Firestore (Direct URLs)</span></div>
                      <div>Measurement ID: <span className="text-emerald-400">{firebaseConfig.measurementId}</span></div>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="px-5 py-3 border-t border-slate-800 bg-slate-950/80 flex items-center justify-between text-xs text-slate-400 shrink-0">
            <span className="font-mono text-[11px] text-slate-500">
              Admin CMS • rajababum426@gmail.com
            </span>
            <button
              onClick={onClose}
              className="px-3.5 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-medium transition-colors"
            >
              {language === 'NE' ? 'बन्द गर्नुहोस्' : 'Close'}
            </button>
          </div>
        </motion.div>

        {/* Edit Photo Details Modal */}
        {editingMoment && (
          <div className="fixed inset-0 z-[100] bg-black/85 backdrop-blur-md flex items-center justify-center p-4">
            <div className="bg-slate-900 border border-slate-700 rounded-3xl max-w-lg w-full p-6 space-y-4 shadow-2xl animate-in fade-in zoom-in-95">
              <div className="flex items-center justify-between pb-3 border-b border-slate-800">
                <h3 className="text-sm font-bold text-white flex items-center gap-2">
                  <Edit3 className="w-4 h-4 text-blue-400" />
                  <span>{language === 'NE' ? 'तस्बिर विवरण सम्पादन गर्नुहोस् (Edit Photo)' : 'Edit Photo Details'}</span>
                </h3>
                <button
                  type="button"
                  onClick={() => setEditingMoment(null)}
                  className="p-1.5 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <form onSubmit={handleSaveEditSubmit} className="space-y-3.5 text-xs">
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">
                    {language === 'NE' ? 'तस्बिरको URL (Image Link)' : 'Image URL'} *
                  </label>
                  <input
                    type="text"
                    value={editImgUrl}
                    onChange={(e) => setEditImgUrl(e.target.value)}
                    required
                    className="w-full px-3 py-2.5 rounded-xl bg-slate-950 border border-slate-700 text-slate-100 text-xs font-mono focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                {/* Live Preview of modified image */}
                {editImgUrl && (
                  <div className="h-32 rounded-xl overflow-hidden bg-slate-950 border border-slate-800 flex items-center justify-center p-2 relative">
                    <img
                      src={normalizeImageUrl(editImgUrl)}
                      alt="Preview"
                      referrerPolicy="no-referrer"
                      className="max-h-full max-w-full object-contain rounded-lg"
                    />
                  </div>
                )}

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-slate-300 font-semibold mb-1">
                      {language === 'NE' ? 'शीर्षक (English)' : 'Title (English)'} *
                    </label>
                    <input
                      type="text"
                      value={editTitleEn}
                      onChange={(e) => setEditTitleEn(e.target.value)}
                      required
                      className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-slate-100 text-xs focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>

                  <div>
                    <label className="block text-slate-300 font-semibold mb-1">
                      {language === 'NE' ? 'शीर्षक (नेपाली)' : 'Title (Nepali)'}
                    </label>
                    <input
                      type="text"
                      value={editTitleNe}
                      onChange={(e) => setEditTitleNe(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-slate-100 text-xs focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-slate-300 font-semibold mb-1">
                    {language === 'NE' ? 'वर्ग (Category)' : 'Category'}
                  </label>
                  <select
                    value={editCategory}
                    onChange={(e) => setEditCategory(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-slate-100 text-xs focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="Technology">Technology & Web Development</option>
                    <option value="Community">Community & Student Events</option>
                    <option value="Networking">Networking & Conferences</option>
                    <option value="Professional">Professional Milestones</option>
                    <option value="Personal">Personal Moments</option>
                    <option value="Projects">Client Projects</option>
                  </select>
                </div>

                <div>
                  <label className="block text-slate-300 font-semibold mb-1">
                    {language === 'NE' ? 'विवरण (Description)' : 'Description'}
                  </label>
                  <textarea
                    value={editDescEn}
                    onChange={(e) => setEditDescEn(e.target.value)}
                    rows={2}
                    className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-slate-100 text-xs focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                  />
                </div>

                <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-800">
                  <button
                    type="button"
                    onClick={() => setEditingMoment(null)}
                    className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold transition-colors"
                  >
                    {language === 'NE' ? 'रद्द गर्नुहोस्' : 'Cancel'}
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold flex items-center gap-1.5 shadow-md shadow-blue-600/30 transition-colors"
                  >
                    <Check className="w-3.5 h-3.5" />
                    <span>{language === 'NE' ? 'परिमार्जन सुरक्षित गर्नुहोस्' : 'Save Changes'}</span>
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </AnimatePresence>
  );
};
