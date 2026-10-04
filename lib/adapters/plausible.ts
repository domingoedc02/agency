import { PLAUSIBLE_EVENTS, type AnalyticsPort, type PlausibleEventName, type PlausibleEventProperties } from "../domain/providers";

export interface PlausibleAdapterOptions {
  readonly enabled: boolean;
  readonly dispatch?: (name: string, properties?: PlausibleEventProperties) => void;
}

export class PlausibleAdapter implements AnalyticsPort {
  readonly provider = "plausible" as const;
  private readonly options: PlausibleAdapterOptions;

  constructor(options: PlausibleAdapterOptions) {
    this.options = options;
  }

  track(name: PlausibleEventName, properties?: PlausibleEventProperties): void {
    if (!this.options.enabled || !PLAUSIBLE_EVENTS.includes(name)) return;
    try {
      this.options.dispatch?.(name, properties);
    } catch {
      // Analytics is best effort and must never affect the core journey.
    }
  }
}
