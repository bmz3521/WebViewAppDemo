import {normalizeWebUrl} from './normalizeWebUrl';

export type QueryParamRow = {id: string; key: string; value: string};

/**
 * Parse `baseRaw` as URL (adding scheme via normalizeWebUrl), then merge rows into search params.
 * Rows with empty keys are skipped. Existing query on the base URL is preserved; duplicate keys are overwritten by later rows.
 */
export function mergeUrlQueryParams(
  baseRaw: string,
  rows: QueryParamRow[],
): string {
  const trimmed = baseRaw.trim();
  if (!trimmed) {
    return '';
  }
  const base = normalizeWebUrl(trimmed);
  const u = new URL(base);
  for (const row of rows) {
    const k = row.key.trim();
    if (!k) {
      continue;
    }
    u.searchParams.set(k, row.value);
  }
  return u.toString();
}

/** Same merging rules as strict merge, but never throws — for live UI preview while the base URL is incomplete. */
export function mergeUrlQueryParamsLivePreview(
  baseRaw: string,
  rows: QueryParamRow[],
): string {
  try {
    return mergeUrlQueryParams(baseRaw, rows);
  } catch {
    return appendQueryStringLoose(baseRaw, rows);
  }
}

function appendQueryStringLoose(
  baseRaw: string,
  rows: QueryParamRow[],
): string {
  const trimmed = baseRaw.trim();
  if (!trimmed) {
    return '';
  }
  const sp = new URLSearchParams();
  for (const row of rows) {
    const k = row.key.trim();
    if (!k) {
      continue;
    }
    sp.set(k, row.value);
  }
  const q = sp.toString();
  if (!q) {
    return trimmed;
  }
  const sep = trimmed.includes('?') ? '&' : '?';
  return `${trimmed}${sep}${q}`;
}
