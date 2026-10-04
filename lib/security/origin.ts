import { getConfig } from '@/lib/config/env';

export function isAllowedOrigin(request: Request): boolean {
  const config = getConfig();
  const candidate = request.headers.get('origin') ?? request.headers.get('referer');
  if (!candidate) return false;
  try {
    return config.allowedOrigins.includes(new URL(candidate).origin);
  } catch {
    return false;
  }
}
