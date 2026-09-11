/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { Navbar } from './components/Navbar';
import { Header } from './components/Header';
import { AboutSection } from './components/AboutSection';
import { ExperienceSection } from './components/ExperienceSection';
import { ContactSection } from './components/ContactSection';
import { Footer } from './components/Footer';
import { ToastContainer, ToastMessage } from './components/Toast';
import { WhatsAppFloatingButton } from './components/WhatsAppFloatingButton';

import { Language, Moment, Comment, SystemSettings, ClipzoneImage } from './types';
import {
  STORAGE_KEYS,
  DEFAULT_SYSTEM_SETTINGS,
  DEFAULT_MOMENTS,
  DEFAULT_COMMENTS_MAP,
} from './data/defaults';
import {
  subscribeToClipzoneImages,
  subscribeToSystemSettings,
} from './services/firebase';

const FIXED_HERO_IMAGE =
  'https://blogger.googleusercontent.com/img/b/R29vZ2xl/AVvXsEhi7Uh94xTz0y-F0J_tapw44abY8zaSaDjrnGVWMyV-Odly0GMfSYtxK8FVOnFsFi0Nw_IveBY14ECZbwVtn2ab2u2OvbFFjr65hVXXuQKDmFh-U3RzfY1nOfUUF5d11Rjx6cWLUBamvlr4FrpncgobVp_itVNzzeXUKiFeD1UppSfItN2dxNhMq9Tu_JUO/s1372/20602.jpg';

// Helper converter functions
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
  lastModified: Date.now(),
});

