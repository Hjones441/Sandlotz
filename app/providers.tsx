'use client'

import { Suspense, useEffect } from 'react'
import { usePathname, useSearchParams } from 'next/navigation'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { AuthProvider } from '@/context/AuthContext'
import { initPostHog, posthog } from '@/lib/posthog'

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime:            60_000,
      retry:                1,
      refetchOnWindowFocus: false,
    },
  },
})

function PostHogPageview() {
  const pathname     = usePathname()
  const searchParams = useSearchParams()

  useEffect(() => {
    initPostHog()
  }, [])

  useEffect(() => {
    if (pathname) {
      const url =
        window.origin + pathname +
        (searchParams?.toString() ? `?${searchParams}` : '')
      posthog.capture('$pageview', { $current_url: url })
    }
  }, [pathname, searchParams])

  return null
}

export default function Providers({ children }: { children: React.ReactNode }) {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <Suspense fallback={null}>
          <PostHogPageview />
        </Suspense>
        {children}
      </AuthProvider>
    </QueryClientProvider>
  )
}
