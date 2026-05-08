export const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

export const ROLES = {
  ADMIN: "ADMIN",
  SALES: "SALES",
  CREW: "CREW",
  CLIENT: "CLIENT",
} as const;

export const QUOTE_STATUSES = {
  PENDING: "PENDING",
  REVIEWING: "REVIEWING",
  APPROVED: "APPROVED",
  REJECTED: "REJECTED",
} as const;

export const EVENT_STATUSES = {
  SCHEDULED: "SCHEDULED",
  IN_PROGRESS: "IN_PROGRESS",
  COMPLETED: "COMPLETED",
  CANCELLED: "CANCELLED",
} as const;
