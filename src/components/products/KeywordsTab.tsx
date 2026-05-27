'use client'

import { useState, useRef } from 'react'
import { S } from '@/lib/theme'

interface Props {
  productId: string
  initialKeywords: string[]
}

export function KeywordsTab({ productId, initialKeywords }: Props) {
  const [keywords, setKeywords] = useState<string[]>(initialKeywords)
  const [input, setInput] = useState('')
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)

  async function save(updated: string[]) {
    setSaving(true)
    setSaved(false)
    try {
      await fetch(`/api/products/${productId}/keywords`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ keywords: updated }),
      })
      setSaved(true)
      setTimeout(() => setSaved(false), 2000)
    } finally {
      setSaving(false)
    }
  }

  function add() {
    const trimmed = input.trim().toLowerCase()
    if (!trimmed || keywords.includes(trimmed) || keywords.length >= 30) return
    const updated = [...keywords, trimmed]
    setKeywords(updated)
    setInput('')
    save(updated)
    inputRef.current?.focus()
  }

  function remove(kw: string) {
    const updated = keywords.filter(k => k !== kw)
    setKeywords(updated)
    save(updated)
  }

  function onKeyDown(e: React.KeyboardEvent) {
    if (e.key === 'Enter') { e.preventDefault(); add() }
    if (e.key === 'Backspace' && !input && keywords.length > 0) {
      remove(keywords[keywords.length - 1])
    }
  }

  return (
    <div style={{ background: S.panel, borderRadius: 14, border: `1px solid ${S.line2}`, overflow: 'hidden' }}>
      {/* Header */}
      <div style={{ padding: '14px 24px', borderBottom: `1px solid ${S.line}`, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <p style={{ margin: 0, fontSize: 15, fontWeight: 700, color: S.text3, textTransform: 'uppercase', letterSpacing: '.06em', fontFamily: 'JetBrains Mono, monospace' }}>
          Keywords
        </p>
        <span style={{ fontSize: 12, color: S.text4, fontFamily: 'JetBrains Mono, monospace' }}>
          {keywords.length} / 30
          {saved && <span style={{ color: S.green, marginLeft: 8 }}>Saved ✓</span>}
          {saving && <span style={{ color: S.text4, marginLeft: 8 }}>Saving…</span>}
        </span>
      </div>

      <div style={{ padding: '20px 24px' }}>
        <p style={{ fontSize: 14, color: S.text4, margin: '0 0 16px', lineHeight: 1.5 }}>
          These phrases are monitored across Reddit. When a thread title or body matches, it's scored for intent. Add industry-specific terms, competitor names, or pain-point phrases.
        </p>

        {/* Tag cloud */}
        <div style={{
          display: 'flex', flexWrap: 'wrap', gap: 8, marginBottom: 16,
          minHeight: 40,
        }}>
          {keywords.map(kw => (
            <span
              key={kw}
              style={{
                display: 'inline-flex', alignItems: 'center', gap: 6,
                fontSize: 13, fontWeight: 500, padding: '5px 10px', borderRadius: 7,
                background: S.panel2, border: `1px solid ${S.line2}`, color: S.text2,
                fontFamily: 'JetBrains Mono, monospace',
              }}
            >
              {kw}
              <button
                onClick={() => remove(kw)}
                style={{
                  background: 'none', border: 'none', cursor: 'pointer',
                  color: S.text4, padding: 0, lineHeight: 1, fontSize: 15,
                  display: 'flex', alignItems: 'center',
                }}
                title="Remove"
              >
                ×
              </button>
            </span>
          ))}

          {keywords.length === 0 && (
            <span style={{ fontSize: 14, color: S.text4, fontStyle: 'italic' }}>
              No keywords yet — add some below
            </span>
          )}
        </div>

        {/* Input */}
        <div style={{ display: 'flex', gap: 8 }}>
          <input
            ref={inputRef}
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={onKeyDown}
            placeholder={keywords.length >= 30 ? 'Limit reached (30)' : 'e.g. switching from hubspot, crm alternative…'}
            disabled={keywords.length >= 30}
            style={{
              flex: 1, background: S.card, border: `1px solid ${S.line2}`, borderRadius: 8,
              padding: '9px 12px', color: S.text, fontSize: 14, outline: 'none',
              fontFamily: 'JetBrains Mono, monospace',
            }}
          />
          <button
            onClick={add}
            disabled={!input.trim() || keywords.length >= 30}
            style={{
              padding: '9px 18px', background: S.orange2, color: '#fff',
              border: 'none', borderRadius: 8, fontSize: 13, fontWeight: 700,
              cursor: input.trim() && keywords.length < 30 ? 'pointer' : 'not-allowed',
              opacity: input.trim() && keywords.length < 30 ? 1 : 0.4,
            }}
          >
            Add
          </button>
        </div>
        <p style={{ fontSize: 12, color: S.text4, margin: '8px 0 0' }}>
          Press Enter to add · Backspace to remove last
        </p>
      </div>
    </div>
  )
}
