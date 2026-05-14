import React, {useState} from 'react';
import {StatusBar, useColorScheme} from 'react-native';
import {SafeAreaProvider} from 'react-native-safe-area-context';
import LandingScreen from './src/screens/LandingScreen';
import MembershipWebScreen from './src/screens/MembershipWebScreen';

type Screen = 'landing' | 'webview';

function App() {
  const isDark = useColorScheme() === 'dark';
  const [screen, setScreen] = useState<Screen>('landing');

  return (
    <SafeAreaProvider>
      <StatusBar barStyle={isDark ? 'light-content' : 'dark-content'} />
      {screen === 'landing' ? (
        <LandingScreen onOpenWebView={() => setScreen('webview')} />
      ) : (
        <MembershipWebScreen onClose={() => setScreen('landing')} />
      )}
    </SafeAreaProvider>
  );
}

export default App;
