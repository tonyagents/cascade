"use client";

import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { cn } from "@/lib/utils";

/**
 * Renders streamed Markdown with prose styling. Tables are wrapped so wide
 * requirement/experiment tables scroll instead of breaking the layout.
 */
export function Markdown({
  children,
  className,
}: {
  children: string;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "prose prose-sm dark:prose-invert max-w-none",
        "prose-headings:font-display prose-headings:font-semibold prose-headings:tracking-tight",
        "prose-h2:mt-5 prose-h2:mb-2 prose-h2:text-base prose-h2:text-brand",
        "prose-h3:mt-4 prose-h3:mb-1 prose-h3:text-sm",
        "prose-p:my-2 prose-li:my-0.5",
        "prose-blockquote:border-l-brand prose-blockquote:text-muted-foreground prose-blockquote:font-normal prose-blockquote:not-italic",
        "prose-strong:text-foreground",
        className,
      )}
    >
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        components={{
          table: ({ children }) => (
            <div className="my-3 overflow-x-auto rounded-md border">
              <table className="my-0 w-full text-xs">{children}</table>
            </div>
          ),
        }}
      >
        {children}
      </ReactMarkdown>
    </div>
  );
}
