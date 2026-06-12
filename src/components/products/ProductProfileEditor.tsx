'use client'

import { useState, KeyboardEvent } from 'react'
import { S } from '@/lib/theme'

interface Props {
  productId: string
  initial: {
    name: string
    description: string
    targetAudience: string
    keyBenefits: string[]
    competitors: string[]
    summary: string
  }
}

export function ProductProfileEditor({ productId, initial }: Props) {
  const [editing, setEditing] = useState(false)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [saved, setSaved] = useState(false)

  const [name, setName] = useState(initial.name)
  const [description, setDescription] = useState(initial.description)
  const [targetAudience, setTargetAudience] = useState(initial.targetAudience)
  const [keyBenefits, setKeyBenefits] = useState<string[]>(initial.keyBenefits)
  const [competitors, setCompetitors] = useState<string[]>(initial.competitors)
  const [summary, setSummary] = useState(initial.summary)

  const [benefitInput, setBenefitInput] = useState('')
  const [competitorInput, setCompetitorInput] = useState('')

  function addTag(list: string[], setList: (v: string[]) => void, val: string) {
    const t = val.trim()
    if (t && !list.includes(t)) setList([...list, t])
  }
  function removeTag(list: string[], setList: (v: string[]) => void, i: number) {
    setList(list.filter((_, idx) => idx !== i))
  }
  function onTagKeyDown(
    e: KeyboardEvent<HTMLInputElement>,
    list: string[], setList: (v: string[]) => void,
    input: string, setInput: (v: string) => void
  ) {
    if (e.key === 'Enter') { e.preventDefault(); addTag(list, setList, input); setInput('') }
    if (e.key === 'Backspace' && !input && list.length > 0) setList(list.slice(0, -1))
  }

  function cancel() {
    setName(initial.name)
    setDescription(initial.description)
    setTargetAudience(initial.targetAudience)
    setKeyBenefits(initial.keyBenefits)
    setCompetitors(initial.competitors)
    setSummary(initial.summary)
    setBenefitInput('')
    setCompetitorInput('')
    setError('')
    setEditing(false)
  }

  async function save() {
    setSaving(true)
    setError('')
    try {
      const res = await fetch(`/api/products/${productId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, description, targetAudience, keyBenefits, competitors, summary }),
      })
      if (!res.ok) throw new Error((await res.json()).error || 'Save failed')
      setSaved(true)
      setEditing(false)
      setTimeout(() => setSaved(false), 3000)
    } catch (e: any) {
      setError(e.message)
    }
    setSaving(false)
  }

  return (
    <div style={{ background: S.panel, borderRadius: 14, border: `1px solid ${S.line2}`, overflow: 'hidden', marginBottom: 16 }}>
      {/* Header */}
      <div style={{ padding: '14px 24px', borderBottom: `1px solid ${S.line}`, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <p style={{ margin: 0, fontSize: 15, fontWeight: 700, color: S.text3, textTransform: 'uppercase', letterSpacing: '.06em', fontFamily: 'JetBrains Mono, monospace' }}>
          Product Profile
        </p>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          {saved && <span style={{ fontSize: 13, color: S.green, fontWeight: 600 }}>Saved ✓</span>}
          {!editing ? (
            <button onClick={() => setEditing(true)} style={btnStyle('ghost')}>
              Edit profile
            </button>
          ) : (
            <>
              <button onClick={cancel} disabled={saving} style={btnStyle('ghost')}>Cancel</button>
              <button onClick={save} disabled={saving} style={btnStyle('primary')}>
                {saving ? 'Saving…' : 'Save changes'}
              </button>
            </>
          )}
        </div>
      </div>

      {/* Fields */}
      <div style={{ padding: '20px 24px', display: 'flex', flexDirection: 'column', gap: 20 }}>

        <Field label="Product name">
          {editing
            ? <input value={name} onChange={e => setName(e.target.value)} style={inputStyle} />
            : <p style={valueStyle}>{name}</p>}
        </Field>

        <Field label="Description">
          {editing
            ? <textarea value={description} onChange={e => setDescription(e.target.value)} rows={3} style={textareaStyle} />
            : <p style={valueStyle}>{description}</p>}
        </Field>

        <Field label="Target audience">
          {editing
            ? <textarea value={targetAudience} onChange={e => setTargetAudience(e.target.value)} rows={2} style={textareaStyle} />
            : <p style={valueStyle}>{targetAudience}</p>}
        </Field>

        <Field label="Key benefits">
          {editing ? (
            <TagInput
              tags={keyBenefits} input={benefitInput}
              setInput={setBenefitInput}
              onKeyDown={e => onTagKeyDown(e, keyBenefits, setKeyBenefits, benefitInput, setBenefitInput)}
              onAdd={() => { addTag(keyBenefits, setKeyBenefits, benefitInput); setBenefitInput('') }}
              onRemove={i => removeTag(keyBenefits, setKeyBenefits, i)}
              accent
              placeholder="Add benefit, press Enter"
            />
          ) : (
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
              {keyBenefits.map((b, i) => <Chip key={i} accent>{b}</Chip>)}
            </div>
          )}
        </Field>

        <Field label="Competitors">
          {editing ? (
            <TagInput
              tags={competitors} input={competitorInput}
              setInput={setCompetitorInput}
              onKeyDown={e => onTagKeyDown(e, competitors, setCompetitors, competitorInput, setCompetitorInput)}
              onAdd={() => { addTag(competitors, setCompetitors, competitorInput); setCompetitorInput('') }}
              onRemove={i => removeTag(competitors, setCompetitors, i)}
              placeholder="Add competitor, press Enter"
            />
          ) : (
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
              {competitors.map((c, i) => <Chip key={i}>{c}</Chip>)}
            </div>
          )}
        </Field>

        <Field label="AI summary" hint="Used to generate every reply — most impactful field to edit">
          {editing
            ? <textarea value={summary} onChange={e => setSummary(e.target.value)} rows={4} style={{ ...textareaStyle, borderColor: S.orangeLine }} />
            : <p style={{ ...valueStyle, background: S.card, borderRadius: 8, padding: '12px 16px', border: `1px solid ${S.line}` }}>{summary}</p>}
        </Field>

        {error && (
          <p style={{ fontSize: 13, color: S.red, fontWeight: 600, margin: 0 }}>{error}</p>
        )}
      </div>
    </div>
  )
}

function Field({ label, hint, children }: { label: string; hint?: string; children: React.ReactNode }) {
  return (
    <div>
      <div style={{ display: 'flex', alignItems: 'baseline', gap: 8, marginBottom: 6 }}>
        <p style={{ fontSize: 13, fontWeight: 700, color: S.text4, margin: 0, textTransform: 'uppercase', letterSpacing: '.06em', fontFamily: 'JetBrains Mono, monospace' }}>
          {label}
        </p>
        {hint && <span style={{ fontSize: 12, color: S.orange2, fontWeight: 500 }}>{hint}</span>}
      </div>
      {children}
    </div>
  )
}

function Chip({ children, accent }: { children: React.ReactNode; accent?: boolean }) {
  return (
    <span style={{
      fontSize: 14, fontWeight: 600, padding: '3px 9px', borderRadius: 6,
      background: accent ? S.orangeSoft : S.panel2,
      border: `1px solid ${accent ? S.orangeLine : S.line2}`,
      color: accent ? S.orange2 : S.text3,
    }}>
      {children}
    </span>
  )
}

function TagInput({ tags, input, setInput, onKeyDown, onAdd, onRemove, accent, placeholder }: {
  tags: string[]; input: string; setInput: (v: string) => void
  onKeyDown: (e: KeyboardEvent<HTMLInputElement>) => void
  onAdd: () => void; onRemove: (i: number) => void
  accent?: boolean; placeholder?: string
}) {
  return (
    <div style={{
      display: 'flex', flexWrap: 'wrap', gap: 6, padding: '8px 10px',
      background: S.card, border: `1px solid ${S.line2}`, borderRadius: 8, cursor: 'text',
    }}>
      {tags.map((t, i) => (
        <span key={i} style={{
          display: 'inline-flex', alignItems: 'center', gap: 5,
          fontSize: 13, fontWeight: 600, padding: '3px 8px', borderRadius: 6,
          background: accent ? S.orangeSoft : S.panel2,
          border: `1px solid ${accent ? S.orangeLine : S.line2}`,
          color: accent ? S.orange2 : S.text3,
        }}>
          {t}
          <span onClick={() => onRemove(i)} style={{ cursor: 'pointer', opacity: .6, lineHeight: 1 }}>×</span>
        </span>
      ))}
      <input
        value={input}
        onChange={e => setInput(e.target.value)}
        onKeyDown={onKeyDown}
        onBlur={onAdd}
        placeholder={tags.length === 0 ? placeholder : ''}
        style={{
          border: 'none', outline: 'none', background: 'transparent',
          fontSize: 13, color: S.text, minWidth: 140, flexGrow: 1,
          fontFamily: 'inherit',
        }}
      />
    </div>
  )
}

const inputStyle: React.CSSProperties = {
  width: '100%', padding: '9px 12px', background: S.card,
  border: `1px solid ${S.line2}`, borderRadius: 8, fontSize: 15,
  color: S.text, outline: 'none', fontFamily: 'inherit', boxSizing: 'border-box',
}
const textareaStyle: React.CSSProperties = {
  ...inputStyle, resize: 'vertical' as const, lineHeight: 1.6,
}
const valueStyle: React.CSSProperties = {
  fontSize: 16, color: S.text2, margin: 0, lineHeight: 1.6,
}

function btnStyle(variant: 'primary' | 'ghost'): React.CSSProperties {
  return {
    padding: '7px 14px', borderRadius: 8, fontSize: 13, fontWeight: 600, cursor: 'pointer',
    background: variant === 'primary' ? S.orange : S.card,
    border: `1px solid ${variant === 'primary' ? S.orange : S.line2}`,
    color: variant === 'primary' ? '#fff' : S.text2,
  }
}
