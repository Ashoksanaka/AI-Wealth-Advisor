export function sanitizeContextForLLM(context) {
  const { user, ...financial } = context;
  return {
    ...financial,
    customerId: user?.userId ? "masked" : undefined,
    riskProfile: financial.riskProfile
      ? {
          riskTolerance: financial.riskProfile.riskTolerance,
          investmentHorizonYears: financial.riskProfile.investmentHorizonYears,
          monthlySavingsCapacity: financial.riskProfile.monthlySavingsCapacity,
          goalsIntent: financial.riskProfile.goalsIntent
            ? "[redacted goals intent]"
            : undefined,
        }
      : null,
  };
}

export function sanitizePromptText(text) {
  if (!text) return text;
  return text
    .replace(/[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/g, "[email]")
    .replace(/\b\d{3}-\d{2}-\d{4}\b/g, "[ssn]")
    .replace(/\b\d{3}[-.\s]?\d{3}[-.\s]?\d{4}\b/g, "[phone]")
    .replace(/\b(?:Mr|Mrs|Ms|Dr)\.?\s+[A-Z][a-z]+(?:\s+[A-Z][a-z]+)?\b/g, "[name]");
}
