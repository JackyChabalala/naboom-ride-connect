import { cn } from "@/lib/utils";

interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  lift?: boolean;
  selected?: boolean;
}

export function Card({
  className,
  lift = false,
  selected = false,
  children,
  ...props
}: CardProps) {
  return (
    <div
      className={cn(
        "rounded-2xl bg-white p-6 shadow-lg shadow-teal-900/5 border border-transparent",
        lift && "card-lift cursor-pointer",
        selected && "border-2 border-teal bg-teal/5 shadow-teal-900/10",
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
}
