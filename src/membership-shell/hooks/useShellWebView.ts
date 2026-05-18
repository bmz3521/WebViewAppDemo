import {useCallback, useEffect, useMemo, useRef, useState} from 'react';
import {Keyboard, Platform, type NativeSyntheticEvent} from 'react-native';
import type WebView from 'react-native-webview';
import type {WebViewNavigation} from 'react-native-webview';
import {normalizeWebUrl} from '../../utils/normalizeWebUrl';
import {coerceOAuthPopupFlowForEmbeddedWebView} from '../oauthWebView';
import type {WebViewUriSource} from '../webSource';

type OpenWindowEvent = {nativeEvent: {targetUrl: string}};

/** Subset of RN WebView progress payload — full type not exported from package root typings. */
type WebViewProgressNativeEvent = {
  url: string;
  loading: boolean;
  progress: number;
  title: string;
  canGoBack: boolean;
  canGoForward: boolean;
  lockIdentifier: number;
};

const OPEN_WINDOW_SKIP_PREFIXES = [
  'about:',
  // eslint-disable-next-line no-script-url -- scheme prefix guard only
  'javascript:',
  'blob:',
  'data:',
];

function stableShellHeadersKey(headers: Record<string, string>): string {
  return Object.keys(headers)
    .sort()
    .map(k => `${k}=${headers[k]}`)
    .join('|');
}

function openWindowUrlShouldBeIgnored(
  targetUrl: string,
  currentUri: string,
): boolean {
  const u = targetUrl.trim();
  if (!u) {
    return true;
  }
  const lower = u.toLowerCase();
  if (OPEN_WINDOW_SKIP_PREFIXES.some(p => lower.startsWith(p))) {
    return true;
  }
  try {
    if (new URL(u).href === new URL(currentUri).href) {
      return true;
    }
  } catch {
    /* ignore */
  }
  return false;
}

export function useShellWebView(
  initialUri: string,
  shellHeaders: Record<string, string>,
) {
  const webViewRef = useRef<WebView>(null);
  const syncUrlBarRef = useRef(true);
  /** Same logical URI as `source.uri`, updated synchronously so `onOpenWindow` can dedupe. */
  const activeUriRef = useRef(initialUri);
  const lastOpenWindowRef = useRef<{href: string; at: number} | null>(null);

  const shellHeadersKey = useMemo(
    () => stableShellHeadersKey(shellHeaders),
    [shellHeaders],
  );

  const [source, setSource] = useState<WebViewUriSource>({
    uri: initialUri,
    headers: {...shellHeaders},
  });
  const [addressDraft, setAddressDraft] = useState(initialUri);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  const withHeaders = useCallback(
    (uri: string): WebViewUriSource => ({uri, headers: {...shellHeaders}}),
    [shellHeaders],
  );

  useEffect(() => {
    syncUrlBarRef.current = true;
    activeUriRef.current = initialUri;
    setAddressDraft(initialUri);
    setSource({uri: initialUri, headers: {...shellHeaders}});
    setError(false);
    setLoading(true);
    // shellHeadersKey tracks header values so we do not reset when the parent passes a new headers object with the same content.
    // eslint-disable-next-line react-hooks/exhaustive-deps -- intentionally keyed by shellHeadersKey, not shellHeaders identity
  }, [initialUri, shellHeadersKey]);

  const submitUrl = useCallback(() => {
    const next = normalizeWebUrl(addressDraft.trim());
    if (!next) {
      return;
    }
    Keyboard.dismiss();
    syncUrlBarRef.current = true;
    activeUriRef.current = next;
    setAddressDraft(next);
    setSource(withHeaders(next));
    setError(false);
    setLoading(true);
  }, [addressDraft, withHeaders]);

  const syncUrlFromNavigation = useCallback((url: string | undefined) => {
    if (!syncUrlBarRef.current || !url || url === 'about:blank') {
      return;
    }
    activeUriRef.current = url;
    setAddressDraft(url);
  }, []);

  /** Android often fires unbalanced loadStart/loadEnd (iframes); use nav.loading + progress to drop the overlay. */
  const handleNavigationStateChange = useCallback(
    (nav: WebViewNavigation) => {
      syncUrlFromNavigation(nav.url);
      if (!nav.loading) {
        setLoading(false);
      }
    },
    [syncUrlFromNavigation],
  );

  const handleLoadProgress = useCallback(
    (event: NativeSyntheticEvent<WebViewProgressNativeEvent>) => {
      syncUrlFromNavigation(event.nativeEvent.url);
      if (
        Platform.OS === 'android' &&
        event.nativeEvent.progress >= 1 &&
        !event.nativeEvent.loading
      ) {
        setLoading(false);
      }
    },
    [syncUrlFromNavigation],
  );

  const onOpenWindow = useCallback(
    (event: OpenWindowEvent) => {
      const raw = event.nativeEvent.targetUrl?.trim();
      const url = raw ? coerceOAuthPopupFlowForEmbeddedWebView(raw) : '';
      if (!url) {
        return;
      }
      if (openWindowUrlShouldBeIgnored(url, activeUriRef.current)) {
        return;
      }
      let href = url;
      try {
        href = new URL(url).href;
      } catch {
        /* keep url */
      }
      const now = Date.now();
      const last = lastOpenWindowRef.current;
      if (last && last.href === href && now - last.at < 750) {
        return;
      }
      lastOpenWindowRef.current = {href, at: now};

      Keyboard.dismiss();
      syncUrlBarRef.current = true;
      activeUriRef.current = url;
      setAddressDraft(url);
      setSource(withHeaders(url));
      setError(false);
      setLoading(true);
    },
    [withHeaders],
  );

  const retryLoad = useCallback(() => {
    setError(false);
    setLoading(true);
    webViewRef.current?.reload();
  }, []);

  const onLoadStart = useCallback(() => setLoading(true), []);
  const onLoadEnd = useCallback(() => setLoading(false), []);
  const onLoadError = useCallback(() => {
    setLoading(false);
    setError(true);
  }, []);

  return {
    webViewRef,
    source,
    addressDraft,
    setAddressDraft,
    loading,
    error,
    submitUrl,
    handleNavigationStateChange,
    handleLoadProgress,
    onOpenWindow,
    retryLoad,
    onLoadStart,
    onLoadEnd,
    onLoadError,
  };
}
