'use client'

import { useState } from 'react'
import { useRouter, usePathname, useSearchParams } from 'next/navigation'
import { OpportunityCard } from './OpportunityCard'
import { Badge } from '@/components/ui/badge'
import { PAIN_TYPE_LABELS, type PainType } from '@/types'

interface Opportunity {
  id: string
  redditPostTitle: string
  redditPostUrl: string
  redditPostBody: string | null
  redditAuthor: string
  redditScore: number
  redditPostedAt: string
  intentScore: number
  painType: PainType
  shouldPitch: boolean
  scoringReasoning: string | null
  matchedKeywords: string[]
  status: string
  subreddit: { name: string }
  replies: Array<{
    id: string
    text: string
    toneUsed: string | null
    whyThisWorks: string | null
    version: number
  }>
  product: { id: string; name: string }
}

interface PainTypeCount {
  painType: PainType
  _count: number
}

export function OpportunityQueue({
  opportunities: initial,
  total,
  page,
  pages,
  counts,
  currentPainType,
}: {
  opportunities: Opportunity[]
  total: number
  page: number
  pages: number
  counts: PainTypeCount[]
  currentPainType?: string
}) {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const [opportunities, setOpportunities] = useState(initial)

  function filterByPainType(pt: string | null) {
    const params = new URLSearchParams(searchParams)
    if (pt) params.set('painType', pt)
    else params.delete('painType')
    params.delete('page')
    router.push(`${pathname}?${params}`)
  }

  function handleRemove(id: string) {
    setOpportunities(ops => ops.filter(o => o.id !== id))
  }

  const countMap = Object.fromEntries(counts.map(c => [c.painType, c._count]))

  return (
    <div className="space-y-4">
      {/* Pain type filters */}
      <div className="flex flex-wrap gap-2">
        <button
          onClick={() => filterByPainType(null)}
          className={`px-3 py-1.5 rounded-full text-sm font-medium transition-colors ${
            !currentPainType
              ? 'bg-purple-600 text-white'
              : 'bg-white border border-gray-200 text-gray-600 hover:border-purple-300'
          }`}
        >
          All ({total})
        </button>
        {(Object.entries(PAIN_TYPE_LABELS) as [PainType, string][]).map(([pt, label]) => {
          const count = countMap[pt] || 0
          if (count === 0 && currentPainType !== pt) return null
          return (
            <button
              key={pt}
              onClick={() => filterByPainType(pt)}
              className={`px-3 py-1.5 rounded-full text-sm font-medium transition-colors ${
                currentPainType === pt
                  ? 'bg-purple-600 text-white'
                  : 'bg-white border border-gray-200 text-gray-600 hover:border-purple-300'
              }`}
            >
              {label} ({count})
            </button>
          )
        })}
      </div>

      {/* Queue */}
      {opportunities.length === 0 ? (
        <div className="bg-white border border-gray-200 rounded-xl py-16 text-center">
          <p className="text-gray-400">No opportunities in this filter. Check back soon.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {opportunities.map(opp => (
            <OpportunityCard
              key={opp.id}
              opportunity={opp}
              onRemove={handleRemove}
            />
          ))}
        </div>
      )}

      {/* Pagination */}
      {pages > 1 && (
        <div className="flex justify-center gap-2 pt-4">
          {Array.from({ length: pages }, (_, i) => i + 1).map(p => {
            const params = new URLSearchParams(searchParams)
            params.set('page', String(p))
            return (
              <button
                key={p}
                onClick={() => router.push(`${pathname}?${params}`)}
                className={`w-9 h-9 rounded-lg text-sm font-medium ${
                  p === page
                    ? 'bg-purple-600 text-white'
                    : 'bg-white border border-gray-200 text-gray-600 hover:border-purple-300'
                }`}
              >
                {p}
              </button>
            )
          })}
        </div>
      )}
    </div>
  )
}
