# Build Checklist

Track progress here. Tick boxes as you complete each item.

---

## Phase 1 — Core Engine (MVP)

### 1. Product Onboarding via URL
- [ ] Accept product URL as the only required input
- [ ] AI scrapes and reads the landing page automatically
- [ ] Extract: product name, description, target audience, key features, competitors
- [ ] Auto-generate product summary used for all downstream AI tasks
- [ ] Let user review and edit the extracted summary before proceeding
- [ ] Store product profile in database per user account

### 2. Subreddit Discovery
- [ ] Auto-suggest relevant subreddits based on product profile
- [ ] Score each subreddit by audience fit (high / medium / low)
- [ ] Scan subreddit rules — flag or block subreddits that ban self-promotion
- [ ] Show subreddit stats: member count, posts/day, typical tone
- [ ] Let user add or remove subreddits from the watchlist
- [ ] Re-run discovery when product profile is updated

### 3. Thread Scanning & Intent Detection
- [ ] Monitor all watchlist subreddits 24/7 for new posts and comments
- [ ] Score every thread by intent level (0–100%)
- [ ] Classify pain type (competitor_frustration / switching_intent / active_tool_search / roi_frustration / workflow_pain)
- [ ] Surface a "🔥 Ready to switch" queue — highest priority lane
- [ ] Flag threads where pitching would backfire ("do not pitch" warning)
- [ ] Filter out low-quality threads (bots, off-topic, very low karma accounts)
- [ ] Deduplicate — never surface the same thread twice

### 4. AI Reply Generation
- [ ] Generate contextual reply per thread — not a generic template
- [ ] Tone adapts to pain type
- [ ] Tone adapts to subreddit culture
- [ ] Reply structure varies every time
- [ ] Include "why this reply works" explanation for the user
- [ ] User can regenerate reply with one click
- [ ] User can edit reply inline before approving

### 5. Approve / Skip Queue
- [ ] Show all pending opportunities in a daily queue
- [ ] Each card shows: thread title, subreddit, intent score, pain type, time posted
- [ ] One-click approve → reply is queued for posting
- [ ] One-click skip → thread removed from queue
- [ ] Queue sorted by intent score, filterable by pain type
- [ ] Daily digest notification when new opportunities arrive

### 6. Automated Posting
- [ ] Connect user's own Reddit account via OAuth
- [ ] Post approved replies automatically
- [ ] Enforce daily posting cap: max 5 promotional replies per day
- [ ] Randomise posting times
- [ ] Never post same product URL in same subreddit within 7 days
- [ ] Auto-mix non-promotional helpful comments (1 promo per 3 normal)
- [ ] Queue carries forward if daily cap is hit

---

## Phase 2 — Safety & Reliability

### 7. Account Warmup
- [ ] Detect account age and karma on connection
- [ ] Warn user if account is too new
- [ ] Run 7–14 day warmup before first promotional reply
- [ ] During warmup: AI posts 2–3 non-promotional comments per day
- [ ] Show warmup progress in dashboard
- [ ] Only unlock promotional posting once warmup is complete

### 8. Ban Detection & Recovery
- [ ] Shadowban checker after every post
- [ ] Downvote spike alert — pause posting if heavily downvoted
- [ ] Mod removal tracker — auto-blacklist subreddit if 2+ removals
- [ ] Sitewide ban detector — alert user immediately
- [ ] One-click "connect backup account" with queue carryover
- [ ] Optional dual account support
- [ ] Account health score shown in dashboard at all times

### 9. Subreddit Safety
- [ ] Auto-scan subreddit rules before every post
- [ ] Maintain blacklist of no-promo subreddits
- [ ] Track per-subreddit removal rate
- [ ] Never post in same subreddit more than once per 48 hours per account

---

## Phase 3 — Dashboard & Analytics

### 10. Main Dashboard
- [ ] Summary metrics: opportunities found, replies approved, replies posted
- [ ] Account health score
- [ ] Active subreddits with per-subreddit performance
- [ ] Daily streak tracker
- [ ] Recent activity feed

### 11. Performance Tracking
- [ ] Track each posted reply: upvotes, comments, link clicks
- [ ] Show which subreddits and pain types convert best
- [ ] Weekly performance summary email
- [ ] Competitor mention tracker

### 12. Multi-Product Support
- [ ] Support multiple product profiles per account
- [ ] Separate queue, settings, analytics per product

---

## Phase 4 — Growth Features

### 13. SEO Thread Tracking
- [ ] Track which Reddit threads replies appear in
- [ ] Check if threads rank on Google for target keywords
- [ ] Alert when thread moves into top 10

### 14. DM Outreach
- [ ] Surface high-intent users who posted but didn't engage
- [ ] AI drafts personalised DM based on their post
- [ ] User approves DM before sending
- [ ] Simple CRM: sent → replied → converted

### 15. X (Twitter) Support
- [ ] Expand thread scanning to X
- [ ] Same intent scoring and pain-type classification
- [ ] Same approve / post flow

---

## Non-Negotiables

- [ ] ToS clearly states Reddit bans are outside our control
- [ ] Goodwill credit policy: 1 free month if ban occurred within safety limits
- [ ] All data encrypted at rest and in transit
- [ ] User can export all their data at any time
- [ ] User can delete their account and all data instantly
- [ ] No posting from fake, shared, or anonymous accounts — ever
