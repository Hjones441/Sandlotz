import Link from 'next/link'

const PLATFORM_LINKS = [
  { label: 'Dashboard',        href: '/dashboard' },
  { label: 'Log Activity',     href: '/log-activity' },
  { label: 'Leaderboard',      href: '/leaderboard' },
  { label: 'Perks Store',      href: '/perks' },
  { label: 'Marketplace',      href: '/marketplace' },
]

const LEARN_LINKS = [
  { label: 'What is Sandlotz?',        href: '/about/what-is-sandlotz' },
  { label: 'Our Products',             href: '/about/products' },
  { label: 'Scoring & Verification',   href: '/about/scoring-verification' },
  { label: 'Leaderboards & Quests',    href: '/about/leaderboards-explained' },
  { label: 'Marketplace Guide',        href: '/about/marketplace-guide' },
  { label: 'Interactive Demo',         href: '/demo' },
]

const INVESTOR_LINKS = [
  { label: 'Why Sandlotz',             href: '/investors/why-sandlotz' },
  { label: 'Partnership Application',  href: '/investors/partnership' },
  { label: 'Investor Overview',        href: '/investors' },
]

export default function Footer() {
  const year = new Date().getFullYear()

  return (
    <footer className="border-t border-white/10 bg-brand-purple-dark pb-24 md:pb-0">
      <div className="max-w-6xl mx-auto px-6 pt-12 pb-8">

        {/* 4-column grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mb-10">

          {/* Brand column */}
          <div className="col-span-2 md:col-span-1">
            <Link href="/" className="inline-block mb-3">
              <span className="text-xl font-black text-yellow-400 tracking-tight">SANDLOTZ</span>
            </Link>
            <p className="text-white/50 text-sm leading-relaxed mb-4">
              The AI-powered sports marketplace where your performance earns real rewards.
            </p>
            <p className="text-white/30 text-xs">
              Compete. Earn. Dominate.
            </p>
          </div>

          {/* Platform */}
          <div>
            <h4 className="text-white font-bold text-sm mb-4 uppercase tracking-wider">Platform</h4>
            <ul className="space-y-2.5">
              {PLATFORM_LINKS.map(l => (
                <li key={l.href}>
                  <Link href={l.href} className="text-white/50 hover:text-white text-sm transition-colors">
                    {l.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Learn */}
          <div>
            <h4 className="text-white font-bold text-sm mb-4 uppercase tracking-wider">Learn</h4>
            <ul className="space-y-2.5">
              {LEARN_LINKS.map(l => (
                <li key={l.href}>
                  <Link href={l.href} className="text-white/50 hover:text-white text-sm transition-colors">
                    {l.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Investors */}
          <div>
            <h4 className="text-white font-bold text-sm mb-4 uppercase tracking-wider">Investors</h4>
            <ul className="space-y-2.5">
              {INVESTOR_LINKS.map(l => (
                <li key={l.href}>
                  <Link href={l.href} className="text-white/50 hover:text-white text-sm transition-colors">
                    {l.label}
                  </Link>
                </li>
              ))}
            </ul>
            <div className="mt-5 pt-5 border-t border-white/10">
              <a
                href="mailto:investors@sandlotz.com"
                className="text-yellow-400 hover:text-yellow-300 text-sm font-semibold transition-colors"
              >
                investors@sandlotz.com
              </a>
            </div>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="border-t border-white/10 pt-6 flex flex-col sm:flex-row items-center justify-between gap-3">
          <p className="text-white/30 text-xs">
            © {year} Sandlotz, Inc. All rights reserved.
          </p>
          <div className="flex items-center gap-5">
            <Link href="/terms" className="text-white/30 hover:text-white/60 text-xs transition-colors">
              Terms of Service
            </Link>
            <Link href="/privacy" className="text-white/30 hover:text-white/60 text-xs transition-colors">
              Privacy Policy
            </Link>
            <a
              href="mailto:support@sandlotz.com"
              className="text-white/30 hover:text-white/60 text-xs transition-colors"
            >
              Contact
            </a>
          </div>
        </div>
      </div>
    </footer>
  )
}
