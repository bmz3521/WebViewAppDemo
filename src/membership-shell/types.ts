/** Launch payload: first native navigation sends these HTTP headers with the URL */
export type WebViewShellLaunch = {
  uri: string;
  headers: Record<string, string>;
};
