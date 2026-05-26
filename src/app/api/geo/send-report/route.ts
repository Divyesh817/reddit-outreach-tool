export const dynamic = 'force-dynamic'

import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { prisma } from '@/lib/prisma'
import { Resend } from 'resend'

const resend = new Resend(process.env.RESEND_API_KEY)

function scoreLabel(s: number) {
  return s >= 75 ? 'STRONG' : s >= 50 ? 'MODERATE' : 'WEAK'
}
function scoreEmoji(s: number) {
  return s >= 75 ? '🟢' : s >= 50 ? '🟡' : '🔴'
}

function buildHtml(productName: string, productUrl: string, analysis: any, reportDate: string): string {
  const dims = Object.values(analysis.dimensions ?? {}) as any[]
  const quickWins: string[] = analysis.quickWins ?? []
  const redditStrats: any[] = analysis.redditStrategy ?? []
  const contentIdeas: any[] = analysis.contentIdeas ?? []
  const competitors: any[] = analysis.competitorComparison ?? []

  return `<!DOCTYPE html>
<html>
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>GEO Report — ${productName}</title>
<style>
  body { margin: 0; padding: 0; background: #0D0D10; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; color: #E2E2E8; }
  .wrap { max-width: 600px; margin: 0 auto; padding: 40px 24px; }
  .header { text-align: center; margin-bottom: 40px; }
  .logo { font-family: 'JetBrains Mono', monospace; font-size: 13px; color: #FF6B35; letter-spacing: .12em; font-weight: 700; text-transform: uppercase; margin-bottom: 24px; }
  h1 { font-size: 24px; font-weight: 700; color: #F4F4F8; margin: 0 0 8px; letter-spacing: -.02em; }
  .subtitle { font-size: 15px; color: #7C7C8A; margin: 0; }
  .score-card { background: #16161A; border: 1px solid #2A2A35; border-radius: 16px; padding: 28px; margin-bottom: 24px; display: flex; align-items: center; gap: 24px; }
  .score-num { font-size: 48px; font-weight: 800; font-family: 'JetBrains Mono', monospace; line-height: 1; }
  .score-badge { display: inline-block; padding: 4px 10px; border-radius: 6px; font-size: 11px; font-weight: 700; letter-spacing: .08em; text-transform: uppercase; margin-top: 8px; }
  .summary-text { font-size: 15px; color: #A8A8B8; line-height: 1.6; margin: 0; }
  .section-label { font-family: 'JetBrains Mono', monospace; font-size: 10px; font-weight: 700; letter-spacing: .16em; text-transform: uppercase; color: #55556A; margin: 32px 0 14px; border-bottom: 1px solid #1E1E28; padding-bottom: 10px; }
  .dim-row { margin-bottom: 16px; }
  .dim-header { display: flex; justify-content: space-between; margin-bottom: 6px; }
  .dim-label { font-size: 14px; font-weight: 600; color: #C4C4D0; }
  .dim-score { font-family: 'JetBrains Mono', monospace; font-size: 13px; font-weight: 700; }
  .bar-bg { height: 6px; background: #1E1E28; border-radius: 999px; overflow: hidden; }
  .bar-fill { height: 100%; border-radius: 999px; }
  .dim-insight { font-size: 13px; color: #7C7C8A; line-height: 1.5; margin-top: 5px; }
  .win-item { display: flex; gap: 12px; align-items: flex-start; padding: 12px 16px; background: #16161A; border: 1px solid #1E1E28; border-radius: 10px; margin-bottom: 8px; }
  .win-num { width: 22px; height: 22px; border-radius: 50%; background: #2A1500; color: #FF6B35; display: flex; align-items: center; justify-content: center; font-family: 'JetBrains Mono', monospace; font-size: 11px; font-weight: 700; flex-shrink: 0; text-align: center; line-height: 22px; }
  .win-text { font-size: 14px; color: #C4C4D0; line-height: 1.55; }
  .reddit-row { padding: 14px 18px; background: #16161A; border: 1px solid #1E1E28; border-radius: 10px; margin-bottom: 8px; }
  .subreddit { font-family: 'JetBrains Mono', monospace; font-size: 13px; font-weight: 700; color: #FF6B35; margin-bottom: 5px; }
  .reddit-reason { font-size: 14px; color: #C4C4D0; margin: 0 0 4px; }
  .reddit-action { font-size: 13px; color: #7C7C8A; margin: 0; }
  .idea-row { padding: 14px 18px; background: #16161A; border: 1px solid #1E1E28; border-radius: 10px; margin-bottom: 8px; }
  .idea-type { display: inline-block; padding: 2px 7px; border-radius: 4px; font-size: 10px; font-weight: 600; letter-spacing: .06em; text-transform: uppercase; background: #1E1028; color: #A870FF; margin-bottom: 7px; }
  .idea-sub { font-family: 'JetBrains Mono', monospace; font-size: 12px; color: #55556A; margin-left: 8px; }
  .idea-title { font-size: 15px; font-weight: 600; color: #E2E2E8; margin: 0 0 5px; }
  .idea-why { font-size: 13px; color: #7C7C8A; margin: 0; }
  .comp-row { display: flex; align-items: center; gap: 16px; padding: 14px 18px; background: #16161A; border: 1px solid #1E1E28; border-radius: 10px; margin-bottom: 8px; }
  .comp-score-big { font-family: 'JetBrains Mono', monospace; font-size: 22px; font-weight: 800; min-width: 42px; text-align: center; }
  .comp-name { font-size: 15px; font-weight: 600; color: #E2E2E8; margin: 0 0 4px; }
  .comp-gap { font-size: 13px; color: #7C7C8A; margin: 0; }
  .footer { text-align: center; margin-top: 40px; padding-top: 24px; border-top: 1px solid #1E1E28; }
  .footer-text { font-size: 13px; color: #55556A; margin: 0 0 8px; }
  .footer-link { font-size: 13px; color: #FF6B35; text-decoration: none; font-weight: 600; }
</style>
</head>
<body>
<div class="wrap">
  <div class="header">
    <div class="logo">Redgrow GEO Report</div>
    <h1>${productName} — GEO Analysis</h1>
    <p class="subtitle">${productUrl} · ${reportDate}</p>
  </div>

  <!-- Score card -->
  <div class="score-card">
    <div style="text-align:center;flex-shrink:0">
      <div class="score-num" style="color:${analysis.geoScore >= 75 ? '#4ADE80' : analysis.geoScore >= 50 ? '#FBBF24' : '#F87171'}">${analysis.geoScore}</div>
      <div class="score-badge" style="background:${analysis.geoScore >= 75 ? '#0A2318' : analysis.geoScore >= 50 ? '#231900' : '#200A0A'};color:${analysis.geoScore >= 75 ? '#4ADE80' : analysis.geoScore >= 50 ? '#FBBF24' : '#F87171'}">${scoreEmoji(analysis.geoScore)} ${scoreLabel(analysis.geoScore)}</div>
    </div>
    <p class="summary-text">${analysis.summary}</p>
  </div>

  <!-- Dimensions -->
  <div class="section-label">Performance Breakdown</div>
  ${dims.map(dim => `
  <div class="dim-row">
    <div class="dim-header">
      <span class="dim-label">${dim.label}</span>
      <span class="dim-score" style="color:${dim.score >= 75 ? '#4ADE80' : dim.score >= 50 ? '#FBBF24' : '#F87171'}">${dim.score}</span>
    </div>
    <div class="bar-bg"><div class="bar-fill" style="width:${dim.score}%;background:${dim.score >= 75 ? '#4ADE80' : dim.score >= 50 ? '#FBBF24' : '#F87171'}"></div></div>
    <div class="dim-insight">${dim.insight}</div>
  </div>`).join('')}

  <!-- Quick wins -->
  ${quickWins.length > 0 ? `
  <div class="section-label">Quick Wins</div>
  ${quickWins.map((win, i) => `
  <div class="win-item">
    <div class="win-num">${i + 1}</div>
    <div class="win-text">${win}</div>
  </div>`).join('')}` : ''}

  <!-- Reddit strategy -->
  ${redditStrats.length > 0 ? `
  <div class="section-label">Reddit Strategy for GEO</div>
  ${redditStrats.map(s => `
  <div class="reddit-row">
    <div class="subreddit">r/${s.subreddit}</div>
    <p class="reddit-reason">${s.reason}</p>
    <p class="reddit-action">→ ${s.action}</p>
  </div>`).join('')}` : ''}

  <!-- Content ideas -->
  ${contentIdeas.length > 0 ? `
  <div class="section-label">Content Ideas</div>
  ${contentIdeas.map(idea => `
  <div class="idea-row">
    <div><span class="idea-type">${idea.type}</span><span class="idea-sub">r/${idea.subreddit}</span></div>
    <p class="idea-title">${idea.title}</p>
    <p class="idea-why">💡 ${idea.why}</p>
  </div>`).join('')}` : ''}

  <!-- Competitors -->
  ${competitors.length > 0 ? `
  <div class="section-label">Competitor GEO Comparison</div>
  ${competitors.map(comp => `
  <div class="comp-row">
    <div class="comp-score-big" style="color:${comp.estimatedGeoScore >= 75 ? '#4ADE80' : comp.estimatedGeoScore >= 50 ? '#FBBF24' : '#F87171'}">${comp.estimatedGeoScore}</div>
    <div style="flex:1">
      <p class="comp-name">${comp.name}</p>
      <p class="comp-gap">${comp.gap}</p>
    </div>
  </div>`).join('')}` : ''}

  <div class="footer">
    <p class="footer-text">Generated by Redgrow · GEO Analysis for ${productName}</p>
    <a href="${process.env.NEXT_PUBLIC_APP_URL}/geo" class="footer-link">View full report →</a>
  </div>
</div>
</body>
</html>`
}

