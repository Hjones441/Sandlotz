import Link from 'next/link'
import { Fingerprint, Cpu, MapPin, AlertTriangle, Mail } from 'lucide-react'

const INTENSITY_TABLE = [
  { quality: 'Gold',     criteria: '≥ 50% of time in Zone 3+ (HR)',          multiplier: '1.00×', color: 'text-yellow-400' },
  { quality: 'Silver',   criteria: '30–49% in Zone 3+',                       multiplier: '0.85×', color: 'text-slate-300' },
  { quality: 'Bronze',   criteria: 'HR present but < 30% Zone 3+',            multiplier: '0.75×', color: 'text-orange-400' },
  { quality: 'Fallback', criteria: 'No HR, but verified pace/power ≥ MET 8',  multiplier: '0.65×', color: 'text-white/70' },
  { quality: 'Penalty',  criteria: 'No HR and no pace/power',                 multiplier: '0.40×', color: 'text-red-400' },
]

const ANTI_CHEAT = [
  { icon: Fingerprint,    title: 'Device Attestation',       body: 'Blocks emulators & rooted devices (Play Integrity, App Attest).' },
  { icon: Cpu,            title: 'Data Fingerprinting',      body: 'SHA-256 hashes prevent recycled FIT/GPX files.' },
  { icon: MapPin,         title: 'GPS + HR Physics Model',   body: 'Flags impossible speed-HR-grade combos (e.g., 180 bpm at 1 mph).' },
  { icon: Cpu,            title: 'LLM Anomaly Detection',    body: 'A domain-trained model compares each log to millions of sport traces and quarantines outliers that defy real-world physics (e.g., 2-h, 5,000-cal "yoga" sessions).' },
  { icon: AlertTriangle,  title: 'Manual-Entry Safeguards',  body: 'Progressive CAPTCHA, selfie-video, and AP throttling deter copy-paste farms.' },
]

