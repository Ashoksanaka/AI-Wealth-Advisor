import { TrendingUp, Wallet, Target, PiggyBank } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { formatINR } from "@/lib/format-currency";

export function WealthSummary({ summary }) {
  const stats = [
    {
      label: "Net Worth",
      value: formatINR(summary.netWorth),
      icon: Wallet,
      highlight: true,
    },
    {
      label: "Portfolio Value",
      value: formatINR(summary.portfolio.totalValue),
      icon: TrendingUp,
      sub: summary.portfolio.totalGainLoss >= 0 ? "gain" : "loss",
      change: summary.portfolio.totalGainLoss,
    },
    {
      label: "Savings Rate",
      value: `${summary.spend.savingsRate}%`,
      icon: PiggyBank,
    },
    {
      label: "Goal Progress",
      value: `${summary.overallGoalProgress}%`,
      icon: Target,
    },
  ];

  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
      {stats.map((stat) => (
        <Card key={stat.label} className="surface">
          <CardContent className="p-5">
            <div className="flex items-center justify-between mb-3">
              <span className="text-sm text-muted-foreground">{stat.label}</span>
              <div className="icon-ring h-8 w-8">
                <stat.icon className="h-4 w-4" />
              </div>
            </div>
            <p
              className={
                stat.highlight
                  ? "balance-glow text-2xl font-semibold font-data"
                  : "text-2xl font-semibold font-data"
              }
            >
              {stat.value}
            </p>
            {stat.change != null && (
              <p
                className={`text-xs mt-1 font-data ${
                  stat.change >= 0 ? "income-text" : "expense-text"
                }`}
              >
                {stat.change >= 0 ? "+" : ""}
                {formatINR(stat.change)} P&L
              </p>
            )}
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
