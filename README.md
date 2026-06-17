# Cascade 🌊

**An AI-first go-to-market engine.** You give it one product idea; it produces the
entire launch stack — and each piece is built from the one before it, so they're
all in sync.

## The problem it kills

Today, getting an idea to launch is a relay race of disconnected docs. A PM
writes a one-pager, marketing writes a creative brief off that, someone drafts a
BRD, the content team brainstorms separately. Different people, different tools,
days of lag — and they drift out of alignment the moment any one of them
changes. **Cascade collapses that chain into a single pass.**

## How it works

You type a concept (e.g. _"a custom ETF creator from pre-stocks,
prediction-market tokens, and perps"_) and it cascades through four deliverables:

1. **Go-to-Market Plan** — positioning, ICP, channels, launch phases, success metrics
2. **Creative Brief** — the big idea, key message, tone, headline options, mandatories
3. **BRD** — objective, scope, prioritized requirements, stakeholders, success criteria
4. **Media & Content Ideas** — channel-specific campaigns and growth experiments

The thing that makes it more than four prompts in a trenchcoat: **each stage is
grounded in the prior stage's output.** The brief reflects the actual positioning
from the GTM plan; the BRD reflects the brief; the content ideas reflect all of
it. The idea compounds instead of fragmenting.

You can optionally **paste a real doc** — a brand guide, a past brief — so every
stage speaks in your actual voice with real facts, not generic AI filler. Output
exports as one sourced Markdown doc.

## Architecture

```
 concept + optional reference doc
        │
        ▼
 ┌──────────────┐   prior output    ┌──────────────┐   prior outputs
 │  Stage 1 GTM │ ────────────────▶ │ Stage 2 Brief│ ───────────▶ … BRD … Content
 └──────────────┘                   └──────────────┘
        │                                  │
        └─────────── streamed to the client, card by card ──────────┘
```

- **`src/lib/stages.ts`** — single source of truth for the four stages: metadata
  + per-stage system prompts + the context builder that threads concept,
  reference doc, and all prior outputs into each call. This is the cascade.
- **`src/app/api/cascade/route.ts`** — streaming route (Vercel AI SDK +
  `@ai-sdk/anthropic`, model `claude-sonnet-4-6`). One stage per request.
  Accepts an optional per-stage `template` so output follows your own format,
  and surfaces provider errors as a real status instead of a blank stream.
- **`src/lib/use-cascade.ts`** — client orchestrator. Runs the four stages
  **strictly in sequence**, feeding each completed output into the next.
- **`src/components/stage-card.tsx`** — the visual waterfall; each card streams
  in, collapsible, with status.
- **`src/lib/export-doc.ts`** — combines all four into one sourced Markdown doc.

## Stack

Next.js 16 (App Router, Turbopack) · React 19 · Vercel AI SDK v6 ·
`@ai-sdk/anthropic` (Claude Sonnet 4.6) · Tailwind v4 · shadcn/ui.

## Run it

```bash
# 1. Add your Anthropic API key
echo 'ANTHROPIC_API_KEY=sk-ant-...' > .env.local

# 2. Install + run
npm install
npm run dev
# open http://localhost:3000
```

Get a key at https://console.anthropic.com/settings/keys.

### Bring your own templates

Click **"Use my own templates"** and paste your real GTM / creative brief / BRD /
content format (Markdown headings, placeholders, sections). Each stage then
follows *your* structure exactly while still being grounded in the prior stages.

## Why it matters for MoonPay

We ship agent products fast, and GTM is the bottleneck that doesn't scale with
eng. Cascade turns the idea → launch-docs cycle from weeks into minutes while
keeping everything consistent — and it's genuinely AI-native.

## Production vision

The same engine wired into the real knowledge base so it grounds in company docs
automatically, with human checkpoints between stages and export straight back to
where the work lives (Notion, Confluence, Drive). The demo proves the loop; the
deployed version plugs into your data.
