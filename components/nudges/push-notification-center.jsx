"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Bell, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export function PushNotificationCenter({ nudges = [] }) {
  const [toasts, setToasts] = useState([]);
  const [inboxOpen, setInboxOpen] = useState(false);
  const [dismissed, setDismissed] = useState(new Set());

  useEffect(() => {
    if (!nudges.length) return;

    const timer = setTimeout(() => {
      const first = nudges[0];
      setToasts((prev) => {
        if (prev.some((t) => t.id === first.id)) return prev;
        return [...prev, { ...first, shownAt: Date.now() }];
      });
    }, 2500);

    return () => clearTimeout(timer);
  }, [nudges]);

  const dismissToast = (id) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
    setDismissed((s) => new Set([...s, id]));
  };

  const inboxItems = nudges.filter((n) => !dismissed.has(n.id));

  return (
    <>
      <div className="fixed top-20 right-4 z-50 space-y-2 max-w-sm">
        {toasts.map((toast) => (
          <div
            key={toast.id}
            className="surface rounded-lg p-3 border border-primary/30 shadow-lg flex items-start gap-2 animate-in slide-in-from-right"
            role="alert"
          >
            <Bell className="h-4 w-4 text-primary shrink-0 mt-0.5" />
            <div className="flex-1 min-w-0">
              <p className="text-xs font-medium">{toast.title}</p>
              <p className="text-xs text-muted-foreground">{toast.message}</p>
              <Link href={toast.href}>
                <Button size="sm" variant="link" className="h-auto p-0 text-xs mt-1">
                  {toast.action}
                </Button>
              </Link>
            </div>
            <button
              type="button"
              onClick={() => dismissToast(toast.id)}
              className="text-muted-foreground hover:text-foreground"
              aria-label="Dismiss notification"
            >
              <X className="h-3 w-3" />
            </button>
          </div>
        ))}
      </div>

      {inboxItems.length > 0 && (
        <div className="fixed top-20 right-4 z-40">
          <Button
            variant="outline"
            size="icon"
            className={cn(
              "rounded-full shadow-md",
              inboxOpen && "bg-accent"
            )}
            onClick={() => setInboxOpen(!inboxOpen)}
            aria-label={`${inboxItems.length} notifications`}
          >
            <Bell className="h-4 w-4" />
            <span className="absolute -top-1 -right-1 h-4 w-4 rounded-full bg-primary text-[10px] text-primary-foreground flex items-center justify-center">
              {inboxItems.length}
            </span>
          </Button>

          {inboxOpen && (
            <div className="absolute right-0 mt-2 w-72 surface rounded-lg border border-border/60 shadow-lg p-2 space-y-1">
              <p className="text-xs font-medium px-2 py-1">Push notifications</p>
              {inboxItems.map((nudge) => (
                <div
                  key={nudge.id}
                  className="p-2 rounded-md hover:bg-accent/30 text-xs"
                >
                  <p className="font-medium">{nudge.title}</p>
                  <p className="text-muted-foreground">{nudge.message}</p>
                  <Link href={nudge.href} className="text-primary hover:underline">
                    {nudge.action}
                  </Link>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </>
  );
}
