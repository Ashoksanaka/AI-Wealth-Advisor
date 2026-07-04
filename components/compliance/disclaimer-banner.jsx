export function DisclaimerBanner({ className = "" }) {
  return (
    <p
      className={`text-xs text-muted-foreground leading-relaxed ${className}`}
      role="note"
      aria-label="Financial disclaimer"
    >
      Educational guidance only — not SEBI-regulated investment advice. Capital
      at risk. Not a substitute for certified tax or legal advice.
    </p>
  );
}
