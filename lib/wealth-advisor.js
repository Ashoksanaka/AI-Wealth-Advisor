import { db } from "@/lib/prisma";
import {
  chatCompletion,
  parseJsonFromModelResponse,
  tryNvidiaAdvisorCompletion,
} from "@/lib/nvidia-ai";
import { expandColloquialisms } from "@/lib/colloquialisms";
import { sanitizeContextForLLM, sanitizePromptText } from "@/lib/pii-sanitizer";
import {
  findRelevantProducts,
  formatProductsForPrompt,
  PRODUCT_GUARDRAIL,
  isApprovedSymbol,
} from "@/lib/product-rag";
import {
  detectSentiment,
  getSentimentPromptModifier,
  isHumanHandoffRequest,
  isEducationRequest,
} from "@/lib/sentiment";
import {
  computeSpendBehavior,
  computePortfolioStats,
  computeGoalStats,
  computeNetWorth,
  detectBehavioralPatterns,
  predictEndOfMonthSurplus,
  computeDataRichness,
} from "@/lib/wealth-stats";
import { toNumber, serializeDecimalFields } from "@/lib/serialize";

const ARYA_SYSTEM_PROMPT = `You are Arya, a professional and empathetic digital wealth advisor for YourBank.
You provide personalized, data-driven financial guidance based on the customer's real spending habits, investments, and goals.
Keep responses concise (2-4 sentences), actionable, and warm. Reference specific numbers from their data when relevant.
Never invent data not provided in the context. If asked about topics outside wealth management, gently redirect to finances.
${PRODUCT_GUARDRAIL}
Support fractional/micro-investing — recommend starting with small amounts like $25.
When responding to chat, return JSON only:
{"text":"...","reasoning":"one sentence why","dataPoints":["specific data used"],"actions":[{"type":"link","label":"...","href":"..."},{"type":"invest_slider","label":"Invest now","min":25,"max":500,"default":50,"href":"/portfolio"},{"type":"goal_slider","label":"Boost goal contribution","min":50,"max":1000,"default":200,"href":"/goals"}]}
Use invest_slider when suggesting investments. Use goal_slider when discussing goals.`;

const ACTION_LINKS = {
  "Review spending": "/dashboard",
  "Invest surplus": "/portfolio",
  "Adjust budget": "/dashboard",
  "Update goal": "/goals",
  "Ask Arya": "/advisor",
  "View details": "/dashboard",
  "Invest now": "/portfolio",
};

export async function buildWealthContext(userId) {
  const [accounts, transactions, holdings, goals, riskProfile, budget] =
    await Promise.all([
      db.account.findMany({ where: { userId } }),
      db.transaction.findMany({ where: { userId }, orderBy: { date: "desc" } }),
      db.investmentHolding.findMany({ where: { userId } }),
      db.financialGoal.findMany({
        where: { userId },
        orderBy: { priority: "asc" },
      }),
      db.riskProfile.findUnique({ where: { userId } }),
      db.budget.findFirst({ where: { userId } }),
    ]);

  const serializedTransactions = transactions.map((t) =>
    serializeDecimalFields(t, ["amount"])
  );
  const serializedAccounts = accounts.map((a) =>
    serializeDecimalFields(a, ["balance"])
  );
  const serializedHoldings = holdings.map((h) =>
    serializeDecimalFields(h, ["quantity", "avgBuyPrice", "currentPrice"])
  );

  const spend = computeSpendBehavior(serializedTransactions);
  const portfolio = computePortfolioStats(serializedHoldings);
  const goalStats = computeGoalStats(
    goals.map((g) => serializeDecimalFields(g, ["targetAmount", "currentAmount"]))
  );
  const netWorth = computeNetWorth(serializedAccounts, portfolio.totalValue);
  const patterns = detectBehavioralPatterns(serializedTransactions);
  const cashFlow = predictEndOfMonthSurplus(serializedTransactions, spend);

  const budgetAmount = budget ? toNumber(budget.amount) : null;
  const budgetUtilization =
    budgetAmount && budgetAmount > 0
      ? (spend.currentExpenses / budgetAmount) * 100
      : null;

  const dataRichness = computeDataRichness({
    transactions: serializedTransactions,
    holdings: serializedHoldings,
    goals,
    riskProfile,
  });

  return {
    user: { userId },
    netWorth,
    accountBalance: serializedAccounts.reduce((s, a) => s + a.balance, 0),
    portfolioValue: portfolio.totalValue,
    portfolioGainLoss: portfolio.totalGainLoss,
    allocation: portfolio.allocationChart,
    holdings: portfolio.items,
    goals: goalStats,
    spend,
    patterns,
    cashFlow,
    dataRichness,
    budget: budgetAmount
      ? { amount: budgetAmount, utilization: budgetUtilization }
      : null,
    riskProfile: riskProfile
      ? {
          riskTolerance: riskProfile.riskTolerance,
          investmentHorizonYears: riskProfile.investmentHorizonYears,
          monthlySavingsCapacity: riskProfile.monthlySavingsCapacity
            ? toNumber(riskProfile.monthlySavingsCapacity)
            : null,
          goalsIntent: riskProfile.goalsIntent,
          valuesPreference: riskProfile.valuesPreference,
        }
      : null,
  };
}

