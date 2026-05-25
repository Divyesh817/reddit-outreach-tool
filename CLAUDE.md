# Reddit Outreach Tool — Claude Code Instructions

## What We're Building
A hybrid Reddit outreach SaaS. Users paste their product URL, the AI finds high-intent Reddit threads, drafts contextual replies, and auto-posts them from the user's own Reddit account at human pace. The user approves each reply before it goes live.

Core positioning: smarter intent detection than competitors, safer (user's own account + warmup), cheaper than all three main competitors (Replymer $99/mo, Beno credits, RedditGrow $19.50/mo).

---

## Tech Stack

- **Framework**: Next.js 14 (App Router)
- **Language**: TypeScript
- **Database**: PostgreSQL via Prisma ORM
- **Auth**: NextAuth.js (Google + Reddit OAuth)
- **AI**: Anthropic Claude API (claude-sonnet-4-20250514)
- **Background Jobs**: Inngest (event-driven, serverless-friendly)
- **Styling**: Tailwind CSS
- **Email**: Resend
- **Payments**: Stripe
- **Reddit API**: snoowrap (Reddit JS wrapper)
- **Deployment**: Vercel + Supabase (Postgres)

---

## Project Structure

```
/
├── CLAUDE.md                  ← you are here
├── BUILD_CHECKLIST.md         ← full feature checklist, tick as you go
├── .env.example               ← all required env vars
├── prisma/
│   └── schema.prisma          ← full database schema
├── src/
│   ├── app/                   ← Next.js App Router pages
│   │   ├── (auth)/            ← login, signup pages
│   │   ├── (dashboard)/       ← main app pages
│   │   │   ├── dashboard/     ← home dashboard
│   │   │   ├── opportunities/ ← approve/skip queue
│   │   │   ├── products/      ← product profile management
│   │   │   ├── subreddits/    ← subreddit watchlist
│   │   │   ├── analytics/     ← performance tracking
│   │   │   └── settings/      ← account, billing, Reddit connect
│   │   └── api/               ← API routes
│   │       ├── auth/          ← NextAuth handlers
│   │       ├── products/      ← product CRUD + URL scraping
│   │       ├── opportunities/ ← queue management
│   │       ├── reddit/        ← OAuth connect + posting
│   │       ├── inngest/       ← background job handlers
│   │       └── stripe/        ← webhook + billing
│   ├── components/
│   │   ├── ui/                ← base components (button, card, badge, etc.)
│   │   ├── opportunities/     ← OpportunityCard, ReplyEditor, QueueView
│   │   ├── dashboard/         ← MetricCard, ActivityFeed, HealthScore
│   │   └── products/          ← ProductForm, SubredditList
│   ├── lib/
│   │   ├── anthropic.ts       ← Claude API calls (scraping, scoring, reply gen)
│   │   ├── reddit.ts          ← snoowrap wrapper + posting logic
│   │   ├── inngest.ts         ← job definitions
│   │   ├── prisma.ts          ← Prisma client singleton
│   │   ├── stripe.ts          ← Stripe client + plan limits
│   │   └── safety.ts          ← ban detection, warmup logic, ratio enforcer
│   └── types/
│       └── index.ts           ← shared TypeScript types
```

---

## Database Schema (Prisma)

See `prisma/schema.prisma` for the full schema. Key models:

- **User** — auth, subscription plan, Reddit OAuth tokens
- **Product** — product profile scraped from URL, owned by User
- **Subreddit** — watchlist entry per product, with rules/safety data
- **Opportunity** — a Reddit thread with intent score, pain type, status
- **Reply** — AI-generated reply draft, linked to opportunity
- **PostedReply** — live Reddit comment, with performance tracking
- **WarmupSession** — tracks warmup progress per Reddit account
- **AccountHealth** — karma, shadowban status, removal rate

---

## Core Concepts

### Pain Types
Every opportunity is classified into one of these:
```typescript
type PainType =
  | 'competitor_frustration'   // mentions a competitor negatively
  | 'switching_intent'         // actively looking to switch tools
  | 'active_tool_search'       // asking for recommendations
  | 'roi_frustration'          // using something but getting no results
  | 'workflow_pain'            // struggling with the core problem
```

### Opportunity Status Flow
```
discovered → scored → queued → approved → posted → tracked
                            ↘ skipped
                            ↘ flagged_no_pitch
```

### Safety Rules (never bypass these)
1. Max 3–5 promotional replies per Reddit account per day
2. Never post same product URL in same subreddit within 7 days
3. Maintain 1:3 promo to normal comment ratio — auto-post non-promo comments to balance
4. 7–14 day warmup before first promotional reply on any new account
5. If shadowban detected → pause all posting immediately, alert user
6. If 2+ replies removed in same subreddit → auto-blacklist that subreddit

---

## Key AI Prompts (in lib/anthropic.ts)

### 1. Product Scraper Prompt
Takes raw landing page HTML → returns structured product profile (name, description, audience, competitors, key benefits).

### 2. Subreddit Discovery Prompt
Takes product profile → returns ranked list of subreddits with fit scores and reasoning.

### 3. Intent Scoring Prompt
Takes Reddit thread (title + top comments) + product profile → returns:
- intent_score: 0–100
- pain_type: one of the 5 types above
- should_pitch: boolean
- reasoning: string

### 4. Reply Generation Prompt
Takes thread + product profile + pain_type → returns:
- reply_text: contextual reply, never starts with product name
- tone_used: string
- why_this_works: string (shown to user)

Reply rules baked into the prompt:
- Empathy before pitch, always
- Vary structure every time — no template fingerprint
- Match subreddit tone (casual vs professional)
- Max 150 words unless thread warrants more
- Only mention product URL if intent_score > 70

---

## Background Jobs (Inngest)

| Job | Trigger | What it does |
|-----|---------|-------------|
| `scan.subreddits` | Every 30 min | Scans watchlist subreddits for new threads |
| `score.opportunity` | On new thread found | Scores intent + classifies pain type |
| `post.reply` | On user approval | Posts reply at randomised delay |
| `warmup.daily` | Daily per account | Posts 2–3 non-promo comments for warmup |
| `safety.check` | After every post | Checks shadowban status |
| `digest.daily` | Daily 8am user TZ | Sends opportunity digest email |
| `health.check` | Every 6 hours | Updates account health score |

---

## API Routes

```
POST /api/products                    Create product from URL
GET  /api/products/:id                Get product + subreddits
POST /api/products/:id/discover       Re-run subreddit discovery

GET  /api/opportunities               Get queue (filterable by pain type, status)
POST /api/opportunities/:id/approve   Approve reply → queue for posting
POST /api/opportunities/:id/skip      Skip opportunity
POST /api/opportunities/:id/regenerate Regenerate reply draft

GET  /api/reddit/connect              Start Reddit OAuth flow
GET  /api/reddit/callback             Handle Reddit OAuth callback
GET  /api/reddit/health               Get account health score

POST /api/stripe/checkout             Create checkout session
POST /api/stripe/webhook              Handle Stripe events
```

---

## Subscription Plans

| Plan | Price | Products | Opportunities/mo | Replies/mo |
|------|-------|----------|-----------------|------------|
| Starter | $9/mo | 1 | 200 | 60 |
| Growth | $19/mo | 3 | 1000 | 300 |
| Agency | $49/mo | 10 | 5000 | unlimited |

Plan limits enforced in `lib/stripe.ts` — check before every job and API action.

---

## Environment Variables
See `.env.example` for all required vars. Never commit `.env`.

---

## Build Order for Claude Code
Follow `BUILD_CHECKLIST.md` phase by phase. Recommended start:

1. `prisma/schema.prisma` — get the data model right first
2. `lib/prisma.ts`, `lib/anthropic.ts`, `lib/reddit.ts` — core clients
3. Auth (NextAuth + Reddit OAuth)
4. Product onboarding flow (URL input → scrape → subreddit discovery)
5. Opportunity queue UI (the core daily workflow)
6. Posting engine + safety layer
7. Dashboard + analytics
8. Stripe billing

---

## Important Rules for Claude Code
- Never bypass safety limits — the posting caps, warmup, and ratio enforcer are non-negotiable
- Always use the pain type when generating replies — generic replies are the #1 reason users churn
- Every reply must pass through user approval before posting — no exceptions
- Use TypeScript strict mode throughout
- All Prisma queries go through `lib/prisma.ts` singleton
- Background jobs are stateless — fetch fresh data from DB at start of every job run
