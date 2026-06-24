'use client'

import { useState } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
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

const PAIN_COLORS: Record<PainType, 'purple' | 'red' | 'blue' | 'orange' | 'yellow'> = {
  switching_intent: 'red',
  competitor_frustration: 'orange',
  active_tool_search: 'blue',
  roi_frustration: 'yellow',
  workflow_pain: 'purple',
}

export function OpportunityCard({
  opportunity: initial,
  onRemove,
}: {
  opportunity: Opportunity
  onRemove: (id: string) => void
}) {
  const [opp, setOpp] = useState(initial)
  const [replyText, setReplyText] = useState(initial.replies[0]?.text || '')
  const [expanded, setExpanded] = useState(false)
  const [loading, setLoading] = useState<'approve' | 'skip' | 'regen' | null>(null)

  const intentColor =
    opp.intentScore >= 80 ? 'text-green-600' :
    opp.intentScore >= 60 ? 'text-yellow-600' : 'text-gray-500'

  async function approve() {
    setLoading('approve')
    const res = await fetch(`/api/opportunities/${opp.id}/approve`, { method: 'POST' })
    if (res.ok) onRemove(opp.id)
    setLoading(null)
  }

  async function skip() {
    setLoading('skip')
    const res = await fetch(`/api/opportunities/${opp.id}/skip`, { method: 'POST' })
    if (res.ok) onRemove(opp.id)
    setLoading(null)
  }

  async function regenerate() {
    setLoading('regen')
    const res = await fetch(`/api/opportunities/${opp.id}/regenerate`, { method: 'POST' })
    if (res.ok) {
      const { data } = await res.json()
      setReplyText(data.text)
      setOpp(o => ({
        ...o,
        replies: [{ id: data.id, text: data.text, toneUsed: data.toneUsed, whyThisWorks: data.whyThisWorks, version: data.version }],
      }))
    }
    setLoading(null)
  }

  const reply = opp.replies[0]
  const postedAt = new Date(opp.redditPostedAt)
  const hoursAgo = Math.floor((Date.now() - postedAt.getTime()) / (1000 * 60 * 60))

  return (
    <Card className="overflow-hidden">
      <CardContent className="pt-5 pb-4">
        {/* Header row */}
        <div className="flex items-start gap-3">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap mb-1">
              {opp.status === 'NO_PITCH' ? (
                <Badge variant="yellow">Karma / Engagement</Badge>
              ) : (
                <Badge variant={PAIN_COLORS[opp.painType]}>
                  {opp.painType === 'switching_intent' && '🔥 '}
                  {PAIN_TYPE_LABELS[opp.painType]}
                </Badge>
              )}
              <span className={`text-sm font-semibold ${intentColor}`}>
                {opp.intentScore}% intent
              </span>
              {opp.matchedKeywords?.map(kw => (
                <Badge key={kw} variant="purple" className="text-xs">
                  {kw}
                </Badge>
              ))}
            </div>
            <a
              href={opp.redditPostUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="font-medium text-gray-900 hover:text-purple-700 line-clamp-2"
            >
              {opp.redditPostTitle}
            </a>
            <p className="text-xs text-gray-400 mt-1">
              r/{opp.subreddit.name} · u/{opp.redditAuthor} · {hoursAgo}h ago · {opp.redditScore} pts
            </p>
          </div>
          <button
            className="text-xs text-gray-400 hover:text-gray-600 shrink-0 pt-1"
            onClick={() => setExpanded(e => !e)}
          >
            {expanded ? 'Collapse' : 'Expand'}
          </button>
        </div>

        {/* Expanded thread body */}
        {expanded && opp.redditPostBody && (
          <div className="mt-3 text-sm text-gray-600 bg-gray-50 rounded-lg p-3 line-clamp-4">
            {opp.redditPostBody}
          </div>
        )}

        {opp.scoringReasoning && (
          <p className="text-xs text-gray-500 mt-2 italic">{opp.scoringReasoning}</p>
        )}

        {/* Reply section */}
        {reply ? (
          <div className="mt-4 space-y-2">
            <div className="flex items-center justify-between">
              <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">
                AI reply draft {reply.version > 1 && `(v${reply.version})`}
              </p>
              {reply.toneUsed && (
                <span className="text-xs text-gray-400">Tone: {reply.toneUsed}</span>
              )}
            </div>
            <Textarea
              rows={4}
              value={replyText}
              onChange={e => setReplyText(e.target.value)}
              className="text-sm"
            />
            {reply.whyThisWorks && (
              <p className="text-xs text-purple-600 bg-purple-50 rounded-lg px-3 py-2">
                💡 {reply.whyThisWorks}
              </p>
            )}
          </div>
        ) : (
          <div className="mt-4 bg-gray-50 rounded-lg p-4 text-center">
            <p className="text-sm text-gray-400">No reply generated yet.</p>
            <Button size="sm" variant="secondary" onClick={regenerate} loading={loading === 'regen'} className="mt-2">
              Generate reply
            </Button>
          </div>
        )}

        {/* Action buttons */}
        <div className="flex items-center gap-2 mt-4 pt-3 border-t border-gray-100">
          {opp.status === 'NO_PITCH' ? (
            <p className="text-xs text-gray-400 italic flex-1">
              No product pitch — reply to build karma and posting ratio.
            </p>
          ) : (
            <Button
              size="sm"
              onClick={approve}
              loading={loading === 'approve'}
              disabled={!reply || loading !== null}
            >
              Approve & queue
            </Button>
          )}
          <Button
            size="sm"
            variant="secondary"
            onClick={regenerate}
            loading={loading === 'regen'}
            disabled={loading !== null}
          >
            {opp.status === 'NO_PITCH' ? 'Generate reply' : 'Regenerate'}
          </Button>
          <Button
            size="sm"
            variant="ghost"
            onClick={skip}
            loading={loading === 'skip'}
            disabled={loading !== null}
            className="ml-auto text-gray-400 hover:text-gray-600"
          >
            Skip
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}
