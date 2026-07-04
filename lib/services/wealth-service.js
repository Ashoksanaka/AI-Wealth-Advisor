import { unstable_cache } from "next/cache";
import { buildWealthContext, generateWealthInsights } from "@/lib/wealth-advisor";
import {
  computeSpendBehavior,
  computePortfolioStats,
  computeGoalStats,
  computeNetWorth,
  detectBehavioralPatterns,
  predictEndOfMonthSurplus,
  computeBehavioralRiskAdjustment,
  getRebalanceRecommendation,
  computeDataRichness,
} from "@/lib/wealth-stats";
import { serializeDecimalFields } from "@/lib/serialize";
import { db } from "@/lib/prisma";

export async function getWealthSummaryForUser(userId) {
  const [accounts, transactions, holdings, goals, riskProfile] =
    await Promise.all([
      db.account.findMany({ where: { userId } }),
      db.transaction.findMany({ where: { userId } }),
      db.investmentHolding.findMany({ where: { userId } }),
      db.financialGoal.findMany({
        where: { userId },
        orderBy: { priority: "asc" },
      }),
      db.riskProfile.findUnique({ where: { userId } }),
    ]);

  const serializedAccounts = accounts.map((a) =>
    serializeDecimalFields(a, ["balance"])
  );
  const serializedTransactions = transactions.map((t) =>
    serializeDecimalFields(t, ["amount"])
  );
  const serializedHoldings = holdings.map((h) =>
    serializeDecimalFields(h, ["quantity", "avgBuyPrice", "currentPrice"])
  );
  const serializedGoals = goals.map((g) =>
    serializeDecimalFields(g, ["targetAmount", "currentAmount"])
  );

  const spend = computeSpendBehavior(serializedTransactions);
  const portfolio = computePortfolioStats(serializedHoldings);
  const goalStats = computeGoalStats(serializedGoals);
  const netWorth = computeNetWorth(serializedAccounts, portfolio.totalValue);
  const patterns = detectBehavioralPatterns(serializedTransactions);
  const cashFlow = predictEndOfMonthSurplus(serializedTransactions, spend);

  const context = {
    netWorth,
    accountBalance: serializedAccounts.reduce((s, a) => s + a.balance, 0),
    portfolioValue: portfolio.totalValue,
    portfolioGainLoss: portfolio.totalGainLoss,
    allocation: portfolio.allocationChart,
    holdings: portfolio.items,
    goals: goalStats,
    spend,
    riskProfile: riskProfile
      ? {
          riskTolerance: riskProfile.riskTolerance,
          investmentHorizonYears: riskProfile.investmentHorizonYears,
          valuesPreference: riskProfile.valuesPreference,
          onboardingCompleted: riskProfile.onboardingCompleted,
        }
      : null,
  };

  const behavioralRisk = computeBehavioralRiskAdjustment(context);
  const rebalance = getRebalanceRecommendation(
    portfolio.allocationChart,
    behavioralRisk.behavioralRisk
  );

  const dataRichness = computeDataRichness({
    transactions: serializedTransactions,
    holdings: serializedHoldings,
    goals,
    riskProfile,
  });

  const overallGoalProgress =
    goalStats.length > 0
      ? goalStats.reduce((sum, g) => sum + g.progress, 0) / goalStats.length
      : 0;

  return {
    netWorth,
    accountBalance: context.accountBalance,
    portfolio: {
      totalValue: portfolio.totalValue,
      totalGainLoss: portfolio.totalGainLoss,
      allocation: portfolio.allocationChart,
      holdings: portfolio.items,
      rebalance,
    },
    goals: goalStats,
    overallGoalProgress: Math.round(overallGoalProgress * 10) / 10,
    spend,
    patterns,
    cashFlow,
    behavioralRisk,
    riskProfile: context.riskProfile,
    dataRichness,
  };
}

export const getCachedInsights = (userId) =>
  unstable_cache(
    async () => generateWealthInsights(userId),
    [`wealth-insights-v2-${userId}`],
    { revalidate: 900 }
  )();

export async function getNudgesForUser(userId) {
  const summary = await getWealthSummaryForUser(userId);
  const nudges = [];

  if (summary.spend.currentIncome > 0) {
    const salaryTx = summary.spend.currentIncome;
    nudges.push({
      id: "salary-invest",
      title: "Salary received",
      message: `You received income this month. Move 10% ($${Math.round(salaryTx * 0.1)}) to investments?`,
      action: "Invest now",
      href: "/portfolio",
    });
  }

  if (summary.cashFlow.surplus > 100) {
    nudges.push({
      id: "surplus",
      title: "Projected surplus",
      message: `You'll likely have $${summary.cashFlow.surplus} left this month. Invest $${summary.cashFlow.suggestedInvest}?`,
      action: "Invest surplus",
      href: "/portfolio",
    });
  }

  const weekendSpike = summary.patterns.find((p) => p.type === "weekend_spike");
  if (weekendSpike) {
    nudges.push({
      id: "spending-spike",
      title: "Spending pattern change",
      message: weekendSpike.message,
      action: "Review spending",
      href: "/dashboard",
      priority: 1,
    });
  }

  if (summary.spend.expenseTrend > 20) {
    nudges.push({
      id: "expense-surge",
      title: "Monthly spending up",
      message: `Expenses rose ${summary.spend.expenseTrend}% vs last month. Review your top categories before they affect your goals.`,
      action: "Review spending",
      href: "/dashboard",
      priority: 1,
    });
  }

  const lagging = summary.goals.find((g) => g.progress < 40);
  if (lagging) {
    const missHint =
      lagging.deadline && lagging.progress < 30
        ? ` At this pace you may miss your ${lagging.name} target.`
        : "";
    nudges.push({
      id: "goal-behind",
      title: `Goal: ${lagging.name}`,
      message: `You're at ${lagging.progress}%. Increase contributions to stay on track.${missHint}`,
      action: "Update goal",
      href: "/goals",
      priority: 2,
    });
  }

  const equityPct = summary.portfolio.allocation?.EQUITY ?? 0;
  if (equityPct > 70 && summary.riskProfile?.riskTolerance === "AGGRESSIVE") {
    nudges.push({
      id: "market-awareness",
      title: "Portfolio concentration",
      message: `${equityPct.toFixed(0)}% of your portfolio is in equity. Market swings can feel stressful — want a quick diversification refresher?`,
      action: "Ask Arya",
      href: "/advisor",
      priority: 3,
    });
  }

  nudges.sort((a, b) => (a.priority ?? 5) - (b.priority ?? 5));
  return nudges.slice(0, 4);
}
