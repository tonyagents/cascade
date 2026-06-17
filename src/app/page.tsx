"use client";

import {
  ArrowRight,
  Check,
  Copy,
  Download,
  FileText,
  LayoutTemplate,
  Loader2,
  RotateCcw,
  Sparkles,
} from "lucide-react";
import { useEffect, useMemo, useRef, useState } from "react";
import { CascadeMark } from "@/components/logo";
import { Scorecard } from "@/components/scorecard";
import { StageCard } from "@/components/stage-card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { buildExportDoc, downloadMarkdown } from "@/lib/export-doc";
import { STAGES, type StageId } from "@/lib/stages";
import { DEFAULT_TEMPLATES } from "@/lib/templates";
import {
  useCascade,
  type StageRevision,
  type StageTemplates,
} from "@/lib/use-cascade";
import { useScore } from "@/lib/use-score";
import { cn } from "@/lib/utils";

const EXAMPLES = [
  "A custom ETF creator from pre-stocks, prediction-market tokens, and perps",
  "An AI agent that auto-rebalances your crypto portfolio while you sleep",
  "A debit card that rounds up purchases and DCAs the change into BTC",
];

export default function Home() {
  const [concept, setConcept] = useState("");
  const [referenceDoc, setReferenceDoc] = useState("");
  const [showRef, setShowRef] = useState(false);
  const [templates, setTemplates] = useState<StageTemplates>(DEFAULT_TEMPLATES);
  const [showTemplates, setShowTemplates] = useState(false);
  const [copied, setCopied] = useState(false);
  const [version, setVersion] = useState(1);
  const [prevOverall, setPrevOverall] = useState<number | null>(null);
  const { stages, running, startedOnce, runId, run, reset } = useCascade();
  const {
    score,
    scoring,
    error: scoreError,
    run: runScore,
    reset: resetScore,
  } = useScore();
  const scoredRunId = useRef(-1);

  const templateCount = Object.values(templates).filter((t) => t?.trim()).length;
  const allDone = startedOnce && stages.every((s) => s.status === "done");

  // Auto-score each completed cascade exactly once (keyed to its runId).
  useEffect(() => {
    if (allDone && !scoring && runId !== scoredRunId.current) {
      scoredRunId.current = runId;
      runScore({ concept, referenceDoc, stages });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [allDone, runId, scoring]);

  const delta =
    score && prevOverall !== null ? Math.round(score.overall - prevOverall) : null;

  // Overall progress for the top bar: completed stages + half-credit for the
  // one currently streaming.
  const progress = useMemo(() => {
    if (!startedOnce) return 0;
    const doneCount = stages.filter((s) => s.status === "done").length;
    const streaming = stages.some((s) => s.status === "streaming") ? 0.5 : 0;
    return Math.min(1, (doneCount + streaming) / stages.length);
  }, [startedOnce, stages]);

  const exportDoc = useMemo(
    () =>
      buildExportDoc({
        concept,
        hadReferenceDoc: referenceDoc.trim().length > 0,
        stages,
      }),
    [concept, referenceDoc, stages],
  );

  const handleRun = () => {
    setVersion(1);
    setPrevOverall(null);
    resetScore();
    run(concept, { referenceDoc, templates });
  };

  const handleImprove = () => {
    if (!score) return;
    setPrevOverall(score.overall);
    setVersion((v) => v + 1);
    const revisions: Partial<Record<StageId, StageRevision>> = {};
    for (const s of stages) {
      const fb = score.stages.find((x) => x.id === s.id)?.feedback;
      if (fb && s.output.trim()) {
        revisions[s.id] = { previousOutput: s.output, feedback: fb };
      }
    }
    resetScore();
    run(concept, { referenceDoc, templates, revisions });
  };

  const setTemplate = (id: StageId, value: string) =>
    setTemplates((t) => ({ ...t, [id]: value }));

  const handleCopy = async () => {
    await navigator.clipboard.writeText(exportDoc);
    setCopied(true);
    setTimeout(() => setCopied(false), 1800);
  };

  const handleReset = () => {
    reset();
    resetScore();
    setCopied(false);
    setVersion(1);
    setPrevOverall(null);
    scoredRunId.current = -1;
  };

  return (
    <div className="relative min-h-screen">
      {/* Top progress bar */}
      <div
        className={cn(
          "fixed inset-x-0 top-0 z-50 h-[3px] transition-opacity duration-500",
          startedOnce && !allDone ? "opacity-100" : "opacity-0",
        )}
      >
        <div
          className="h-full bg-gradient-to-r from-brand via-brand-soft to-brand shadow-[0_0_12px] shadow-brand/50 transition-[width] duration-700 ease-out"
          style={{ width: `${progress * 100}%` }}
        />
      </div>

      {/* Background wash */}
      <div className="app-bg pointer-events-none fixed inset-0 -z-10" />

      <div className="mx-auto max-w-3xl px-4 py-12 sm:py-20">
        {/* Header */}
        <header className="animate-fade-up mb-10 text-center">
          <div className="mb-5 flex justify-center">
            <CascadeMark className="size-14 drop-shadow-[0_10px_30px_rgba(124,58,237,0.45)]" />
          </div>
          <div className="mb-4 inline-flex items-center gap-1.5 rounded-full border border-border/60 bg-card/70 px-3 py-1 text-xs font-medium text-muted-foreground shadow-sm backdrop-blur-xl">
            <Sparkles className="size-3.5 text-brand" />
            AI-first GTM engine
          </div>
          <h1 className="bg-gradient-to-br from-foreground via-foreground to-brand bg-clip-text font-display text-5xl font-bold tracking-tight text-transparent sm:text-6xl">
            Cascade
          </h1>
          <p className="mx-auto mt-4 max-w-xl text-balance text-sm leading-relaxed text-muted-foreground sm:text-base">
            One product idea in. A full launch stack out — GTM plan, creative
            brief, BRD, and content. Each stage is built from the one before it,
            so they never drift out of sync.
          </p>
        </header>

        {/* Input panel */}
        <div
          className="animate-fade-up rounded-3xl border border-border/60 bg-card/70 p-4 shadow-[0_20px_60px_-30px_rgba(0,0,0,0.3)] backdrop-blur-xl sm:p-5"
          style={{ animationDelay: "80ms" }}
        >
          <label className="mb-2 block text-sm font-medium">
            What are you launching?
          </label>
          <Textarea
            value={concept}
            onChange={(e) => setConcept(e.target.value)}
            onKeyDown={(e) => {
              if ((e.metaKey || e.ctrlKey) && e.key === "Enter") {
                e.preventDefault();
                if (concept.trim() && !running) handleRun();
              }
            }}
            placeholder="Describe the product idea in a sentence or two…"
            className="min-h-24 resize-none rounded-xl border-border/70 bg-background/60 text-sm transition-shadow focus-visible:border-brand/50 focus-visible:ring-4 focus-visible:ring-brand/15"
            disabled={running}
          />

          {/* Example chips */}
          {!startedOnce && (
            <div className="mt-3 flex flex-wrap gap-2">
              {EXAMPLES.map((ex) => (
                <button
                  key={ex}
                  type="button"
                  onClick={() => setConcept(ex)}
                  className="rounded-full border border-border/70 bg-background/50 px-3 py-1.5 text-left text-xs text-muted-foreground transition-all hover:-translate-y-0.5 hover:border-brand/50 hover:text-foreground hover:shadow-sm active:translate-y-0"
                >
                  {ex}
                </button>
              ))}
            </div>
          )}

          {/* Reference doc */}
          <div className="mt-4">
            <button
              type="button"
              onClick={() => setShowRef((s) => !s)}
              className="inline-flex items-center gap-1.5 text-xs font-medium text-muted-foreground transition-colors hover:text-foreground"
            >
              <FileText className="size-3.5" />
              {showRef ? "Hide" : "Add"} reference doc
              <span className="text-muted-foreground/60">
                (brand guide, past brief — grounds the voice &amp; facts)
              </span>
            </button>
            <div className="collapsible" data-collapsed={!showRef}>
              <div>
                <Textarea
                  value={referenceDoc}
                  onChange={(e) => setReferenceDoc(e.target.value)}
                  placeholder="Paste a brand guide, tone-of-voice doc, or a past brief. Every stage will speak in this voice and stick to these facts."
                  className="mt-2 min-h-28 resize-none rounded-xl border-border/70 bg-background/60 text-xs focus-visible:border-brand/50 focus-visible:ring-4 focus-visible:ring-brand/15"
                  disabled={running}
                />
              </div>
            </div>
          </div>

          {/* Custom templates */}
          <div className="mt-3">
            <button
              type="button"
              onClick={() => setShowTemplates((s) => !s)}
              className="inline-flex items-center gap-1.5 text-xs font-medium text-muted-foreground transition-colors hover:text-foreground"
            >
              <LayoutTemplate className="size-3.5" />
              {showTemplates ? "Hide" : "Use my own"} templates
              <span className="text-muted-foreground/60">
                (paste your GTM / brief / BRD format — output follows it exactly)
              </span>
              {templateCount > 0 && (
                <span className="rounded-full bg-brand/15 px-1.5 py-0.5 text-[0.6rem] font-semibold text-brand">
                  {templateCount}
                </span>
              )}
            </button>
            <div className="collapsible" data-collapsed={!showTemplates}>
              <div>
                <div className="mt-2 space-y-3 rounded-xl border border-border/70 bg-background/40 p-3">
                  <p className="text-xs text-muted-foreground">
                    Leave a stage blank to use Cascade&apos;s default structure.
                    Any template you provide overrides the sections for that
                    stage — while still being grounded in the prior stages.
                  </p>
                  {STAGES.map((s) => (
                    <div key={s.id}>
                      <label className="mb-1 flex items-center gap-1.5 text-xs font-medium">
                        <span>{s.glyph}</span>
                        {s.title} template
                      </label>
                      <Textarea
                        value={templates[s.id] ?? ""}
                        onChange={(e) => setTemplate(s.id, e.target.value)}
                        placeholder={`Paste your ${s.title} template (Markdown headings, placeholders, sections)…`}
                        className="min-h-20 resize-none rounded-lg border-border/70 bg-background/60 font-mono text-[0.7rem] focus-visible:border-brand/50 focus-visible:ring-4 focus-visible:ring-brand/15"
                        disabled={running}
                      />
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="mt-5 flex items-center gap-2">
            <Button
              onClick={handleRun}
              disabled={!concept.trim() || running}
              className="h-11 gap-1.5 rounded-xl px-5 text-sm font-semibold shadow-lg shadow-brand/25 transition-all duration-200 hover:shadow-xl hover:shadow-brand/30 active:scale-[0.98] disabled:opacity-50 disabled:shadow-none"
            >
              {running ? (
                <>
                  <Loader2 className="size-4 animate-spin" /> Cascading…
                </>
              ) : startedOnce ? (
                <>
                  <RotateCcw className="size-4" /> Re-run cascade
                </>
              ) : (
                <>
                  Run cascade <ArrowRight className="size-4" />
                </>
              )}
            </Button>
            {startedOnce && !running && (
              <Button
                variant="ghost"
                onClick={handleReset}
                className="h-11 rounded-xl text-muted-foreground transition-colors hover:text-foreground"
              >
                Clear
              </Button>
            )}
            {!running && (
              <span className="ml-auto hidden items-center gap-1 text-xs text-muted-foreground/60 sm:flex">
                <kbd className="rounded border border-border/70 bg-muted/50 px-1.5 py-0.5 font-mono text-[0.65rem]">
                  ⌘↵
                </kbd>
                to run
              </span>
            )}
          </div>
        </div>

        {/* Cascade output */}
        {startedOnce && (
          <div className="mt-10 space-y-5">
            {stages.map((s, i) => (
              <StageCard
                key={s.id}
                state={s}
                index={i}
                isLast={i === stages.length - 1}
              />
            ))}
          </div>
        )}

        {/* Scorecard + improve loop */}
        {startedOnce && (scoring || score || scoreError) && (
          <div className="mt-6">
            <Scorecard
              score={score}
              scoring={scoring}
              error={scoreError}
              version={version}
              delta={delta}
              improving={running}
              onImprove={handleImprove}
              onRetry={() => runScore({ concept, referenceDoc, stages })}
            />
          </div>
        )}

        {/* Export bar */}
        {allDone && !scoring && (
          <div className="animate-fade-up sticky bottom-4 mt-10 flex items-center justify-between gap-3 rounded-2xl border border-border/60 bg-card/80 p-3 pl-4 shadow-[0_20px_60px_-20px_rgba(0,0,0,0.35)] backdrop-blur-xl">
            <p className="flex items-center gap-2 text-sm font-medium">
              <span className="flex size-6 items-center justify-center rounded-full bg-brand text-primary-foreground">
                <Check className="size-3.5" strokeWidth={3} />
              </span>
              Launch stack ready
            </p>
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={handleCopy}
                className="gap-1.5 rounded-lg border-border/70 bg-background/60 transition-all active:scale-95"
              >
                {copied ? (
                  <Check className="size-4 text-brand" />
                ) : (
                  <Copy className="size-4" />
                )}
                {copied ? "Copied" : "Copy"}
              </Button>
              <Button
                size="sm"
                onClick={() =>
                  downloadMarkdown("cascade-launch-stack.md", exportDoc)
                }
                className="gap-1.5 rounded-lg shadow-md shadow-brand/25 transition-all active:scale-95"
              >
                <Download className="size-4" /> Export .md
              </Button>
            </div>
          </div>
        )}

        <footer className="mt-16 text-center text-xs text-muted-foreground/60">
          Built for MoonPay · idea → launch docs in minutes, kept in sync
        </footer>
      </div>
    </div>
  );
}
