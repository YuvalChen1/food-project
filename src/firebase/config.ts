import { initializeApp, getApps, FirebaseApp } from 'firebase/app';
import { getAuth, Auth } from 'firebase/auth';
import { getFirestore, Firestore } from 'firebase/firestore';

// Add debug logging
console.log('Firebase Config Environment Variables:', {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY ? 'exists' : 'missing',
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN ? 'exists' : 'missing',
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID ? 'exists' : 'missing',
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET ? 'exists' : 'missing',
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID ? 'exists' : 'missing',
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID ? 'exists' : 'missing'
});

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
};

// Initialize Firebase only if we have required config
if (!firebaseConfig.apiKey || !firebaseConfig.authDomain || !firebaseConfig.projectId) {
  console.error('Missing required Firebase configuration. Check your environment variables.');
}

// Initialize dummy services for SSR
const dummyApp = {} as FirebaseApp;
const dummyAuth = {} as Auth;
const dummyDb = {} as Firestore;

let app: FirebaseApp = dummyApp;
let auth: Auth = dummyAuth;
let db: Firestore = dummyDb;

// Only initialize Firebase on the client side
if (typeof window !== 'undefined') {
  if (!getApps().length) {
    app = initializeApp(firebaseConfig);
  } else {
    app = getApps()[0];
  }
  auth = getAuth(app);
  db = getFirestore(app);
}

export { auth, db };