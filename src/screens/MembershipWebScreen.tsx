import React, {useCallback, useMemo, useRef, useState} from 'react';
import {
  ActivityIndicator,
  Keyboard,
  Platform,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import {useSafeAreaInsets} from 'react-native-safe-area-context';
import WebView from 'react-native-webview';
import {
  getMembershipWebViewSource,
  MEMBERSHIP_URL_PLACEHOLDER,
} from '../config';
import {normalizeWebUrl} from '../utils/normalizeWebUrl';

// #region agent log
const dbg = (
  location: string,
  message: string,
  data: Record<string, unknown> = {},
  hypothesisId?: string,
) => {
  fetch('http://127.0.0.1:7255/ingest/ff1c509c-148f-4ec1-a6de-bcd7ec328eb4', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'X-Debug-Session-Id': '6680f3',
    },
    body: JSON.stringify({
      sessionId: '6680f3',
      runId: 'webview-login-popup',
      hypothesisId,
      location,
      message,
      data,
      timestamp: Date.now(),
    }),
  }).catch(() => {});
};
// #endregion

/** Single WebView: IdP uses flow=popup for window.open — use full redirect in the same view. */
function coerceOAuthPopupFlowForEmbeddedWebView(rawUrl: string): string {
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

// #region agent log
/**
 * Injected into every page load to capture web-side state (cookies, storage,
 * opener presence, console output, history mutations) and forward via
 * window.ReactNativeWebView.postMessage, so RN can correlate with native logs.
 */
const WEB_PROBE_JS = `
(function () {
  if (window.__rnDbgProbeInstalled) return;
  window.__rnDbgProbeInstalled = true;
  var send = function (kind, data) {
    try {
      window.ReactNativeWebView && window.ReactNativeWebView.postMessage(
        JSON.stringify({ __rnDbg: true, kind: kind, href: location.href, data: data, t: Date.now() })
      );
    } catch (e) {}
  };
  var snapshot = function (label) {
    var ls = []; var ss = [];
    try { for (var i = 0; i < localStorage.length; i++) ls.push(localStorage.key(i)); } catch (e) {}
    try { for (var j = 0; j < sessionStorage.length; j++) ss.push(sessionStorage.key(j)); } catch (e) {}
    send('snapshot', {
      label: label,
      title: document.title,
      cookie: document.cookie,
      hasOpener: !!window.opener,
      referrer: document.referrer,
      localStorageKeys: ls,
      sessionStorageKeys: ss,
    });
  };
  ['log','warn','error','info'].forEach(function (m) {
    var orig = console[m];
    console[m] = function () {
      try { send('console.' + m, Array.prototype.slice.call(arguments).map(String)); } catch (e) {}
      return orig.apply(console, arguments);
    };
  });
  ['pushState','replaceState'].forEach(function (m) {
    var orig = history[m];
    history[m] = function () {
      send('history.' + m, { to: String(arguments[2]), stack: new Error().stack });
      return orig.apply(history, arguments);
    };
  });
  window.addEventListener('popstate', function () { send('popstate', {}); });
  window.addEventListener('message', function (e) {
    var preview;
    try { preview = typeof e.data === 'string' ? e.data.slice(0, 300) : JSON.stringify(e.data).slice(0, 300); } catch (x) { preview = '??'; }
    send('message.received', { origin: e.origin, hasSource: !!e.source, preview: preview });
  });
  window.addEventListener('error', function (e) { send('window.error', { msg: String(e.message), src: e.filename + ':' + e.lineno }); });
  snapshot('initial');
  document.addEventListener('readystatechange', function () { snapshot('readystate:' + document.readyState); });
  window.addEventListener('load', function () { snapshot('load'); });
  window.addEventListener('pageshow', function () { snapshot('pageshow'); });
})();
true;
`;
// #endregion

type WebSource =
  | {uri: string}
  | {html: string; baseUrl?: string};

type Props = {
  onClose: () => void;
};

export default function MembershipWebScreen({onClose}: Props) {
  const insets = useSafeAreaInsets();
  const webViewRef = useRef<WebView>(null);
  /** Until user taps «ไป» or OAuth opens a URL, keep the bar empty — don't mirror blank-doc baseUrl. */
  const syncUrlBarFromWebViewRef = useRef(false);
  const initialSource = useMemo((): WebSource => getMembershipWebViewSource(), []);

  const [source, setSource] = useState<WebSource>(initialSource);
  const [addressDraft, setAddressDraft] = useState('');

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(false);

  const goToDraftUrl = useCallback(() => {
    const next = normalizeWebUrl(addressDraft);
    if (!next.trim()) {
      return;
    }
    Keyboard.dismiss();
    syncUrlBarFromWebViewRef.current = true;
    setAddressDraft(next);
    setSource({uri: next});
    setError(false);
    setLoading(true);
  }, [addressDraft]);

  const syncBarFromWebView = useCallback((url: string | undefined) => {
    if (!syncUrlBarFromWebViewRef.current) {
      return;
    }
    if (url && url !== 'about:blank') {
      setAddressDraft(url);
    }
  }, []);

  /** `window.open`: load OAuth URL in this WebView (no second modal). */
  const handleOpenWindow = useCallback(
    (event: {nativeEvent: {targetUrl: string}}) => {
      const raw = event.nativeEvent.targetUrl?.trim();
      const url = raw ? coerceOAuthPopupFlowForEmbeddedWebView(raw) : '';
      // #region agent log
      dbg(
        'MembershipWebScreen.tsx:handleOpenWindow',
        'onOpenWindow → main WebView',
        {
          targetUrl: event.nativeEvent.targetUrl,
          coerced: url !== raw,
          navigateTo: url,
        },
        'H4,H8',
      );
      // #endregion
      if (!url) {
        return;
      }
      Keyboard.dismiss();
      syncUrlBarFromWebViewRef.current = true;
      setAddressDraft(url);
      setSource({uri: url});
      setError(false);
      setLoading(true);
    },
    [],
  );

  return (
    <View style={styles.container}>
      <View
        style={[
          styles.urlChrome,
          {
            paddingTop: insets.top + 8,
            paddingRight: 12 + insets.right,
            paddingLeft: 12 + insets.left,
          },
        ]}>
        <View style={styles.urlChromeRow}>
          <TextInput
            style={styles.urlInput}
            value={addressDraft}
            onChangeText={setAddressDraft}
            autoFocus
            autoCapitalize="none"
            autoCorrect={false}
            keyboardType="default"
            returnKeyType="go"
            blurOnSubmit
            onSubmitEditing={goToDraftUrl}
            placeholder={MEMBERSHIP_URL_PLACEHOLDER}
            placeholderTextColor="#999"
            selectTextOnFocus={false}
          />
          <TouchableOpacity
            onPress={goToDraftUrl}
            style={styles.goButton}
            accessibilityRole="button"
            accessibilityLabel="โหลด URL">
            <Text style={styles.goButtonText}>ไป</Text>
          </TouchableOpacity>
          <TouchableOpacity
            onPress={onClose}
            style={styles.chromeClose}
            hitSlop={{top: 8, bottom: 8, left: 8, right: 8}}
            accessibilityRole="button"
            accessibilityLabel="Close membership">
            <Text style={styles.chromeCloseIcon}>✕</Text>
          </TouchableOpacity>
        </View>
      </View>

      <View style={styles.webviewContainer}>
        {error ? (
          <View style={styles.errorContainer}>
            <Text style={styles.errorText}>
              Could not load the membership page.
            </Text>
            <TouchableOpacity
              style={styles.retryButton}
              onPress={() => {
                setError(false);
                setLoading(true);
              }}>
              <Text style={styles.retryText}>Retry</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <WebView
            ref={webViewRef}
            source={source}
            style={styles.webview}
            onNavigationStateChange={nav => {
              // #region agent log
              dbg(
                'MembershipWebScreen.tsx:onNavigationStateChange',
                'nav state',
                {
                  url: nav.url,
                  title: nav.title,
                  loading: nav.loading,
                  canGoBack: nav.canGoBack,
                  navigationType: (nav as {navigationType?: string})
                    .navigationType,
                },
                'H1,H3,H4',
              );
              // #endregion
              syncBarFromWebView(nav.url);
            }}
            onLoadStart={({nativeEvent}) => {
              // #region agent log
              dbg(
                'MembershipWebScreen.tsx:onLoadStart',
                'load start',
                {url: nativeEvent.url, navType: nativeEvent.navigationType},
                'H1,H3,H5',
              );
              // #endregion
            }}
            onLoadProgress={({nativeEvent}) =>
              syncBarFromWebView(nativeEvent.url)
            }
            onLoadEnd={({nativeEvent}) => {
              // #region agent log
              dbg(
                'MembershipWebScreen.tsx:onLoadEnd',
                'load end',
                {url: nativeEvent.url, loading: nativeEvent.loading},
                'H3,H5',
              );
              // #endregion
              setLoading(false);
            }}
            onError={({nativeEvent}) => {
              // #region agent log
              dbg(
                'MembershipWebScreen.tsx:onError',
                'web view error',
                {
                  url: nativeEvent.url,
                  code: nativeEvent.code,
                  description: nativeEvent.description,
                },
                'H5',
              );
              // #endregion
              setLoading(false);
              setError(true);
            }}
            onHttpError={({nativeEvent}) => {
              // #region agent log
              dbg(
                'MembershipWebScreen.tsx:onHttpError',
                'http error',
                {
                  url: nativeEvent.url,
                  statusCode: nativeEvent.statusCode,
                  description: nativeEvent.description,
                },
                'H5',
              );
              // #endregion
              setLoading(false);
              setError(true);
            }}
            startInLoadingState={false}
            javaScriptEnabled
            javaScriptCanOpenWindowsAutomatically
            domStorageEnabled
            sharedCookiesEnabled
            allowsBackForwardNavigationGestures={Platform.OS === 'ios'}
            onOpenWindow={handleOpenWindow}
            injectedJavaScriptBeforeContentLoaded={WEB_PROBE_JS}
            onMessage={({nativeEvent}) => {
              // #region agent log
              try {
                const parsed = JSON.parse(nativeEvent.data);
                if (parsed && parsed.__rnDbg) {
                  dbg(
                    'MembershipWebScreen.tsx:onMessage',
                    `web/${parsed.kind}`,
                    {href: parsed.href, t: parsed.t, payload: parsed.data},
                    'H6,H7,H8,H9',
                  );
                  return;
                }
              } catch {}
              dbg(
                'MembershipWebScreen.tsx:onMessage',
                'web/non-json',
                {raw: String(nativeEvent.data).slice(0, 500)},
                'H6,H7,H8,H9',
              );
              // #endregion
            }}
            {...(Platform.OS === 'android'
              ? {setSupportMultipleWindows: true}
              : {})}
          />
        )}

        {loading && !error && (
          <View style={styles.loader}>
            <ActivityIndicator size="large" color="#0066FF" />
          </View>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFF',
  },
  urlChrome: {
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: '#DDD',
    backgroundColor: '#F5F5F7',
    paddingBottom: 10,
  },
  urlChromeLabel: {
    fontSize: 10,
    fontWeight: '700',
    color: '#888',
    letterSpacing: 0.8,
    marginBottom: 6,
    marginLeft: 2,
  },
  urlChromeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  urlInput: {
    flex: 1,
    minHeight: 40,
    paddingHorizontal: 10,
    paddingVertical: Platform.OS === 'ios' ? 10 : 8,
    fontSize: 13,
    fontFamily: Platform.select({ios: 'Menlo', default: 'monospace'}),
    color: '#222',
    backgroundColor: '#FFF',
    borderRadius: 8,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: 'rgba(0,0,0,0.15)',
  },
  goButton: {
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 8,
    backgroundColor: '#0066FF',
    justifyContent: 'center',
  },
  goButtonText: {
    color: '#FFF',
    fontSize: 14,
    fontWeight: '700',
  },
  chromeClose: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#FFF',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: 'rgba(0,0,0,0.1)',
  },
  chromeCloseIcon: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
  },
  webviewContainer: {
    flex: 1,
  },
  webview: {
    flex: 1,
  },
  loader: {
    ...StyleSheet.absoluteFill,
    backgroundColor: 'rgba(255,255,255,0.85)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  errorContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 32,
  },
  errorText: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    marginBottom: 16,
  },
  retryButton: {
    backgroundColor: '#0066FF',
    borderRadius: 10,
    paddingVertical: 12,
    paddingHorizontal: 28,
  },
  retryText: {
    color: '#FFF',
    fontSize: 15,
    fontWeight: '600',
  },
});
