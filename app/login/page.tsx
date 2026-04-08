'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { useAuth } from '@/context/AuthContext'
import { Eye, EyeOff, Chrome } from 'lucide-react'

export default function LoginPage() {
  const { signIn, signInGoogle } = useAuth()
  const router = useRouter()

  const [email,    setEmail]    = useState('')
  const [password, setPassword] = useState('')
  const [showPw,   setShowPw]   = useState(false)
  const [loading,  setLoading]  = useState(false)
  const [error,    setError]    = useState('')

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      await signIn(email, password)
      router.push('/dashboard')
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Sign-in failed. Check your email and password.'
      if (message.includes('Please verify your email')) {
        setError(message + ' Need a new link? Contact support.')
      } else {
        setError(message)
      }
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

  return (
    <div className="min-h-screen flex items-center justify-center px-4 pt-16">
      <div className="w-full max-w-md">
        <div className="sz-card p-8">
          <h1 className="text-3xl font-black text-center mb-1">Welcome Back</h1>
          <p className="text-center text-white/50 text-sm mb-8">Sign in to your Sandlotz account</p>

          {/* Google sign-in */}
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
                  placeholder="••••••••"
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

            {error && (
              <div className="bg-red-500/10 border border-red-500/20 rounded-xl px-4 py-3 text-red-400 text-sm">
                {error}
              </div>
            )}

            <button type="submit" disabled={loading} className="btn-primary w-full mt-2">
              {loading ? 'Signing in…' : 'Sign In'}
            </button>
          </form>

          <p className="text-center text-white/40 text-sm mt-6">
            No account?{' '}
            <Link href="/signup" className="text-brand-yellow hover:underline font-semibold">
              Create one free
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}
