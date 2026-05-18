import React, {useState} from 'react';
import {StatusBar, useColorScheme} from 'react-native';
import {SafeAreaProvider} from 'react-native-safe-area-context';
import {
  LandingScreen,
  MembershipWebScreen,
  type WebViewShellLaunch,
} from './src/membership-shell';

type AppRoute =
  | {name: 'landing'}
  | {name: 'webview'; launch: WebViewShellLaunch};

function App() {
  const isDark = useColorScheme() === 'dark';
  const [route, setRoute] = useState<AppRoute>({name: 'landing'});

  return (
    <SafeAreaProvider>
      <StatusBar barStyle={isDark ? 'light-content' : 'dark-content'} />
      {route.name === 'landing' ? (
        <LandingScreen
          onOpenWebView={launch => setRoute({name: 'webview', launch})}
        />
      ) : (
        <MembershipWebScreen
          initialUri={route.launch.uri}
          shellHeaders={route.launch.headers}
          onClose={() => setRoute({name: 'landing'})}
        />
      )}
    </SafeAreaProvider>
  );
}

export default App;
