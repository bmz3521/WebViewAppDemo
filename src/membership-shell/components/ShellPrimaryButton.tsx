import React from 'react';
import {
  ActivityIndicator,
  StyleSheet,
  Text,
  TouchableOpacity,
  type TouchableOpacityProps,
} from 'react-native';
import type {ThemePalette} from '../../theme';
import {radius, spacing} from '../../theme';

type Props = TouchableOpacityProps & {
  palette: ThemePalette;
  title: string;
  loading?: boolean;
};

export function ShellPrimaryButton({
  palette,
  title,
  loading,
  disabled,
  ...rest
}: Props) {
  const inactive = disabled || loading;
  return (
    <TouchableOpacity
      {...rest}
      disabled={inactive}
      activeOpacity={0.88}
      style={[
        styles.btn,
        {
          backgroundColor: inactive ? palette.textMuted : palette.accent,
        },
      ]}>
      {loading ? (
        <ActivityIndicator color={palette.onAccent} />
      ) : (
        <Text style={[styles.text, {color: palette.onAccent}]}>{title}</Text>
      )}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  btn: {
    borderRadius: radius.md,
    paddingVertical: spacing.md - 2,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 52,
  },
  text: {
    fontSize: 16,
    fontWeight: '700',
    letterSpacing: 0.2,
  },
});
