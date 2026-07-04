import type { AlbumMeta } from '../types';

const SETTINGS_KEY = 'PHOTO_SELECTOR_SETTINGS';
const SESSIONS_KEY = 'PHOTO_SELECTOR_SESSIONS';
const ACTIVE_SESSION_KEY = 'PHOTO_SELECTOR_ACTIVE';

export type UserSettings = {
  photographerName: string;
  photographerWhatsapp: string;
};

export type SavedSession = {
  meta: AlbumMeta;
  selectionOrder: string[];
  lastAccessed: number;
};

export function loadSettings(): UserSettings | null {
  try {
    const data = localStorage.getItem(SETTINGS_KEY);
    return data ? JSON.parse(data) : null;
  } catch {
    return null;
  }
}

export function saveSettings(settings: UserSettings) {
  try {
    localStorage.setItem(SETTINGS_KEY, JSON.stringify(settings));
  } catch {}
}

export function loadSessions(): Record<string, SavedSession> {
  try {
    const data = localStorage.getItem(SESSIONS_KEY);
    return data ? JSON.parse(data) : {};
  } catch {
    return {};
  }
}

export function saveSession(folderId: string, meta: AlbumMeta, selectionOrder: string[]) {
  try {
    const sessions = loadSessions();
    sessions[folderId] = {
      meta,
      selectionOrder,
      lastAccessed: Date.now(),
    };
    localStorage.setItem(SESSIONS_KEY, JSON.stringify(sessions));
  } catch {}
}

export function getSession(folderId: string): SavedSession | null {
  const sessions = loadSessions();
  return sessions[folderId] || null;
}

export function getActiveSessionId(): string | null {
  return localStorage.getItem(ACTIVE_SESSION_KEY);
}

export function setActiveSessionId(folderId: string | null) {
  if (folderId) {
    localStorage.setItem(ACTIVE_SESSION_KEY, folderId);
  } else {
    localStorage.removeItem(ACTIVE_SESSION_KEY);
  }
}
