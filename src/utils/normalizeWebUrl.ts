/** Trim + add scheme: http for localhost / LAN-ish hosts, https otherwise. */
export function normalizeWebUrl(raw: string): string {
  const t = raw.trim().replace(/\s/g, '');
  if (!t) {
    return raw;
  }
  if (/^https?:\/\//i.test(t)) {
    return t;
  }
  const host =
    t.split('/')[0].split('@').pop()?.split(':')[0]?.toLowerCase() ?? '';
  const useHttp =
    host === 'localhost' ||
    /^127\.0\.0\.1$/.test(host) ||
    /^10\.0\.2\.2$/.test(host) ||
    /^192\.168\.\d{1,3}\.\d{1,3}$/.test(host) ||
    /^172\.(1[6-9]|2\d|3[01])\.\d{1,3}\.\d{1,3}$/.test(host);
  return `${useHttp ? 'http' : 'https'}://${t}`;
}
