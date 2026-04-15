import { initializeApp, getApps } from 'firebase/app'
import { getFirestore } from 'firebase/firestore'

const firebaseConfig = {
  apiKey:             process.env.NEXT_PUBLIC_FIREBASE_API_KEY             ?? 'build-placeholder',
  authDomain:         process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN         ?? 'build-placeholder.firebaseapp.com',
  projectId:          process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID          ?? 'build-placeholder',
  storageBucket:      process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET      ?? 'build-placeholder.appspot.com',
  messagingSenderId:  process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID ?? '000000000000',
  appId:              process.env.NEXT_PUBLIC_FIREBASE_APP_ID              ?? '1:000000000000:web:000000000000000000000000',
}

const app = getApps().length ? getApps()[0] : initializeApp(firebaseConfig)
export const db = getFirestore(app)
