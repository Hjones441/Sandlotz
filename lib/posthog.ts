import posthog from 'posthog-js'

export function initPostHog() {
  if (typeof window === 'undefined') return
  const key = process.env.NEXT_PUBLIC_POSTHOG_KEY
  const host = process.env.NEXT_PUBLIC_POSTHOG_HOST ?? 'https://app.posthog.com'
  if (!key) return
  posthog.init(key, {
    api_host: host,
    capture_pageview: false, // manual in PostHogProvider
    autocapture: true,
    session_recording: { maskAllInputs: false },
  })
}

export { posthog }
