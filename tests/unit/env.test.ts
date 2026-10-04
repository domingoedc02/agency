import { afterEach, describe, expect, it } from 'vitest';
import { readConfig } from '@/lib/config/env';

const valid = {
  NEXT_PUBLIC_SITE_URL: 'http://localhost:3000',
  NEXT_PUBLIC_SANITY_PROJECT_ID: 'project',
  NEXT_PUBLIC_SANITY_DATASET: 'development',
  NEXT_PUBLIC_ANALYTICS_CONSENT_MODE: 'opt-in',
  SANITY_API_VERSION: '2025-01-01',
  LEAD_ALLOWED_ORIGINS: 'http://localhost:3000',
};

afterEach(() => { delete process.env.ALLOWED_ORIGINS; });

describe('readConfig', () => {
  it('parses a typed server configuration', () => {
    const config = readConfig(valid);
    expect(config.siteUrl.origin).toBe('http://localhost:3000');
    expect(config.allowedOrigins).toEqual(['http://localhost:3000']);
    expect(config.analytics.consentMode).toBe('opt-in');
  });

  it('rejects legacy aliases', () => {
    expect(() => readConfig({ ...valid, ALLOWED_ORIGINS: 'http://localhost:3000' })).toThrow(/legacy/);
  });

  it('rejects a site URL outside the origin allow-list', () => {
    expect(() => readConfig({ ...valid, NEXT_PUBLIC_SITE_URL: 'https://site.example' })).toThrow(/included/);
  });
});
