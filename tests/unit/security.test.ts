import { describe, expect, it } from 'vitest';
import { applySecurityHeaders } from '@/lib/security/headers';
import { requestIdFrom } from '@/lib/security/request-id';

describe('security foundations', () => {
  it('sets the required browser security headers', () => {
    const headers = applySecurityHeaders(new Headers());
    expect(headers.get('content-security-policy')).toContain("default-src 'self'");
    expect(headers.get('x-frame-options')).toBe('DENY');
    expect(headers.get('strict-transport-security')).toContain('max-age=');
  });

  it('preserves safe request IDs and replaces malformed IDs', () => {
    expect(requestIdFrom(new Request('http://localhost', { headers: { 'x-request-id': 'trace_123' } }))).toBe('trace_123');
    expect(requestIdFrom(new Request('http://localhost', { headers: { 'x-request-id': 'bad value' } }))).toMatch(/^[0-9a-f-]{36}$/);
  });
});
