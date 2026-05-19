import React, {useCallback, useState} from 'react';
import {StatusBar, useColorScheme} from 'react-native';
import {SafeAreaProvider} from 'react-native-safe-area-context';
import {
  SHELL_HEADER_APP_NAME,
  SHELL_HEADER_PLATFORM,
} from './src/config';
import {
  LandingScreen,
  MembershipWebScreen,
  readShellSessionCache,
  writeShellSessionCache,
  type ShellSessionCache,
  type WebViewShellLaunch,
} from './src/membership-shell';
import {parseUrlToBaseAndParams} from './src/utils/parseUrlQueryParams';

type AppRoute =
  | {name: 'landing'}
  | {name: 'webview'; launch: WebViewShellLaunch};

function App() {
  const isDark = useColorScheme() === 'dark';
  const [route, setRoute] = useState<AppRoute>({name: 'landing'});
  const [sessionCache, setSessionCache] = useState<ShellSessionCache | null>(
    () => readShellSessionCache(),
  );

  const cacheLastUri = useCallback((uri: string) => {
    const parsed = parseUrlToBaseAndParams(uri);
    const next = writeShellSessionCache({
      lastLoadedUri: uri,
      baseUrl: parsed.base,
      paramRows: parsed.rows,
    });
    setSessionCache(next);
  }, []);

  return (
    <SafeAreaProvider>
      <StatusBar barStyle={isDark ? 'light-content' : 'dark-content'} />
      {route.name === 'landing' ? (
        <LandingScreen
          sessionCache={sessionCache}
          onOpenWebView={launch => {
            const parsed = parseUrlToBaseAndParams(launch.uri);
            const next = writeShellSessionCache({
              baseUrl: parsed.base,
              paramRows: parsed.rows,
              platform: launch.headers[SHELL_HEADER_PLATFORM] ?? '',
              appName: launch.headers[SHELL_HEADER_APP_NAME] ?? '',
              lastLoadedUri: launch.uri,
            });
            setSessionCache(next);
            setRoute({name: 'webview', launch});
          }}
        />
      ) : (
        <MembershipWebScreen
          initialUri={route.launch.uri}
          shellHeaders={route.launch.headers}
          onLastUriLoaded={cacheLastUri}
          onClose={() => {
            const cached = readShellSessionCache();
            if (cached) {
              setSessionCache(cached);
            }
            setRoute({name: 'landing'});
          }}
        />
      )}
    </SafeAreaProvider>
  );
}

export default App;
