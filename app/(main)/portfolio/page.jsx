import { Suspense } from "react";
import { getHoldings } from "@/actions/portfolio";
import { PortfolioClient } from "./_components/portfolio-client";
import { Skeleton } from "@/components/ui/skeleton";

function PortfolioSkeleton() {
  return (
    <div className="space-y-4">
      <Skeleton className="h-8 w-48" />
      <Skeleton className="h-64 w-full rounded-lg" />
    </div>
  );
}

export default async function PortfolioPage() {
  const holdings = await getHoldings();
  return (
    <Suspense fallback={<PortfolioSkeleton />}>
      <PortfolioClient holdings={holdings} />
    </Suspense>
  );
}
