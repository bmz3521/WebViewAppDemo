const SKIP_PREFIXES = ['about:', 'javascript:', 'blob:', 'data:'];

export function historyUrlKey(raw: string): string | null {
  const t = raw.trim();
  if (!t || SKIP_PREFIXES.some(p => t.toLowerCase().startsWith(p))) {
    return null;
  }
  try {
    return new URL(t).href;
  } catch {
    return t;
  }
}

export type UrlHistoryStack = {
  entries: string[];
  index: number;
};

export function createUrlHistoryStack(initialUrl: string): UrlHistoryStack {
  const key = historyUrlKey(initialUrl);
  return {entries: key ? [key] : [], index: key ? 0 : -1};
}

/** Append URL after current index (drops forward branch). No-op if same as current. */
export function pushUrlHistory(
  stack: UrlHistoryStack,
  rawUrl: string,
): UrlHistoryStack {
  const key = historyUrlKey(rawUrl);
  if (!key) {
    return stack;
  }
  if (stack.entries.length === 0) {
    return {entries: [key], index: 0};
  }
  const current = stack.entries[stack.index];
  if (current === key) {
    return stack;
  }
  const base = stack.entries.slice(0, stack.index + 1);
  return {entries: [...base, key], index: base.length};
}

export function historyCanGoBack(stack: UrlHistoryStack): boolean {
  return stack.index > 0;
}

export function historyCanGoForward(stack: UrlHistoryStack): boolean {
  return stack.index >= 0 && stack.index < stack.entries.length - 1;
}

export function historyGoBack(stack: UrlHistoryStack): {
  stack: UrlHistoryStack;
  url: string | null;
} {
  if (!historyCanGoBack(stack)) {
    return {stack, url: null};
  }
  const index = stack.index - 1;
  return {stack: {...stack, index}, url: stack.entries[index] ?? null};
}

export function historyGoForward(stack: UrlHistoryStack): {
  stack: UrlHistoryStack;
  url: string | null;
} {
  if (!historyCanGoForward(stack)) {
    return {stack, url: null};
  }
  const index = stack.index + 1;
  return {stack: {...stack, index}, url: stack.entries[index] ?? null};
}
