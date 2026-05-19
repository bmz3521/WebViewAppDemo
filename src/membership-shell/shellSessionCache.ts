import type {QueryParamRow} from '../utils/mergeUrlQueryParams';

/** Persisted QA form + last URL loaded in WebView (in-memory for the app process). */
export type ShellSessionCache = {
  baseUrl: string;
  paramRows: QueryParamRow[];
  platform: string;
  appName: string;
  lastLoadedUri: string;
};

let memory: ShellSessionCache | null = null;

export function readShellSessionCache(): ShellSessionCache | null {
  return memory;
}

const EMPTY: ShellSessionCache = {
  baseUrl: '',
  paramRows: [],
  platform: '',
  appName: '',
  lastLoadedUri: '',
};

export function writeShellSessionCache(patch: Partial<ShellSessionCache>): ShellSessionCache {
  memory = {...EMPTY, ...memory, ...patch};
  return memory;
}

export function clearShellSessionCache(): void {
  memory = null;
}
