const ANXIOUS_KEYWORDS = [
  "worried",
  "panic",
  "scared",
  "crash",
  "lost money",
  "anxious",
  "stressed",
  "fear",
  "downturn",
  "emergency",
];

export function detectSentiment(message) {
  const lower = message.toLowerCase();
  const anxious = ANXIOUS_KEYWORDS.some((k) => lower.includes(k));
  return { anxious, tone: anxious ? "reassuring" : "neutral" };
}

export function getSentimentPromptModifier(sentiment) {
  if (sentiment.anxious) {
    return "The user seems anxious about their finances. Be reassuring, objective, and avoid alarmist language. Acknowledge their concern before giving advice.";
  }
  return "";
}

export function isHumanHandoffRequest(message) {
  const lower = message.toLowerCase();
  return (
    lower.includes("talk to human") ||
    lower.includes("human advisor") ||
    lower.includes("speak to someone") ||
    lower.includes("real person") ||
    lower.includes("transfer me")
  );
}

export function isEducationRequest(message) {
  const lower = message.toLowerCase();
  return (
    lower.includes("what is") ||
    lower.includes("what's") ||
    lower.includes("explain") ||
    lower.includes("how does") ||
    lower.includes("compound interest") ||
    lower.includes("expense ratio") ||
    lower.includes("diversification")
  );
}
