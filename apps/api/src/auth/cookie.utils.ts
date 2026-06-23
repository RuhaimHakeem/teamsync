import type { Request } from 'express';

export function readCookieFromRequest(request: Request | undefined, name: string) {
  const cookieHeader = request?.headers.cookie;
  if (!cookieHeader) return undefined;

  const cookies = cookieHeader.split(';').map((cookie) => cookie.trim());
  const cookie = cookies.find((item) => item.startsWith(`${name}=`));
  if (!cookie) return undefined;

  return decodeURIComponent(cookie.slice(name.length + 1));
}
