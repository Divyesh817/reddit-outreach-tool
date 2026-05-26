// Default email templates — used as fallbacks when no DB override exists

const APP_URL = process.env.NEXT_PUBLIC_APP_URL ?? 'https://redgrow.app'

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

export interface EmailTemplateDefault {
  key: string
  name: string
  subject: string
  html: string
  variables: string // JSON string
}

export const DEFAULT_EMAIL_TEMPLATES: EmailTemplateDefault[] = [
  {
    key: 'welcome',
    name: 'Welcome Email',
    subject: 'Welcome to Redgrow, {{firstName}} 👋',
    variables: JSON.stringify([
      { name: 'firstName', description: "Recipient's first name" },
      { name: 'APP_URL', description: 'App base URL' },
    ]),
    html: base(`
    <p style="font-size:22px;font-weight:700;letter-spacing:-.02em;margin:0 0 20px">Hey {{firstName}} 👋</p>
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
  `),
  },
  {
    key: 'highIntent',
    name: 'High-Intent Match Alert',
    subject: '🔥 High-intent match for {{productName}} ({{intentScore}}% score)',
    variables: JSON.stringify([
      { name: 'productName', description: 'Product name' },
      { name: 'intentScore', description: 'Intent score 0-100' },
      { name: 'postTitle', description: 'Reddit post title' },
      { name: 'subreddit', description: 'Subreddit name (without r/)' },
      { name: 'postUrl', description: 'Link to the Reddit post' },
    ]),
    html: base(`
    <div style="background:#fff7f4;border:1px solid #ffd5c8;border-radius:12px;padding:20px 24px;margin-bottom:24px">
      <div style="font-size:12px;font-weight:700;letter-spacing:.1em;text-transform:uppercase;color:#E54B1B;margin-bottom:8px">High-intent match · {{intentScore}}% score</div>
      <div style="font-size:18px;font-weight:700;color:#1a1a1a;line-height:1.4;margin-bottom:8px">{{postTitle}}</div>
      <div style="font-size:14px;color:#888">r/{{subreddit}} · {{productName}}</div>
    </div>
    <p style="font-size:15px;line-height:1.6;color:#555;margin:0 0 24px">
      Someone on Reddit looks like they're actively looking for what <strong>{{productName}}</strong> does. A reply draft is ready for you to review.
    </p>
    <a href="${APP_URL}/opportunities" style="display:inline-block;padding:13px 26px;background:#E54B1B;color:#fff;border-radius:9px;font-size:15px;font-weight:700">
      View & approve reply →
    </a>
    <p style="margin:20px 0 0;font-size:14px;color:#aaa">
      <a href="{{postUrl}}" style="color:#aaa">View original Reddit post</a>
    </p>
  `),
  },
  {
    key: 'dailyDigest',
    name: 'Daily Digest',
    subject: 'Your daily digest — {{count}} new {{count == 1 ? "opportunity" : "opportunities"}}',
    variables: JSON.stringify([
      { name: 'firstName', description: "Recipient's first name" },
      { name: 'count', description: 'Number of new opportunities' },
      { name: 'opportunityRows', description: 'HTML rows for each opportunity' },
    ]),
    html: base(`
    <p style="font-size:20px;font-weight:700;letter-spacing:-.02em;margin:0 0 6px">Good morning, {{firstName}} ☀️</p>
    <p style="font-size:15px;color:#888;margin:0 0 28px">Here are your top Reddit opportunities from the last 24 hours.</p>
    <table width="100%" cellpadding="0" cellspacing="0">{{opportunityRows}}</table>
    <a href="${APP_URL}/opportunities" style="display:inline-block;margin-top:28px;padding:13px 26px;background:#E54B1B;color:#fff;border-radius:9px;font-size:15px;font-weight:700">
      Review all opportunities →
    </a>
  `),
  },
  {
    key: 'weeklySummary',
    name: 'Weekly Summary',
    subject: 'Your Redgrow week — {{newOpps}} opportunities, {{repliesDrafted}} drafts',
    variables: JSON.stringify([
      { name: 'firstName', description: "Recipient's first name" },
      { name: 'weekOf', description: 'Week date string' },
      { name: 'newOpps', description: 'Number of new opportunities' },
      { name: 'repliesDrafted', description: 'Number of replies drafted' },
      { name: 'repliesApproved', description: 'Number of replies approved' },
    ]),
    html: base(`
    <p style="font-size:20px;font-weight:700;letter-spacing:-.02em;margin:0 0 6px">Weekly recap, {{firstName}} 📊</p>
    <p style="font-size:15px;color:#888;margin:0 0 28px">Week of {{weekOf}}</p>
    <div style="background:#fff;border:1px solid #ede9e3;border-radius:10px;padding:18px 22px;margin-bottom:12px;display:flex;align-items:center;gap:16px">
      <div style="font-size:32px;font-weight:800;color:#E54B1B;letter-spacing:-.02em;line-height:1">{{newOpps}}</div>
      <div>
        <div style="font-size:14px;font-weight:600;color:#1a1a1a">New opportunities</div>
        <div style="font-size:13px;color:#999">Threads found across all subreddits</div>
      </div>
    </div>
    <div style="background:#fff;border:1px solid #ede9e3;border-radius:10px;padding:18px 22px;margin-bottom:28px;display:flex;align-items:center;gap:16px">
      <div style="font-size:32px;font-weight:800;color:#1a1a1a;letter-spacing:-.02em;line-height:1">{{repliesDrafted}}</div>
      <div>
        <div style="font-size:14px;font-weight:600;color:#1a1a1a">Replies drafted</div>
        <div style="font-size:13px;color:#999">{{repliesApproved}} marked as done</div>
      </div>
    </div>
    <a href="${APP_URL}/opportunities" style="display:inline-block;padding:13px 26px;background:#E54B1B;color:#fff;border-radius:9px;font-size:15px;font-weight:700">
      Go to inbox →
    </a>
  `),
  },
  {
    key: 'geoReport',
    name: 'GEO Report Email',
    subject: 'Your GEO Report for {{productName}}',
    variables: JSON.stringify([
      { name: 'productName', description: 'Product name' },
      { name: 'productUrl', description: 'Product URL' },
      { name: 'geoScore', description: 'GEO score 0-100' },
      { name: 'summary', description: 'AI-generated summary' },
      { name: 'reportDate', description: 'Report date string' },
    ]),
    html: base(`
    <p style="font-size:20px;font-weight:700;letter-spacing:-.02em;margin:0 0 6px">GEO Report: {{productName}}</p>
    <p style="font-size:15px;color:#888;margin:0 0 24px">{{reportDate}}</p>
    <div style="background:#fff;border:1px solid #ede9e3;border-radius:12px;padding:24px;margin-bottom:24px;text-align:center">
      <div style="font-size:48px;font-weight:800;color:#E54B1B">{{geoScore}}</div>
      <div style="font-size:14px;color:#999;margin-top:4px">GEO Score</div>
    </div>
    <p style="font-size:15px;line-height:1.7;color:#444;margin:0 0 24px">{{summary}}</p>
    <a href="${APP_URL}/geo" style="display:inline-block;padding:13px 26px;background:#E54B1B;color:#fff;border-radius:9px;font-size:15px;font-weight:700">
      View full report →
    </a>
  `),
  },
]
