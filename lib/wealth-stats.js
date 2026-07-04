import {
  startOfMonth,
  endOfMonth,
  subMonths,
  format,
} from "date-fns";

export function getMonthRange(date = new Date()) {
  return {
    start: startOfMonth(date),
    end: endOfMonth(date),
  };
}

export function computeSpendBehavior(transactions) {
  const now = new Date();
  const currentRange = getMonthRange(now);
  const prevRange = getMonthRange(subMonths(now, 1));

  const currentMonth = transactions.filter(
    (t) =>
      t.type === "EXPENSE" &&
      new Date(t.date) >= currentRange.start &&
      new Date(t.date) <= currentRange.end
  );

  const prevMonth = transactions.filter(
    (t) =>
      t.type === "EXPENSE" &&
      new Date(t.date) >= prevRange.start &&
      new Date(t.date) <= prevRange.end
  );

  const currentIncome = transactions
    .filter(
      (t) =>
        t.type === "INCOME" &&
        new Date(t.date) >= currentRange.start &&
        new Date(t.date) <= currentRange.end
    )
    .reduce((sum, t) => sum + Number(t.amount), 0);

  const currentExpenses = currentMonth.reduce(
    (sum, t) => sum + Number(t.amount),
    0
  );

  const prevExpenses = prevMonth.reduce(
    (sum, t) => sum + Number(t.amount),
    0
  );

  const byCategory = currentMonth.reduce((acc, t) => {
    acc[t.category] = (acc[t.category] || 0) + Number(t.amount);
    return acc;
  }, {});

  const topCategories = Object.entries(byCategory)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5)
    .map(([category, amount]) => ({ category, amount }));

  const savingsRate =
    currentIncome > 0
      ? ((currentIncome - currentExpenses) / currentIncome) * 100
      : 0;

  const expenseTrend =
    prevExpenses > 0
      ? ((currentExpenses - prevExpenses) / prevExpenses) * 100
      : 0;

  const monthlyTrend = [];
  for (let i = 5; i >= 0; i--) {
    const monthDate = subMonths(now, i);
    const range = getMonthRange(monthDate);
    const expenses = transactions
      .filter(
        (t) =>
          t.type === "EXPENSE" &&
          new Date(t.date) >= range.start &&
          new Date(t.date) <= range.end
      )
      .reduce((sum, t) => sum + Number(t.amount), 0);

    monthlyTrend.push({
      month: format(monthDate, "MMM"),
      expenses,
    });
  }

  return {
    currentIncome,
    currentExpenses,
    prevExpenses,
    savingsRate: Math.round(savingsRate * 10) / 10,
    expenseTrend: Math.round(expenseTrend * 10) / 10,
    topCategories,
    byCategory,
    monthlyTrend,
  };
}

export function computePortfolioStats(holdings) {
  const items = holdings.map((h) => {
    const quantity = Number(h.quantity);
    const currentPrice = Number(h.currentPrice);
    const avgBuyPrice = Number(h.avgBuyPrice);
    const currentValue = quantity * currentPrice;
    const investedValue = quantity * avgBuyPrice;
    const gainLoss = currentValue - investedValue;
    const gainLossPercent =
      investedValue > 0 ? (gainLoss / investedValue) * 100 : 0;

    return {
      ...h,
      quantity,
      currentPrice,
      avgBuyPrice,
      currentValue,
      investedValue,
      gainLoss,
      gainLossPercent,
    };
  });

  const totalValue = items.reduce((sum, h) => sum + h.currentValue, 0);
  const totalInvested = items.reduce((sum, h) => sum + h.investedValue, 0);

  const allocation = items.reduce((acc, h) => {
    const pct = totalValue > 0 ? (h.currentValue / totalValue) * 100 : 0;
    acc[h.assetClass] = (acc[h.assetClass] || 0) + pct;
    return acc;
  }, {});

  const allocationChart = Object.entries(allocation).map(([name, value]) => ({
    name,
    value: Math.round(value * 10) / 10,
  }));

  return {
    items,
    totalValue,
    totalInvested,
    totalGainLoss: totalValue - totalInvested,
    allocationChart,
  };
}

export function computeGoalStats(goals) {
  return goals.map((g) => {
    const target = Number(g.targetAmount);
    const current = Number(g.currentAmount);
    const progress = target > 0 ? (current / target) * 100 : 0;
    return {
      ...g,
      targetAmount: target,
      currentAmount: current,
      progress: Math.min(Math.round(progress * 10) / 10, 100),
      remaining: Math.max(target - current, 0),
    };
  });
}

export function computeDataRichness({ transactions, holdings, goals, riskProfile }) {
  const txCount = transactions?.length ?? 0;
  const hasOnboarding = riskProfile?.onboardingCompleted;

  if (!hasOnboarding && txCount === 0 && !holdings?.length) return 0;
  if (hasOnboarding && txCount === 0 && !holdings?.length) return 1;
  if (txCount < 15 && !holdings?.length) return 2;
  return 3;
}

export function computeNetWorth(accounts, portfolioValue) {
  const accountBalance = accounts.reduce(
    (sum, a) => sum + Number(a.balance),
    0
  );
  return accountBalance + portfolioValue;
}

const TARGET_ALLOCATION = {
  CONSERVATIVE: { EQUITY: 20, DEBT: 40, GOLD: 10, MF: 20, FD: 10 },
  MODERATE: { EQUITY: 40, DEBT: 25, GOLD: 10, MF: 20, FD: 5 },
  AGGRESSIVE: { EQUITY: 60, DEBT: 10, GOLD: 5, MF: 20, FD: 5 },
};

