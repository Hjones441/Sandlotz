import Link from 'next/link'
import {
  Trophy, Zap, Gift, Users, TrendingUp, Star, HeartPulse,
  Mountain, Flame, CheckCircle2, ShieldCheck, BarChart2,
  Smartphone, Globe, Building2, ArrowRight,
} from 'lucide-react'

// ─── Data ─────────────────────────────────────────────────────────────────────

const STATS = [
  { value: '12+',   label: 'Fitness Apps Connected' },
  { value: '500+',  label: 'Daily Point Cap (anti-cheat)' },
  { value: '1.5×',  label: 'Swimming Multiplier' },
]

const HOW_IT_WORKS = [
  {
    step: '01',
    title: 'Log Your Workout',
    desc: 'Connect Strava, Garmin, Whoop, Apple Health — or log manually. Every minute of every sport counts toward your Sandlotz Score™.',
    emoji: '📲',
  },
  {
    step: '02',
    title: 'Earn PlayerPoints',
    desc: 'Our proprietary scoring engine weights duration, intensity, sport, heart-rate zone, elevation, and verified data source. You earn in real time.',
    emoji: '⚡',
  },
  {
    step: '03',
    title: 'Redeem Real Rewards',
    desc: 'Spend PlayerPoints on brand-sponsored perks: gear discounts, event tickets, coaching sessions, and exclusive challenges. Athletes get paid for showing up.',
    emoji: '🎁',
  },
]

const FEATURES = [
  { icon: <Trophy className="w-5 h-5" />,     title: 'Sandlotz Score™',    desc: 'A universal, tamper-resistant athlete ranking calculated across 12 sport types with verified source weighting.' },
  { icon: <Users className="w-5 h-5" />,      title: 'City Leaderboards',  desc: 'Local competition tied to real places. Filter by sport or see who rules your city overall.' },
  { icon: <Star className="w-5 h-5" />,       title: 'Brand Challenges',   desc: 'Sponsored weekly and monthly fitness challenges with reward pools. Brands pay to play, athletes benefit.' },
  { icon: <Gift className="w-5 h-5" />,       title: 'Perks Marketplace',  desc: 'A live redemption store backed by brand inventory. Atomic transactions ensure fairness — no overselling.' },
  { icon: <ShoppingBag className="w-5 h-5" />,title: 'Gear Marketplace',   desc: 'Peer-to-peer listing board for sports gear, apparel, and coaching services. No fees during launch.' },
  { icon: <Smartphone className="w-5 h-5" />, title: 'PWA — No App Store', desc: 'Installs directly from the browser on iOS and Android. Zero friction onboarding, no app store tax.' },
  { icon: <BarChart2 className="w-5 h-5" />,  title: 'AI Coach',           desc: 'GPT-powered training insights surfaced from your activity history. Personalized, not generic.' },
  { icon: <ShieldCheck className="w-5 h-5" />, title: 'Anti-Cheat Engine',  desc: 'Daily point caps, anomaly detection, source verification tiers. Score integrity is non-negotiable.' },
]

const SCORE_FACTORS = [
  { icon: <Zap className="w-5 h-5" />,        label: 'Duration × Intensity', desc: 'Every minute at Max Effort earns 1.5× more than Easy.',      color: 'text-yellow-400' },
  { icon: <TrendingUp className="w-5 h-5" />, label: 'Sport Multiplier',     desc: 'Swimming ×1.5 · HIIT ×1.3 · Running ×1.2 · Cycling ×0.8',  color: 'text-blue-400'   },
  { icon: <HeartPulse className="w-5 h-5" />, label: 'HR Zone Bonus',        desc: 'Zone 5 (170+ bpm) gives a ×1.30 multiplier on base score.', color: 'text-red-400'    },
  { icon: <CheckCircle2 className="w-5 h-5" />, label: 'Verified Source +5%', desc: 'Connect any fitness API for an automatic 5% bonus.',        color: 'text-green-400'  },
  { icon: <Mountain className="w-5 h-5" />,   label: '+1pt per 100m elev.',  desc: 'Elevation gain counts. Hill runners and hikers are rewarded.',color: 'text-purple-400' },
  { icon: <Flame className="w-5 h-5" />,      label: '+1pt per 50 kcal',     desc: 'Caloric burn adds bonus points. Manual entries capped at 1k.', color: 'text-orange-400' },
]

const TIERS = [
  { label: 'Rookie',  min: '0',    color: 'text-gray-400',   bar: 'bg-gray-500'   },
  { label: 'Athlete', min: '500',  color: 'text-green-400',  bar: 'bg-green-500'  },
  { label: 'Pro',     min: '2K',   color: 'text-blue-400',   bar: 'bg-blue-500'   },
  { label: 'Elite',   min: '5K',   color: 'text-purple-300', bar: 'bg-purple-500' },
  { label: 'Legend',  min: '10K+', color: 'text-yellow-400', bar: 'bg-yellow-400' },
]

