import React, {useEffect, useMemo, useRef, useState} from 'react';
import {
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import {useSafeAreaInsets} from 'react-native-safe-area-context';
import {
  DEFAULT_MEMBERSHIP_WEBVIEW_URL,
  DEFAULT_OAUTH_SESSIONS_BASE_URL,
  DEFAULT_SHELL_APP_NAME,
  SHELL_HEADER_APP_NAME,
  SHELL_HEADER_PLATFORM,
} from '../../config';
import {screenPaddingX, spacing, useThemePalette} from '../../theme';
import {
  mergeUrlQueryParams,
  mergeUrlQueryParamsLivePreview,
  type QueryParamRow,
} from '../../utils/mergeUrlQueryParams';
import {normalizeWebUrl} from '../../utils/normalizeWebUrl';
import {landingCopy} from '../copy';
import {ShellBadge} from '../components/ShellBadge';
import {ShellCard} from '../components/ShellCard';
import {ShellHeadersPreview} from '../components/ShellHeadersPreview';
import {ShellPrimaryButton} from '../components/ShellPrimaryButton';
import {ShellSection} from '../components/ShellSection';
import {ShellTextField} from '../components/ShellTextField';
import type {ShellSessionCache} from '../shellSessionCache';
import {
  buildShellRequestHeaders,
  nativeDetectedShellPlatform,
} from '../shellHeaders';
import type {WebViewShellLaunch} from '../types';

export type LandingScreenProps = {
  sessionCache: ShellSessionCache | null;
  onOpenWebView: (launch: WebViewShellLaunch) => void;
};

function initialFormFromCache(
  cache: ShellSessionCache | null,
  detectedPlatform: string,
): {
  baseUrl: string;
  paramRows: QueryParamRow[];
  platform: string;
  appName: string;
} {
  if (!cache) {
    return {
      baseUrl: DEFAULT_MEMBERSHIP_WEBVIEW_URL,
      paramRows: [],
      platform: detectedPlatform,
      appName: DEFAULT_SHELL_APP_NAME,
    };
  }
  return {
    baseUrl: cache.baseUrl || DEFAULT_MEMBERSHIP_WEBVIEW_URL,
    paramRows: cache.paramRows.map((r, i) => ({
      ...r,
      id: r.id || `cached-${i}`,
    })),
    platform: cache.platform || detectedPlatform,
    appName: cache.appName || DEFAULT_SHELL_APP_NAME,
  };
}

export function LandingScreen({sessionCache, onOpenWebView}: LandingScreenProps) {
  const insets = useSafeAreaInsets();
  const palette = useThemePalette();
  const detectedPlatform = useMemo(() => nativeDetectedShellPlatform(), []);
  const rowIdRef = useRef(0);
  const genRowId = () => `q-${++rowIdRef.current}`;

  const initial = useMemo(
    () => initialFormFromCache(sessionCache, detectedPlatform),
    [sessionCache, detectedPlatform],
  );

  const [baseUrlDraft, setBaseUrlDraft] = useState(initial.baseUrl);
  const [paramRows, setParamRows] = useState<QueryParamRow[]>(initial.paramRows);
  const [platformDraft, setPlatformDraft] = useState(initial.platform);
  const [appNameDraft, setAppNameDraft] = useState(initial.appName);

  useEffect(() => {
    if (!sessionCache) {
      return;
    }
    setBaseUrlDraft(sessionCache.baseUrl || DEFAULT_MEMBERSHIP_WEBVIEW_URL);
    setParamRows(
      sessionCache.paramRows.map((r, i) => ({
        ...r,
        id: r.id || `cached-${i}`,
      })),
    );
    setPlatformDraft(sessionCache.platform || detectedPlatform);
    setAppNameDraft(sessionCache.appName || DEFAULT_SHELL_APP_NAME);
  }, [sessionCache, detectedPlatform]);

  const resolvedHeaders = useMemo(
    () => buildShellRequestHeaders(platformDraft, appNameDraft),
    [platformDraft, appNameDraft],
  );

  const headerRows = useMemo(
    () => [
      {key: SHELL_HEADER_PLATFORM, value: resolvedHeaders[SHELL_HEADER_PLATFORM] ?? ''},
      {key: SHELL_HEADER_APP_NAME, value: resolvedHeaders[SHELL_HEADER_APP_NAME] ?? ''},
    ],
    [resolvedHeaders],
  );

  const previewUri = useMemo(
    () => mergeUrlQueryParamsLivePreview(baseUrlDraft, paramRows),
    [baseUrlDraft, paramRows],
  );

  const lastLoadedUri = sessionCache?.lastLoadedUri?.trim() ?? '';

  const addParamRow = () => {
    setParamRows(prev => [...prev, {id: genRowId(), key: '', value: ''}]);
  };

  const removeParamRow = (id: string) => {
    setParamRows(prev => prev.filter(r => r.id !== id));
  };

  const clearAllParams = () => {
    setParamRows([]);
  };

  const clearBaseUrl = () => {
    setBaseUrlDraft('');
  };

  const restoreFromCache = () => {
    if (!sessionCache) {
      return;
    }
    setBaseUrlDraft(sessionCache.baseUrl || DEFAULT_MEMBERSHIP_WEBVIEW_URL);
    setParamRows(
      sessionCache.paramRows.map((r, i) => ({
        ...r,
        id: r.id || `restore-${i}`,
      })),
    );
    setPlatformDraft(sessionCache.platform || detectedPlatform);
    setAppNameDraft(sessionCache.appName || DEFAULT_SHELL_APP_NAME);
  };

  const updateParamRow = (
    id: string,
    patch: Partial<Pick<QueryParamRow, 'key' | 'value'>>,
  ) => {
    setParamRows(prev =>
      prev.map(r => (r.id === id ? {...r, ...patch} : r)),
    );
  };

  const openWebView = () => {
    let raw = '';
    try {
      raw = mergeUrlQueryParams(baseUrlDraft, paramRows).trim();
    } catch {
      raw = mergeUrlQueryParamsLivePreview(baseUrlDraft, paramRows).trim();
    }
    const uri = raw ? normalizeWebUrl(raw) : '';
    if (!uri) {
      return;
    }
    onOpenWebView({uri, headers: {...resolvedHeaders}});
  };

  return (
    <KeyboardAvoidingView
      style={[styles.root, {backgroundColor: palette.background}]}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <ScrollView
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
        contentContainerStyle={[
          styles.scroll,
          {
            paddingTop: insets.top + spacing.lg,
            paddingBottom: insets.bottom + spacing.xl,
            paddingHorizontal: screenPaddingX,
          },
        ]}>
        <ShellBadge palette={palette} label={landingCopy.badgeKicker}>
          {landingCopy.badgeTitle}
        </ShellBadge>

        <Text style={[styles.heroTitle, {color: palette.textPrimary}]}>
          {landingCopy.heroTitle}
        </Text>
        <Text style={[styles.heroSubtitle, {color: palette.textSecondary}]}>
          {landingCopy.heroSubtitle}
        </Text>

        <ShellSection palette={palette} title={landingCopy.sectionRuntime}>
          <ShellCard palette={palette}>
            <Text style={[styles.metaLabel, {color: palette.textMuted}]}>
              Platform.OS
            </Text>
            <Text style={[styles.metaValue, {color: palette.accent}]}>
              {detectedPlatform}
            </Text>
          </ShellCard>
        </ShellSection>

        <ShellSection palette={palette} title={landingCopy.sectionHeaders}>
          <ShellCard palette={palette}>
            <ShellHeadersPreview palette={palette} rows={headerRows} />
          </ShellCard>
        </ShellSection>

        <ShellSection palette={palette} title={landingCopy.sectionFields}>
          <ShellTextField
            palette={palette}
            label={landingCopy.labelPlatform}
            value={platformDraft}
            onChangeText={setPlatformDraft}
            autoCapitalize="none"
            autoCorrect={false}
            accessibilityLabel="Shell platform header"
          />
          <ShellTextField
            palette={palette}
            label={landingCopy.labelApp}
            value={appNameDraft}
            onChangeText={setAppNameDraft}
            autoCapitalize="none"
            autoCorrect={false}
            accessibilityLabel="Shell app name header"
          />
          <View style={styles.fieldActions}>
            <ShellTextField
              palette={palette}
              label={landingCopy.labelUrlBase}
              value={baseUrlDraft}
              onChangeText={setBaseUrlDraft}
              autoCapitalize="none"
              autoCorrect={false}
              keyboardType="url"
              returnKeyType="go"
              blurOnSubmit={false}
              onSubmitEditing={openWebView}
              placeholder={DEFAULT_MEMBERSHIP_WEBVIEW_URL}
              style={[styles.urlMono, styles.urlFieldFlex]}
              accessibilityLabel="Portal base URL"
            />
          </View>
          <View style={styles.inlineActions}>
            <TouchableOpacity
              onPress={clearBaseUrl}
              style={[styles.chipBtn, {borderColor: palette.border}]}
              accessibilityRole="button"
              accessibilityLabel={landingCopy.clearBaseUrl}>
              <Text style={[styles.chipBtnText, {color: palette.textSecondary}]}>
                {landingCopy.clearBaseUrl}
              </Text>
            </TouchableOpacity>
            {lastLoadedUri ? (
              <TouchableOpacity
                onPress={restoreFromCache}
                style={[styles.chipBtn, {borderColor: palette.accent}]}
                accessibilityRole="button"
                accessibilityLabel={landingCopy.restoreLastUrl}>
                <Text style={[styles.chipBtnText, {color: palette.accent}]}>
                  {landingCopy.restoreLastUrl}
                </Text>
              </TouchableOpacity>
            ) : null}
          </View>
          <TouchableOpacity
            onPress={() => setBaseUrlDraft(DEFAULT_OAUTH_SESSIONS_BASE_URL)}
            style={styles.shortcutBtn}
            accessibilityRole="button"
            accessibilityLabel={landingCopy.fillOauthSessionsBase}>
            <Text style={[styles.shortcutBtnText, {color: palette.accent}]}>
              {landingCopy.fillOauthSessionsBase}
            </Text>
          </TouchableOpacity>
        </ShellSection>

        <ShellSection palette={palette} title={landingCopy.sectionQueryParams}>
          <View style={styles.sectionToolbar}>
            <Text style={[styles.hint, styles.hintFlex, {color: palette.textMuted}]}>
              {landingCopy.hintQueryParams}
            </Text>
            {paramRows.length > 0 ? (
              <TouchableOpacity
                onPress={clearAllParams}
                style={[styles.chipBtn, {borderColor: palette.border}]}
                accessibilityRole="button"
                accessibilityLabel={landingCopy.clearAllParams}>
                <Text style={[styles.chipBtnText, {color: palette.textSecondary}]}>
                  {landingCopy.clearAllParams}
                </Text>
              </TouchableOpacity>
            ) : null}
          </View>
          {paramRows.map((row, index) => (
            <View
              key={row.id}
              style={[styles.paramBlock, {borderBottomColor: palette.border}]}>
              <View style={styles.paramHeader}>
                <Text style={[styles.paramIndex, {color: palette.textMuted}]}>
                  #{index + 1}
                </Text>
                <TouchableOpacity
                  onPress={() => removeParamRow(row.id)}
                  style={[styles.deleteChip, {borderColor: palette.borderStrong}]}
                  accessibilityRole="button"
                  accessibilityLabel={`${landingCopy.removeQueryParam} ${index + 1}`}>
                  <Text style={[styles.deleteChipText, {color: palette.textSecondary}]}>
                    {landingCopy.removeQueryParam}
                  </Text>
                </TouchableOpacity>
              </View>
              <ShellTextField
                palette={palette}
                label={landingCopy.labelQueryKey}
                value={row.key}
                onChangeText={t => updateParamRow(row.id, {key: t})}
                autoCapitalize="none"
                autoCorrect={false}
                placeholder="token"
                style={styles.urlMono}
                accessibilityLabel={`Query parameter name row ${index + 1}`}
              />
              <ShellTextField
                palette={palette}
                label={landingCopy.labelQueryValue}
                value={row.value}
                onChangeText={t => updateParamRow(row.id, {value: t})}
                autoCapitalize="none"
                autoCorrect={false}
                multiline
                placeholder={
                  row.key === 'redirect_uri' ? '/package' : undefined
                }
                style={styles.urlMono}
                accessibilityLabel={`Query parameter value row ${index + 1}`}
              />
            </View>
          ))}
          <TouchableOpacity
            onPress={addParamRow}
            style={[styles.addRowBtn, {borderColor: palette.accent}]}
            accessibilityRole="button"
            accessibilityLabel={landingCopy.addQueryParam}>
            <Text style={[styles.addRowLabel, {color: palette.accent}]}>
              {landingCopy.addQueryParam}
            </Text>
          </TouchableOpacity>

          <Text style={[styles.previewHeading, {color: palette.textSecondary}]}>
            {landingCopy.composedUrlPreview}
          </Text>
          <Text style={[styles.previewSub, {color: palette.textMuted}]}>
            {landingCopy.composedUrlPreviewHint}
          </Text>
          <ShellCard palette={palette}>
            <ScrollView
              nestedScrollEnabled
              keyboardShouldPersistTaps="handled"
              style={styles.previewScroll}
              showsVerticalScrollIndicator>
              <Text
                selectable
                style={[styles.previewUrl, {color: palette.textPrimary}]}>
                {previewUri.trim() ? previewUri : '—'}
              </Text>
            </ScrollView>
          </ShellCard>
        </ShellSection>

        <Text style={[styles.footnote, {color: palette.textMuted}]}>
          {landingCopy.footnote}
        </Text>

        <ShellPrimaryButton
          palette={palette}
          title={landingCopy.ctaOpen}
          onPress={openWebView}
          accessibilityRole="button"
          accessibilityLabel={landingCopy.ctaOpen}
        />
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  root: {flex: 1},
  scroll: {flexGrow: 1},
  heroTitle: {
    fontSize: 28,
    fontWeight: '800',
    letterSpacing: -0.8,
    marginTop: spacing.md,
    marginBottom: spacing.xs,
  },
  heroSubtitle: {
    fontSize: 14,
    lineHeight: 20,
    marginBottom: spacing.lg,
  },
  metaLabel: {
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 0.6,
    textTransform: 'uppercase',
    marginBottom: spacing.xs,
  },
  metaValue: {
    fontSize: 22,
    fontWeight: '800',
    fontFamily: Platform.select({ios: 'Menlo', default: 'monospace'}),
  },
  fieldActions: {
    flexDirection: 'row',
    alignItems: 'flex-end',
  },
  urlFieldFlex: {
    flex: 1,
  },
  urlMono: {
    fontFamily: Platform.select({ios: 'Menlo', default: 'monospace'}),
    fontSize: 13,
  },
  inlineActions: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
    marginTop: -spacing.sm,
    marginBottom: spacing.sm,
  },
  chipBtn: {
    borderWidth: StyleSheet.hairlineWidth,
    borderRadius: 8,
    paddingHorizontal: spacing.sm + 4,
    paddingVertical: spacing.xs + 2,
  },
  chipBtnText: {
    fontSize: 12,
    fontWeight: '700',
  },
  shortcutBtn: {
    marginBottom: spacing.sm,
    alignSelf: 'flex-start',
  },
  shortcutBtnText: {
    fontSize: 13,
    fontWeight: '700',
  },
  sectionToolbar: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: spacing.sm,
    marginBottom: spacing.md,
  },
  hint: {
    fontSize: 12,
    lineHeight: 17,
  },
  hintFlex: {
    flex: 1,
  },
  paramBlock: {
    marginBottom: spacing.md,
    paddingBottom: spacing.sm,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  paramHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: spacing.xs,
  },
  paramIndex: {
    fontSize: 11,
    fontWeight: '700',
  },
  deleteChip: {
    borderWidth: StyleSheet.hairlineWidth,
    borderRadius: 6,
    paddingHorizontal: spacing.sm,
    paddingVertical: 4,
  },
  deleteChipText: {
    fontSize: 12,
    fontWeight: '700',
  },
  addRowBtn: {
    borderWidth: StyleSheet.hairlineWidth,
    borderRadius: 8,
    paddingVertical: spacing.sm + 2,
    alignItems: 'center',
    marginTop: spacing.xs,
  },
  addRowLabel: {
    fontSize: 15,
    fontWeight: '700',
  },
  previewHeading: {
    fontSize: 13,
    fontWeight: '700',
    marginTop: spacing.lg,
    marginBottom: spacing.xs,
  },
  previewSub: {
    fontSize: 11,
    lineHeight: 15,
    marginBottom: spacing.sm,
  },
  previewScroll: {
    maxHeight: 168,
  },
  previewUrl: {
    fontFamily: Platform.select({ios: 'Menlo', default: 'monospace'}),
    fontSize: 11,
    lineHeight: 16,
  },
  footnote: {
    fontSize: 12,
    lineHeight: 17,
    marginBottom: spacing.md,
  },
});
