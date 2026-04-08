'use client'

import { useState } from 'react'
import { collection, addDoc, serverTimestamp } from 'firebase/firestore'
import { db } from '@/lib/firebase'
import { TrendingUp, CheckSquare, ShoppingCart, MapPin, BarChart2, Send, Lock, Info, Loader2 } from 'lucide-react'

const WHY_ITEMS = [
  { icon: TrendingUp,   title: 'Real ROI',            body: 'Pay-for-performance rewards (only pay when users act).' },
  { icon: MapPin,       title: 'Hyperlocal Reach',    body: 'Target by ZIP code, sport, age group, or leaderboard.' },
  { icon: CheckSquare,  title: 'Opt-In Engagement',   body: 'Every action is voluntary — no wasted impressions.' },
  { icon: BarChart2,    title: 'Repeat Behavior',     body: 'Quests, streaks, and leaderboards drive retention.' },
  { icon: ShoppingCart, title: 'Commerce-Ready',      body: 'Integrated resale and rewards marketplace.' },
]

const TIERS = [
  {
    name: 'Tier 1: Quick-Hit Awareness',
    price: '$2.5K – $5K',
    tagline: 'A low-risk, high-visibility way to test engagement and drive action.',
    color: 'text-green-400',
    borderColor: 'border-green-400/40',
    features: [
      'Branded Leaderboard for 30 days',
      'Unique Digital Perk (e.g., discount code)',
      'In-App Promotional Banner',
      '1x Feature in User Newsletter',
    ],
    pitch: 'Cheaper than a boosted IG post and drives guaranteed action.',
  },
  {
    name: 'Tier 2: Momentum Builder',
    price: '$5K – $10K',
    tagline: 'Lock in 3 months of visibility with added physical and social conversion tools.',
    color: 'text-yellow-400',
    borderColor: 'border-yellow-400/40',
    features: [
      'All Tier 1 Benefits',
      'Physical Rewards (product samples)',
      '2-3 Social Media Shoutouts',
      'Inclusion in 3+ Email Drip Campaigns',
      'Priority Placement in App Feed for 3 months',
    ],
    pitch: 'Build real athlete relationships by shipping product into their hands.',
  },
  {
    name: 'Tier 3: Flagship Campaign',
    price: '$10K – $25K',
    tagline: 'Embed your brand into the Sandlotz DNA for a full quarter with white-labeled control.',
    color: 'text-orange-400',
    borderColor: 'border-orange-400/40',
    features: [
      "White-Label Challenge under your brand's name",
      'Custom Data Dashboard with monthly insights',
      'Co-Branded Assets and social toolkits',
      'Content Integration (e.g., athlete stories)',
      'Custom Challenge Mechanics (streaks, multi-sport)',
    ],
    pitch: 'Own the field. Sandlotz becomes your campaign platform, community engine, and data lab.',
  },
]

const BUDGET_OPTIONS = [
  'Under $2,500',
  '$2,500 – $5,000',
  '$5,000 – $10,000',
  '$10,000 – $25,000',
  '$25,000+',
  'Equity / Investment interest',
  'Just exploring',
]