function formatContextForPrompt(context) {
  const safe = sanitizeContextForLLM(context);
  const lines = [
    `Net Worth: $${safe.netWorth.toFixed(2)}`,
    `This Month Income: $${safe.spend.currentIncome.toFixed(2)}`,
    `This Month Expenses: $${safe.spend.currentExpenses.toFixed(2)}`,
    `Savings Rate: ${safe.spend.savingsRate}%`,
    `Top Spending: ${safe.spend.topCategories.map((c) => `${c.category} $${c.amount.toFixed(0)}`).join(", ") || "none"}`,
    `Projected Month Surplus: $${safe.cashFlow?.surplus ?? 0}`,
  ];

  if (safe.patterns?.length) {
    lines.push(`Patterns: ${safe.patterns.map((p) => p.message).join("; ")}`);
  }
  if (safe.budget) {
    lines.push(`Budget: $${safe.budget.amount} (${safe.budget.utilization?.toFixed(0) ?? 0}% used)`);
  }
  if (safe.riskProfile) {
    lines.push(
      `Risk: ${safe.riskProfile.riskTolerance}, Horizon: ${safe.riskProfile.investmentHorizonYears}y`
    );
    if (safe.riskProfile.valuesPreference) {
      lines.push(`Values: ${safe.riskProfile.valuesPreference}`);
    }
  }
  if (safe.holdings.length > 0) {
    lines.push(
      `Holdings: ${safe.holdings.map((h) => `${h.name} ($${h.currentValue.toFixed(0)})`).join(", ")}`
    );
  }
  if (safe.goals.length > 0) {
    lines.push(`Goals: ${safe.goals.map((g) => `${g.name} ${g.progress}%`).join(", ")}`);
  }
  return lines.join("\n");
}

function normalizeInsightFromModel(raw) {
  if (!raw) return null;

  if (typeof raw === "string") {
    return {
      title: "Personalized insight",
      summary: raw,
      action: "Ask Arya",
      reasoning: raw,
      dataPoints: [],
    };
  }

  if (typeof raw !== "object") return null;

  const title =
    raw.title ||
    raw.headline ||
    raw.name ||
    raw.insight ||
    raw.cardTitle;
  const summary =
    raw.summary ||
    raw.description ||
    raw.body ||
    raw.message ||
    raw.content ||
    raw.text;
  const action = raw.action || raw.actionLabel || raw.cta || "Ask Arya";
  const reasoning =
    raw.reasoning || raw.rationale || raw.explanation || summary || title;
  const dataPoints = raw.dataPoints || raw.data_points || raw.evidence || [];

  if (!title && !summary) return null;

  return {
    title: title || "Personalized insight",
    summary: summary || title,
    action,
    reasoning,
    dataPoints: Array.isArray(dataPoints) ? dataPoints : [],
  };
}

function normalizeInsightsFromModel(parsed) {
  if (Array.isArray(parsed)) {
    return parsed.map(normalizeInsightFromModel).filter(Boolean);
  }

  if (parsed && typeof parsed === "object") {
    const nested =
      parsed.insights || parsed.cards || parsed.recommendations || parsed.items;
    if (Array.isArray(nested)) {
      return nested.map(normalizeInsightFromModel).filter(Boolean);
    }
  }

  return [];
}

