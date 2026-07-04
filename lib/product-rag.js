import bankProducts from "@/data/bank-products.json";

export function getApprovedProducts() {
  return bankProducts;
}

export function findRelevantProducts(query = "", riskTolerance = "MODERATE") {
  const lower = query.toLowerCase();
  const words = lower.split(/\s+/).filter(Boolean);

  return bankProducts
    .map((p) => {
      let score = 0;
      if (p.riskTier === riskTolerance) score += 2;
      for (const tag of p.tags) {
        if (lower.includes(tag) || words.some((w) => tag.includes(w))) score += 1;
      }
      if (lower.includes(p.symbol.toLowerCase()) || lower.includes(p.name.toLowerCase()))
        score += 3;
      return { ...p, score };
    })
    .filter((p) => p.score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, 3);
}

export function formatProductsForPrompt(products) {
  if (!products.length) {
    return getApprovedProducts()
      .slice(0, 4)
      .map((p) => `- ${p.symbol}: ${p.name} (${p.riskTier}) — ${p.description}`)
      .join("\n");
  }
  return products
    .map((p) => `- ${p.symbol}: ${p.name} (${p.riskTier}) — ${p.description}`)
    .join("\n");
}

export function isApprovedSymbol(symbol) {
  return bankProducts.some(
    (p) => p.symbol.toUpperCase() === symbol?.toUpperCase()
  );
}

export const PRODUCT_GUARDRAIL = `Only recommend YourBank approved products listed below. Never invent stock tickers or promise guaranteed returns. If asked about unlisted securities, decline and suggest approved alternatives.`;
