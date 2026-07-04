import { Suspense } from "react";
import { getCurrentBudget } from "@/actions/budget";
import { CreateAccountDrawer } from "@/components/create-account-drawer";
import { BudgetProgress } from "./_components/budget-progress";
import { Card, CardContent } from "@/components/ui/card";
import { Plus } from "lucide-react";
import { getDashboardData, getUserAccounts } from "@/actions/dashboard";
import { getWealthSummary } from "@/actions/wealth";
import { AccountCard } from "./_components/account-card";
import { DashboardOverview } from "./_components/transaction-overview";
import { SectionHeading } from "@/components/section-heading";
import { Skeleton } from "@/components/ui/skeleton";
import { WealthSummary } from "./_components/wealth-summary";
import { PortfolioSection } from "./_components/portfolio-section";
import { GoalsSection } from "./_components/goals-section";
import { SpendingTrend } from "./_components/spending-trend";
import { AryaWidget } from "@/components/advisor/arya-widget";
import { InsightsAsync, InsightsSkeleton } from "@/components/advisor/insights-async";
import { NudgesAsync } from "@/components/nudges/nudges-async";
import { ColdStartBanner } from "./_components/cold-start-banner";
import { BehaviorPatterns } from "./_components/behavior-patterns";

function OverviewSkeleton() {
  return (
    <div className="grid gap-4 md:grid-cols-2">
      <Card className="surface">
        <CardContent className="p-6 space-y-4">
          {[...Array(4)].map((_, i) => (
            <Skeleton key={i} className="h-4 w-full" />
          ))}
        </CardContent>
      </Card>
      <Card className="surface">
        <CardContent className="p-6">
          <Skeleton className="h-[250px] w-full rounded-lg" />
        </CardContent>
      </Card>
    </div>
  );
}

export default async function DashboardPage() {
  const [accounts, transactions, wealthSummary] = await Promise.all([
    getUserAccounts(),
    getDashboardData(),
    getWealthSummary(),
  ]);

  const defaultAccount = accounts?.find((account) => account.isDefault);

  let budgetData = null;
  if (defaultAccount) {
    budgetData = await getCurrentBudget(defaultAccount.id);
  }

  return (
    <div className="space-y-10">
      <NudgesAsync />

      <ColdStartBanner
        dataRichness={wealthSummary.dataRichness}
        riskProfile={wealthSummary.riskProfile}
      />

      <div>
        <SectionHeading
          eyebrow="Overview"
          title="Wealth at a Glance"
          description="Your complete financial picture — accounts, investments, and goals."
          align="left"
          className="mb-6"
        />
        <WealthSummary summary={wealthSummary} />
        {wealthSummary.behavioralRisk && (
          <p className="text-xs text-muted-foreground mt-3">
            Risk profile: {wealthSummary.behavioralRisk.staticRisk} → Behavioral:{" "}
            <span className="text-primary font-medium">
              {wealthSummary.behavioralRisk.behavioralRisk}
            </span>
            {wealthSummary.behavioralRisk.reasons.length > 0 &&
              ` (${wealthSummary.behavioralRisk.reasons.join(", ")})`}
          </p>
        )}
      </div>

      <div>
        <SectionHeading
          eyebrow="AI Advisory"
          title="Personalized Insights"
          description="Data-driven guidance from Arya based on your spending and investment behavior."
          align="left"
          className="mb-6"
        />
        <Suspense fallback={<InsightsSkeleton />}>
          <InsightsAsync />
        </Suspense>
      </div>

      <div>
        <SectionHeading
          eyebrow="Investments"
          title="Portfolio"
          description="Track your holdings and asset allocation."
          align="left"
          className="mb-6"
        />
        <PortfolioSection portfolio={wealthSummary.portfolio} />
      </div>

      <div>
        <SectionHeading
          eyebrow="Goals"
          title="Financial Goals"
          description="Progress toward your wealth milestones."
          align="left"
          className="mb-6"
        />
        <GoalsSection goals={wealthSummary.goals} />
      </div>

      <div>
        <SectionHeading
          eyebrow="Behavior"
          title="Spending Patterns"
          description="Understand how your habits affect your wealth journey."
          align="left"
          className="mb-6"
        />
        <div className="space-y-6">
          <div className="grid gap-6 md:grid-cols-2">
            <SpendingTrend
              monthlyTrend={wealthSummary.spend.monthlyTrend}
              expenseTrend={wealthSummary.spend.expenseTrend}
            />
            <BehaviorPatterns patterns={wealthSummary.patterns} />
          </div>
          <Suspense fallback={<OverviewSkeleton />}>
            <DashboardOverview
              accounts={accounts}
              transactions={transactions || []}
            />
          </Suspense>
        </div>
      </div>

      <div>
        <SectionHeading
          eyebrow="Accounts"
          title="Your Accounts"
          description="Manage and switch between your financial accounts."
          align="left"
          className="mb-6"
        />
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          <CreateAccountDrawer>
            <Card className="cursor-pointer border-dashed border-primary/30 hover:border-primary/50 surface h-full min-h-[160px] transition-colors">
              <CardContent className="flex flex-col items-center justify-center text-muted-foreground h-full pt-5">
                <div className="icon-ring h-11 w-11 mb-3">
                  <Plus className="h-5 w-5" />
                </div>
                <p className="text-sm font-medium">Add New Account</p>
              </CardContent>
            </Card>
          </CreateAccountDrawer>
          {accounts &&
            accounts.length > 0 &&
            accounts?.map((account) => (
              <AccountCard key={account.id} account={account} />
            ))}
        </div>
      </div>

      <BudgetProgress
        initialBudget={budgetData?.budget}
        currentExpenses={budgetData?.currentExpenses || 0}
      />

      <AryaWidget />
    </div>
  );
}
