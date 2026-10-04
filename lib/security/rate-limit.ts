const accepted = new Map<string, { count: number; expires: number }>();
const idempotency = new Map<string, { fingerprint: string; response: object; expires: number }>();

export function takeRateLimit(key: string, limit = 5, windowMs = 15 * 60_000): boolean {
  const now = Date.now();
  const current = accepted.get(key);
  if (!current || current.expires <= now) { accepted.set(key, { count: 1, expires: now + windowMs }); return true; }
  if (current.count >= limit) return false;
  current.count += 1;
  return true;
}
export function getIdempotency(key: string, fingerprint: string): { kind: "replay"; response: object } | { kind: "conflict" } | null {
  const entry = idempotency.get(key);
  if (!entry || entry.expires <= Date.now()) return null;
  return entry.fingerprint === fingerprint ? { kind: "replay", response: entry.response } : { kind: "conflict" };
}
export function saveIdempotency(key: string, fingerprint: string, response: object): void { idempotency.set(key, { fingerprint, response, expires: Date.now() + 24 * 60 * 60_000 }); }