function enrichInsight(insight, context) {
  const dataPoints = [
    `Savings rate: ${context.spend.savingsRate}%`,
    `Monthly expenses: $${context.spend.currentExpenses.toFixed(0)}`,
    `Net worth: $${context.netWorth.toLocaleString()}`,
  ];
  if (context.spend.topCategories[0]) {
    dataPoints.push(
      `Top category: ${context.spend.topCategories[0].category} ($${context.spend.topCategories[0].amount.toFixed(0)})`
    );
  }
  if (context.cashFlow?.surplus) {
    dataPoints.push(`Projected surplus: $${context.cashFlow.surplus}`);
  }

  return {
    ...insight,
    reasoning: insight.reasoning || insight.summary,
    dataPoints: insight.dataPoints || dataPoints.slice(0, 3),
    href: ACTION_LINKS[insight.action] || "/advisor",
  };
}

function isDashboardNarrationRequest(message) {
  const lower = message.toLowerCase();
  return (
    lower.includes("walk me through") ||
    (lower.includes("dashboard") &&
      (lower.includes("through") || lower.includes("show") || lower.includes("explain")))
  );
}

function generateDashboardNarration(context) {
  const topGoal = context.goals[0];
  const pattern = context.patterns?.[0];
  const topCategory = context.spend.topCategories[0];

  let text = `Here's your financial snapshot. Net worth: $${context.netWorth.toLocaleString()}. You're saving ${context.spend.savingsRate}% of income this month, with expenses at $${context.spend.currentExpenses.toFixed(0)}.`;

  if (context.portfolioValue > 0) {
    text += ` Your portfolio is worth $${context.portfolioValue.toFixed(0)}`;
    if (context.portfolioGainLoss !== 0) {
      text += ` (${context.portfolioGainLoss >= 0 ? "+" : ""}$${context.portfolioGainLoss.toFixed(0)} P&L)`;
    }
    text += ".";
  }

  if (topGoal) {
    text += ` Top goal "${topGoal.name}" is ${topGoal.progress}% complete.`;
  }

  if (topCategory) {
    text += ` Biggest spend category: ${topCategory.category} ($${topCategory.amount.toFixed(0)}).`;
  }

  if (pattern) {
    text += ` I also noticed: ${pattern.message}`;
  }

  const dataPoints = [
    `Net worth: $${context.netWorth.toLocaleString()}`,
    `Savings rate: ${context.spend.savingsRate}%`,
    `Monthly expenses: $${context.spend.currentExpenses.toFixed(0)}`,
  ];
  if (topGoal) dataPoints.push(`Goal: ${topGoal.name} at ${topGoal.progress}%`);
  if (pattern) dataPoints.push(pattern.message);

  return {
    text,
    reasoning: "Narration built from your live dashboard data.",
    dataPoints,
    actions: [
      { type: "link", label: "View full dashboard", href: "/dashboard" },
      { type: "link", label: "Review portfolio", href: "/portfolio" },
    ],
  };
}

function getColdStartGreeting(context) {
  if (context.dataRichness > 1) return null;

  const risk = context.riskProfile?.riskTolerance?.toLowerCase() || "moderate";
  const horizon = context.riskProfile?.investmentHorizonYears || 10;
  const goals = context.riskProfile?.goalsIntent || "your financial goals";

  return {
    text: `Hi! I'm Arya. I don't have enough transaction history yet, but from your ${risk} risk profile and ${horizon}-year horizon, I can help you plan for ${goals}. What's your biggest financial priority right now?`,
    actions: [
      { type: "link", label: "Set a goal", href: "/goals" },
      { type: "link", label: "Learn investing basics", href: null },
    ],
  };
}

