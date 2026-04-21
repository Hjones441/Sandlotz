import Link from 'next/link'
import { Fingerprint, Cpu, MapPin, AlertTriangle, Mail } from 'lucide-react'

const SPORT_MULTIPLIERS = [
  { sport: 'Swimming',      mult: '×1.5', note: 'Full-body, high-resistance' },
  { sport: 'HIIT',          mult: '×1.3', note: 'Max-effort interval training' },
  { sport: 'Running',       mult: '×1.2', note: 'Impact cardio baseline' },
  { sport: 'Basketball',    mult: '×1.1', note: 'Stop-start sport' },
  { sport: 'Soccer',        mult: '×1.1', note: 'Sustained aerobic' },
  { sport: 'Tennis',        mult: '×1.1', note: 'Lateral & explosive' },
  { sport: 'Weight Lifting',mult: '×1.0', note: 'Baseline resistance' },
  { sport: 'Hiking',        mult: '×0.9', note: 'Lower sustained HR' },
  { sport: 'Cycling',       mult: '×0.8', note: 'Assisted movement' },
  { sport: 'Yoga',          mult: '×0.7', note: 'Flexibility / recovery' },
]

const INTENSITY_TABLE = [
  { level: 'Max Effort', mult: '×1.50', color: 'text-red-400' },
  { level: 'Hard',       mult: '×1.25', color: 'text-orange-400' },
  { level: 'Moderate',   mult: '×1.00', color: 'text-yellow-400' },
  { level: 'Light',      mult: '×0.75', color: 'text-blue-300' },
  { level: 'Easy',       mult: '×0.50', color: 'text-white/60' },
]

const HR_ZONES = [
  { zone: 'Zone 5 — Max', bpm: '≥ 170 bpm', mult: '×1.30', color: 'text-red-400' },
  { zone: 'Zone 4 — Hard', bpm: '≥ 150 bpm', mult: '×1.20', color: 'text-orange-400' },
  { zone: 'Zone 3 — Aerobic', bpm: '≥ 130 bpm', mult: '×1.10', color: 'text-yellow-400' },
  { zone: 'Zone 2 — Easy', bpm: '≥ 110 bpm', mult: '×1.05', color: 'text-blue-300' },
  { zone: 'Zone 1 — Rest', bpm: '< 110 bpm', mult: '×1.00', color: 'text-white/50' },
]

const ANTI_CHEAT = [
  { icon: Fingerprint,   title: 'Device Attestation',      body: 'Blocks emulators & rooted devices (Play Integrity, App Attest).' },
  { icon: Cpu,           title: 'Data Fingerprinting',     body: 'SHA-256 hashes prevent recycled FIT/GPX files.' },
  { icon: MapPin,        title: 'GPS + HR Physics Model',  body: 'Flags impossible speed-HR-grade combos (e.g., 180 bpm at 1 mph).' },
  { icon: Cpu,           title: 'LLM Anomaly Detection',   body: 'A domain-trained model compares each log to millions of sport traces and quarantines outliers.' },
  { icon: AlertTriangle, title: 'Manual-Entry Safeguards', body: 'Progressive CAPTCHA, selfie-video, and AP throttling deter copy-paste farms.' },
]

