import { initializeApp, getApps, getApp } from 'firebase/app';
import { getStorage, ref, uploadBytes, getDownloadURL } from 'firebase/storage';

// Public web config for the shared kaana-prod Firebase project.
// These are client-side identifiers (safe to ship); access is controlled by Storage rules.
const FIREBASE_CONFIG = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || 'AIzaSyANte673fvVoGN-TpyvUE8VXaLIkznRNcw',
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || 'kaana-prod.firebaseapp.com',
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || 'kaana-prod',
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || 'kaana-prod.firebasestorage.app',
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || '851239127958',
  appId: import.meta.env.VITE_FIREBASE_APP_ID || '1:851239127958:web:984be618b948e4fc1c2bb7',
};

function getFirebaseApp() {
  return getApps().length ? getApp() : initializeApp(FIREBASE_CONFIG);
}

function slugify(value: string) {
  return value.replace(/[^a-zA-Z0-9-_]/g, '-');
}

function imageContentType(file: Blob): string {
  const type = (file.type || '').toLowerCase();
  if (type.startsWith('image/')) return type;
  return 'image/jpeg';
}

function imageExtension(file: Blob): string {
  const type = imageContentType(file);
  if (type.includes('png')) return 'png';
  if (type.includes('webp')) return 'webp';
  if (type.includes('heic') || type.includes('heif')) return 'heic';
  return 'jpg';
}

async function uploadClinicImage(tenantSlug: string, patientKey: string, file: Blob, prefix: string): Promise<string> {
  const storage = getStorage(getFirebaseApp());
  const ext = imageExtension(file);
  const contentType = imageContentType(file);
  const path = `clinic-crm/${slugify(tenantSlug || 'default')}/patients/${slugify(patientKey)}/${prefix}-${Date.now()}.${ext}`;
  const storageRef = ref(storage, path);
  await uploadBytes(storageRef, file, { contentType });
  return getDownloadURL(storageRef);
}

/** Uploads a prescription/record photo for a patient. */
export async function uploadPatientPrescription(tenantSlug: string, patientKey: string, file: Blob): Promise<string> {
  return uploadClinicImage(tenantSlug, patientKey, file, 'prescription');
}

/** @deprecated Use uploadPatientPrescription */
export async function uploadPatientPhoto(tenantSlug: string, patientKey: string, file: Blob): Promise<string> {
  return uploadClinicImage(tenantSlug, patientKey, file, 'photo');
}
