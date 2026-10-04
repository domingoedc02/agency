/** Request-only inquiry contracts. Values must not be persisted or logged. */

export const BUDGET_RANGES = ["under-10k", "10k-25k", "25k-50k", "50k-plus"] as const;
export type BudgetRange = (typeof BUDGET_RANGES)[number];

export const TIMELINES = ["now", "this-quarter", "next-quarter", "exploring", "flexible"] as const;
export const budgetRanges = BUDGET_RANGES;
export const timelines = TIMELINES;
export type Timeline = (typeof TIMELINES)[number];

export interface InquiryInput {
  readonly name: string;
  readonly email: string;
  readonly company: string;
  readonly goals: string;
  readonly budgetRange: BudgetRange;
  readonly timeline: Timeline;
  readonly privacyAccepted: true;
  readonly idempotencyKey: string;
  readonly honeypot?: "";
}

export interface InquiryDeliveryReceipt {
  readonly status: "accepted";
  readonly requestId: string;
  readonly providerMessageId?: string;
}

export interface LeadDeliveryPort {
  sendInquiry(input: InquiryInput, requestId: string): Promise<DeliveryResult>;
}

export type DeliveryResult =
  | { readonly ok: true; readonly receipt: InquiryDeliveryReceipt }
  | { readonly ok: false; readonly reason: "unavailable" | "timeout" | "invalid-config" };

export function isInquiryInput(value: unknown): value is InquiryInput {
  if (!value || typeof value !== "object" || Array.isArray(value)) return false;
  const input = value as Record<string, unknown>;
  const keys = new Set(Object.keys(input));
  const allowed = new Set([
    "name",
    "email",
    "company",
    "goals",
    "budgetRange",
    "timeline",
    "privacyAccepted",
    "idempotencyKey",
    "honeypot",
  ]);
  if ([...keys].some((key) => !allowed.has(key))) return false;
  return (
    typeof input.name === "string" && input.name.trim().length >= 2 && input.name.trim().length <= 100 &&
    typeof input.email === "string" && input.email.trim().length >= 3 && input.email.trim().length <= 254 &&
    typeof input.company === "string" && input.company.trim().length >= 2 && input.company.trim().length <= 120 &&
    typeof input.goals === "string" && input.goals.trim().length >= 20 && input.goals.trim().length <= 1000 &&
    typeof input.budgetRange === "string" && (BUDGET_RANGES as readonly string[]).includes(input.budgetRange) &&
    typeof input.timeline === "string" && (TIMELINES as readonly string[]).includes(input.timeline) &&
    input.privacyAccepted === true &&
    typeof input.idempotencyKey === "string" && /^[A-Za-z0-9_-]{16,64}$/.test(input.idempotencyKey) &&
    (input.honeypot === undefined || input.honeypot === "")
  );
}
