import { getWealthInsights } from "@/actions/wealth";
import { InsightsSection } from "@/app/(main)/dashboard/_components/insights-section";
import { Skeleton } from "@/components/ui/skeleton";

export async function InsightsAsync() {
  const insights = await getWealthInsights();
  return <InsightsSection insights={insights} />;
}

export function InsightsSkeleton() {
  return (
    <div className="grid gap-3 md:grid-cols-2">
      {[...Array(4)].map((_, i) => (
        <Skeleton key={i} className="h-24 w-full rounded-lg" />
      ))}
    </div>
  );
}
