"use client";

import { useState } from "react";
import { ThumbsUp, ThumbsDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { submitMessageFeedback } from "@/actions/advisor";
import { cn } from "@/lib/utils";

export function MessageFeedback({ messageId, existingFeedback }) {
  const [rating, setRating] = useState(existingFeedback?.rating ?? null);
  const [submitting, setSubmitting] = useState(false);

  const handleFeedback = async (value) => {
    if (rating || submitting) return;
    setSubmitting(true);
    const result = await submitMessageFeedback(messageId, value);
    if (result.success) setRating(value);
    setSubmitting(false);
  };

  if (rating) {
    return (
      <p className="text-[10px] text-muted-foreground mt-2">
        Thanks for your feedback
      </p>
    );
  }

  return (
    <div className="flex items-center gap-1 mt-2">
      <span className="text-[10px] text-muted-foreground mr-1">Helpful?</span>
      <Button
        type="button"
        variant="ghost"
        size="icon"
        className={cn("h-6 w-6", rating === "HELPFUL" && "text-primary")}
        onClick={() => handleFeedback("HELPFUL")}
        disabled={submitting}
        aria-label="Mark as helpful"
      >
        <ThumbsUp className="h-3 w-3" />
      </Button>
      <Button
        type="button"
        variant="ghost"
        size="icon"
        className={cn("h-6 w-6", rating === "NOT_HELPFUL" && "text-destructive")}
        onClick={() => handleFeedback("NOT_HELPFUL")}
        disabled={submitting}
        aria-label="Mark as not helpful"
      >
        <ThumbsDown className="h-3 w-3" />
      </Button>
    </div>
  );
}
