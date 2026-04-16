'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import { useAuth } from '@/context/AuthContext'
import { createMarketplaceListing } from '@/lib/firestore'
import type { ListingCondition, ListingCategory } from '@/lib/firestore'
import AppHeader from '@/components/layout/AppHeader'
import { SPORT_OPTIONS } from '@/lib/sandlotzScore'
import { PlusCircle, Loader2, ArrowLeft, CheckCircle2 } from 'lucide-react'

const CONDITIONS: ListingCondition[] = ['New', 'Like New', 'Good', 'Fair']
const CATEGORIES: ListingCategory[]  = ['Equipment', 'Apparel', 'Footwear', 'Accessories', 'Other']

export default function NewListingPage() {
  const { user, profile } = useAuth()
  const router = useRouter()

  const [title,       setTitle]       = useState('')
  const [description, setDescription] = useState('')
  const [price,       setPrice]       = useState('')
  const [sport,       setSport]       = useState('other')
  const [category,    setCategory]    = useState<ListingCategory>('Equipment')
  const [condition,   setCondition]   = useState<ListingCondition>('Good')
  const [submitting,  setSubmitting]  = useState(false)
  const [error,       setError]       = useState('')
  const [done,        setDone]        = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!user || !profile) return
    if (!title.trim())       { setError('Please add a title.'); return }
    if (!description.trim()) { setError('Please add a description.'); return }

    setError('')
    setSubmitting(true)
    try {
      await createMarketplaceListing({
        uid:          user.uid,
        displayName:  profile.displayName,
        photoURL:     profile.photoURL ?? null,
        title:        title.trim(),
        description:  description.trim(),
        price:        price ? Number(price) : 0,
        sport,
        category,
        condition,
        contactEmail: profile.email,
      })
      setDone(true)
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Failed to post listing.')
    } finally {
      setSubmitting(false)
    }
  }

  if (done) {
    return (
      <div className="min-h-screen flex items-center justify-center px-4">
        <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}
          className="sz-card p-8 max-w-sm w-full text-center">
          <CheckCircle2 className="w-12 h-12 text-green-400 mx-auto mb-3" />
          <h2 className="text-xl font-black text-white mb-1">Listing Posted!</h2>
          <p className="text-white/50 text-sm mb-5">Your item is now live on the marketplace.</p>
          <div className="flex flex-col gap-3">
            <button onClick={() => router.push('/marketplace')} className="btn-primary">View Marketplace</button>
            <button onClick={() => { setDone(false); setTitle(''); setDescription(''); setPrice('') }} className="btn-ghost">Post Another</button>
          </div>
        </motion.div>
      </div>
    )
  }

  return (
    <div className="max-w-xl mx-auto pb-4">
      <div className="sticky top-0 z-20 bg-[#0e0825]/95 backdrop-blur-xl border-b border-white/[0.05]">
        <AppHeader title="Post Listing" subtitle="List gear for the Sandlotz community"
          left={
            <button onClick={() => router.back()} className="text-white/50 hover:text-white transition-colors">
              <ArrowLeft className="w-5 h-5" />
            </button>
          }
        />
      </div>
      <div className="px-4 pt-4 pb-24">
        <form onSubmit={handleSubmit} className="space-y-5">

          {/* Title */}
          <div>
            <label className="block text-sm font-semibold text-white/60 mb-2">Title *</label>
            <input type="text" value={title} onChange={e => setTitle(e.target.value)}
              placeholder="Nike Air Zoom Pegasus 40 — Size 10"
              maxLength={80}
              className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder:text-white/30 focus:outline-none focus:border-brand-yellow transition-colors" />
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm font-semibold text-white/60 mb-2">Description *</label>
            <textarea rows={3} value={description} onChange={e => setDescription(e.target.value)}
              placeholder="Barely worn, great condition. Perfect for training runs…"
              maxLength={500}
              className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder:text-white/30 focus:outline-none focus:border-brand-yellow transition-colors resize-none" />
          </div>

          {/* Price */}
          <div>
            <label className="block text-sm font-semibold text-white/60 mb-2">
              Price <span className="text-white/30">(USD, leave blank for free)</span>
            </label>
            <div className="relative">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-white/40 font-bold">$</span>
              <input type="number" min="0" step="1" value={price} onChange={e => setPrice(e.target.value)}
                placeholder="0"
                className="w-full bg-white/5 border border-white/10 rounded-xl pl-8 pr-4 py-3 text-white placeholder:text-white/30 focus:outline-none focus:border-brand-yellow transition-colors" />
            </div>
          </div>

          {/* Sport */}
          <div>
            <label className="block text-sm font-semibold text-white/60 mb-2">Sport</label>
            <div className="grid grid-cols-4 sm:grid-cols-6 gap-2">
              {SPORT_OPTIONS.map(s => (
                <motion.button type="button" key={s.value} whileTap={{ scale: 0.93 }}
                  onClick={() => setSport(s.value)}
                  className={`flex flex-col items-center gap-1 p-2.5 rounded-xl border text-xs font-semibold transition-all ${
                    sport === s.value
                      ? 'bg-brand-yellow text-brand-purple-dark border-brand-yellow'
                      : 'bg-white/5 border-white/10 text-white/60 hover:bg-white/10'
                  }`}>
                  <span className="text-lg">{s.emoji}</span>
                  <span className="text-[10px] leading-tight text-center">{s.label}</span>
                </motion.button>
              ))}
            </div>
          </div>

          {/* Category */}
          <div>
            <label className="block text-sm font-semibold text-white/60 mb-2">Category</label>
            <div className="flex flex-wrap gap-2">
              {CATEGORIES.map(c => (
                <button type="button" key={c} onClick={() => setCategory(c)}
                  className={`px-4 py-2 rounded-xl text-sm font-semibold border transition-all ${
                    category === c
                      ? 'bg-brand-yellow text-brand-purple-dark border-brand-yellow'
                      : 'bg-white/5 border-white/10 text-white/60 hover:bg-white/10'
                  }`}>
                  {c}
                </button>
              ))}
            </div>
          </div>

          {/* Condition */}
          <div>
            <label className="block text-sm font-semibold text-white/60 mb-2">Condition</label>
            <div className="flex gap-2">
              {CONDITIONS.map(c => (
                <button type="button" key={c} onClick={() => setCondition(c)}
                  className={`flex-1 py-2.5 rounded-xl text-sm font-semibold border transition-all ${
                    condition === c
                      ? 'bg-brand-yellow text-brand-purple-dark border-brand-yellow'
                      : 'bg-white/5 border-white/10 text-white/60 hover:bg-white/10'
                  }`}>
                  {c}
                </button>
              ))}
            </div>
          </div>

          {error && (
            <div className="bg-red-500/10 border border-red-500/20 rounded-xl px-4 py-3 text-red-400 text-sm">
              {error}
            </div>
          )}

          <button type="submit" disabled={submitting}
            className="btn-primary w-full py-4 flex items-center justify-center gap-2">
            {submitting
              ? <><Loader2 className="w-5 h-5 animate-spin" /> Posting…</>
              : <><PlusCircle className="w-5 h-5" /> Post Listing</>
            }
          </button>
        </form>
      </div>
    </div>
  )
}
