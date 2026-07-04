import DashboardPage from "./page";
import { Suspense } from "react";
import Link from "next/link";
import { PenBox } from "lucide-react";
import { PageHeader } from "@/components/page-header";
import { Button } from "@/components/ui/button";
import { DashboardSkeleton } from "@/components/page-skeleton";
import { LayoutDashboard } from "lucide-react";

export default function Layout() {
  return (
    <div>
      <PageHeader
        title="Wealth Dashboard"
        subtitle="Personalized overview of your financial health"
        icon={LayoutDashboard}
      >
        <Link href="/transaction/create">
          <Button className="gap-2">
            <PenBox className="h-4 w-4" />
            Add Transaction
          </Button>
        </Link>
      </PageHeader>
      <Suspense fallback={<DashboardSkeleton />}>
        <DashboardPage />
      </Suspense>
    </div>
  );
}