export function detectBehavioralPatterns(transactions) {
  const expenses = transactions.filter((t) => t.type === "EXPENSE");
  const weekend = { total: 0, count: 0 };
  const weekday = { total: 0, count: 0 };
  const categoryWeekend = {};

  for (const t of expenses) {
    const day = new Date(t.date).getDay();
    const isWeekend = day === 0 || day === 6;
    const amt = Number(t.amount);
    if (isWeekend) {
      weekend.total += amt;
      weekend.count++;
      categoryWeekend[t.category] = (categoryWeekend[t.category] || 0) + amt;
    } else {
      weekday.total += amt;
      weekday.count++;
    }
  }

  const patterns = [];
  const weekendAvg = weekend.count > 0 ? weekend.total / 2 : 0;
  const weekdayAvg = weekday.count > 0 ? weekday.total / 5 : 0;

  if (weekendAvg > weekdayAvg * 1.2) {
    const topCat = Object.entries(categoryWeekend).sort((a, b) => b[1] - a[1])[0];
    patterns.push({
      type: "weekend_spike",
      message: `You spend ${Math.round(((weekendAvg / (weekdayAvg || 1)) - 1) * 100)}% more on weekends${topCat ? `, especially on ${topCat[0]}` : ""}.`,
    });
  }

  const recurring = detectRecurringBills(expenses);
  if (recurring.length > 0) {
    patterns.push({
      type: "recurring_bills",
      message: `${recurring.length} recurring bill pattern(s) detected totaling ~$${recurring.reduce((s, r) => s + r.amount, 0).toFixed(0)}/month.`,
    });
  }

  return patterns;
}

function detectRecurringBills(expenses) {
  const byCategory = {};
  for (const t of expenses) {
    const key = `${t.category}-${Math.round(Number(t.amount))}`;
    if (!byCategory[key]) byCategory[key] = [];
    byCategory[key].push(t);
  }
  return Object.entries(byCategory)
    .filter(([, txs]) => txs.length >= 2)
    .map(([key, txs]) => ({
      category: key.split("-")[0],
      amount: Number(txs[0].amount),
      occurrences: txs.length,
    }))
    .slice(0, 3);
}

export function predictEndOfMonthSurplus(transactions, spend) {
  const now = new Date();
  const daysInMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0).getDate();
  const dayOfMonth = now.getDate();
  const daysRemaining = daysInMonth - dayOfMonth;

  const dailyExpenseRate = dayOfMonth > 0 ? spend.currentExpenses / dayOfMonth : 0;
  const projectedExpenses = spend.currentExpenses + dailyExpenseRate * daysRemaining;
  const projectedIncome = spend.currentIncome;
  const surplus = projectedIncome - projectedExpenses;

  return {
    projectedExpenses: Math.round(projectedExpenses),
    projectedIncome,
    surplus: Math.round(surplus),
    suggestedInvest: surplus > 0 ? Math.round(surplus * 0.5) : 0,
    daysRemaining,
  };
}

export function computeBehavioralRiskAdjustment(context) {
  let adjustment = 0;
  const reasons = [];

  if (context.spend.savingsRate < 5) {
    adjustment -= 1;
    reasons.push("Low savings rate");
  }
  const emergency = context.goals?.find((g) =>
    g.name?.toLowerCase().includes("emergency")
  );
  if (emergency && emergency.progress < 30) {
    adjustment -= 1;
    reasons.push("Emergency fund below 30%");
  }
  if (context.spend.expenseTrend > 15) {
    adjustment -= 1;
    reasons.push("Spending up vs last month");
  }
  if (context.spend.savingsRate > 20) adjustment += 1;

  const base = context.riskProfile?.riskTolerance || "MODERATE";
  const levels = ["CONSERVATIVE", "MODERATE", "AGGRESSIVE"];
  let idx = levels.indexOf(base) + adjustment;
  idx = Math.max(0, Math.min(2, idx));

  return {
    staticRisk: base,
    behavioralRisk: levels[idx],
    adjustment,
    reasons,
  };
}

export function getRebalanceRecommendation(allocation, riskTolerance = "MODERATE") {
  const target = TARGET_ALLOCATION[riskTolerance] || TARGET_ALLOCATION.MODERATE;
  const current = allocation.reduce((acc, a) => {
    acc[a.name] = a.value;
    return acc;
  }, {});

  const drifts = Object.entries(target).map(([asset, targetPct]) => {
    const currentPct = current[asset] || 0;
    const drift = currentPct - targetPct;
    return { asset, targetPct, currentPct, drift: Math.round(drift * 10) / 10 };
  });

  const needsRebalance = drifts.some((d) => Math.abs(d.drift) > 5);

  return {
    needsRebalance,
    drifts,
    suggestion: needsRebalance
      ? drifts
          .filter((d) => Math.abs(d.drift) > 5)
          .map((d) =>
            d.drift > 0
              ? `Reduce ${d.asset} by ${Math.abs(d.drift).toFixed(0)}%`
              : `Increase ${d.asset} by ${Math.abs(d.drift).toFixed(0)}%`
          )
          .join("; ")
      : "Portfolio is within target allocation.",
  };
}

export function projectGoalScenario(goal, marketChange = 0, monthlyContribution = 0) {
  const adjustedCurrent = goal.currentAmount * (1 + marketChange / 100);
  const remaining = goal.targetAmount - adjustedCurrent;
  const monthsToGoal =
    monthlyContribution > 0 ? Math.ceil(remaining / monthlyContribution) : null;

  return {
    adjustedCurrent: Math.round(adjustedCurrent),
    remaining: Math.round(Math.max(remaining, 0)),
    monthsToGoal,
    onTrack: monthsToGoal !== null && goal.deadline
      ? monthsToGoal <=
        Math.max(
          1,
          Math.ceil(
            (new Date(goal.deadline) - new Date()) / (1000 * 60 * 60 * 24 * 30)
          )
        )
      : null,
  };
}

