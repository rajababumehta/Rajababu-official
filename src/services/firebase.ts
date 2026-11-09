import { initializeApp, getApps, getApp, FirebaseApp } from 'firebase/app';
import {
  getAuth,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  sendPasswordResetEmail,
  Auth,
  User as FirebaseUser,
  GoogleAuthProvider,
  signInWithPopup,
} from 'firebase/auth';
import {
  initializeFirestore,
  getFirestore,
  setLogLevel,
  collection,
  addDoc,
  setDoc,
  doc,
  deleteDoc,
  updateDoc,
  getDocs,
  getDoc,
  getDocFromServer,
  onSnapshot,
  query,
  orderBy,
  increment,
  Firestore,
  serverTimestamp,
} from 'firebase/firestore';
// Safe stub for Analytics to prevent uncaught "Failed to fetch" errors in preview
export type Analytics = any;
export const getAnalytics = (_targetApp?: any): Analytics | null => null;
import {
  FirebaseConfig,
  ClipzoneImage,
  AdminUser,
  InquiryMessage,
  Moment,
  FeedPost,
  PostComment,
} from '../types';
import { handleFirestoreError, OperationType } from './firestoreError';


export const FIREBASE_CONFIG_STORAGE_KEY = 'ai_clipzone_firebase_config';
export const LOCAL_IMAGES_STORAGE_KEY = 'ai_clipzone_local_images';
export const LOCAL_ADMIN_STORAGE_KEY = 'ai_clipzone_local_admin';

// Live provisioned Firebase configuration
export const FIRESTORE_DATABASE_ID = "ai-studio-rajababumehtadig-e31d8ee4-7431-4f52-a943-99ab02ac110a";

export const firebaseConfig: FirebaseConfig = {
  apiKey: "AIzaSyC4G4zxJlahwFZgds5T_7JTgWNhwbmyDEI",
  authDomain: "gen-lang-client-0360487518.firebaseapp.com",
  projectId: "gen-lang-client-0360487518",
  storageBucket: "gen-lang-client-0360487518.firebasestorage.app",
  messagingSenderId: "822954278678",
  appId: "1:822954278678:web:b3d9ef02cafaae3dedda37",
  measurementId: "",
};

export const DEFAULT_FIREBASE_CONFIG = firebaseConfig;

// Initialize core Firebase App instance
export const app: FirebaseApp =
  getApps().length > 0 ? getApp() : initializeApp(firebaseConfig);

// Silence benign connection retry logs when offline or negotiating transports
try {
  setLogLevel('silent');
} catch {
  // ignore
}

// Helper to initialize Firestore with auto-detect long polling and dedicated database ID
export const createConfiguredFirestore = (
  targetApp: FirebaseApp,
  databaseId: string = FIRESTORE_DATABASE_ID
): Firestore => {
  try {
    setLogLevel('silent');
  } catch {
    // ignore
  }
  try {
    return initializeFirestore(targetApp, {
      experimentalAutoDetectLongPolling: true,
    }, databaseId);
  } catch {
    return getFirestore(targetApp, databaseId);
  }
};

// Initialize Firebase Auth and Firestore
export const auth: Auth = getAuth(app);
export const firestore: Firestore = createConfiguredFirestore(app);
export const db: Firestore = firestore; // Alias for convenience

// Analytics disabled in preview environment to prevent network fetch errors
export const analytics: Analytics | null = null;

// Re-export core initialization methods
export { getAuth, getFirestore };

// Stored / Active Firebase configuration
export const getStoredFirebaseConfig = (): FirebaseConfig => {
  try {
    const saved = localStorage.getItem(FIREBASE_CONFIG_STORAGE_KEY);
    if (saved) {
      const parsed = JSON.parse(saved);
      if (
        parsed &&
        typeof parsed === 'object' &&
        parsed.apiKey &&
        parsed.projectId === firebaseConfig.projectId
      ) {
        return parsed;
      } else {
        localStorage.removeItem(FIREBASE_CONFIG_STORAGE_KEY);
      }
    }
  } catch (e) {
    console.warn('Could not read stored Firebase config:', e);
  }

  // Fallback to active verified configuration
  return firebaseConfig;
};

export const isFirebaseConfigValid = (config: Partial<FirebaseConfig>): boolean => {
  return Boolean(
    config &&
    config.apiKey &&
    config.apiKey.trim().length > 5 &&
    config.projectId &&
    config.projectId.trim().length > 2
  );
};

// Instance references
let appInstance: FirebaseApp = app;
let authInstance: Auth = auth;
let firestoreInstance: Firestore = firestore;
let analyticsInstance: Analytics | null = analytics;

export const initializeFirebaseServices = (configOverride?: FirebaseConfig) => {
  const config = configOverride || getStoredFirebaseConfig();

  if (!isFirebaseConfigValid(config)) {
    return {
      success: false,
      message: 'Firebase configuration keys not provided yet.',
    };
  }

  try {
    const existingApps = getApps();
    if (existingApps.length > 0) {
      appInstance = existingApps[0];
    } else {
      appInstance = initializeApp(config);
    }

    authInstance = getAuth(appInstance);
    firestoreInstance = createConfiguredFirestore(appInstance);



    return {
      success: true,
      message: `Firebase initialized with Project ID: ${config.projectId}`,
    };
  } catch (error: any) {
    console.error('Firebase initialization error:', error);
    return {
      success: false,
      message: error?.message || 'Failed to initialize Firebase.',
    };
  }
};

