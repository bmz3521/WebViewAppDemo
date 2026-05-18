import {useMemo} from 'react';
import {useColorScheme} from 'react-native';
import {darkPalette, lightPalette, type ThemePalette} from './palette';

export function useThemePalette(): ThemePalette {
  const scheme = useColorScheme();
  return useMemo(
    () => (scheme === 'dark' ? darkPalette : lightPalette),
    [scheme],
  );
}
