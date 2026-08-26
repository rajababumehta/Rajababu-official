/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { Navbar } from './components/Navbar';
import { Header } from './components/Header';
import { AboutSection } from './components/AboutSection';
import { JourneySection } from './components/JourneySection';
import { ExperienceSection } from './components/ExperienceSection';
import { ContactSection } from './components/ContactSection';
import { Footer } from './components/Footer';
import { PhotoUploadModal } from './components/PhotoUploadModal';
import { EditMomentModal } from './components/EditMomentModal';
import { AdminSystemModal } from './components/AdminSystemModal';
import { AdminShieldOverlay } from './components/AdminShieldOverlay';
import { AdminLoginModal } from './components/AdminLoginModal';
import { AdminDashboard } from './components/AdminDashboard';
import { FirebaseConfigModal } from './components/FirebaseConfigModal';
import { ToastContainer, ToastMessage } from './components/Toast';

import { Language, Moment, Comment, SystemSettings, ClipzoneImage, AdminUser } from './types';
import {
  STORAGE_KEYS,
  DEFAULT_SYSTEM_SETTINGS,
  DEFAULT_MOMENTS,
  DEFAULT_COMMENTS_MAP,
} from './data/defaults';
import {
  subscribeToClipzoneImages,
  subscribeToAuth,
  subscribeToSystemSettings,
  saveSystemSettingsToFirestore,
  updateClipzoneImage,
  deleteClipzoneImage,
  getFirebaseInstances,
  LOCAL_ADMIN_STORAGE_KEY,
} from './services/firebase';

// Helper converter functions
const momentToClipzoneImage = (m: Moment): ClipzoneImage => ({
  id: m.id,
  title: m.titleEn || 'Untitled Clip',
  titleNe: m.titleNe,
  description: m.descEn || '',
  descNe: m.descNe,
  imgUrl: m.imgUrl,
  uploadDate: m.uploadedAt || new Date().toISOString(),
  category: m.category || 'AI Clipzone',
  likes: m.likes || 0,
  isFirebase: Boolean(m.isUserUploaded),
});

const clipzoneImageToMoment = (img: ClipzoneImage): Moment => ({
  id: img.id,
  titleEn: img.title,
  titleNe: img.titleNe || img.title,
  descEn: img.description || '',
  descNe: img.descNe || img.description || '',
  imgUrl: img.imgUrl,
  likes: img.likes || 0,
  category: img.category || 'AI Clipzone',
  date: img.uploadDate ? new Date(img.uploadDate).toLocaleDateString() : 'Recent',
  isUserUploaded: true,
  uploadedAt: img.uploadDate,
});

