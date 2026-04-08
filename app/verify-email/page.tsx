'use client'

import { useState } from 'react'
import { useAuth } from '@/context/AuthContext'
import Link from 'next/link'
import { Mail, RefreshCw, CheckCircle, LogOut } from 'lucide-react'

export default function VerifyEmailPage() {
  const { user, resendVerification, logOut } = useAuth()
  const [sending,  setSending]  = useState(false)
  const [sent,     setSent]     = useState(false)
  const [error,    setError]    = useState('')

  async function handleResend() {
    setSending(true)
    setError('')
    try {
      await resendVerification()
      setSent(true)
    } catch (err: any) {
      setError(err.message ?? 'Failed to resend. Please try again.')
    } finally {
      setSending(false)
    }
  }

  return (
    <main className="min-h-screen flex items-center justify-center px-4 pt-16">
      <div className="max-w-md w-full sz-card p-8 text-center">

        {/* Icon */}
        <div className="w-16 h-16 bg-yellow-400/10 rounded-full flex items-center justify-center mx-auto mb-5">
          <Mail className="w-8 h-8 text-yellow-400" />
        </div>

        <h1 className="text-2xl font-black text-white mb-2">Check Your Email</h1>
        <p className="text-white/60 text-sm leading-relaxed mb-6">
          We sent a verification link to{' '}
          <span className="text-white font-semibold">{user?.email ?? 'your email'}</span>.
          Click the link in that email to activate your account.
        </p>

        {sent ? (
          <div className="flex items-center justify-center gap-2 bg-green-500/10 border border-green-500/20 rounded-xl px-4 py-3 mb-6">
            <CheckCircle className="w-4 h-4 text-green-400" />
            <span className="text-green-400 text-sm font-semibold">Verification email resent!</span>
          </div>
        ) : (
          <>
            {error && (
              <p className="text-red-400 text-sm bg-red-400/10 border border-red-400/20 rounded-xl px-4 py-3 mb-4">
                {error}
              </p>
            )}
            <button
              onClick={handleResend}
              disabled={sending}
              className="btn-primary w-full flex items-center justify-center gap-2 mb-4 disabled:opacity-60"
            >
              <RefreshCw className={`w-4 h-4 ${sending ? 'animate-spin' : ''}`} />
              {sending ? 'Sending...' : 'Resend Verification Email'}
            </button>
          </>
        )}

        <div className="border-t border-white/10 pt-5 space-y-3">
          <p className="text-white/40 text-xs">
            Already verified?{' '}
            <Link href="/login" className="text-yellow-400 hover:text-yellow-300 font-semibold">
              Sign in
            </Link>
          </p>
          <button
            onClick={() => logOut()}
            className="flex items-center gap-1.5 text-white/30 hover:text-white/60 text-xs mx-auto transition-colors"
          >
            <LogOut className="w-3.5 h-3.5" />
            Sign out
          </button>
        </div>
      </div>
    </main>
  )
}
