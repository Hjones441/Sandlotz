'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { motion } from 'framer-motion'
import { Home, Trophy, Plus, ShoppingBag, User, Swords } from 'lucide-react'

const TABS = [
  { href: '/dashboard',   label: 'Home',   icon: Home       },
  { href: '/leaderboard', label: 'Ranks',  icon: Trophy     },
  null, // center FAB placeholder
  { href: '/challenges',  label: 'Compete', icon: Swords    },
  { href: '/marketplace', label: 'Market', icon: ShoppingBag },
]

export default function AppNav() {
  const pathname = usePathname()

  return (
    <nav aria-label="Main navigation"
         className="fixed bottom-0 left-0 right-0 z-50
                    bg-[#120a2e]/95 backdrop-blur-2xl
                    border-t border-white/[0.07]"
         style={{ paddingBottom: 'env(safe-area-inset-bottom, 0px)' }}>
      <div className="flex items-end justify-around max-w-lg mx-auto px-2 pt-2 pb-2">
        {TABS.map((tab, i) => {
          // Center FAB
          if (tab === null) {
            return (
              <Link key="fab" href="/log-activity" aria-label="Log activity" className="relative -top-5 flex-shrink-0">
                <motion.div
                  whileTap={{ scale: 0.92 }}
                  whileHover={{ scale: 1.05 }}
                  className="w-14 h-14 rounded-2xl bg-brand-yellow shadow-lg shadow-brand-yellow/30
                             flex items-center justify-center"
                >
                  <Plus className="w-7 h-7 text-brand-purple-dark" strokeWidth={2.5} />
                </motion.div>
                <p className="text-[9px] text-center mt-1 text-white/30 font-semibold">Log</p>
              </Link>
            )
          }

          const { href, label, icon: Icon } = tab
          const active = pathname === href || pathname.startsWith(href + '/')

          return (
            <Link key={href} href={href} className="flex flex-col items-center gap-1 px-3 py-1 relative min-w-[52px]">
              {active && (
                <motion.div
                  layoutId="appNavPill"
                  className="absolute inset-0 bg-brand-yellow/10 rounded-xl"
                  transition={{ type: 'spring', stiffness: 500, damping: 35 }}
                />
              )}
              <Icon
                className={`w-[22px] h-[22px] relative z-10 transition-colors ${
                  active ? 'text-brand-yellow' : 'text-white/35'
                }`}
                strokeWidth={active ? 2.2 : 1.8}
              />
              <span className={`text-[10px] font-semibold relative z-10 transition-colors ${
                active ? 'text-brand-yellow' : 'text-white/35'
              }`}>
                {label}
              </span>
            </Link>
          )
        })}
      </div>
    </nav>
  )
}
