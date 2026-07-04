import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { cn } from "@/lib/utils";

export function PageHeader({
  title,
  subtitle,
  backHref,
  backLabel = "Back",
  icon: Icon,
  children,
  className,
}) {
  return (
    <div className={cn("mb-8 space-y-4", className)}>
      {backHref && (
        <Link
          href={backHref}
          className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-primary transition-colors"
        >
          <ArrowLeft className="h-4 w-4" />
          {backLabel}
        </Link>
      )}
      <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4">
        <div className="flex items-start gap-4">
          {Icon && (
            <div className="icon-ring h-11 w-11 shrink-0">
              <Icon className="h-5 w-5" />
            </div>
          )}
          <div>
            <h1 className="display-title text-3xl sm:text-4xl">{title}</h1>
            {subtitle && (
              <p className="text-muted-foreground mt-1 text-sm">{subtitle}</p>
            )}
          </div>
        </div>
        {children}
      </div>
    </div>
  );
}
