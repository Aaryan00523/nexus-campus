import { initializeApp, getApps, getApp, cert, App, applicationDefault } from 'firebase-admin/app';
import { getAuth, Auth } from 'firebase-admin/auth';
import { getFirestore, Firestore } from 'firebase-admin/firestore';
import { getStorage, Storage } from 'firebase-admin/storage';
import fs from 'fs';
import path from 'path';

function formatPrivateKey(key: string | undefined): string | undefined {
  if (!key) return undefined;
  let formatted = key;
  // If the key is wrapped in quotes, unwrap them
  if (formatted.startsWith('"') && formatted.endsWith('"')) {
    formatted = formatted.slice(1, -1);
  }
  // Replace escaped \n with actual newlines
  return formatted.replace(/\\n/g, '\n');
}

function initializeFirebaseAdmin(): App {
  const existingApps = getApps();
  if (existingApps.length > 0) {
    return existingApps[0]!;
  }

  const projectId = process.env.FIREBASE_PROJECT_ID || process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || 'nexus-campus-2026';
  const clientEmail = process.env.FIREBASE_CLIENT_EMAIL;
  const privateKey = formatPrivateKey(process.env.FIREBASE_PRIVATE_KEY);

  if (clientEmail && privateKey) {
    return initializeApp({
      credential: cert({
        projectId,
        clientEmail,
        privateKey,
      }),
      storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET || `${projectId}.firebasestorage.app`,
    });
  }

  // Fallback to local service-account.json if present
  const localSaPath = path.join(process.cwd(), 'service-account.json');
  if (fs.existsSync(localSaPath)) {
    try {
      const saData = JSON.parse(fs.readFileSync(localSaPath, 'utf8'));
      return initializeApp({
        credential: cert(saData),
        storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET || `${projectId}.firebasestorage.app`,
      });
    } catch {
      // Continue to application default
    }
  }

  // Application default credentials fallback
  return initializeApp({
    credential: applicationDefault(),
    projectId,
    storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET || `${projectId}.firebasestorage.app`,
  });
}

const adminApp: App = initializeFirebaseAdmin();
export const adminAuth: Auth = getAuth(adminApp);
export const adminDb: Firestore = getFirestore(adminApp);
adminDb.settings({ ignoreUndefinedProperties: true });
export const adminStorage: Storage = getStorage(adminApp);
export { adminApp };
export default adminApp;

