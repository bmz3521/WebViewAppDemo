import React from 'react';
import {
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  useColorScheme,
} from 'react-native';
import {useSafeAreaInsets} from 'react-native-safe-area-context';

type Props = {
  onOpenWebView: () => void;
};

export default function LandingScreen({onOpenWebView}: Props) {
  const isDark = useColorScheme() === 'dark';
  const insets = useSafeAreaInsets();

  return (
    <View style={[styles.container, isDark && styles.containerDark]}>
      <View
        style={[
          styles.body,
          {
            paddingTop: insets.top + 24,
            paddingBottom: insets.bottom + 24,
          },
        ]}>
        <View style={styles.hero}>
          <Text style={[styles.title, isDark && styles.textLight]}>
            Membership Demo
          </Text>
        </View>

        <TouchableOpacity
          style={styles.button}
          onPress={onOpenWebView}
          activeOpacity={0.85}>
          <Text style={styles.buttonText}>เปิด WebView</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8F9FA',
  },
  containerDark: {
    backgroundColor: '#121212',
  },
  body: {
    flex: 1,
    paddingHorizontal: 24,
    justifyContent: 'center',
  },
  hero: {
    alignItems: 'center',
    marginBottom: 40,
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    color: '#1A1A1A',
    letterSpacing: -0.5,
  },
  subtitle: {
    fontSize: 15,
    color: '#666',
    marginTop: 10,
    textAlign: 'center',
    lineHeight: 22,
    paddingHorizontal: 8,
  },
  textLight: {
    color: '#F5F5F5',
  },
  textMuted: {
    color: '#999',
  },
  button: {
    backgroundColor: '#0066FF',
    borderRadius: 14,
    paddingVertical: 16,
    alignItems: 'center',
  },
  buttonText: {
    color: '#FFF',
    fontSize: 17,
    fontWeight: '600',
  },
});