export default function App() {
  // 1. Language State
  const [language, setLanguage] = useState<Language>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.LANGUAGE);
    return saved === 'NE' || saved === 'EN' ? saved : 'EN';
  });

  // 2. Admin Authentication State & Firebase Admin User
  const [isAdmin, setIsAdmin] = useState<boolean>(() => {
    return localStorage.getItem(STORAGE_KEYS.ADMIN_AUTH) === 'true';
  });
  const [adminUser, setAdminUser] = useState<AdminUser | null>(() => {
    try {
      const saved = localStorage.getItem(LOCAL_ADMIN_STORAGE_KEY);
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  });

  // 3. System Settings State (Profile, About, Experience, Contact, AutoLikes)
  const [systemSettings, setSystemSettings] = useState<SystemSettings>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.SYSTEM_SETTINGS);
      if (saved) {
        const parsed = JSON.parse(saved);
        return {
          ...DEFAULT_SYSTEM_SETTINGS,
          ...parsed,
          profile: {
            ...DEFAULT_SYSTEM_SETTINGS.profile,
            ...parsed.profile,
            heroImage: parsed.profile?.heroImage || DEFAULT_SYSTEM_SETTINGS.profile.heroImage,
          },
          about: {
            ...DEFAULT_SYSTEM_SETTINGS.about,
            ...parsed.about,
          },
          experience: {
            ...DEFAULT_SYSTEM_SETTINGS.experience,
            ...parsed.experience,
          },
          contact: {
            ...DEFAULT_SYSTEM_SETTINGS.contact,
            ...parsed.contact,
          },
          autoLikes: {
            ...DEFAULT_SYSTEM_SETTINGS.autoLikes,
            ...parsed.autoLikes,
          },
        };
      }
    } catch (e) {
      console.error('Failed to load system settings from localStorage', e);
    }
    return DEFAULT_SYSTEM_SETTINGS;
  });

  // 4. Moments Gallery State (Permanent persistence with deletion tombstone protection)
  const [moments, setMoments] = useState<Moment[]>(() => {
    try {
      const deletedIdsStr = localStorage.getItem(STORAGE_KEYS.DELETED_MOMENT_IDS);
      const deletedIds: string[] = deletedIdsStr ? JSON.parse(deletedIdsStr) : [];

      const saved = localStorage.getItem(STORAGE_KEYS.CUSTOM_MOMENTS);
      if (saved !== null) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) {
          // Permanently filter out any deleted photos
          return parsed.filter((m: Moment) => !deletedIds.includes(m.id));
        }
      }
      // If first launch, load defaults excluding any permanently deleted IDs
      return DEFAULT_MOMENTS.filter((m) => !deletedIds.includes(m.id));
    } catch (e) {
      console.error('Failed to load moments from localStorage', e);
    }
    return DEFAULT_MOMENTS;
  });

  // 5. Comments Map State
  const [commentsMap, setCommentsMap] = useState<Record<string, Comment[]>>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.COMMENTS_MAP);
      if (saved) {
        return JSON.parse(saved);
      }
    } catch (e) {
      console.error('Failed to load comments from localStorage', e);
    }
    return DEFAULT_COMMENTS_MAP;
  });

  // 6. User Liked Moments (Browser state)
  const [userLikedMoments, setUserLikedMoments] = useState<string[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.USER_LIKED_MOMENTS);
      if (saved) {
        return JSON.parse(saved);
      }
    } catch (e) {
      console.error('Failed to load liked moments', e);
    }
    return [];
  });

  // 7. Modals & UI Overlays
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
  const [isSystemModalOpen, setIsSystemModalOpen] = useState(false);
  const [editingMoment, setEditingMoment] = useState<Moment | null>(null);
  const [isAdminShieldOpen, setIsAdminShieldOpen] = useState(false);
  const [isAdminLoginModalOpen, setIsAdminLoginModalOpen] = useState(false);
  const [isAdminDashboardOpen, setIsAdminDashboardOpen] = useState(false);
  const [isFirebaseConfigOpen, setIsFirebaseConfigOpen] = useState(false);

  // 8. Toast Notifications
  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  const showToast = (text: string, type: 'success' | 'error' | 'info' = 'info') => {
    const id = `toast-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`;
    setToasts((prev) => [...prev, { id, text, type }]);
    setTimeout(() => {
      dismissToast(id);
    }, 3800);
  };

  const dismissToast = (id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  // Sync state changes to localStorage
  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.LANGUAGE, language);
  }, [language]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.ADMIN_AUTH, isAdmin ? 'true' : 'false');
  }, [isAdmin]);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEYS.SYSTEM_SETTINGS, JSON.stringify(systemSettings));
    } catch (e) {
      console.error('Failed to save system settings', e);
    }
    // Also sync system settings to Firestore database
    saveSystemSettingsToFirestore(systemSettings).catch((err) => {
      console.warn('Could not sync system settings to Firestore', err);
    });
  }, [systemSettings]);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEYS.CUSTOM_MOMENTS, JSON.stringify(moments));
    } catch (e) {
      console.error('Failed to save moments', e);
    }
  }, [moments]);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEYS.COMMENTS_MAP, JSON.stringify(commentsMap));
    } catch (e) {
      console.error('Failed to save comments', e);
    }
  }, [commentsMap]);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEYS.USER_LIKED_MOMENTS, JSON.stringify(userLikedMoments));
    } catch (e) {
      console.error('Failed to save user liked moments', e);
    }
  }, [userLikedMoments]);

  // Realtime Firebase Auth Observer
  useEffect(() => {
    const unsubscribeAuth = subscribeToAuth((user) => {
      setAdminUser(user);
      if (user) {
        setIsAdmin(true);
      }
    });
    return () => unsubscribeAuth();
  }, []);

  // Realtime Firestore System Settings (Profile photo, about info, etc.)
  useEffect(() => {
    const unsubscribeSettings = subscribeToSystemSettings((remoteSettings) => {
      if (remoteSettings && remoteSettings.profile) {
        setSystemSettings((prev) => {
          const localModified = prev.lastModified || 0;
          let remoteModified = 0;
          if (typeof remoteSettings.lastModified === 'number') {
            remoteModified = remoteSettings.lastModified;
          } else if (remoteSettings.updatedAt?.toMillis) {
            remoteModified = remoteSettings.updatedAt.toMillis();
          } else if (remoteSettings.updatedAt) {
            remoteModified = new Date(remoteSettings.updatedAt).getTime();
          }

          // If local modification is strictly newer than incoming remote snapshot, keep local!
          if (localModified > 0 && remoteModified > 0 && remoteModified < localModified) {
            return prev;
          }

          // Merge profile, keeping heroImage valid
          const mergedHeroImage = remoteSettings.profile.heroImage || prev.profile.heroImage;

          return {
            ...prev,
            ...remoteSettings,
            profile: {
              ...prev.profile,
              ...remoteSettings.profile,
              heroImage: mergedHeroImage,
            },
            lastModified: Math.max(localModified, remoteModified),
          };
        });
      }
    });
    return () => unsubscribeSettings();
  }, []);

  // Realtime Firestore Images Subscriber
  useEffect(() => {
    const unsubscribeImages = subscribeToClipzoneImages((fbImages) => {
      if (fbImages && fbImages.length > 0) {
        const deletedIdsStr = localStorage.getItem(STORAGE_KEYS.DELETED_MOMENT_IDS);
        const deletedIds: string[] = deletedIdsStr ? JSON.parse(deletedIdsStr) : [];

        // Convert Firestore images to moments
        const convertedMoments = fbImages
          .filter((img) => !deletedIds.includes(img.id))
          .map(clipzoneImageToMoment);

        setMoments((prev) => {
          const prevMap = new Map<string, Moment>(prev.map((m) => [m.id, m]));

          const mergedFb = convertedMoments.map((remoteM) => {
            const localM = prevMap.get(remoteM.id);
            if (localM && localM.lastModified) {
              const remoteTime = remoteM.uploadedAt ? new Date(remoteM.uploadedAt).getTime() : 0;
              // If local edit is newer, preserve local version
              if (localM.lastModified > remoteTime) {
                return localM;
              }
            }
            return remoteM;
          });

          const fbIdSet = new Set(convertedMoments.map((m) => m.id));
          const existingNonFb = prev.filter((m) => !fbIdSet.has(m.id) && !deletedIds.includes(m.id));
          return [...mergedFb, ...existingNonFb];
        });
      }
    });

    return () => unsubscribeImages();
  }, []);

  // Handlers
  const handleToggleLanguage = () => {
    const nextLang = language === 'EN' ? 'NE' : 'EN';
    setLanguage(nextLang);
    showToast(
      nextLang === 'NE' ? 'भाषा नेपालीमा परिवर्तन गरियो' : 'Language switched to English',
      'info'
    );
  };

  const handleSecretAdminLogin = () => {
    setIsAdmin(true);
    setIsAdminShieldOpen(true);
    showToast(
      language === 'NE' ? 'गोप्य प्रशासक प्रमाणीकरण सफल भयो!' : 'Secret Administrator access verified!',
      'success'
    );
  };

  const handleConfirmShieldClose = () => {
    setIsAdminShieldOpen(false);
    setIsAdminDashboardOpen(true);
  };

  const handleLogoutAdmin = () => {
    setIsAdmin(false);
    setAdminUser(null);
    localStorage.removeItem(LOCAL_ADMIN_STORAGE_KEY);
    showToast(
      language === 'NE' ? 'प्रशासक मोडबाट लगआउट भयो।' : 'Logged out of Admin Mode.',
      'info'
    );
  };

  const handleAddMoment = (newMoment: Moment) => {
    const momentWithTimestamp: Moment = {
      ...newMoment,
      lastModified: Date.now(),
    };

    // If this ID was previously marked deleted, remove it from tombstone blacklist
    try {
      const deletedIdsStr = localStorage.getItem(STORAGE_KEYS.DELETED_MOMENT_IDS);
      if (deletedIdsStr) {
        const deletedIds: string[] = JSON.parse(deletedIdsStr);
        const nextDeleted = deletedIds.filter((id) => id !== newMoment.id);
        localStorage.setItem(STORAGE_KEYS.DELETED_MOMENT_IDS, JSON.stringify(nextDeleted));
      }
    } catch (e) {
      console.error(e);
    }
    setMoments((prev) => [momentWithTimestamp, ...prev]);
  };

  const handleUpdateMoment = async (updated: Moment) => {
    const momentWithTimestamp: Moment = {
      ...updated,
      lastModified: Date.now(),
    };

    // 1. Update state
    setMoments((prev) => prev.map((m) => (m.id === updated.id ? momentWithTimestamp : m)));

    // 2. Persist to localStorage immediately
    try {
      const savedStr = localStorage.getItem(STORAGE_KEYS.CUSTOM_MOMENTS);
      const currentList: Moment[] = savedStr ? JSON.parse(savedStr) : [];
      const updatedList = currentList.map((m) => (m.id === updated.id ? momentWithTimestamp : m));
      localStorage.setItem(STORAGE_KEYS.CUSTOM_MOMENTS, JSON.stringify(updatedList));
    } catch (e) {
      console.error('Failed to immediately persist updated moment', e);
    }

    // 3. Sync update to Firestore
    try {
      await updateClipzoneImage(updated.id, {
        title: updated.titleEn,
        titleNe: updated.titleNe,
        description: updated.descEn,
        descNe: updated.descNe,
        imgUrl: updated.imgUrl,
        category: updated.category,
        likes: updated.likes,
      });
    } catch (e) {
      console.warn('Firestore update sync notice:', e);
    }
  };

  const handleDeleteMoment = async (id: string) => {
    // 1. Permanently record this ID into deleted blacklist in localStorage
    try {
      const deletedIdsStr = localStorage.getItem(STORAGE_KEYS.DELETED_MOMENT_IDS);
      const deletedIds: string[] = deletedIdsStr ? JSON.parse(deletedIdsStr) : [];
      if (!deletedIds.includes(id)) {
        deletedIds.push(id);
        localStorage.setItem(STORAGE_KEYS.DELETED_MOMENT_IDS, JSON.stringify(deletedIds));
      }
    } catch (e) {
      console.error('Failed to update permanent deleted IDs', e);
    }

    // 2. Remove photo permanently from moments state and immediate localStorage
    setMoments((prev) => {
      const remaining = prev.filter((m) => m.id !== id);
      try {
        localStorage.setItem(STORAGE_KEYS.CUSTOM_MOMENTS, JSON.stringify(remaining));
      } catch (e) {
        console.error('Failed to persist moments after deletion', e);
      }
      return remaining;
    });

    // 3. Delete from Firebase Firestore and Firebase Storage if connected
    try {
      await deleteClipzoneImage(id);
    } catch (e) {
      console.warn('Firebase deletion notice:', e);
    }

    // 4. Purge associated comments from state and localStorage
    setCommentsMap((prev) => {
      const nextComments = { ...prev };
      delete nextComments[id];
      try {
        localStorage.setItem(STORAGE_KEYS.COMMENTS_MAP, JSON.stringify(nextComments));
      } catch (e) {
        console.error('Failed to clean comments', e);
      }
      return nextComments;
    });

    // 5. Purge from user liked moments
    setUserLikedMoments((prev) => {
      const nextLikes = prev.filter((item) => item !== id);
      try {
        localStorage.setItem(STORAGE_KEYS.USER_LIKED_MOMENTS, JSON.stringify(nextLikes));
      } catch (e) {
        console.error('Failed to clean likes', e);
      }
      return nextLikes;
    });

    showToast(
      language === 'NE'
        ? 'तस्बिर स्थायी रूपमा मेटाइयो (रिकभर हुने छैन)।'
        : 'Photo permanently deleted from gallery & storage.',
      'info'
    );
  };

  const handleLikeMoment = (id: string) => {
    const isAlreadyLiked = userLikedMoments.includes(id);

    if (isAlreadyLiked) {
      // Unlike
      setUserLikedMoments((prev) => prev.filter((item) => item !== id));
      setMoments((prev) =>
        prev.map((m) => (m.id === id ? { ...m, likes: Math.max(0, m.likes - 1) } : m))
      );
      showToast(language === 'NE' ? 'प्रतिक्रिया हटाइयो' : 'Like removed', 'info');
    } else {
      // Like
      setUserLikedMoments((prev) => [...prev, id]);
      setMoments((prev) =>
        prev.map((m) => (m.id === id ? { ...m, likes: m.likes + 1 } : m))
      );
      showToast(language === 'NE' ? 'तपाईँको प्रतिक्रिया सुरक्षित भयो! ❤️' : 'Thanks for your like! ❤️', 'success');
    }
  };

  const handleAutoBoostAllLikes = () => {
    const minRange = systemSettings.autoLikes.defaultBoostRangeMin || 150;
    const maxRange = systemSettings.autoLikes.defaultBoostRangeMax || 450;

    setMoments((prev) =>
      prev.map((m) => {
        const boost = Math.floor(Math.random() * (maxRange - minRange + 1)) + minRange;
        return {
          ...m,
          likes: m.likes + boost,
        };
      })
    );

    showToast(
      language === 'NE'
        ? '⚡ सबै ग्यालरी तस्बिरहरूमा स्वतः लाइक्स वृद्धि गरियो!'
        : '⚡ Auto-boost applied! Photo engagement updated across gallery.',
      'success'
    );
  };

  const handleAddComment = (momentId: string, author: string, text: string) => {
    const newComment: Comment = {
      id: `comment-${Date.now()}`,
      momentId,
      author,
      text,
      createdAt: new Date().toISOString(),
    };

    setCommentsMap((prev) => {
      const currentList = prev[momentId] || [];
      return {
        ...prev,
        [momentId]: [newComment, ...currentList],
      };
    });
  };

  const handleDeleteComment = (momentId: string, commentId: string) => {
    setCommentsMap((prev) => {
      const currentList = prev[momentId] || [];
      const updatedList = currentList.filter((c) => c.id !== commentId);
      const nextMap = { ...prev, [momentId]: updatedList };
      try {
        localStorage.setItem(STORAGE_KEYS.COMMENTS_MAP, JSON.stringify(nextMap));
      } catch (e) {
        console.error(e);
      }
      return nextMap;
    });
    showToast(
      language === 'NE' ? 'प्रतिक्रिया हटाइयो।' : 'Comment deleted.',
      'info'
    );
  };

  const handleSaveSystemSettings = (updated: SystemSettings) => {
    setSystemSettings(updated);
  };

  const handleResetToDefaults = () => {
    setSystemSettings(DEFAULT_SYSTEM_SETTINGS);
    const deletedIdsStr = localStorage.getItem(STORAGE_KEYS.DELETED_MOMENT_IDS);
    const deletedIds: string[] = deletedIdsStr ? JSON.parse(deletedIdsStr) : [];
    const nonDeletedMoments = DEFAULT_MOMENTS.filter((m) => !deletedIds.includes(m.id));
    setMoments(nonDeletedMoments);
    setCommentsMap(DEFAULT_COMMENTS_MAP);
    setUserLikedMoments([]);
  };

  const totalMoments = moments.length;
  const totalLikes = moments.reduce((acc, m) => acc + (m.likes || 0), 0);

  // Convert moments to ClipzoneImage array for AdminDashboard
  const clipzoneImages: ClipzoneImage[] = moments.map(momentToClipzoneImage);

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col selection:bg-blue-600 selection:text-white">
      {/* Toast Notification Container */}
      <ToastContainer toasts={toasts} onDismiss={dismissToast} />

      {/* Secret Admin Unlock Overlay */}
      <AdminShieldOverlay
        isOpen={isAdminShieldOpen}
        onClose={handleConfirmShieldClose}
        language={language}
      />

      {/* Sticky Navigation Bar */}
      <Navbar
        language={language}
        onToggleLanguage={handleToggleLanguage}
        isAdmin={isAdmin}
        onLogoutAdmin={handleLogoutAdmin}
        onOpenUploadModal={() => setIsAdminDashboardOpen(true)}
        onOpenSystemModal={() => setIsSystemModalOpen(true)}
        onOpenAdminLogin={() => setIsAdminLoginModalOpen(true)}
        onOpenAdminDashboard={() => setIsAdminDashboardOpen(true)}
        onOpenFirebaseConfig={() => setIsFirebaseConfigOpen(true)}
        profile={systemSettings.profile}
      />

      {/* Main Page Content */}
      <main className="flex-1">
        {/* Hero Section */}
        <Header
          language={language}
          profile={systemSettings.profile}
          isAdmin={isAdmin}
          onOpenSystemModal={() => setIsSystemModalOpen(true)}
          totalMoments={totalMoments}
          totalLikes={totalLikes}
        />

        {/* About Section */}
        <AboutSection
          language={language}
          about={systemSettings.about}
        />

        {/* Visual Journey & Uncropped Photo Gallery */}
        <JourneySection
          language={language}
          moments={moments}
          isAdmin={isAdmin}
          onOpenUploadModal={() => setIsAdminDashboardOpen(true)}
          onOpenEditModal={(m) => setEditingMoment(m)}
          onDeleteMoment={handleDeleteMoment}
          onLikeMoment={handleLikeMoment}
          userLikedMoments={userLikedMoments}
          onAutoBoostAllLikes={handleAutoBoostAllLikes}
          commentsMap={commentsMap}
          onAddComment={handleAddComment}
          onDeleteComment={handleDeleteComment}
          onShowToast={showToast}
        />

        {/* Experience & Competencies Section */}
        <ExperienceSection
          language={language}
          experience={systemSettings.experience}
        />

        {/* Contact Section & Secret Admin Login Gateway */}
        <ContactSection
          language={language}
          contact={systemSettings.contact}
          onSecretAdminLogin={handleSecretAdminLogin}
          onShowToast={showToast}
        />
      </main>

      {/* Footer */}
      <Footer
        language={language}
        profile={systemSettings.profile}
        isAdmin={isAdmin}
        onOpenAdminLogin={() => setIsAdminLoginModalOpen(true)}
      />

      {/* Full-Stack Admin Image Dashboard (Firebase Storage, Firestore, Auth) */}
      <AdminDashboard
        isOpen={isAdminDashboardOpen}
        onClose={() => setIsAdminDashboardOpen(false)}
        language={language}
        adminUser={adminUser}
        images={clipzoneImages}
        onImagesChange={(updatedImages) => {
          setMoments(updatedImages.map(clipzoneImageToMoment));
        }}
        onOpenFirebaseConfig={() => setIsFirebaseConfigOpen(true)}
        onShowToast={showToast}
        profile={systemSettings.profile}
        onUpdateProfilePhoto={(newUrl) => {
          setSystemSettings((prev) => ({
            ...prev,
            profile: {
              ...prev.profile,
              heroImage: newUrl,
            },
            lastModified: Date.now(),
          }));
        }}
        onOpenSystemModal={() => setIsSystemModalOpen(true)}
      />

      {/* Dedicated Firebase Configuration Modal */}
      <FirebaseConfigModal
        isOpen={isFirebaseConfigOpen}
        onClose={() => setIsFirebaseConfigOpen(false)}
        onShowToast={showToast}
      />

      {/* Legacy/Quick Photo Upload Modal */}
      <PhotoUploadModal
        isOpen={isUploadModalOpen}
        onClose={() => setIsUploadModalOpen(false)}
        language={language}
        onAddMoment={handleAddMoment}
        onShowToast={showToast}
      />

      {/* Edit Moment Metadata & Likes Modal */}
      <EditMomentModal
        moment={editingMoment}
        isOpen={!!editingMoment}
        onClose={() => setEditingMoment(null)}
        language={language}
        onUpdateMoment={handleUpdateMoment}
        onDeleteMoment={handleDeleteMoment}
        onShowToast={showToast}
      />

      {/* System-Wide Admin CMS Modal */}
      <AdminSystemModal
        isOpen={isSystemModalOpen}
        onClose={() => setIsSystemModalOpen(false)}
        language={language}
        systemSettings={systemSettings}
        onSaveSystemSettings={handleSaveSystemSettings}
        onResetToDefaults={handleResetToDefaults}
        onAutoBoostAllLikes={handleAutoBoostAllLikes}
        onShowToast={showToast}
        moments={moments}
        onDeleteMoment={handleDeleteMoment}
        onOpenUploadModal={() => setIsAdminDashboardOpen(true)}
      />

      {/* Admin Login Modal (Firebase Auth & Demo Bypass) */}
      <AdminLoginModal
        isOpen={isAdminLoginModalOpen}
        onClose={() => setIsAdminLoginModalOpen(false)}
        onSuccess={(user) => {
          setIsAdmin(true);
          setAdminUser(user);
          setIsAdminDashboardOpen(true);
        }}
        language={language}
        onOpenFirebaseConfig={() => setIsFirebaseConfigOpen(true)}
        onShowToast={showToast}
      />
    </div>
  );
}