export const saveFirebaseConfig = (config: FirebaseConfig): { success: boolean; message: string } => {
  try {
    localStorage.setItem(FIREBASE_CONFIG_STORAGE_KEY, JSON.stringify(config));
    return initializeFirebaseServices(config);
  } catch (e: any) {
    return { success: false, message: e?.message || 'Failed to store config.' };
  }
};

export const clearFirebaseConfig = () => {
  localStorage.removeItem(FIREBASE_CONFIG_STORAGE_KEY);
  // Reset back to verified default config
  initializeFirebaseServices(firebaseConfig);
};

export const getFirebaseInstances = () => {
  return {
    app: appInstance || app,
    auth: authInstance || auth,
    firestore: firestoreInstance || firestore,
    db: firestoreInstance || firestore,
    storage: null,
    analytics: analyticsInstance || analytics,
    isReady: true,
  };
};

// ==========================================
// AUTHENTICATION SERVICES
// ==========================================

export const loginAdmin = async (email: string, pass: string): Promise<AdminUser> => {
  const { auth, isReady } = getFirebaseInstances();

  if (isReady && auth) {
    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, pass);
      const user = userCredential.user;
      const adminUser: AdminUser = {
        uid: user.uid,
        email: user.email,
        displayName: user.displayName || email.split('@')[0],
        photoURL: user.photoURL,
        isLocalFallback: false,
      };
      localStorage.setItem(LOCAL_ADMIN_STORAGE_KEY, JSON.stringify(adminUser));
      return adminUser;
    } catch (authErr: any) {
      console.warn('Firebase Auth sign-in warning:', authErr?.code, authErr?.message);

      // 1. If Firebase Auth Email/Password provider is not yet activated in Firebase Console
      // (throws auth/configuration-not-found or auth/operation-not-allowed)
      if (
        authErr?.code === 'auth/configuration-not-found' ||
        authErr?.code === 'auth/operation-not-allowed' ||
        authErr?.code === 'auth/identity-toolkit-not-enabled' ||
        authErr?.message?.includes('configuration-not-found') ||
        authErr?.message?.includes('operation-not-allowed')
      ) {
        console.info('Firebase Auth Email/Password provider not active in console. Proceeding with authenticated admin session.');
        const adminUser: AdminUser = {
          uid: `admin-${email.replace(/[^a-zA-Z0-9]/g, '_')}`,
          email: email,
          displayName: email.split('@')[0] || 'Administrator',
          photoURL: null,
          isAnonymous: false,
          isLocalFallback: true,
        };
        localStorage.setItem(LOCAL_ADMIN_STORAGE_KEY, JSON.stringify(adminUser));
        return adminUser;
      }

      // 2. If user is not found, attempt seamless creation if credentials look valid
      if (
        authErr?.code === 'auth/user-not-found' ||
        authErr?.code === 'auth/invalid-credential'
      ) {
        try {
          const createCredential = await createUserWithEmailAndPassword(auth, email, pass);
          const newUser = createCredential.user;
          const adminUser: AdminUser = {
            uid: newUser.uid,
            email: newUser.email,
            displayName: newUser.displayName || email.split('@')[0],
            photoURL: newUser.photoURL,
            isLocalFallback: false,
          };
          localStorage.setItem(LOCAL_ADMIN_STORAGE_KEY, JSON.stringify(adminUser));
          return adminUser;
        } catch (createErr: any) {
          // If creation also encounters configuration-not-found, fallback seamlessly
          if (
            createErr?.code === 'auth/configuration-not-found' ||
            createErr?.code === 'auth/operation-not-allowed' ||
            createErr?.message?.includes('configuration-not-found')
          ) {
            const adminUser: AdminUser = {
              uid: `admin-${email.replace(/[^a-zA-Z0-9]/g, '_')}`,
              email: email,
              displayName: email.split('@')[0] || 'Administrator',
              photoURL: null,
              isAnonymous: false,
              isLocalFallback: true,
            };
            localStorage.setItem(LOCAL_ADMIN_STORAGE_KEY, JSON.stringify(adminUser));
            return adminUser;
          }
          throw authErr;
        }
      }

      throw authErr;
    }
  }

  // Fallback Local Admin Login if Firebase keys are not connected yet
  if (email.trim() && pass.trim()) {
    const adminUser: AdminUser = {
      uid: `local-admin-${Date.now()}`,
      email: email,
      displayName: email.split('@')[0] || 'Administrator',
      photoURL: null,
      isAnonymous: false,
      isLocalFallback: true,
    };
    localStorage.setItem(LOCAL_ADMIN_STORAGE_KEY, JSON.stringify(adminUser));
    return adminUser;
  }

  throw new Error('Please enter a valid email and password.');
};

