export const REQUEST_ID_HEADER = 'x-request-id';

function randomId(): string {
  if (typeof globalThis.crypto?.randomUUID === 'function') return globalThis.crypto.randomUUID();
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (character) => {
    const value = Math.random() * 16 | 0;
    const result = character === 'x' ? value : (value & 0x3 | 0x8);
    return result.toString(16);
  });
}

export function requestIdFrom(request: Request): string {
  const supplied = request.headers.get(REQUEST_ID_HEADER);
  return supplied && /^[A-Za-z0-9._-]{1,128}$/.test(supplied) ? supplied : randomId();
}

export function withRequestId(response: Response, requestId: string): Response {
  response.headers.set(REQUEST_ID_HEADER, requestId);
  return response;
}
