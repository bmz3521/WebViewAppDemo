import React from 'react';
import {StyleSheet, Text, View} from 'react-native';
import type {ThemePalette} from '../../theme';
import {spacing} from '../../theme';

type Props = {
  palette: ThemePalette;
  title: string;
  description?: string;
  children: React.ReactNode;
};

export function ShellSection({palette, title, description, children}: Props) {
  return (
    <View style={styles.wrap}>
      <Text style={[styles.title, {color: palette.textPrimary}]}>{title}</Text>
      {description ? (
        <Text style={[styles.desc, {color: palette.textMuted}]}>
          {description}
        </Text>
      ) : null}
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    marginBottom: spacing.lg,
  },
  title: {
    fontSize: 13,
    fontWeight: '700',
    letterSpacing: 0.3,
    textTransform: 'uppercase',
    marginBottom: spacing.sm,
  },
  desc: {
    fontSize: 13,
    lineHeight: 18,
    marginBottom: spacing.sm,
  },
});
