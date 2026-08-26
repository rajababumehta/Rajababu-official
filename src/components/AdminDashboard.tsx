import React, { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  X,
  Upload,
  Image as ImageIcon,
  Database,
  HardDrive,
  Flame,
  CheckCircle2,
  Trash2,
  Edit3,
  ExternalLink,
  Copy,
  Search,
  Filter,
  Plus,
  RefreshCw,
  LogOut,
  Shield,
  Key,
  Layers,
  Heart,
  Calendar,
  Tag,
  AlertTriangle,
  Info,
  Sparkles,
  LayoutGrid,
  List,
  User,
  Camera,
  Loader2,
} from 'lucide-react';
import { ClipzoneImage, AdminUser, Language, ProfileSettings } from '../types';
import {
  uploadFileToFirebaseStorage,
  uploadProfilePhoto,
  saveImageMetadataToFirestore,
  deleteClipzoneImage,
  updateClipzoneImage,
  getFirebaseInstances,
  getStoredFirebaseConfig,
  isFirebaseConfigValid,
  logoutAdmin,
} from '../services/firebase';
import { generateLikesFromPreset, formatLikes } from '../utils/likesFormatter';

interface AdminDashboardProps {
  isOpen: boolean;
  onClose: () => void;
  language: Language;
  adminUser: AdminUser | null;
  images: ClipzoneImage[];
  onImagesChange?: (images: ClipzoneImage[]) => void;
  onOpenFirebaseConfig: () => void;
  onShowToast: (text: string, type: 'success' | 'error' | 'info') => void;
  profile?: ProfileSettings;
  onUpdateProfilePhoto?: (newUrl: string) => void;
  onOpenSystemModal?: () => void;
}

