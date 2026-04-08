'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Menu, X } from 'lucide-react'

const navLinks = [
  { href: '/services', label: 'Services' },
  { href: '/industries', label: 'Industries' },
  { href: '/how-it-works', label: 'How It Works' },
  { href: '/about', label: 'About' },
  { href: '/case-studies', label: 'Results' },
]

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false)
  const [scrolled, setScrolled] = useState(false)
  const pathname = usePathname()

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 24)
    handleScroll()
    window.addEventListener('scroll', handleScroll, { passive: true })
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  // Close mobile menu on route change
  useEffect(() => {
    setIsOpen(false)
  }, [pathname])

  const isTransparent = !scrolled && !isOpen

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        isTransparent
          ? 'bg-transparent'
          : 'bg-white/95 backdrop-blur-md border-b border-zinc-200 shadow-sm'
      }`}
    >
      <nav className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-1 shrink-0">
          <span
            className={`text-2xl font-black tracking-tighter transition-colors duration-300 ${
              isTransparent ? 'text-white' : 'text-zinc-950'
            }`}
          >
            R3
          </span>
          <span
            className={`text-sm font-semibold transition-colors duration-300 ${
              isTransparent ? 'text-zinc-400' : 'text-zinc-500'
            }`}
          >
            LLC
          </span>
        </Link>

        {/* Desktop nav */}
        <div className="hidden md:flex items-center gap-7">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className={`text-sm font-medium transition-colors duration-200 ${
                pathname === link.href
                  ? isTransparent
                    ? 'text-white'
                    : 'text-brand-600'
                  : isTransparent
                  ? 'text-zinc-300 hover:text-white'
                  : 'text-zinc-600 hover:text-zinc-950'
              }`}
            >
              {link.label}
            </Link>
          ))}
        </div>

        {/* CTA */}
        <div className="hidden md:flex">
          <Link
            href="/contact"
            className="bg-brand-600 hover:bg-brand-700 text-white text-sm font-semibold px-5 py-2.5 rounded-lg transition-colors duration-200"
          >
            Book a Call
          </Link>
        </div>

        {/* Mobile hamburger */}
        <button
          onClick={() => setIsOpen(!isOpen)}
          aria-label="Toggle navigation"
          className={`md:hidden p-2 rounded-md transition-colors ${
            isTransparent
              ? 'text-white hover:bg-white/10'
              : 'text-zinc-700 hover:bg-zinc-100'
          }`}
        >
          {isOpen ? <X size={20} /> : <Menu size={20} />}
        </button>
      </nav>

      {/* Mobile menu */}
      {isOpen && (
        <div className="md:hidden bg-white border-b border-zinc-200">
          <div className="max-w-6xl mx-auto px-6 py-5 flex flex-col gap-1">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className={`px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                  pathname === link.href
                    ? 'bg-brand-50 text-brand-700'
                    : 'text-zinc-700 hover:bg-zinc-50 hover:text-zinc-950'
                }`}
              >
                {link.label}
              </Link>
            ))}
            <Link
              href="/contact"
              className="mt-3 bg-brand-600 hover:bg-brand-700 text-white text-sm font-semibold px-5 py-3 rounded-lg transition-colors text-center"
            >
              Book a Discovery Call
            </Link>
          </div>
        </div>
      )}
    </header>
  )
}
