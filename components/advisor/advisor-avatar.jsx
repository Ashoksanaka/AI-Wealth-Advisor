export function AdvisorAvatar({
  state = "idle",
  thinking = false,
  size = "lg",
  showLabel = true,
}) {
  const resolvedState = thinking ? "thinking" : state;

  const sizeClasses = {
    xs: "h-8 w-8",
    sm: "h-16 w-16",
    md: "h-24 w-24",
    lg: "h-32 w-32",
  };

  const ringClass = {
    idle: "border-primary/30",
    thinking: "border-primary/40 animate-ping",
    speaking: "border-primary/60 animate-pulse",
    concerned: "border-amber-500/50",
  }[resolvedState];

  const statusText = {
    idle: null,
    thinking: "Analyzing your portfolio…",
    speaking: "Speaking…",
    concerned: "I'm here to help",
  }[resolvedState];

  return (
    <div className="relative flex flex-col items-center">
      <div
        className={`relative ${sizeClasses[size]} rounded-full flex items-center justify-center`}
      >
        <span className={`absolute inset-0 rounded-full border-2 ${ringClass}`} />
        <div
          className={`absolute inset-0 rounded-full bg-gradient-to-br from-primary/20 to-primary/5 border border-primary/30 ${
            resolvedState === "concerned" ? "from-amber-500/20" : ""
          }`}
        />
        <svg
          viewBox="0 0 120 120"
          className="relative h-[85%] w-[85%]"
          aria-hidden="true"
        >
          <circle cx="60" cy="60" r="55" fill="hsl(var(--card))" />
          <ellipse cx="60" cy="52" rx="28" ry="32" fill="hsl(var(--primary) / 0.15)" />
          <circle cx="60" cy="48" r="22" fill="hsl(var(--primary) / 0.25)" />
          <circle cx="52" cy="46" r="3" fill="hsl(var(--foreground))" />
          <circle cx="68" cy="46" r="3" fill="hsl(var(--foreground))" />
          <path
            d={
              resolvedState === "concerned"
                ? "M 48 62 Q 60 58 72 62"
                : "M 48 58 Q 60 66 72 58"
            }
            stroke="hsl(var(--primary))"
            strokeWidth="2"
            fill="none"
            strokeLinecap="round"
          />
          <rect x="35" y="78" width="50" height="28" rx="8" fill="hsl(var(--primary) / 0.2)" />
        </svg>
      </div>
      {showLabel && size !== "xs" && (
        <div className="mt-3 text-center">
          <p className="font-display font-semibold text-lg">Arya</p>
          <p className="text-xs text-muted-foreground">Your Digital Wealth Advisor</p>
          {statusText && (
            <p className="text-xs text-primary mt-1 animate-pulse">{statusText}</p>
          )}
        </div>
      )}
    </div>
  );
}
