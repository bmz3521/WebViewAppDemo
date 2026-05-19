import type {QueryParamRow} from './mergeUrlQueryParams';
import {normalizeWebUrl} from './normalizeWebUrl';

/** Split a full URL into path base + query rows for the landing form. */
export function parseUrlToBaseAndParams(fullUrl: string): {
  base: string;
  rows: QueryParamRow[];
} {
  const normalized = normalizeWebUrl(fullUrl.trim());
  const u = new URL(normalized);
  const base = `${u.origin}${u.pathname}`;
  const rows: QueryParamRow[] = [];
  let i = 0;
  u.searchParams.forEach((value, key) => {
    rows.push({id: `parsed-${i++}`, key, value});
  });
  return {base, rows};
}
