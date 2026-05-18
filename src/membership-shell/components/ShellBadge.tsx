import React from 'react';
import {Platform, StyleSheet, Text, View} from 'react-native';
import type {ThemePalette} from '../../theme';
import {radius, spacing} from '../../theme';

type Props = {
  palette: ThemePalette;
  label: string;
  children: React.ReactNode;
};

/** Pill badge — e.g. QA / platform chip */
export function ShellBadge({palette, label, children}: Props) {
  return (
    <View
      style={[
        styles.row,
        {
          backgroundColor: palette.accentSoft,
          borderColor: palette.chipBorder,
        },
      ]}>
      <View style={[styles.pill, {backgroundColor: palette.accent}]}>
        <Text style={[styles.pillText, {color: palette.onAccent}]}>{label}</Text>
      </View>
      <Text style={[styles.value, {color: palette.textPrimary}]}>{children}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    borderRadius: radius.pill,
    borderWidth: StyleSheet.hairlineWidth,
    paddingVertical: spacing.xs + 2,
    paddingHorizontal: spacing.sm + 2,
    gap: spacing.sm,
    maxWidth: '100%',
  },
  pill: {
    paddingHorizontal: spacing.sm,
    paddingVertical: 2,
    borderRadius: radius.pill,
  },
  pillText: {
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: 0.6,
    fontFamily: Platform.select({ios: 'Menlo', default: 'monospace'}),
  },
  value: {
    fontSize: 14,
    fontWeight: '700',
    marginRight: spacing.xs,
    flexShrink: 1,
  },
});
