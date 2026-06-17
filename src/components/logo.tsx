"use client";

import { useId } from "react";
import { cn } from "@/lib/utils";

/**
 * The Cascade mark: layered mountain peaks with a bright avalanche of snow
 * cascading down the slope — an avalanche on a mountain. Uses theme CSS
 * variables for the tile gradient so it adapts to light/dark.
 */
export function CascadeMark({ className }: { className?: string }) {
  const id = useId();
  const bg = `${id}-bg`;
  const glow = `${id}-glow`;
  const clip = `${id}-clip`;
  return (
    <svg
      viewBox="0 0 32 32"
      className={className}
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
    >
      <defs>
        <linearGradient id={bg} x1="2" y1="0" x2="30" y2="32" gradientUnits="userSpaceOnUse">
          <stop stopColor="var(--brand-soft)" />
          <stop offset="1" stopColor="var(--brand)" />
        </linearGradient>
        <linearGradient id={glow} x1="0" y1="0" x2="0" y2="1">
          <stop stopColor="#fff" stopOpacity="0.22" />
          <stop offset="1" stopColor="#fff" stopOpacity="0" />
        </linearGradient>
        <clipPath id={clip}>
          <rect width="32" height="32" rx="9" />
        </clipPath>
      </defs>
      <rect width="32" height="32" rx="9" fill={`url(#${bg})`} />
      <g clipPath={`url(#${clip})`}>
        <rect width="32" height="15" fill={`url(#${glow})`} />
        {/* back ridge */}
        <path d="M22 11 L31 26 L14 26 Z" fill="#fff" fillOpacity="0.2" />
        {/* front mountain */}
        <path d="M12 6.5 L23.5 26 L1.5 26 Z" fill="#fff" fillOpacity="0.38" />
        {/* snow cap */}
        <path d="M12 6.5 L9.6 11 L14.4 11 Z" fill="#fff" />
        {/* avalanche: billowing snow tumbling down the slope */}
        <g fill="#fff">
          <circle cx="12.7" cy="10.4" r="1.3" />
          <circle cx="13.8" cy="13" r="1.9" />
          <circle cx="15.1" cy="16.1" r="2.4" />
          <circle cx="16.8" cy="19.5" r="2.9" />
          <circle cx="18.8" cy="23" r="3.3" />
        </g>
        {/* flung debris */}
        <circle cx="22.6" cy="24" r="1.05" fill="#fff" fillOpacity="0.95" />
        <circle cx="24.4" cy="25.7" r="0.72" fill="#fff" fillOpacity="0.78" />
      </g>
    </svg>
  );
}

/** Mark + wordmark lockup for nav/footer use. */
export function CascadeLogo({ className }: { className?: string }) {
  return (
    <div className={cn("inline-flex items-center gap-2.5", className)}>
      <CascadeMark className="size-7" />
      <span className="font-display text-lg font-bold tracking-tight">
        Cascade
      </span>
    </div>
  );
}
