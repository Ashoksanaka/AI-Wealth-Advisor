"use server";

import { db } from "@/lib/prisma";
import { checkUser } from "@/lib/checkUser";
import { auth } from "@clerk/nextjs/server";
import { subDays } from "date-fns";
import { revalidatePath } from "next/cache";

const PERSONAS = {
  sarah: {
    label: "Sarah",
    description: "Moderate risk, high savings, balanced portfolio",
    riskProfile: {
      riskTolerance: "MODERATE",
      investmentHorizonYears: 15,
      monthlySavingsCapacity: 2000,
      goalsIntent: "Retirement and emergency fund",
      valuesPreference: "ESG",
      onboardingCompleted: true,
    },
    budget: 4000,
    accountBalance: 15000,
    holdings: [
      {
        symbol: "NIFTYBEES",
        name: "Nifty 50 ETF",
        assetClass: "EQUITY",
        quantity: 50,
        avgBuyPrice: 220,
        currentPrice: 245,
      },
      {
        symbol: "HDFC-DF",
        name: "HDFC Debt Fund",
        assetClass: "MF",
        quantity: 200,
        avgBuyPrice: 18.5,
        currentPrice: 19.2,
      },
      {
        symbol: "GOLDBEES",
        name: "Gold ETF",
        assetClass: "GOLD",
        quantity: 30,
        avgBuyPrice: 52,
        currentPrice: 58,
      },
      {
        symbol: "FD-12M",
        name: "12-Month Fixed Deposit",
        assetClass: "FD",
        quantity: 1,
        avgBuyPrice: 100000,
        currentPrice: 107000,
      },
    ],
    goals: [
      {
        name: "Retirement Fund",
        targetAmount: 500000,
        currentAmount: 125000,
        deadline: new Date(new Date().getFullYear() + 20, 0, 1),
        priority: 1,
      },
      {
        name: "Emergency Fund",
        targetAmount: 30000,
        currentAmount: 18500,
        deadline: new Date(new Date().getFullYear(), 11, 31),
        priority: 2,
      },
    ],
  },
  raj: {
    label: "Raj",
    description: "Aggressive risk, high discretionary spend, equity-heavy",
    riskProfile: {
      riskTolerance: "AGGRESSIVE",
      investmentHorizonYears: 20,
      monthlySavingsCapacity: 800,
      goalsIntent: "Dream home and wealth building",
      valuesPreference: "TECH",
      onboardingCompleted: true,
    },
    budget: 6000,
    accountBalance: 8000,
    holdings: [
      {
        symbol: "NIFTYBEES",
        name: "Nifty 50 ETF",
        assetClass: "EQUITY",
        quantity: 120,
        avgBuyPrice: 210,
        currentPrice: 245,
      },
      {
        symbol: "TECHBEES",
        name: "IT Sector ETF",
        assetClass: "EQUITY",
        quantity: 80,
        avgBuyPrice: 380,
        currentPrice: 420,
      },
      {
        symbol: "HDFC-DF",
        name: "HDFC Debt Fund",
        assetClass: "MF",
        quantity: 50,
        avgBuyPrice: 18.5,
        currentPrice: 19.2,
      },
    ],
    goals: [
      {
        name: "Dream Home",
        targetAmount: 800000,
        currentAmount: 120000,
        deadline: new Date(new Date().getFullYear() + 8, 5, 1),
        priority: 1,
      },
      {
        name: "Vacation Fund",
        targetAmount: 15000,
        currentAmount: 3200,
        deadline: new Date(new Date().getFullYear(), 7, 1),
        priority: 2,
      },
    ],
  },
};

