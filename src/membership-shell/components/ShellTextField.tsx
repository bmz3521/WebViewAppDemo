import React from 'react';
import {
  Platform,
  StyleSheet,
  Text,
  TextInput,
  type TextInputProps,
  View,
} from 'react-native';
import type {ThemePalette} from '../../theme';
import {radius, spacing} from '../../theme';

type Props = TextInputProps & {
  palette: ThemePalette;
  label: string;
};

export function ShellTextField({palette, label, style, ...rest}: Props) {
  return (
    <View style={styles.wrap}>
      <Text style={[styles.label, {color: palette.textSecondary}]}>{label}</Text>
      <TextInput
        {...rest}
        placeholderTextColor={palette.textMuted}
        style={[
          styles.input,
          {
            color: palette.textPrimary,
            backgroundColor: palette.surfaceElevated,
            borderColor: palette.borderStrong,
          },
          style,
        ]}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    marginBottom: spacing.md,
  },
  label: {
    fontSize: 13,
    fontWeight: '600',
    marginBottom: spacing.xs + 2,
  },
  input: {
    minHeight: 48,
    paddingHorizontal: spacing.md - 4,
    paddingVertical: Platform.OS === 'ios' ? 12 : 10,
    borderRadius: radius.sm,
    borderWidth: StyleSheet.hairlineWidth,
    fontSize: 15,
  },
});
