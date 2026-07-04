"use client";

import { useState } from "react";
import { ChevronDown, ChevronUp } from "lucide-react";

export function ChatMessageXai({ reasoning, dataPoints = [] }) {
  const [open, setOpen] = useState(false);

  if (!reasoning && dataPoints.length === 0) return null;

  return (
    <div className="mt-2 pt-2 border-t border-border/30">
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
  );
}
