import { type LucideIcon } from "lucide-react";
import { IconBadge } from "@/components/icon-badge";
import { cn } from "@/lib/utils";

interface EmptyStateProps {
  icon: LucideIcon;
  message: string;
  color?: "teal" | "orange" | "coral" | "purple" | "yellow" | "success" | "grey";
  className?: string;
}

export function EmptyState({
  icon,
  message,
  color = "teal",
  className,
}: EmptyStateProps) {
  return (
    <div
      className={cn(
        "flex flex-col items-center justify-center text-center py-12 px-6",
        className
      )}
    >
      <IconBadge icon={icon} color={color} size="lg" className="mb-5 opacity-90" />
      <p className="text-grey font-inter leading-relaxed max-w-sm text-sm md:text-base">
        {message}
      </p>
    </div>
  );
}
