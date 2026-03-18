import Link from 'next/link'
import { Gift, Lock } from 'lucide-react'

const SAMPLE_PERKS = [
  { id: '1', title: '20% Off Nike Gear',    cost: 500,  brand: 'Nike',       emoji: '👟', desc: 'Discount code for Nike.com' },
  { id: '2', title: 'Free Protein Shake',   cost: 200,  brand: 'GNC',        emoji: '💪', desc: 'Redeemable at any GNC location' },
  { id: '3', title: 'Columbus FC Tickets',  cost: 1000, brand: 'Columbus FC', emoji: '⚽', desc: '2 tickets to a home match' },
  { id: '4', title: 'Fitness Assessment',   cost: 750,  brand: 'FitLab',     emoji: '📊', desc: 'Full performance analysis session' },
  { id: '5', title: '$25 SportChek Credit', cost: 300,  brand: 'SportChek',  emoji: '🏬', desc: 'In-store or online credit' },
  { id: '6', title: 'Premium Month Free',   cost: 400,  brand: 'Sandlotz',   emoji: '⭐', desc: 'Unlock all premium features' },
]

export default function PerksPage() {
  return (
    <div className="max-w-5xl mx-auto px-4 pt-24 pb-16">
      <div className="flex items-center gap-3 mb-2">
        <Gift className="w-8 h-8 text-brand-yellow" />
        <h1 className="text-3xl font-black">Perks</h1>
      </div>
      <p className="text-white/50 mb-8">
        Spend your PlayerPoints on real rewards from brand partners.
      </p>

      {/* Coming soon banner */}
      <div className="sz-card p-6 mb-8 border-brand-yellow/20 bg-brand-yellow/5 flex items-center gap-4">
        <Lock className="w-6 h-6 text-brand-yellow shrink-0" />
        <div>
          <p className="font-bold">Full Perks Marketplace Coming Soon</p>
          <p className="text-white/50 text-sm">
            Log activities now to bank PlayerPoints before launch.{' '}
            <Link href="/log-activity" className="text-brand-yellow hover:underline">Post an activity →</Link>
          </p>
        </div>
      </div>

      {/* Preview cards */}
      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
        {SAMPLE_PERKS.map(perk => (
          <div key={perk.id} className="sz-card p-6 opacity-75 relative">
            <div className="absolute top-3 right-3">
              <span className="text-xs bg-white/10 rounded-full px-2 py-0.5 text-white/40">Preview</span>
            </div>
            <div className="text-4xl mb-3">{perk.emoji}</div>
            <h3 className="font-black mb-1">{perk.title}</h3>
            <p className="text-white/40 text-sm mb-4">{perk.desc}</p>
            <div className="flex items-center justify-between">
              <span className="text-xs text-white/30">{perk.brand}</span>
              <div className="flex items-center gap-1">
                <span className="text-brand-yellow font-black">{perk.cost}</span>
                <span className="text-white/40 text-xs">pts</span>
              </div>
            </div>
            <button disabled className="btn-primary w-full mt-4 opacity-40 cursor-not-allowed text-sm !py-2">
              Redeem (Coming Soon)
            </button>
          </div>
        ))}
      </div>
    </div>
  )
}
