import { Resend } from 'resend'

const resend = new Resend(process.env.RESEND_API_KEY)
const FROM = 'Div from Redgrow <div@redgrow.app>'
const APP_URL = process.env.NEXT_PUBLIC_APP_URL ?? 'https://redgrow.app'

// ─── Shared helpers ───────────────────────────────────────────────────────────

function base(content: string) {
  return `<!DOCTYPE html><html><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<style>
  body{margin:0;padding:0;background:#f9f6f2;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;color:#1a1a1a}
  a{color:#E54B1B;text-decoration:none}
  .wrap{max-width:580px;margin:0 auto;padding:40px 24px 60px}
  .logo{font-size:18px;font-weight:800;color:#1a1a1a;letter-spacing:-.02em;margin-bottom:32px;display:block}
  .dot{display:inline-block;width:10px;height:10px;border-radius:50%;background:#E54B1B;margin-right:6px;vertical-align:middle}
  .footer{margin-top:40px;padding-top:24px;border-top:1px solid #ede9e3;font-size:12px;color:#999;line-height:1.6}
</style></head><body><div class="wrap">
  <span class="logo"><span class="dot"></span>Redgrow</span>
  ${content}
  <div class="footer">
    Redgrow · <a href="${APP_URL}/settings">Manage notifications</a> · <a href="${APP_URL}">redgrow.app</a>
  </div>
</div></body></html>`
}

// ─── 1. Welcome email ─────────────────────────────────────────────────────────

export async function sendWelcomeEmail(to: string, name: string | null) {
  const firstName = name?.split(' ')[0] ?? 'there'
  const html = base(`
    <p style="font-size:22px;font-weight:700;letter-spacing:-.02em;margin:0 0 20px">Hey ${firstName} 👋</p>
    <p style="font-size:16px;line-height:1.7;color:#444;margin:0 0 16px">
      I'm Div, founder of Redgrow. Really glad you signed up.
    </p>
    <p style="font-size:16px;line-height:1.7;color:#444;margin:0 0 16px">
      Redgrow finds Reddit threads where people are actively looking for what you sell — and drafts replies that don't sound like ads. The idea is simple: be helpful first, mention your product when it's genuinely relevant.
    </p>
    <p style="font-size:16px;line-height:1.7;color:#444;margin:0 0 28px">
      To get started, add your product URL and we'll scan Reddit for high-intent threads straight away.
    </p>
    <a href="${APP_URL}/onboarding" style="display:inline-block;padding:14px 28px;background:#E54B1B;color:#fff;border-radius:10px;font-size:15px;font-weight:700;letter-spacing:-.01em">
      Get started →
    </a>
    <p style="font-size:15px;line-height:1.7;color:#666;margin:32px 0 0">
      If you have any questions, just reply to this email — it comes straight to me.<br><br>
      — Div
    </p>
  `)

  return resend.emails.send({
    from: FROM,
    to,
    subject: `Welcome to Redgrow, ${firstName} 👋`,
    html,
  })
}

// ─── 2. High-intent match alert ───────────────────────────────────────────────

export async function sendHighIntentAlert(to: string, opp: {
  productName: string
  postTitle: string
  subreddit: string
  intentScore: number
  postUrl: string
  opportunityId: string
}) {
  const html = base(`
    <div style="background:#fff7f4;border:1px solid #ffd5c8;border-radius:12px;padding:20px 24px;margin-bottom:24px">
      <div style="font-size:12px;font-weight:700;letter-spacing:.1em;text-transform:uppercase;color:#E54B1B;margin-bottom:8px">High-intent match · ${opp.intentScore}% score</div>
      <div style="font-size:18px;font-weight:700;color:#1a1a1a;line-height:1.4;margin-bottom:8px">${opp.postTitle}</div>
      <div style="font-size:14px;color:#888">r/${opp.subreddit} · ${opp.productName}</div>
    </div>
    <p style="font-size:15px;line-height:1.6;color:#555;margin:0 0 24px">
      Someone on Reddit looks like they're actively looking for what <strong>${opp.productName}</strong> does. A reply draft is ready for you to review.
    </p>
    <a href="${APP_URL}/opportunities" style="display:inline-block;padding:13px 26px;background:#E54B1B;color:#fff;border-radius:9px;font-size:15px;font-weight:700">
      View & approve reply →
    </a>
    <p style="margin:20px 0 0;font-size:14px;color:#aaa">
      <a href="${opp.postUrl}" style="color:#aaa">View original Reddit post</a>
    </p>
  `)

  return resend.emails.send({
    from: FROM,
    to,
    subject: `🔥 High-intent match for ${opp.productName} (${opp.intentScore}% score)`,
    html,
  })
}