export default function PartnershipPage() {
  const [partnerType, setPartnerType] = useState('')
  const [submitted, setSubmitted] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')

  const [fields, setFields] = useState({
    name: '', company: '', email: '', website: '',
    goal: '', budget: '', referral: '', notes: '',
  })

  function set(key: keyof typeof fields) {
    return (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) =>
      setFields(prev => ({ ...prev, [key]: e.target.value }))
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setSubmitting(true)
    setError('')

    const payload = { ...fields, partnerType, submittedAt: new Date().toISOString() }

    try {
      // 1. Save to Firestore
      await addDoc(collection(db, 'partnershipInquiries'), {
        ...payload,
        createdAt: serverTimestamp(),
      })

      // 2. Send email notification
      await fetch('/api/partnership', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })

      setSubmitted(true)
    } catch (err) {
      console.error(err)
      setError('Something went wrong. Please try again or email partnerships@sandlotz.com directly.')
    } finally {
      setSubmitting(false)
    }
  }

  const inputClass = 'w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-white/30 text-sm focus:outline-none focus:border-yellow-400/60 transition-colors'

  return (
    <main className="min-h-screen pt-24 pb-16">
      <div className="max-w-4xl mx-auto px-6">

        {/* Hero */}
        <div className="text-center mb-14">
          <h1 className="text-5xl font-black text-white mb-5">Partner &amp; Investor Interest Form</h1>
          <p className="text-white/80 text-lg leading-relaxed max-w-2xl mx-auto">
            Welcome to the Sandlotz Partner &amp; Investor Portal. This form is your first step toward investing
            in or collaborating with a movement-based marketplace built on real-world action, verified
            fitness data, and community engagement.
          </p>
        </div>

        {/* Why Sandlotz */}
        <div className="sz-card p-8 mb-12">
          <h2 className="text-2xl font-bold text-white mb-2">Why Sandlotz?</h2>
          <hr className="border-white/10 mb-6" />
          <p className="text-white/80 text-sm leading-relaxed mb-4">
            Sandlotz transforms verified physical activity into a digital rewards economy. Our users earn
            PlayerPoints for fitness efforts — which they can redeem for perks, promote items, and level
            up in the community.
          </p>
          <p className="text-white/80 text-sm leading-relaxed mb-6">For partners and investors, this means:</p>
          <div className="grid sm:grid-cols-2 gap-4">
            {WHY_ITEMS.map(({ icon: Icon, title, body }) => (
              <div key={title} className="flex gap-3">
                <Icon className="w-5 h-5 text-yellow-400 flex-shrink-0 mt-0.5" />
                <p className="text-white/80 text-sm">
                  <span className="font-bold text-white">{title}:</span> {body}
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* Partnership Tiers */}
        <div className="mb-14">
          <h2 className="text-2xl font-bold text-white mb-2">Partnership Tiers</h2>
          <hr className="border-white/10 mb-4" />
          <p className="text-white/70 text-sm mb-8">
            We offer flexible tracks for brands, operators, and investors to achieve their goals.
          </p>
          <div className="grid sm:grid-cols-3 gap-5">
            {TIERS.map(tier => (
              <div key={tier.name} className={`rounded-2xl border ${tier.borderColor} bg-white/5 p-5 flex flex-col`}>
                <h3 className={`text-lg font-black mb-1 ${tier.color}`}>{tier.name}</h3>
                <div className="text-3xl font-black text-white mb-2">{tier.price}</div>
                <p className="text-white/70 text-xs leading-snug mb-4">{tier.tagline}</p>
                <ul className="space-y-2 flex-1 mb-4">
                  {tier.features.map(f => (
                    <li key={f} className="flex gap-2 text-xs text-white/80">
                      <span className="text-green-400 flex-shrink-0">✓</span>
                      {f}
                    </li>
                  ))}
                </ul>
                <p className="text-white/50 text-xs italic border-t border-white/10 pt-3">Pitch: {tier.pitch}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Interest Form */}
        <div className="sz-card p-8">
          {submitted ? (
            <div className="text-center py-10">
              <div className="text-5xl mb-4">🎉</div>
              <h2 className="text-3xl font-black text-white mb-3">Interest Received!</h2>
              <p className="text-white/70 text-base">A member of our team will follow up within 72 hours.</p>
            </div>
          ) : (
            <>
              <div className="flex items-center gap-2 mb-1">
                <Send className="w-5 h-5 text-yellow-400" />
                <h2 className="text-2xl font-black text-white">Submit Your Interest</h2>
              </div>
              <p className="text-white/60 text-sm mb-8">A member of our team will follow up within 72 hours.</p>

              <form onSubmit={handleSubmit} className="space-y-6">
                {/* Row 1 */}
                <div className="grid sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-white text-sm font-semibold mb-2">Name</label>
                    <input required value={fields.name} onChange={set('name')} className={inputClass} placeholder="Your full name" />
                  </div>
                  <div>
                    <label className="block text-white text-sm font-semibold mb-2">Company / Organization</label>
                    <input value={fields.company} onChange={set('company')} className={inputClass} placeholder="Your company name" />
                  </div>
                </div>

                {/* Row 2 */}
                <div className="grid sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-white text-sm font-semibold mb-2">Email Address</label>
                    <input required type="email" value={fields.email} onChange={set('email')} className={inputClass} placeholder="you@example.com" />
                  </div>
                  <div>
                    <label className="block text-white text-sm font-semibold mb-2">Website or LinkedIn</label>
                    <input value={fields.website} onChange={set('website')} className={inputClass} placeholder="https://" />
                  </div>
                </div>

                {/* Partnership type */}
                <div>
                  <label className="block text-white text-sm font-semibold mb-3">What type of partnership are you exploring?</label>
                  <div className="grid sm:grid-cols-2 gap-3">
                    {['Brand Sponsorship', 'Investment (Equity)', 'Local Activation', 'Other'].map(type => (
                      <button
                        key={type}
                        type="button"
                        onClick={() => setPartnerType(type)}
                        className={`flex items-center gap-3 px-4 py-3 rounded-xl border text-sm font-semibold transition-all text-left ${
                          partnerType === type
                            ? 'border-yellow-400 bg-yellow-400/10 text-yellow-400'
                            : 'border-white/10 bg-white/5 text-white/70 hover:border-white/20'
                        }`}
                      >
                        <span className={`w-4 h-4 rounded-full border-2 flex-shrink-0 ${partnerType === type ? 'border-yellow-400 bg-yellow-400' : 'border-white/40'}`} />
                        {type}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Goal */}
                <div>
                  <label className="block text-white text-sm font-semibold mb-2">Your Goal or Use Case</label>
                  <textarea rows={4} value={fields.goal} onChange={set('goal')} className={inputClass + ' resize-none'} placeholder="What do you want out of a partnership?" />
                </div>

                {/* Budget */}
                <div>
                  <label className="block text-white text-sm font-semibold mb-2">Estimated Budget or Interest Level</label>
                  <select value={fields.budget} onChange={set('budget')} className={inputClass + ' appearance-none'}>
                    <option value="">Select a range</option>
                    {BUDGET_OPTIONS.map(o => <option key={o} value={o} className="bg-[#1E1040]">{o}</option>)}
                  </select>
                </div>

                {/* Referral */}
                <div>
                  <label className="block text-white text-sm font-semibold mb-2">How did you hear about Sandlotz?</label>
                  <input value={fields.referral} onChange={set('referral')} className={inputClass} placeholder="Social media, referral, event..." />
                </div>

                {/* Additional notes */}
                <div>
                  <label className="block text-white text-sm font-semibold mb-2">Additional Notes or Questions</label>
                  <textarea rows={4} value={fields.notes} onChange={set('notes')} className={inputClass + ' resize-none'} placeholder="Anything else you'd like us to know..." />
                </div>

                {error && (
                  <p className="text-red-400 text-sm bg-red-400/10 border border-red-400/20 rounded-xl px-4 py-3">{error}</p>
                )}

                <button
                  type="submit"
                  disabled={submitting}
                  className="w-full flex items-center justify-center gap-2 bg-yellow-400 hover:bg-yellow-300 disabled:opacity-60 disabled:cursor-not-allowed text-purple-900 font-black px-8 py-4 rounded-xl text-base transition-all shadow-lg"
                >
                  {submitting ? <Loader2 className="w-5 h-5 animate-spin" /> : <Send className="w-5 h-5" />}
                  {submitting ? 'Submitting...' : 'Submit Interest Form'}
                </button>
              </form>

              {/* Data safety note */}
              <div className="mt-6 flex gap-3 rounded-xl border border-white/10 bg-white/5 p-4">
                <div className="flex gap-1 flex-shrink-0 mt-0.5">
                  <Info className="w-4 h-4 text-white/40" />
                  <Lock className="w-4 h-4 text-white/40" />
                </div>
                <p className="text-white/50 text-xs leading-relaxed">
                  <span className="text-white/70 font-semibold">Your Data is Safe.</span>{' '}
                  This form is securely stored. Submission does not imply any agreement or guarantee. ROI examples are illustrative only.
                  All sponsorships and investments are subject to evaluation, availability, and mutual approval. Questions? Contact us at{' '}
                  <a href="mailto:partnerships@sandlotz.com" className="text-yellow-400 hover:underline">partnerships@sandlotz.com</a>
                </p>
              </div>
            </>
          )}
        </div>
      </div>
    </main>
  )
}
