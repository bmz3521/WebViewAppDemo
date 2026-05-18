import {Platform} from 'react-native';
import {
  DEFAULT_SHELL_APP_NAME,
  SHELL_HEADER_APP_NAME,
  SHELL_HEADER_PLATFORM,
} from '../config';

export function nativeDetectedShellPlatform(): string {
  if (Platform.OS === 'ios') {
    return 'ios';
  }
  if (Platform.OS === 'android') {
    return 'android';
  }
  return Platform.OS;
}

export function buildShellRequestHeaders(
  shellPlatform: string,
  appName: string,
): Record<string, string> {
  const plat = shellPlatform.trim().toLowerCase() || 'ios';
  const app =
    appName.trim().toLowerCase() || DEFAULT_SHELL_APP_NAME.toLowerCase();
  return {
    [SHELL_HEADER_PLATFORM]: plat,
    [SHELL_HEADER_APP_NAME]: app,
  };
}
