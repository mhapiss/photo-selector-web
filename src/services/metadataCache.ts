import type { PhotoFile } from '../types';

const CACHE_PREFIX = 'ps_meta_v4_';
const MAX_CACHED_FOLDERS = 5;
const TTL_MS = 30 * 60 * 1000; // 30 minutes

interface CacheEntry {
  photos: PhotoFile[];
  timestamp: number;
}

/**
 * Safely retrieve sessionStorage reference without throwing exceptions.
 */
function getSessionStorage(): Storage | null {
  try {
    if (typeof window !== 'undefined' && window.sessionStorage) {
      return window.sessionStorage;
    }
  } catch {
    // Storage access might throw in private browsing mode or restricted environments
  }
  return null;
}

/**
 * Build storage key for a given folder ID.
 */
function getCacheKey(folderId: string): string {
  return `${CACHE_PREFIX}${folderId}`;
}

/**
 * Strip `_raw` from PhotoFile to keep cached metadata minimal and save sessionStorage quota.
 */
function sanitizePhoto(photo: PhotoFile): PhotoFile {
  const clean: PhotoFile = { ...photo };
  delete clean._raw;
  return clean;
}

function sanitizePhotos(photos: PhotoFile[]): PhotoFile[] {
  return photos.map(sanitizePhoto);
}

/**
 * Collect all keys in sessionStorage that match CACHE_PREFIX.
 */
function getStoredCacheKeys(storage: Storage): string[] {
  const keys: string[] = [];
  try {
    for (let i = 0; i < storage.length; i++) {
      const key = storage.key(i);
      if (key && key.startsWith(CACHE_PREFIX)) {
        keys.push(key);
      }
    }
  } catch {
    // Silently ignore storage inspection errors
  }
  return keys;
}

/**
 * Enforce MAX_CACHED_FOLDERS by evicting the oldest entries when adding a new folder.
 */
function evictOldestIfNeeded(storage: Storage, currentKey: string): void {
  try {
    const keys = getStoredCacheKeys(storage);
    // Keys other than the target folder key
    const otherKeys = keys.filter((k) => k !== currentKey);

    // If other keys count is less than MAX_CACHED_FOLDERS, adding/updating won't exceed the limit
    if (otherKeys.length < MAX_CACHED_FOLDERS) {
      return;
    }

    const entriesWithTime: { key: string; timestamp: number }[] = [];
    const now = Date.now();

    for (const key of otherKeys) {
      try {
        const raw = storage.getItem(key);
        if (!raw) {
          storage.removeItem(key);
          continue;
        }

        const parsed = JSON.parse(raw) as CacheEntry;
        if (
          !parsed ||
          typeof parsed !== 'object' ||
          typeof parsed.timestamp !== 'number' ||
          !Array.isArray(parsed.photos)
        ) {
          // Corrupted entry: clear it
          storage.removeItem(key);
          continue;
        }

        // Clean up expired entries encountered along the way
        if (now - parsed.timestamp > TTL_MS) {
          storage.removeItem(key);
          continue;
        }

        entriesWithTime.push({ key, timestamp: parsed.timestamp });
      } catch {
        // Corrupted JSON: clear entry
        storage.removeItem(key);
      }
    }

    if (entriesWithTime.length < MAX_CACHED_FOLDERS) {
      return;
    }

    // Sort ascending by timestamp (oldest first)
    entriesWithTime.sort((a, b) => a.timestamp - b.timestamp);

    // Evict oldest entries until entries count is less than MAX_CACHED_FOLDERS
    while (entriesWithTime.length >= MAX_CACHED_FOLDERS) {
      const oldest = entriesWithTime.shift();
      if (oldest) {
        storage.removeItem(oldest.key);
      }
    }
  } catch {
    // Silently fail on storage errors
  }
}

/**
 * Get cached photo list for a folder. Returns null if not cached or expired.
 */
export function getCachedPhotos(folderId: string): PhotoFile[] | null {
  if (!folderId) return null;

  const storage = getSessionStorage();
  if (!storage) return null;

  const key = getCacheKey(folderId);

  try {
    const raw = storage.getItem(key);
    if (!raw) return null;

    let entry: CacheEntry;
    try {
      entry = JSON.parse(raw) as CacheEntry;
    } catch {
      // Handle JSON parse errors gracefully (return null / clear corrupted entry)
      try {
        storage.removeItem(key);
      } catch {
        // Silently ignore
      }
      return null;
    }

    if (
      !entry ||
      typeof entry !== 'object' ||
      typeof entry.timestamp !== 'number' ||
      !Array.isArray(entry.photos)
    ) {
      // Invalid entry structure: clear corrupted entry
      try {
        storage.removeItem(key);
      } catch {
        // Silently ignore
      }
      return null;
    }

    // Check expiration
    if (Date.now() - entry.timestamp > TTL_MS) {
      try {
        storage.removeItem(key);
      } catch {
        // Silently ignore
      }
      return null;
    }

    return entry.photos;
  } catch {
    // Storage access error (e.g. security restriction)
    return null;
  }
}

/**
 * Cache photo list for a folder.
 */
export function setCachedPhotos(folderId: string, photos: PhotoFile[]): void {
  if (!folderId || !Array.isArray(photos)) return;

  const storage = getSessionStorage();
  if (!storage) return;

  const key = getCacheKey(folderId);

  try {
    evictOldestIfNeeded(storage, key);

    const entry: CacheEntry = {
      photos: sanitizePhotos(photos),
      timestamp: Date.now(),
    };

    storage.setItem(key, JSON.stringify(entry));
  } catch {
    // Silently fail if storage is full or throws
  }
}

/**
 * Append more photos to an existing cache entry (for streaming).
 * If no entry exists, creates a new one.
 */
export function appendCachedPhotos(folderId: string, newPhotos: PhotoFile[]): void {
  if (!folderId || !Array.isArray(newPhotos) || newPhotos.length === 0) return;

  const existing = getCachedPhotos(folderId);
  if (!existing || existing.length === 0) {
    setCachedPhotos(folderId, newPhotos);
    return;
  }

  // Deduplicate against existing photos by id if present
  const existingIds = new Set(existing.map((p) => p.id));
  const additions = newPhotos.filter((p) => !p.id || !existingIds.has(p.id));

  if (additions.length === 0) {
    return;
  }

  setCachedPhotos(folderId, [...existing, ...additions]);
}

/**
 * Clear cache for a specific folder.
 */
export function clearCachedPhotos(folderId: string): void {
  if (!folderId) return;

  const storage = getSessionStorage();
  if (!storage) return;

  try {
    storage.removeItem(getCacheKey(folderId));
  } catch {
    // Silently fail
  }
}

/**
 * Clear all cached photo metadata entries.
 */
export function clearAllCachedPhotos(): void {
  const storage = getSessionStorage();
  if (!storage) return;

  try {
    const keys = getStoredCacheKeys(storage);
    for (const key of keys) {
      storage.removeItem(key);
    }
  } catch {
    // Silently fail
  }
}