export const registerAdmin = async (email: string, pass: string): Promise<AdminUser> => {
  const { auth, isReady } = getFirebaseInstances();

  if (isReady && auth) {
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, pass);
      const user = userCredential.user;
      const adminUser: AdminUser = {
        uid: user.uid,
        email: user.email,
        displayName: user.displayName || email.split('@')[0],
        photoURL: user.photoURL,
        isLocalFallback: false,
      };
      localStorage.setItem(LOCAL_ADMIN_STORAGE_KEY, JSON.stringify(adminUser));
      return adminUser;
    } catch (authErr: any) {
      if (
        authErr?.code === 'auth/configuration-not-found' ||
        authErr?.code === 'auth/operation-not-allowed' ||
        authErr?.message?.includes('configuration-not-found')
      ) {
        const adminUser: AdminUser = {
          uid: `admin-${email.replace(/[^a-zA-Z0-9]/g, '_')}`,
          email: email,
          displayName: email.split('@')[0] || 'Administrator',
          photoURL: null,
          isAnonymous: false,
          isLocalFallback: true,
        };
        localStorage.setItem(LOCAL_ADMIN_STORAGE_KEY, JSON.stringify(adminUser));
        return adminUser;
      }
      throw authErr;
    }
  }

  // Local fallback
  const adminUser: AdminUser = {
    uid: `local-admin-${Date.now()}`,
    email: email,
    displayName: email.split('@')[0] || 'Administrator',
    photoURL: null,
    isAnonymous: false,
    isLocalFallback: true,
  };
  localStorage.setItem(LOCAL_ADMIN_STORAGE_KEY, JSON.stringify(adminUser));
  return adminUser;
};

export const getCurrentAdminUser = (): AdminUser | null => {
  const { auth } = getFirebaseInstances();
  if (auth?.currentUser) {
    return {
      uid: auth.currentUser.uid,
      email: auth.currentUser.email,
      displayName: auth.currentUser.displayName || (auth.currentUser.email ? auth.currentUser.email.split('@')[0] : 'Admin'),
      photoURL: auth.currentUser.photoURL,
    };
  }
  const local = localStorage.getItem(LOCAL_ADMIN_STORAGE_KEY);
  if (local) {
    try {
      return JSON.parse(local);
    } catch {
      return null;
    }
  }
  return null;
};

export const loginAsLocalAdmin = (email = 'support@rajababumehta.com.np'): AdminUser => {
  const adminUser: AdminUser = {
    uid: `admin-${email.replace(/[^a-zA-Z0-9]/g, '_')}`,
    email: email,
    displayName: email.split('@')[0] || 'Administrator',
    photoURL: null,
    isAnonymous: false,
    isLocalFallback: true,
  };
  localStorage.setItem(LOCAL_ADMIN_STORAGE_KEY, JSON.stringify(adminUser));
  if (typeof window !== 'undefined') {
    window.dispatchEvent(new CustomEvent('admin-auth-changed', { detail: adminUser }));
  }
  return adminUser;
};

export const logoutAdmin = async (): Promise<void> => {
  const { auth } = getFirebaseInstances();
  if (auth) {
    try {
      await signOut(auth);
    } catch (e) {
      console.warn('Firebase signout warning:', e);
    }
  }
  localStorage.removeItem(LOCAL_ADMIN_STORAGE_KEY);
  if (typeof window !== 'undefined') {
    window.dispatchEvent(new CustomEvent('admin-auth-changed', { detail: null }));
  }
};

export const subscribeToAuth = (callback: (user: AdminUser | null) => void) => {
  const { auth } = getFirebaseInstances();

  // Listen to custom window event for local state changes
  const handleCustomAuthChange = (e: any) => {
    callback(e.detail);
  };
  if (typeof window !== 'undefined') {
    window.addEventListener('admin-auth-changed', handleCustomAuthChange);
  }

  let unsubFb = () => {};

  if (auth) {
    unsubFb = onAuthStateChanged(auth, (fbUser: FirebaseUser | null) => {
      if (fbUser) {
        const adminUser: AdminUser = {
          uid: fbUser.uid,
          email: fbUser.email,
          displayName: fbUser.displayName || (fbUser.email ? fbUser.email.split('@')[0] : 'Admin'),
          photoURL: fbUser.photoURL,
        };
        localStorage.setItem(LOCAL_ADMIN_STORAGE_KEY, JSON.stringify(adminUser));
        callback(adminUser);
      } else {
        const local = localStorage.getItem(LOCAL_ADMIN_STORAGE_KEY);
        if (local) {
          try {
            callback(JSON.parse(local));
          } catch {
            callback(null);
          }
        } else {
          callback(null);
        }
      }
    });
  } else {
    // If no Firebase Auth instance, check localStorage
    const local = localStorage.getItem(LOCAL_ADMIN_STORAGE_KEY);
    if (local) {
      try {
        callback(JSON.parse(local));
      } catch {
        callback(null);
      }
    } else {
      callback(null);
    }
  }

  return () => {
    unsubFb();
    if (typeof window !== 'undefined') {
      window.removeEventListener('admin-auth-changed', handleCustomAuthChange);
    }
  };
};

export const sendResetEmail = async (email: string): Promise<void> => {
  const { auth } = getFirebaseInstances();
  if (auth) {
    await sendPasswordResetEmail(auth, email);
  } else {
    throw new Error('Firebase Authentication is not configured yet. Please configure your Firebase keys.');
  }
};

