import type { CaseStudy, LandingPage } from "../../lib/domain/content";

const SYNTHETIC_CASE_STUDY: CaseStudy = {
  slug: "synthetic-launch",
  clientContext: "Synthetic technology team",
  challenge: "A synthetic team needed a clearer launch narrative.",
  approach: "A bounded, evidence-led content refresh.",
  outcomes: ["Clearer next steps"],
  metrics: [{ label: "Synthetic outcome", value: "Improved clarity" }],
  media: [
    {
      alt: "Abstract synthetic launch illustration",
      src: "/synthetic-launch.svg",
    },
  ],
  sourceReference: "synthetic://case-study/source-001",
  verificationStatus: "verified",
  verifiedAt: "2026-01-10T00:00:00.000Z",
  approvedBy: "synthetic-reviewer",
  publicAttribution: true,
  freshnessUntil: "2099-01-10T00:00:00.000Z",
  publishedAt: "2026-01-10T00:00:00.000Z",
  seo: { title: "Synthetic launch", description: "Synthetic fixture content." },
};

export const SYNTHETIC_LANDING_PAGE: LandingPage = {
  hero: {
    eyebrow: "Synthetic fixture",
    title: "A synthetic launch story",
    summary: "Fixture content only.",
  },
  intro: "Synthetic content keeps provider tests deterministic.",
  services: [
    {
      slug: "synthetic-strategy",
      title: "Synthetic strategy",
      summary: "A fixture service.",
      outcomes: ["Deterministic tests"],
      sortOrder: 1,
      publishedAt: "2026-01-10T00:00:00.000Z",
    },
  ],
  process: [{ title: "Test", description: "Run a safe fixture", sortOrder: 1 }],
  proof: "Synthetic evidence only.",
  featuredCaseStudies: [SYNTHETIC_CASE_STUDY],
  ctas: [{ kind: "contact", label: "Contact", href: "/contact" }],
  seo: {
    title: "Synthetic fixture",
    description: "Synthetic fixture content.",
  },
};

export { SYNTHETIC_CASE_STUDY };
