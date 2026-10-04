import 'server-only';

const LEGACY_VARIABLES = [
  'SANITY_API_READ_TOKEN',
  'SANITY_PREVIEW_SECRET',
  'INQUIRY_DESTINATION_EMAIL',
  'RESEND_FROM_EMAIL',
  'ALLOWED_ORIGINS',
  'SANITY_REVALIDATE_SECRET',
] as const;

export type Environment =
  | 'development'
  | 'test'
  | 'preview'
  | 'staging'
  | 'production';

export interface ServerConfig {
  environment: Environment;
  siteUrl: URL;
  sanity: {
    projectId: string;
    dataset: string;
    apiVersion: string;
    readToken?: string;
    previewToken?: string;
  };
  previewSecret?: string;
  resendApiKey?: string;
  inquiryToEmail?: string;
  inquiryFromEmail?: string;
  calcomBookingUrl?: URL;
  allowedOrigins: readonly string[];
  rateLimitSalt?: string;
  analytics: {
    domain?: string;
    scriptUrl?: URL;
    consentMode: 'opt-in';
  };
}

function required(name: string): string {
  const value = process.env[name]?.trim();
  if (!value) throw new Error(`Missing required environment variable: ${name}`);
  return value;
}

function optional(name: string): string | undefined {
  const value = process.env[name]?.trim();
  return value || undefined;
}

function url(name: string, value: string, protocols: readonly string[]): URL {
  let parsed: URL;
  try {
    parsed = new URL(value);
  } catch {
    throw new Error(`${name} must be an absolute URL`);
  }
  if (!protocols.includes(parsed.protocol)) {
    throw new Error(`${name} must use ${protocols.join(' or ')}`);
  }
  if (parsed.username || parsed.password || parsed.search || parsed.hash) {
    throw new Error(`${name} must not contain credentials, query parameters, or fragments`);
  }
  return parsed;
}

function originList(value: string): readonly string[] {
  const origins = value.split(',').map((entry) => entry.trim()).filter(Boolean);
  if (!origins.length) throw new Error('LEAD_ALLOWED_ORIGINS must contain an origin');
  return origins.map((entry) => {
    const parsed = url('LEAD_ALLOWED_ORIGINS', entry, ['http:', 'https:']);
    if (parsed.pathname !== '/' || parsed.port && parsed.port === '') {
      throw new Error('LEAD_ALLOWED_ORIGINS entries must be origins without a path');
    }
    return parsed.origin;
  });
}

function environment(value: string | undefined): Environment {
  if (value === 'production' || value === 'staging' || value === 'preview' || value === 'test') return value;
  return 'development';
}

/** Validate configuration at the server boundary; never import this module from client code. */
export function readConfig(source: Partial<Record<string, string | undefined>> = process.env): ServerConfig {
  const previous = process.env;
  process.env = source as NodeJS.ProcessEnv;
  try {
    for (const name of LEGACY_VARIABLES) {
      if (optional(name)) throw new Error(`Unsupported legacy environment variable: ${name}`);
    }

    const siteUrl = url('NEXT_PUBLIC_SITE_URL', required('NEXT_PUBLIC_SITE_URL'), ['http:', 'https:']);
    const allowedOrigins = originList(required('LEAD_ALLOWED_ORIGINS'));
    if (!allowedOrigins.includes(siteUrl.origin)) {
      throw new Error('NEXT_PUBLIC_SITE_URL must be included in LEAD_ALLOWED_ORIGINS');
    }

    const consentMode = required('NEXT_PUBLIC_ANALYTICS_CONSENT_MODE');
    if (consentMode !== 'opt-in') throw new Error('NEXT_PUBLIC_ANALYTICS_CONSENT_MODE must be opt-in');

    const analyticsScript = optional('NEXT_PUBLIC_PLAUSIBLE_SCRIPT_URL');
    const calcom = optional('CALCOM_BOOKING_URL');
    const inquiryFrom = optional('INQUIRY_FROM_EMAIL');
    const inquiryTo = optional('INQUIRY_TO_EMAIL');

    return {
      environment: environment(optional('NODE_ENV')),
      siteUrl,
      sanity: {
        projectId: required('NEXT_PUBLIC_SANITY_PROJECT_ID'),
        dataset: required('NEXT_PUBLIC_SANITY_DATASET'),
        apiVersion: required('SANITY_API_VERSION'),
        readToken: optional('SANITY_READ_TOKEN'),
        previewToken: optional('SANITY_PREVIEW_TOKEN'),
      },
      previewSecret: optional('PREVIEW_SECRET'),
      resendApiKey: optional('RESEND_API_KEY'),
      inquiryToEmail: inquiryTo,
      inquiryFromEmail: inquiryFrom,
      calcomBookingUrl: calcom ? url('CALCOM_BOOKING_URL', calcom, ['https:']) : undefined,
      allowedOrigins,
      rateLimitSalt: optional('RATE_LIMIT_SALT'),
      analytics: {
        domain: optional('NEXT_PUBLIC_PLAUSIBLE_DOMAIN'),
        scriptUrl: analyticsScript ? url('NEXT_PUBLIC_PLAUSIBLE_SCRIPT_URL', analyticsScript, ['https:']) : undefined,
        consentMode: 'opt-in',
      },
    };
  } finally {
    process.env = previous;
  }
}

let cachedConfig: ServerConfig | undefined;
export function getConfig(): ServerConfig {
  return (cachedConfig ??= readConfig());
}

export function resetConfigForTests(): void {
  cachedConfig = undefined;
}
