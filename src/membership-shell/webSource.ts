/** WebView `source` shape when loading remote URIs with optional headers */

export type WebViewUriSource = {
  uri: string;
  headers?: Record<string, string>;
};
