import {
  CONTENT_FALLBACK,
  isPublishableCaseStudy,
  type CaseStudy,
  type ContentResult,
  type LandingPage,
} from "../domain/content";
import type { SanityContentPort } from "../domain/providers";

/** The adapter receives a narrow client so provider SDKs remain replaceable and server-only. */
export interface SanityReadClient {
  fetch<T>(query: string, params?: Readonly<Record<string, string>>): Promise<T>;
}

const LANDING_QUERY = `*[_type == "landingPage" && _id == "landingPage" && !(_id in path("drafts.**"))][0]`;
const CASE_STUDY_QUERY = `*[_type == "caseStudy" && slug.current == $slug && !(_id in path("drafts.**"))][0]`;

export interface SanityAdapterOptions {
  readonly client: SanityReadClient;
  readonly mapLandingPage: (value: unknown) => LandingPage | null;
  readonly mapCaseStudy: (value: unknown) => CaseStudy | null;
}

export class SanityAdapter implements SanityContentPort {
  readonly provider = "sanity" as const;
  private readonly options: SanityAdapterOptions;

  constructor(options: SanityAdapterOptions) {
    this.options = options;
  }

  async getLandingPage(): Promise<ContentResult<LandingPage>> {
    try {
      const raw = await this.options.client.fetch<unknown>(LANDING_QUERY);
      const page = this.options.mapLandingPage(raw);
      return page
        ? { ok: true, value: page, source: "provider" }
        : { ok: true, value: CONTENT_FALLBACK, source: "fallback" };
    } catch {
      return { ok: true, value: CONTENT_FALLBACK, source: "fallback" };
    }
  }

  async getCaseStudy(slug: string): Promise<ContentResult<CaseStudy>> {
    if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(slug)) {
      return { ok: false, reason: "not-found" };
    }
    try {
      const raw = await this.options.client.fetch<unknown>(CASE_STUDY_QUERY, { slug });
      const caseStudy = this.options.mapCaseStudy(raw);
      return caseStudy && isPublishableCaseStudy(caseStudy)
        ? { ok: true, value: caseStudy, source: "provider" }
        : { ok: false, reason: caseStudy ? "invalid" : "not-found" };
    } catch {
      return { ok: false, reason: "unavailable" };
    }
  }
}

export { CASE_STUDY_QUERY, LANDING_QUERY };
