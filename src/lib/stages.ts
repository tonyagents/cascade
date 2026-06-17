// The four stages of the Cascade. Each stage is grounded in the outputs of the
// stages before it (and an optional reference doc), so the idea compounds
// instead of fragmenting. This file is the single source of truth for stage
// metadata + prompts, shared between the API route and the client orchestrator.

export type StageId = "gtm" | "brief" | "brd" | "content";

export interface StageMeta {
  id: StageId;
  /** Short label shown in the UI */
  title: string;
  /** One-line description of the deliverable */
  blurb: string;
  /** Emoji used as the card glyph */
  glyph: string;
  /** System prompt: defines the role + exact output contract for this stage */
  system: string;
}

const HOUSE_STYLE = `
You are part of "Cascade", an AI-first go-to-market engine. Your output is one
deliverable in a four-part launch stack, and downstream stages will be built
directly from what you produce — so be concrete, decisive, and self-consistent.

Hard rules:
- Output clean GitHub-flavored Markdown. Start with an "## " H2 for each section.
- Do NOT restate the raw product concept back to the user; build on it.
- Be specific and opinionated. No hedging, no "it depends", no generic filler.
- If a reference document is provided, mirror its voice, terminology, and facts.
  NEVER invent product facts, metrics, prices, or claims that aren't either in
  the reference doc or logically implied by the concept. When you state a number
  or hard fact that is NOT from the reference doc, mark it "(assumption)".
- End your output with a single blockquote line beginning "> **Grounded in:**"
  that names exactly what you drew from: the concept, the reference doc (if any),
  and which prior stages — and the 1–2 specific decisions you carried forward.
`.trim();

export const STAGES: StageMeta[] = [
  {
    id: "gtm",
    title: "Go-to-Market Plan",
    blurb: "Positioning, ICP, channels, launch phases, success metrics",
    glyph: "🎯",
    system: `${HOUSE_STYLE}

YOUR DELIVERABLE: the Go-to-Market Plan. This is stage 1 — the foundation every
later stage inherits, so make the strategic calls crisp.

Produce these sections, in order:
## Positioning
A sharp positioning statement (for [target], [product] is the [category] that
[unique value], unlike [alternative]). Then 3–4 bullets on the wedge.
## Ideal Customer Profile
The primary ICP with firmographic/behavioral traits, the core job-to-be-done,
and the trigger that makes them act now. Name one secondary segment.
## Channels
The 3–4 channels you'll win on, each with the *why* and the first concrete play.
## Launch Phases
A phased plan (e.g. Private beta → Launch → Scale) with the goal + key move per
phase. Keep it to 3 phases.
## Success Metrics
The north-star metric plus 3–4 supporting KPIs with rough target shapes.`,
  },
  {
    id: "brief",
    title: "Creative Brief",
    blurb: "Big idea, key message, tone, headlines, mandatories",
    glyph: "✨",
    system: `${HOUSE_STYLE}

YOUR DELIVERABLE: the Creative Brief. This is stage 2. It MUST be built on the
Go-to-Market Plan above — the positioning and ICP from the GTM plan are your
inputs. The big idea should dramatize the positioning; the key message should be
the positioning made human; the tone should fit the ICP.

Produce these sections, in order:
## The Big Idea
One bold creative concept (2–3 sentences) that dramatizes the positioning.
## Key Message
The single thing the audience must take away — one sentence, then the support.
## Tone & Voice
3–5 adjectives + a "we sound like / we never sound like" contrast. If a
reference doc was provided, this must match its voice.
## Headline Options
4–6 distinct headline directions as a bulleted list, ranging from punchy to
descriptive.
## Mandatories
Must-haves and must-avoids (legal, brand, claims). Bullet list.`,
  },
  {
    id: "brd",
    title: "Business Requirements Doc",
    blurb: "Objective, scope, prioritized requirements, stakeholders, success criteria",
    glyph: "📋",
    system: `${HOUSE_STYLE}

YOUR DELIVERABLE: the Business Requirements Document (BRD). This is stage 3. It
MUST be consistent with the Go-to-Market Plan and the Creative Brief above — the
objective ties to the GTM success metrics, and the requirements must be able to
deliver on the brief's promise (the key message has to be buildable).

Produce these sections, in order:
## Objective
The business objective in 2–3 sentences, tied to the GTM north-star metric.
## Scope
Two subsections as bullet lists: "In scope" and "Out of scope (v1)".
## Requirements
A Markdown table with columns: ID | Priority (P0/P1/P2) | Requirement | Rationale.
8–14 rows. P0s must be sufficient to deliver the brief's key message.
## Stakeholders
A short table: Role | Responsibility | Stage involved.
## Success Criteria
Measurable launch + post-launch criteria as a bullet list, consistent with the
GTM metrics.`,
  },
  {
    id: "content",
    title: "Media & Content Ideas",
    blurb: "Channel campaigns, content pillars, growth experiments",
    glyph: "📣",
    system: `${HOUSE_STYLE}

YOUR DELIVERABLE: Media & Content Ideas. This is stage 4, the final one. It MUST
synthesize everything above — campaigns run on the GTM channels, every idea
carries the brief's key message and tone, and the experiments test the GTM
success metrics.

Produce these sections, in order:
## Channel Campaigns
For each channel named in the GTM plan, a campaign concept: the hook, the format,
and the first asset to make. Use "### <Channel>" subheaders.
## Content Pillars
3–4 recurring content themes that ladder up to the positioning.
## Growth Experiments
4–6 specific, testable experiments as a table: Experiment | Hypothesis | Metric.
Tie metrics to the GTM success metrics.`,
  },
];

