import { HTMLAttributes } from "react";
import { QUOTE_STATUSES, EVENT_STATUSES } from "@/lib/constants";

type StatusType = keyof typeof QUOTE_STATUSES | keyof typeof EVENT_STATUSES | string;

export interface BadgeProps extends HTMLAttributes<HTMLSpanElement> {
  status: StatusType;
}

export function Badge({ status, className = "", ...props }: BadgeProps) {
  let colorClass = "bg-surface-2 text-muted border-white/10"; // Default

  switch (status) {
    case QUOTE_STATUSES.PENDING:
    case EVENT_STATUSES.IN_PROGRESS:
      colorClass = "bg-accent/10 text-accent border-accent/20";
      break;
    case QUOTE_STATUSES.REVIEWING:
    case EVENT_STATUSES.SCHEDULED:
      colorClass = "bg-blue-500/10 text-blue-400 border-blue-500/20";
      break;
    case QUOTE_STATUSES.APPROVED:
    case EVENT_STATUSES.COMPLETED:
      colorClass = "bg-success/10 text-success border-success/20";
      break;
    case QUOTE_STATUSES.REJECTED:
    case EVENT_STATUSES.CANCELLED:
      colorClass = "bg-danger/10 text-danger border-danger/20";
      break;
    // Common tags
    case "SMD":
    case "SOUND":
    case "STALL":
    case "FULL_SETUP":
      colorClass = "bg-accent/10 text-accent border-accent/20";
      break;
  }

  return (
    <span
      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold border ${colorClass} ${className}`}
      {...props}
    >
      {status.replace(/_/g, " ")}
    </span>
  );
}
