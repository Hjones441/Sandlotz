import Link from 'next/link'

const footerLinks = {
  Services: [
    { href: '/services#workflow-audit', label: 'Workflow Clarity Audit' },
    { href: '/services#contract-ops', label: 'Contract Ops Buildout' },
    { href: '/services#advisory', label: 'Business Systems Advisory' },
    { href: '/services#compliance', label: 'Post-Award Compliance' },
    { href: '/services#fractional', label: 'Fractional Ops Partner' },
  ],
  Company: [
    { href: '/about', label: 'About' },
    { href: '/industries', label: 'Industries' },
    { href: '/how-it-works', label: 'How It Works' },
    { href: '/case-studies', label: 'Case Studies' },
  ],
  Contact: [
    { href: '/contact', label: 'Book a Discovery Call' },
    { href: 'mailto:admin@rthreellc.com', label: 'admin@rthreellc.com' },
  ],
}

export default function Footer() {
  return (
    <footer className="bg-zinc-950 text-zinc-400">
      <div className="max-w-6xl mx-auto px-6 pt-16 pb-10">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-12">
          {/* Brand */}
          <div className="col-span-1">
            <Link href="/" className="flex items-center gap-1 mb-5">
              <span className="text-2xl font-black tracking-tighter text-white">R3</span>
              <span className="text-sm font-semibold text-zinc-500">LLC</span>
            </Link>
            <p className="text-sm leading-relaxed text-zinc-500 mb-4">
              AI-enabled business systems and execution. We fix the friction so you can move faster.
            </p>
            <p className="text-xs text-zinc-600">
              Serving companies across the US.
            </p>
          </div>

          {/* Link columns */}
          {Object.entries(footerLinks).map(([category, links]) => (
            <div key={category}>
              <h3 className="text-white text-xs font-semibold uppercase tracking-widest mb-4">
                {category}
              </h3>
              <ul className="space-y-3">
                {links.map((link) => (
                  <li key={link.href}>
                    <Link
                      href={link.href}
                      className="text-sm text-zinc-500 hover:text-zinc-200 transition-colors"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="pt-8 border-t border-zinc-800 flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="text-xs text-zinc-600">
            © {new Date().getFullYear()} R3 LLC. All rights reserved.
          </p>
          <p className="text-xs text-zinc-700">
            Business Systems &amp; Execution Consulting · rthreellc.com
          </p>
        </div>
      </div>
    </footer>
  )
}
