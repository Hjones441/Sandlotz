'use client'

import { useState } from 'react'
import { ArrowRight, Loader2, CheckCircle2 } from 'lucide-react'

const serviceOptions = [
  'Workflow Clarity Audit',
  'Contract Ops Buildout',
  'Business Systems Advisory',
  'Post-Award Compliance Layer',
  'Fractional Ops Partner',
  "Not sure — I need guidance",
]

const companySizeOptions = [
  '1–10 employees',
  '11–50 employees',
  '51–200 employees',
  '200+ employees',
]

interface FormState {
  firstName: string
  lastName: string
  email: string
  company: string
  companySize: string
  service: string
  challenge: string
}

const emptyForm: FormState = {
  firstName: '',
  lastName: '',
  email: '',
  company: '',
  companySize: '',
  service: '',
  challenge: '',
}

const inputClass =
  'w-full border border-zinc-300 rounded-lg px-4 py-2.5 text-sm text-zinc-900 placeholder-zinc-400 bg-white focus:outline-none focus:ring-2 focus:ring-brand-600/25 focus:border-brand-500 transition duration-150'

const labelClass = 'block text-sm font-medium text-zinc-700 mb-1.5'

export default function IntakeForm() {
  const [form, setForm] = useState<FormState>(emptyForm)
  const [status, setStatus] = useState<'idle' | 'submitting' | 'success' | 'error'>('idle')

  const set = (key: keyof FormState) => (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => setForm((prev) => ({ ...prev, [key]: e.target.value }))

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setStatus('submitting')

    try {
      const res = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      })
      setStatus(res.ok ? 'success' : 'error')
    } catch {
      setStatus('error')
    }
  }

  if (status === 'success') {
    return (
      <div className="bg-zinc-50 border border-zinc-200 rounded-2xl p-12 text-center">
        <div className="w-14 h-14 rounded-full bg-brand-50 border border-brand-100 flex items-center justify-center mx-auto mb-5">
          <CheckCircle2 size={24} className="text-brand-600" />
        </div>
        <h3 className="text-xl font-bold text-zinc-950 mb-2">Message received.</h3>
        <p className="text-zinc-500 text-sm leading-relaxed max-w-sm mx-auto">
          We&apos;ll get back to you within one business day. Looking forward to the
          conversation.
        </p>
      </div>
    )
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      {/* Name */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className={labelClass}>First name *</label>
          <input
            type="text"
            required
            value={form.firstName}
            onChange={set('firstName')}
            placeholder="First"
            className={inputClass}
          />
        </div>
        <div>
          <label className={labelClass}>Last name *</label>
          <input
            type="text"
            required
            value={form.lastName}
            onChange={set('lastName')}
            placeholder="Last"
            className={inputClass}
          />
        </div>
      </div>

      {/* Email */}
      <div>
        <label className={labelClass}>Work email *</label>
        <input
          type="email"
          required
          value={form.email}
          onChange={set('email')}
          placeholder="you@company.com"
          className={inputClass}
        />
      </div>

      {/* Company + size */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className={labelClass}>Company</label>
          <input
            type="text"
            value={form.company}
            onChange={set('company')}
            placeholder="Acme Corp"
            className={inputClass}
          />
        </div>
        <div>
          <label className={labelClass}>Company size</label>
          <select value={form.companySize} onChange={set('companySize')} className={inputClass}>
            <option value="">Select...</option>
            {companySizeOptions.map((s) => (
              <option key={s} value={s}>
                {s}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Service interest */}
      <div>
        <label className={labelClass}>What are you interested in?</label>
        <select value={form.service} onChange={set('service')} className={inputClass}>
          <option value="">Select a service...</option>
          {serviceOptions.map((s) => (
            <option key={s} value={s}>
              {s}
            </option>
          ))}
        </select>
      </div>

      {/* Challenge */}
      <div>
        <label className={labelClass}>
          Describe your biggest operational challenge *
        </label>
        <textarea
          required
          rows={4}
          value={form.challenge}
          onChange={set('challenge')}
          placeholder="Tell us what's slowing you down. The more specific, the better."
          className={`${inputClass} resize-none`}
        />
      </div>

      {/* Error message */}
      {status === 'error' && (
        <p className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg px-4 py-3">
          Something went wrong. Please try again or email{' '}
          <a href="mailto:admin@rthreellc.com" className="underline">
            admin@rthreellc.com
          </a>{' '}
          directly.
        </p>
      )}

      <button
        type="submit"
        disabled={status === 'submitting'}
        className="group w-full inline-flex items-center justify-center gap-2 bg-brand-600 hover:bg-brand-700 disabled:opacity-60 text-white font-semibold px-6 py-3.5 rounded-lg transition-colors text-sm"
      >
        {status === 'submitting' ? (
          <>
            <Loader2 size={16} className="animate-spin" />
            Sending...
          </>
        ) : (
          <>
            Send Message
            <ArrowRight
              size={16}
              className="group-hover:translate-x-0.5 transition-transform"
            />
          </>
        )}
      </button>

      <p className="text-xs text-zinc-400 text-center">
        We respond within one business day. No spam, ever.
      </p>
    </form>
  )
}
