import { initializeApp } from 'firebase/app'
import { getFirestore } from 'firebase/firestore'
import { getAuth } from 'firebase/auth'
import { getStorage } from 'firebase/storage'
import { getAnalytics } from 'firebase/analytics'

const firebaseConfig = {
  apiKey: "AIzaSyBMlsiSMtsGDcn9uHeCYK5w_m6h8PmQEUA",
  authDomain: "unit-9e4cc.firebaseapp.com",
  projectId: "unit-9e4cc",
  storageBucket: "unit-9e4cc.firebasestorage.app",
  messagingSenderId: "465019289576",
  appId: "1:465019289576:web:7f83d9fa2085ff7c0f6e5d",
  measurementId: "G-J0HR5L2TS5"
}

const app = initializeApp(firebaseConfig)

export const db = getFirestore(app)
export const auth = getAuth(app)
export const storage = getStorage(app)
export const analytics = typeof window !== 'undefined' ? getAnalytics(app) : null

export default app
