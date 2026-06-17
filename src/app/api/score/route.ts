import { anthropic } from "@ai-sdk/anthropic";
import { generateObject } from "ai";
import { NextRequest } from "next/server";
import { buildScoreContext, SCORE_SYSTEM, scoreSchema } from "@/lib/scoring";
import type { StageState } from "@/lib/use-cascade";

export const runtime = "nodejs";
export const maxDuration = 60;

const MODEL = process.env.CASCADE_MODEL ?? "claude-sonnet-4-6";

interface ScoreRequest {
  concept: string;
  referenceDoc?: string;
  stages: StageState[];
}

export async function POST(req: NextRequest) {
  if (!process.env.ANTHROPIC_API_KEY) {
    return new Response("ANTHROPIC_API_KEY is not set.", { status: 500 });
  }

  let body: ScoreRequest;
  try {
    body = (await req.json()) as ScoreRequest;
  } catch {
    return new Response("Invalid JSON body", { status: 400 });
  }

  const { concept, referenceDoc, stages } = body;
  if (!concept?.trim() || !stages?.length) {
    return new Response("concept and stages are required", { status: 400 });
  }

  try {
    const { object } = await generateObject({
      model: anthropic(MODEL),
      schema: scoreSchema,
      system: SCORE_SYSTEM,
      prompt: buildScoreContext({ concept, referenceDoc, stages }),
      temperature: 0.3,
    });
    return Response.json(object);
  } catch (err) {
    const msg =
      err instanceof Error ? err.message : "Scoring failed. Please retry.";
    return new Response(msg.slice(0, 300), { status: 502 });
  }
}
