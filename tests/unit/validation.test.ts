import { describe, expect, it } from "vitest";
import { validateInquiry } from "@/lib/security/validation";
const valid = {
  name: "Ada Lovelace",
  email: "ada@example.com",
  company: "Analytical Engines",
  goals: "We need a clearer path for teams evaluating our product.",
  budgetRange: "25k-50k",
  timeline: "this-quarter",
  privacyAccepted: true,
  idempotencyKey: "abcdefghijklmnop",
};
describe("inquiry validation", () => {
  it("accepts the exact synthetic contract", () =>
    expect(validateInquiry(valid).ok).toBe(true));
  it("rejects unknown fields and missing consent", () => {
    const result = validateInquiry({
      ...valid,
      extra: "nope",
      privacyAccepted: false,
    });
    expect(result.ok).toBe(false);
  });
  it("rejects a non-empty honeypot", () =>
    expect(validateInquiry({ ...valid, honeypot: "bot" }).ok).toBe(false));
});
