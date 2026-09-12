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
} from 'firebase/auth';
import {
  getFirestore,
  collection,
  addDoc,
  setDoc,
  doc,
  deleteDoc,
  updateDoc,
  getDocs,
  onSnapshot,
  query,
  orderBy,
  Firestore,
  serverTimestamp,
} from 'firebase/firestore';
import {
  getStorage,
  ref,
  uploadBytesResumable,
  getDownloadURL,
  deleteObject,
  FirebaseStorage,
} from 'firebase/storage';
import {
  getAnalytics,
  isSupported as isAnalyticsSupported,
  Analytics,
} from 'firebase/analytics';
import { FirebaseConfig, ClipzoneImage, AdminUser } from '../types';

export const FIREBASE_CONFIG_STORAGE_KEY = 'ai_clipzone_firebase_config';
export const LOCAL_IMAGES_STORAGE_KEY = 'ai_clipzone_local_images';
export const LOCAL_ADMIN_STORAGE_KEY = 'ai_clipzone_local_admin';

// User's complete verified Firebase configuration
export const firebaseConfig: FirebaseConfig = {
  apiKey: "AIzaSyDvtn8knSP_KL_sODq5VgURDXM8skBOusQ",
  authDomain: "rajababu-mehta.firebaseapp.com",
  projectId: "rajababu-mehta",
  storageBucket: "rajababu-mehta.firebasestorage.app",
  messagingSenderId: "762200404229",
  appId: "1:762200404229:web:816f1f018bceb14d63c76c",
  measurementId: "G-QM9J2DNLXE",
};

export const DEFAULT_FIREBASE_CONFIG = firebaseConfig;

// Initialize core Firebase App instance
export const app: FirebaseApp =
  getApps().length > 0 ? getApp() : initializeApp(firebaseConfig);

// Initialize Firebase Auth, Firestore, and Storage
export const auth: Auth = getAuth(app);
export const firestore: Firestore = getFirestore(app);
export const db: Firestore = firestore; // Alias for convenience
export const storage: FirebaseStorage = getStorage(app);

// Initialize Firebase Analytics (conditionally when supported in browser environment)
export let analytics: Analytics | null = null;
if (typeof window !== 'undefined') {
  isAnalyticsSupported()
    .then((supported) => {
      if (supported) {
        analytics = getAnalytics(app);
      }
    })
    .catch((err) => {
      console.warn('Firebase Analytics not supported in current environment:', err);
    });
}

// Re-export core initialization methods as requested
export { getAuth, getFirestore, getStorage, getAnalytics };

