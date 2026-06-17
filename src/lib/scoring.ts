import { z } from "zod";
import type { StageState } from "@/lib/use-cascade";
import { STAGE_BY_ID } from "@/lib/stages";

// The scoring loop: once a cascade completes, a separate Claude "critic" pass
// scores it against a launch-doc rubric and returns concrete, per-stage
// feedback. The user can then trigger an "Improve" pass that re-cascades with
// this feedback woven into each stage — and watch the score climb.

export const scoreSchema = z.object({
  overall: z
    .number()
    .min(0)
    .max(100)
    .describe("Holistic 0–100 quality score for the whole launch stack."),
  verdict: z
    .string()
    .describe("One punchy sentence summarizing the quality and the biggest lever."),
  dimensions: z
    .array(
      z.object({
        name: z.string(),
        score: z.number().min(0).max(100),
        note: z.string().describe("One concrete sentence justifying the score."),
      }),
    )
    .describe("Score per rubric dimension."),
  stages: z
    .array(
      z.object({
        id: z.enum(["gtm", "brief", "brd", "content"]),
        score: z.number().min(0).max(100),
        feedback: z
          .string()
          .describe(
            "The single most impactful, specific change to make this stage better next pass.",
          ),
      }),
    )
    .describe("Score + actionable feedback for each of the four stages."),
});

export type ScoreResult = z.infer<typeof scoreSchema>;

export const SCORE_SYSTEM = `You are a ruthless but fair senior go-to-market and brand reviewer at a top
fintech. You are grading a four-part launch stack produced by an AI: a
Go-to-Market plan, a Creative Brief, a BRD, and Media & Content ideas.

Score each rubric dimension and the whole stack from 0–100. Calibrate honestly:
- 90–100: exceptional, ship it as-is.
- 75–89: strong, a few real gaps.
- 60–74: usable but clearly needs work.
- below 60: weak, generic, or inconsistent.
Most first drafts land 65–82. Do NOT inflate. A 95+ should be rare.

Rubric dimensions (use exactly these names):
- "Strategic clarity" — is the positioning sharp and the strategy coherent and non-obvious?
- "Cross-stage alignment" — do the brief, BRD, and content faithfully reflect the GTM plan's positioning, ICP, channels, and metrics? Penalize drift or contradictions hard — this is the whole point of a cascade.
- "Specificity & actionability" — concrete, decision-grade content vs. generic AI filler?
- "On-brand voice" — does it match the reference document's voice/facts (if one was provided)? If none was provided, judge tone consistency across stages.
- "Completeness" — are all expected sections present and meaningfully filled (not placeholder-y)?

For each stage, give the single most impactful, specific improvement for the next
pass — name what to change, not vague praise. Be concrete enough that a rewrite
guided only by your feedback would clearly score higher.`;

export function buildScoreContext(args: {
  concept: string;
  referenceDoc?: string;
  stages: StageState[];
}): string {
  const { concept, referenceDoc, stages } = args;
  const parts: string[] = [];
  parts.push(`# PRODUCT CONCEPT\n${concept.trim()}`);
  if (referenceDoc && referenceDoc.trim()) {
    parts.push(`# REFERENCE DOCUMENT (voice/facts to match)\n${referenceDoc.trim()}`);
  }
  parts.push(`# THE LAUNCH STACK TO GRADE`);
  for (const s of stages) {
    parts.push(`## ${STAGE_BY_ID[s.id].title}\n${s.output.trim() || "(empty)"}`);
  }
  parts.push(
    `# NOW GRADE IT\nReturn scores and concrete per-stage feedback per your instructions.`,
  );
  return parts.join("\n\n---\n\n");
}

/** Tailwind color band for a 0–100 score. Classes are written as literals so
 *  Tailwind's scanner generates them (don't build these by string concat). */
export function scoreBand(score: number): {
  text: string;
  stroke: string;
  bar: string;
  label: string;
} {
  if (score >= 90)
    return {
      text: "text-emerald-400",
      stroke: "stroke-emerald-400",
      bar: "bg-emerald-400",
      label: "Excellent",
    };
  if (score >= 75)
    return {
      text: "text-brand",
      stroke: "stroke-brand",
      bar: "bg-brand",
      label: "Strong",
    };
  if (score >= 60)
    return {
      text: "text-amber-400",
      stroke: "stroke-amber-400",
      bar: "bg-amber-400",
      label: "Needs work",
    };
  return {
    text: "text-destructive",
    stroke: "stroke-destructive",
    bar: "bg-destructive",
    label: "Weak",
  };
}
