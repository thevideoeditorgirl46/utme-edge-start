/**
 * Offline & Local Storage Cache Helper for Edge Practice
 * Sensible progressive offline support: caches loaded question pages,
 * bookmarks, notes, and attempts in localStorage so students on unstable
 * mobile connections don't lose access to already loaded content.
 */

const CACHE_PREFIX = "edge_practice_";

export function getCachedData<T>(key: string): T | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = localStorage.getItem(`${CACHE_PREFIX}${key}`);
    if (!raw) return null;
    return JSON.parse(raw) as T;
  } catch {
    return null;
  }
}

export function setCachedData<T>(key: string, value: T): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(`${CACHE_PREFIX}${key}`, JSON.stringify(value));
  } catch {
    // Ignore storage quota errors silently
  }
}

export function removeCachedData(key: string): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.removeItem(`${CACHE_PREFIX}${key}`);
  } catch {
    // Ignore
  }
}

export function clearCachedPracticePages(): void {
  if (typeof window === "undefined") return;
  try {
    for (let index = localStorage.length - 1; index >= 0; index -= 1) {
      const key = localStorage.key(index);
      if (key?.startsWith(`${CACHE_PREFIX}page_`)) {
        localStorage.removeItem(key);
      }
    }
  } catch {
    // Ignore storage errors silently
  }
}
