'use client'

import dynamic from 'next/dynamic'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { AuthProvider } from '@/context/AuthContext'

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime:            60_000,
      retry:                1,
      refetchOnWindowFocus: false,
    },
  },
})

// Dynamically import PostHog tracker — browser-only, never runs during SSR/prerender
const PostHogPageview = dynamic(() => import('@/components/PostHogPageview'), { ssr: false })

export default function Providers({ children }: { children: React.ReactNode }) {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <PostHogPageview />
        {children}
      </AuthProvider>
    </QueryClientProvider>
  )
}
