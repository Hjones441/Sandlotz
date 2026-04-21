'use client'

import Link from 'next/link'
import { motion } from 'framer-motion'
import { useAuth } from '@/context/AuthContext'
import AppHeader from '@/components/layout/AppHeader'
import {
  Zap, Star, Trophy, CheckCircle2, ArrowRight, Mail,
  Users, Globe, ShieldCheck, Crown,
} from 'lucide-react'

// ─── Tier data ────────────────────────────────────────────────────────────────

const TIERS = [
  {
    name:        'Rookie',
    price:       '$0',
    period:      'forever',
    tagline:     'Get started. Earn your first points.',
    highlight:   false,
    badge:       'text-gray-400 border-gray-400/40 bg-gray-400/10',
    icon:        <Zap className="w-5 h-5 text-gray-400" />,
    features: [
      'Join public challenges',
      'Access basic leaderboards',
      'Participate in open quests',
      'Earn Sandlotz Score™ & PlayerPoints',
      'Streak badges',
      'View-only on custom group challenges',
    ],
  },
  {
    name:        'All-Star',
    price:       '$4.99',
    period:      'per month',
    tagline:     'Level up your competitive edge.',
    highlight:   true,
    badge:       'text-brand-yellow border-brand-yellow/40 bg-brand-yellow/10',
    icon:        <Star className="w-5 h-5 text-brand-yellow" />,
    features: [
      'Everything in Rookie',
      'Exclusive brand challenges',
      'High-tier sponsor rewards',
      'Custom groups up to 10 people',
      'Bonus PlayerPoints on group streaks',
      'Priority leaderboard visibility (sport + ZIP)',
    ],
  },
  {
    name:        'Legend',
    price:       '$14.99',
    period:      'per month',
    tagline:     'Lead your community. Build your brand.',
    highlight:   false,
    badge:       'text-purple-300 border-purple-300/40 bg-purple-300/10',
    icon:        <Crown className="w-5 h-5 text-purple-300" />,
    features: [
      'Everything in All-Star',
      'Unlimited group creation & hosting',
      'Invite-only global & elite-tier quests',
      'Create branded challenges with Sandlotz support',
      'Custom gym / league / employer leaderboards',
      'Priority sponsor prize access',
      'Custom workout posts + shareable reports',
      'Verified Challenge Leader status',
    ],
  },
]

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function UpgradePage() {
  const { profile } = useAuth()
  const currentTier = 'Rookie' // TODO: derive from profile.subscriptionTier when billing is live

  return (
    <div className="max-w-2xl mx-auto pb-4">
      <div className="sticky top-0 z-20 bg-[#0e0825]/95 backdrop-blur-xl border-b border-white/[0.05]">
        <AppHeader
          title="PlayerPath™ Plans"
          subtitle="Choose the tier that matches your grind"
        />
      </div>

      <div className="px-4 pt-5 pb-28 space-y-5">

        {/* Hero strip */}
        <div className="sz-card p-5 text-center">
          <Trophy className="w-8 h-8 text-brand-yellow mx-auto mb-3" />
          <h2 className="text-white font-black text-xl mb-1">Unlock Your Full Potential</h2>
          <p className="text-white/50 text-sm leading-relaxed">
            Every tier earns a Sandlotz Score™ and PlayerPoints. Higher plans unlock exclusive challenges, rewards, and community tools.
          </p>
        </div>

        {/* Tier cards */}
        {TIERS.map((tier, i) => {
          const isCurrent = tier.name === currentTier
          return (
            <motion.div
              key={tier.name}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.08 }}
              className={`sz-card overflow-hidden ${tier.highlight ? 'border-brand-yellow/30' : ''}`}
            >
              {tier.highlight && (
                <div className="bg-brand-yellow text-brand-purple-dark text-[10px] font-black tracking-widest text-center py-1.5">
                  ⭐ MOST POPULAR
                </div>
              )}

              <div className="p-5">
                {/* Header */}
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className={`w-10 h-10 rounded-xl border flex items-center justify-center ${tier.badge}`}>
                      {tier.icon}
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="text-white font-black text-lg">{tier.name}</h3>
                        {isCurrent && (
                          <span className="text-[9px] font-bold px-2 py-0.5 rounded-full bg-green-500/15 text-green-400 border border-green-500/20">
                            CURRENT
                          </span>
                        )}
                      </div>
                      <p className="text-white/40 text-xs">{tier.tagline}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-white font-black text-2xl leading-none">{tier.price}</p>
                    <p className="text-white/30 text-[10px]">{tier.period}</p>
                  </div>
                </div>

                {/* Features */}
                <ul className="space-y-2 mb-5">
                  {tier.features.map(f => (
                    <li key={f} className="flex items-start gap-2">
                      <CheckCircle2 className="w-3.5 h-3.5 text-brand-yellow flex-shrink-0 mt-0.5" />
                      <span className="text-white/70 text-sm">{f}</span>
                    </li>
                  ))}
                </ul>

                {/* CTA */}
                {isCurrent ? (
                  <div className="w-full py-3 rounded-xl text-center text-sm text-white/30 border border-white/[0.07]">
                    Your current plan
                  </div>
                ) : tier.price === '$0' ? (
                  <Link href="/dashboard" className="btn-ghost w-full text-sm text-center block py-3">
                    Continue as Rookie
                  </Link>
                ) : (
                  <a
                    href={`mailto:partnerships@sandlotz.com?subject=${encodeURIComponent(`${tier.name} Plan — ${profile?.displayName ?? 'User'}`)}&body=${encodeURIComponent(`Hi Sandlotz team,\n\nI'd like to upgrade to the ${tier.name} plan at ${tier.price}/mo.\n\nMy account: ${profile?.displayName ?? ''}\n\nPlease send me details on how to get started.`)}`}
                    className="btn-primary w-full flex items-center justify-center gap-2 text-sm"
                  >
                    <Mail className="w-4 h-4" />
                    Get {tier.name} — {tier.price}/mo
                    <ArrowRight className="w-3.5 h-3.5" />
                  </a>
                )}
              </div>
            </motion.div>
          )
        })}

        {/* Coming soon note */}
        <div className="sz-card p-5 text-center">
          <ShieldCheck className="w-6 h-6 text-brand-yellow mx-auto mb-2" />
          <p className="text-white font-bold mb-1">In-App Billing Coming Soon</p>
          <p className="text-white/40 text-sm leading-relaxed">
            Stripe checkout is in development. For now, email us to upgrade — we'll set you up manually within 24 hours.
          </p>
          <a href="mailto:partnerships@sandlotz.com" className="inline-flex items-center gap-1.5 text-brand-yellow text-sm font-bold hover:underline mt-3">
            <Mail className="w-3.5 h-3.5" /> partnerships@sandlotz.com
          </a>
        </div>

        {/* Trust badges */}
        <div className="grid grid-cols-3 gap-3 text-center">
          {[
            { icon: <Globe className="w-4 h-4 text-white/40 mx-auto mb-1" />,      label: 'PWA',         sub: 'No app store needed'    },
            { icon: <Users className="w-4 h-4 text-white/40 mx-auto mb-1" />,      label: 'Free forever', sub: 'Rookie tier always $0'  },
            { icon: <ShieldCheck className="w-4 h-4 text-white/40 mx-auto mb-1" />, label: 'Cancel anytime', sub: 'No contracts'         },
          ].map(b => (
            <div key={b.label} className="sz-card p-3">
              {b.icon}
              <p className="text-white text-xs font-bold">{b.label}</p>
              <p className="text-white/30 text-[10px] mt-0.5">{b.sub}</p>
            </div>
          ))}
        </div>

      </div>
    </div>
  )
}
