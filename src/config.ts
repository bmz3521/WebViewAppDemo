/**
 * App-wide defaults for the membership shell simulator.
 * Feature UI & logic live under `src/membership-shell/`; theme tokens under `src/theme/`.
 */

/** Default portal URL for QA — editable on the landing screen. */
export const DEFAULT_MEMBERSHIP_WEBVIEW_URL =
  'http://localhost:3000/api/oauth/sessions?';

/** Example base for OAuth session handoff (append `token`, `redirect_uri`, etc. as query rows). */
export const DEFAULT_OAUTH_SESSIONS_BASE_URL =
  'https://membership.trueid-preprod.net/api/oauth/sessions';

/** Sent as `x-appname` unless overridden on the landing screen. */
export const DEFAULT_SHELL_APP_NAME = 'trueid';

/**
 * HTTP header names — ฝั่งเว็บอ่านค่าเหล่านี้เพื่อตั้งโหมด in-app / mobile shell
 * (ค่าไม่ sensitive ตามที่ตกลงกับทีม web).
 */
export const SHELL_HEADER_PLATFORM = 'x-platform';
export const SHELL_HEADER_APP_NAME = 'x-appname';

/** Legacy placeholder — same as default portal URL. */
export const MEMBERSHIP_URL_PLACEHOLDER = DEFAULT_MEMBERSHIP_WEBVIEW_URL;
