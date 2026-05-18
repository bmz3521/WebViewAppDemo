import React from 'react';
import {Platform, StyleSheet, Text, View} from 'react-native';
import {
  SHELL_HEADER_APP_NAME,
  SHELL_HEADER_PLATFORM,
} from '../../config';
import type {ThemePalette} from '../../theme';
import {radius, spacing} from '../../theme';

type Props = {
  palette: ThemePalette;
  headers: Record<string, string>;
};

export function ShellHeaderChips({palette, headers}: Props) {
  const plat = headers[SHELL_HEADER_PLATFORM] ?? '—';
  const app = headers[SHELL_HEADER_APP_NAME] ?? '—';

  return (
    <View style={styles.row}>
      <Chip palette={palette} label={SHELL_HEADER_PLATFORM} value={plat} />
      <Chip palette={palette} label={SHELL_HEADER_APP_NAME} value={app} />
    </View>
  );
}

function Chip({
  palette,
  label,
  value,
}: {
  palette: ThemePalette;
  label: string;
  value: string;
}) {
  return (
    <View
      style={[
        styles.chip,
        {
          backgroundColor: palette.chipBg,
          borderColor: palette.chipBorder,
        },
      ]}>
      <Text style={[styles.chipKey, {color: palette.textMuted}]}>{label}</Text>
      <Text style={[styles.chipVal, {color: palette.textPrimary}]}>{value}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
    marginBottom: spacing.sm,
  },
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.sm + 2,
    paddingVertical: spacing.xs + 2,
    borderRadius: radius.sm,
    borderWidth: StyleSheet.hairlineWidth,
    gap: spacing.sm,
  },
  chipKey: {
    fontSize: 11,
    fontFamily: Platform.select({ios: 'Menlo', default: 'monospace'}),
    fontWeight: '600',
  },
  chipVal: {
    fontSize: 12,
    fontFamily: Platform.select({ios: 'Menlo', default: 'monospace'}),
    fontWeight: '700',
  },
});