function generateSarahTransactions(accountId, userId) {
  const transactions = [];
  const weekdayExpenses = [
    { category: "housing", amount: 1500 },
    { category: "groceries", amount: 350 },
    { category: "utilities", amount: 180 },
    { category: "transportation", amount: 120 },
  ];
  const weekendExpenses = [
    { category: "entertainment", amount: 45 },
    { category: "food", amount: 60 },
  ];

  for (let i = 90; i >= 0; i--) {
    const date = subDays(new Date(), i);
    const day = date.getDay();
    const isWeekend = day === 0 || day === 6;

    if (i % 30 === 0) {
      transactions.push({
        id: crypto.randomUUID(),
        type: "INCOME",
        amount: 6500,
        description: "Received salary",
        date,
        category: "salary",
        status: "COMPLETED",
        userId,
        accountId,
        createdAt: date,
        updatedAt: date,
      });
    }

    if (isWeekend) {
      for (const exp of weekendExpenses) {
        transactions.push({
          id: crypto.randomUUID(),
          type: "EXPENSE",
          amount: exp.amount + Math.random() * 20,
          description: `Paid for ${exp.category}`,
          date,
          category: exp.category,
          status: "COMPLETED",
          userId,
          accountId,
          createdAt: date,
          updatedAt: date,
        });
      }
    } else if (i % 3 === 0) {
      const exp = weekdayExpenses[i % weekdayExpenses.length];
      transactions.push({
        id: crypto.randomUUID(),
        type: "EXPENSE",
        amount: exp.amount,
        description: `Paid for ${exp.category}`,
        date,
        category: exp.category,
        status: "COMPLETED",
        userId,
        accountId,
        createdAt: date,
        updatedAt: date,
      });
    }
  }

  return transactions;
}

function generateRajTransactions(accountId, userId) {
  const transactions = [];
  const weekdayExpenses = [
    { category: "housing", amount: 2200 },
    { category: "transportation", amount: 250 },
    { category: "food", amount: 180 },
  ];
  const weekendExpenses = [
    { category: "entertainment", amount: 280 },
    { category: "shopping", amount: 350 },
    { category: "food", amount: 120 },
    { category: "travel", amount: 200 },
  ];

  for (let i = 90; i >= 0; i--) {
    const date = subDays(new Date(), i);
    const day = date.getDay();
    const isWeekend = day === 0 || day === 6;

    if (i % 30 === 0) {
      transactions.push({
        id: crypto.randomUUID(),
        type: "INCOME",
        amount: 5500,
        description: "Received salary",
        date,
        category: "salary",
        status: "COMPLETED",
        userId,
        accountId,
        createdAt: date,
        updatedAt: date,
      });
    }

    if (isWeekend) {
      for (const exp of weekendExpenses) {
        transactions.push({
          id: crypto.randomUUID(),
          type: "EXPENSE",
          amount: exp.amount + Math.random() * 50,
          description: `Paid for ${exp.category}`,
          date,
          category: exp.category,
          status: "COMPLETED",
          userId,
          accountId,
          createdAt: date,
          updatedAt: date,
        });
      }
    } else if (i % 2 === 0) {
      const exp = weekdayExpenses[i % weekdayExpenses.length];
      transactions.push({
        id: crypto.randomUUID(),
        type: "EXPENSE",
        amount: exp.amount,
        description: `Paid for ${exp.category}`,
        date,
        category: exp.category,
        status: "COMPLETED",
        userId,
        accountId,
        createdAt: date,
        updatedAt: date,
      });
    }
  }

  const surgeDate = subDays(new Date(), 5);
  for (let j = 0; j < 4; j++) {
    transactions.push({
      id: crypto.randomUUID(),
      type: "EXPENSE",
      amount: 400 + j * 80,
      description: "Paid for shopping",
      date: surgeDate,
      category: "shopping",
      status: "COMPLETED",
      userId,
      accountId,
      createdAt: surgeDate,
      updatedAt: surgeDate,
    });
  }

  return transactions;
}

