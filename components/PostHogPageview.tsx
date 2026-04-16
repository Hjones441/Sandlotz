'use client'

import { useEffect } from 'react'
import { usePathname, useSearchParams } from 'next/navigation'
import { initPostHog, posthog } from '@/lib/posthog'
import { Suspense } from 'react'

function PageviewInner() {
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

export default function PostHogPageview() {
  return (
    <Suspense fallback={null}>
      <PageviewInner />
    </Suspense>
  )
}