export default function ScoringVerificationPage() {
  return (
    <main className="min-h-screen pt-24 pb-16">
      <div className="max-w-3xl mx-auto px-6">

        {/* Hero */}
        <div className="rounded-2xl border border-white/10 bg-white/5 p-8 mb-12">
          <h1 className="text-4xl font-black text-white mb-2">The Sandlotz Score™ Formula</h1>
          <p className="text-white/50 text-sm">Commitment to a fair and transparent ecosystem · Last updated April 2026</p>
        </div>

        {/* 1. Introduction */}
        <div className="mb-10">
          <h2 className="text-2xl font-bold text-yellow-400 mb-3">1. Introduction – Trust Is Everything</h2>
          <p className="text-white/80 text-sm leading-relaxed">
            The Sandlotz ecosystem runs on data integrity. Every point earned, rank achieved, and perk redeemed is backed by our
            proprietary Sandlotz Score™ formula — a system that&apos;s easy to understand yet extremely hard to game. This
            document explains that system and the safeguards that protect it.
          </p>
        </div>

        {/* 2. Scoring Formula */}
        <div className="mb-10">
          <h2 className="text-2xl font-bold text-yellow-400 mb-3">2. The Scoring Formula</h2>
          <p className="text-white/70 text-sm mb-5">Points reward quality <em>and</em> duration of effort — not just time spent moving.</p>

          <div className="rounded-xl border border-white/10 bg-white/[0.08] px-6 py-4 mb-2 font-mono text-sm text-white overflow-x-auto">
            Sandlotz Score = (Duration × Intensity × Sport × HR Zone × Source)<br />
            &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;+ Distance Bonus + Elevation Bonus + Calories Bonus
          </div>
          <p className="text-white/30 text-xs mb-8 italic">Daily cap: 500 points. Ultra-duration damping applies beyond 4 hrs.</p>

          {/* Sport Multipliers */}
          <div className="mb-8">
            <h3 className="text-white font-bold mb-3">Sport Multipliers</h3>
            <p className="text-white/60 text-sm mb-4">Different sports challenge your body differently. Higher-effort sports earn more per minute.</p>
            <div className="rounded-2xl border border-white/10 overflow-hidden">
              <div className="grid grid-cols-3 bg-purple-900/60 px-4 py-2 text-xs font-bold text-white/50 uppercase tracking-wide">
                <span>Sport</span><span>Multiplier</span><span>Reason</span>
              </div>
              <div className="divide-y divide-purple-400/10">
                {SPORT_MULTIPLIERS.map(row => (
                  <div key={row.sport} className="grid grid-cols-3 px-4 py-3 text-sm items-center">
                    <span className="text-white font-semibold">{row.sport}</span>
                    <span className="text-yellow-400 font-bold">{row.mult}</span>
                    <span className="text-white/50">{row.note}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Intensity */}
          <div className="mb-8">
            <h3 className="text-white font-bold mb-3">Intensity Level</h3>
            <p className="text-white/60 text-sm mb-4">Self-reported at log time. Max Effort earns 1.5× more than Easy.</p>
            <div className="flex flex-wrap gap-3">
              {INTENSITY_TABLE.map(row => (
                <div key={row.level} className="flex items-center gap-2 bg-white/5 border border-white/10 rounded-xl px-3 py-2">
                  <span className={`font-black text-sm ${row.color}`}>{row.mult}</span>
                  <span className="text-white/70 text-sm">{row.level}</span>
                </div>
              ))}
            </div>
          </div>

          {/* HR Zone */}
          <div className="mb-8">
            <h3 className="text-white font-bold mb-3">Heart-Rate Zone Bonus</h3>
            <p className="text-white/60 text-sm mb-4">Verified HR data from a connected wearable unlocks zone bonuses. Zone 5 gives a ×1.30 multiplier.</p>
            <div className="rounded-2xl border border-white/10 overflow-hidden">
              <div className="grid grid-cols-3 bg-purple-900/60 px-4 py-2 text-xs font-bold text-white/50 uppercase tracking-wide">
                <span>Zone</span><span>Threshold</span><span className="text-right">Multiplier</span>
              </div>
              <div className="divide-y divide-purple-400/10">
                {HR_ZONES.map(row => (
                  <div key={row.zone} className="grid grid-cols-3 px-4 py-3 text-sm items-center">
                    <span className={`font-bold ${row.color}`}>{row.zone}</span>
                    <span className="text-white/70">{row.bpm}</span>
                    <span className="text-white font-bold text-right">{row.mult}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Source */}
          <div className="mb-8">
            <h3 className="text-white font-bold mb-3">Source Bonus</h3>
            <p className="text-white/60 text-sm mb-4">Connecting a verified fitness app earns a +5% source bonus.</p>
            <div className="flex flex-wrap gap-3">
              {[['×1.05', 'Verified app (Strava, Garmin, Apple Health, Whoop)'], ['×1.00', 'Manual entry']].map(([m, l]) => (
                <div key={m} className="flex items-center gap-2 bg-white/5 border border-white/10 rounded-xl px-3 py-2">
                  <span className="bg-purple-700/60 text-yellow-400 text-xs font-bold px-2 py-1 rounded-lg">{m}</span>
                  <span className="text-white/70 text-sm">{l}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Bonus Points */}
          <div className="mb-4">
            <h3 className="text-white font-bold mb-3">Bonus Points</h3>
            <div className="space-y-2">
              <div className="flex items-center gap-3 text-sm">
                <span className="text-yellow-400 font-bold w-32">+1 pt / 100m</span>
                <span className="text-white/70">Elevation gain (verified data only)</span>
              </div>
              <div className="flex items-center gap-3 text-sm">
                <span className="text-yellow-400 font-bold w-32">+1 pt / 50 kcal</span>
                <span className="text-white/70">Calories burned (manual entries capped at 1,000 kcal)</span>
              </div>
              <div className="flex items-center gap-3 text-sm">
                <span className="text-yellow-400 font-bold w-32">+2 pts / km</span>
                <span className="text-white/70">Distance covered (× sport multiplier)</span>
              </div>
            </div>
          </div>
        </div>

        {/* 3. Guardrails */}
        <div className="mb-10">
          <h2 className="text-2xl font-bold text-yellow-400 mb-5">3. Quality Guardrails</h2>

          <h3 className="text-lg font-bold text-white mb-2">3.1 Daily Point Cap</h3>
          <p className="text-white/70 text-sm mb-6">
            Maximum <code className="text-yellow-400">500 points</code> per calendar day. Activities after the cap still get logged for your history — just no additional score.
          </p>

          <h3 className="text-lg font-bold text-white mb-2">3.2 Ultra-Duration Damping</h3>
          <p className="text-white/70 text-sm mb-6">
            Sessions longer than 4 hours receive a <code className="text-yellow-400">×0.85</code> damper to prevent passive accumulation (e.g., leaving a tracker running overnight).
          </p>

          <h3 className="text-lg font-bold text-white mb-2">3.3 Manual-Entry Gate</h3>
          <p className="text-white/70 text-sm">
            After <code className="text-yellow-400">300 points/week</code> earned from manual entries, a selfie/CAPTCHA proof step is required before additional manual points are credited.
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
            <li className="text-white/80 text-sm"><span className="font-bold text-white">Location:</span> Ranked by your ZIP code and city.</li>
            <li className="text-white/80 text-sm"><span className="font-bold text-white">Sport:</span> Ranked in your most-logged sport.</li>
            <li className="text-white/80 text-sm"><span className="font-bold text-white">Age:</span> 18–35 · 36–50 · 51+ (Under-18 accounts are private and point-ineligible).</li>
          </ul>
          <p className="text-white/50 text-xs italic">Leaderboards refresh hourly. Users who travel or age-up are auto-re-bucketed.</p>
        </div>

        {/* 6. Appeals */}
        <div className="mb-10">
          <h2 className="text-2xl font-bold text-yellow-400 mb-4">6. Appeals &amp; Enforcement</h2>
          <ul className="space-y-2">
            <li className="flex gap-2 text-white/80 text-sm"><span className="text-white/40">•</span>&ldquo;Under Review&rdquo; logs appear in your feed with a submit-evidence link.</li>
            <li className="flex gap-2 text-white/80 text-sm"><span className="text-white/40">•</span>Provide additional proof within 72 hours or the log is voided.</li>
            <li className="flex gap-2 text-white/80 text-sm"><span className="text-white/40">•</span>Three confirmed violations in 90 days trigger account suspension.</li>
            <li className="flex gap-2 text-white/80 text-sm">
              <span className="text-white/40">•</span>
              To appeal, email{' '}
              <a href="mailto:fairplay@sandlotz.com" className="text-yellow-400 hover:underline font-semibold">fairplay@sandlotz.com</a>
              {' '}with your activity ID.
            </li>
          </ul>
        </div>

        {/* 7. Version Control */}
        <div className="mb-12">
          <h2 className="text-2xl font-bold text-yellow-400 mb-3">7. Version Control</h2>
          <p className="text-white/70 text-sm leading-relaxed mb-4">
            This policy supersedes all prior scoring rules. Sandlotz may tweak multipliers or thresholds as new data emerges;
            material changes are announced seven days in advance.
          </p>
          <div className="flex items-center gap-2 text-sm">
            <Mail className="w-4 h-4 text-white/50" />
            <span className="text-white/50">Questions? </span>
            <a href="mailto:fairplay@sandlotz.com" className="text-yellow-400 hover:underline font-semibold">fairplay@sandlotz.com</a>
          </div>
        </div>

        <div className="rounded-2xl border border-white/10 bg-white/10 px-8 py-12 text-center">
          <h2 className="text-3xl font-black text-white mb-4">Start Earning Your Score</h2>
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