const FOR_BRANDS = [
  { icon: <Globe className="w-5 h-5" />,     title: 'Captive Athlete Audience', desc: 'Every perk redemption is a verified athlete engaging with your brand. No bots, no passive impressions.' },
  { icon: <BarChart2 className="w-5 h-5" />, title: 'Performance-Linked',       desc: 'Sponsorships tied to real fitness milestones. Your brand funds results, not just reach.' },
  { icon: <Building2 className="w-5 h-5" />, title: 'Founding Partner Terms',   desc: 'First 10 partners get guaranteed placement plus co-marketing. Email us to discuss founding rates.' },
]

// ─────────────────────────────────────────────────────────────────────────────

// This import is only used for the icon in the FEATURES array above
import { ShoppingBag } from 'lucide-react'

export default function HomePage() {
  return (
    <div className="flex flex-col min-h-screen">

      {/* ── Hero ──────────────────────────────────────────────────────────────── */}
      <section className="relative overflow-hidden px-4 pt-24 pb-24 text-center"
        style={{ background: 'linear-gradient(160deg, #0e0825 0%, #1e1040 45%, #2D1B69 100%)' }}>

        <div className="pointer-events-none absolute inset-0">
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2
                          w-[700px] h-[700px] rounded-full
                          bg-brand-purple opacity-25 blur-[140px]" />
        </div>

        <div className="relative">
          <span className="inline-flex items-center gap-2 bg-brand-yellow/10 border border-brand-yellow/20 rounded-full px-4 py-1.5 mb-6">
            <span className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
            <span className="text-brand-yellow text-xs font-bold tracking-widest uppercase">Live Beta · Columbus, OH</span>
          </span>

          <h1 className="text-6xl sm:text-8xl font-black tracking-tight leading-none mb-6">
            <span className="text-gold">SANDLOTZ</span>
          </h1>

          <p className="mx-auto mb-4 max-w-2xl text-xl sm:text-2xl text-white/80 font-medium leading-relaxed">
            The performance marketplace where your workout earns real rewards.
          </p>
          <p className="mx-auto mb-10 max-w-xl text-base text-white/50 leading-relaxed">
            Log any sport. Verify with Strava, Garmin, or Whoop. Climb city leaderboards.
            Spend PlayerPoints on brand perks, gear, and sponsored challenges.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-16">
            <a href="https://app.sandlotz.com/signup"
              className="btn-primary text-center text-lg px-8 py-4 flex items-center justify-center gap-2">
              Start Competing — It&apos;s Free <ArrowRight className="w-5 h-5" />
            </a>
            <a href="mailto:partnerships@sandlotz.com"
              className="btn-ghost text-center text-lg px-8 py-4">
              Partner With Us
            </a>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-3 gap-6 max-w-md mx-auto">
            {STATS.map(s => (
              <div key={s.label} className="text-center">
                <p className="text-3xl font-black text-brand-yellow">{s.value}</p>
                <p className="text-xs text-white/40 mt-1 leading-tight">{s.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── How It Works ──────────────────────────────────────────────────────── */}
      <section className="px-4 py-24 bg-[#0e0825]">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-black mb-3">How It Works</h2>
            <p className="text-white/50 text-lg">From your first workout to your first perk, in three steps.</p>
          </div>
          <div className="grid md:grid-cols-3 gap-6">
            {HOW_IT_WORKS.map(item => (
              <div key={item.step} className="sz-card p-8 relative overflow-hidden">
                <div className="absolute top-4 right-4 text-white/5 text-7xl font-black leading-none select-none">
                  {item.step}
                </div>
                <div className="text-4xl mb-4">{item.emoji}</div>
                <h3 className="text-xl font-black mb-3 text-white">{item.title}</h3>
                <p className="text-white/60 text-sm leading-relaxed">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Sandlotz Score™ ───────────────────────────────────────────────────── */}
      <section className="px-4 py-24" style={{ background: 'linear-gradient(180deg, #150d35 0%, #1e1040 100%)' }}>
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-16">
            <div className="inline-flex items-center gap-2 bg-brand-yellow/10 border border-brand-yellow/20 rounded-full px-4 py-1.5 mb-4">
              <Trophy className="w-4 h-4 text-brand-yellow" />
              <span className="text-brand-yellow text-sm font-bold">Proprietary Algorithm</span>
            </div>
            <h2 className="text-4xl font-black mb-3">Sandlotz Score™</h2>
            <p className="text-white/50 max-w-xl mx-auto text-lg">
              A tamper-resistant universal ranking that rewards consistency, intensity, and verified data.
              Not just steps. Not just distance. Your whole athletic self.
            </p>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-10">
            {SCORE_FACTORS.map(f => (
              <div key={f.label} className="sz-card p-5">
                <div className={`${f.color} mb-3`}>{f.icon}</div>
                <p className="font-black text-sm mb-1 text-white">{f.label}</p>
                <p className="text-white/50 text-xs leading-relaxed">{f.desc}</p>
              </div>
            ))}
          </div>

          {/* Tier progression */}
          <div className="sz-card p-6">
            <p className="text-white/40 text-xs uppercase tracking-widest font-bold mb-4">Rank Tiers</p>
            <div className="flex items-end gap-3 flex-wrap">
              {TIERS.map((t, i) => (
                <div key={t.label} className="flex flex-col items-center gap-2 flex-1 min-w-[60px]">
                  <span className={`text-xs font-black ${t.color}`}>{t.label}</span>
                  <div className={`w-full rounded-full ${t.bar}`} style={{ height: `${12 + i * 10}px` }} />
                  <span className="text-white/30 text-[10px]">{t.min} pts</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ── Platform Features ─────────────────────────────────────────────────── */}
      <section className="px-4 py-24 bg-[#0e0825]">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-black mb-3">Built for Competitors</h2>
            <p className="text-white/50 text-lg">Every feature is intentional. Nothing bloated.</p>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {FEATURES.map(f => (
              <div key={f.title} className="sz-card p-5">
                <div className="flex items-center gap-2 mb-3">
                  <div className="text-brand-yellow">{f.icon}</div>
                  <h3 className="font-bold text-sm text-white">{f.title}</h3>
                </div>
                <p className="text-white/50 text-xs leading-relaxed">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── For Brands ───────────────────────────────────────────────────────── */}
      <section className="px-4 py-24" style={{ background: 'linear-gradient(180deg, #150d35 0%, #1e1040 100%)' }}>
        <div className="max-w-5xl mx-auto">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div>
              <span className="inline-block text-xs font-bold text-brand-yellow uppercase tracking-widest mb-4 bg-brand-yellow/10 border border-brand-yellow/20 rounded-full px-3 py-1">
                Brand Partnerships
              </span>
              <h2 className="text-4xl font-black mb-4 leading-tight">
                Reach Athletes Who <span className="text-gold">Actually Train</span>
              </h2>
              <p className="text-white/60 text-lg mb-6 leading-relaxed">
                Every user on Sandlotz has proven they work out — their score is the receipt.
                Your brand gets placement in front of a self-selected, performance-focused audience.
                No influencer markups. No passive impressions.
              </p>
              <a href="mailto:partnerships@sandlotz.com"
                className="btn-primary inline-flex items-center gap-2 text-base px-6 py-3">
                Become a Founding Partner <ArrowRight className="w-4 h-4" />
              </a>
            </div>
            <div className="space-y-4">
              {FOR_BRANDS.map(b => (
                <div key={b.title} className="sz-card p-5 flex items-start gap-4">
                  <div className="text-brand-yellow shrink-0 mt-0.5">{b.icon}</div>
                  <div>
                    <h3 className="font-bold text-white mb-1">{b.title}</h3>
                    <p className="text-white/50 text-sm leading-relaxed">{b.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ── Traction / Social Proof ──────────────────────────────────────────── */}
      <section className="px-4 py-20 bg-[#0e0825]">
        <div className="max-w-4xl mx-auto">
          <div className="grid sm:grid-cols-3 gap-6 text-center">
            {[
              { value: 'Columbus, OH', sub: 'Headquarters & launch city', emoji: '📍' },
              { value: '12+ Apps',     sub: 'Fitness platform integrations', emoji: '🔗' },
              { value: 'PWA First',    sub: 'Installable from browser — no app store', emoji: '📱' },
            ].map(s => (
              <div key={s.value} className="sz-card p-6">
                <div className="text-3xl mb-2">{s.emoji}</div>
                <p className="text-xl font-black text-white mb-1">{s.value}</p>
                <p className="text-white/40 text-sm">{s.sub}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA ───────────────────────────────────────────────────────────────── */}
      <section className="px-4 py-24 text-center" style={{ background: 'linear-gradient(160deg, #1e1040 0%, #2D1B69 100%)' }}>
        <div className="max-w-2xl mx-auto">
          <div className="text-5xl mb-6">🏆</div>
          <h2 className="text-4xl sm:text-5xl font-black mb-4 leading-tight">
            Ready to<br /><span className="text-gold">Dominate?</span>
          </h2>
          <p className="text-white/60 text-lg mb-10 leading-relaxed">
            Join athletes in Columbus and beyond. Free forever for competitors.
            Premium features unlock as your score climbs.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <a href="https://app.sandlotz.com/signup"
              className="btn-primary text-center text-lg px-10 py-4 flex items-center justify-center gap-2">
              Create Free Account <ArrowRight className="w-5 h-5" />
            </a>
            <a href="https://app.sandlotz.com/login"
              className="btn-ghost text-center text-lg px-10 py-4">
              Sign In
            </a>
          </div>
          <p className="text-white/30 text-sm mt-6">
            Questions?{' '}
            <a href="mailto:hello@sandlotz.com" className="text-brand-yellow/70 hover:text-brand-yellow underline transition-colors">
              hello@sandlotz.com
            </a>
          </p>
        </div>
      </section>

    </div>
  )
}
