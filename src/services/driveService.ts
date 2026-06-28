import type { LoadError, PhotoFile } from '../types';
import { supabaseUrl, supabaseAnonKey } from './supabaseService';

// ==========================================
// Drive Utility Functions (from drive.ts)
// ==========================================

const IMAGE_EXTENSIONS =
  /\.(jpe?g|png|webp|heic|gif|bmp|tiff?|raw|cr2|nef|arw|dng)$/i;

const FOLDER_PATTERNS = [
  /\/folders\/([A-Za-z0-9_-]{20,})/,
  /[?&]id=([A-Za-z0-9_-]{20,})/,
  /^([A-Za-z0-9_-]{20,})$/,
];

/**
 * Extract Google Drive folder ID from a link
 */
export function extractFolderId(link: string): string | null {
  const value = link.trim();
  if (!value) return null;

  for (const pattern of FOLDER_PATTERNS) {
    const match = value.match(pattern);
    if (match) {
      return match[1];
    }
  }
  return null;
}

export function driveThumbUrl(fileId: string, size = 250): string {
  return `https://drive.google.com/thumbnail?id=${fileId}&sz=w${size}`;
}

export function driveMediumUrl(fileId: string): string {
  return `https://drive.google.com/thumbnail?id=${fileId}&sz=w1000`;
}

export function driveLargeUrl(fileId: string): string {
  return `https://drive.google.com/thumbnail?id=${fileId}&sz=w1600`;
}

export function driveFileUrl(fileId: string): string {
  return `https://drive.google.com/file/d/${fileId}/view`;
}

export function isImageFile(name: string): boolean {
  return IMAGE_EXTENSIONS.test(name);
}

export function parseFilenameList(raw: string): string[] {
  return raw
    .split(/[\n,;]+/)
    .map((item) => item.trim())
    .filter((item) => item.length > 0 && IMAGE_EXTENSIONS.test(item));
}

// ==========================================
// Drive Fetch Functions (from fetchDrive.ts)
// ==========================================

export type FetchResult =
  | { ok: true; photos: PhotoFile[] }
  | { ok: false; error: LoadError; fallback: 'manual' };

function isValidHttpUrl(value: unknown): value is string {
  return typeof value === 'string' && /^https?:\/\//i.test(value.trim());
}

interface DriveFileResponse {
  id?: string;
  name?: string;
  mimeType?: string;
  thumbnailUrl?: string;
  thumbnailLink?: string;
  webContentLink?: string;
  webViewLink?: string;
  iconLink?: string;
  size?: number;
}

function normalizePhotoFile(rawFile: unknown): PhotoFile | null {
  if (!rawFile || typeof rawFile !== 'object') return null;
  const file = rawFile as DriveFileResponse;

  const id = typeof file.id === 'string' ? file.id.trim() : '';
  const name = typeof file.name === 'string' ? file.name.trim() : '';

  if (!id || !name) return null;

  let thumbnailUrl = '';
  
  if (isValidHttpUrl(file.thumbnailUrl)) {
    thumbnailUrl = file.thumbnailUrl.trim();
  } else if (isValidHttpUrl(file.thumbnailLink)) {
    thumbnailUrl = file.thumbnailLink.trim();
  } else if (isValidHttpUrl(file.webContentLink)) {
    thumbnailUrl = file.webContentLink.trim();
  } else if (isValidHttpUrl(file.webViewLink)) {
    thumbnailUrl = file.webViewLink.trim();
  } else if (isValidHttpUrl(file.iconLink)) {
    thumbnailUrl = file.iconLink.trim();
  } else {
    thumbnailUrl = `https://drive.google.com/thumbnail?id=${encodeURIComponent(id)}&sz=w400`;
  }

  const directUrl = file.webContentLink || 
                    file.webViewLink || 
                    `https://drive.google.com/uc?id=${id}&export=download`;

  return {
    id,
    name,
    mimeType: file.mimeType || 'image/jpeg',
    thumbnailUrl,
    directUrl,
    webContentLink: directUrl,
    size: file.size || 0,
    _raw: file,
  };
}

/**
 * Calls the `drive-list` edge function to enumerate image files inside a
 * Google Drive folder.
 */
export async function fetchDrivePhotos(folderId: string): Promise<FetchResult> {
  if (!folderId || !/^[A-Za-z0-9_-]{20,}$/.test(folderId)) {
    return {
      ok: false,
      error: {
        code: 'invalid-link',
        message: 'Google Drive Folder ID tidak valid.',
      },
      fallback: 'manual',
    };
  }

  const endpoint = `${supabaseUrl}/functions/v1/drive-list`;

  try {
    const res = await fetch(endpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${supabaseAnonKey}`,
        apikey: supabaseAnonKey,
      },
      body: JSON.stringify({ folderId }),
    });

    const data = await res.json().catch(() => null) as { files?: unknown[]; error?: { code?: string; message?: string } } | null;

    if (!res.ok) {
      const code = data?.error?.code ?? 'network';
      const message =
        data?.error?.message ?? 'Could not load the album. Please try again.';

      const errorMap: Record<string, LoadError['code']> = {
        'api-key-missing': 'api-key-missing',
        'api-key-invalid': 'api-key-missing',
        'folder-private': 'folder-private',
        'invalid-link': 'invalid-link',
      };

      return {
        ok: false,
        error: {
          code: errorMap[code] ?? 'network',
          message,
        },
        fallback: 'manual',
      };
    }

    if (!data || !Array.isArray(data.files)) {
      return {
        ok: false,
        error: {
          code: 'unknown',
          message: 'Format respon dari server tidak sesuai.',
        },
        fallback: 'manual',
      };
    }

    const photos = data.files
      .map(normalizePhotoFile)
      .filter((photo: PhotoFile | null): photo is PhotoFile => photo !== null);

    if (photos.length === 0) {
      return {
        ok: false,
        error: {
          code: 'no-photos',
          message: 'Tidak ada foto yang valid ditemukan di folder ini.',
        },
        fallback: 'manual',
      };
    }

    return { ok: true, photos };
  } catch (err) {
    const message =
      err instanceof Error && err.message.includes('Failed to fetch')
        ? 'Error jaringan. Silakan periksa koneksi internet Anda.'
        : 'Terjadi kesalahan saat memuat album.';

    return {
      ok: false,
      error: { code: 'network', message },
      fallback: 'manual',
    };
  }
}
