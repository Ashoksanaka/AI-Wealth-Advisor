import { z } from "zod";

export const riskProfileSchema = z.object({
  riskTolerance: z.enum(["CONSERVATIVE", "MODERATE", "AGGRESSIVE"]),
  investmentHorizonYears: z.coerce.number().min(1).max(50),
  monthlySavingsCapacity: z.coerce.number().min(0).optional(),
  goalsIntent: z.string().optional(),
  valuesPreference: z.string().optional(),
  onboardingCompleted: z.boolean().default(true),
  consentGivenAt: z.coerce.date().optional(),
});

export const holdingSchema = z.object({
  symbol: z.string().min(1, "Symbol is required"),
  name: z.string().min(1, "Name is required"),
  assetClass: z.enum(["EQUITY", "DEBT", "GOLD", "MF", "FD"]),
  quantity: z.coerce.number().positive("Quantity must be positive"),
  avgBuyPrice: z.coerce.number().positive("Average buy price must be positive"),
  currentPrice: z.coerce.number().positive("Current price must be positive"),
});

export const goalSchema = z.object({
  name: z.string().min(1, "Goal name is required"),
  targetAmount: z.coerce.number().positive("Target amount must be positive"),
  currentAmount: z.coerce.number().min(0).default(0),
  deadline: z.date().optional(),
  priority: z.coerce.number().min(1).max(5).default(1),
});

export const advisorMessageSchema = z.object({
  message: z.string().min(1, "Message is required").max(2000),
});
