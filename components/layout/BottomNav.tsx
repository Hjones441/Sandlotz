'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { motion } from 'framer-motion'
import { Home, Zap, Trophy, Gift, User } from 'lucide-react'

const NAV_ITEMS = [
  { href: '/dashboard',    label: 'Home',       icon: Home    },
  { href: '/log-activity', label: 'Post',        icon: Zap     },
  { href: '/leaderboard',  label: 'Rankings',    icon: Trophy  },
  { href: '/perks',        label: 'Perks',       icon: Gift    },
  { href: '/profile',      label: 'Profile',     icon: User    },
]

export default function BottomNav() {
  const pathname = usePathname()

  // Hide on landing, login, signup
  const hide = ['/', '/login', '/signup'].includes(pathname)
  if (hide) return null

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 md:hidden
                    bg-brand-purple-dark/95 backdrop-blur-xl border-t border-white/10
                    safe-area-pb">
      <div className="flex items-center justify-around px-2 pt-2 pb-safe">
        {NAV_ITEMS.map(({ href, label, icon: Icon }) => {
          const active = pathname === href || pathname.startsWith(href + '/')
          return (
            <Link
              key={href}
              href={href}
              className="flex flex-col items-center gap-0.5 px-3 py-2 relative"
            >
              {active && (
                <motion.div
                  layoutId="bottomNavIndicator"
                  className="absolute inset-0 bg-brand-yellow/10 rounded-xl"
                  transition={{ type: 'spring', stiffness: 400, damping: 30 }}
                />
              )}
              <Icon
                className={`w-5 h-5 transition-colors relative z-10 ${
                  active ? 'text-brand-yellow' : 'text-white/40'
                }`}
              />
              <span
                className={`text-[10px] font-semibold relative z-10 transition-colors ${
                  active ? 'text-brand-yellow' : 'text-white/40'
                }`}
              >
                {label}
              </span>
            </Link>
          )
        })}
      </div>
    </nav>
  )
}
