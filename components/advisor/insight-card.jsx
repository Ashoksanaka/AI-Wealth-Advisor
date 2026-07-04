"use client";

import { useState } from "react";
import Link from "next/link";
import { Sparkles, ChevronDown, ChevronUp } from "lucide-react";
import { cn } from "@/lib/utils";

export function InsightCard({
  title,
  summary,
  action,
  reasoning,
  dataPoints = [],
  href = "/advisor",
  className,
}) {
  const [open, setOpen] = useState(false);

  return (
    <div
      className={cn(
        "surface rounded-lg p-4 border border-border/60 hover:border-primary/30 transition-colors",
        className
      )}
    >
      <div className="flex items-start gap-3">
        <div className="icon-ring h-8 w-8 shrink-0 mt-0.5">
          <Sparkles className="h-4 w-4 text-primary" />
        </div>
        <div className="space-y-1.5 min-w-0 flex-1">
          <h4 className="font-display font-semibold text-sm">{title}</h4>
          <p className="text-sm text-muted-foreground leading-relaxed">
            {summary}
          </p>
          {action && (
            <Link
              href={href}
              className="inline-block text-xs font-medium text-primary mt-1 hover:underline"
            >
              {action} →
            </Link>
          )}
          {(reasoning || dataPoints.length > 0) && (
            <div className="pt-2">
              <button
                type="button"
                onClick={() => setOpen(!open)}
                className="flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground"
                aria-expanded={open}
              >
                Why this?
                {open ? <ChevronUp className="h-3 w-3" /> : <ChevronDown className="h-3 w-3" />}
              </button>
              {open && (
                <div className="mt-2 p-2 rounded-md bg-accent/30 text-xs space-y-1">
                  {reasoning && <p>{reasoning}</p>}
                  {dataPoints.map((dp, i) => (
                    <p key={i} className="font-data text-muted-foreground">
                      • {dp}
                    </p>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