// ─── 3. Daily digest ──────────────────────────────────────────────────────────

export async function sendDailyDigest(to: string, name: string | null, opps: {
  productName: string
  postTitle: string
  subreddit: string
  intentScore: number
}[]) {
  if (opps.length === 0) return // nothing to send

  const firstName = name?.split(' ')[0] ?? 'there'
  const topOpps = opps.slice(0, 5)

  const oppRows = topOpps.map(o => `
    <tr>
      <td style="padding:14px 0;border-bottom:1px solid #ede9e3">
        <div style="font-size:15px;font-weight:600;color:#1a1a1a;line-height:1.4;margin-bottom:4px">${o.postTitle}</div>
        <div style="font-size:13px;color:#999">r/${o.subreddit} · ${o.productName} ·
          <span style="color:#E54B1B;font-weight:600">${o.intentScore}% intent</span>
        </div>
      </td>
    </tr>`).join('')

  const html = base(`
    <p style="font-size:20px;font-weight:700;letter-spacing:-.02em;margin:0 0 6px">Good morning, ${firstName} ☀️</p>
    <p style="font-size:15px;color:#888;margin:0 0 28px">Here are your top Reddit opportunities from the last 24 hours.</p>

    <table width="100%" cellpadding="0" cellspacing="0">
      ${oppRows}
    </table>

    ${opps.length > 5 ? `<p style="font-size:14px;color:#999;margin:16px 0 0">+${opps.length - 5} more in your inbox</p>` : ''}

    <a href="${APP_URL}/opportunities" style="display:inline-block;margin-top:28px;padding:13px 26px;background:#E54B1B;color:#fff;border-radius:9px;font-size:15px;font-weight:700">
      Review all opportunities →
    </a>
  `)

  return resend.emails.send({
    from: FROM,
    to,
    subject: `Your daily digest — ${opps.length} new ${opps.length === 1 ? 'opportunity' : 'opportunities'}`,
    html,
  })
}

// ─── 4. Weekly summary ────────────────────────────────────────────────────────

export async function sendWeeklySummary(to: string, name: string | null, stats: {
  newOpps: number
  repliesDrafted: number
  repliesApproved: number
  topSubreddits: string[]
  weekOf: string
}) {
  const firstName = name?.split(' ')[0] ?? 'there'

  const subList = stats.topSubreddits.length > 0
    ? stats.topSubreddits.map(s => `<li style="padding:3px 0;font-size:15px;color:#555">r/${s}</li>`).join('')
    : '<li style="padding:3px 0;font-size:15px;color:#999">No activity yet</li>'

  const html = base(`
    <p style="font-size:20px;font-weight:700;letter-spacing:-.02em;margin:0 0 6px">Weekly recap, ${firstName} 📊</p>
    <p style="font-size:15px;color:#888;margin:0 0 28px">Week of ${stats.weekOf}</p>

    <div style="display:grid;gap:12px;margin-bottom:28px">
      <div style="background:#fff;border:1px solid #ede9e3;border-radius:10px;padding:18px 22px;display:flex;align-items:center;gap:16px">
        <div style="font-size:32px;font-weight:800;color:#E54B1B;letter-spacing:-.02em;line-height:1">${stats.newOpps}</div>
        <div>
          <div style="font-size:14px;font-weight:600;color:#1a1a1a">New opportunities</div>
          <div style="font-size:13px;color:#999">Threads found across all subreddits</div>
        </div>
      </div>
      <div style="background:#fff;border:1px solid #ede9e3;border-radius:10px;padding:18px 22px;display:flex;align-items:center;gap:16px">
        <div style="font-size:32px;font-weight:800;color:#1a1a1a;letter-spacing:-.02em;line-height:1">${stats.repliesDrafted}</div>
        <div>
          <div style="font-size:14px;font-weight:600;color:#1a1a1a">Replies drafted</div>
          <div style="font-size:13px;color:#999">${stats.repliesApproved} marked as done</div>
        </div>
      </div>
    </div>

    ${stats.topSubreddits.length > 0 ? `
    <div style="background:#fff;border:1px solid #ede9e3;border-radius:10px;padding:18px 22px;margin-bottom:28px">
      <div style="font-size:13px;font-weight:700;letter-spacing:.08em;text-transform:uppercase;color:#999;margin-bottom:12px">Top subreddits this week</div>
      <ul style="margin:0;padding-left:18px">${subList}</ul>
    </div>` : ''}

    <a href="${APP_URL}/opportunities" style="display:inline-block;padding:13px 26px;background:#E54B1B;color:#fff;border-radius:9px;font-size:15px;font-weight:700">
      Go to inbox →
    </a>
  `)

  return resend.emails.send({
    from: FROM,
    to,
    subject: `Your Redgrow week — ${stats.newOpps} opportunities, ${stats.repliesDrafted} drafts`,
    html,
  })
}

