# Future Features - legends.guide

## The Problem We Solve
People feel lost and need guidance. They're facing real problems in life (career, relationships, money, purpose, discipline) and need premium mentorship from history's greatest minds on the exact problem they're facing. The product brings dead legends back to life as personalized mentors.

**Target users:** Ambitious 18-35 year olds who consume self-improvement content, listen to podcasts (Founders, Huberman, Lex Fridman), read biographies, and are actively working through challenges. They're on Reddit (r/entrepreneur, r/selfimprovement, r/davidsenra), Twitter/X, and YouTube.

## Distribution & Growth Loops

### Organic / Free
- [ ] X/Twitter: Automated accounts per legend (1-2 quotes/day with legends.guide watermark)
- [ ] WhatsApp channels: Daily wisdom drops per legend
- [ ] TikTok/Reels: HeyGen AI video clips of legends giving advice, watermarked CTA
- [ ] Reddit: Value-first posts in r/entrepreneur, r/selfimprovement, r/davidsenra, r/stoicism (answer questions, naturally mention product)
- [ ] SEO blog posts: Each legend writes on trending topics ("Rockefeller's advice on saving money")
- [ ] Wisdom card share system: Shareable 9:16 vertical quote cards with watermark (BUILT)
- [ ] Podcast episodes with legends (AI-generated audio conversations)
- [ ] Embeddable "Ask [Legend]" widget for blogs/websites (like YouTube embeds)
- [ ] Trending news + legend commentary = viral wisdom cards

### Referral & Viral
- [ ] Double-sided referral: "Give a friend 5 free messages, get 5 yourself"
- [ ] Share button generates watermarked media that points back to product (BUILT)
- [ ] Every AI-generated image/video/audio has legends.guide watermark
- [ ] User reviews/testimonials as social proof
- [ ] Show interaction count per legend (social proof: "47,000 conversations")
- [ ] User can like/favorite a legend (Character.ai style engagement)

### Paid (after unit economics proven)
- [ ] Facebook/Instagram ads targeting self-improvement audiences
- [ ] Google Ads on long-tail biography queries

### Partnerships
- [ ] David Senra / Founders Podcast: Offer to be his "AI guy," build the AI version of Sage
- [ ] NS.com beta testing community
- [ ] Biography authors: Partner for authentic legend data

## Product Features

### Voice Call a Legend
- [ ] Real-time voice call with a legend (WebRTC + ElevenLabs streaming)
- [ ] Phone-like UI: dial, ring, pick up, talk in real-time
- [ ] Premium feature: voice calls cost 3x text credits
- [ ] Could use OpenAI Realtime API or ElevenLabs Conversational AI

### Engagement (Character.ai inspired)
- [ ] Like/heart a legend's response
- [ ] Show total interactions per legend ("12,847 conversations")
- [ ] Show total likes per legend
- [ ] User favorites / "my mentors" list
- [ ] Legend leaderboard: most popular, highest rated