export async function POST(req: NextRequest) {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { productId, reportId } = await req.json()
  if (!productId) return NextResponse.json({ error: 'productId required' }, { status: 400 })

  const product = await prisma.product.findFirst({
    where: { id: productId, userId: user.id },
    include: { user: { select: { email: true, name: true } } },
  })
  if (!product) return NextResponse.json({ error: 'Product not found' }, { status: 404 })

  let report
  if (reportId) {
    report = await prisma.geoReport.findFirst({ where: { id: reportId, userId: user.id } })
  } else {
    report = await prisma.geoReport.findFirst({
      where: { productId, userId: user.id },
      orderBy: { createdAt: 'desc' },
    })
  }
  if (!report) return NextResponse.json({ error: 'No report found — run analysis first' }, { status: 404 })

  const reportDate = new Date(report.createdAt).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })
  const html = buildHtml(product.name, product.url, report.analysis, reportDate)

  const emailTo = product.user.email
  const { error } = await resend.emails.send({
    from: 'Redgrow GEO <div@redgrow.app>',
    to: emailTo,
    subject: `GEO Report — ${product.name} · Score ${report.geoScore}`,
    html,
  })

  if (error) {
    console.error('Resend error:', error)
    return NextResponse.json({ error: 'Failed to send email' }, { status: 500 })
  }

  return NextResponse.json({ ok: true, sentTo: emailTo })
}
