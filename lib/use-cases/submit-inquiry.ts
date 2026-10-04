import { createHash } from "node:crypto";
import type { InquiryInput } from "@/lib/domain/inquiry";
import { deliverInquiry, type DeliveryPort } from "@/lib/adapters/resend/lead-delivery";
import { getIdempotency, saveIdempotency, takeRateLimit } from "@/lib/security/rate-limit";

export type SubmissionResult = { status: "accepted"; requestId: string; message: string };
export class SubmissionError extends Error { constructor(public code: "DUPLICATE_REQUEST" | "RATE_LIMITED" | "DELIVERY_UNAVAILABLE", public status: 409 | 429 | 503) { super(code); } }

export async function submitInquiry(input: InquiryInput, requestId: string, provider: DeliveryPort = deliverInquiry): Promise<SubmissionResult> {
  if (!takeRateLimit("global", 50, 10 * 60_000)) throw new SubmissionError("RATE_LIMITED", 429);
  const fingerprint = createHash("sha256").update(`${input.email}|${input.name}|${input.company}|${input.goals}|${input.budgetRange}|${input.timeline}`).digest("hex");
  const prior = getIdempotency(input.idempotencyKey, fingerprint);
  if (prior?.kind === "conflict") throw new SubmissionError("DUPLICATE_REQUEST", 409);
  if (prior?.kind === "replay") return prior.response as SubmissionResult;
  try { await provider(input); } catch { throw new SubmissionError("DELIVERY_UNAVAILABLE", 503); }
  const response: SubmissionResult = { status: "accepted", requestId, message: "Thanks. Your enquiry is on its way, and we will follow up soon." };
  saveIdempotency(input.idempotencyKey, fingerprint, response);
  return response;
}