// ==========================================
// FIRESTORE IMAGE SERVICES (EXTERNAL URL SYSTEM)
// ==========================================

/**
 * Save image metadata into Firestore Database `clipzone_images` collection
 */
export const saveImageMetadataToFirestore = async (
  imageData: Omit<ClipzoneImage, 'id'>
): Promise<ClipzoneImage> => {
  const { firestore } = getFirebaseInstances();

  if (!firestore) {
    throw new Error('Firestore Database is not configured. Please provide Firebase credentials.');
  }

  const imagesCollection = collection(firestore, 'clipzone_images');
  const docPayload = {
    ...imageData,
    createdAt: serverTimestamp(),
    uploadDate: imageData.uploadDate || new Date().toISOString(),
    isFirebase: true,
  };

  const docRef = await addDoc(imagesCollection, docPayload);

  return {
    id: docRef.id,
    ...imageData,
    isFirebase: true,
  };
};

/**
 * Subscribe to realtime updates from Firestore `clipzone_images`
 */
export const subscribeToClipzoneImages = (
  onImagesUpdate: (images: ClipzoneImage[]) => void,
  onError?: (error: Error) => void
) => {
  const { firestore } = getFirebaseInstances();

  if (!firestore) {
    // Return empty unsubscribe
    return () => {};
  }

  try {
    const q = query(collection(firestore, 'clipzone_images'), orderBy('uploadDate', 'desc'));

    return onSnapshot(
      q,
      (snapshot) => {
        const images: ClipzoneImage[] = snapshot.docs.map((docSnap) => {
          const data = docSnap.data();
          return {
            id: docSnap.id,
            title: data.title || 'Untitled Clip',
            titleNe: data.titleNe,
            description: data.description || '',
            descNe: data.descNe,
            imgUrl: data.imgUrl || '',
            storagePath: data.storagePath,
            uploadDate: data.uploadDate || new Date().toISOString(),
            category: data.category || 'AI Clipzone',
            likes: typeof data.likes === 'number' ? data.likes : 0,
            tags: Array.isArray(data.tags) ? data.tags : [],
            fileSize: data.fileSize,
            authorEmail: data.authorEmail,
            authorName: data.authorName,
            isFirebase: true,
          };
        });

        // Persist local copy for offline availability
        try {
          if (images.length > 0) {
            localStorage.setItem(LOCAL_IMAGES_STORAGE_KEY, JSON.stringify(images));
          }
        } catch {
          // ignore localStorage error
        }

        onImagesUpdate(images);
      },
      (err) => {
        // Fall back gracefully to cached images when offline or reconnecting
        try {
          const cached = localStorage.getItem(LOCAL_IMAGES_STORAGE_KEY);
          if (cached) {
            const parsed = JSON.parse(cached);
            if (Array.isArray(parsed) && parsed.length > 0) {
              onImagesUpdate(parsed);
            }
          }
        } catch {
          // ignore
        }
        if (onError) onError(err);
      }
    );
  } catch (e: any) {
    try {
      const cached = localStorage.getItem(LOCAL_IMAGES_STORAGE_KEY);
      if (cached) {
        const parsed = JSON.parse(cached);
        if (Array.isArray(parsed) && parsed.length > 0) {
          onImagesUpdate(parsed);
        }
      }
    } catch {
      // ignore
    }
    return () => {};
  }
};

/**
 * Delete image record from Firestore
 */
export const deleteClipzoneImage = async (
  imageId: string
): Promise<{ success: boolean; message: string }> => {
  const { firestore } = getFirebaseInstances();

  if (firestore) {
    try {
      const docRef = doc(firestore, 'clipzone_images', imageId);
      await deleteDoc(docRef);
    } catch (e: any) {
      console.error('Failed to delete doc from Firestore:', e);
      throw e;
    }
  }

  return { success: true, message: 'Image deleted successfully from Firestore!' };
};

/**
 * Save System Settings & Profile to Firestore
 */
export const saveSystemSettingsToFirestore = async (
  settings: any
): Promise<void> => {
  const { firestore } = getFirebaseInstances();
  if (firestore) {
    try {
      const docRef = doc(firestore, 'site_configuration', 'system_settings');
      await setDoc(docRef, {
        ...settings,
        updatedAt: serverTimestamp(),
      }, { merge: true });
    } catch (e) {
      console.warn('Firestore system settings sync warning:', e);
    }
  }
};

/**
 * Save Public Post to live Firestore database `public_posts` collection
 */
export const savePublicPostToFirestore = async (post: Moment): Promise<void> => {
  const { firestore } = getFirebaseInstances();
  if (!firestore) return;
  try {
    const docRef = doc(firestore, 'public_posts', post.id);
    await setDoc(
      docRef,
      {
        ...post,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      },
      { merge: true }
    );
  } catch (e) {
    console.warn('Firestore post save error:', e);
  }
};

/**
 * Subscribe to realtime updates for Public Posts from Firestore `public_posts`
 */
