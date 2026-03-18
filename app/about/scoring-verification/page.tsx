import Link from 'next/link'
import { Activity, ShieldCheck, Watch, ClipboardList, AlertTriangle, Zap } from 'lucide-react'

const SCORE_FACTORS = [
  { label: 'Sport Type',  description: 'High-intensity sports (e.g. BJJ, basketball) score higher per minute than low-intensity activities.' },
  { label: 'Duration',    description: 'Longer sessions earn more points, with diminishing returns beyond 3 hours to prevent inflation.' },
  { label: 'Intensity',   description: 'Heart-rate data from connected wearables adds a verified intensity multiplier to your score.' },
  { label: 'Distance',    description: 'For running, cycling, and swimming — GPS-verified distance factors into the formula.' },
  { label: 'Consistency', description: 'Logging 5+ days in a week applies a weekly streak bonus to all sessions that week.' },
]

const VERIFICATION_METHODS = [
  {
    icon: Watch,
    title: 'Wearable Sync',
    body: 'Connect Strava, Apple Health, or Google Fit. Activities imported from these sources are automatically marked as verified and receive the full score multiplier.',
  },
  {
    icon: ClipboardList,
    title: 'Manual Log',
    body: 'No wearable? Log manually by entering sport, duration, and perceived intensity. Manual logs receive a base score without the intensity multiplier.',
  },
  {
    icon: ShieldCheck,
    title: 'Photo Proof',
    body: 'Attach a gym check-in photo, race bib, or court photo to add a community-verified badge to your post. Verified posts get a small score bonus.',
  },
  {
    icon: Activity,
    title: 'GPS Tracking',
    body: 'Use the in-app tracker for outdoor runs, rides, and walks. GPS-verified distance is recorded directly and contributes to distance-based scoring.',
  },
]

export default function ScoringVerificationPage() {
  return (
    <main className="min-h-screen bg-[#5B21B6] pt-24 pb-16">
      <div className="max-w-3xl mx-auto px-6">

        <div className="text-center mb-12">
          <h1 className="text-5xl font-black text-white mb-5">Scoring & Verification</h1>
          <p className="text-white/80 text-lg leading-relaxed">
            The Sandlotz Simple-Score™ formula converts your real-world athletic effort into two
            types of points: <span className="text-yellow-400 font-semibold">SweatScore</span> (your
            lifetime rank) and <span className="text-yellow-400 font-semibold">PlayerPoints</span> (your
            spendable currency).
          </p>
        </div>

        {/* Formula intro */}
        <div className="rounded-2xl border border-yellow-400/30 bg-yellow-400/5 p-6 mb-12">
          <div className="flex items-start gap-4">
            <Zap className="w-6 h-6 text-yellow-400 flex-shrink-0 mt-0.5" />
            <div>
              <h2 className="text-xl font-black text-yellow-400 mb-2">The Simple-Score™ Formula</h2>
              <p className="text-white/80 text-sm leading-relaxed">
                Score = <strong className="text-white">Sport Base Rate</strong> × <strong className="text-white">Duration (mins)</strong> × <strong className="text-white">Intensity Multiplier</strong> × <strong className="text-white">Distance Bonus</strong> × <strong className="text-white">Streak Multiplier</strong>
              </p>
              <p className="text-white/60 text-xs mt-2">Both SweatScore and PlayerPoints are calculated from the same formula at the time of logging.</p>
            </div>
          </div>
        </div>

        {/* Score factors */}
        <h2 className="text-2xl font-bold text-yellow-400 mb-2">What Affects Your Score</h2>
        <hr className="border-white/20 mb-6" />
        <div className="space-y-4 mb-14">
          {SCORE_FACTORS.map(f => (
            <div key={f.label} className="flex gap-4 rounded-xl border border-purple-400/20 bg-[#6D28D9]/20 px-5 py-4">
              <span className="text-yellow-400 font-bold w-28 flex-shrink-0">{f.label}</span>
              <span className="text-white/80 text-sm leading-relaxed">{f.description}</span>
            </div>
          ))}
        </div>

        {/* Verification methods */}
        <h2 className="text-2xl font-bold text-yellow-400 mb-2">Verification Methods</h2>
        <hr className="border-white/20 mb-6" />
        <div className="space-y-6 mb-14">
          {VERIFICATION_METHODS.map(({ icon: Icon, title, body }) => (
            <div key={title} className="flex gap-5">
              <div className="flex-shrink-0 mt-0.5">
                <Icon className="w-6 h-6 text-yellow-400" />
              </div>
              <div>
                <h3 className="text-yellow-400 font-bold text-lg mb-1">{title}</h3>
                <p className="text-white/80 text-sm leading-relaxed">{body}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Anti-cheat note */}
        <div className="flex gap-4 rounded-2xl border border-orange-400/30 bg-orange-400/5 px-5 py-4 mb-14">
          <AlertTriangle className="w-5 h-5 text-orange-400 flex-shrink-0 mt-0.5" />
          <p className="text-white/70 text-sm leading-relaxed">
            <span className="text-orange-400 font-semibold">Fair play matters.</span> Suspicious activity patterns are flagged automatically. Accounts found manipulating scores are suspended. Verified data sources are always prioritised.
          </p>
        </div>

        <div className="rounded-2xl border border-purple-400/30 bg-[#6D28D9]/40 px-8 py-12 text-center">
          <h2 className="text-3xl font-black text-white mb-4">Start Earning Points</h2>
          <p className="text-white/80 text-base leading-relaxed max-w-md mx-auto mb-8">
            Create your free account, connect your wearable, and log your first activity.
          </p>
          <Link
            href="/signup"
            className="inline-block bg-yellow-400 hover:bg-yellow-300 text-purple-900 font-bold px-10 py-3.5 rounded-xl text-base transition-all shadow-lg"
          >
            Create Your Free Account
          </Link>
        </div>
      </div>
    </main>
  )
}
