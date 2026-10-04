import { describe, expect, it, beforeEach } from "vitest";
import { GET } from "@/app/api/health/route";

beforeEach(() => {
  process.env.NEXT_PUBLIC_SITE_URL = "http://localhost:3000";
  process.env.NEXT_PUBLIC_SANITY_PROJECT_ID = "project";
  process.env.NEXT_PUBLIC_SANITY_DATASET = "development";
  process.env.NEXT_PUBLIC_ANALYTICS_CONSENT_MODE = "opt-in";
  process.env.SANITY_API_VERSION = "2025-01-01";
  process.env.LEAD_ALLOWED_ORIGINS = "http://localhost:3000";
});

describe("GET /api/health", () => {
  it("returns provider-free health with request ID", async () => {
    const response = GET(
      new Request("http://localhost:3000/api/health", {
        headers: { "x-request-id": "health-test" },
      }),
    );
    expect(response.status).toBe(200);
    expect(response.headers.get("cache-control")).toBe("no-store");
    expect(response.headers.get("x-request-id")).toBe("health-test");
    await expect(response.json()).resolves.toMatchObject({ status: "ok" });
  });
});