export default function ScoringVerificationPage() {
  return (
    <main className="min-h-screen bg-[#5B21B6] pt-24 pb-16">
      <div className="max-w-3xl mx-auto px-6">

        {/* Hero */}
        <div className="rounded-2xl border border-purple-400/20 bg-[#6D28D9]/20 p-8 mb-12">
          <h1 className="text-4xl font-black text-white mb-2">The Sandlotz Simple-Score™ Formula</h1>
          <p className="text-white/50 text-sm">Commitment to a fair and transparent ecosystem • Last updated 28 June 2025</p>
        </div>

        {/* 1. Introduction */}
        <div className="mb-10">
          <h2 className="text-2xl font-bold text-yellow-400 mb-3">1. Introduction – Trust Is Everything</h2>
          <p className="text-white/80 text-sm leading-relaxed">
            The Sandlotz ecosystem runs on data integrity. Every point earned, rank achieved, and perk redeemed is backed by our
            proprietary Sandlotz Simple-Score™ formula — a system that&apos;s easy to understand yet extremely hard to game. This
            document explains that system and the safeguards that protect it.
          </p>
        </div>

        {/* 2. Scoring Formula */}
        <div className="mb-10">
          <h2 className="text-2xl font-bold text-yellow-400 mb-3">2. The Scoring Formula</h2>
          <p className="text-white/70 text-sm mb-5">Points hinge on the quality—not just the quantity—of effort.</p>

          <div className="rounded-xl border border-purple-400/30 bg-purple-900/40 px-6 py-4 mb-6 font-mono text-sm text-white overflow-x-auto">
            Activity Points (AP) = (Calories Burned ÷ 10) × Source Modifier × Effort Validator
          </div>

          <div className="space-y-5">
            <div>
              <h3 className="text-white font-bold mb-1">Calories Burned</h3>
              <p className="text-white/70 text-sm">Raw energy expenditure (kcal) from the activity record.</p>
            </div>

            <div>
              <h3 className="text-white font-bold mb-2">Source Modifier</h3>
              <p className="text-white/70 text-sm mb-3">Rewards trustworthy data sources.</p>
              <div className="flex flex-wrap gap-3">
                {[['×1.0','Verified wearable / API app'],['×0.9','File upload + timestamped proof'],['×0.5','Manual entry (limited)']].map(([m,l]) => (
                  <div key={m} className="flex items-center gap-2">
                    <span className="bg-purple-700/60 text-yellow-400 text-xs font-bold px-2 py-1 rounded-lg">{m}</span>
                    <span className="text-white/70 text-sm">{l}</span>
                  </div>
                ))}
              </div>
            </div>

            <div>
              <h3 className="text-white font-bold mb-1">Effort Validator</h3>
              <p className="text-white/70 text-sm">Dynamic multiplier that checks intensity, physics consistency, and duration (see §3).</p>
            </div>
          </div>
        </div>

        {/* 3. Effort Validator */}
        <div className="mb-10">
          <h2 className="text-2xl font-bold text-yellow-400 mb-5">3. Effort Validator – Quality-over-Quantity Guardrails</h2>

          {/* 3.1 */}
          <h3 className="text-lg font-bold text-white mb-3">3.1 Intensity Multiplier (Heart-Rate First)</h3>
          <div className="rounded-2xl border border-purple-400/20 overflow-hidden mb-6">
            <div className="grid grid-cols-3 bg-purple-900/60 px-4 py-2 text-xs font-bold text-white/50 uppercase tracking-wide">
              <span>Data Quality</span><span>Criteria</span><span className="text-right">Multiplier</span>
            </div>
            <div className="divide-y divide-purple-400/10">
              {INTENSITY_TABLE.map(row => (
                <div key={row.quality} className="grid grid-cols-3 px-4 py-3 text-sm items-center">
                  <span className={`font-bold ${row.color}`}>{row.quality}</span>
                  <span className="text-white/70">{row.criteria}</span>
                  <span className="text-white font-bold text-right">{row.multiplier}</span>
                </div>
              ))}
            </div>
          </div>
          <p className="text-white/40 text-xs mb-6 italic">*Age-adjusted zones or sport-specific power bands.</p>

          {/* 3.2 */}
          <h3 className="text-lg font-bold text-white mb-2">3.2 Distance-Calorie Balance (DCB)</h3>
          <p className="text-white/70 text-sm mb-6">
            Calories per distance are compared to sport-, weight-, and sex-adjusted reference curves.
            Inside band → <code className="text-yellow-400">1.00×</code> · 1st band out → <code className="text-yellow-400">0.75×</code> · 2nd band (implausible) → <code className="text-yellow-400">0.25×</code>
          </p>

          {/* 3.3 */}
          <h3 className="text-lg font-bold text-white mb-2">3.3 Ultra-Duration Damping</h3>
          <p className="text-white/70 text-sm mb-6">
            For continuous sessions &gt; 240 min and Intensity ≤ 0.45:{' '}
            <code className="text-yellow-400">Multiplier = 1 – 0.005 × (minutes – 240)</code> (capped at –40%).
          </p>

          {/* 3.4 */}
          <h3 className="text-lg font-bold text-white mb-2">3.4 Manual-Entry Gate</h3>
          <p className="text-white/70 text-sm">
            After 300 AP/week from manual logs: multiplier drops to <code className="text-yellow-400">0.40×</code> and selfie/CAPTCHA proof is required.
          </p>
        </div>

        {/* 4. Anti-Cheat */}
        <div className="mb-10">
          <h2 className="text-2xl font-bold text-yellow-400 mb-5">4. AI-Powered Anti-Cheat Stack</h2>
          <div className="space-y-4 mb-4">
            {ANTI_CHEAT.map(({ icon: Icon, title, body }) => (
              <div key={title} className="flex gap-4">
                <Icon className="w-5 h-5 text-yellow-400 flex-shrink-0 mt-0.5" />
                <p className="text-white/80 text-sm leading-relaxed">
                  <span className="font-bold text-white">{title}:</span> {body}
                </p>
              </div>
            ))}
          </div>
          <p className="text-white/50 text-xs italic">Flagged logs are held for review; no points post until cleared.</p>
        </div>

        {/* 5. Leaderboard Logic */}
        <div className="mb-10">
          <h2 className="text-2xl font-bold text-yellow-400 mb-4">5. Leaderboard Logic</h2>
          <ul className="space-y-2 mb-3">
            <li className="text-white/80 text-sm"><span className="font-bold text-white">Zip Code:</span> Based on your profile&apos;s location.</li>
            <li className="text-white/80 text-sm"><span className="font-bold text-white">Sport:</span> Ranked in your most-logged sport.</li>
            <li className="text-white/80 text-sm"><span className="font-bold text-white">Age:</span> 18–35 • 36–50 • 51+ (Under-18 accounts are private and point-ineligible).</li>
          </ul>
          <p className="text-white/50 text-xs italic">Leaderboards refresh hourly; users who travel or age-up are auto-re-bucketed.</p>
        </div>

        {/* 6. Appeals */}
        <div className="mb-10">
          <h2 className="text-2xl font-bold text-yellow-400 mb-4">6. Appeals &amp; Enforcement</h2>
          <ul className="space-y-2">
            <li className="flex gap-2 text-white/80 text-sm"><span className="text-white/40">•</span>&ldquo;Under Review&rdquo; logs appear in your feed with a submit-evidence link.</li>
            <li className="flex gap-2 text-white/80 text-sm"><span className="text-white/40">•</span>Provide additional proof within 72 h or the log is voided.</li>
            <li className="flex gap-2 text-white/80 text-sm"><span className="text-white/40">•</span>Three confirmed violations in 90 days trigger account suspension.</li>
            <li className="flex gap-2 text-white/80 text-sm">
              <span className="text-white/40">•</span>
              To appeal a decision, email{' '}
              <a href="mailto:fairplay@sandlotz.com" className="text-yellow-400 hover:underline font-semibold">fairplay@sandlotz.com</a>
              {' '}with your activity ID.
            </li>
          </ul>
        </div>

        {/* 7. Version Control */}
        <div className="mb-12">
          <h2 className="text-2xl font-bold text-yellow-400 mb-3">7. Version Control</h2>
          <p className="text-white/70 text-sm leading-relaxed mb-4">
            This policy supersedes all prior scoring rules. Sandlotz may tweak multipliers or thresholds as new data and cheating
            vectors emerge; material changes are announced seven days in advance.
          </p>
          <div className="flex items-center gap-2 text-sm">
            <Mail className="w-4 h-4 text-white/50" />
            <span className="text-white/50">Questions? Email us at </span>
            <a href="mailto:fairplay@sandlotz.com" className="text-yellow-400 hover:underline font-semibold">fairplay@sandlotz.com</a>
          </div>
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
