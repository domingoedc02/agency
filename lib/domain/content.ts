/** Provider-neutral editorial contracts. This module must not import a provider SDK. */

export type CtaKind = "booking" | "contact" | "internal";

export interface Cta {
  readonly kind: CtaKind;
  readonly label: string;
  /** Only used for internal CTAs; external destinations are never accepted. */
  readonly href?: `/${string}`;
}

export interface Seo {
  readonly title: string;
  readonly description: string;
}

export interface SiteSettings {
  readonly siteName: string;
  readonly description: string;
  readonly navigation: readonly Readonly<{ label: string; href: `/${string}` }>[];
  readonly defaultCta: Cta;
  readonly privacyVersion: string;
}

export interface Service {
  readonly slug: string;
  readonly title: string;
  readonly summary: string;
  readonly outcomes: readonly string[];
  readonly sortOrder: number;
  readonly publishedAt: string;
}

export interface ProcessStep {
  readonly title: string;
  readonly description: string;
  readonly sortOrder: number;
}

export interface CaseStudyMetric {
  readonly label: string;
  readonly value: string;
}

export interface CaseStudy {
  readonly slug: string;
  readonly clientContext: string;
  readonly challenge: string;
  readonly approach: string;
  readonly outcomes: readonly string[];
  readonly metrics: readonly CaseStudyMetric[];
  readonly media: readonly { alt: string; src: string }[];
  readonly sourceReference: string;
  readonly verificationStatus: "verified" | "unverified" | "withdrawn";
  readonly verifiedAt: string;
  readonly approvedBy: string;
  readonly publicAttribution: boolean;
  readonly freshnessUntil: string;
  readonly publishedAt: string;
  readonly seo: Seo;
}

export interface LandingPage {
  readonly hero: Readonly<{ eyebrow: string; title: string; summary: string }>;
  readonly intro: string;
  readonly services: readonly Service[];
  readonly process: readonly ProcessStep[];
  readonly proof: string;
  readonly featuredCaseStudies: readonly CaseStudy[];
  readonly ctas: readonly Cta[];
  readonly seo: Seo;
}

export interface ContentRepository {
  getLandingPage(): Promise<ContentResult<LandingPage>>;
  getCaseStudy(slug: string): Promise<ContentResult<CaseStudy>>;
}

export type ContentResult<T> =
  | { readonly ok: true; readonly value: T; readonly source: "provider" | "fallback" }
  | { readonly ok: false; readonly reason: "unavailable" | "invalid" | "not-found" };

export const CONTENT_FALLBACK: LandingPage = {
  hero: {
    eyebrow: "TrustMotion Agency",
    title: "Clearer digital experiences for teams ready to move.",
    summary: "A consultation is available when you are ready to discuss the next step.",
  },
  intro: "We help teams turn complex ideas into useful, credible digital experiences.",
  services: [],
  process: [],
  proof: "Selected work is shared when it has approved, current evidence.",
  featuredCaseStudies: [],
  ctas: [{ kind: "contact", label: "Start a conversation", href: "/contact" }],
  seo: {
    title: "TrustMotion Agency",
    description: "A consultation-focused digital agency.",
  },
};

const ISO_DATE = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(?:\.\d{3})?Z$/;
const SAFE_SLUG = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

/** A case study is public proof only after all evidence gates pass at read time. */
export function isPublishableCaseStudy(value: CaseStudy, now = new Date()): boolean {
  if (!value || typeof value !== "object") return false;
  if (
    typeof value.slug !== "string" ||
    typeof value.sourceReference !== "string" ||
    typeof value.approvedBy !== "string" ||
    typeof value.verifiedAt !== "string" ||
    typeof value.freshnessUntil !== "string" ||
    !Array.isArray(value.media)
  ) {
    return false;
  }
  return (
    SAFE_SLUG.test(value.slug) &&
    value.verificationStatus === "verified" &&
    value.sourceReference.length > 0 &&
    value.approvedBy.length > 0 &&
    value.publicAttribution === true &&
    ISO_DATE.test(value.verifiedAt) &&
    ISO_DATE.test(value.freshnessUntil) &&
    new Date(value.freshnessUntil).getTime() >= now.getTime() &&
    value.media.every(
      (media) =>
        media !== null &&
        typeof media === "object" &&
        typeof media.alt === "string" &&
        media.alt.trim().length > 0,
    )
  );
}

export type LandingContent = LandingPage;
export const fallbackLanding: LandingContent = {
  ...CONTENT_FALLBACK,
  hero: { eyebrow: "TrustMotion Agency", title: "Clear digital experiences for ambitious teams.", summary: "We help teams turn complex offers into confident, useful journeys that make the next step obvious." },
  intro: "Start with a focused conversation about your audience, offer, and the decision your website needs to support.",
  services: [
    { slug: "strategy", title: "Digital strategy", summary: "A practical point of view on audience, proposition, and priority.", outcomes: ["Sharper positioning", "A sequenced plan"], sortOrder: 1, publishedAt: "2026-01-01T00:00:00.000Z" },
    { slug: "experience", title: "Experience design", summary: "Accessible content and interfaces that help people understand and act.", outcomes: ["Clearer journeys", "Reusable systems"], sortOrder: 2, publishedAt: "2026-01-01T00:00:00.000Z" },
  ],
  process: [],
  proof: "We publish only evidence-backed work. Until approved case studies are available, this site makes no invented performance claims.",
  ctas: [{ kind: "booking", label: "Book a conversation" }, { kind: "contact", label: "Send an enquiry" }],
};
export function ctaHref(cta: Cta): string { return cta.kind === "booking" ? "/book" : cta.kind === "contact" ? "/contact" : cta.href ?? "/contact"; }
export function isEligibleCaseStudy(study: CaseStudy, now = new Date()): boolean { return isPublishableCaseStudy(study, now); }
