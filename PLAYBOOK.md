# New Legend Playbook

Every new legend added to legends.guide must match the quality bar set by Rockefeller. This checklist ensures consistency.

## The Final 7

1. **John D. Rockefeller** — wealth, discipline, monopoly (Titan, 38 Letters to His Son)
2. **Benjamin Franklin** — self-improvement, reinvention (Autobiography, Isaacson bio)
3. **Elon Musk** — first principles, speed (Isaacson bio, Vance bio)
4. **Alexander the Great** — leadership, conquest, ambition (Plutarch, Arrian, Robin Lane Fox bio)
5. **Lee Kuan Yew** — nation-building, pragmatism (From Third World to First, Hard Truths)
6. **David Deutsch** — knowledge, optimism, explanation (The Beginning of Infinity, The Fabric of Reality)
7. **Peter Thiel** — contrarian thinking, monopoly (Zero to One, interviews)

## Phase 1: Research (2-3 hours)

- [ ] Identify 2-3 primary sources (autobiographies, definitive biographies)
- [ ] Identify 2-3 secondary sources (interviews, letters, speeches)
- [ ] Extract 15-20 direct quotes with attribution
- [ ] Document speech patterns, vocabulary, mannerisms, verbal tics
- [ ] Note 5-10 specific life events/decisions they reference often
- [ ] Find their signature quote for the landing page voice preview
- [ ] Identify a distinct ElevenLabs voice (clone or closest preset)

## Phase 2: System Prompt (1-2 hours)

Write each section following the Rockefeller template in `src/lib/figures.ts`:

- [ ] **BIOGRAPHICAL CONTEXT** — Birth, family, key achievements, timeline. Include specific dates, names, and numbers. This is what makes the character feel real.
- [ ] **VOICE & SPEECH PATTERNS** — How they talk, not what they say. Vocabulary level, sentence length, verbal tics, tone. Example: Rockefeller is "taciturn, biblical framing, agricultural metaphors, sphinx-like silence."
- [ ] **YOUR OWN WORDS** — 6-10 real quotes they actually said or wrote. These get woven into responses naturally.
- [ ] **CONVERSATIONAL STYLE** — How they interact. Do they ask questions first? Do they lecture through stories? Are they gentle or harsh? What triggers them?
- [ ] **KNOWLEDGE BASE** — 5-10 deeply researched facts with full source citations. Format: `SOURCE: "Book Title" by Author, Chapter X` followed by the context block. This is what makes citations work.
- [ ] Append the shared `RESPONSE_RULES` constant

## Phase 3: Configuration (30 min)

- [ ] Add figure to the `figures` array in `src/lib/figures.ts`:
  - `slug`: kebab-case (e.g., `marcus-aurelius`)
  - `name`: Full display name
  - `era`: Birth-death years (e.g., "121-180 AD")
  - `hook`: 1-2 sentence description for the landing page card
  - `portrait`: Path to portrait image in `/public/portraits/`
  - `gradient`: Tailwind gradient classes for avatar fallback
  - `color`: Hex color for wisdom cards and OG images
  - `signatureQuote`: Their most famous quote (used for voice preview)
  - `systemPrompt`: The full prompt from Phase 2
- [ ] Add 3 suggested questions in `getSuggestedQuestions()` in chat page
- [ ] Source a high-quality portrait image (public domain or licensed, grayscale works best)
- [ ] Add portrait to `/public/portraits/{slug}.jpg`

## Phase 4: Quality Check (30 min)

- [ ] Chat 10+ messages — does it feel like talking to THEM, not a generic AI?
- [ ] Test: does it stay in character when you try to break it?
- [ ] Test: does it cite sources naturally (not forced)?
- [ ] Test: is the voice/tone distinct from every other legend?
- [ ] Test: ask the same question to 2 different legends — are the answers meaningfully different?
- [ ] Rate 1-5: would YOU pay $10 to have 100 messages with this version?
- [ ] If not a 5, identify what's missing and iterate on the system prompt

## Phase 5: Ship (10 min)

- [ ] Run `npx next build` — verify no errors
- [ ] Test the OG image: visit `/api/og/{slug}` — should render the wisdom card
- [ ] Commit and push
- [ ] Verify on production: landing page shows new legend, chat works, voice preview works

## Quality Bar

The test is simple: **would someone who deeply admires this person feel like they're actually talking to them?**

If Rockefeller fans don't feel like they're getting advice from the man who built Standard Oil — if it feels like generic ChatGPT in a costume — we've failed. The system prompt IS the product.

## Source Material Priority

1. **Autobiographies** — Their own words, in their own voice. Gold standard.
2. **Definitive biographies** — Chernow for Rockefeller, Isaacson for Franklin/Jobs/Musk/da Vinci. These authors spent years researching.
3. **Letters and speeches** — Primary sources reveal speech patterns better than any biography.
4. **Interviews** — For modern figures, long-form interviews (podcasts, TV) capture voice.
5. **Secondary analysis** — Useful for context but don't rely on these for voice/personality.
