import { budgetRanges, timelines, type InquiryInput } from "@/lib/domain/inquiry";

export const MAX_BODY_BYTES = 16 * 1024;
const keys = ["name", "email", "company", "goals", "budgetRange", "timeline", "privacyAccepted", "idempotencyKey", "honeypot"] as const;
const controls = /[\u0000-\u0008\u000b\u000c\u000e-\u001f\u007f\r\n‪-‮⁦-⁩]/u;
const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/u;
const keyPattern = /^[A-Za-z0-9._~-]{16,64}$/u;

function text(value: unknown, min: number, max: number): string | null {
  if (typeof value !== "string") return null;
  const normalized = value.normalize("NFC").trim().replace(/\s+/gu, " ");
  return normalized.length >= min && normalized.length <= max && !controls.test(normalized) && !/[<>]/u.test(normalized) ? normalized : null;
}

export type ValidationResult = { ok: true; value: InquiryInput } | { ok: false; fields: Record<string, string> };

export function validateInquiry(input: unknown): ValidationResult {
  if (!input || typeof input !== "object" || Array.isArray(input)) return { ok: false, fields: { form: "Enter the requested details." } };
  const object = input as Record<string, unknown>;
  const unknown = Object.keys(object).filter((key) => !keys.includes(key as (typeof keys)[number]));
  if (unknown.length || Object.getPrototypeOf(object) !== Object.prototype) return { ok: false, fields: { form: "Enter the requested details." } };
  const name = text(object.name, 2, 100);
  const email = text(object.email, 3, 254)?.toLowerCase();
  const company = text(object.company, 2, 120);
  const goals = text(object.goals, 20, 1000);
  const idempotencyKey = typeof object.idempotencyKey === "string" && keyPattern.test(object.idempotencyKey) ? object.idempotencyKey : null;
  const fields: Record<string, string> = {};
  if (!name) fields.name = "Enter your name.";
  if (!email || !emailPattern.test(email)) fields.email = "Enter a valid email.";
  if (!company) fields.company = "Enter your company.";
  if (!goals) fields.goals = "Tell us a little about your goals.";
  if (!budgetRanges.includes(object.budgetRange as (typeof budgetRanges)[number])) fields.budgetRange = "Choose a budget range.";
  if (!timelines.includes(object.timeline as (typeof timelines)[number])) fields.timeline = "Choose a timeline.";
  if (object.privacyAccepted !== true) fields.privacyAccepted = "Accept the privacy notice to continue.";
  if (!idempotencyKey) fields.idempotencyKey = "Refresh the page and try again.";
  if (object.honeypot !== undefined && object.honeypot !== "") fields.form = "Enter the requested details.";
  if (Object.keys(fields).length) return { ok: false, fields };
  return { ok: true, value: { name: name!, email: email!, company: company!, goals: goals!, budgetRange: object.budgetRange as InquiryInput["budgetRange"], timeline: object.timeline as InquiryInput["timeline"], privacyAccepted: true, idempotencyKey: idempotencyKey!, honeypot: "" } };
}
