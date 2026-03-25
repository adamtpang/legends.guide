# Future Features - legends.guide

## Voice & Immersion (ElevenLabs API)
- [ ] **Word-synced highlighting** — ElevenLabs returns character-level timestamps via "stream with timing" endpoint. Group chars into words, highlight each as spoken. Karaoke effect.
- [ ] **Professional voice clones** — Source 30+ min of clean audio from speeches/interviews for living legends (Musk, Thiel, Deutsch, LKY). PVC produces near-indistinguishable clones. Requires Scale plan.
- [ ] **Instant voice clones** — 1-5 min audio for quick prototyping. API: `elevenlabs.voices.ivc.create()`
- [ ] **Real-time conversational mode** — ElevenLabs Conversational AI: STT (Scribe, ~80ms) -> LLM -> TTS, sub-500ms end-to-end. True dialogue, not just TTS playback. $0.08/min on Business plan.
- [ ] **Multi-founder debate** — Multi-Context WebSocket streams 2-3 voices simultaneously in Compare view
- [ ] **Voice Design for dead legends** — Generate voices from text descriptions ("deep male 1890s American industrialist, authoritative"). No sample audio needed.
- [ ] **Emotional delivery** — ElevenLabs expressive mode adapts tone to topic. Munger sounds wry, Jobs sounds passionate.
- [ ] Pre-loaded intro voice for each legend ("I am Rockefeller, and I...")
- [ ] Ambient epic music (Gregorian chants, cinematic)
- [ ] Digital avatar lip-sync (like Grok's Annie) — HeyGen/D-ID/Synthesia
- [ ] **Sesame CSM integration** — When Sesame opens production API, integrate for best-in-class voice naturalness. CSM-1B is open-source (Apache 2.0). Long-term play.

## SEO & Discoverability
- [ ] **Programmatic advice pages** — `/advice/{figure}/{topic}` (7 legends x 20 topics = 140+ indexable pages). Pre-rendered Q&A with CTA to chat. HIGHEST ROI SEO action.
- [ ] **FAQ schema markup** — JSON-LD `FAQPage` on each advice page for rich snippets
- [ ] **WebApplication schema** — Homepage structured data
- [ ] **llms.txt** — Plain-text file at root describing site for AI crawlers (GEO)
- [ ] **Google Search Console** — Submit sitemap, request indexing, track impressions/CTR
- [ ] **Bing Webmaster Tools** — Bing feeds ChatGPT Browse
- [ ] **About page** — Explains what legends.guide is (LLMs need this)
- [ ] **Canonical URLs** — Prevent duplicate content
- [ ] Long-tail keywords: "[figure] advice on [topic]", "what would [figure] say about [topic]", "AI chat with [historical figure]"
- [ ] SEO blog posts written by each legend on trending topics

## Distribution & Growth Loops
- [ ] Automated X accounts for each legend (1-2 quotes/day via n8n, link back)
- [ ] Wisdom card share system (shareable quote cards with watermark)
- [ ] HeyGen/AI video clips for TikTok/Reels with watermark CTA
- [ ] Embeddable "Ask [Legend]" widget for blogs/websites (YouTube embed model)
- [ ] Double-sided referral: refer friend who buys = you get 100 free messages (like Whoop)
- [ ] Podcast episodes with legends (AI-generated audio)
- [ ] WhatsApp channels for daily wisdom
- [ ] Trending news + legend commentary = viral wisdom cards
- [ ] QR codes at NS.com: "Lost in life? legends.guide"
- [ ] Product Hunt launch
- [ ] Show HN post
- [ ] Reddit: r/SideProject, r/InternetIsBeautiful, r/Entrepreneur
- [ ] Paid ads (Facebook/Instagram) — after unit economics proven (like SendFame)

## Product
- [ ] Smart router chatbot: "tell me your problem" -> matches to right legend
- [ ] Legend leaderboard: most popular, highest rated, most routed-to
- [ ] Choose-your-own-adventure branching conversations (3 follow-up options)
- [ ] Hover-to-preview voice on landing page
- [ ] Shadcn UI components for premium feel
- [ ] Framer Motion animations throughout
- [ ] Customer feedback: 5-star rating + "why not a 5?" survey
- [ ] Admin dashboard for feedback/analytics priority list
- [ ] User-submitted legend requests
- [ ] Legend stats/accomplishments display (persuasive social proof)
- [ ] Pricing page with anchored tiers (Free / Pro)

## Legends to Add
**Isaacson Collection:**
- [ ] Steve Jobs (Isaacson bio)
- [ ] Einstein (Isaacson bio)
- [ ] Leonardo da Vinci (Isaacson bio)

**Spiritual/Philosophical:**
- [ ] Jesus of Nazareth
- [ ] Socrates
- [ ] Buddha (Siddhartha Gautama)
- [ ] Marcus Aurelius

**Conquerors/Leaders:**
- [ ] Genghis Khan
- [ ] Napoleon Bonaparte
- [ ] Cleopatra VII

**Modern:**
- [ ] Balaji Srinivasan (network state, crypto — NS.com viral potential)
- [ ] Naval Ravikant (leverage, specific knowledge)
- [ ] John Gottman (love/relationships)

**Science/Innovation:**
- [ ] Nikola Tesla
- [ ] Marie Curie

**Fictional Legends (separate tier):**
- [ ] Son Goku
- [ ] Monkey D. Luffy

## Monetization
- [ ] Credit packs ($10 for 100 messages) — 89.5% gross margin
- [ ] Voice as premium upsell ($29 for 100 voice messages)
- [ ] One-time purchase per legend ($49)
- [ ] Stripe webhook signature validation for production
- [ ] Usage analytics per user
- [ ] Price anchoring: "$19/month" next to "$149/year (save 35%)"

## Content & Research
- [ ] Actual biography PDFs on file (Titan, Zero to One, etc.) for RAG
- [ ] ElevenLabs voice clones from real audio (for living legends)
- [ ] Per-legend text style guides to prevent Claude voice leaking through
- [ ] User ratings per legend to improve quality
- [ ] New Legend Playbook (see PLAYBOOK.md)

## Technical
- [ ] PostHog funnel tracking (free tier, 1M events/mo)
- [ ] Conversation persistence (database)
- [ ] Web search integration for real-time knowledge
- [ ] Supabase + pgvector RAG when scaling to 50+ legends

## Voice Cloning Sources (YouTube Search Prompts)
**Peter Thiel:** "Peter Thiel Stanford lecture CS183", "Peter Thiel keynote speech"
**Elon Musk:** "Elon Musk keynote presentation", "Elon Musk SpaceX speech employees"
**David Deutsch:** "David Deutsch TED talk", "David Deutsch lecture constructor theory"
**Lee Kuan Yew:** "Lee Kuan Yew speech National Day", "Lee Kuan Yew last lecture NUS"
*Tip: Use cobalt.tools to download audio, trim to solo speaking segments only.*

## Distribution Channels (Ranked)
1. TikTok/Reels — wisdom clips with watermark (free, viral potential)
2. SEO — programmatic `/advice/` pages (free, compounds over time)
3. X/Twitter — automated legend accounts + wisdom cards (free, network effects)
4. Referral loop — give/get free messages (free, viral)
5. NS.com beta testing + QR codes (free, local)
6. Product Hunt / Show HN / Reddit launches (free, one-time spikes)
7. Paid ads — Facebook/Instagram (after unit economics proven)

## Unit Economics
| Metric | Value |
|---|---|
| Cost per text message | $0.01 |
| Cost per voice message | $0.17 (turbo) |
| Revenue per message ($10/100) | $0.10 |
| Text-only gross margin | 89.5% |
| Profit per 100-msg text pack | $8.95 |
