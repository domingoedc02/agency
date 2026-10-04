import { describe, expect, it, vi } from "vitest";
import { CalcomAdapter } from "../../lib/adapters/calcom";
import { PlausibleAdapter } from "../../lib/adapters/plausible";
import { ResendAdapter } from "../../lib/adapters/resend";
import { SanityAdapter } from "../../lib/adapters/sanity";
import { SYNTHETIC_CASE_STUDY, SYNTHETIC_LANDING_PAGE } from "../fixtures/synthetic-content";

const inquiry = {
  name: "Synthetic Visitor",
  email: "visitor@example.test",
  company: "Synthetic Co",
  goals: "Create a clearer consultation journey for a synthetic team.",
  budgetRange: "10k-25k" as const,
  timeline: "this-quarter" as const,
  privacyAccepted: true as const,
  idempotencyKey: "synthetic_key_1234",
  honeypot: "" as const,
};

describe("provider boundaries", () => {
  it("uses fixed published Sanity queries and safe fallback", async () => {
    const fetch = vi.fn().mockResolvedValue(null);
    const adapter = new SanityAdapter({
      client: { fetch },
      mapLandingPage: () => null,
      mapCaseStudy: () => null,
    });
    const result = await adapter.getLandingPage();
    expect(result).toMatchObject({ ok: true, source: "fallback" });
    expect(fetch).toHaveBeenCalledWith(expect.stringContaining("!(_id in path(\"drafts.**\"))"));
  });

  it("does not send inquiry-controlled recipient, headers, or subject", async () => {
    const send = vi.fn().mockResolvedValue({ data: { id: "synthetic-message-id" } });
    const adapter = new ResendAdapter({
      client: { emails: { send } },
      from: "agency@example.test",
      to: "inbox@example.test",
    });
    const result = await adapter.sendInquiry(inquiry, "synthetic-request-id");
    expect(result.ok).toBe(true);
    expect(send).toHaveBeenCalledWith(
      expect.objectContaining({ from: "agency@example.test", to: "inbox@example.test" }),
    );
    expect(send.mock.calls[0][0].text).not.toContain("<script>");
  });

  it("rejects unsafe Cal.com destinations without redirecting", () => {
    expect(new CalcomAdapter({ bookingUrl: "http://cal.example.test/book", approvedHost: "cal.example.test" }).getRedirect()).toEqual({
      ok: false,
      reason: "invalid-config",
    });
    expect(new CalcomAdapter({ bookingUrl: "https://evil.example.test/book", approvedHost: "cal.example.test" }).getRedirect()).toEqual({
      ok: false,
      reason: "invalid-config",
    });
    expect(new CalcomAdapter({ bookingUrl: "https://cal.example.test/book", approvedHost: "cal.example.test" }).getRedirect()).toEqual({
      ok: true,
      url: "https://cal.example.test/book",
    });
  });

  it("does not dispatch Plausible before consent and swallows provider failure", () => {
    const dispatch = vi.fn().mockImplementation(() => { throw new Error("blocked"); });
    const adapter = new PlausibleAdapter({ enabled: false, dispatch });
    adapter.track("submission", { source: "contact" });
    expect(dispatch).not.toHaveBeenCalled();
    const enabled = new PlausibleAdapter({ enabled: true, dispatch });
    expect(() => enabled.track("submission", { source: "contact" })).not.toThrow();
  });

  it("keeps fixtures provider-neutral and synthetic", () => {
    expect(SYNTHETIC_LANDING_PAGE.featuredCaseStudies[0]).toBe(SYNTHETIC_CASE_STUDY);
    expect(JSON.stringify(SYNTHETIC_LANDING_PAGE)).not.toMatch(/@gmail|@yahoo|real client/i);
  });
});
