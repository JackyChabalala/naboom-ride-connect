import { type LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

const colorMap = {
  teal: "bg-teal",
  orange: "bg-orange",
  coral: "bg-coral",
  purple: "bg-purple",
  yellow: "bg-yellow",
  success: "bg-success",
  grey: "bg-grey",
} as const;

const sizeMap = {
  sm: "h-8 w-8",
  md: "h-12 w-12",
  lg: "h-16 w-16",
  xl: "h-20 w-20",
} as const;

const iconSizeMap = {
  sm: "h-4 w-4",
  md: "h-6 w-6",
  lg: "h-8 w-8",
  xl: "h-10 w-10",
} as const;

type BadgeColor = keyof typeof colorMap;
type BadgeSize = keyof typeof sizeMap;

interface IconBadgeProps {
  icon: LucideIcon;
  color?: BadgeColor;
  size?: BadgeSize;
  className?: string;
}

export function IconBadge({
  icon: Icon,
  color = "teal",
  size = "md",
  className,
}: IconBadgeProps) {
  const iconColor =
    color === "yellow" || color === "orange" ? "text-ink" : "text-white";

  return (
    <div
      className={cn(
        "inline-flex items-center justify-center rounded-full shadow-lg shadow-teal-900/10 shrink-0",
        colorMap[color],
        sizeMap[size],
        className
      )}
    >
      <Icon className={cn(iconSizeMap[size], iconColor)} strokeWidth={1.75} />
    </div>
  );
}
