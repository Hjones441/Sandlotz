'use client'

import {
  createContext,
  useContext,
  useEffect,
  useState,
  ReactNode,
} from 'react'
import {
  User,
  onAuthStateChanged,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signInWithPopup,
  signOut,
  updateProfile,
  sendEmailVerification,
} from 'firebase/auth'
import { auth, googleProvider } from '@/lib/firebase'
import { createUserProfile, getUserProfile, UserProfile } from '@/lib/firestore'

interface AuthContextValue {
  user:        User | null
  profile:     UserProfile | null
  loading:     boolean
  signUp:      (email: string, password: string, displayName: string) => Promise<void>
  signIn:      (email: string, password: string) => Promise<void>
  signInGoogle:() => Promise<void>
  logOut:      () => Promise<void>
  refreshProfile: () => Promise<void>
  resendVerification: () => Promise<void>
}

const AuthContext = createContext<AuthContextValue | null>(null)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user,    setUser]    = useState<User | null>(null)
  const [profile, setProfile] = useState<UserProfile | null>(null)
  const [loading, setLoading] = useState(true)

  async function loadProfile(u: User) {
    const p = await getUserProfile(u.uid)
    setProfile(p)
  }

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, async (u) => {
      setUser(u)
      if (u) {
        // Set a short-lived cookie so Next.js middleware can detect auth state
        // for server-side routing (/ → /dashboard, app routes → /login).
        // The Firebase token is NOT stored here — this is a routing hint only.
        document.cookie = 'sl-auth=1; path=/; max-age=604800; SameSite=Lax'
        await loadProfile(u)
      } else {
        document.cookie = 'sl-auth=; path=/; max-age=0'
        setProfile(null)
      }
      setLoading(false)
    })
    return unsub
  }, [])

  async function signUp(email: string, password: string, displayName: string) {
    const cred = await createUserWithEmailAndPassword(auth, email, password)
    await sendEmailVerification(cred.user)
    await updateProfile(cred.user, { displayName })
    await createUserProfile(cred.user.uid, {
      displayName,
      email,
      photoURL: null,
    })
    await loadProfile(cred.user)
  }

  async function signIn(email: string, password: string) {
    const cred = await signInWithEmailAndPassword(auth, email, password)
    if (!cred.user.emailVerified) {
      // Keep user signed in so they can use resendVerification() from /verify-email
      throw new Error('UNVERIFIED_EMAIL')
    }
    await loadProfile(cred.user)
  }

  async function signInGoogle() {
    const cred = await signInWithPopup(auth, googleProvider)
    const existing = await getUserProfile(cred.user.uid)
    if (!existing) {
      await createUserProfile(cred.user.uid, {
        displayName: cred.user.displayName ?? '',
        email:       cred.user.email ?? '',
        photoURL:    cred.user.photoURL ?? null,
      })
    }
    await loadProfile(cred.user)
  }

  async function logOut() {
    await signOut(auth)
    setProfile(null)
  }

  async function refreshProfile() {
    if (user) await loadProfile(user)
  }

  async function resendVerification() {
    if (user) await sendEmailVerification(user)
  }

  return (
    <AuthContext.Provider
      value={{ user, profile, loading, signUp, signIn, signInGoogle, logOut, refreshProfile, resendVerification }}
    >
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used inside AuthProvider')
  return ctx
}
