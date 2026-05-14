/** Empty page via HTML — avoids iOS WKWebView crashes with `uri: about:blank`. */
const BLANK_HTML =
  '<!DOCTYPE html><html><head><meta charset="utf-8"/><meta name="viewport" content="width=device-width,initial-scale=1"/></head><body></body></html>';

/** Shown in the URL field placeholder until the user types and taps «ไป». */
export const MEMBERSHIP_URL_PLACEHOLDER = 'http://localhost:3000/login';

export function getMembershipWebViewSource(): {
  html: string;
  baseUrl: string;
} {
  return {html: BLANK_HTML, baseUrl: 'http://localhost:3000/'};
}
