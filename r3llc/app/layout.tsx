import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import Navbar from '@/components/layout/Navbar'
import Footer from '@/components/layout/Footer'

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
  display: 'swap',
})

export const metadata: Metadata = {
  title: {
    default: 'R3 LLC — Business Systems & Execution',
    template: '%s | R3 LLC',
  },
  description:
    'R3 LLC is an AI-enabled business systems firm. We help companies eliminate operational drag, accelerate contract workflows, and build execution infrastructure that scales.',
  keywords: [
    'business systems',
    'contract operations',
    'workflow automation',
    'AI consulting',
    'operational efficiency',
    'fractional COO',
    'contract workflow',
    'business process design',
  ],
  authors: [{ name: 'R3 LLC' }],
  openGraph: {
    title: 'R3 LLC — Business Systems & Execution',
    description: 'Fix the friction. Build the system. Move faster.',
    url: 'https://rthreellc.com',
    siteName: 'R3 LLC',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'R3 LLC — Business Systems & Execution',
    description: 'Fix the friction. Build the system. Move faster.',
  },
  robots: {
    index: true,
    follow: true,
  },
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={inter.variable}>
      <body className="font-sans antialiased">
        <Navbar />
        <main>{children}</main>
        <Footer />
      </body>
    </html>
  )
}
