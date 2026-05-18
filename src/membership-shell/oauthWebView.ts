/** Maps OAuth `flow=popup` to `redirect` so embedded WebView stays single-surface */
export function coerceOAuthPopupFlowForEmbeddedWebView(rawUrl: string): string {
  try {
    const u = new URL(rawUrl);
    if (u.searchParams.get('flow') === 'popup') {
      u.searchParams.set('flow', 'redirect');
      return u.toString();
    }
  } catch {
    /* ignore */
  }
  return rawUrl;
}
