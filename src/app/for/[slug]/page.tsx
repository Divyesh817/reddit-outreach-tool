import type { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import '../../landing.css'

type Section = { eyebrow: string; heading: string; body: string[] }

type Page = {
  slug: string
  title: string
  eyebrow: string
  headline: string
  subheadline: string
  sections: Section[]
  tactics?: { number: string; heading: string; body: string }[]
  callout: string
  related: { href: string; label: string }[]
  metaDescription: string
}

const pages: Record<string, Page> = {
  'how-to-find-first-100-customers-on-reddit': {
    slug: 'how-to-find-first-100-customers-on-reddit',
    title: 'How to Find Your First 100 Customers on Reddit',
    eyebrow: 'Customer Acquisition',
    headline: 'How to find your first 100 customers on Reddit.',
    subheadline: "Reddit is where people complain about the exact problems your product solves. Here's how to find those people, talk to them, and turn them into customers — without getting banned.",
    metaDescription: 'Find your first 100 customers on Reddit without ads. A step-by-step playbook for SaaS founders: which subreddits to target, what to say, and how to do it safely.',
    sections: [
      {
        eyebrow: 'Why Reddit',
        heading: 'Your first customers are already on Reddit. They\'re asking for help.',
        body: [
          "When someone posts on Reddit asking 'what tool do you use for X?' or 'I'm so frustrated with Y software, is there anything better?' — that's a buying signal. They're not browsing. They're actively looking.",
          "Reddit has 57 million daily active users. Most niche SaaS categories have active subreddits with thousands of members discussing their exact workflows, pain points, and tool choices every day.",
          "The founders who find customers on Reddit don't advertise. They participate. They answer questions, share genuine insights, and mention their product when it's genuinely relevant. Done right, this scales to hundreds of customers before you spend a dollar on ads.",
        ],
      },
      {
        eyebrow: 'Find the right subreddits',
        heading: 'Start with pain, not demographics.',
        body: [
          "Don't think 'where does my target customer hang out?' Think 'where do people complain about the problem I solve?' The subreddits you want are the ones where your product's pain point is a recurring topic.",
          "For a sales automation tool: r/sales, r/salesforce, r/hubspot, r/startups. For a project management tool: r/projectmanagement, r/productivity, r/agile. For a developer tool: r/webdev, r/programming, the relevant language subreddits. For a marketing tool: r/marketing, r/SEO, r/PPC.",
          "Start with 5–8 subreddits. Spend a week just reading. Look for the types of questions that come up repeatedly. Those are your thread templates — the situations where your product is the answer.",
        ],
      },
      {
        eyebrow: 'Find the right threads',
        heading: 'Intent is everything. Most threads aren\'t worth replying to.',
        body: [
          "Not every thread in a relevant subreddit is an opportunity. You want threads where the person is actively in pain, actively looking, or actively comparing tools — not just discussing a topic generally.",
          "High-intent signals: 'looking for a tool that does X', 'frustrated with current solution', 'what do you use for X?', 'switching from X, what should I try?', 'is X worth it?'. These people want to be sold to — they're asking.",
          "Low-intent threads — general discussions, memes, news — aren't worth your time. You're looking for the 20% of threads that are actually buying signals. Sort by 'new' in your target subreddits and scan daily for them.",
        ],
      },
      {
        eyebrow: 'What to say',
        heading: 'Lead with help. Mention the product second.',
        body: [
          "The founders who convert best on Reddit don't pitch. They answer. They provide real value — share experience, explain a framework, solve the immediate problem — and then mention their product as one option among several.",
          "A reply that converts: acknowledge the specific pain they described, explain why most solutions fail at this, share what works (includes your product + 1–2 others), tell them what to look for when evaluating. You're the expert helping them decide, not a salesperson closing a deal.",
          "Keep it under 150 words. Match the tone of the subreddit. If you sound like an ad, you'll be ignored or downvoted. If you sound like a helpful community member who happens to have built something relevant, you'll get DMs.",
        ],
      },
    ],
    tactics: [
      { number: '01', heading: 'Build karma first', body: 'Spend the first 2 weeks commenting helpfully on threads where you have nothing to pitch. You need a posting history before promotional comments land well.' },
      { number: '02', heading: 'Track your ratio', body: 'For every mention of your product, post 3–5 genuinely helpful comments with no promotion. Reddit\'s algorithms and communities respond poorly to accounts that only show up to pitch.' },
      { number: '03', heading: 'Reply within the first hour', body: 'Threads peak in the first 2–3 hours. If you reply late, the thread is buried and nobody sees your response. Set up keyword alerts so you catch high-intent threads early.' },
      { number: '04', heading: 'Invite DMs, not clicks', body: 'Instead of linking directly, say "DM me if you want to see how we handle this." DMs convert higher and avoid Reddit\'s link filters. Your first 20 customers probably came through DMs.' },
      { number: '05', heading: 'Follow up in comments', body: 'If someone replies positively to your comment, continue the conversation. Answer their follow-up questions publicly — those sub-threads become lead gen assets that rank in search.' },
    ],
    callout: "Redgrow scans Reddit 24/7 for high-intent threads in your target subreddits. When someone posts asking for a tool that solves your problem, you'll know within minutes. Redgrow drafts a contextual reply — you approve it, paste it, and move on. Your first 100 customers are already posting. You just need to find them.",
    related: [
      { href: '/how-to/reply-to-reddit-threads-to-get-signups', label: 'How to reply to Reddit threads to get signups' },
      { href: '/how-to/find-buying-intent-threads-on-reddit', label: 'How to find buying intent threads on Reddit' },
      { href: '/reddit-marketing/why-you-keep-getting-banned-on-reddit', label: 'Why you keep getting banned on Reddit' },
    ],
  },

  'reddit-comments-into-paying-customers': {
    slug: 'reddit-comments-into-paying-customers',
    title: 'How to Turn Reddit Comments Into Paying Customers',
    eyebrow: 'Conversion',
    headline: 'How to turn Reddit comments into paying customers.',
    subheadline: "Leaving helpful Reddit comments is table stakes. Converting those comments into signups and paying customers is a skill. Here's the system.",
    metaDescription: 'Turn Reddit comments into SaaS customers. The conversion playbook: what to say, how to invite signups, and how to follow up without getting banned.',
    sections: [
      {
        eyebrow: 'The problem',
        heading: 'Most Reddit comments get upvotes. Not signups.',
        body: [
          "It's easy to get upvotes on Reddit. Post genuinely helpful content, and the community will reward you. But upvotes don't pay bills. Converting Reddit engagement into product signups requires something more intentional.",
          "The gap between 'helpful commenter' and 'founder with customers' is usually one thing: a clear, low-friction path from the comment to a conversation or signup. Most founders leave helpful comments but never bridge that gap.",
          "The solution isn't to be more salesy. It's to make the next step obvious and relevant. If your comment genuinely helped someone, they want to know more about you and what you've built. Give them a natural way to find out.",
        ],
      },
      {
        eyebrow: 'Comment structure',
        heading: 'The anatomy of a comment that converts.',
        body: [
          "A converting comment has three parts: empathy (you understand the specific problem), insight (you have a perspective they haven't heard), and a bridge (a natural next step if they want to go deeper).",
          "Empathy: 'This is a frustrating problem — most tools get this wrong because they optimize for X when what actually matters is Y.' Insight: 'The approach that actually works is [specific, actionable advice]. Most people skip step 2 and wonder why they're stuck.' Bridge: 'I built a tool specifically for this workflow — DM me if you want to see how it handles the edge case you mentioned.'",
          "The bridge is not a link. It's an invitation. Links in Reddit comments get filtered, downvoted, or banned. Invitations to DM get accepted — and DMs convert 3× better than landing page visits because the context is established.",
        ],
      },
      {
        eyebrow: 'The DM funnel',
        heading: 'Your best conversions happen in DMs, not on your landing page.',
        body: [
          "When someone DMs you from a Reddit comment, they already have context. They read your comment, they found it valuable, and they want more. This is the highest-intent conversation you can have.",
          "First DM: thank them for reaching out, ask one clarifying question about their specific situation ('What tool are you currently using for this?'). This warms the conversation and gives you positioning information.",
          "Second message: answer their question directly, then offer a short demo or trial. 'We built exactly for this — here's a 2-minute Loom showing how it handles your case. Happy to set up a trial if it looks relevant.' Your close rate from this conversation will be 20–40%.",
        ],
      },
      {
        eyebrow: 'Scale the system',
        heading: 'One good thread can generate leads for months.',
        body: [
          "Reddit threads don't disappear. A comment you posted 6 months ago still ranks in Google for long-tail queries. People still find and respond to it. One well-placed, genuinely helpful comment in a popular thread can generate inbound DMs for years.",
          "The founders doing this well treat each Reddit comment like a mini blog post. They put care into it. They explain their thinking. They share something non-obvious. That quality gets upvoted, referenced, and reshared — compounding over time.",
          "Combine this with systematic thread monitoring — catching high-intent threads within the first hour and replying consistently — and Reddit becomes a predictable acquisition channel with no ad spend.",
        ],
      },
    ],
    callout: "Redgrow finds the threads where people are ready to buy, drafts replies structured for conversion, and tracks which replies led to signups. You handle the conversation. Redgrow handles the monitoring and drafting.",
    related: [
      { href: '/for/how-to-find-first-100-customers-on-reddit', label: 'How to find your first 100 customers on Reddit' },
      { href: '/how-to/reply-to-reddit-threads-to-get-signups', label: 'How to reply to Reddit threads to get signups' },
      { href: '/for/reddit-marketing-strategy-early-stage-startups', label: 'Reddit marketing strategy for early stage startups' },
    ],
  },

  'reddit-marketing-strategy-early-stage-startups': {
    slug: 'reddit-marketing-strategy-early-stage-startups',
    title: 'Reddit Marketing Strategy for Early Stage Startups',
    eyebrow: 'Strategy',
    headline: 'Reddit marketing strategy for early stage startups.',
    subheadline: "Early stage is actually the best time to market on Reddit. You're scrappy, you care deeply, and you have something to prove. Here's how to use that.",
    metaDescription: 'Reddit marketing strategy for early-stage SaaS startups. How to build a presence, find customers, and grow without an ad budget — before product-market fit.',
    sections: [
      {
        eyebrow: 'Why early stage is an advantage',
        heading: 'Authenticity is rare on Reddit. Founders have it.',
        body: [
          "Reddit communities are allergic to corporate marketing. They can smell a polished brand voice from a mile away. But they love hearing from founders. The person who built a thing explaining why they built it, what they learned, what doesn't work yet — that's content Reddit communities actually want.",
          "Early-stage founders have something that scaled companies don't: genuine urgency, unpolished honesty, and real skin in the game. 'I built this because I was personally frustrated with X' converts better than any landing page copy.",
          "Use your founder story as the entry point. Share your building journey in relevant subreddits (r/startups, r/Entrepreneur, your niche communities). Be honest about what's working and what isn't. You'll attract early adopters who want to help you succeed.",
        ],
      },
      {
        eyebrow: 'The 90-day playbook',
        heading: 'A structured approach for the first three months.',
        body: [
          "Days 1–30: Build your presence. Pick 5 subreddits. Post 5–10 genuinely helpful comments per week with zero promotion. Build karma, establish a posting history, learn the community norms. No product mentions yet.",
          "Days 31–60: Start soft launching. Begin weaving in product mentions once every 8–10 comments. When someone asks a question your product answers, share your experience honestly: 'I actually built something for exactly this — happy to share if useful.' Track the response.",
          "Days 61–90: Systematize. You now know which subreddits respond, which thread types convert, and what tone works. Build a monitoring system to catch new high-intent threads quickly. Start posting consistently — 3–5 replies per day, 1 promotional per 5.",
        ],
      },
      {
        eyebrow: 'What not to do',
        heading: 'The mistakes that end early-stage Reddit strategies.',
        body: [
          "Don't post in r/SaaS or r/Entrepreneur asking for feedback before you've built karma there. These subreddits are saturated with 'I built a thing, please validate it' posts. They perform poorly because everyone is there to promote, not to help.",
          "Don't over-optimize for upvotes. A post with 3 upvotes that generated 5 DMs is worth more than a post with 50 upvotes that generated 0 signups. Target high-intent subreddits over large ones.",
          "Don't disappear after your first promotional post fails. Reddit compounds. An account with 6 months of consistent, helpful participation has 10× more reach than a fresh account. The founders who give up after 2 weeks never see the compounding returns.",
        ],
      },
    ],
    tactics: [
      { number: '01', heading: 'Do a weekly Show HN–style post', body: 'Post a weekly update in r/startups or r/SaaS as a "Show my progress" post. Share metrics, learnings, and honest failures. These attract early adopters and build reputation.' },
      { number: '02', heading: 'Answer competitor threads', body: 'When someone posts about a competitor\'s product, be the helpful voice that offers context — including yours. \'Competitor X is great for A, but if you need B, worth looking at alternatives like [yours].\'' },
      { number: '03', heading: 'Build in public on Reddit', body: 'r/Entrepreneur and r/startups love build-in-public content. Monthly posts sharing your MRR, churn, and learnings build trust faster than any ad campaign.' },
      { number: '04', heading: 'Use Reddit for customer research', body: 'Before replying, read the thread deeply. What exact words do they use? What alternatives did they mention? What are their real frustrations? Use that language in your replies and on your landing page.' },
      { number: '05', heading: 'Create a subreddit for your niche', body: 'If your target audience doesn\'t have a dedicated subreddit, create one. Moderate it generously, invite contributors, and position yourself as the community leader for that topic.' },
    ],
    callout: "Redgrow is built for exactly this phase. It monitors Reddit 24/7 so you don't have to, scores threads by buying intent so you focus on the ones that matter, and drafts replies that sound like a founder — not a marketer. Start finding customers on day one.",
    related: [
      { href: '/for/how-to-find-first-100-customers-on-reddit', label: 'How to find your first 100 customers on Reddit' },
      { href: '/how-to/promote-saas-on-reddit-organically', label: 'How to promote your SaaS on Reddit organically' },
      { href: '/reddit-marketing/why-you-keep-getting-banned-on-reddit', label: 'Why you keep getting banned on Reddit' },
    ],
  },

  'saas-founders': {
    slug: 'saas-founders',
    title: 'Reddit Marketing for SaaS Founders',
    eyebrow: 'For SaaS Founders',
    headline: 'The Reddit marketing tool built for SaaS founders.',
    subheadline: "You don't need an ad budget to find your first 1,000 customers. You need to be in the right Reddit threads at the right time — with the right reply.",
    metaDescription: 'Reddit marketing tool for SaaS founders. Find high-intent threads, draft contextual replies, and grow without ads. Built for solo founders and small teams.',
    sections: [
      {
        eyebrow: 'The founder problem',
        heading: 'You know Reddit is valuable. You just don\'t have time to monitor it.',
        body: [
          "Every SaaS founder knows the feeling: you find a perfect Reddit thread — 'looking for a tool that does exactly what you built' — and it was posted 8 hours ago. The top answers already have 50 upvotes. Your reply lands in the void.",
          "The founders who win on Reddit don't get lucky. They have a system. They catch threads within the first hour. They reply before the conversation moves on. They stay consistent when others give up after two weeks.",
          "Redgrow is that system. It monitors your target subreddits continuously, scores threads by buying intent, and surfaces the ones worth your time before they go cold. You reply; we find the opportunity.",
        ],
      },
      {
        eyebrow: 'What Redgrow does',
        heading: 'Three things that take your Reddit strategy from random to systematic.',
        body: [
          "Intent scoring. Not every thread in your target subreddits is a buying signal. Redgrow classifies threads by pain type — competitor frustration, active tool search, ROI frustration, switching intent, workflow pain — and scores intent 0–100. You only see the threads worth replying to.",
          "Reply drafting. Redgrow drafts a contextual reply for every high-intent thread. The draft leads with empathy, matches the subreddit tone, and mentions your product only when it's genuinely relevant. You edit and approve every reply — nothing posts automatically.",
          "Safety enforcement. Redgrow tracks your posting ratio, warns you before you exceed safe limits, and monitors for shadowban signals. The founders using Redgrow have never been banned — because Redgrow won't let you accidentally trip the patterns that cause bans.",
        ],
      },
      {
        eyebrow: 'What founders say',
        heading: 'Reddit went from a distraction to a channel.',
        body: [
          "'I knew I should be on Reddit but every time I tried I'd spend 45 minutes reading threads and post one thing that got 2 upvotes. Redgrow showed me the actual high-intent threads and the first week I closed 3 customers from it.'",
          "'The intent scoring changed how I think about Reddit. I used to post broadly and hope. Now I only reply to threads where someone is actively looking. My conversion rate per reply went from basically 0 to about 1 in 8.'",
          "'The safety features gave me peace of mind I didn't know I needed. My previous approach got my account flagged. Redgrow's ratio tracking and warmup system meant I rebuilt clean and haven't had a single issue in 6 months.'",
        ],
      },
    ],
    callout: "Starter plan starts at $9/month. One product, 200 opportunities per month, 60 reply drafts. Most founders close enough customers in the first week to pay for 12 months. No contracts. Cancel any time.",
    related: [
      { href: '/for/how-to-find-first-100-customers-on-reddit', label: 'How to find your first 100 customers on Reddit' },
      { href: '/for/reddit-marketing-strategy-early-stage-startups', label: 'Reddit marketing strategy for early stage startups' },
      { href: '/how-to/promote-saas-on-reddit-organically', label: 'How to promote your SaaS on Reddit organically' },
    ],
  },

  'reddit-lead-generation-for-agencies': {
    slug: 'reddit-lead-generation-for-agencies',
    title: 'Reddit Lead Generation for Agencies',
    eyebrow: 'For Agencies',
    headline: 'Reddit lead generation for agencies and consultants.',
    subheadline: "Reddit is where your clients' potential customers ask buying questions every day. An agency that systematically answers those questions at scale wins the channel.",
    metaDescription: 'Reddit lead generation for marketing agencies. Monitor multiple client niches, draft replies, and build Reddit presence across client portfolios. Agency plan available.',
    sections: [
      {
        eyebrow: 'The agency opportunity',
        heading: 'Your clients\' buyers are on Reddit. Nobody is talking to them.',
        body: [
          "Most agencies are running Google Ads and LinkedIn campaigns for their SaaS clients. Some are doing content and SEO. Almost none are doing Reddit — which means the channel is wide open for the agencies that figure it out first.",
          "Reddit is where B2B buyers do honest research. They ask real questions, share real frustrations, and get candid recommendations from actual users. A brand that shows up helpfully in those conversations builds trust that no ad can replicate.",
          "The agency that can say 'we run your Reddit presence and it drives 40 inbound leads per month with no ad spend' has a differentiated offering. That's a retainer that doesn't churn.",
        ],
      },
      {
        eyebrow: 'Multi-client workflow',
        heading: 'Managing Reddit across a client portfolio.',
        body: [
          "The challenge for agencies is scale. Monitoring Reddit for one client is manageable. Monitoring for 5–10 clients across different niches is a full-time job without the right tooling.",
          "Redgrow's Agency plan supports up to 10 products — each with its own subreddit watchlist, intent scoring, and reply queue. You can manage multiple clients from one dashboard, with each client's opportunities separated and trackable.",
          "Workflow: set up each client's product profile and target subreddits, configure the intent threshold (only show threads scoring 60+), review the daily queue, approve and post replies. Two hours per day handles 10 active clients.",
        ],
      },
      {
        eyebrow: 'Reporting and proof',
        heading: 'Show clients the value of the channel.',
        body: [
          "Reddit attribution is harder than paid channels — people don't click UTM links from Reddit, they DM, visit directly, or sign up days later. But the proxy metrics are clear: thread responses, upvotes on replies, DMs initiated, signups from Reddit-attributed sessions.",
          "Build a simple Reddit report for clients: threads engaged (week), average intent score, reply acceptance rate (how often the community responds positively), and attributed signups from Reddit organic. The pattern of engagement tells the story even before direct revenue attribution.",
          "Clients who see 15 positive thread responses per week, consistent community mentions, and 5–10 DMs per month understand that something is working — even before they can directly attribute a sale.",
        ],
      },
    ],
    tactics: [
      { number: '01', heading: 'Audit the client\'s subreddit landscape first', body: 'Before starting any Reddit work, spend a week reading the target subreddits. Map the recurring pain points, the popular tools being discussed, and the tone of the community. This audit pays dividends.' },
      { number: '02', heading: 'Build separate Reddit accounts per client', body: 'Don\'t manage all clients from one Reddit account. Each client needs its own aged, warmed-up account with genuine karma in the relevant subreddits.' },
      { number: '03', heading: 'Separate editorial from promotional', body: 'Maintain a 4:1 ratio of genuinely helpful comments to product-promotional ones. This isn\'t just rule-following — the helpful comments build the account\'s reputation and make promotional comments land better.' },
      { number: '04', heading: 'Track thread engagement, not just posts', body: 'The real value of Reddit is in the conversations that follow your initial comment. When someone replies positively, continue the thread. Those extended conversations are where conversions happen.' },
    ],
    callout: "Redgrow Agency plan: $49/month for up to 10 products. One dashboard for your full client portfolio. Each client has their own subreddit watchlist, opportunity queue, and reply history. Get started today — cancel anytime.",
    related: [
      { href: '/for/saas-founders', label: 'Reddit marketing for SaaS founders' },
      { href: '/best/reddit-marketing-tools-for-saas-founders', label: 'Best Reddit marketing tools for SaaS founders' },
      { href: '/reddit-marketing/why-you-keep-getting-banned-on-reddit', label: 'Why you keep getting banned on Reddit' },
    ],
  },

  'reddit-keyword-monitoring': {
    slug: 'reddit-keyword-monitoring',
    title: 'Reddit Keyword Monitoring for SaaS',
    eyebrow: 'Keyword Monitoring',
    headline: 'Reddit keyword monitoring that surfaces buying signals.',
    subheadline: "Monitoring Reddit for keywords is easy. Monitoring Reddit for intent — threads where someone is actually about to make a purchase decision — is what drives customers.",
    metaDescription: 'Reddit keyword monitoring for SaaS. Monitor subreddits for buying signals, competitor mentions, and product category searches. See high-intent threads first.',
    sections: [
      {
        eyebrow: 'Why keyword monitoring alone fails',
        heading: 'Keywords catch threads. Intent scoring catches customers.',
        body: [
          "A simple keyword alert for your product category will surface hundreds of threads per week. Most of them are general discussions, memes, news articles, or questions with no buying intent. Wading through them all to find the 5–10 threads that matter takes hours.",
          "The signal-to-noise problem is why most founders try Reddit monitoring, get overwhelmed, and give up. They set up a keyword alert, get flooded with irrelevant threads, and conclude that Reddit isn't a viable channel.",
          "What actually works is layering intent scoring on top of keyword matching. Not just 'does this thread mention my category?' but 'does this thread show signals of an active purchase decision?' Those are different questions — and only one of them leads to customers.",
        ],
      },
      {
        eyebrow: 'How Redgrow monitors',
        heading: 'Continuous scanning across your target subreddits.',
        body: [
          "Redgrow monitors your configured subreddits every 30 minutes. New threads are scored by an AI model trained on conversion signals: explicit requests for tool recommendations, frustration with current solutions, comparisons between competitors, switching intent, workflow pain.",
          "Each thread gets an intent score from 0–100. You set the threshold — most founders start at 60, meaning Redgrow only shows you threads where there's clear buying signal. Above 80, the thread is flagged as high priority.",
          "You see a ranked list of threads, scored by intent, with the highest-priority ones at the top. Each entry shows the thread title, subreddit, score, pain type, and a preview of why it scored high. One click opens the thread — draft reply already waiting.",
        ],
      },
      {
        eyebrow: 'What to monitor',
        heading: 'The subreddit and keyword combinations that surface buyers.',
        body: [
          "Primary: your product category subreddits (e.g., r/projectmanagement for a PM tool). These have the highest baseline intent because everyone there uses the category of software you're building.",
          "Secondary: competitor brand subreddits or threads mentioning competitors. Someone venting about r/Notion or asking 'is there an alternative to Asana' is already in a switching mindset — the warmest lead you can find on Reddit.",
          "Tertiary: the persona subreddits where your buyers hang out (r/freelance, r/marketing, r/smallbusiness). Lower baseline intent, but much higher volume. Catch 1 in 20 threads and you've found a customer.",
        ],
      },
    ],
    callout: "Set up Redgrow in 10 minutes: paste your product URL, confirm the subreddits, set your intent threshold. Within 30 minutes, you'll see your first scored opportunities. Most founders find a high-intent thread worth replying to within the first day.",
    related: [
      { href: '/how-to/find-buying-intent-threads-on-reddit', label: 'How to find buying intent threads on Reddit' },
      { href: '/for/saas-founders', label: 'Reddit marketing for SaaS founders' },
      { href: '/blog/intent-scoring', label: 'How Redgrow intent scoring works' },
    ],
  },

  'reddit-marketing-tool': {
    slug: 'reddit-marketing-tool',
    title: 'Reddit Marketing Tool for SaaS',
    eyebrow: 'Product',
    headline: 'The Reddit marketing tool that finds buyers, not just mentions.',
    subheadline: "Reddit marketing tools that just monitor keywords tell you where your brand is mentioned. Redgrow tells you where your next customer is asking to be sold to.",
    metaDescription: 'Reddit marketing tool for SaaS founders and agencies. Find high-intent threads, draft contextual replies, and grow safely. Start free — no credit card required.',
    sections: [
      {
        eyebrow: 'What makes a Reddit marketing tool',
        heading: 'There are three kinds of Reddit tools. Only one drives revenue.',
        body: [
          "Social listening tools tell you when your brand or competitors are mentioned. Useful for brand monitoring, not useful for customer acquisition — you're always reacting to things that already happened.",
          "Scheduling tools let you queue Reddit posts. They treat Reddit like Twitter. Reddit is not Twitter. Scheduled promotional posts get removed by moderators and downvoted by communities. These tools get you banned faster.",
          "Intent-based tools — like Redgrow — find threads where someone is actively looking for what you sell. They surface the buying signal, help you respond, and track what works. This is the tool that drives actual revenue.",
        ],
      },
      {
        eyebrow: 'How Redgrow works',
        heading: 'From product URL to first customer in a day.',
        body: [
          "Step 1: Paste your product URL. Redgrow scrapes your landing page and extracts your product profile — what you do, who you're for, what problems you solve, who your competitors are.",
          "Step 2: Subreddit discovery. Redgrow recommends the subreddits where your target customers discuss the problems you solve. You approve the list and Redgrow starts monitoring immediately.",
          "Step 3: Opportunity queue. Every 30 minutes, Redgrow scores new threads. You see a ranked list of high-intent opportunities with AI-drafted replies ready for your approval. You review, edit if needed, copy, and paste. That's it.",
        ],
      },
      {
        eyebrow: 'Built for safety',
        heading: 'The only Reddit tool that actively prevents bans.',
        body: [
          "Most Reddit marketing tools treat account safety as your problem. Redgrow treats it as a core feature. Every action the app suggests is checked against safety rules: daily posting limits, subreddit history requirements, promotional ratio limits.",
          "Redgrow never touches your Reddit account. No OAuth permissions. No API access. You copy replies and paste them manually. Reddit sees a human posting — because that's exactly what's happening. This is why Redgrow accounts don't get banned.",
          "The warmup system guides new accounts through the 7–14 day warmup period before any promotional activity. The ratio enforcer tracks your promotional comment percentage and warns you before you exceed safe limits.",
        ],
      },
    ],
    tactics: [
      { number: '01', heading: 'Start with one product, 5 subreddits', body: 'Don\'t try to monitor everything at once. Start with your best-fit subreddits and add more as you learn which ones convert.' },
      { number: '02', heading: 'Set your intent threshold at 65+', body: 'Threads scoring below 65 are rarely worth your time. Higher threshold = fewer threads = more focus = better results.' },
      { number: '03', heading: 'Review the queue daily', body: 'Reddit moves fast. A thread posted at 8am is stale by 5pm. Check your opportunity queue every morning and reply to anything that scored well within the first few hours.' },
      { number: '04', heading: 'Use the "why this works" note', body: 'Every Redgrow draft includes a note explaining why the reply is structured as it is. Read it. Understanding the reasoning makes your edits better.' },
    ],
    callout: "Try Redgrow free. No credit card. Set up takes 10 minutes. Most founders see their first high-intent thread within an hour of setup. The first customer usually follows within a week.",
    related: [
      { href: '/compare/vs-replymer', label: 'Redgrow vs Replymer' },
      { href: '/best/reddit-marketing-tools-for-saas-founders', label: 'Best Reddit marketing tools for SaaS founders' },
      { href: '/for/saas-founders', label: 'Reddit marketing for SaaS founders' },
    ],
  },
}

export async function generateStaticParams() {
  return Object.keys(pages).map(slug => ({ slug }))
}

export async function generateMetadata({ params }: { params: { slug: string } }): Promise<Metadata> {
  const p = pages[params.slug]
  if (!p) return {}
  return {
    title: `${p.title} | Redgrow`,
    description: p.metaDescription,
    alternates: { canonical: `https://redgrow.app/for/${p.slug}` },
    openGraph: {
      title: p.title,
      description: p.metaDescription,
      url: `https://redgrow.app/for/${p.slug}`,
      images: [{ url: 'https://redgrow.app/og-image.png', width: 1200, height: 628 }],
    },
  }
}

export default function ForPage({ params }: { params: { slug: string } }) {
  const p = pages[params.slug]
  if (!p) notFound()

  return (
    <div className="lp">
      <nav className="nav" style={{ position: 'relative', borderBottom: '1px solid var(--line)' }}>
        <div className="wrap nav-row">
          <Link href="/" className="logo"><span className="logo-mark" /><span>Redgrow</span></Link>
          <div className="nav-links">
            <Link href="/#features">Features</Link>
            <Link href="/#pricing">Pricing</Link>
            <Link href="/blog">Blog</Link>
          </div>
          <div className="nav-cta">
            <Link href="/login" className="login">Login</Link>
            <Link href="/login?mode=signup" className="btn btn-primary btn-sm">Get started <span className="arr">→</span></Link>
          </div>
        </div>
      </nav>

      {/* HERO */}
      <section style={{ paddingTop: '72px', paddingBottom: '64px' }}>
        <div className="narrow">
          <div className="section-num"><span><strong>Redgrow</strong> — {p.eyebrow}</span></div>
          <h1 style={{ fontSize: 'clamp(30px,4.2vw,56px)', marginTop: '14px', letterSpacing: '-.03em' }}>{p.headline}</h1>
          <p style={{ fontSize: '19px', marginTop: '22px', borderTop: '1px solid var(--line)', paddingTop: '22px', maxWidth: '52ch', color: 'var(--ink-2)', lineHeight: 1.6 }}>{p.subheadline}</p>
          <div style={{ marginTop: '28px' }}>
            <Link href="/login?mode=signup" className="btn btn-primary">Try Redgrow free <span className="arr">→</span></Link>
          </div>
        </div>
      </section>

      {/* SECTIONS */}
      {p.sections.map((section, i) => (
        <section key={i} style={{ paddingTop: '56px', paddingBottom: '56px', background: i % 2 === 1 ? 'var(--paper)' : undefined, borderTop: '1px solid var(--line)', ...(i % 2 === 1 ? { borderBottom: '1px solid var(--line)' } : {}) }}>
          <div className="narrow">
            <div className="eyebrow" style={{ marginBottom: '12px' }}>{section.eyebrow}</div>
            <h2 style={{ fontSize: 'clamp(24px,3vw,38px)', letterSpacing: '-.025em', maxWidth: '24ch' }}>{section.heading}</h2>
            <div style={{ marginTop: '24px', display: 'flex', flexDirection: 'column', gap: '16px', maxWidth: '56ch' }}>
              {section.body.map((para, j) => (
                <p key={j} style={{ fontSize: '16.5px', color: 'var(--ink-2)', lineHeight: 1.65 }}>{para}</p>
              ))}
            </div>
          </div>
        </section>
      ))}

      {/* TACTICS */}
      {p.tactics && (
        <section style={{ paddingTop: '56px', paddingBottom: '64px', borderTop: '1px solid var(--line)' }}>
          <div className="narrow">
            <div className="eyebrow" style={{ marginBottom: '12px' }}>Tactics</div>
            <h2 style={{ fontSize: 'clamp(24px,3vw,38px)', letterSpacing: '-.025em' }}>What to do — step by step.</h2>
            <div style={{ marginTop: '36px', display: 'flex', flexDirection: 'column', gap: '28px' }}>
              {p.tactics.map((t, i) => (
                <div key={i} style={{ display: 'grid', gridTemplateColumns: '48px 1fr', gap: '20px', alignItems: 'start' }}>
                  <div style={{ fontSize: '13px', fontWeight: 700, color: 'var(--orange)', fontVariantNumeric: 'tabular-nums', paddingTop: '3px' }}>{t.number}</div>
                  <div>
                    <div style={{ fontSize: '16px', fontWeight: 600, color: 'var(--ink)', marginBottom: '6px' }}>{t.heading}</div>
                    <p style={{ fontSize: '15px', color: 'var(--ink-2)', lineHeight: 1.65, margin: 0 }}>{t.body}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* CALLOUT */}
      <section style={{ paddingTop: '56px', paddingBottom: '56px', borderTop: '1px solid var(--line)' }}>
        <div className="narrow">
          <div style={{ padding: '32px 36px', background: 'var(--ink)', borderRadius: 'var(--r-lg)', position: 'relative', overflow: 'hidden' }}>
            <div style={{ position: 'absolute', inset: 0, background: 'radial-gradient(ellipse at 20% 50%, rgba(229,75,27,.18), transparent 60%)', pointerEvents: 'none' }} />
            <p style={{ fontSize: '17px', color: 'rgba(251,246,238,.85)', lineHeight: 1.65, maxWidth: '52ch', position: 'relative', zIndex: 1, margin: 0 }}>{p.callout}</p>
            <div style={{ marginTop: '22px', position: 'relative', zIndex: 1 }}>
              <Link href="/login?mode=signup" className="btn btn-orange">Try Redgrow free <span className="arr">→</span></Link>
            </div>
          </div>
        </div>
      </section>

      {/* RELATED */}
      <section style={{ paddingTop: '40px', paddingBottom: '64px', borderTop: '1px solid var(--line)' }}>
        <div className="narrow">
          <div className="eyebrow" style={{ marginBottom: '20px' }}>Related reading</div>
          <div style={{ display: 'flex', flexDirection: 'column' }}>
            {p.related.map(r => (
              <Link key={r.href} href={r.href} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '16px 0', borderTop: '1px solid var(--line)', fontSize: '15.5px', color: 'var(--ink)', fontWeight: 500 }}>
                {r.label}
                <span style={{ color: 'var(--orange)', flexShrink: 0, marginLeft: 16 }}>→</span>
              </Link>
            ))}
            <div style={{ borderTop: '1px solid var(--line)' }} />
          </div>
        </div>
      </section>

      <footer className="lp-footer">
        <div className="wrap foot-bottom" style={{ marginTop: 0, paddingTop: '24px' }}>
          <div>© 2026 Redgrow</div>
          <div style={{ display: 'flex', gap: '24px', fontSize: '14px' }}>
            <Link href="/privacy">Privacy</Link>
            <Link href="/terms">Terms</Link>
            <Link href="/contact">Contact</Link>
          </div>
        </div>
      </footer>
    </div>
  )
}
