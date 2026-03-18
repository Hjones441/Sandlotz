'use client'

import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { useState } from 'react'
import { Menu, X, Trophy, Zap, User, LogOut, LayoutDashboard, Gift } from 'lucide-react'
import { useAuth } from '@/context/AuthContext'

const NAV_LINKS = [
  { href: '/leaderboard',  label: 'Leaderboard', icon: <Trophy    className="w-4 h-4" /> },
  { href: '/log-activity', label: 'Post',         icon: <Zap       className="w-4 h-4" /> },
  { href: '/perks',        label: 'Perks',        icon: <Gift      className="w-4 h-4" /> },
]

export default function Navbar() {
  const { user, profile, logOut } = useAuth()
  const pathname  = usePathname()
  const router    = useRouter()
  const [open, setOpen] = useState(false)

  async function handleLogOut() {
    await logOut()
    router.push('/')
    setOpen(false)
  }

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 border-b border-white/10"
         style={{ background: 'rgba(30,16,64,0.95)', backdropFilter: 'blur(12px)' }}>
      <div className="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between">

        {/* Logo */}
        <Link href="/" className="text-2xl font-black tracking-tight text-gold">
          SANDLOTZ
        </Link>

        {/* Desktop nav */}
        <div className="hidden md:flex items-center gap-1">
          {NAV_LINKS.map(l => (
            <Link
              key={l.href}
              href={l.href}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold transition-all
                ${pathname === l.href
                  ? 'bg-brand-yellow text-brand-purple-dark'
                  : 'text-white/70 hover:text-white hover:bg-white/10'
                }`}
            >
              {l.icon}{l.label}
            </Link>
          ))}
        </div>

        {/* Desktop right side */}
        <div className="hidden md:flex items-center gap-3">
          {user ? (
            <>
              <Link
                href="/dashboard"
                className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold transition-all
                  ${pathname === '/dashboard'
                    ? 'bg-white/20 text-white'
                    : 'text-white/70 hover:text-white hover:bg-white/10'
                  }`}
              >
                <LayoutDashboard className="w-4 h-4" />
                Dashboard
              </Link>
              <Link
                href="/profile"
                className="flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-semibold text-white/70 hover:text-white hover:bg-white/10 transition-all"
              >
                <User className="w-4 h-4" />
                {profile?.displayName?.split(' ')[0] ?? 'Profile'}
              </Link>
              <button
                onClick={handleLogOut}
                className="flex items-center gap-2 px-3 py-2 rounded-lg text-sm text-white/50 hover:text-white hover:bg-white/10 transition-all"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </>
          ) : (
            <>
              <Link href="/login"  className="text-sm font-semibold text-white/70 hover:text-white px-4 py-2 rounded-lg hover:bg-white/10 transition-all">
                Login
              </Link>
              <Link href="/signup" className="btn-primary !py-2 !px-5 text-sm">
                Get Started
              </Link>
            </>
          )}
        </div>

        {/* Mobile hamburger */}
        <button
          onClick={() => setOpen(!open)}
          className="md:hidden p-2 rounded-lg text-white/70 hover:text-white hover:bg-white/10 transition-all"
        >
          {open ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
        </button>
      </div>

      {/* Mobile menu */}
      {open && (
        <div className="md:hidden border-t border-white/10 px-4 pb-4 pt-2 space-y-1"
             style={{ background: 'rgba(30,16,64,0.98)' }}>
          {NAV_LINKS.map(l => (
            <Link
              key={l.href}
              href={l.href}
              onClick={() => setOpen(false)}
              className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold transition-all
                ${pathname === l.href
                  ? 'bg-brand-yellow text-brand-purple-dark'
                  : 'text-white/70 hover:text-white hover:bg-white/10'
                }`}
            >
              {l.icon}{l.label}
            </Link>
          ))}

          <div className="border-t border-white/10 pt-2 mt-2">
            {user ? (
              <>
                <Link href="/dashboard" onClick={() => setOpen(false)}
                  className="flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold text-white/70 hover:text-white hover:bg-white/10 transition-all">
                  <LayoutDashboard className="w-4 h-4" />Dashboard
                </Link>
                <Link href="/profile" onClick={() => setOpen(false)}
                  className="flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold text-white/70 hover:text-white hover:bg-white/10 transition-all">
                  <User className="w-4 h-4" />Profile
                </Link>
                <button onClick={handleLogOut}
                  className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold text-white/50 hover:text-white hover:bg-white/10 transition-all">
                  <LogOut className="w-4 h-4" />Sign Out
                </button>
              </>
            ) : (
              <>
                <Link href="/login"  onClick={() => setOpen(false)}
                  className="block px-4 py-3 rounded-xl text-sm font-semibold text-white/70 hover:text-white hover:bg-white/10 transition-all">
                  Login
                </Link>
                <Link href="/signup" onClick={() => setOpen(false)}
                  className="block mt-2 btn-primary text-center text-sm">
                  Get Started
                </Link>
              </>
            )}
          </div>
        </div>
      )}
    </nav>
  )
}
