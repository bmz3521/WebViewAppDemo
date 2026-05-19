/**
 * Membership WebView shell simulator — QA harness that mirrors in-app browser headers.
 *
 * @see src/theme — palettes & spacing
 * @see src/config — default URL & header names
 * @see copy.ts — UI strings
 * @see hooks/useShellWebView.ts — WebView controller hook
 */

export type {WebViewShellLaunch} from './types';
export type {ShellSessionCache} from './shellSessionCache';
export {
  readShellSessionCache,
  writeShellSessionCache,
  clearShellSessionCache,
} from './shellSessionCache';
export {
  buildShellRequestHeaders,
  nativeDetectedShellPlatform,
} from './shellHeaders';
export {LandingScreen} from './screens/LandingScreen';
export {MembershipWebScreen} from './screens/MembershipWebScreen';
