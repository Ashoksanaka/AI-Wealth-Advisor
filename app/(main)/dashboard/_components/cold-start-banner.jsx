import { Sparkles } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";

export function ColdStartBanner({ dataRichness, riskProfile }) {
  if (dataRichness > 1) return null;

  const risk = riskProfile?.riskTolerance?.toLowerCase() || "moderate";
  const horizon = riskProfile?.investmentHorizonYears || 10;

  return (
    <div
      className="surface rounded-lg p-4 border border-primary/30 flex items-start gap-3"
      role="status"
      aria-live="polite"
    >
      <div className="icon-ring h-8 w-8 shrink-0">
        <Sparkles className="h-4 w-4 text-primary" />
      </div>
      <div className="flex-1 min-w-0">
        <p className="font-medium text-sm">Arya is learning your habits</p>
        <p className="text-sm text-muted-foreground mt-1">
          We don&apos;t have enough transaction data yet. Guidance is based on
          your {risk} risk profile and {horizon}-year horizon until spending
          patterns build up.
        </p>
        <div className="flex gap-2 mt-3">
          <Link href="/advisor">
            <Button size="sm" variant="outline">
              Chat with Arya
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}