function generateFallbackInsights(context) {
  const insights = [];

  if (context.spend.savingsRate < 10) {
    insights.push({
      title: "Boost your savings rate",
      summary: `Your savings rate is ${context.spend.savingsRate}%. Consider reducing spending in ${context.spend.topCategories[0]?.category || "top categories"}.`,
      action: "Review spending",
      reasoning: "Savings below 10% threshold for your profile.",
      dataPoints: [`Savings rate: ${context.spend.savingsRate}%`],
    });
  } else {
    insights.push({
      title: "Healthy savings habit",
      summary: `You're saving ${context.spend.savingsRate}% of income — consider investing the surplus.`,
      action: "Invest surplus",
      reasoning: "Savings rate is healthy; surplus can be deployed.",
      dataPoints: [`Savings rate: ${context.spend.savingsRate}%`, `Projected surplus: $${context.cashFlow?.surplus ?? 0}`],
    });
  }

  if (context.patterns?.length > 0) {
    insights.push({
      title: "Spending pattern detected",
      summary: context.patterns[0].message,
      action: "View details",
      reasoning: "Behavioral analysis of transaction timing.",
      dataPoints: context.patterns.map((p) => p.message),
    });
  }

  if (context.budget && context.budget.utilization > 80) {
    insights.push({
      title: "Budget alert",
      summary: `You've used ${context.budget.utilization.toFixed(0)}% of your monthly budget.`,
      action: "Adjust budget",
      reasoning: "Budget utilization exceeds 80%.",
      dataPoints: [`Budget used: ${context.budget.utilization.toFixed(0)}%`],
    });
  }

  if (context.cashFlow?.suggestedInvest > 0) {
    insights.push({
      title: "Invest before you spend",
      summary: `Projected $${context.cashFlow.surplus} surplus — invest $${context.cashFlow.suggestedInvest} now.`,
      action: "Invest now",
      reasoning: "Cash flow prediction based on daily spend rate.",
      dataPoints: [`Projected surplus: $${context.cashFlow.surplus}`, `Suggested: $${context.cashFlow.suggestedInvest}`],
    });
  }

  return insights.slice(0, 5).map((i) => enrichInsight(i, context));
}

function generateEducationReply(message, context) {
  const hobby = context.riskProfile?.goalsIntent || "your goals";
  if (message.toLowerCase().includes("compound")) {
    return {
      text: `Think of compound interest like a snowball rolling downhill — your earnings generate more earnings. For ${hobby}, even $25/month can grow significantly over ${context.riskProfile?.investmentHorizonYears || 10} years.`,
      actions: [{ type: "link", label: "Invest $25", href: "/portfolio" }],
    };
  }
  return {
    text: `Great question! In simple terms: diversification means not putting all your eggs in one basket — spreading across equity, debt, and gold protects you. Given your ${context.riskProfile?.riskTolerance?.toLowerCase() || "moderate"} profile, a balanced mix works well.`,
    actions: [{ type: "link", label: "View portfolio", href: "/portfolio" }],
  };
}

function generateHandoffReply(history) {
  const summary = history
    .slice(-4)
    .map((m) => `${m.role}: ${m.content?.slice(0, 80)}`)
    .join(" | ");
  return {
    text: "I'm connecting you with a YourBank wealth specialist. They'll have full context of our conversation.",
    handoff: true,
    ticketId: `YB-${Date.now().toString(36).toUpperCase()}`,
    summary,
    actions: [],
  };
}

function generateFallbackReply(context, message) {
  const lower = message.toLowerCase();

  if (isEducationRequest(message)) return generateEducationReply(message, context);
  if (isHumanHandoffRequest(message)) return generateHandoffReply([]);
  if (isDashboardNarrationRequest(message)) return generateDashboardNarration(context);

  if (context.dataRichness <= 1) {
    return {
      text: `I don't have enough spending data yet. Based on your ${context.riskProfile?.riskTolerance?.toLowerCase() || "moderate"} profile, I recommend starting with a clear goal and building an emergency fund. What would you like to work toward first?`,
      actions: [
        { type: "link", label: "Set a goal", href: "/goals" },
        { type: "link", label: "Complete profile", href: "/onboarding" },
      ],
    };
  }

  let text = `Net worth: $${context.netWorth.toLocaleString()}, savings rate: ${context.spend.savingsRate}%.`;
  const actions = [];

  if (lower.includes("spending") || lower.includes("expense")) {
    text = `You've spent $${context.spend.currentExpenses.toFixed(0)} this month. Top category: ${context.spend.topCategories[0]?.category || "none"}.`;
    actions.push({ type: "link", label: "Review spending", href: "/dashboard" });
  } else if (lower.includes("invest") || lower.includes("portfolio")) {
    text = `Portfolio: $${context.portfolioValue.toFixed(0)}. I recommend YourBank approved products only.`;
    actions.push({ type: "link", label: "Invest $25", href: "/portfolio" });
  } else if (lower.includes("goal")) {
    const top = context.goals[0];
    text = top
      ? `Goal "${top.name}" is ${top.progress}% complete.`
      : "Set a goal to start tracking progress.";
    actions.push({ type: "link", label: "Manage goals", href: "/goals" });
  }

  return { text, actions };
}

