import { cn } from "@/lib/utils";

const statusStyles: Record<
  string,
  { label: string; className: string }
> = {
  REQUESTED: {
    label: "Requested",
    className: "bg-yellow text-ink",
  },
  ACCEPTED: {
    label: "Accepted",
    className: "bg-teal text-white",
  },
  IN_PROGRESS: {
    label: "In Progress",
    className: "bg-teal text-white",
  },
  COMPLETED: {
    label: "Completed",
    className: "bg-success text-white",
  },
  CANCELLED: {
    label: "Cancelled",
    className: "bg-grey text-white",
  },
  PENDING: {
    label: "Pending",
    className: "bg-orange text-ink",
  },
  APPROVED: {
    label: "Approved",
    className: "bg-success text-white",
  },
  REJECTED: {
    label: "Rejected",
    className: "bg-coral text-white",
  },
  SUSPENDED: {
    label: "Suspended",
    className: "bg-coral text-white",
  },
  EMERGENCY: {
    label: "Emergency",
    className: "bg-coral text-white",
  },
};

interface StatusBadgeProps {
  status: string;
  className?: string;
}

export function StatusBadge({ status, className }: StatusBadgeProps) {
  const style = statusStyles[status] ?? {
    label: status,
    className: "bg-grey text-white",
  };

  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold font-inter tracking-wide",
        style.className,
        className
      )}
    >
      {style.label}
    </span>
  );
}