// ─── 5. Competitor Spy digest ─────────────────────────────────────────────────

export async function sendCompetitorDigest(to: string, name: string | null, threads: {
  competitor: string
  postTitle: string
  subreddit: string
  postUrl: string
  intentScore: number
  isSwitching: boolean
}[]) {
  const firstName = name?.split(' ')[0] ?? 'there'

  const items = threads.map(t => `
    <div style="background:#fff;border:1px solid #ede9e3;border-radius:10px;padding:16px 20px;margin-bottom:12px">
      <div style="display:flex;align-items:center;gap:8px;margin-bottom:8px">
        <span style="background:rgba(245,158,11,.12);color:#d97706;font-size:12px;font-weight:700;padding:3px 8px;border-radius:4px">
          🎯 ${t.competitor}
        </span>
        ${t.isSwitching ? '<span style="background:#fff0f0;color:#e54b1b;font-size:12px;font-weight:700;padding:3px 8px;border-radius:4px">SWITCHING</span>' : ''}
        <span style="margin-left:auto;font-size:12px;font-weight:700;color:#888">${t.intentScore}%</span>
      </div>
      <div style="font-size:15px;font-weight:600;color:#1a1a1a;line-height:1.4;margin-bottom:6px">${t.postTitle}</div>
      <div style="font-size:13px;color:#999">r/${t.subreddit}</div>
      <a href="${t.postUrl}" style="display:inline-block;margin-top:10px;font-size:13px;font-weight:600;color:#E54B1B">View thread →</a>
    </div>
  `).join('')

  const html = base(`
    <p style="font-size:20px;font-weight:700;letter-spacing:-.02em;margin:0 0 6px">Competitor activity, ${firstName} 🕵️</p>
    <p style="font-size:15px;color:#888;margin:0 0 28px">
      ${threads.length} thread${threads.length !== 1 ? 's' : ''} mentioning your competitors in the last 48 hours.
      ${threads.filter(t => t.isSwitching).length > 0 ? `<strong style="color:#E54B1B">${threads.filter(t => t.isSwitching).length} switching intent</strong> — reply fast.` : ''}
    </p>
    ${items}
    <a href="${APP_URL}/opportunities?status=COMPETITOR_SPY" style="display:inline-block;margin-top:8px;padding:13px 26px;background:#E54B1B;color:#fff;border-radius:9px;font-size:15px;font-weight:700">
      Open Competitor Spy →
    </a>
  `)

  return resend.emails.send({
    from: FROM,
    to,
    subject: `🕵️ ${threads.length} competitor mention${threads.length !== 1 ? 's' : ''} on Reddit — reply first`,
    html,
  })
}
