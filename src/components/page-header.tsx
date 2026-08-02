import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { cn } from "@/lib/utils";

interface PageHeaderProps {
  title: string;
  subtitle?: string;
  backHref?: string;
  action?: React.ReactNode;
  className?: string;
  light?: boolean;
}

export function PageHeader({
  title,
  subtitle,
  backHref,
  action,
  className,
  light = false,
}: PageHeaderProps) {
  return (
    <div className={cn("mb-6", className)}>
      <div className="flex items-start justify-between gap-4">
        <div className="min-w-0">
          {backHref && (
            <Link
              href={backHref}
              className={cn(
                "inline-flex items-center gap-1.5 text-sm font-medium mb-3 transition-colors",
                light
                  ? "text-cream/80 hover:text-white"
                  : "text-teal hover:text-teal-dark"
              )}
            >
              <ArrowLeft className="h-4 w-4" />
              Back
            </Link>
          )}
          <h1
            className={cn(
              "font-poppins text-2xl md:text-3xl font-bold tracking-tight leading-tight",
              light ? "text-white" : "text-ink"
            )}
          >
            {title}
          </h1>
          {subtitle && (
            <p
              className={cn(
                "mt-1.5 font-inter text-sm leading-relaxed",
                light ? "text-cream/80" : "text-grey"
              )}
            >
              {subtitle}
            </p>
          )}
        </div>
        {action && <div className="shrink-0">{action}</div>}
      </div>
    </div>
  );
}
