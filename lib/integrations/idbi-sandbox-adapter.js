/**
 * IDBI Sandbox Adapter (stub)
 *
 * Maps IDBI sandbox API responses to internal wealth models.
 * Demo uses synthetic seed data; production swaps fetch calls here.
 *
 * @see docs/pitch/scope-decisions.md
 */

/** @typedef {import('@prisma/client').TransactionType} TransactionType */

/**
 * IDBI sandbox transaction shape (representative).
 * @typedef {Object} IdbiSandboxTransaction
 * @property {string} txnId
 * @property {string} accountNumber
 * @property {'CREDIT'|'DEBIT'} direction
 * @property {number} amount
 * @property {string} narration
 * @property {string} txnDate ISO date
 * @property {string} category
 * @property {string} [upiVpa]
 */

/**
 * @param {IdbiSandboxTransaction} txn
 * @returns {Object} Prisma-compatible transaction fields (without ids)
 */
export function mapIdbiTransaction(txn) {
  return {
    type: txn.direction === "CREDIT" ? "INCOME" : "EXPENSE",
    amount: txn.amount,
    description: txn.narration,
    date: new Date(txn.txnDate),
    category: mapIdbiCategory(txn.category),
    status: "COMPLETED",
  };
}

/**
 * @param {string} idbiCategory
 */
export function mapIdbiCategory(idbiCategory) {
  const map = {
    SALARY: "salary",
    UPI_TRANSFER: "other-income",
    RENT: "housing",
    GROCERY: "groceries",
    FUEL: "transportation",
    DINING: "food",
    SHOPPING: "shopping",
    ENTERTAINMENT: "entertainment",
    MSME_PAYMENT: "other-income",
    INVESTMENT: "investments",
  };
  return map[idbiCategory?.toUpperCase()] || idbiCategory?.toLowerCase() || "other";
}

/**
 * @typedef {Object} IdbiMsmeFinancials
 * @property {string} businessId
 * @property {number} monthlyRevenue
 * @property {number} monthlyExpenses
 * @property {number} creditScore
 */

/**
 * @param {IdbiMsmeFinancials} msme
 */
export function mapMsmeToRiskSignals(msme) {
  const margin =
    msme.monthlyRevenue > 0
      ? ((msme.monthlyRevenue - msme.monthlyExpenses) / msme.monthlyRevenue) * 100
      : 0;
  return {
    savingsRateProxy: Math.round(margin * 10) / 10,
    creditScore: msme.creditScore,
    segment: "MSME",
  };
}

/**
 * Fetch transactions from IDBI sandbox (stub — returns empty in prototype).
 * @param {string} bankUserId
 * @param {{ from: Date, to: Date }} range
 */
export async function fetchIdbiTransactions(bankUserId, range) {
  if (process.env.IDBI_SANDBOX_API_URL) {
    // Production: GET ${IDBI_SANDBOX_API_URL}/accounts/${bankUserId}/transactions?from=&to=
    throw new Error("IDBI sandbox integration not configured for this environment");
  }
  return [];
}

/**
 * Sync IDBI sandbox data into local store (stub).
 * @param {string} userId
 * @param {string} bankUserId
 */
export async function syncIdbiSandboxForUser(userId, bankUserId) {
  const range = {
    from: new Date(Date.now() - 90 * 24 * 60 * 60 * 1000),
    to: new Date(),
  };
  const raw = await fetchIdbiTransactions(bankUserId, range);
  return raw.map(mapIdbiTransaction);
}

export const FIELD_MAPPING = {
  idbi: {
    txnId: "externalRef (future)",
    direction: "type (INCOME|EXPENSE)",
    narration: "description",
    txnDate: "date",
    category: "category (mapped via mapIdbiCategory)",
  },
  internal: {
    account: "Account.balance, Account.type",
    holding: "InvestmentHolding.*",
    goal: "FinancialGoal.*",
    riskProfile: "RiskProfile.*",
  },
};
