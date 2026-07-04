import { cn } from "@/lib/utils";

export function SectionHeading({
  eyebrow,
  title,
  description,
  className,
  align = "center",
}) {
  return (
    <div
      className={cn(
        "mb-12",
        align === "center" && "text-center",
        align === "left" && "text-left",
        className
      )}
    >
      {eyebrow && <p className="eyebrow mb-3">{eyebrow}</p>}
      <h2 className="display-title text-2xl sm:text-3xl">{title}</h2>
      <div
        className={cn(
          "mt-4 h-px w-12 bg-primary/40",
          align === "center" && "mx-auto"
        )}
      />
      {description && (
        <p
          className={cn(
            "text-muted-foreground mt-4 max-w-2xl text-sm",
            align === "center" && "mx-auto"
          )}
        >
          {description}
        </p>
      )}
    </div>
  );
}
