import React from 'react';
import {
  ActivityIndicator,
  Platform,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import {useSafeAreaInsets} from 'react-native-safe-area-context';
import WebView from 'react-native-webview';
import {MEMBERSHIP_URL_PLACEHOLDER} from '../../config';
import {radius, spacing, useThemePalette} from '../../theme';
import {webViewCopy} from '../copy';
import {ShellHeaderChips} from '../components/ShellHeaderChips';
import {useShellWebView} from '../hooks/useShellWebView';

export type MembershipWebScreenProps = {
  initialUri: string;
  shellHeaders: Record<string, string>;
  onClose: () => void;
  onLastUriLoaded?: (uri: string) => void;
};

export function MembershipWebScreen({
  initialUri,
  shellHeaders,
  onClose,
  onLastUriLoaded,
}: MembershipWebScreenProps) {
  const palette = useThemePalette();
  const insets = useSafeAreaInsets();
  const wv = useShellWebView(initialUri, shellHeaders, onLastUriLoaded);

  return (
    <View style={[styles.flex, {backgroundColor: palette.background}]}>
      <View
        style={[
          styles.chrome,
          {
            paddingTop: insets.top + spacing.sm,
            paddingBottom: spacing.md,
            paddingHorizontal: spacing.md,
            borderBottomColor: palette.border,
            backgroundColor: palette.surface,
          },
        ]}>
        <View style={styles.topBar}>
          <Text
            style={[styles.chromeTitle, {color: palette.textMuted}]}
            numberOfLines={1}>
            {webViewCopy.screenTitle}
          </Text>
          <TouchableOpacity
            onPress={onClose}
            style={[
              styles.closeBtn,
              {
                backgroundColor: palette.surfaceElevated,
                borderColor: palette.border,
              },
            ]}
            hitSlop={{top: 8, bottom: 8, left: 8, right: 8}}
            accessibilityRole="button"
            accessibilityLabel="Close WebView">
            <Text style={[styles.closeBtnText, {color: palette.textSecondary}]}>
              ✕
            </Text>
          </TouchableOpacity>
        </View>
        <ShellHeaderChips palette={palette} headers={shellHeaders} />
        <Text style={[styles.hint, {color: palette.textMuted}]}>
          {webViewCopy.hintReload}
        </Text>

        <View style={styles.urlRow}>
          <TouchableOpacity
            onPress={wv.goBack}
            disabled={!wv.canGoBack}
            style={[
              styles.navBtn,
              {
                backgroundColor: palette.surfaceElevated,
                borderColor: palette.border,
                opacity: wv.canGoBack ? 1 : 0.38,
              },
            ]}
            accessibilityRole="button"
            accessibilityLabel={webViewCopy.historyBack}
            accessibilityState={{disabled: !wv.canGoBack}}>
            <Text style={[styles.navBtnIcon, {color: palette.textPrimary}]}>
              ‹
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            onPress={wv.goForward}
            disabled={!wv.canGoForward}
            style={[
              styles.navBtn,
              {
                backgroundColor: palette.surfaceElevated,
                borderColor: palette.border,
                opacity: wv.canGoForward ? 1 : 0.38,
              },
            ]}
            accessibilityRole="button"
            accessibilityLabel={webViewCopy.historyForward}
            accessibilityState={{disabled: !wv.canGoForward}}>
            <Text style={[styles.navBtnIcon, {color: palette.textPrimary}]}>
              ›
            </Text>
          </TouchableOpacity>
          <TextInput
            style={[
              styles.urlInput,
              {
                color: palette.textPrimary,
                backgroundColor: palette.surfaceElevated,
                borderColor: palette.borderStrong,
              },
            ]}
            value={wv.addressDraft}
            onChangeText={wv.setAddressDraft}
            autoCapitalize="none"
            autoCorrect={false}
            keyboardType="default"
            returnKeyType="go"
            blurOnSubmit
            onSubmitEditing={wv.submitUrl}
            placeholder={MEMBERSHIP_URL_PLACEHOLDER}
            placeholderTextColor={palette.textMuted}
            accessibilityLabel="WebView URL"
          />
          <TouchableOpacity
            onPress={wv.submitUrl}
            style={[styles.goBtn, {backgroundColor: palette.accent}]}
            accessibilityRole="button"
            accessibilityLabel="Load URL">
            <Text style={[styles.goBtnText, {color: palette.onAccent}]}>ไป</Text>
          </TouchableOpacity>
        </View>
      </View>

      <View style={styles.webWrap}>
        {wv.error ? (
          <View style={styles.errorBox}>
            <Text style={[styles.errorTitle, {color: palette.textPrimary}]}>
              {webViewCopy.loadFailedTitle}
            </Text>
            <TouchableOpacity
              style={[styles.retryBtn, {backgroundColor: palette.accent}]}
              onPress={wv.retryLoad}>
              <Text style={[styles.retryBtnText, {color: palette.onAccent}]}>
                {webViewCopy.retry}
              </Text>
            </TouchableOpacity>
          </View>
        ) : (
          <WebView
            key={`shell-wv-${wv.loadGeneration}`}
            ref={wv.webViewRef}
            source={wv.source}
            style={[styles.webview, {backgroundColor: palette.surface}]}
            onNavigationStateChange={wv.handleNavigationStateChange}
            onLoadProgress={wv.handleLoadProgress}
            onLoadEnd={wv.onLoadEnd}
            onError={wv.onLoadError}
            onHttpError={wv.onLoadError}
            startInLoadingState={false}
            javaScriptEnabled
            javaScriptCanOpenWindowsAutomatically
            domStorageEnabled
            sharedCookiesEnabled
            allowsBackForwardNavigationGestures={Platform.OS === 'ios'}
            onOpenWindow={wv.onOpenWindow}
            {...(Platform.OS === 'android'
              ? {setSupportMultipleWindows: true}
              : {})}
          />
        )}

        {wv.loading && !wv.error && (
          <View style={styles.loader}>
            <View
              style={[
                StyleSheet.absoluteFill,
                {backgroundColor: palette.surface},
                styles.loaderBackdrop,
              ]}
            />
            <ActivityIndicator size="large" color={palette.accent} />
          </View>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  flex: {flex: 1},
  chrome: {
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: spacing.sm,
    gap: spacing.sm,
  },
  chromeTitle: {
    flex: 1,
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 1,
    textTransform: 'uppercase',
  },
  hint: {
    fontSize: 11,
    lineHeight: 14,
    marginBottom: spacing.sm + 2,
  },
  urlRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs + 2,
  },
  navBtn: {
    width: 36,
    height: 36,
    borderRadius: radius.sm,
    borderWidth: StyleSheet.hairlineWidth,
    alignItems: 'center',
    justifyContent: 'center',
  },
  navBtnIcon: {
    fontSize: 22,
    fontWeight: '400',
    lineHeight: 24,
    marginTop: -1,
  },
  urlInput: {
    flex: 1,
    minHeight: 44,
    paddingHorizontal: spacing.sm + 4,
    paddingVertical: Platform.OS === 'ios' ? 10 : 8,
    borderRadius: radius.sm,
    borderWidth: StyleSheet.hairlineWidth,
    fontSize: 13,
    fontFamily: Platform.select({ios: 'Menlo', default: 'monospace'}),
  },
  goBtn: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm + 4,
    borderRadius: radius.sm,
    justifyContent: 'center',
  },
  goBtnText: {
    fontSize: 14,
    fontWeight: '800',
  },
  closeBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: StyleSheet.hairlineWidth,
  },
  closeBtnText: {
    fontSize: 18,
    fontWeight: '600',
  },
  webWrap: {flex: 1},
  webview: {flex: 1},
  loader: {
    ...StyleSheet.absoluteFill,
    alignItems: 'center',
    justifyContent: 'center',
  },
  loaderBackdrop: {opacity: 0.92},
  errorBox: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: spacing.xl,
    gap: spacing.md,
  },
  errorTitle: {
    fontSize: 17,
    fontWeight: '700',
    textAlign: 'center',
  },
  retryBtn: {
    paddingVertical: spacing.sm + 4,
    paddingHorizontal: spacing.xl,
    borderRadius: radius.sm,
  },
  retryBtnText: {
    fontSize: 15,
    fontWeight: '700',
  },
});