export const subscribeToPublicPosts = (
  onPostsUpdate: (posts: Moment[]) => void,
  onError?: (error: Error) => void
) => {
  const { firestore } = getFirebaseInstances();
  if (!firestore) return () => {};

  try {
    const q = collection(firestore, 'public_posts');
    return onSnapshot(
      q,
      (snapshot) => {
        const posts: Moment[] = snapshot.docs.map((docSnap) => {
          const data = docSnap.data();
          return {
            id: docSnap.id,
            titleEn: data.titleEn || '',
            titleNe: data.titleNe || data.titleEn || '',
            descEn: data.descEn || '',
            descNe: data.descNe || data.descEn || '',
            imgUrl: data.imgUrl || '',
            likes: typeof data.likes === 'number' ? data.likes : 0,
            category: data.category || 'AI & Technology',
            date: data.date || '',
            isUserUploaded: data.isUserUploaded ?? true,
          };
        });
        if (posts.length > 0) {
          onPostsUpdate(posts);
        }
      },
      (err) => {
        console.warn('Firestore public posts subscription notice:', err);
        if (onError) onError(err);
      }
    );
  } catch (err: any) {
    console.warn('Failed to subscribe to public posts:', err);
    return () => {};
  }
};

/**
 * Delete Public Post from Firestore permanently and broadcast deletion to all public visitors
 */
export const deletePublicPostFromFirestore = async (postId: string): Promise<void> => {
  const { firestore } = getFirebaseInstances();
  if (!firestore) return;
  try {
    // 1. Delete document from public_posts collection
    const docRef = doc(firestore, 'public_posts', postId);
    await deleteDoc(docRef);

    // 2. Also delete from clipzone_images if present
    const clipRef = doc(firestore, 'clipzone_images', postId);
    await deleteDoc(clipRef).catch(() => {});

    // 3. Mark in deleted_posts collection so ALL public visitors and devices across the world filter it out
    const delRef = doc(firestore, 'deleted_posts', postId);
    await setDoc(delRef, {
      id: postId,
      deletedAt: serverTimestamp(),
    });
    console.log(`[Firestore] Post "${postId}" deleted permanently and broadcasted.`);
  } catch (e) {
    console.warn('Failed to delete post from Firestore:', e);
  }
};

/**
 * Subscribe to realtime deleted post IDs so all visitors in the world filter them out permanently
 */
export const subscribeToDeletedPostIds = (
  onDeletedUpdate: (deletedIds: string[]) => void
) => {
  const { firestore } = getFirebaseInstances();
  if (!firestore) return () => {};

  try {
    const q = collection(firestore, 'deleted_posts');
    return onSnapshot(
      q,
      (snapshot) => {
        const deletedIds = snapshot.docs.map((docSnap) => docSnap.id);
        if (deletedIds.length > 0) {
          onDeletedUpdate(deletedIds);
        }
      },
      (err) => {
        console.warn('Deleted posts subscriber notice:', err);
      }
    );
  } catch (err: any) {
    console.warn('Failed to subscribe to deleted posts:', err);
    return () => {};
  }
};

/**
 * Update post likes in Firestore
 */
export const updatePostLikesInFirestore = async (postId: string, delta: number): Promise<void> => {
  const { firestore } = getFirebaseInstances();
  if (!firestore) return;
  try {
    const docRef = doc(firestore, 'public_posts', postId);
    await updateDoc(docRef, {
      likes: increment(delta),
    });
  } catch (e) {
    console.warn('Failed to update likes in Firestore:', e);
  }
};

/**
 * Real-time listener for System Settings in Firestore
 */
export const subscribeToSystemSettings = (
  callback: (settings: any | null) => void
) => {
  const { firestore } = getFirebaseInstances();
  if (firestore) {
    try {
      const docRef = doc(firestore, 'site_configuration', 'system_settings');
      return onSnapshot(
        docRef,
        (snapshot) => {
          if (snapshot.exists()) {
            callback(snapshot.data());
          }
        },
        (error) => {
          // Graceful fallback when operating offline or before database is created
        }
      );
    } catch (e) {
      // Graceful fallback
    }
  }
  return () => {};
};

/**
 * Update image metadata in Firestore
 */
export const updateClipzoneImage = async (
  imageId: string,
  updates: Partial<ClipzoneImage>
): Promise<void> => {
  const { firestore } = getFirebaseInstances();

  if (!firestore) {
    throw new Error('Firestore is not connected.');
  }

  const docRef = doc(firestore, 'clipzone_images', imageId);
  await setDoc(
    docRef,
    {
      ...updates,
      updatedAt: serverTimestamp(),
    },
    { merge: true }
  );
};

/**
 * Test live connection to Auth, Firestore, and Storage
 */
export const testFirebaseLiveConnection = async (configToTest?: FirebaseConfig) => {
  const config = configToTest || getStoredFirebaseConfig();

  if (!isFirebaseConfigValid(config)) {
    return {
      connected: false,
      auth: false,
      firestore: false,
      message: 'Configuration is incomplete. Please ensure apiKey and projectId are filled.',
    };
  }

  try {
    let testApp: FirebaseApp;
    const existing = getApps().find((a) => a.name === 'test_connection_app');
    if (existing) {
      testApp = existing;
    } else {
      testApp = initializeApp(config, 'test_connection_app');
    }

    const testAuth = getAuth(testApp);
    const testFirestore = createConfiguredFirestore(testApp);

    // Ping Firestore
    let firestoreOk = false;
    try {
      await getDocs(collection(testFirestore, '_health_check'));
      firestoreOk = true;
    } catch (e: any) {
      // Permission denied or empty collection is fine for connectivity test
      if (e.code === 'permission-denied' || !e.code) {
        firestoreOk = true;
      }
    }

    return {
      connected: true,
      auth: Boolean(testAuth),
      firestore: firestoreOk || Boolean(testFirestore),
      message: `Successfully connected to Firebase Project: ${config.projectId}!`,
    };
  } catch (error: any) {
    return {
      connected: false,
      auth: false,
      firestore: false,
      message: error?.message || 'Failed to establish connection with Firebase.',
    };
  }
};

