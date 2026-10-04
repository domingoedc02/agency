import type { CaseStudy, ContentRepository, ContentResult, LandingPage } from "./content";
import type { InquiryInput, LeadDeliveryPort } from "./inquiry";

export interface SanityContentPort extends ContentRepository {
  readonly provider: "sanity";
}

export interface ResendLeadPort extends LeadDeliveryPort {
  readonly provider: "resend";
}

export interface BookingPort {
  readonly provider: "cal.com";
  getRedirect(): BookingResult;
}

export type BookingResult =
  | { readonly ok: true; readonly url: string }
  | { readonly ok: false; readonly reason: "invalid-config" | "unavailable" };

export const PLAUSIBLE_EVENTS = [
  "cta-view",
  "cta-click",
  "form-start",
  "validation-error",
  "submission",
  "qualified-lead",
  "calendar-open",
  "booking",
  "fallback-email",
] as const;
export type PlausibleEventName = (typeof PLAUSIBLE_EVENTS)[number];

export interface PlausibleEventProperties {
  readonly source?: "hero" | "services" | "proof" | "contact" | "work";
  readonly service?: "strategy" | "design" | "development";
}

export interface AnalyticsPort {
  readonly provider: "plausible";
  track(name: PlausibleEventName, properties?: PlausibleEventProperties): void;
}

export type ProviderPorts = Readonly<{
  content: SanityContentPort;
  leadDelivery: ResendLeadPort;
  booking: BookingPort;
  analytics: AnalyticsPort;
}>;

export type { CaseStudy, ContentResult, InquiryInput, LandingPage };