export async function seedWealthData(personaKey = "sarah") {
  try {
    const { userId } = await auth();
    if (!userId) throw new Error("Unauthorized");

    const user = await checkUser();
    if (!user) throw new Error("User not found");

    const persona = PERSONAS[personaKey] || PERSONAS.sarah;

    let account = await db.account.findFirst({
      where: { userId: user.id, isDefault: true },
    });

    if (!account) {
      account = await db.account.findFirst({ where: { userId: user.id } });
    }

    if (!account) {
      account = await db.account.create({
        data: {
          name: "Savings Account",
          type: "SAVINGS",
          balance: persona.accountBalance,
          isDefault: true,
          userId: user.id,
        },
      });
    }

    await db.$transaction(async (tx) => {
      await tx.investmentHolding.deleteMany({ where: { userId: user.id } });
      await tx.financialGoal.deleteMany({ where: { userId: user.id } });

      await tx.investmentHolding.createMany({
        data: persona.holdings.map((h) => ({ ...h, userId: user.id })),
      });

      await tx.financialGoal.createMany({
        data: persona.goals.map((g) => ({ ...g, userId: user.id })),
      });

      await tx.riskProfile.upsert({
        where: { userId: user.id },
        update: persona.riskProfile,
        create: { ...persona.riskProfile, userId: user.id },
      });

      await tx.budget.upsert({
        where: { userId: user.id },
        update: { amount: persona.budget },
        create: { userId: user.id, amount: persona.budget },
      });

      await tx.account.update({
        where: { id: account.id },
        data: { balance: persona.accountBalance },
      });
    });

    revalidatePath("/dashboard");
    revalidatePath("/portfolio");
    revalidatePath("/goals");
    revalidatePath("/advisor");
    revalidatePath("/embed");

    return {
      success: true,
      message: `${persona.label} demo data seeded successfully`,
      persona: personaKey,
    };
  } catch (error) {
    console.error("Error seeding wealth data:", error);
    return { success: false, error: error.message };
  }
}

export async function seedTransactions(personaKey = "sarah") {
  try {
    const { userId } = await auth();
    if (!userId) throw new Error("Unauthorized");

    const user = await checkUser();
    if (!user) throw new Error("User not found");

    const persona = PERSONAS[personaKey] || PERSONAS.sarah;

    let account = await db.account.findFirst({
      where: { userId: user.id, isDefault: true },
    });

    if (!account) {
      account = await db.account.findFirst({ where: { userId: user.id } });
    }

    if (!account) {
      return {
        success: false,
        error: "No account found. Seed wealth data first or create an account.",
      };
    }

    const generator =
      personaKey === "raj"
        ? generateRajTransactions
        : generateSarahTransactions;

    const transactions = generator(account.id, user.id);
    let totalBalance = Number(persona.accountBalance) || 0;

    for (const t of transactions) {
      totalBalance += t.type === "INCOME" ? t.amount : -t.amount;
    }

    await db.$transaction(async (tx) => {
      await tx.transaction.deleteMany({
        where: { accountId: account.id },
      });

      await tx.transaction.createMany({ data: transactions });

      await tx.account.update({
        where: { id: account.id },
        data: { balance: totalBalance },
      });
    });

    revalidatePath("/dashboard");
    revalidatePath("/embed");

    return {
      success: true,
      message: `Created ${transactions.length} transactions for ${persona.label}`,
    };
  } catch (error) {
    console.error("Error seeding transactions:", error);
    return { success: false, error: error.message };
  }
}

export async function seedAllDemoData(personaKey = "sarah") {
  const wealthResult = await seedWealthData(personaKey);
  if (!wealthResult.success) return wealthResult;

  const txResult = await seedTransactions(personaKey);
  return {
    success: txResult.success,
    message: `${wealthResult.message}. ${txResult.message || txResult.error}`,
    persona: personaKey,
  };
}

export async function getDemoPersonas() {
  return Object.entries(PERSONAS).map(([key, p]) => ({
    key,
    label: p.label,
    description: p.description,
  }));
}
