import type { Metadata } from 'next'
import { Calendar, Mail, MessageSquare } from 'lucide-react'
import IntakeForm from '@/components/forms/IntakeForm'

export const metadata: Metadata = {
  title: 'Contact',
  description:
    'Book a free 30-minute discovery call with R3 LLC. Tell us about your operational challenges and we\'ll identify where we can help — no pressure, no pitch deck.',
}

const contactInfo = [
  {
    Icon: Calendar,
    title: 'Book a Discovery Call',
    description: 'A 30-minute call to understand your challenges and identify where R3 can help.',
  },
  {
    Icon: MessageSquare,
    title: 'Fill out the form',
    description: "Prefer async? Submit your details and we'll follow up within one business day.",
  },
  {
    Icon: Mail,
    title: 'Email directly',
    description: 'hello@rthreellc.com',
    href: 'mailto:hello@rthreellc.com',
  },
]

const expectations = [
  'Response within 1 business day',
  'A brief intake call to understand your situation',
  "A clear recommendation — even if it's not us",
  'No sales pressure, no long pitch decks',
]

export default function ContactPage() {
  return (
    <>
      {/* Hero */}
      <section className="bg-zinc-950 py-24 pt-36">
        <div className="max-w-6xl mx-auto px-6">
          <p className="text-brand-500 text-sm font-semibold uppercase tracking-widest mb-4">
            Contact
          </p>
          <h1 className="text-5xl md:text-6xl font-black tracking-tighter text-white mb-6 max-w-2xl leading-tight">
            Let&apos;s talk about your business.
          </h1>
          <p className="text-zinc-400 text-lg leading-relaxed max-w-xl">
            Fill out the form and we&apos;ll get back to you within one business day. A
            discovery call is always free.
          </p>
        </div>
      </section>

      {/* Contact section */}
      <section className="bg-white py-24">
        <div className="max-w-6xl mx-auto px-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-14">
            {/* Sidebar */}
            <div>
              <h2 className="text-lg font-bold text-zinc-950 mb-7">How to reach us</h2>

              <div className="space-y-6 mb-10">
                {contactInfo.map((item) => {
                  const { Icon } = item
                  return (
                    <div key={item.title} className="flex gap-4">
                      <div className="w-10 h-10 rounded-lg bg-brand-50 border border-brand-100 flex items-center justify-center flex-shrink-0">
                        <Icon size={17} className="text-brand-600" />
                      </div>
                      <div>
                        <h3 className="font-semibold text-zinc-900 text-sm mb-0.5">
                          {item.title}
                        </h3>
                        {item.href ? (
                          <a
                            href={item.href}
                            className="text-brand-600 text-sm hover:underline"
                          >
                            {item.description}
                          </a>
                        ) : (
                          <p className="text-zinc-500 text-sm">{item.description}</p>
                        )}
                      </div>
                    </div>
                  )
                })}
              </div>

              {/* What to expect */}
              <div className="bg-zinc-50 border border-zinc-200 rounded-xl p-6">
                <h3 className="font-bold text-zinc-900 text-sm mb-4">What to expect</h3>
                <ul className="space-y-2.5">
                  {expectations.map((item) => (
                    <li key={item} className="flex items-start gap-2.5 text-sm text-zinc-600">
                      <span className="w-1.5 h-1.5 rounded-full bg-brand-600 mt-1.5 flex-shrink-0" />
                      {item}
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            {/* Form */}
            <div className="lg:col-span-2">
              <IntakeForm />
            </div>
          </div>
        </div>
      </section>
    </>
  )
}
