"use client";

import { AlertCircle, Check, ChevronDown, Loader2 } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { Markdown } from "@/components/markdown";
import { STAGE_BY_ID } from "@/lib/stages";
import type { StageState } from "@/lib/use-cascade";
import { cn } from "@/lib/utils";

export function StageCard({
  state,
  index,
  isLast,
}: {
  state: StageState;
  index: number;
  isLast: boolean;
}) {
  const meta = STAGE_BY_ID[state.id];
  const [collapsed, setCollapsed] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);

  const active = state.status === "streaming";
  const done = state.status === "done";
  const errored = state.status === "error";
  const idle = state.status === "idle";
  const hasContent = state.output.trim().length > 0;

  // Gently follow the cascade: bring each stage into view as it starts writing.
  useEffect(() => {
    if (state.status === "streaming") {
      rootRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  }, [state.status]);

  return (
    <div
      ref={rootRef}
      className="animate-fade-up relative scroll-mt-24"
      style={{ animationDelay: `${index * 70}ms` }}
    >
      {/* Connector down to the next card — fills with a gradient as this stage
          completes, so the cascade visibly "flows" downward. */}
      {!isLast && (
        <div className="absolute left-[1.55rem] top-12 h-[calc(100%+1rem)] w-px overflow-hidden bg-border">
          <div
            className={cn(
              "w-full bg-gradient-to-b from-brand to-brand-soft transition-[height] duration-700 ease-out",
              done ? "h-full" : active ? "h-1/2" : "h-0",
            )}
          />
        </div>
      )}

      <div
        className={cn(
          "relative overflow-hidden rounded-2xl border bg-card/80 backdrop-blur-xl transition-all duration-500",
          active &&
            "border-brand/50 shadow-[0_8px_40px_-12px] shadow-brand/40 ring-1 ring-brand/20",
          done && "border-border/70 shadow-sm",
          errored && "border-destructive/40",
          idle && "opacity-55",
        )}
      >
        {/* Soft top sheen on the active card */}
        {active && (
          <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-brand/60 to-transparent" />
        )}

        <button
          type="button"
          onClick={() => hasContent && setCollapsed((c) => !c)}
          className={cn(
            "flex w-full items-center gap-3.5 px-4 py-3.5 text-left transition-colors",
            hasContent && "hover:bg-muted/40",
          )}
        >
          <div
            className={cn(
              "flex size-10 shrink-0 items-center justify-center rounded-full border text-base transition-all duration-500",
              active && "animate-pulse-ring border-brand bg-brand/10",
              done &&
                "border-brand bg-brand text-primary-foreground shadow-md shadow-brand/30",
              errored && "border-destructive/50 bg-destructive/10",
              idle && "border-border",
            )}
          >
            {active ? (
              <Loader2 className="size-4 animate-spin text-brand" />
            ) : done ? (
              <Check className="size-4" strokeWidth={2.5} />
            ) : errored ? (
              <AlertCircle className="size-4 text-destructive" />
            ) : (
              <span className="opacity-80">{meta.glyph}</span>
            )}
          </div>

          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2">
              <span className="text-[0.65rem] font-semibold uppercase tracking-[0.12em] text-muted-foreground/80">
                Stage {index + 1}
              </span>
              {active && (
                <span className="shimmer-text text-[0.7rem] font-semibold">
                  Writing…
                </span>
              )}
              {done && (
                <span className="text-[0.7rem] font-medium text-brand">
                  Done
                </span>
              )}
              {state.status === "queued" && (
                <span className="text-[0.7rem] font-medium text-muted-foreground/70">
                  Queued
                </span>
              )}
            </div>
            <h3
              className={cn(
                "truncate font-display text-[0.95rem] font-semibold tracking-tight transition-colors",
                idle && "text-muted-foreground",
              )}
            >
              {meta.title}
            </h3>
            <p className="truncate text-xs text-muted-foreground/80">
              {meta.blurb}
            </p>
          </div>

          {hasContent && (
            <ChevronDown
              className={cn(
                "size-4 shrink-0 text-muted-foreground transition-transform duration-300",
                collapsed && "-rotate-90",
              )}
            />
          )}
        </button>

        {/* Smooth height collapse via CSS grid-rows */}
        {hasContent && (
          <div className="collapsible" data-collapsed={collapsed}>
            <div>
              <div className="border-t border-border/60 px-5 pb-5 pt-4">
                {errored ? (
                  <p className="text-sm text-destructive">{state.error}</p>
                ) : (
                  <div className="relative">
                    <Markdown>{state.output}</Markdown>
                    {active && (
                      <span className="caret-blink ml-0.5 inline-block h-4 w-[3px] -translate-y-0.5 rounded-full bg-brand align-middle" />
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
