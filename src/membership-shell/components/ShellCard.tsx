import React from 'react';
import {StyleSheet, View} from 'react-native';
import type {ThemePalette} from '../../theme';
import {cardShadow, radius, spacing} from '../../theme';

type Props = {
  palette: ThemePalette;
  children: React.ReactNode;
};

/** Elevated surface — matches cardShadow tokens */
export function ShellCard({palette, children}: Props) {
  return (
    <View
      style={[
        styles.card,
        cardShadow,
        {
          backgroundColor: palette.surface,
          borderColor: palette.border,
        },
      ]}>
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: radius.md,
    borderWidth: StyleSheet.hairlineWidth,
    padding: spacing.md,
    marginBottom: spacing.sm,
  },
});
