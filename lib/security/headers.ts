export const SECURITY_HEADERS: ReadonlyArray<readonly [string, string]> = [
  ['Content-Security-Policy', "default-src 'self'; base-uri 'self'; object-src 'none'; frame-ancestors 'none'; form-action 'self'; script-src 'self' https://plausible.io; connect-src 'self' https://plausible.io; img-src 'self' data: https:; style-src 'self' 'unsafe-inline'; font-src 'self' https:; upgrade-insecure-requests"],
  ['Referrer-Policy', 'strict-origin-when-cross-origin'],
  ['X-Content-Type-Options', 'nosniff'],
  ['X-Frame-Options', 'DENY'],
  ['Permissions-Policy', 'camera=(), microphone=(), geolocation=(), payment=()'],
  ['Cross-Origin-Opener-Policy', 'same-origin'],
  ['Strict-Transport-Security', 'max-age=31536000; includeSubDomains; preload'],
];

export function applySecurityHeaders(headers: Headers): Headers {
  for (const [name, value] of SECURITY_HEADERS) headers.set(name, value);
  return headers;
}
