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
} from 'lucide-react';
import { Language, AdminUser, ClipzoneImage, SystemSettings } from '../types';
import {
  loginAdmin,
  loginAsLocalAdmin,
  logoutAdmin,
  subscribeToAuth,
  uploadFileToFirebaseStorage,
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
}

export const AdminModal: React.FC<AdminModalProps> = ({
  isOpen,
  onClose,
  language,
  systemSettings,
  onShowToast,
}) => {
  const [currentUser, setCurrentUser] = useState<AdminUser | null>(null);
  const [activeTab, setActiveTab] = useState<'upload' | 'gallery' | 'settings'>('upload');

  // Login form state
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoggingIn, setIsLoggingIn] = useState(false);
  const [loginError, setLoginError] = useState('');

  // Image upload state
  const [uploadFile, setUploadFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string>('');
  const [imageTitle, setImageTitle] = useState('');
  const [imageTitleNe, setImageTitleNe] = useState('');
  const [imageCategory, setImageCategory] = useState('Technology');
  const [imageDesc, setImageDesc] = useState('');
  const [uploadProgress, setUploadProgress] = useState<number | null>(null);
  const [isUploading, setIsUploading] = useState(false);

  // Gallery items loaded from Firestore
  const [uploadedImages, setUploadedImages] = useState<ClipzoneImage[]>([]);
  const [isDeletingId, setIsDeletingId] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Listen to Auth state
  useEffect(() => {
    const unsubAuth = subscribeToAuth((user) => {
      setCurrentUser(user);
    });
    return () => unsubAuth();
  }, []);

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

  // File selection
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      onShowToast(
        language === 'NE' ? 'कृपया मान्य तस्बिर फाइल छान्नुहोस्।' : 'Please select a valid image file.',
        'error'
      );
      return;
    }

    setUploadFile(file);
    const objectUrl = URL.createObjectURL(file);
    setPreviewUrl(objectUrl);

    // Auto-populate title if empty
    if (!imageTitle) {
      const cleanName = file.name.replace(/\.[^/.]+$/, '').replace(/[-_]/g, ' ');
      setImageTitle(cleanName);
    }
  };

  // Upload to Firebase Storage & Firestore
  const handleUploadSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!uploadFile) {
      onShowToast(
        language === 'NE' ? 'कृपया अपलोड गर्न तस्बिर छान्नुहोस्।' : 'Please choose an image to upload.',
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

    setIsUploading(true);
    setUploadProgress(0);

    try {
      // 1. Upload file to Firebase Storage
      const uploadRes = await uploadFileToFirebaseStorage(
        uploadFile,
        'portfolio_gallery',
        (progress) => {
          setUploadProgress(progress);
        }
      );

      // 2. Save metadata to Firestore
      const newImage = await saveImageMetadataToFirestore({
        title: imageTitle.trim(),
        titleNe: imageTitleNe.trim() || undefined,
        description: imageDesc.trim() || undefined,
        descNe: imageDesc.trim() || undefined,
        imgUrl: uploadRes.downloadUrl,
        storagePath: uploadRes.storagePath,
        category: imageCategory,
        uploadDate: new Date().toISOString(),
        likes: 0,
        tags: [imageCategory.toLowerCase()],
        fileSize: uploadRes.fileSize,
        authorEmail: currentUser?.email || 'rajababum426@gmail.com',
        authorName: currentUser?.displayName || 'Rajababu Mehta',
      });

      onShowToast(
        language === 'NE'
          ? 'तस्बिर Firebase Storage र Firestore मा सफलतापूर्वक अपलोड भयो!'
          : 'Image successfully uploaded to Firebase Storage & Firestore!',
        'success'
      );

      // Reset form
      setUploadFile(null);
      setPreviewUrl('');
      setImageTitle('');
      setImageTitleNe('');
      setImageDesc('');
      setUploadProgress(null);
      if (fileInputRef.current) fileInputRef.current.value = '';

      // Switch to gallery to show newly uploaded item
      setActiveTab('gallery');
    } catch (err: any) {
      console.error('Firebase upload error:', err);
      onShowToast(
        err?.message || 'Failed to upload image to Firebase.',
        'error'
      );
    } finally {
      setIsUploading(false);
    }
  };

  // Delete image from Firebase Firestore & Storage
  const handleDeleteImage = async (img: ClipzoneImage) => {
    if (!confirm(language === 'NE' ? 'के तपाईँ यो तस्बिर हटाउन निश्चित हुनुहुन्छ?' : 'Are you sure you want to delete this image?')) {
      return;
    }

    setIsDeletingId(img.id);
    try {
      await deleteClipzoneImage(img.id, img.storagePath);
      onShowToast(
        language === 'NE' ? 'तस्बिर हटाइयो।' : 'Image removed from Firestore & Storage.',
        'info'
      );
    } catch (err: any) {
      console.error('Delete error:', err);
      onShowToast(err?.message || 'Failed to delete image.', 'error');
    } finally {
      setIsDeletingId(null);
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
                    <Upload className="w-4 h-4" />
                    {language === 'NE' ? 'नयाँ तस्बिर अपलोड' : 'Upload to Firebase Storage'}
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
                    {language === 'NE' ? `ग्यालरी (${uploadedImages.length})` : `Uploaded Images (${uploadedImages.length})`}
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
                    {language === 'NE' ? 'Firestore सेटिङहरू' : 'Firestore Sync'}
                  </button>
                </div>

                {/* Tab 1: Image Upload System */}
                {activeTab === 'upload' && (
                  <form onSubmit={handleUploadSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-5">
                    {/* Left: File Picker & Preview */}
                    <div className="space-y-4">
                      <div>
                        <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                          {language === 'NE' ? 'तस्बिर फाइल छान्नुहोस्' : 'Select Image File'}
                        </label>
                        <div
                          onClick={() => fileInputRef.current?.click()}
                          className="border-2 border-dashed border-slate-700 hover:border-blue-500/80 rounded-2xl p-6 text-center cursor-pointer bg-slate-950/50 transition-colors flex flex-col items-center justify-center min-h-[220px]"
                        >
                          {previewUrl ? (
                            <div className="relative w-full h-44 rounded-xl overflow-hidden bg-slate-900">
                              <img
                                src={previewUrl}
                                alt="Upload Preview"
                                className="w-full h-full object-contain"
                              />
                              <div className="absolute inset-0 bg-black/40 opacity-0 hover:opacity-100 transition-opacity flex items-center justify-center text-xs text-white font-medium">
                                {language === 'NE' ? 'अर्को तस्बिर छान्नुहोस्' : 'Click to change image'}
                              </div>
                            </div>
                          ) : (
                            <div className="space-y-2">
                              <div className="w-12 h-12 rounded-full bg-blue-500/10 text-blue-400 mx-auto flex items-center justify-center">
                                <Upload className="w-6 h-6" />
                              </div>
                              <p className="text-xs font-medium text-slate-300">
                                {language === 'NE'
                                  ? 'फाइल यहाँ ड्र्याग गर्नुहोस् वा छान्नुहोस्'
                                  : 'Click to select or drag & drop'}
                              </p>
                              <p className="text-[11px] text-slate-500">PNG, JPG, WEBP, GIF (Max 15MB)</p>
                            </div>
                          )}
                          <input
                            ref={fileInputRef}
                            type="file"
                            accept="image/*"
                            onChange={handleFileChange}
                            className="hidden"
                          />
                        </div>
                      </div>

                      {uploadProgress !== null && (
                        <div className="space-y-1.5">
                          <div className="flex justify-between text-xs text-slate-400">
                            <span>{language === 'NE' ? 'Storage मा अपलोड हुँदैछ...' : 'Uploading to Firebase Storage...'}</span>
                            <span className="font-mono text-blue-400">{uploadProgress}%</span>
                          </div>
                          <div className="w-full h-2 bg-slate-800 rounded-full overflow-hidden">
                            <div
                              className="h-full bg-blue-500 transition-all duration-200"
                              style={{ width: `${uploadProgress}%` }}
                            />
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Right: Metadata Inputs */}
                    <div className="space-y-4">
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
                          className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-slate-100 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
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
                          className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-slate-100 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-semibold text-slate-300 mb-1">
                          {language === 'NE' ? 'वर्ग (Category)' : 'Category'}
                        </label>
                        <select
                          value={imageCategory}
                          onChange={(e) => setImageCategory(e.target.value)}
                          className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-slate-100 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
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
                          {language === 'NE' ? 'विवरण' : 'Description'}
                        </label>
                        <textarea
                          value={imageDesc}
                          onChange={(e) => setImageDesc(e.target.value)}
                          rows={3}
                          placeholder="Add context or notes for this image..."
                          className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-slate-100 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                        />
                      </div>

                      <button
                        type="submit"
                        disabled={isUploading || !uploadFile}
                        className="w-full py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-medium text-sm flex items-center justify-center gap-2 shadow-lg shadow-emerald-600/30 transition-all disabled:opacity-50"
                      >
                        {isUploading ? (
                          <>
                            <Loader2 className="w-4 h-4 animate-spin" />
                            <span>{language === 'NE' ? 'अपलोड हुँदैछ...' : 'Uploading to Firebase...'}</span>
                          </>
                        ) : (
                          <>
                            <Upload className="w-4 h-4" />
                            <span>{language === 'NE' ? 'Firebase मा सुरक्षित गर्नुहोस्' : 'Upload to Firebase Storage & Firestore'}</span>
                          </>
                        )}
                      </button>
                    </div>
                  </form>
                )}

                {/* Tab 2: Gallery List */}
                {activeTab === 'gallery' && (
                  <div className="space-y-4">
                    {uploadedImages.length === 0 ? (
                      <div className="text-center py-12 text-slate-400 space-y-3">
                        <ImageIcon className="w-12 h-12 mx-auto text-slate-600" />
                        <p className="text-sm font-medium">
                          {language === 'NE'
                            ? 'हालसम्म Firestore मा कुनै तस्बिर छैन।'
                            : 'No images uploaded to Firestore collection yet.'}
                        </p>
                        <button
                          onClick={() => setActiveTab('upload')}
                          className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-medium transition-colors"
                        >
                          {language === 'NE' ? 'पहिलो तस्बिर अपलोड गर्नुहोस्' : 'Upload your first image'}
                        </button>
                      </div>
                    ) : (
                      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                        {uploadedImages.map((img) => (
                          <div
                            key={img.id}
                            className="group relative bg-slate-950 border border-slate-800 rounded-xl overflow-hidden flex flex-col"
                          >
                            <div className="h-40 overflow-hidden bg-slate-900 relative">
                              <img
                                src={img.imgUrl}
                                alt={img.title}
                                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                              />
                              <div className="absolute top-2 right-2 flex items-center gap-1">
                                <a
                                  href={img.imgUrl}
                                  target="_blank"
                                  rel="noreferrer"
                                  className="p-1.5 rounded-lg bg-black/60 hover:bg-black/90 text-white backdrop-blur-sm transition-colors"
                                  title="Open raw image"
                                >
                                  <ExternalLink className="w-3.5 h-3.5" />
                                </a>
                                <button
                                  onClick={() => handleDeleteImage(img)}
                                  disabled={isDeletingId === img.id}
                                  className="p-1.5 rounded-lg bg-rose-600/80 hover:bg-rose-600 text-white backdrop-blur-sm transition-colors disabled:opacity-50"
                                  title="Delete from Firebase"
                                >
                                  {isDeletingId === img.id ? (
                                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                                  ) : (
                                    <Trash2 className="w-3.5 h-3.5" />
                                  )}
                                </button>
                              </div>
                              <span className="absolute bottom-2 left-2 px-2 py-0.5 rounded-md bg-black/70 backdrop-blur-sm text-[10px] font-mono text-blue-300">
                                {img.category}
                              </span>
                            </div>

                            <div className="p-3 flex-1 flex flex-col justify-between">
                              <div>
                                <h4 className="font-semibold text-xs text-white truncate">{img.title}</h4>
                                {img.description && (
                                  <p className="text-[11px] text-slate-400 line-clamp-2 mt-1">{img.description}</p>
                                )}
                              </div>
                              <div className="mt-2 pt-2 border-t border-slate-800/80 flex items-center justify-between text-[10px] text-slate-500 font-mono">
                                <span>{new Date(img.uploadDate).toLocaleDateString()}</span>
                                <span className="text-amber-400">{img.likes || 0} likes</span>
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
                      <div>Storage Bucket: <span className="text-slate-200">{firebaseConfig.storageBucket}</span></div>
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
              Firebase SDK v12.18.0 • rajababu-mehta
            </span>
            <button
              onClick={onClose}
              className="px-3.5 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-medium transition-colors"
            >
              {language === 'NE' ? 'बन्द गर्नुहोस्' : 'Close'}
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
