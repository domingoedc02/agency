import { describe, expect, it } from "vitest";
import { isPublishableCaseStudy } from "../../lib/domain/content";
import { isInquiryInput } from "../../lib/domain/inquiry";
import { SYNTHETIC_CASE_STUDY } from "../fixtures/synthetic-content";

describe("domain contracts", () => {
  it("accepts the synthetic inquiry shape and rejects unknown fields", () => {
    const input = {
      name: "Synthetic Visitor",
      email: "visitor@example.test",
      company: "Synthetic Co",
      goals: "Create a clearer consultation journey for a synthetic team.",
      budgetRange: "10k-25k",
      timeline: "this-quarter",
      privacyAccepted: true,
      idempotencyKey: "synthetic_key_1234",
      honeypot: "",
    };
    expect(isInquiryInput(input)).toBe(true);
    expect(isInquiryInput({ ...input, metadata: "forbidden" })).toBe(false);
  });

  it("only exposes verified, current, attributed case studies", () => {
    expect(
      isPublishableCaseStudy(
        SYNTHETIC_CASE_STUDY,
        new Date("2026-02-01T00:00:00.000Z"),
      ),
    ).toBe(true);
    expect(
      isPublishableCaseStudy(
        { ...SYNTHETIC_CASE_STUDY, verificationStatus: "withdrawn" },
        new Date("2026-02-01T00:00:00.000Z"),
      ),
    ).toBe(false);
    expect(
      isPublishableCaseStudy(
        { ...SYNTHETIC_CASE_STUDY, freshnessUntil: "2020-01-10T00:00:00.000Z" },
        new Date("2026-02-01T00:00:00.000Z"),
      ),
    ).toBe(false);
  });
});
