"use client";

import { useCallback, useRef, useState } from "react";
import { STAGES, type PriorStage, type StageId } from "@/lib/stages";

export type StageStatus = "idle" | "queued" | "streaming" | "done" | "error";

export interface StageState {
  id: StageId;
  status: StageStatus;
  output: string;
  error?: string;
}

function initialStages(): StageState[] {
  return STAGES.map((s) => ({ id: s.id, status: "idle", output: "" }));
}

export type StageTemplates = Partial<Record<StageId, string>>;

export interface StageRevision {
  previousOutput: string;
  feedback: string;
}

export interface RunOptions {
  referenceDoc?: string;
  templates?: StageTemplates;
  /** Per-stage revision guidance for an "Improve" pass. */
  revisions?: Partial<Record<StageId, StageRevision>>;
}

export interface UseCascade {
  stages: StageState[];
  running: boolean;
  startedOnce: boolean;
  /** Increments each time a run starts — used to key scoring to a given run. */
  runId: number;
  run: (concept: string, options?: RunOptions) => Promise<void>;
  reset: () => void;
}

/**
 * Orchestrates the four-stage cascade on the client. Stages run strictly in
 * order; each completed stage's output is passed as `prior` to the next, which
 * is what grounds every stage in the ones before it.
 */
export function useCascade(): UseCascade {
  const [stages, setStages] = useState<StageState[]>(initialStages);
  const [running, setRunning] = useState(false);
  const [startedOnce, setStartedOnce] = useState(false);
  const [runId, setRunId] = useState(0);
  const abortRef = useRef<AbortController | null>(null);

  const patch = useCallback((id: StageId, next: Partial<StageState>) => {
    setStages((prev) =>
      prev.map((s) => (s.id === id ? { ...s, ...next } : s)),
    );
  }, []);

  const reset = useCallback(() => {
    abortRef.current?.abort();
    abortRef.current = null;
    setStages(initialStages());
    setRunning(false);
    setStartedOnce(false);
  }, []);

  const run = useCallback(
    async (concept: string, options: RunOptions = {}) => {
      if (!concept.trim()) return;
      const { referenceDoc, templates, revisions } = options;

      abortRef.current?.abort();
      const controller = new AbortController();
      abortRef.current = controller;

      setStartedOnce(true);
      setRunning(true);
      setRunId((n) => n + 1);
      setStages(STAGES.map((s) => ({ id: s.id, status: "queued", output: "" })));

      const completed: PriorStage[] = [];

      try {
        for (const stage of STAGES) {
          if (controller.signal.aborted) return;
          patch(stage.id, { status: "streaming", output: "", error: undefined });

          const res = await fetch("/api/cascade", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              stageId: stage.id,
              concept,
              referenceDoc,
              template: templates?.[stage.id],
              revision: revisions?.[stage.id],
              prior: completed,
            }),
            signal: controller.signal,
          });

          if (!res.ok || !res.body) {
            const msg = await res.text().catch(() => "Request failed");
            patch(stage.id, { status: "error", error: msg });
            // Stop the cascade — later stages depend on this one.
            return;
          }

          const reader = res.body.getReader();
          const decoder = new TextDecoder();
          let acc = "";

          while (true) {
            const { done, value } = await reader.read();
            if (done) break;
            acc += decoder.decode(value, { stream: true });
            patch(stage.id, { output: acc });
          }
          acc += decoder.decode();

          patch(stage.id, { status: "done", output: acc });
          completed.push({
            id: stage.id,
            title: STAGES.find((s) => s.id === stage.id)!.title,
            output: acc,
          });
        }
      } catch (err) {
        if ((err as Error).name === "AbortError") return;
        // Mark whatever stage is mid-flight as errored.
        setStages((prev) =>
          prev.map((s) =>
            s.status === "streaming"
              ? { ...s, status: "error", error: (err as Error).message }
              : s,
          ),
        );
      } finally {
        if (!controller.signal.aborted) setRunning(false);
      }
    },
    [patch],
  );

  return { stages, running, startedOnce, runId, run, reset };
}
