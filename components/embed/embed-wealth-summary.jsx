import { Wallet, PiggyBank, Target } from "lucide-react";
import { formatINR } from "@/lib/format-currency";

export function EmbedWealthSummary({ summary }) {
  if (!summary) return null;

  const stats = [
    {
      label: "Net Worth",
      value: formatINR(summary.netWorth),
      icon: Wallet,
    },
    {
      label: "Savings",
      value: `${summary.spend.savingsRate}%`,
      icon: PiggyBank,
    },
    {
      label: "Goals",
      value: `${summary.overallGoalProgress}%`,
      icon: Target,
    },
  ];

  return (
    <div className="grid grid-cols-3 gap-2 mb-4">
      {stats.map((stat) => (
        <div
          key={stat.label}
          className="surface rounded-lg p-3 border border-border/60 text-center"
        >
          <stat.icon className="h-3.5 w-3.5 mx-auto mb-1 text-primary" />
          <p className="text-[10px] text-muted-foreground">{stat.label}</p>
          <p className="text-sm font-semibold font-data">{stat.value}</p>
        </div>
      ))}
    </div>
  );
}