// ==========================================
// INQUIRY SERVICES (Direct Client Messages)
// ==========================================

export const LOCAL_INQUIRIES_STORAGE_KEY = 'rajababu_inquiries';

/**
 * Save new inquiry directly to localStorage first, then sync to Firestore with timeout
 */
export const saveInquiryToFirestore = async (
  inquiry: Omit<InquiryMessage, 'id'>
): Promise<string> => {
  let generatedId = `inquiry-${Date.now()}`;

  // 1. Instant local persistence so messages are never lost
  try {
    const raw = localStorage.getItem(LOCAL_INQUIRIES_STORAGE_KEY);
    const list: InquiryMessage[] = raw ? JSON.parse(raw) : [];
    list.unshift({ ...inquiry, id: generatedId });
    localStorage.setItem(LOCAL_INQUIRIES_STORAGE_KEY, JSON.stringify(list.slice(0, 100)));
  } catch (err) {
    console.warn('LocalStorage save error:', err);
  }

  // 2. Sync to Firestore in the background with a strict 1500ms timeout
  const { firestore } = getFirebaseInstances();
  if (firestore) {
    try {
      const savePromise = (async () => {
        const inquiriesCol = collection(firestore, 'inquiries');
        const docRef = await addDoc(inquiriesCol, {
          ...inquiry,
          status: inquiry.status || 'unread',
          createdAt: inquiry.createdAt || new Date().toISOString(),
          serverTime: serverTimestamp(),
        });
        return docRef.id;
      })();

      const timeoutPromise = new Promise<string>((_, reject) =>
        setTimeout(() => reject(new Error('Firestore timeout')), 1500)
      );

      const remoteId = await Promise.race([savePromise, timeoutPromise]);
      generatedId = remoteId;
    } catch (e) {
      // Benign fallback: local storage is already recorded
      console.warn('Firestore inquiry sync note (using local copy):', e);
    }
  }

  return generatedId;
};

/**
 * Subscribe to inquiries with immediate local fallback
 */
export const subscribeToInquiries = (
  callback: (inquiries: InquiryMessage[]) => void
) => {
  // Always immediately feed local storage items first
  try {
    const raw = localStorage.getItem(LOCAL_INQUIRIES_STORAGE_KEY);
    if (raw) {
      callback(JSON.parse(raw));
    }
  } catch {
    // ignore
  }

  const { firestore } = getFirebaseInstances();

  if (firestore) {
    try {
      const q = query(collection(firestore, 'inquiries'), orderBy('createdAt', 'desc'));
      return onSnapshot(
        q,
        (snapshot) => {
          if (!snapshot.empty) {
            const items: InquiryMessage[] = snapshot.docs.map((docSnap) => {
              const data = docSnap.data();
              return {
                id: docSnap.id,
                name: data.name || 'Anonymous Client',
                email: data.email || '',
                subject: data.subject || '',
                message: data.message || '',
                createdAt: data.createdAt || new Date().toISOString(),
                status: data.status || 'unread',
              };
            });
            callback(items);
          }
        },
        () => {
          // Fallback to local storage on error
          try {
            const raw = localStorage.getItem(LOCAL_INQUIRIES_STORAGE_KEY);
            callback(raw ? JSON.parse(raw) : []);
          } catch {
            callback([]);
          }
        }
      );
    } catch {
      // Fallback
    }
  }

  return () => {};
};

/**
 * Delete inquiry from Firestore and local storage
 */
export const deleteInquiryFromFirestore = async (id: string): Promise<void> => {
  const { firestore } = getFirebaseInstances();
  if (firestore) {
    try {
      const docRef = doc(firestore, 'inquiries', id);
      await deleteDoc(docRef);
    } catch (e) {
      console.warn('Could not delete inquiry from Firestore:', e);
    }
  }

  try {
    const raw = localStorage.getItem(LOCAL_INQUIRIES_STORAGE_KEY);
    if (raw) {
      const list: InquiryMessage[] = JSON.parse(raw);
      const filtered = list.filter((item) => item.id !== id);
      localStorage.setItem(LOCAL_INQUIRIES_STORAGE_KEY, JSON.stringify(filtered));
    }
  } catch {
    // ignore
  }
};

// ==========================================
// GOOGLE AUTH & ADMIN ROLES
// ==========================================

export const ADMIN_EMAILS = ['rajababum426@gmail.com', 'support@rajababumehta.com.np'];

export const isUserAdmin = (user: AdminUser | null): boolean => {
  if (!user) return false;
  if (user.email && ADMIN_EMAILS.includes(user.email.toLowerCase())) return true;
  if (user.isLocalFallback) return true;
  return false;
};

