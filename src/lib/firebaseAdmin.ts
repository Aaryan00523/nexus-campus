import { initializeApp, getApps, getApp, cert, App, applicationDefault } from 'firebase-admin/app';
import type { Auth } from 'firebase-admin/auth';
import { getFirestore, Firestore } from 'firebase-admin/firestore';
import { getStorage, Storage } from 'firebase-admin/storage';
import fs from 'fs';
import path from 'path';

function formatPrivateKey(key: string | undefined): string | undefined {
  if (!key) return undefined;
  let formatted = key.trim();
  // Strip outer quotes if passed as '"..."' or "'...'"
  if (
    (formatted.startsWith('"') && formatted.endsWith('"')) ||
    (formatted.startsWith("'") && formatted.endsWith("'"))
  ) {
    formatted = formatted.slice(1, -1);
  }
  // Convert literal escaped newlines to actual newlines
  formatted = formatted.replace(/\\n/g, '\n');
  return formatted;
}

let adminAppInstance: App | null = null;
let adminAuthInstance: Auth | null = null;
let adminDbInstance: Firestore | null = null;
let adminStorageInstance: Storage | null = null;

function getOrInitFirebaseAdmin(): { app: App | null; db: Firestore | null; storage: Storage | null } {
  if (adminAppInstance) {
    return {
      app: adminAppInstance,
      db: adminDbInstance,
      storage: adminStorageInstance,
    };
  }

  const existingApps = getApps();
  if (existingApps.length > 0) {
    adminAppInstance = existingApps[0]!;
    try {
      adminDbInstance = getFirestore(adminAppInstance);
      adminDbInstance.settings({ ignoreUndefinedProperties: true });
      adminStorageInstance = getStorage(adminAppInstance);
    } catch (e) {
      console.warn('Firebase service attachment notice:', e);
    }
    return {
      app: adminAppInstance,
      db: adminDbInstance,
      storage: adminStorageInstance,
    };
  }

  const projectId =
    process.env.FIREBASE_PROJECT_ID ||
    process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID ||
    'nexus-campus-2026';
  const clientEmail = process.env.FIREBASE_CLIENT_EMAIL;
  const privateKey = formatPrivateKey(process.env.FIREBASE_PRIVATE_KEY);

  // Strategy 1: Explicit Service Account Credentials (Production / Vercel Env)
  if (clientEmail && privateKey) {
    try {
      adminAppInstance = initializeApp({
        credential: cert({
          projectId,
          clientEmail,
          privateKey,
        }),
        storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET || `${projectId}.firebasestorage.app`,
      });
      adminDbInstance = getFirestore(adminAppInstance);
      adminDbInstance.settings({ ignoreUndefinedProperties: true });
      adminStorageInstance = getStorage(adminAppInstance);
      return { app: adminAppInstance, db: adminDbInstance, storage: adminStorageInstance };
    } catch (err) {
      console.warn('Firebase cert init failed, trying fallback:', err);
    }
  }

  // Strategy 2: Local service-account.json (Local development)
  try {
    const localSaPath = path.join(process.cwd(), 'service-account.json');
    if (fs.existsSync(localSaPath)) {
      const saData = JSON.parse(fs.readFileSync(localSaPath, 'utf8'));
      adminAppInstance = initializeApp({
        credential: cert(saData),
        storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET || `${projectId}.firebasestorage.app`,
      });
      adminDbInstance = getFirestore(adminAppInstance);
      adminDbInstance.settings({ ignoreUndefinedProperties: true });
      adminStorageInstance = getStorage(adminAppInstance);
      return { app: adminAppInstance, db: adminDbInstance, storage: adminStorageInstance };
    }
  } catch (err) {
    console.warn('Local service-account.json read notice:', err);
  }

  // Strategy 3: Application Default Credentials (Google Cloud environments)
  try {
    adminAppInstance = initializeApp({
      credential: applicationDefault(),
      projectId,
      storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET || `${projectId}.firebasestorage.app`,
    });
    adminDbInstance = getFirestore(adminAppInstance);
    adminDbInstance.settings({ ignoreUndefinedProperties: true });
    adminStorageInstance = getStorage(adminAppInstance);
    return { app: adminAppInstance, db: adminDbInstance, storage: adminStorageInstance };
  } catch (err) {
    // Expected to fail on non-GCP serverless like Vercel if ADC is absent
  }

  // Strategy 4: Project-only fallback (allows app to start without crashing)
  try {
    adminAppInstance = initializeApp({
      projectId,
      storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET || `${projectId}.firebasestorage.app`,
    });
    adminDbInstance = getFirestore(adminAppInstance);
    adminStorageInstance = getStorage(adminAppInstance);
  } catch (finalErr) {
    console.warn('Final Firebase fallback warning:', finalErr);
  }

  return {
    app: adminAppInstance,
    db: adminDbInstance,
    storage: adminStorageInstance,
  };
}

const { app: adminApp, db: rawDb, storage: rawStorage } = getOrInitFirebaseAdmin();

export async function getAdminAuth(): Promise<Auth | null> {
  if (adminAuthInstance) return adminAuthInstance;
  const targetApp = adminAppInstance || getApps()[0];
  if (!targetApp) return null;
  try {
    const { getAuth } = await import('firebase-admin/auth');
    adminAuthInstance = getAuth(targetApp);
    return adminAuthInstance;
  } catch (err) {
    console.warn('Dynamic firebase-admin/auth import notice:', err);
    return null;
  }
}

// Resilient proxy so code calling adminAuth methods never breaks module loading
export const adminAuth: Auth = new Proxy({} as Auth, {
  get(_target, prop: string | symbol) {
    return async (...args: any[]) => {
      try {
        const auth = await getAdminAuth();
        if (auth && typeof (auth as any)[prop] === 'function') {
          return await (auth as any)[prop](...args);
        }
      } catch (err) {
        console.warn(`adminAuth.${String(prop)} warning:`, err);
      }
      return null;
    };
  },
});

export const adminAppSafe = adminApp;
export const adminDb = rawDb as Firestore;
export const adminStorage = rawStorage as Storage;
export default adminApp;