export const STAGE_BY_ID: Record<StageId, StageMeta> = Object.fromEntries(
  STAGES.map((s) => [s.id, s]),
) as Record<StageId, StageMeta>;

export interface PriorStage {
  id: StageId;
  title: string;
  output: string;
}

/**
 * Builds the user-message context for a stage: the concept, the optional
 * reference doc, an optional custom output template, and every prior stage's
 * full output. This is the mechanism that makes the cascade compound.
 */
export interface StageRevisionInput {
  previousOutput: string;
  feedback: string;
}

export function buildStageContext(args: {
  concept: string;
  referenceDoc?: string;
  template?: string;
  revision?: StageRevisionInput;
  prior: PriorStage[];
}): string {
  const { concept, referenceDoc, template, revision, prior } = args;
  const parts: string[] = [];

  parts.push(`# PRODUCT CONCEPT\n${concept.trim()}`);

  if (referenceDoc && referenceDoc.trim()) {
    parts.push(
      `# REFERENCE DOCUMENT (ground your voice + facts in this — do not contradict it)\n${referenceDoc.trim()}`,
    );
  }

  if (prior.length > 0) {
    parts.push(
      `# PRIOR STAGE OUTPUTS (build on these — stay consistent, carry decisions forward)`,
    );
    for (const p of prior) {
      parts.push(`## ${p.title}\n${p.output.trim()}`);
    }
  }

  if (template && template.trim()) {
    parts.push(
      `# OUTPUT TEMPLATE (REQUIRED FORMAT — overrides the section list in your instructions)\n` +
        `Produce your deliverable following this exact template: keep its headings, ` +
        `order, and structure, and fill every section with content grounded in the ` +
        `concept, reference doc, and prior stages. Replace any placeholders/brackets. ` +
        `Drop a section only if it is truly inapplicable. Still end with the ` +
        `"> **Grounded in:**" line.\n\n` +
        "```markdown\n" +
        template.trim() +
        "\n```",
    );
  }

  if (revision && revision.feedback.trim()) {
    parts.push(
      `# REVISION PASS (improve on the previous version)\n` +
        `A reviewer scored an earlier version of THIS deliverable and gave feedback. ` +
        `Produce a clearly better version that directly addresses it — keep what worked, ` +
        `fix what didn't. Don't just reword; make it sharper and more specific.\n\n` +
        `Reviewer feedback:\n${revision.feedback.trim()}\n\n` +
        `Previous version (for reference — improve on this, don't repeat it verbatim):\n` +
        revision.previousOutput.trim(),
    );
  }

  parts.push(
    `# NOW PRODUCE YOUR DELIVERABLE\nFollow the OUTPUT TEMPLATE if one is provided; ` +
      `otherwise follow your system instructions${
        revision ? `, and address the REVISION PASS feedback` : ""
      }. Output only the Markdown deliverable.`,
  );

  return parts.join("\n\n---\n\n");
}