function enrichAdvisorReply(reply, context, colloquialNotes = []) {
  const dataPoints = [
    `Net worth: $${context.netWorth.toLocaleString()}`,
    `Savings rate: ${context.spend.savingsRate}%`,
    `Monthly expenses: $${context.spend.currentExpenses.toFixed(0)}`,
    `Projected surplus: $${context.cashFlow?.surplus ?? 0}`,
  ];
  if (context.spend.topCategories[0]) {
    dataPoints.push(
      `Top category: ${context.spend.topCategories[0].category} ($${context.spend.topCategories[0].amount.toFixed(0)})`
    );
  }
  if (colloquialNotes.length) {
    dataPoints.push(`Understood terms: ${colloquialNotes.join(", ")}`);
  }

  const actions = (reply.actions || []).map((a) => {
    if (a.type === "invest_slider") {
      return {
        ...a,
        type: "invest_slider",
        min: a.min ?? 25,
        max: a.max ?? 500,
        default: a.default ?? 50,
        href: a.href || "/portfolio",
      };
    }
    if (a.type === "goal_slider") {
      return {
        ...a,
        type: "goal_slider",
        min: a.min ?? 50,
        max: a.max ?? 1000,
        default: a.default ?? 200,
        href: a.href || "/goals",
      };
    }
    return { ...a, type: a.type || "link", href: a.href || "/portfolio" };
  });

  if (
    !actions.some((a) => a.type === "invest_slider") &&
    (reply.text?.toLowerCase().includes("invest") ||
      context.cashFlow?.suggestedInvest > 0)
  ) {
    actions.push({
      type: "invest_slider",
      label: "Invest now",
      min: 25,
      max: Math.max(500, context.cashFlow?.suggestedInvest || 100),
      default: Math.max(25, context.cashFlow?.suggestedInvest || 50),
      href: "/portfolio",
    });
  }

  return {
    ...reply,
    reasoning:
      reply.reasoning ||
      "Recommendation based on your spending, savings rate, and risk profile.",
    dataPoints: reply.dataPoints?.length ? reply.dataPoints : dataPoints.slice(0, 4),
    actions,
  };
}

function buildAdvisorMessages(userId, message, history, context) {
  const sentiment = detectSentiment(message);
  const products = findRelevantProducts(
    message + (context.riskProfile?.valuesPreference || ""),
    context.riskProfile?.riskTolerance || "MODERATE"
  );
  const contextBlock = formatContextForPrompt(context);
  const sentimentMod = getSentimentPromptModifier(sentiment);

  return [
    {
      role: "system",
      content: `${ARYA_SYSTEM_PROMPT}\n${sentimentMod}\n\nApproved Products:\n${formatProductsForPrompt(products)}\n\nCustomer Data:\n${contextBlock}`,
    },
    ...history.slice(-10).map((m) => ({
      role: m.role === "USER" ? "user" : "assistant",
      content: typeof m.content === "string" ? m.content : JSON.stringify(m.content),
    })),
    { role: "user", content: sanitizePromptText(message) },
  ];
}

export async function streamAdvisorReply(userId, message, history = []) {
  const { expanded, notes } = expandColloquialisms(message);
  const context = await buildWealthContext(userId);

  if (isHumanHandoffRequest(message)) {
    return { immediate: enrichAdvisorReply(generateHandoffReply(history), context, notes) };
  }
  if (isEducationRequest(message)) {
    return { immediate: enrichAdvisorReply(generateEducationReply(message, context), context, notes) };
  }
  if (isDashboardNarrationRequest(message)) {
    return { immediate: enrichAdvisorReply(generateDashboardNarration(context), context, notes) };
  }

  const tickerMatch = message.match(/\b[A-Z]{2,10}\b/g);
  if (tickerMatch?.some((t) => !isApprovedSymbol(t))) {
    const products = findRelevantProducts(message, context.riskProfile?.riskTolerance || "MODERATE");
    return {
      immediate: enrichAdvisorReply({
        text: "I can only recommend YourBank approved products. Here are suitable options from our catalog.",
        actions: products.slice(0, 2).map((p) => ({
          type: "link",
          label: `Learn about ${p.symbol}`,
          href: "/portfolio",
        })),
      }, context, notes),
    };
  }

  if (!process.env.NVIDIA_API_KEY) {
    return { immediate: enrichAdvisorReply(generateFallbackReply(context, expanded), context, notes) };
  }

  const messages = buildAdvisorMessages(userId, expanded, history, context);

  const raw = await tryNvidiaAdvisorCompletion(messages);
  if (raw) {
    return {
      immediate: enrichAdvisorReply(
        parseAdvisorResponse(raw.trim()),
        context,
        notes
      ),
    };
  }

  return {
    immediate: enrichAdvisorReply(
      generateFallbackReply(context, expanded),
      context,
      notes
    ),
  };
}

