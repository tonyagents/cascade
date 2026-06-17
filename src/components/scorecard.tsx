"use client";

import { Loader2, Sparkles, TrendingUp } from "lucide-react";
import { Button } from "@/components/ui/button";
import { scoreBand, type ScoreResult } from "@/lib/scoring";
import { STAGE_BY_ID } from "@/lib/stages";
import type { StageId } from "@/lib/stages";
import { cn } from "@/lib/utils";

function Gauge({ score }: { score: number }) {
  const band = scoreBand(score);
  const r = 34;
  const c = 2 * Math.PI * r;
  const dash = (score / 100) * c;
  return (
    <div className="relative size-24 shrink-0">
      <svg viewBox="0 0 80 80" className="size-full -rotate-90">
        <circle
          cx="40"
          cy="40"
          r={r}
          className="fill-none stroke-muted"
          strokeWidth="7"
        />
        <circle
          cx="40"
          cy="40"
          r={r}
          className={cn("fill-none transition-[stroke-dasharray] duration-1000 ease-out", band.stroke)}
          strokeWidth="7"
          strokeLinecap="round"
          strokeDasharray={`${dash} ${c}`}
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className={cn("font-display text-2xl font-bold leading-none", band.text)}>
          {Math.round(score)}
        </span>
        <span className="text-[0.6rem] font-medium uppercase tracking-wider text-muted-foreground">
          {band.label}
        </span>
      </div>
    </div>
  );
}

function Bar({ score }: { score: number }) {
  const band = scoreBand(score);
  return (
    <div className="h-1.5 w-full overflow-hidden rounded-full bg-muted">
      <div
        className={cn("h-full rounded-full transition-[width] duration-700 ease-out", band.bar)}
        style={{ width: `${score}%` }}
      />
    </div>
  );
}

export function Scorecard({
  score,
  scoring,
  error,
  version,
  delta,
  improving,
  onImprove,
  onRetry,
}: {
  score: ScoreResult | null;
  scoring: boolean;
  error: string | null;
  version: number;
  delta: number | null;
  improving: boolean;
  onImprove: () => void;
  onRetry: () => void;
}) {
  if (scoring) {
    return (
      <div className="animate-fade-up rounded-2xl border border-border/60 bg-card/70 p-5 backdrop-blur-xl">
        <div className="flex items-center gap-2.5 text-sm font-medium">
          <Loader2 className="size-4 animate-spin text-brand" />
          <span className="shimmer-text font-display">Scoring your launch stack…</span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="animate-fade-up rounded-2xl border border-destructive/40 bg-card/70 p-5 backdrop-blur-xl">
        <p className="text-sm text-destructive">Scoring failed: {error}</p>
        <Button variant="outline" size="sm" className="mt-3" onClick={onRetry}>
          Retry scoring
        </Button>
      </div>
    );
  }

  if (!score) return null;

  return (
    <div className="animate-fade-up overflow-hidden rounded-2xl border border-border/60 bg-card/70 backdrop-blur-xl">
      {/* Header: gauge + verdict */}
      <div className="flex items-center gap-5 p-5">
        <Gauge score={score.overall} />
        <div className="min-w-0 flex-1">
          <div className="mb-1 flex items-center gap-2">
            <span className="text-[0.65rem] font-semibold uppercase tracking-[0.12em] text-muted-foreground/80">
              Cascade score · v{version}
            </span>
            {delta !== null && delta !== 0 && (
              <span
                className={cn(
                  "inline-flex items-center gap-0.5 rounded-full px-1.5 py-0.5 text-[0.65rem] font-semibold",
                  delta > 0
                    ? "bg-emerald-500/15 text-emerald-400"
                    : "bg-destructive/15 text-destructive",
                )}
              >
                <TrendingUp className={cn("size-3", delta < 0 && "rotate-180")} />
                {delta > 0 ? "+" : ""}
                {delta}
              </span>
            )}
          </div>
          <p className="font-display text-sm font-medium leading-snug">
            {score.verdict}
          </p>
        </div>
      </div>

      {/* Dimensions */}
      <div className="grid gap-x-6 gap-y-3 border-t border-border/60 p-5 sm:grid-cols-2">
        {score.dimensions.map((d) => (
          <div key={d.name}>
            <div className="mb-1 flex items-center justify-between gap-2">
              <span className="truncate text-xs font-medium">{d.name}</span>
              <span className={cn("text-xs font-semibold", scoreBand(d.score).text)}>
                {Math.round(d.score)}
              </span>
            </div>
            <Bar score={d.score} />
            <p className="mt-1 text-[0.7rem] leading-snug text-muted-foreground/80">
              {d.note}
            </p>
          </div>
        ))}
      </div>

      {/* Per-stage feedback */}
      <div className="border-t border-border/60 p-5">
        <p className="mb-2.5 text-[0.65rem] font-semibold uppercase tracking-[0.12em] text-muted-foreground/80">
          What to improve
        </p>
        <ul className="space-y-2.5">
          {score.stages.map((s) => {
            const meta = STAGE_BY_ID[s.id as StageId];
            return (
              <li key={s.id} className="flex gap-2.5 text-xs">
                <span className="mt-0.5">{meta.glyph}</span>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <span className="font-medium">{meta.title}</span>
                    <span className={cn("font-semibold", scoreBand(s.score).text)}>
                      {Math.round(s.score)}
                    </span>
                  </div>
                  <p className="text-muted-foreground/85">{s.feedback}</p>
                </div>
              </li>
            );
          })}
        </ul>
      </div>

      {/* Action */}
      <div className="flex items-center justify-between gap-3 border-t border-border/60 bg-muted/20 p-4">
        <p className="text-xs text-muted-foreground">
          Happy with it? Export below. Otherwise, regenerate with this feedback
          woven in.
        </p>
        <Button
          size="sm"
          onClick={onImprove}
          disabled={improving}
          className="shrink-0 gap-1.5 rounded-lg shadow-md shadow-brand/25 transition-all active:scale-95"
        >
          {improving ? (
            <>
              <Loader2 className="size-4 animate-spin" /> Improving…
            </>
          ) : (
            <>
              <Sparkles className="size-4" /> Improve to v{version + 1}
            </>
          )}
        </Button>
      </div>
    </div>
  );
}
