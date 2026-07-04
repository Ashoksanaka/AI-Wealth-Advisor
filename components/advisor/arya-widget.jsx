"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { MessageCircle, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { AdvisorChat } from "./advisor-chat";
import { getAdvisorHistory } from "@/actions/advisor";
import { cn } from "@/lib/utils";

export function AryaWidget() {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [sessionId, setSessionId] = useState(null);
  const [messages, setMessages] = useState([]);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    if (!open || loaded) return;
    getAdvisorHistory(null)
      .then((result) => {
        setSessionId(result.session.id);
        setMessages(result.messages);
        setLoaded(true);
      })
      .catch(() => {
        setSessionId(null);
        setMessages([]);
        setLoaded(true);
      });
  }, [open, loaded]);

  return (
    <>
      {!open && (
        <Button
          onClick={() => setOpen(true)}
          size="lg"
          className="fixed bottom-6 right-6 z-40 gap-2 rounded-full shadow-lg shadow-primary/20 h-12 px-5"
          aria-label="Open Arya chat"
        >
          <MessageCircle className="h-5 w-5" />
          Ask Arya
        </Button>
      )}

      {open && (
        <div
          className={cn(
            "fixed bottom-6 right-6 z-50 w-[min(100vw-2rem,380px)] h-[min(70vh,520px)]",
            "flex flex-col rounded-2xl border border-border/60 bg-card shadow-2xl shadow-primary/10 overflow-hidden"
          )}
          role="dialog"
          aria-label="Arya wealth advisor"
        >
          {loaded ? (
            <AdvisorChat
              mode="widget"
              sessionId={sessionId}
              initialMessages={messages}
              onClose={() => setOpen(false)}
              onMaximize={() => {
                const qs = sessionId ? `?session=${sessionId}` : "";
                router.push(`/advisor${qs}`);
              }}
            />
          ) : (
            <div className="flex-1 flex items-center justify-center text-sm text-muted-foreground">
              Loading Arya…
            </div>
          )}
        </div>
      )}
    </>
  );
}