export default function App() {
  // 1. Language State
  const [language, setLanguage] = useState<Language>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.LANGUAGE);
    return saved === 'NE' || saved === 'EN' ? saved : 'EN';
  });

  // Helper to ensure profile and about settings strictly reflect developer/student/AI explainer status
  const sanitizeSettings = (raw: any): SystemSettings => {
    return {
      ...DEFAULT_SYSTEM_SETTINGS,
      ...(raw || {}),
      profile: {
        ...DEFAULT_SYSTEM_SETTINGS.profile,
        ...(raw?.profile || {}),
        name: 'Rajababu Mehta',
        titleEn: DEFAULT_SYSTEM_SETTINGS.profile.titleEn,
        titleNe: DEFAULT_SYSTEM_SETTINGS.profile.titleNe,
        taglineEn: DEFAULT_SYSTEM_SETTINGS.profile.taglineEn,
        taglineNe: DEFAULT_SYSTEM_SETTINGS.profile.taglineNe,
        welcomeBadgeEn: DEFAULT_SYSTEM_SETTINGS.profile.welcomeBadgeEn,
        welcomeBadgeNe: DEFAULT_SYSTEM_SETTINGS.profile.welcomeBadgeNe,
        heroImage: FIXED_HERO_IMAGE,
      },
      about: {
        ...DEFAULT_SYSTEM_SETTINGS.about,
        ...(raw?.about || {}),
        headingEn: DEFAULT_SYSTEM_SETTINGS.about.headingEn,
        headingNe: DEFAULT_SYSTEM_SETTINGS.about.headingNe,
        badgeEn: DEFAULT_SYSTEM_SETTINGS.about.badgeEn,
        badgeNe: DEFAULT_SYSTEM_SETTINGS.about.badgeNe,
        bioParagraph1En: DEFAULT_SYSTEM_SETTINGS.about.bioParagraph1En,
        bioParagraph1Ne: DEFAULT_SYSTEM_SETTINGS.about.bioParagraph1Ne,
        bioParagraph2En: DEFAULT_SYSTEM_SETTINGS.about.bioParagraph2En,
        bioParagraph2Ne: DEFAULT_SYSTEM_SETTINGS.about.bioParagraph2Ne,
        mottoEn: DEFAULT_SYSTEM_SETTINGS.about.mottoEn,
        mottoNe: DEFAULT_SYSTEM_SETTINGS.about.mottoNe,
        values: DEFAULT_SYSTEM_SETTINGS.about.values,
      },
      experience: {
        ...DEFAULT_SYSTEM_SETTINGS.experience,
        ...(raw?.experience || {}),
      },
      contact: {
        ...DEFAULT_SYSTEM_SETTINGS.contact,
        ...(raw?.contact || {}),
        headingEn: '',
        headingNe: '',
        email: 'rajababum426@gmail.com',
        phone: '9816689232',
        locationEn: 'Birgunj, Nepal',
        locationNe: 'वीरगञ्ज, नेपाल',
        facebookUrl: 'https://www.facebook.com/share/18hGohd9z5/',
        instagramUrl: 'https://www.instagram.com/mr.rajababumehta',
        whatsappNumber: '9816689232',
      },
      autoLikes: {
        ...DEFAULT_SYSTEM_SETTINGS.autoLikes,
        ...(raw?.autoLikes || {}),
      },
    };
  };

  // 2. System Settings State (Profile, About, Experience, Contact, AutoLikes)
  const [systemSettings, setSystemSettings] = useState<SystemSettings>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.SYSTEM_SETTINGS);
      if (saved) {
        const parsed = JSON.parse(saved);
        const cleaned = sanitizeSettings(parsed);
        localStorage.setItem(STORAGE_KEYS.SYSTEM_SETTINGS, JSON.stringify(cleaned));
        return cleaned;
      }
    } catch (e) {
      console.error('Failed to load system settings from localStorage', e);
    }
    return DEFAULT_SYSTEM_SETTINGS;
  });

  // 3. Moments Gallery State
  const [moments, setMoments] = useState<Moment[]>(() => {
    try {
      const deletedIdsStr = localStorage.getItem(STORAGE_KEYS.DELETED_MOMENT_IDS);
      const deletedIds: string[] = deletedIdsStr ? JSON.parse(deletedIdsStr) : [];

      const saved = localStorage.getItem(STORAGE_KEYS.CUSTOM_MOMENTS);
      if (saved !== null) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) {
          // Filter out legacy unsplash mock images, ai generated images and deleted IDs
          const validMoments = parsed.filter(
            (m: Moment) =>
              !deletedIds.includes(m.id) &&
              !m.imgUrl?.includes('unsplash.com') &&
              !m.imgUrl?.includes('rajababu_nature_moment') &&
              !['moment-1', 'moment-2', 'moment-3', 'moment-4', 'moment-5', 'moment-6', 'moment-rajababu-nature'].includes(m.id)
          );
          if (validMoments.length > 0) {
            return validMoments;
          }
        }
      }
      return DEFAULT_MOMENTS.filter((m) => !deletedIds.includes(m.id));
    } catch (e) {
      console.error('Failed to load moments from localStorage', e);
    }
    return DEFAULT_MOMENTS;
  });

  // 4. Comments Map State
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

  // 5. User Liked Moments (Browser state)
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

  // 6. Toast Notifications
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
    document.title =
      language === 'NE'
        ? 'राजाबाबु मेहता | वेबसाइट डेभलपर, विद्यार्थी तथा एआई व्याख्याकर्ता - वीरगञ्ज'
        : 'Rajababu Mehta | Website Developer, Student & AI Explainer - Birgunj, Nepal';
  }, [language]);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEYS.SYSTEM_SETTINGS, JSON.stringify(systemSettings));
    } catch (e) {
      console.error('Failed to save system settings', e);
    }
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

  // Realtime Firestore System Settings (About info, stats, etc.)
  useEffect(() => {
    const unsubscribeSettings = subscribeToSystemSettings((remoteSettings) => {
      if (remoteSettings) {
        setSystemSettings((prev) => {
          const merged = sanitizeSettings({
            ...prev,
            ...remoteSettings,
          });
          return merged;
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

        const convertedMoments = fbImages
          .filter((img) => !deletedIds.includes(img.id))
          .map(clipzoneImageToMoment);

        setMoments((prev) => {
          const fbIdSet = new Set(convertedMoments.map((m) => m.id));
          const existingNonFb = prev.filter((m) => !fbIdSet.has(m.id) && !deletedIds.includes(m.id));
          return [...convertedMoments, ...existingNonFb];
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
    const minRange = systemSettings.autoLikes?.defaultBoostRangeMin || 150;
    const maxRange = systemSettings.autoLikes?.defaultBoostRangeMax || 450;

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

  const totalMoments = moments.length;
  const totalLikes = moments.reduce((acc, m) => acc + (m.likes || 0), 0);

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col selection:bg-blue-600 selection:text-white">
      {/* Toast Notification Container */}
      <ToastContainer toasts={toasts} onDismiss={dismissToast} />

      {/* Sticky Navigation Bar */}
      <Navbar
        language={language}
        onToggleLanguage={handleToggleLanguage}
        profile={systemSettings.profile}
      />

      {/* Main Page Content */}
      <main className="flex-1">
        {/* Hero Section */}
        <Header
          language={language}
          profile={systemSettings.profile}
        />

        {/* About Section */}
        <AboutSection
          language={language}
          about={systemSettings.about}
        />

        {/* Experience & Competencies Section */}
        <ExperienceSection
          language={language}
          experience={systemSettings.experience}
        />

        {/* Contact Section */}
        <ContactSection
          language={language}
          contact={systemSettings.contact}
          onShowToast={showToast}
        />
      </main>

      {/* Footer */}
      <Footer
        language={language}
        profile={systemSettings.profile}
      />

      {/* Floating Circle WhatsApp Button in Bottom Right */}
      <WhatsAppFloatingButton
        language={language}
        whatsappNumber={systemSettings.contact.whatsappNumber}
      />
    </div>
  );
}
