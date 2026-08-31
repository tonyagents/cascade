import type { StageId } from "@/lib/stages";

// Baked-in default templates, derived from Nova's real GTM / Creative Brief /
// BRD formats. These are the canonical structures every document is built from —
// the user doesn't paste them each run; they're pre-filled and applied
// automatically. The runtime template UI starts from these, so they can still be
// tweaked for a one-off without changing the baseline.
//
// They are structural skeletons with [placeholders] + inline guidance — no
// instance-specific facts or names. Real company facts/voice come from the
// optional reference-doc field at run time.
//
// Leave a stage as an empty string to fall back to Cascade's built-in section
// structure for that stage (the `content` stage has no provided template).

const GTM_TEMPLATE = `## Thesis
[1–2 sentence thesis: the macro shift this product rides and the one-line claim for what we're building. State it with conviction.]

## Why Now
[What changed recently — tech, market, or regulatory — that opens this window, and why the window is narrow. Name the first-mover risk.]

## Positioning
**Core message:** [The single line we lead with — e.g. "Give your [audience] the ability to [outcome]."]

[2–3 sentences expanding what the product does and who it lets participate.]

**Competitive positioning:** [Why each adjacent category falls short, and how we fill every gap.]

**Moat:** [The structural advantages a competitor would have to rebuild — licenses, scale, distribution, existing user base.]

## Target User & Hero Use Case
**Initial wedge:** [The specific beachhead segment to win first, then the expansion path.]

**Hero use case — "[memorable name]":** [The flagship workflow. How it should feel: useful, autonomous, conversational, inevitable.]

## GTM Strategy — Growth Pillars
1. **[Pillar]** — [the play, and the unit of distribution]
2. **[Pillar]** — [the play]
3. **[Pillar]** — [the play]
4. **[Pillar]** — [the play]

## Activation & Product Loops
[The biggest activation risk and how onboarding mitigates it. List the starter templates / first actions. State activation targets, e.g. time-to-first-value and % completing a key action in session one.]

Core loops:
- **[Loop name]** — [how it drives growth or retention]
- **[Loop name]** — [...]

## 90-Day Targets
| Metric | Day 90 Goal |
| --- | --- |
| [Installs / signups] | [target] |
| [Activation / first-action rate] | [target] |
| [Weekly active users] | [target] |
| [Volume / revenue] | [target] |
| [Recurring / retention metric] | [target] |

## Roadmap
- **Phase 1 — [name]:** [scope]. Goal: [outcome].
- **Phase 2 — [name]:** [scope]. Goal: [outcome].
- **Phase 3 — [name]:** [scope]. Goal: [outcome].

## Business Model & Vision
[How revenue is driven and why the product compounds it over time. Close with the longer-term vision.]`;

const BRIEF_TEMPLATE = `## Due Date
- **Desired due date:** [date]
- **Go-live date:** [date]

## Deliverables
- **Type:** [2D Static, 2D Motion, 3D, Web Design, etc.]
- **Intended use / channels:** [X, LinkedIn, IG, Email, etc.]
- **Number & sizes:**
  - [Hero Static — e.g. 1080x1080, 1080x1350, 1920x1080, 1080x1920]
  - [Step-by-step Static — size]
  - [Hero Video — e.g. 1920x1080, 1080x1920]
- **File formats:** [jpg, png, gif, mp4]
- **Additional specs:** [max file size, DPI, resolution — or n/a]

## Design Direction
- **Main message:** [the single line — punchy, natural-language framing]
- **Message hierarchy:**
  - [headline]
  - [supporting line]
  - ["here's what it does" — short feature list]
  - [CTA]
- **Main value prop to showcase:** [the core thing to demonstrate, plus the fast path to show, e.g. Download → Setup → Automate → Execute]
- **Key creative showcase:** [the specific actions / outcomes to feature]
- **Main audience:** [who]
- **Tone / voice:** [adjectives — keep Nova's voice: agentic, smart, crypto-native]
- **Visual references / inspiration:** [links + 1–2 lines of product context]

## Contained Assets
[Logos, graphics, imagery to include — e.g. brand logo, mascot.]

## Copy
**VIDEO**
[Title]
[Subtitle]
[CTA / link]

**STATIC**
[Headline]
[Supporting line]

**ACTION STATIC**
[A short, conversational agent exchange that demonstrates the hero use case end to end.]

**STEP BY STEP STATIC**
[A numbered 5-step "get started" sequence.]

## Notes
[Anything helpful to complete the work; where to ask for more info.]

## DRI
[Who reviews and approves the work — role/owner.]`;

const BRD_TEMPLATE = `## Overview
- **DRI:** [owner / role]
- **Target launch date:** [date]
- **Target code review date:** [date]

[1–2 sentence description of what this is and who it's for.]

## Stakeholders' Sign-Off
| Name | Team | Requirements Captured | Requirements Addressed | Notes |
| --- | --- | --- | --- | --- |
| [owner] | Product (DRI) | Yes/No | Yes/No | [notes] |
| [owner] | Legal | | | |
| [owner] | Data Privacy | | | |
| [owner] | Compliance & Risk | | | |
| [owner] | Product Security | | | |
| [owner] | Infrastructure / SRE | | | |
| [owner] | GTM | | | |
| [owner] | Web | | | |
| [owner] | CX | | | |

## Narrative
### Problem
[What exists today, the traction/evidence so far, and the specific gaps or opportunities this addresses.]

### Solution
[The foundational principles this builds on, and concretely what the product does to solve the problem.]

## User Journey (incl. Demos)
[End-to-end flow, step by step, with demo references where relevant.]
1. **[Step]** — [what happens under the hood]
2. **[Step]** — [...]
3. **[Step]** — [...]

## TDD / Code
- [Link to technical design doc]
- [Link to code repo]

## Cross-Functional Requirements
For each function: go-live requirements, open questions, and whether approvals are needed.

**Legal** — Go-live requirements: [...]. Risk Committee approval needed? [Y/N]

**Data Privacy** — Go-live requirements: [...]

**Compliance & Risk** — Go-live requirements: [...]. Open questions: [...]

**Product Security** — Go-live requirements: [...]

**Infrastructure / SRE** — Go-live requirements: [...]

**GTM** — [Target persona? Success metrics laddering to baseline? Partnership/co-marketing angles?]

**Web** — Go-live requirements: [...]

**CX** — Go-live requirements: [Help Center updates, download link, escalation channel, platform scope]

## To Do
- [Open task]
- [Open task]`;

export const DEFAULT_TEMPLATES: Partial<Record<StageId, string>> = {
  gtm: GTM_TEMPLATE,
  brief: BRIEF_TEMPLATE,
  brd: BRD_TEMPLATE,
  content: ``,
};
