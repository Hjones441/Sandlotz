'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { useAuth } from '@/context/AuthContext'
import { Eye, EyeOff, Chrome } from 'lucide-react'
import { SPORT_OPTIONS } from '@/lib/sandlotzScore'

export default function SignupPage() {
  const { signUp, signInGoogle, resendVerification } = useAuth()
  const router = useRouter()

  const [displayName, setDisplayName] = useState('')
  const [email,       setEmail]       = useState('')
  const [password,    setPassword]    = useState('')
  const [sport,       setSport]       = useState('running')
  const [showPw,      setShowPw]      = useState(false)
  const [loading,     setLoading]     = useState(false)
  const [error,       setError]       = useState('')
  const [sent,        setSent]        = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (password.length < 8) { setError('Password must be at least 8 characters.'); return }
    setError('')
    setLoading(true)
    try {
      await signUp(email, password, displayName)
      setSent(true)
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Sign-up failed. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  async function handleGoogle() {
    setError('')
    setLoading(true)
    try {
      await signInGoogle()
      router.push('/dashboard')
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Google sign-in failed.')
    } finally {
      setLoading(false)
    }
  }

  if (sent) {
    return (
      <div className="min-h-screen flex items-center justify-center px-4 pt-16 pb-8">
        <div className="w-full max-w-md">
          <div className="sz-card p-8 text-center">
            <h1 className="text-3xl font-black mb-3">Check Your Email</h1>
            <p className="text-white/60 text-sm mb-8">
              We sent a verification link to <span className="text-white font-semibold">{email}</span>. Click it to activate your account.
            </p>
            <button
              onClick={() => resendVerification()}
              className="btn-primary w-full mb-4"
            >
              Resend Email
            </button>
            <Link href="/login" className="text-brand-yellow hover:underline text-sm font-semibold">
              Back to Login
            </Link>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-4 pt-16 pb-8">
      <div className="w-full max-w-md">
        <div className="sz-card p-8">
          <h1 className="text-3xl font-black text-center mb-1">Join Sandlotz</h1>
          <p className="text-center text-white/50 text-sm mb-8">Free to start. Compete immediately.</p>

          {/* Google sign-up */}
          <button
            onClick={handleGoogle}
            disabled={loading}
            className="w-full flex items-center justify-center gap-3 btn-ghost mb-6"
          >
            <Chrome className="w-5 h-5 text-brand-yellow" />
            Continue with Google
          </button>

          <div className="relative flex items-center gap-4 mb-6">
            <div className="flex-1 h-px bg-white/10" />
            <span className="text-white/30 text-xs">or</span>
            <div className="flex-1 h-px bg-white/10" />
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-semibold text-white/70 mb-2">Full Name</label>
              <input
                type="text"
                required
                value={displayName}
                onChange={e => setDisplayName(e.target.value)}
                placeholder="Harrison Jones"
                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white
                           placeholder:text-white/30 focus:outline-none focus:border-brand-yellow transition-colors"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-white/70 mb-2">Email</label>
              <input
                type="email"
                required
                value={email}
                onChange={e => setEmail(e.target.value)}
                placeholder="you@example.com"
                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white
                           placeholder:text-white/30 focus:outline-none focus:border-brand-yellow transition-colors"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-white/70 mb-2">Password</label>
              <div className="relative">
                <input
                  type={showPw ? 'text' : 'password'}
                  required
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  placeholder="Min 8 characters"
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 pr-12 text-white
                             placeholder:text-white/30 focus:outline-none focus:border-brand-yellow transition-colors"
                />
                <button
                  type="button"
                  onClick={() => setShowPw(!showPw)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-white/40 hover:text-white/70"
                >
                  {showPw ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
            </div>

            <div>
              <label className="block text-sm font-semibold text-white/70 mb-2">Primary Sport</label>
              <select
                value={sport}
                onChange={e => setSport(e.target.value)}
                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white
                           focus:outline-none focus:border-brand-yellow transition-colors"
              >
                {SPORT_OPTIONS.map(s => (
                  <option key={s.value} value={s.value} className="bg-brand-purple-dark">
                    {s.emoji} {s.label}
                  </option>
                ))}
              </select>
            </div>

            {error && (
              <div className="bg-red-500/10 border border-red-500/20 rounded-xl px-4 py-3 text-red-400 text-sm">
                {error}
              </div>
            )}

            <button type="submit" disabled={loading} className="btn-primary w-full mt-2">
              {loading ? 'Creating account…' : 'Create Account'}
            </button>
          </form>

          <p className="text-center text-white/40 text-sm mt-6">
            Already have an account?{' '}
            <Link href="/login" className="text-brand-yellow hover:underline font-semibold">
              Sign in
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}
