import {useCallback, useEffect, useMemo, useRef, useState} from 'react';
import {Keyboard, type NativeSyntheticEvent} from 'react-native';
import type WebView from 'react-native-webview';
import type {WebViewNavigation} from 'react-native-webview';
import {normalizeWebUrl} from '../../utils/normalizeWebUrl';
import {coerceOAuthPopupFlowForEmbeddedWebView} from '../oauthWebView';
import type {WebViewUriSource} from '../webSource';
import {
  createUrlHistoryStack,
  historyCanGoBack,
  historyCanGoForward,
  historyGoBack,
  historyGoForward,
  historyUrlKey,
  pushUrlHistory,
  type UrlHistoryStack,
} from '../urlHistoryStack';

type OpenWindowEvent = {nativeEvent: {targetUrl: string}};

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

const LOADING_OVERLAY_MAX_MS = 6000;
const PROGRESS_DONE = 0.92;

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
  const a = historyUrlKey(u);
  const b = historyUrlKey(currentUri);
  return Boolean(a && b && a === b);
}

export function useShellWebView(
  initialUri: string,
  shellHeaders: Record<string, string>,
  onLastUriLoaded?: (uri: string) => void,
) {
  const webViewRef = useRef<WebView>(null);
  const syncUrlBarRef = useRef(true);
  const activeUriRef = useRef(initialUri);
  const lastOpenWindowRef = useRef<{href: string; at: number} | null>(null);
  const loadingTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  /** True while applying back/forward from our stack (avoid re-pushing the same URL). */
  const historyNavRef = useRef(false);
  const urlHistoryRef = useRef<UrlHistoryStack>(createUrlHistoryStack(initialUri));

  const shellHeadersKey = useMemo(
    () => stableShellHeadersKey(shellHeaders),
    [shellHeaders],
  );

  const [loadGeneration, setLoadGeneration] = useState(0);
  const [source, setSource] = useState<WebViewUriSource>({
    uri: initialUri,
    headers: {...shellHeaders},
  });
  const [addressDraft, setAddressDraft] = useState(initialUri);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [historyVersion, setHistoryVersion] = useState(0);

  const syncHistoryUi = useCallback(() => {
    setHistoryVersion(v => v + 1);
  }, []);

  const canGoBack = historyCanGoBack(urlHistoryRef.current);
  const canGoForward = historyCanGoForward(urlHistoryRef.current);
  void historyVersion;

  const withHeaders = useCallback(
    (uri: string): WebViewUriSource => ({uri, headers: {...shellHeaders}}),
    [shellHeaders],
  );

  const clearLoadingTimer = useCallback(() => {
    if (loadingTimerRef.current) {
      clearTimeout(loadingTimerRef.current);
      loadingTimerRef.current = null;
    }
  }, []);

  const endLoading = useCallback(() => {
    clearLoadingTimer();
    setLoading(false);
  }, [clearLoadingTimer]);

  const beginLoading = useCallback(() => {
    clearLoadingTimer();
    setLoading(true);
    loadingTimerRef.current = setTimeout(() => {
      loadingTimerRef.current = null;
      setLoading(false);
    }, LOADING_OVERLAY_MAX_MS);
  }, [clearLoadingTimer]);

  const notifyUriLoaded = useCallback(
    (url: string | undefined) => {
      if (!url || url === 'about:blank') {
        return;
      }
      onLastUriLoaded?.(url);
    },
    [onLastUriLoaded],
  );

  const applyUriToWebView = useCallback(
    (uri: string, opts?: {remount?: boolean; pushHistory?: boolean}) => {
      Keyboard.dismiss();
      syncUrlBarRef.current = true;
      activeUriRef.current = uri;
      setAddressDraft(uri);
      setSource(withHeaders(uri));
      setError(false);

      if (opts?.pushHistory) {
        urlHistoryRef.current = pushUrlHistory(urlHistoryRef.current, uri);
        syncHistoryUi();
      }

      if (opts?.remount) {
        setLoadGeneration(g => g + 1);
      }
      beginLoading();
    },
    [withHeaders, beginLoading, syncHistoryUi],
  );

  const recordUrlFromWebView = useCallback(
    (url: string | undefined) => {
      if (!url || url === 'about:blank') {
        return;
      }
      if (historyNavRef.current) {
        historyNavRef.current = false;
        return;
      }
      const before = urlHistoryRef.current;
      const next = pushUrlHistory(before, url);
      if (next.entries !== before.entries || next.index !== before.index) {
        urlHistoryRef.current = next;
        syncHistoryUi();
      }
    },
    [syncHistoryUi],
  );

  useEffect(
    () => () => {
      clearLoadingTimer();
    },
    [clearLoadingTimer],
  );

  useEffect(() => {
    syncUrlBarRef.current = true;
    activeUriRef.current = initialUri;
    urlHistoryRef.current = createUrlHistoryStack(initialUri);
    syncHistoryUi();
    setAddressDraft(initialUri);
    setSource({uri: initialUri, headers: {...shellHeaders}});
    setError(false);
    setLoadGeneration(g => g + 1);
    beginLoading();
    // eslint-disable-next-line react-hooks/exhaustive-deps -- shellHeadersKey not shellHeaders identity
  }, [initialUri, shellHeadersKey]);

  const navigateTo = useCallback(
    (uri: string, opts?: {remount?: boolean}) => {
      applyUriToWebView(uri, {remount: opts?.remount ?? true, pushHistory: true});
    },
    [applyUriToWebView],
  );

  const submitUrl = useCallback(() => {
    const next = normalizeWebUrl(addressDraft.trim());
    if (!next) {
      return;
    }
    navigateTo(next, {remount: true});
  }, [addressDraft, navigateTo]);

  const syncUrlFromNavigation = useCallback((url: string | undefined) => {
    if (!syncUrlBarRef.current || !url || url === 'about:blank') {
      return;
    }
    activeUriRef.current = url;
    setAddressDraft(url);
  }, []);

  const handleNavigationStateChange = useCallback(
    (nav: WebViewNavigation) => {
      syncUrlFromNavigation(nav.url);
      if (!nav.loading) {
        recordUrlFromWebView(nav.url);
        endLoading();
        notifyUriLoaded(nav.url);
      }
    },
    [syncUrlFromNavigation, recordUrlFromWebView, endLoading, notifyUriLoaded],
  );

  const goBack = useCallback(() => {
    const {stack, url} = historyGoBack(urlHistoryRef.current);
    if (!url) {
      webViewRef.current?.goBack();
      return;
    }
    urlHistoryRef.current = stack;
    syncHistoryUi();
    historyNavRef.current = true;
    applyUriToWebView(url, {remount: false, pushHistory: false});
  }, [applyUriToWebView, syncHistoryUi]);

  const goForward = useCallback(() => {
    const {stack, url} = historyGoForward(urlHistoryRef.current);
    if (!url) {
      webViewRef.current?.goForward();
      return;
    }
    urlHistoryRef.current = stack;
    syncHistoryUi();
    historyNavRef.current = true;
    applyUriToWebView(url, {remount: false, pushHistory: false});
  }, [applyUriToWebView, syncHistoryUi]);

  const handleLoadProgress = useCallback(
    (event: NativeSyntheticEvent<WebViewProgressNativeEvent>) => {
      const {url, progress} = event.nativeEvent;
      syncUrlFromNavigation(url);
      if (progress >= PROGRESS_DONE) {
        recordUrlFromWebView(url);
        endLoading();
        notifyUriLoaded(url);
      }
    },
    [syncUrlFromNavigation, recordUrlFromWebView, endLoading, notifyUriLoaded],
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
      navigateTo(url, {remount: true});
    },
    [navigateTo],
  );

  const retryLoad = useCallback(() => {
    setError(false);
    beginLoading();
    webViewRef.current?.reload();
  }, [beginLoading]);

  const onLoadEnd = useCallback(
    (event: {nativeEvent: {url: string}}) => {
      recordUrlFromWebView(event.nativeEvent.url);
      endLoading();
      notifyUriLoaded(event.nativeEvent.url);
    },
    [recordUrlFromWebView, endLoading, notifyUriLoaded],
  );

  const onLoadError = useCallback(() => {
    endLoading();
    setError(true);
  }, [endLoading]);

  return {
    webViewRef,
    loadGeneration,
    source,
    addressDraft,
    setAddressDraft,
    loading,
    error,
    canGoBack,
    canGoForward,
    goBack,
    goForward,
    submitUrl,
    handleNavigationStateChange,
    handleLoadProgress,
    onOpenWindow,
    retryLoad,
    onLoadEnd,
    onLoadError,
  };
}