export const AdminDashboard: React.FC<AdminDashboardProps> = ({
  isOpen,
  onClose,
  language,
  adminUser,
  images,
  onImagesChange,
  onOpenFirebaseConfig,
  onShowToast,
  profile,
  onUpdateProfilePhoto,
  onOpenSystemModal,
}) => {
  const [activeTab, setActiveTab] = useState<'upload' | 'manage' | 'firebase' | 'stats'>('upload');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  
  // Upload State
  const [uploadMode, setUploadMode] = useState<'file' | 'url'>('file');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string>('');
  const [urlInput, setUrlInput] = useState<string>('');
  const [uploadProgress, setUploadProgress] = useState<number>(0);
  const [isUploading, setIsUploading] = useState<boolean>(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const profilePhotoInputRef = useRef<HTMLInputElement>(null);
  const [isUploadingProfile, setIsUploadingProfile] = useState(false);

  // Metadata Form State
  const [title, setTitle] = useState('');
  const [titleNe, setTitleNe] = useState('');
  const [description, setDescription] = useState('');
  const [descNe, setDescNe] = useState('');
  const [category, setCategory] = useState('AI Clipzone');
  const [tagsInput, setTagsInput] = useState('cyberpunk, neon, 4k');
  const [likePreset, setLikePreset] = useState<'200' | '300' | '1k' | 'random' | 'custom'>('300');
  const [customLikes, setCustomLikes] = useState<number>(500);

  // Delete State
  const [imageToDelete, setImageToDelete] = useState<ClipzoneImage | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  // Edit State
  const [editingImage, setEditingImage] = useState<ClipzoneImage | null>(null);

  const categories = [
    'AI Clipzone',
    'Cyberpunk',
    '3D Renders',
    'Cinematic',
    'Anime AI',
    'Wallpapers',
    'Technology',
    'Community',
  ];

  const firebaseInstances = getFirebaseInstances();
  const isFirebaseLive = firebaseInstances.isReady;

  // Handle File Selection
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;
    const file = files[0];

    if (!file.type.startsWith('image/')) {
      onShowToast('Please select a valid image file (PNG, JPG, WebP, GIF, SVG).', 'error');
      return;
    }

    // Check max size (20MB)
    if (file.size > 20 * 1024 * 1024) {
      onShowToast('Image size exceeds 20MB limit.', 'error');
      return;
    }

    setSelectedFile(file);
    const objectUrl = URL.createObjectURL(file);
    setPreviewUrl(objectUrl);

    if (!title) {
      // Clean file name as initial title
      const nameWithoutExt = file.name.replace(/\.[^/.]+$/, '').replace(/[-_]/g, ' ');
      setTitle(nameWithoutExt.charAt(0).toUpperCase() + nameWithoutExt.slice(1));
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    const files = e.dataTransfer.files;
    if (files && files.length > 0) {
      const file = files[0];
      if (file.type.startsWith('image/')) {
        setSelectedFile(file);
        setPreviewUrl(URL.createObjectURL(file));
        if (!title) {
          const nameWithoutExt = file.name.replace(/\.[^/.]+$/, '').replace(/[-_]/g, ' ');
          setTitle(nameWithoutExt.charAt(0).toUpperCase() + nameWithoutExt.slice(1));
        }
      } else {
        onShowToast('Dropped file is not an image.', 'error');
      }
    }
  };

  // Handle Profile Photo Upload directly from Admin Dashboard
  const handleProfilePhotoFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;
    const file = files[0];

    if (!file.type.startsWith('image/')) {
      onShowToast('Please select a valid image file.', 'error');
      return;
    }

    try {
      setIsUploadingProfile(true);
      const result = await uploadProfilePhoto(file);
      if (onUpdateProfilePhoto) {
        onUpdateProfilePhoto(result.url);
      }
      onShowToast('Profile photo updated successfully!', 'success');
    } catch (err: any) {
      console.error(err);
      onShowToast(`Failed to update profile photo: ${err.message}`, 'error');
    } finally {
      setIsUploadingProfile(false);
      if (profilePhotoInputRef.current) profilePhotoInputRef.current.value = '';
    }
  };

  // Upload to Firebase Storage & Save to Firestore
  const handleUpload = async (e: React.FormEvent) => {
    e.preventDefault();

    let finalImgUrl = '';
    let storagePath: string | undefined = undefined;
    let fileSize: number | undefined = undefined;

    if (uploadMode === 'file') {
      if (!selectedFile) {
        onShowToast('Please select or drop an image to upload.', 'error');
        return;
      }

      setIsUploading(true);
      setUploadProgress(10);

      try {
        if (isFirebaseLive) {
          // Live Firebase Storage upload
          const uploadResult = await uploadFileToFirebaseStorage(
            selectedFile,
            'clipzone_uploads',
            (percent) => setUploadProgress(percent)
          );
          finalImgUrl = uploadResult.downloadUrl;
          storagePath = uploadResult.storagePath;
          fileSize = uploadResult.fileSize;
        } else {
          // Local fallback representation (DataURL) if Firebase keys are not connected yet
          finalImgUrl = await new Promise((resolve) => {
            const reader = new FileReader();
            reader.onload = () => resolve(reader.result as string);
            reader.readAsDataURL(selectedFile);
          });
          fileSize = selectedFile.size;
          setUploadProgress(100);
        }
      } catch (err: any) {
        setIsUploading(false);
        onShowToast(`Upload failed: ${err.message}`, 'error');
        return;
      }
    } else {
      // URL mode
      if (!urlInput.trim()) {
        onShowToast('Please provide an image link URL.', 'error');
        return;
      }
      finalImgUrl = urlInput.trim();
    }

    // Save image metadata to Firestore
    try {
      const parsedTags = tagsInput
        .split(',')
        .map((t) => t.trim())
        .filter(Boolean);

      const calculatedLikes = generateLikesFromPreset(likePreset, customLikes);

      const newImageData: Omit<ClipzoneImage, 'id'> = {
        title: title.trim() || 'AI Clipzone Visual',
        titleNe: titleNe.trim() || title.trim(),
        description: description.trim() || 'High definition visual asset created for AI Clipzone.',
        descNe: descNe.trim() || description.trim(),
        imgUrl: finalImgUrl,
        storagePath,
        uploadDate: new Date().toISOString(),
        category: category,
        likes: calculatedLikes,
        tags: parsedTags,
        fileSize,
        authorEmail: adminUser?.email || 'admin@clipzone.ai',
        authorName: adminUser?.displayName || 'Clipzone Admin',
        isFirebase: isFirebaseLive,
      };

      if (isFirebaseLive) {
        await saveImageMetadataToFirestore(newImageData);
        onShowToast('Image uploaded to Firebase Storage & saved to Firestore Database!', 'success');
      } else {
        // Fallback local update
        const localNewImage: ClipzoneImage = {
          id: `img-clip-${Date.now()}`,
          ...newImageData,
        };
        if (onImagesChange) {
          onImagesChange([localNewImage, ...images]);
        }
        onShowToast('Image uploaded and saved to website gallery!', 'success');
      }

      // Reset form
      setSelectedFile(null);
      setPreviewUrl('');
      setUrlInput('');
      setTitle('');
      setTitleNe('');
      setDescription('');
      setDescNe('');
      setUploadProgress(0);
      setIsUploading(false);
      setActiveTab('manage');
    } catch (err: any) {
      setIsUploading(false);
      onShowToast(`Failed to save image record: ${err.message}`, 'error');
    }
  };

  // Delete Action
  const handleDeleteConfirm = async () => {
    if (!imageToDelete) return;
    setIsDeleting(true);

    try {
      if (isFirebaseLive) {
        await deleteClipzoneImage(imageToDelete.id, imageToDelete.storagePath);
      }
      
      // Update local state as well
      if (onImagesChange) {
        onImagesChange(images.filter((img) => img.id !== imageToDelete.id));
      }

      onShowToast('Image deleted permanently from Firebase Storage & Firestore.', 'info');
      setImageToDelete(null);
    } catch (err: any) {
      onShowToast(`Failed to delete image: ${err.message}`, 'error');
    } finally {
      setIsDeleting(false);
    }
  };

  // Edit Action
  const handleSaveEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingImage) return;

    try {
      if (isFirebaseLive) {
        await updateClipzoneImage(editingImage.id, {
          title: editingImage.title,
          titleNe: editingImage.titleNe,
          description: editingImage.description,
          descNe: editingImage.descNe,
          imgUrl: editingImage.imgUrl,
          category: editingImage.category,
          likes: editingImage.likes,
        });
      }

      if (onImagesChange) {
        onImagesChange(
          images.map((img) => (img.id === editingImage.id ? { ...editingImage, isFirebase: true } : img))
        );
      }

      onShowToast('Image details updated and saved successfully!', 'success');
      setEditingImage(null);
    } catch (err: any) {
      onShowToast(`Failed to update image: ${err?.message || 'Error occurred'}`, 'error');
    }
  };

  const filteredImages = images.filter((img) => {
    const matchesCategory =
      selectedCategory === 'All' || img.category.toLowerCase() === selectedCategory.toLowerCase();
    const matchesSearch =
      img.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (img.description && img.description.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (img.tags && img.tags.some((t) => t.toLowerCase().includes(searchQuery.toLowerCase())));
    return matchesCategory && matchesSearch;
  });

  const totalLikes = images.reduce((acc, curr) => acc + (curr.likes || 0), 0);

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 md:p-6 bg-slate-950/90 backdrop-blur-2xl overflow-y-auto"
          onClick={onClose}
        >
          <motion.div
            initial={{ scale: 0.94, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.94, opacity: 0 }}
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
            onClick={(e) => e.stopPropagation()}
            className="relative w-full max-w-5xl rounded-3xl bg-slate-900 border border-slate-800 shadow-2xl overflow-hidden max-h-[94vh] flex flex-col my-auto"
          >
            {/* Top Navigation Bar */}
            <div className="flex flex-wrap items-center justify-between gap-3 px-6 py-4 border-b border-slate-800 bg-slate-950/60 shrink-0">
              <div className="flex items-center gap-3">
                {/* Profile Avatar with Quick Upload */}
                <div className="relative group cursor-pointer" onClick={() => profilePhotoInputRef.current?.click()}>
                  <input
                    ref={profilePhotoInputRef}
                    type="file"
                    accept="image/*"
                    onChange={handleProfilePhotoFileChange}
                    className="hidden"
                  />
                  <div className="w-10 h-10 rounded-2xl overflow-hidden bg-slate-800 border-2 border-blue-500/40 flex items-center justify-center shadow-lg shadow-blue-600/20">
                    {profile?.heroImage ? (
                      <img
                        src={profile.heroImage}
                        alt="Profile"
                        referrerPolicy="no-referrer"
                        className="w-full h-full object-cover object-top"
                      />
                    ) : (
                      <Flame className="w-5 h-5 text-amber-300" />
                    )}
                  </div>
                  <div className="absolute inset-0 rounded-2xl bg-slate-950/70 backdrop-blur-xs opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity text-blue-400">
                    {isUploadingProfile ? (
                      <Loader2 className="w-4 h-4 animate-spin text-blue-400" />
                    ) : (
                      <Camera className="w-4 h-4 text-blue-400" />
                    )}
                  </div>
                </div>

                <div>
                  <div className="flex items-center gap-2">
                    <h2 className="text-lg sm:text-xl font-bold text-slate-100 font-heading">
                      AI Clipzone Admin Dashboard
                    </h2>
                    <span
                      className={`text-[10px] font-mono font-semibold px-2 py-0.5 rounded-full border flex items-center gap-1 ${
                        isFirebaseLive
                          ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30'
                          : 'bg-amber-500/10 text-amber-400 border-amber-500/30'
                      }`}
                    >
                      <span className={`w-1.5 h-1.5 rounded-full ${isFirebaseLive ? 'bg-emerald-400 animate-pulse' : 'bg-amber-400'}`} />
                      {isFirebaseLive ? 'Firebase Live' : 'Demo / Config Needed'}
                    </span>
                  </div>
                  <p className="text-xs text-slate-400 flex items-center gap-2">
                    <span>Logged in as: <strong className="text-slate-200">{adminUser?.email || 'admin@clipzone.ai'}</strong></span>
                    {onOpenSystemModal && (
                      <button
                        type="button"
                        onClick={onOpenSystemModal}
                        className="text-[11px] text-blue-400 hover:text-blue-300 font-semibold underline ml-1"
                      >
                        Edit Site CMS
                      </button>
                    )}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={onOpenFirebaseConfig}
                  className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-amber-500/10 hover:bg-amber-500/20 text-amber-400 border border-amber-500/30 text-xs font-semibold transition-all active:scale-95"
                >
                  <Key className="w-3.5 h-3.5" />
                  <span>Firebase Keys</span>
                </button>

                <button
                  type="button"
                  onClick={async () => {
                    await logoutAdmin();
                    onShowToast('Logged out of Admin Dashboard.', 'info');
                    onClose();
                  }}
                  className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-slate-800 hover:bg-rose-600 text-slate-300 hover:text-white border border-slate-700 text-xs font-semibold transition-all active:scale-95"
                  title="Logout"
                >
                  <LogOut className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">Logout</span>
                </button>

                <button
                  onClick={onClose}
                  className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
                  aria-label="Close Dashboard"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Dashboard Subheader Navigation Tabs */}
            <div className="flex items-center justify-between px-6 py-2 border-b border-slate-800 bg-slate-900/80 shrink-0 overflow-x-auto no-scrollbar">
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setActiveTab('upload')}
                  className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                    activeTab === 'upload'
                      ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/30'
                      : 'text-slate-400 hover:text-slate-100 hover:bg-slate-800'
                  }`}
                >
                  <Upload className="w-4 h-4" />
                  <span>Upload Images</span>
                </button>

                <button
                  type="button"
                  onClick={() => setActiveTab('manage')}
                  className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                    activeTab === 'manage'
                      ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/30'
                      : 'text-slate-400 hover:text-slate-100 hover:bg-slate-800'
                  }`}
                >
                  <ImageIcon className="w-4 h-4" />
                  <span>Manage Images ({images.length})</span>
                </button>

                <button
                  type="button"
                  onClick={() => setActiveTab('stats')}
                  className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                    activeTab === 'stats'
                      ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/30'
                      : 'text-slate-400 hover:text-slate-100 hover:bg-slate-800'
                  }`}
                >
                  <Layers className="w-4 h-4" />
                  <span>Overview & Stats</span>
                </button>
              </div>

              <div className="hidden md:flex items-center gap-4 text-xs text-slate-400 font-mono">
                <span>Total: <strong className="text-slate-200">{images.length}</strong> Clips</span>
                <span>Likes: <strong className="text-pink-400">{formatLikes(totalLikes)}</strong></span>
              </div>
            </div>

            {/* Scrollable Dashboard Body */}
            <div className="p-6 overflow-y-auto flex-1 space-y-6">
              
              {/* TAB 1: UPLOAD IMAGES */}
              {activeTab === 'upload' && (
                <div className="space-y-6">
                  {/* Upload Mode Selector: File vs URL */}
                  <div className="flex items-center justify-between flex-wrap gap-3">
                    <div>
                      <h3 className="text-base font-bold text-slate-100">
                        Upload to Firebase Storage & Firestore Database
                      </h3>
                      <p className="text-xs text-slate-400">
                        Select a high-resolution image from your computer or provide a direct web image link.
                      </p>
                    </div>

                    <div className="flex items-center bg-slate-950 p-1 rounded-xl border border-slate-800">
                      <button
                        type="button"
                        onClick={() => setUploadMode('file')}
                        className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                          uploadMode === 'file'
                            ? 'bg-blue-600 text-white font-bold'
                            : 'text-slate-400 hover:text-white'
                        }`}
                      >
                        Device File Upload
                      </button>
                      <button
                        type="button"
                        onClick={() => setUploadMode('url')}
                        className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                          uploadMode === 'url'
                            ? 'bg-blue-600 text-white font-bold'
                            : 'text-slate-400 hover:text-white'
                        }`}
                      >
                        Image Link URL
                      </button>
                    </div>
                  </div>

                  <form onSubmit={handleUpload} className="space-y-6">
                    {/* Drag & Drop Upload Zone or URL Input */}
                    {uploadMode === 'file' ? (
                      <div
                        onDragOver={handleDragOver}
                        onDrop={handleDrop}
                        onClick={() => fileInputRef.current?.click()}
                        className={`relative border-2 border-dashed rounded-3xl p-8 text-center cursor-pointer transition-all duration-200 ${
                          previewUrl
                            ? 'border-blue-500/50 bg-slate-950/80'
                            : 'border-slate-700 hover:border-blue-500 bg-slate-950/40 hover:bg-slate-950/80'
                        }`}
                      >
                        <input
                          type="file"
                          ref={fileInputRef}
                          onChange={handleFileChange}
                          accept="image/*"
                          className="hidden"
                        />

                        {previewUrl ? (
                          <div className="flex flex-col sm:flex-row items-center justify-center gap-6">
                            <div className="relative w-40 h-40 rounded-2xl overflow-hidden bg-slate-900 border border-slate-700 shadow-xl shrink-0">
                              <img
                                src={previewUrl}
                                alt="Selected preview"
                                className="w-full h-full object-cover"
                              />
                            </div>
                            <div className="text-left space-y-2 max-w-sm">
                              <div className="flex items-center gap-2">
                                <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
                                <span className="text-sm font-bold text-slate-100 truncate">
                                  {selectedFile?.name}
                                </span>
                              </div>
                              <p className="text-xs text-slate-400">
                                Size: {((selectedFile?.size || 0) / (1024 * 1024)).toFixed(2)} MB • Ready for Firebase Storage
                              </p>
                              <button
                                type="button"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setSelectedFile(null);
                                  setPreviewUrl('');
                                }}
                                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-rose-500/10 hover:bg-rose-500 text-rose-400 hover:text-white border border-rose-500/20 text-xs font-semibold transition-all"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                                <span>Change Image</span>
                              </button>
                            </div>
                          </div>
                        ) : (
                          <div className="space-y-3">
                            <div className="w-16 h-16 mx-auto rounded-2xl bg-blue-600/10 border border-blue-500/20 flex items-center justify-center text-blue-400">
                              <Upload className="w-8 h-8" />
                            </div>
                            <div>
                              <p className="text-sm font-bold text-slate-100">
                                Drag & drop image here, or <span className="text-blue-400 underline">browse device</span>
                              </p>
                              <p className="text-xs text-slate-400 mt-1">
                                Supports high resolution PNG, JPG, WebP, GIF, SVG up to 20MB
                              </p>
                            </div>
                          </div>
                        )}
                      </div>
                    ) : (
                      <div className="p-5 rounded-2xl bg-slate-950 border border-slate-800 space-y-3">
                        <label className="block text-xs font-bold uppercase tracking-wider text-blue-400">
                          Direct Web Image URL Link
                        </label>
                        <div className="flex gap-2">
                          <input
                            type="url"
                            value={urlInput}
                            onChange={(e) => setUrlInput(e.target.value)}
                            placeholder="https://images.unsplash.com/... or https://blogger.googleusercontent.com/..."
                            className="w-full px-4 py-3 rounded-xl bg-slate-900 border border-slate-700 text-slate-100 text-xs font-mono focus:outline-none focus:border-blue-500"
                          />
                        </div>
                        {urlInput.trim() && (
                          <div className="relative rounded-2xl overflow-hidden bg-slate-900 border border-slate-800 p-2 flex items-center justify-center max-h-48">
                            <img
                              src={urlInput}
                              alt="URL Preview"
                              className="max-h-44 max-w-full object-contain rounded-xl"
                            />
                          </div>
                        )}
                      </div>
                    )}

                    {/* Upload Progress Bar */}
                    {isUploading && (
                      <div className="space-y-2 p-4 rounded-2xl bg-blue-950/40 border border-blue-500/30">
                        <div className="flex items-center justify-between text-xs font-bold text-blue-300">
                          <span className="flex items-center gap-2">
                            <RefreshCw className="w-4 h-4 animate-spin text-blue-400" />
                            Uploading to Firebase Storage & syncing Firestore...
                          </span>
                          <span className="font-mono">{uploadProgress}%</span>
                        </div>
                        <div className="w-full h-2 bg-slate-800 rounded-full overflow-hidden">
                          <div
                            className="h-full bg-gradient-to-r from-blue-500 to-indigo-500 transition-all duration-300"
                            style={{ width: `${uploadProgress}%` }}
                          />
                        </div>
                      </div>
                    )}

                    {/* Metadata Fields */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 p-5 rounded-2xl bg-slate-950/60 border border-slate-800">
                      <div>
                        <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                          Image Title
                        </label>
                        <input
                          type="text"
                          required
                          value={title}
                          onChange={(e) => setTitle(e.target.value)}
                          placeholder="e.g. Cyberpunk City 2077"
                          className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-800 text-slate-100 text-xs focus:outline-none focus:border-blue-500"
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-semibold text-slate-300 mb-1.5 flex items-center gap-1.5">
                          <Tag className="w-3.5 h-3.5 text-blue-400" />
                          <span>Category</span>
                        </label>
                        <select
                          value={category}
                          onChange={(e) => setCategory(e.target.value)}
                          className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-800 text-slate-100 text-xs focus:outline-none focus:border-blue-500"
                        >
                          {categories.map((c) => (
                            <option key={c} value={c}>
                              {c}
                            </option>
                          ))}
                        </select>
                      </div>

                      <div className="sm:col-span-2">
                        <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                          Description / Caption
                        </label>
                        <textarea
                          rows={2}
                          value={description}
                          onChange={(e) => setDescription(e.target.value)}
                          placeholder="Provide visual details, creation prompt or context..."
                          className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-800 text-slate-100 text-xs focus:outline-none focus:border-blue-500 resize-none"
                        />
                      </div>

                      <div className="sm:col-span-2">
                        <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                          Tags (comma separated)
                        </label>
                        <input
                          type="text"
                          value={tagsInput}
                          onChange={(e) => setTagsInput(e.target.value)}
                          placeholder="ai, cyberpunk, 4k, neon, wallpaper"
                          className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-800 text-slate-100 text-xs focus:outline-none focus:border-blue-500"
                        />
                      </div>
                    </div>

                    {/* Auto-Likes Initial Engagement Preset */}
                    <div className="p-4 rounded-2xl bg-slate-950/80 border border-slate-800">
                      <div className="flex items-center justify-between mb-3">
                        <label className="text-xs font-bold uppercase tracking-wider text-pink-400 flex items-center gap-1.5">
                          <Heart className="w-4 h-4 fill-pink-400" />
                          <span>Initial Engagement Likes</span>
                        </label>
                        <span className="text-xs font-mono font-bold text-pink-300">
                          ~{formatLikes(generateLikesFromPreset(likePreset, customLikes))} likes
                        </span>
                      </div>
                      <div className="grid grid-cols-4 gap-2">
                        {(['200', '300', '1k', 'random'] as const).map((preset) => (
                          <button
                            key={preset}
                            type="button"
                            onClick={() => setLikePreset(preset)}
                            className={`py-2 px-2 rounded-xl text-xs font-bold transition-all ${
                              likePreset === preset
                                ? 'bg-pink-600 text-white shadow-md shadow-pink-600/30'
                                : 'bg-slate-900 text-slate-400 hover:text-slate-200 border border-slate-800'
                            }`}
                          >
                            {preset === '1k' ? '1.0k+' : preset === 'random' ? 'Random' : `${preset}+`}
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Submit Button */}
                    <div className="flex items-center justify-end gap-3 pt-2">
                      <button
                        type="submit"
                        disabled={isUploading || (uploadMode === 'file' && !selectedFile) || (uploadMode === 'url' && !urlInput)}
                        className="flex items-center gap-2 px-8 py-3.5 rounded-2xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 disabled:opacity-50 text-white text-xs sm:text-sm font-bold shadow-xl shadow-blue-600/30 transition-all active:scale-[0.98]"
                      >
                        {isUploading ? (
                          <>
                            <RefreshCw className="w-4 h-4 animate-spin" />
                            <span>Uploading to Firebase...</span>
                          </>
                        ) : (
                          <>
                            <Upload className="w-4 h-4" />
                            <span>Publish Image to AI Clipzone</span>
                          </>
                        )}
                      </button>
                    </div>
                  </form>
                </div>
              )}

              {/* TAB 2: MANAGE & DELETE IMAGES */}
              {activeTab === 'manage' && (
                <div className="space-y-5">
                  {/* Search, Filter, and View Controls */}
                  <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
                    <div className="relative flex-1">
                      <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                      <input
                        type="text"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        placeholder="Search images by title, tag, or description..."
                        className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-slate-100 text-xs focus:outline-none focus:border-blue-500"
                      />
                    </div>

                    <div className="flex items-center gap-2">
                      <select
                        value={selectedCategory}
                        onChange={(e) => setSelectedCategory(e.target.value)}
                        className="px-3 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-slate-200 text-xs focus:outline-none focus:border-blue-500"
                      >
                        <option value="All">All Categories</option>
                        {categories.map((c) => (
                          <option key={c} value={c}>
                            {c}
                          </option>
                        ))}
                      </select>

                      <div className="flex items-center bg-slate-950 p-1 rounded-xl border border-slate-800">
                        <button
                          type="button"
                          onClick={() => setViewMode('grid')}
                          className={`p-1.5 rounded-lg transition-colors ${
                            viewMode === 'grid' ? 'bg-blue-600 text-white' : 'text-slate-400'
                          }`}
                          title="Grid View"
                        >
                          <LayoutGrid className="w-4 h-4" />
                        </button>
                        <button
                          type="button"
                          onClick={() => setViewMode('list')}
                          className={`p-1.5 rounded-lg transition-colors ${
                            viewMode === 'list' ? 'bg-blue-600 text-white' : 'text-slate-400'
                          }`}
                          title="List View"
                        >
                          <List className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* Images Grid or List */}
                  {filteredImages.length === 0 ? (
                    <div className="p-12 text-center rounded-3xl bg-slate-950/60 border border-slate-800 space-y-3">
                      <ImageIcon className="w-12 h-12 text-slate-600 mx-auto" />
                      <p className="text-sm font-bold text-slate-300">No images found.</p>
                      <p className="text-xs text-slate-500">
                        Upload an image using the "Upload Images" tab to get started.
                      </p>
                    </div>
                  ) : viewMode === 'grid' ? (
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                      {filteredImages.map((img) => (
                        <div
                          key={img.id}
                          className="group relative rounded-2xl bg-slate-950 border border-slate-800 hover:border-blue-500/50 overflow-hidden shadow-lg transition-all duration-200 flex flex-col"
                        >
                          {/* Image Thumbnail */}
                          <div className="relative aspect-video w-full overflow-hidden bg-slate-900">
                            <img
                              src={img.imgUrl}
                              alt={img.title}
                              referrerPolicy="no-referrer"
                              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                            />
                            <div className="absolute top-2 left-2 px-2 py-0.5 rounded-md bg-slate-950/80 backdrop-blur text-[10px] font-bold text-blue-400 border border-slate-800">
                              {img.category}
                            </div>
                            <div className="absolute top-2 right-2 px-2 py-0.5 rounded-md bg-slate-950/80 backdrop-blur text-[10px] font-bold text-pink-400 border border-slate-800 flex items-center gap-1">
                              <Heart className="w-3 h-3 fill-pink-400" />
                              <span>{formatLikes(img.likes)}</span>
                            </div>
                          </div>

                          {/* Info Body */}
                          <div className="p-4 flex-1 flex flex-col justify-between space-y-3">
                            <div>
                              <h4 className="text-xs font-bold text-slate-100 line-clamp-1">
                                {img.title}
                              </h4>
                              {img.description && (
                                <p className="text-[11px] text-slate-400 line-clamp-2 mt-1">
                                  {img.description}
                                </p>
                              )}
                            </div>

                            <div className="pt-2 border-t border-slate-900 flex items-center justify-between text-[11px] text-slate-500">
                              <span className="font-mono">
                                {new Date(img.uploadDate).toLocaleDateString()}
                              </span>
                              <div className="flex items-center gap-1">
                                {onUpdateProfilePhoto && (
                                  <button
                                    type="button"
                                    onClick={() => {
                                      onUpdateProfilePhoto(img.imgUrl);
                                      onShowToast('Set as top profile portrait photo!', 'success');
                                    }}
                                    className={`p-1.5 rounded-lg transition-colors ${
                                      profile?.heroImage === img.imgUrl
                                        ? 'text-emerald-400 bg-emerald-500/20'
                                        : 'text-slate-400 hover:text-emerald-400 hover:bg-slate-800'
                                    }`}
                                    title="Set as Profile Hero Photo"
                                  >
                                    <User className="w-3.5 h-3.5" />
                                  </button>
                                )}
                                <button
                                  type="button"
                                  onClick={() => {
                                    navigator.clipboard.writeText(img.imgUrl);
                                    onShowToast('Direct image URL copied to clipboard!', 'info');
                                  }}
                                  className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
                                  title="Copy URL"
                                >
                                  <Copy className="w-3.5 h-3.5" />
                                </button>
                                <button
                                  type="button"
                                  onClick={() => setEditingImage(img)}
                                  className="p-1.5 rounded-lg text-blue-400 hover:text-white hover:bg-blue-600 transition-colors"
                                  title="Edit details"
                                >
                                  <Edit3 className="w-3.5 h-3.5" />
                                </button>
                                <button
                                  type="button"
                                  onClick={() => setImageToDelete(img)}
                                  className="p-1.5 rounded-lg text-rose-400 hover:text-white hover:bg-rose-600 transition-colors"
                                  title="Delete from Firebase"
                                >
                                  <Trash2 className="w-3.5 h-3.5" />
                                </button>
                              </div>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    /* LIST VIEW */
                    <div className="space-y-2">
                      {filteredImages.map((img) => (
                        <div
                          key={img.id}
                          className="flex items-center justify-between gap-4 p-3.5 rounded-2xl bg-slate-950 border border-slate-800 hover:border-slate-700 transition-colors"
                        >
                          <div className="flex items-center gap-3 min-w-0">
                            <img
                              src={img.imgUrl}
                              alt={img.title}
                              referrerPolicy="no-referrer"
                              className="w-14 h-14 rounded-xl object-cover shrink-0 bg-slate-900 border border-slate-800"
                            />
                            <div className="min-w-0">
                              <h4 className="text-xs font-bold text-slate-100 truncate">
                                {img.title}
                              </h4>
                              <div className="flex items-center gap-2 mt-0.5 text-[11px] text-slate-400 font-mono">
                                <span className="text-blue-400">{img.category}</span>
                                <span>•</span>
                                <span>{formatLikes(img.likes)} likes</span>
                                <span>•</span>
                                <span>{new Date(img.uploadDate).toLocaleDateString()}</span>
                              </div>
                            </div>
                          </div>

                          <div className="flex items-center gap-1.5 shrink-0">
                            {onUpdateProfilePhoto && (
                              <button
                                type="button"
                                onClick={() => {
                                  onUpdateProfilePhoto(img.imgUrl);
                                  onShowToast('Set as top profile portrait photo!', 'success');
                                }}
                                className={`p-2 rounded-xl transition-colors ${
                                  profile?.heroImage === img.imgUrl
                                    ? 'text-emerald-400 bg-emerald-500/20'
                                    : 'text-slate-400 hover:text-emerald-400 hover:bg-slate-800'
                                }`}
                                title="Set as Profile Hero Photo"
                              >
                                <User className="w-4 h-4" />
                              </button>
                            )}
                            <button
                              type="button"
                              onClick={() => {
                                navigator.clipboard.writeText(img.imgUrl);
                                onShowToast('Image URL copied to clipboard!', 'info');
                              }}
                              className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
                              title="Copy URL"
                            >
                              <Copy className="w-4 h-4" />
                            </button>
                            <button
                              type="button"
                              onClick={() => setEditingImage(img)}
                              className="p-2 rounded-xl text-blue-400 hover:text-white hover:bg-blue-600 transition-colors"
                              title="Edit"
                            >
                              <Edit3 className="w-4 h-4" />
                            </button>
                            <button
                              type="button"
                              onClick={() => setImageToDelete(img)}
                              className="p-2 rounded-xl text-rose-400 hover:text-white hover:bg-rose-600 transition-colors"
                              title="Delete"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* TAB 3: OVERVIEW & STATS */}
              {activeTab === 'stats' && (
                <div className="space-y-6">
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <div className="p-5 rounded-2xl bg-slate-950 border border-slate-800 space-y-1">
                      <div className="flex items-center justify-between text-slate-400 text-xs">
                        <span>Total Gallery Clips</span>
                        <ImageIcon className="w-4 h-4 text-blue-400" />
                      </div>
                      <p className="text-2xl font-bold text-slate-100 font-mono">{images.length}</p>
                      <p className="text-[11px] text-slate-500">Live across main website</p>
                    </div>

                    <div className="p-5 rounded-2xl bg-slate-950 border border-slate-800 space-y-1">
                      <div className="flex items-center justify-between text-slate-400 text-xs">
                        <span>Total Engagement Likes</span>
                        <Heart className="w-4 h-4 text-pink-400" />
                      </div>
                      <p className="text-2xl font-bold text-pink-400 font-mono">{formatLikes(totalLikes)}</p>
                      <p className="text-[11px] text-slate-500">Community reactions</p>
                    </div>

                    <div className="p-5 rounded-2xl bg-slate-950 border border-slate-800 space-y-1">
                      <div className="flex items-center justify-between text-slate-400 text-xs">
                        <span>Firebase Status</span>
                        <Flame className="w-4 h-4 text-amber-400" />
                      </div>
                      <p className="text-base font-bold text-slate-100">
                        {isFirebaseLive ? 'Connected & Active' : 'Keys Pending'}
                      </p>
                      <p className="text-[11px] text-slate-500">
                        {isFirebaseLive ? 'Firestore & Storage synced' : 'Click "Firebase Keys" to configure'}
                      </p>
                    </div>
                  </div>

                  <div className="p-6 rounded-3xl bg-slate-950 border border-slate-800 space-y-4">
                    <h4 className="text-sm font-bold text-slate-100">System Architecture Information</h4>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                      <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 space-y-2">
                        <div className="flex items-center gap-2 font-bold text-blue-400">
                          <HardDrive className="w-4 h-4" />
                          <span>Firebase Storage Bucket</span>
                        </div>
                        <p className="text-slate-300 leading-relaxed">
                          Stores binary visual assets under <code>/clipzone_uploads</code> with public download tokens and optimized streaming.
                        </p>
                      </div>

                      <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 space-y-2">
                        <div className="flex items-center gap-2 font-bold text-emerald-400">
                          <Database className="w-4 h-4" />
                          <span>Firestore Database Collection</span>
                        </div>
                        <p className="text-slate-300 leading-relaxed">
                          Stores structured metadata, timestamps, categories, and like metrics in the <code>clipzone_images</code> collection with real-time listeners.
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Delete Confirmation Modal */}
            <AnimatePresence>
              {imageToDelete && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="absolute inset-0 z-50 bg-slate-950/90 backdrop-blur-md flex items-center justify-center p-6"
                >
                  <motion.div
                    initial={{ scale: 0.9, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    exit={{ scale: 0.9, opacity: 0 }}
                    className="w-full max-w-md bg-slate-900 border border-rose-500/40 rounded-3xl p-6 shadow-2xl space-y-4"
                  >
                    <div className="flex items-center gap-3 text-rose-400">
                      <Trash2 className="w-6 h-6 shrink-0" />
                      <h4 className="text-base font-bold text-slate-100">
                        Delete image permanently?
                      </h4>
                    </div>

                    <div className="flex items-center gap-3 p-3 rounded-xl bg-slate-950 border border-slate-800">
                      <img
                        src={imageToDelete.imgUrl}
                        alt={imageToDelete.title}
                        className="w-12 h-12 rounded-lg object-cover bg-slate-900"
                      />
                      <div className="min-w-0">
                        <p className="text-xs font-bold text-slate-200 truncate">{imageToDelete.title}</p>
                        <p className="text-[11px] text-slate-400 font-mono">{imageToDelete.category}</p>
                      </div>
                    </div>

                    <p className="text-xs text-slate-300 leading-relaxed">
                      This will delete the image document from Firestore and remove the file from Firebase Storage. This action cannot be undone.
                    </p>

                    <div className="flex items-center justify-end gap-3 pt-2">
                      <button
                        type="button"
                        onClick={() => setImageToDelete(null)}
                        className="px-4 py-2 rounded-xl bg-slate-800 text-slate-300 text-xs font-semibold hover:bg-slate-700 transition-colors"
                      >
                        Cancel
                      </button>
                      <button
                        type="button"
                        onClick={handleDeleteConfirm}
                        disabled={isDeleting}
                        className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-rose-600 text-white text-xs font-bold hover:bg-rose-500 shadow-lg shadow-rose-600/30 transition-colors"
                      >
                        {isDeleting ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <Trash2 className="w-3.5 h-3.5" />}
                        <span>{isDeleting ? 'Deleting...' : 'Yes, Delete Permanently'}</span>
                      </button>
                    </div>
                  </motion.div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Edit Image Modal */}
            <AnimatePresence>
              {editingImage && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="absolute inset-0 z-50 bg-slate-950/90 backdrop-blur-md flex items-center justify-center p-6"
                >
                  <motion.div
                    initial={{ scale: 0.9, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    exit={{ scale: 0.9, opacity: 0 }}
                    className="w-full max-w-lg bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-2xl space-y-4"
                  >
                    <div className="flex items-center justify-between pb-3 border-b border-slate-800">
                      <h4 className="text-base font-bold text-slate-100 flex items-center gap-2">
                        <Edit3 className="w-4 h-4 text-blue-400" />
                        <span>Edit Image Details</span>
                      </h4>
                      <button
                        onClick={() => setEditingImage(null)}
                        className="text-slate-400 hover:text-white"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>

                    <form onSubmit={handleSaveEdit} className="space-y-4">
                      <div>
                        <label className="block text-xs font-semibold text-slate-300 mb-1">
                          Title
                        </label>
                        <input
                          type="text"
                          value={editingImage.title}
                          onChange={(e) =>
                            setEditingImage({ ...editingImage, title: e.target.value })
                          }
                          className="w-full px-3.5 py-2 rounded-xl bg-slate-950 border border-slate-800 text-slate-100 text-xs focus:outline-none focus:border-blue-500"
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-semibold text-slate-300 mb-1">
                          Category
                        </label>
                        <select
                          value={editingImage.category}
                          onChange={(e) =>
                            setEditingImage({ ...editingImage, category: e.target.value })
                          }
                          className="w-full px-3.5 py-2 rounded-xl bg-slate-950 border border-slate-800 text-slate-100 text-xs focus:outline-none focus:border-blue-500"
                        >
                          {categories.map((c) => (
                            <option key={c} value={c}>
                              {c}
                            </option>
                          ))}
                        </select>
                      </div>

                      <div>
                        <label className="block text-xs font-semibold text-slate-300 mb-1">
                          Description
                        </label>
                        <textarea
                          rows={3}
                          value={editingImage.description || ''}
                          onChange={(e) =>
                            setEditingImage({ ...editingImage, description: e.target.value })
                          }
                          className="w-full px-3.5 py-2 rounded-xl bg-slate-950 border border-slate-800 text-slate-100 text-xs focus:outline-none focus:border-blue-500 resize-none"
                        />
                      </div>

                      <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-800">
                        <button
                          type="button"
                          onClick={() => setEditingImage(null)}
                          className="px-4 py-2 rounded-xl bg-slate-800 text-slate-300 text-xs font-semibold"
                        >
                          Cancel
                        </button>
                        <button
                          type="submit"
                          className="px-5 py-2 rounded-xl bg-blue-600 text-white text-xs font-bold hover:bg-blue-500 shadow-lg shadow-blue-600/30"
                        >
                          Save Changes
                        </button>
                      </div>
                    </form>
                  </motion.div>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
