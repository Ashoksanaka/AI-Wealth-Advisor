const COLLOQUIAL_MAP = {
  "nest egg": "retirement savings fund",
  "rainy day fund": "emergency savings",
  "piggy bank": "savings account",
  "side hustle": "additional income",
  "paycheck to paycheck": "minimal savings buffer",
  "baller": "high discretionary spending",
  broke: "low cash reserves",
  moon: "significant investment growth",
  "yolo": "high-risk speculative investment",
};

export function expandColloquialisms(message) {
  if (!message) return { expanded: message, notes: [] };

  let expanded = message;
  const notes = [];

  for (const [phrase, meaning] of Object.entries(COLLOQUIAL_MAP)) {
    const regex = new RegExp(`\\b${phrase.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}\\b`, "gi");
    if (regex.test(message)) {
      notes.push(`"${phrase}" → ${meaning}`);
      expanded = expanded.replace(regex, `${phrase} (${meaning})`);
    }
  }

  return { expanded, notes };
}