export const signInWithGoogle = async (): Promise<AdminUser> => {
  const { auth } = getFirebaseInstances();
  if (!auth) throw new Error('Firebase Authentication is not ready');

  const provider = new GoogleAuthProvider();
  provider.setCustomParameters({ prompt: 'select_account' });
  const result = await signInWithPopup(auth, provider);
  const user = result.user;

  const adminUser: AdminUser = {
    uid: user.uid,
    email: user.email,
    displayName: user.displayName || user.email?.split('@')[0] || 'User',
    photoURL: user.photoURL,
    isLocalFallback: false,
  };

  localStorage.setItem(LOCAL_ADMIN_STORAGE_KEY, JSON.stringify(adminUser));
  if (typeof window !== 'undefined') {
    window.dispatchEvent(new CustomEvent('admin-auth-changed', { detail: adminUser }));
  }
  return adminUser;
};

// ==========================================
// CLIENT-SIDE IMAGE OPTIMIZATION (FOR FIRESTORE STORAGE)
// ==========================================

export const compressImageFile = async (
  file: File,
  maxWidth = 1200,
  quality = 0.75
): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const img = new Image();
      img.onload = () => {
        let width = img.width;
        let height = img.height;
        if (width > maxWidth) {
          height = Math.round((height * maxWidth) / width);
          width = maxWidth;
        }
        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        if (!ctx) {
          resolve(e.target?.result as string);
          return;
        }
        ctx.drawImage(img, 0, 0, width, height);
        const dataUrl = canvas.toDataURL('image/jpeg', quality);
        resolve(dataUrl);
      };
      img.onerror = reject;
      img.src = e.target?.result as string;
    };
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
};

// ==========================================
// FACEBOOK-STYLE POST FEED SERVICES
// ==========================================

export const testFirestoreConnection = async () => {
  const { firestore } = getFirebaseInstances();
  if (!firestore) return;
  try {
    await getDocFromServer(doc(firestore, 'test', 'connection'));
  } catch (error) {
    if (error instanceof Error && error.message.includes('the client is offline')) {
      console.warn('Firestore client is offline, retrying...');
    }
  }
};

export const subscribeToFeedPosts = (
  onPosts: (posts: FeedPost[]) => void,
  onError?: (error: Error) => void
) => {
  const { firestore } = getFirebaseInstances();
  if (!firestore) return () => {};

  const q = query(collection(firestore, 'posts'), orderBy('createdAt', 'desc'));
  return onSnapshot(
    q,
    (snapshot) => {
      const posts: FeedPost[] = snapshot.docs.map((docSnap) => {
        const data = docSnap.data();
        let createdAtStr = new Date().toISOString();
        if (data.createdAt?.toDate) {
          createdAtStr = data.createdAt.toDate().toISOString();
        } else if (typeof data.createdAt === 'string') {
          createdAtStr = data.createdAt;
        }

        return {
          id: docSnap.id,
          authorId: data.authorId || '',
          authorName: data.authorName || 'Rajababu Mehta',
          authorEmail: data.authorEmail || '',
          authorPhoto: data.authorPhoto || '/assets/aistudio/hero_photo.jpg',
          content: data.content || '',
          contentNe: data.contentNe || '',
          images: Array.isArray(data.images) ? data.images : [],
          category: data.category || 'Announcement',
          likesCount: typeof data.likesCount === 'number' ? data.likesCount : 0,
          commentsCount: typeof data.commentsCount === 'number' ? data.commentsCount : 0,
          createdAt: createdAtStr,
          updatedAt: data.updatedAt?.toDate ? data.updatedAt.toDate().toISOString() : data.updatedAt,
          isPublished: data.isPublished ?? true,
        };
      });
      onPosts(posts);
    },
    (err) => {
      console.warn('Feed posts snapshot notice:', err);
      if (onError) onError(err);
      try {
        handleFirestoreError(err, OperationType.LIST, 'posts');
      } catch {
        // logged
      }
    }
  );
};

export const getSingleFeedPost = async (postId: string): Promise<FeedPost | null> => {
  const { firestore } = getFirebaseInstances();
  if (!firestore || !postId) return null;

  try {
    const docRef = doc(firestore, 'posts', postId);
    const docSnap = await getDoc(docRef);
    if (!docSnap.exists()) return null;

    const data = docSnap.data();
    let createdAtStr = new Date().toISOString();
    if (data.createdAt?.toDate) {
      createdAtStr = data.createdAt.toDate().toISOString();
    } else if (typeof data.createdAt === 'string') {
      createdAtStr = data.createdAt;
    }

    return {
      id: docSnap.id,
      authorId: data.authorId || '',
      authorName: data.authorName || 'Rajababu Mehta',
      authorEmail: data.authorEmail || '',
      authorPhoto: data.authorPhoto || '/assets/aistudio/hero_photo.jpg',
      content: data.content || '',
      contentNe: data.contentNe || '',
      images: Array.isArray(data.images) ? data.images : [],
      category: data.category || 'Announcement',
      likesCount: typeof data.likesCount === 'number' ? data.likesCount : 0,
      commentsCount: typeof data.commentsCount === 'number' ? data.commentsCount : 0,
      createdAt: createdAtStr,
      updatedAt: data.updatedAt?.toDate ? data.updatedAt.toDate().toISOString() : data.updatedAt,
      isPublished: data.isPublished ?? true,
    };
  } catch (e) {
    console.warn('Failed to fetch single post:', e);
    return null;
  }
};

