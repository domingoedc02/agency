import type { BookingPort, BookingResult } from "../domain/providers";

export interface CalcomAdapterOptions {
  readonly bookingUrl?: string;
  readonly approvedHost?: string;
}

export class CalcomAdapter implements BookingPort {
  readonly provider = "cal.com" as const;
  private readonly options: CalcomAdapterOptions;

  constructor(options: CalcomAdapterOptions) {
    this.options = options;
  }

  getRedirect(): BookingResult {
    const { bookingUrl, approvedHost } = this.options;
    if (!bookingUrl || !approvedHost) return { ok: false, reason: "invalid-config" };
    try {
      const url = new URL(bookingUrl);
      if (url.protocol !== "https:" || url.username || url.password || url.host !== approvedHost || url.search || url.hash) {
        return { ok: false, reason: "invalid-config" };
      }
      return { ok: true, url: url.toString() };
    } catch {
      return { ok: false, reason: "invalid-config" };
    }
  }
}
