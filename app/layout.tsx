import type { Metadata, Viewport } from 'next'
import './globals.css'
import Providers from './providers'

export const metadata: Metadata = {
  title: {
    default:  'Sandlotz — Earn Real Rewards for Your Workouts',
    template: '%s · Sandlotz',
  },
  description: 'Log any sport, earn PlayerPoints, climb city leaderboards, and redeem real brand rewards. The fitness marketplace that pays you to show up.',
  icons: { icon: '/favicon.ico' },
  openGraph: {
    title:       'Sandlotz — Earn Real Rewards for Your Workouts',
    description: 'Log any sport, earn PlayerPoints, redeem real brand rewards.',
    url:         'https://app.sandlotz.com',
    siteName:    'Sandlotz',
    type:        'website',
  },
}

export const viewport: Viewport = {
  width:        'device-width',
  initialScale: 1,
  maximumScale: 1,
  themeColor:   '#1E1040',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <a href="#main-content"
          className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 focus:z-[100] focus:px-4 focus:py-2 focus:bg-brand-yellow focus:text-brand-purple-dark focus:font-bold focus:rounded-xl">
          Skip to content
        </a>
        <Providers>{children}</Providers>
      </body>
    </html>
  )
}
