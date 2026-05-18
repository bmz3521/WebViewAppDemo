import React from 'react';
import {Platform, StyleSheet, Text, View} from 'react-native';
import type {ThemePalette} from '../../theme';
import {spacing} from '../../theme';

type Row = {key: string; value: string};

type Props = {
  palette: ThemePalette;
  rows: Row[];
};

/** Read-only preview of outgoing request headers */
export function ShellHeadersPreview({palette, rows}: Props) {
  return (
    <View style={styles.stack}>
      {rows.map((row, index) => (
        <View
          key={row.key}
          style={[
            styles.row,
            index === rows.length - 1 && styles.rowLast,
            {
              borderBottomColor: palette.border,
            },
          ]}>
          <Text style={[styles.key, {color: palette.textMuted}]}>{row.key}</Text>
          <Text
            style={[styles.val, {color: palette.mono}]}
            selectable
            numberOfLines={3}>
            {row.value}
          </Text>
        </View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  stack: {
    gap: 0,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    paddingVertical: spacing.sm + 2,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  rowLast: {
    borderBottomWidth: 0,
  },
  key: {
    fontFamily: Platform.select({ios: 'Menlo', default: 'monospace'}),
    fontSize: 11,
    flexShrink: 0,
    marginRight: spacing.md,
    maxWidth: '38%',
  },
  val: {
    fontFamily: Platform.select({ios: 'Menlo', default: 'monospace'}),
    fontSize: 12,
    fontWeight: '600',
    flex: 1,
    textAlign: 'right',
  },
});