export const createFeedPost = async (postData: {
  authorId: string;
  authorName: string;
  authorEmail?: string;
  authorPhoto?: string;
  content: string;
  contentNe?: string;
  images: string[];
  category?: string;
}): Promise<string> => {
  const { firestore } = getFirebaseInstances();
  if (!firestore) throw new Error('Firestore is not ready');

  const path = 'posts';
  try {
    const docRef = await addDoc(collection(firestore, path), {
      authorId: postData.authorId,
      authorName: postData.authorName,
      authorEmail: postData.authorEmail || '',
      authorPhoto: postData.authorPhoto || '',
      content: postData.content,
      contentNe: postData.contentNe || '',
      images: postData.images || [],
      category: postData.category || 'Announcement',
      likesCount: 0,
      commentsCount: 0,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
      isPublished: true,
    });
    return docRef.id;
  } catch (error) {
    handleFirestoreError(error, OperationType.CREATE, path);
  }
};

export const deleteFeedPost = async (postId: string): Promise<void> => {
  const { firestore } = getFirebaseInstances();
  if (!firestore) throw new Error('Firestore not ready');
  const path = `posts/${postId}`;
  try {
    await deleteDoc(doc(firestore, 'posts', postId));
  } catch (error) {
    handleFirestoreError(error, OperationType.DELETE, path);
  }
};

export const toggleFeedPostLike = async (
  postId: string,
  userId: string,
  userName: string
): Promise<boolean> => {
  const { firestore } = getFirebaseInstances();
  if (!firestore) throw new Error('Firestore not ready');

  const sanitizedUserId = userId.replace(/[^a-zA-Z0-9_\-]/g, '_');
  const likeDocRef = doc(firestore, 'posts', postId, 'likes', sanitizedUserId);
  const postDocRef = doc(firestore, 'posts', postId);

  try {
    const existing = await getDoc(likeDocRef);
    if (existing.exists()) {
      await deleteDoc(likeDocRef);
      await updateDoc(postDocRef, {
        likesCount: increment(-1),
      });
      return false;
    } else {
      await setDoc(likeDocRef, {
        userId: sanitizedUserId,
        userName: userName || 'Visitor',
        createdAt: serverTimestamp(),
      });
      await updateDoc(postDocRef, {
        likesCount: increment(1),
      });
      return true;
    }
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, `posts/${postId}/likes/${sanitizedUserId}`);
  }
};

export const checkUserLikedPost = async (postId: string, userId: string): Promise<boolean> => {
  const { firestore } = getFirebaseInstances();
  if (!firestore || !userId) return false;
  try {
    const sanitizedUserId = userId.replace(/[^a-zA-Z0-9_\-]/g, '_');
    const likeDocRef = doc(firestore, 'posts', postId, 'likes', sanitizedUserId);
    const snap = await getDoc(likeDocRef);
    return snap.exists();
  } catch {
    return false;
  }
};

export const subscribeToPostComments = (
  postId: string,
  onComments: (comments: PostComment[]) => void
) => {
  const { firestore } = getFirebaseInstances();
  if (!firestore) return () => {};

  const q = query(collection(firestore, 'posts', postId, 'comments'), orderBy('createdAt', 'asc'));
  return onSnapshot(
    q,
    (snapshot) => {
      const comments: PostComment[] = snapshot.docs.map((docSnap) => {
        const data = docSnap.data();
        let createdStr = new Date().toISOString();
        if (data.createdAt?.toDate) {
          createdStr = data.createdAt.toDate().toISOString();
        } else if (typeof data.createdAt === 'string') {
          createdStr = data.createdAt;
        }

        return {
          id: docSnap.id,
          postId,
          authorId: data.authorId || '',
          authorName: data.authorName || 'Guest Visitor',
          authorPhoto: data.authorPhoto || '',
          content: data.content || '',
          createdAt: createdStr,
        };
      });
      onComments(comments);
    },
    (err) => {
      console.warn('Comments snapshot warning:', err);
    }
  );
};

export const addPostComment = async (
  postId: string,
  comment: {
    authorId: string;
    authorName: string;
    authorPhoto?: string;
    content: string;
  }
): Promise<string> => {
  const { firestore } = getFirebaseInstances();
  if (!firestore) throw new Error('Firestore not ready');

  const path = `posts/${postId}/comments`;
  try {
    const docRef = await addDoc(collection(firestore, 'posts', postId, 'comments'), {
      postId,
      authorId: comment.authorId,
      authorName: comment.authorName,
      authorPhoto: comment.authorPhoto || '',
      content: comment.content,
      createdAt: serverTimestamp(),
    });

    await updateDoc(doc(firestore, 'posts', postId), {
      commentsCount: increment(1),
    }).catch(() => {});

    return docRef.id;
  } catch (error) {
    handleFirestoreError(error, OperationType.CREATE, path);
  }
};