### Media & Content
- [ ] HeyGen lip-sync video avatars for each legend
- [ ] Word-by-word highlighting synced to TTS audio playback
- [ ] Hover-to-preview voice on landing page
- [ ] Digital avatar lip-sync (like Grok's Annie) via HeyGen/D-ID/Synthesia
- [ ] Video export of conversations for sharing
- [ ] Legend-to-legend conversations (2 legends debate a topic)

### UX
- [ ] Smart router chatbot: "tell me your problem" -> matches to right legend (BUILT)
- [ ] Choose-your-own-adventure branching conversations
- [ ] Shadcn UI components for premium feel
- [ ] Framer Motion animations throughout
- [ ] Customer feedback: 5-star rating + "why not a 5?" survey
- [ ] Admin dashboard for feedback/analytics priority list

### AI & Voice
- [ ] Nail voice quality per legend (unique speech patterns, not generic Claude)
- [ ] ElevenLabs voice clones from real audio (for legends with recordings)
- [ ] Modular LLM backend: currently Claude, but swappable to GPT/Gemini/etc via AI_CONFIG
- [ ] Per-legend text style guides to prevent Claude voice leaking through

## Legends Pipeline

### Deep Research Workflow
Each new legend should go through deep research before being added:
1. Use Claude's deep research to create a `legends/{slug}.md` file
2. The legend.md contains: full biography, speech patterns, sourced quotes, knowledge base from 8-10 books/sources
3. Sources should cite specific books, chapters, and page references
4. Example: "The Book of Elon" by Eric Jorgenson should be sourced for Elon Musk

### Book Finder Tool Idea
Standalone tiny internet product: input a book title, it searches the web, finds the book, downloads the PDF, converts to markdown. Like cobalt.tools but for books. Useful as a utility and for legend research.

### Active Legends (6)
1. John D. Rockefeller (wealth, discipline)
2. Benjamin Franklin (self-improvement, reinvention)
3. Elon Musk (first principles, speed)
4. Alexander the Great (conquest, ambition)
5. David Deutsch (physics, epistemology)
6. Lee Kuan Yew (nation-building, pragmatism)

### Archived (ready to re-add with deeper prompts)
- Peter Thiel (contrarian thinking, monopoly)
- Genghis Khan (meritocracy, empire)
- Napoleon Bonaparte (strategy, law)
- Michael Jordan (competition, excellence)

### Future Legends to Research
- Steve Jobs (Isaacson bio)
- Jeff Bezos (Everything Store, Invent and Wander)
- Jensen Huang (The Nvidia Way)
- Charlie Munger (Poor Charlie's Almanack)
- Sam Walton (Made in America)
- Naval Ravikant (Almanack of Naval)
- Einstein (Isaacson bio)
- Leonardo da Vinci (Isaacson bio)
- Marcus Aurelius (Meditations)
- Nikola Tesla
- Socrates
- Jesus of Nazareth
- Buddha (Siddhartha Gautama)
- Cleopatra VII
- Marie Curie
- John Gottman (love/relationships)
- Balaji Srinivasan (network state)
- Lionel Messi
- Cristiano Ronaldo
- "Fictional Legends" tier (later): Son Goku, Monkey D. Luffy

**Principle: Real dead people first. Realness is persuasive. Fictional comes later as a separate tier.**

## Monetization
- [x] Credit packs: $10 for 100 messages (keep it simple)
- [x] 25 free messages before paywall
- [ ] Stripe webhook signature validation for production
- [ ] Usage analytics per user
- [ ] Voice mode as premium upsell ($29 for 100 voice messages)
- [ ] One-time purchase per legend ($49) -- maybe later
- [ ] Pricing page with anchored tiers (if needed later)

## Content & Research
- [ ] Actual biography PDFs on file (Titan, Zero to One, etc.) for RAG when scaling
- [ ] Per-legend text style guides
- [ ] User-submitted legend requests
- [ ] User ratings per legend to improve quality

## Technical
- [ ] Vercel Analytics + PostHog funnel tracking
- [ ] Google Search Console + sitemap submission
- [ ] Measure and maximize SEO score
- [ ] n8n automation for X posting
- [ ] Conversation persistence (database)
- [ ] Supabase + pgvector RAG when scaling to 50+ founders
- [ ] Web search integration for real-time knowledge
- [ ] Modular LLM: AI_CONFIG already abstracts provider/model (BUILT)

## Competitive Intelligence

### Character.ai Features to Swipe
- Like/heart responses
- Interaction counts per character ("2.3M chats")
- User favorites
- Character leaderboard
- Quick voice replies
- Group chats with multiple characters

### Competitors to Study
- Sage (David Senra's AI, $200/yr, Founders Podcast)
- Character.ai (free, massive scale, entertainment focus)
- Delphi.ai (digital clones)
- Historical Figures Chat (basic GPT wrappers)

### Market Positioning
Go where similar products' users already are. Find leads lists for:
- Sage users / Founders Podcast listeners
- Character.ai power users interested in historical figures
- Self-improvement Reddit communities
- Biography podcast audiences

## Distribution Channels (Ranked by Priority)
1. TikTok/Reels - wisdom clips with watermark (free, viral potential)
2. SEO - "rockefeller advice on money" long-tail (free, compounds)
3. X/Twitter sharing - wisdom cards + legend accounts (free, network effects)
4. Reddit - value-first engagement in niche subs (free, targeted)
5. WhatsApp channels - daily wisdom (free, retention)
6. Referral loop - give/get free messages (free, viral)
7. HeyGen videos - AI-generated legend videos (low cost, high virality)
8. Paid ads - Facebook/Instagram (after unit economics proven)
9. Partnerships - David Senra, NS.com, biography authors

## Key Insight
"Nail it before you scale it." Focus on 6 legends with deep, authentic prompts. Get the voice right. Get distribution right. Then expand.
