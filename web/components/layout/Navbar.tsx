'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useState, useRef, useEffect } from 'react'
import { ChevronDown, Menu, X, Rocket } from 'lucide-react'

const APP_URL = process.env.NEXT_PUBLIC_APP_URL ?? 'https://app.sandlotz.com'

const ABOUT_ITEMS = [
  { label: 'What is Sandlotz',       href: '/about/what-is-sandlotz' },
  { label: 'Products',                href: '/about/products' },
  { label: 'Leaderboards Explained',  href: '/about/leaderboards-explained' },
  { label: 'Scoring & Verification',  href: '/about/scoring-verification' },
  { label: 'Marketplace Guide',       href: '/about/marketplace-guide' },
]

const INVESTORS_ITEMS = [
  { label: 'Why Sandlotz',            href: '/investors/why-sandlotz' },
  { label: 'Partnership Application', href: '/investors/partnership' },
]

function DropdownMenu({ label, items, active }: {
  label: string
  items: { label: string; href: string }[]
  active: boolean
}) {
  const [open, setOpen] = useState(false)
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    function handler(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false)
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [])

  return (
    <div ref={ref} className="relative">
      <button
        onClick={() => setOpen(o => !o)}
        className={`flex items-center gap-1 px-4 py-2 rounded-lg text-sm font-semibold transition-all
          ${active ? 'bg-purple-500/40 text-yellow-400' : 'text-yellow-400 hover:bg-purple-500/30'}`}
      >
        {label}
        <ChevronDown className={`w-4 h-4 transition-transform ${open ? 'rotate-180' : ''}`} />
      </button>

      {open && (
        <div className="absolute top-full left-0 mt-1 w-52 bg-white rounded-xl shadow-xl py-1 z-50">
          {items.map(item => (
            <Link
              key={item.href}
              href={item.href}
              onClick={() => setOpen(false)}
              className="block px-4 py-2.5 text-sm text-gray-800 hover:bg-purple-50 transition-colors"
            >
              {item.label}
            </Link>
          ))}
        </div>
      )}
    </div>
  )
}

export default function Navbar() {
  const pathname = usePathname()
  const [mobileOpen, setMobileOpen] = useState(false)

  const navLink = (href: string, label: string) => (
    <Link
      key={href}
      href={href}
      className={`px-4 py-2 rounded-lg text-sm font-semibold transition-all
        ${pathname === href
          ? 'bg-purple-500/40 text-yellow-400'
          : 'text-yellow-400 hover:bg-purple-500/30'}`}
    >
      {label}
    </Link>
  )

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-[#5B21B6]">
      <div className="max-w-7xl mx-auto px-4 h-16 flex items-center gap-1">

        {/* Home */}
        {navLink('/', 'Home')}

        {/* About dropdown */}
        <DropdownMenu label="About" items={ABOUT_ITEMS} active={pathname.startsWith('/about')} />

        {/* Investors dropdown */}
        <DropdownMenu label="Investors" items={INVESTORS_ITEMS} active={pathname.startsWith('/investors')} />

        {/* Spacer */}
        <div className="flex-1" />

        {/* App CTAs */}
        <a
          href={`${APP_URL}/login`}
          className="hidden md:block px-4 py-2 rounded-lg text-sm font-semibold text-yellow-400 hover:bg-purple-500/30 transition-all"
        >
          Sign In
        </a>

        <a
          href={`${APP_URL}/signup`}
          className="ml-2 hidden md:flex items-center gap-2 bg-yellow-400 hover:bg-yellow-300 text-purple-900 font-bold px-5 py-2 rounded-xl text-sm transition-all shadow-md"
        >
          <Rocket className="w-4 h-4" />
          Get Started
        </a>

        {/* Mobile hamburger */}
        <button
          onClick={() => setMobileOpen(!mobileOpen)}
          className="md:hidden p-2 rounded-lg text-yellow-400 hover:bg-purple-500/30 transition-all"
        >
          {mobileOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
        </button>
      </div>

      {/* Mobile menu */}
      {mobileOpen && (
        <div className="md:hidden border-t border-purple-400/30 bg-[#5B21B6] px-4 pb-4 pt-2 space-y-1">
          <Link href="/" onClick={() => setMobileOpen(false)}
            className="block px-4 py-3 rounded-xl text-sm font-semibold text-yellow-400 hover:bg-purple-500/30">
            Home
          </Link>

          <div className="border-t border-purple-400/30 pt-2 mt-2 space-y-1">
            <p className="px-4 py-1 text-xs text-yellow-400/60 font-semibold uppercase tracking-wider">About</p>
            {ABOUT_ITEMS.map(item => (
              <Link key={item.href} href={item.href} onClick={() => setMobileOpen(false)}
                className="block px-4 py-2.5 rounded-xl text-sm text-yellow-400 hover:bg-purple-500/30">
                {item.label}
              </Link>
            ))}
          </div>

          <div className="border-t border-purple-400/30 pt-2 mt-2 space-y-1">
            <p className="px-4 py-1 text-xs text-yellow-400/60 font-semibold uppercase tracking-wider">Investors</p>
            {INVESTORS_ITEMS.map(item => (
              <Link key={item.href} href={item.href} onClick={() => setMobileOpen(false)}
                className="block px-4 py-2.5 rounded-xl text-sm text-yellow-400 hover:bg-purple-500/30">
                {item.label}
              </Link>
            ))}
          </div>

          <div className="border-t border-purple-400/30 pt-3 mt-2 flex flex-col gap-2">
            <a href={`${APP_URL}/login`}
              className="block px-4 py-3 rounded-xl text-sm font-semibold text-yellow-400 hover:bg-purple-500/30 text-center">
              Sign In
            </a>
            <a href={`${APP_URL}/signup`}
              className="flex items-center justify-center gap-2 bg-yellow-400 text-purple-900 font-bold px-5 py-3 rounded-xl text-sm">
              <Rocket className="w-4 h-4" />
              Get Started Free
            </a>
          </div>
        </div>
      )}
    </nav>
  )
}
