import type { Metadata } from 'next'
import './globals.css'
import Providers from './providers'
import Navbar from '@/components/layout/Navbar'
import BottomNav from '@/components/layout/BottomNav'

export const metadata: Metadata = {
  title:       'Sandlotz — Compete. Earn. Dominate.',
  description: 'The AI-powered sports marketplace where your performance earns real rewards. Log workouts, climb leaderboards, and unlock brand perks.',
  icons: { icon: '/favicon.ico' },
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <Providers>
          <Navbar />
          <main className="min-h-screen">{children}</main>
          <BottomNav />
        </Providers>
      </body>
    </html>
  )
}
