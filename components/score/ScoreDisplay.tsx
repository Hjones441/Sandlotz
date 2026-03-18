'use client'

import { formatScore, getRankTier } from '@/lib/sandlotzScore'
import { Trophy } from 'lucide-react'

interface Props {
  score: number
  rank?: number
  large?: boolean
}

export default function ScoreDisplay({ score, rank, large = false }: Props) {
  const tier = getRankTier(score)

  return (
    <div className={`sz-card flex flex-col items-center justify-center text-center
      ${large ? 'p-10' : 'p-6'}`}>
      <div className="flex items-center gap-2 mb-2">
        <Trophy className={`${large ? 'w-7 h-7' : 'w-5 h-5'} text-brand-yellow`} />
        <span className="text-white/50 text-sm font-semibold tracking-widest uppercase">
          Sandlotz Score™
        </span>
      </div>

      <p className={`font-black text-gold leading-none
        ${large ? 'text-7xl' : 'text-5xl'}`}>
        {formatScore(score)}
      </p>

      <p className={`mt-2 font-bold ${tier.color} ${large ? 'text-lg' : 'text-sm'}`}>
        {tier.label}
      </p>

      {rank !== undefined && (
        <p className="mt-1 text-xs text-white/40">
          Rank #{rank.toLocaleString()}
        </p>
      )}
    </div>
  )
}
