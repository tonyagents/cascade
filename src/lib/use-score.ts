"use client";

import { useCallback, useState } from "react";
import type { ScoreResult } from "@/lib/scoring";
import type { StageState } from "@/lib/use-cascade";

export interface UseScore {
  score: ScoreResult | null;
  scoring: boolean;
  error: string | null;
  run: (payload: {
    concept: string;
    referenceDoc?: string;
    stages: StageState[];
  }) => Promise<void>;
  reset: () => void;
}

export function useScore(): UseScore {
  const [score, setScore] = useState<ScoreResult | null>(null);
  const [scoring, setScoring] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const run = useCallback<UseScore["run"]>(async (payload) => {
    setScoring(true);
    setError(null);
    setScore(null);
    try {
      const res = await fetch("/api/score", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (!res.ok) {
        setError((await res.text().catch(() => "")) || "Scoring failed.");
        return;
      }
      setScore((await res.json()) as ScoreResult);
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setScoring(false);
    }
  }, []);

  const reset = useCallback(() => {
    setScore(null);
    setError(null);
    setScoring(false);
  }, []);

  return { score, scoring, error, run, reset };
}
