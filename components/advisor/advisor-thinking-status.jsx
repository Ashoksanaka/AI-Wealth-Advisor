"use client";

import { useEffect, useState } from "react";
import { cn } from "@/lib/utils";

const STATUS_MESSAGES = [
  "Analyzing your finances",
  "Reviewing spending patterns",
  "Checking portfolio context",
  "Preparing your response",
];

export function AdvisorThinkingStatus({ className, compact = false }) {
  const [index, setIndex] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setIndex((current) => (current + 1) % STATUS_MESSAGES.length);
    }, 2200);
    return () => clearInterval(timer);
  }, []);

  const label = STATUS_MESSAGES[index];

  return (
    <div
      className={cn(
        "inline-flex items-center gap-2.5 text-primary",
        compact ? "text-xs" : "text-sm",
        className
      )}
      role="status"
      aria-live="polite"
      aria-label={`${label}…`}
    >
      <span className="relative flex h-2 w-2 shrink-0">
        <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-primary/50 opacity-75" />
        <span className="relative inline-flex h-2 w-2 rounded-full bg-primary/80" />
      </span>
      <span className="font-medium leading-none">
        {label}
        <span className="inline-flex ml-0.5 w-[1.1rem]">
          <span className="animate-bounce [animation-delay:0ms]">.</span>
          <span className="animate-bounce [animation-delay:120ms]">.</span>
          <span className="animate-bounce [animation-delay:240ms]">.</span>
        </span>
      </span>
    </div>
  );
}
