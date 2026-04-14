'use client'

import { useRouter } from 'next/navigation'
import { ArrowLeft } from 'lucide-react'

interface Props {
  title: string
  subtitle?: string
  back?: boolean
  right?: React.ReactNode
}

export default function AppHeader({ title, subtitle, back = false, right }: Props) {
  const router = useRouter()
  return (
    <div className="flex items-center gap-3 px-4 h-14">
      {back && (
        <button onClick={() => router.back()}
          className="w-8 h-8 rounded-xl bg-white/5 border border-white/[0.07] flex items-center justify-center flex-shrink-0">
          <ArrowLeft className="w-4 h-4 text-white/60" />
        </button>
      )}
      <div className="flex-1 min-w-0">
        <h1 className="font-black text-lg leading-tight text-white truncate">{title}</h1>
        {subtitle && <p className="text-xs text-white/35 truncate">{subtitle}</p>}
      </div>
      {right && <div className="flex-shrink-0">{right}</div>}
    </div>
  )
}