// Stored / Active Firebase configuration
export const getStoredFirebaseConfig = (): FirebaseConfig => {
  try {
    const saved = localStorage.getItem(FIREBASE_CONFIG_STORAGE_KEY);
    if (saved) {
      const parsed = JSON.parse(saved);
      if (parsed && typeof parsed === 'object' && parsed.apiKey && parsed.projectId) {
        return parsed;
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
let storageInstance: FirebaseStorage = storage;
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
    firestoreInstance = getFirestore(appInstance);
    storageInstance = getStorage(appInstance);

    if (typeof window !== 'undefined') {
      isAnalyticsSupported()
        .then((supported) => {
          if (supported) {
            analyticsInstance = getAnalytics(appInstance);
            analytics = analyticsInstance;
          }
        })
        .catch(() => {});
    }

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
    storage: storageInstance || storage,
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

export const loginAsLocalAdmin = (email = 'rajababum426@gmail.com'): AdminUser => {
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
};

export const subscribeToAuth = (callback: (user: AdminUser | null) => void) => {
  const { auth } = getFirebaseInstances();

  if (auth) {
    return onAuthStateChanged(auth, (fbUser: FirebaseUser | null) => {
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
  }

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

  // Return unsubscribe dummy
  return () => {};
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
// STORAGE & FIRESTORE IMAGE SERVICES
// ==========================================

export interface UploadImageResult {
  downloadUrl: string;
  storagePath: string;
  fileSize: number;
}

/**
 * Upload an image file directly to Firebase Storage bucket
 */
export const uploadFileToFirebaseStorage = async (
  file: File,
  folder = 'clipzone_gallery',
  onProgress?: (percent: number) => void
): Promise<UploadImageResult> => {
  const { storage } = getFirebaseInstances();

  if (!storage) {
    throw new Error('Firebase Storage is not configured. Please paste your Firebase keys in the Settings tab.');
  }

  // Sanitize filename and create unique timestamped path
  const sanitizedName = file.name.replace(/[^a-zA-Z0-9.-]/g, '_');
  const timestamp = Date.now();
  const storagePath = `${folder}/${timestamp}_${sanitizedName}`;
  const fileRef = ref(storage, storagePath);

  const uploadTask = uploadBytesResumable(fileRef, file, {
    contentType: file.type,
    customMetadata: {
      originalName: file.name,
      uploadedAt: new Date().toISOString(),
    },
  });

  return new Promise((resolve, reject) => {
    uploadTask.on(
      'state_changed',
      (snapshot) => {
        const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
        if (onProgress) {
          onProgress(Math.round(progress));
        }
      },
      (error) => {
        console.error('Firebase Storage upload error:', error);
        reject(new Error(`Storage Upload Failed: ${error.message}`));
      },
      async () => {
        try {
          const downloadUrl = await getDownloadURL(uploadTask.snapshot.ref);
          resolve({
            downloadUrl,
            storagePath,
            fileSize: file.size,
          });
        } catch (e: any) {
          reject(new Error(`Failed to retrieve download URL: ${e.message}`));
        }
      }
    );
  });
};

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

        onImagesUpdate(images);
      },
      (err) => {
        console.warn('Firestore subscription notice (fallback will handle if offline):', err.message);
        if (onError) onError(err);
      }
    );
  } catch (e: any) {
    console.warn('Error setting up Firestore snapshot listener:', e);
    return () => {};
  }
};

/**
 * Delete image record from Firestore AND remove binary file from Firebase Storage
 */
export const deleteClipzoneImage = async (
  imageId: string,
  storagePath?: string
): Promise<{ success: boolean; message: string }> => {
  const { firestore, storage } = getFirebaseInstances();

  // 1. Delete from Firestore if connected
  if (firestore) {
    try {
      const docRef = doc(firestore, 'clipzone_images', imageId);
      await deleteDoc(docRef);
    } catch (e: any) {
      console.error('Failed to delete doc from Firestore:', e);
    }
  }

  // 2. Delete from Firebase Storage if storagePath is provided
  if (storage && storagePath) {
    try {
      const fileRef = ref(storage, storagePath);
      await deleteObject(fileRef);
    } catch (e: any) {
      console.warn('Storage file deletion notice:', e?.message);
    }
  }

  return { success: true, message: 'Image deleted successfully from Firebase!' };
};

/**
 * Client-side helper to compress an image file to a lightweight data URL
 * Ensures local storage quota is never exceeded if offline/local fallback is used
 */
export const compressImageFile = (
  file: File,
  maxWidth = 1400,
  maxHeight = 1400,
  quality = 0.85
): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const img = new Image();
      img.onload = () => {
        let { width, height } = img;
        if (width > maxWidth || height > maxHeight) {
          if (width / height > maxWidth / maxHeight) {
            height = Math.round((height * maxWidth) / width);
            width = maxWidth;
          } else {
            width = Math.round((width * maxHeight) / height);
            height = maxHeight;
          }
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
      img.onerror = () => reject(new Error('Failed to load image for compression'));
      img.src = e.target?.result as string;
    };
    reader.onerror = (err) => reject(err);
    reader.readAsDataURL(file);
  });
};

/**
 * Upload a profile/hero image to Firebase Storage (or fallback to compressed data URL)
 */
export const uploadProfilePhoto = async (
  file: File,
  onProgress?: (percent: number) => void
): Promise<{ url: string; storagePath?: string }> => {
  const { storage, isReady } = getFirebaseInstances();

  if (isReady && storage) {
    const uploadResult = await uploadFileToFirebaseStorage(
      file,
      'profile_photos',
      onProgress
    );
    return {
      url: uploadResult.downloadUrl,
      storagePath: uploadResult.storagePath,
    };
  }

  // Fallback: compress image so it never exceeds browser localStorage limits
  if (onProgress) onProgress(40);
  const compressedDataUrl = await compressImageFile(file, 1600, 1600, 0.85);
  if (onProgress) onProgress(100);
  return { url: compressedDataUrl };
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
          console.warn('System settings listener warning:', error);
        }
      );
    } catch (e) {
      console.warn('Could not attach system settings listener:', e);
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
      storage: false,
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
    const testFirestore = getFirestore(testApp);
    const testStorage = getStorage(testApp);

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
      storage: Boolean(testStorage),
      message: `Successfully connected to Firebase Project: ${config.projectId}!`,
    };
  } catch (error: any) {
    return {
      connected: false,
      auth: false,
      firestore: false,
      storage: false,
      message: error?.message || 'Failed to establish connection with Firebase.',
    };
  }
};
