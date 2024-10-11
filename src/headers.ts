import { baseHeaders } from "./const";

export function getAllHeaders(cookie: string, userAgent: string) {
  return {
    ...baseHeaders,
    'cookie': cookie,
    'user-agent': userAgent,
  }
}
