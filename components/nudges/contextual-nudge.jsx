"use client";

import Link from "next/link";
import { X, Bell } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";

export function ContextualNudge({ nudges = [] }) {
  const [dismissed, setDismissed] = useState(new Set());

  const visible = nudges.filter((n) => !dismissed.has(n.id));
  if (visible.length === 0) return null;

  const nudge = visible[0];

  return (
    <div
      className="surface rounded-lg p-4 border border-primary/30 flex items-start gap-3"
      role="status"
      aria-live="polite"
    >
      <div className="icon-ring h-8 w-8 shrink-0">
        <Bell className="h-4 w-4 text-primary" />
      </div>
      <div className="flex-1 min-w-0">
        <p className="font-medium text-sm">{nudge.title}</p>
        <p className="text-sm text-muted-foreground mt-1">{nudge.message}</p>
        <Link href={nudge.href}>
          <Button size="sm" variant="outline" className="mt-2">
            {nudge.action}
          </Button>
        </Link>
      </div>
      <button
        type="button"
        onClick={() => setDismissed((s) => new Set([...s, nudge.id]))}
        className="text-muted-foreground hover:text-foreground"
        aria-label="Dismiss nudge"
      >
        <X className="h-4 w-4" />
      </button>
    </div>
  );
}
