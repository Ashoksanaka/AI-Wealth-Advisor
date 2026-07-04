import { DisclaimerBanner } from "@/components/compliance/disclaimer-banner";
import { InsightCard } from "@/components/advisor/insight-card";
import Link from "next/link";
import { Button } from "@/components/ui/button";

export function InsightsSection({ insights }) {
  if (!insights || insights.length === 0) {
    return (
      <div className="text-center py-8 text-muted-foreground text-sm">
        No insights yet. Add transactions and portfolio data to get personalized guidance.
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <DisclaimerBanner />
      <div className="grid gap-3 md:grid-cols-2">
        {insights.map((insight, i) => (
          <InsightCard key={i} {...insight} />
        ))}
      </div>
      <div className="flex justify-end">
        <Link href="/advisor">
          <Button variant="outline" size="sm">
            Discuss with Arya →
          </Button>
        </Link>
      </div>
    </div>
  );
}