function parseAdvisorResponse(raw) {
  try {
    const parsed = parseJsonFromModelResponse(raw);
    if (parsed.text) return parsed;
  } catch {
    // plain text
  }
  return { text: raw, actions: [] };
}

export async function generateWealthInsights(userId) {
  const context = await buildWealthContext(userId);

  if (!process.env.NVIDIA_API_KEY) {
    return generateFallbackInsights(context);
  }

  const products = findRelevantProducts(
    context.riskProfile?.valuesPreference || "",
    context.riskProfile?.riskTolerance || "MODERATE"
  );

  const prompt = sanitizePromptText(`Analyze wealth data. Return 3-5 insight cards as JSON array.
Each: title, summary, action, reasoning, dataPoints (array of strings).

Approved products:
${formatProductsForPrompt(products)}

Data:
${formatContextForPrompt(context)}`);

  try {
    const text = await chatCompletion({
      messages: [{ role: "user", content: prompt }],
      maxTokens: 1024,
      temperature: 0.3,
    });
    const parsed = parseJsonFromModelResponse(text);
    const normalized = normalizeInsightsFromModel(parsed);
    if (normalized.length > 0) {
      return normalized
        .slice(0, 5)
        .map((i) => enrichInsight(i, context));
    }
  } catch (error) {
    console.error("Error generating wealth insights:", error);
  }

  return generateFallbackInsights(context);
}

export async function chatWithAdvisor(userId, message, history = []) {
  const { expanded, notes } = expandColloquialisms(message);
  const context = await buildWealthContext(userId);

  if (isHumanHandoffRequest(message)) {
    return enrichAdvisorReply(generateHandoffReply(history), context, notes);
  }

  if (isEducationRequest(message)) {
    return enrichAdvisorReply(generateEducationReply(message, context), context, notes);
  }

  if (isDashboardNarrationRequest(message)) {
    return enrichAdvisorReply(generateDashboardNarration(context), context, notes);
  }

  const products = findRelevantProducts(
    message + (context.riskProfile?.valuesPreference || ""),
    context.riskProfile?.riskTolerance || "MODERATE"
  );

  const tickerMatch = message.match(/\b[A-Z]{2,10}\b/g);
  if (tickerMatch?.some((t) => !isApprovedSymbol(t))) {
    return enrichAdvisorReply({
      text: "I can only recommend YourBank approved products. Here are suitable options from our catalog.",
      actions: products.slice(0, 2).map((p) => ({
        type: "link",
        label: `Learn about ${p.symbol}`,
        href: "/portfolio",
      })),
    }, context, notes);
  }

  if (!process.env.NVIDIA_API_KEY) {
    return enrichAdvisorReply(generateFallbackReply(context, expanded), context, notes);
  }

  const messages = buildAdvisorMessages(userId, expanded, history, context);

  try {
    const reply = await chatCompletion({
      messages,
      maxTokens: 512,
      temperature: 0.4,
    });
    return enrichAdvisorReply(parseAdvisorResponse(reply.trim()), context, notes);
  } catch (error) {
    console.error("Advisor chat error:", error);
    return enrichAdvisorReply({
      text: "I'm having trouble reaching the vault right now. Let's try again in a moment.",
      actions: [],
      error: true,
    }, context, notes);
  }
}

export { ARYA_SYSTEM_PROMPT, enrichAdvisorReply, parseAdvisorResponse, getColdStartGreeting, generateDashboardNarration };
