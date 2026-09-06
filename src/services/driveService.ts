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

/**
 * Wraps a URL with the wsrv.nl image proxy CDN for automatic WebP compression,
 * caching (to avoid Google Drive 429 rate limits), and resizing.
 */
export function optimizeImageUrl(url: string, width: number): string {
  // Skip wsrv.nl proxy for Google's own CDN — it's already fast, WebP-capable, globally cached
  if (url.includes('lh3.googleusercontent.com') || url.includes('lh4.googleusercontent.com') || url.includes('lh5.googleusercontent.com')) {
    return url;
  }
  // Remove protocol, wsrv.nl handles domain directly or encoded
  const cleanUrl = url.replace(/^https?:\/\//, '');
  // output=webp, w=width, we=animated webp for gifs, il=interlaced
  return `https://wsrv.nl/?url=${encodeURIComponent(cleanUrl)}&w=${width}&output=webp&we&il`;
}

/**
 * Build a Google-CDN-backed thumbnail URL for a Drive file.
 * Uses lh3 direct path when possible (faster, no wsrv.nl hop).
 */
export function driveThumbUrl(fileId: string, size = 250): string {
  const source = `https://drive.google.com/thumbnail?id=${fileId}&sz=w${size}`;
  return optimizeImageUrl(source, size);
}

export function driveMediumUrl(fileId: string): string {
  const source = `https://drive.google.com/thumbnail?id=${fileId}&sz=w1000`;
  return optimizeImageUrl(source, 1000);
}

export function driveLargeUrl(fileId: string): string {
  const source = `https://drive.google.com/thumbnail?id=${fileId}&sz=w1600`;
  return optimizeImageUrl(source, 1600);
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
// Drive Fetch Functions
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

/**
 * Normalize a raw file object from the edge function into a PhotoFile.
 * Prefers Google CDN (lh3) thumbnail URLs over wsrv.nl proxy when available.
 */
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
    thumbnailUrl = `https://drive.google.com/thumbnail?id=${id}&sz=w400`;
  }

  // If it's an lh3.googleusercontent.com link, resize via URL parameter (no wsrv.nl needed)
  const isGoogleCdn = thumbnailUrl.includes('lh3.googleusercontent.com') ||
                       thumbnailUrl.includes('lh4.googleusercontent.com') ||
                       thumbnailUrl.includes('lh5.googleusercontent.com');

  if (isGoogleCdn) {
    // Normalize size parameter for gallery thumbnail
    thumbnailUrl = thumbnailUrl.replace(/=s\d+/, '=s400').replace(/=w\d+/, '=s400');
  }

  const originalDirectUrl = file.webContentLink || 
                            file.webViewLink || 
                            `https://drive.google.com/uc?id=${id}&export=download`;

  return {
    id,
    name,
    mimeType: file.mimeType || 'image/jpeg',
    // Google CDN URLs are already fast & WebP-capable — skip wsrv.nl proxy
    thumbnailUrl: isGoogleCdn ? thumbnailUrl : optimizeImageUrl(thumbnailUrl, 400),
    // Optimize direct URL for full-screen viewer (2000px max width) via wsrv.nl
    directUrl: optimizeImageUrl(originalDirectUrl, 2000),
    // Keep original for native downloads if needed
    webContentLink: originalDirectUrl,
    size: file.size || 0,
  };
}

// ==========================================
// Streaming Fetch (NDJSON)
// ==========================================

/** Callback invoked for each batch of photos received from the stream. */
export type StreamBatchCallback = (photos: PhotoFile[], done: boolean, totalCount?: number) => void;

/**
 * Fetches photos from the drive-list edge function using streaming NDJSON.
 * Calls `onBatch` for each batch of photos received, allowing progressive rendering.
 * Returns a FetchResult with the final complete list.
 */
export async function fetchDrivePhotosStream(
  folderId: string,
  onBatch: StreamBatchCallback,
  signal?: AbortSignal,
): Promise<FetchResult> {
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
        Accept: 'application/x-ndjson',
        Authorization: `Bearer ${supabaseAnonKey}`,
        apikey: supabaseAnonKey,
      },
      body: JSON.stringify({ folderId }),
      signal,
    });

    const contentType = res.headers.get('content-type') || '';

    // If the response is NDJSON streaming, parse line by line
    if (contentType.includes('ndjson') && res.body) {
      return await parseNdjsonStream(res.body, onBatch);
    }

    // Fallback: standard JSON response (backwards compat or error responses)
    const data = await res.json().catch(() => null) as {
      ok?: boolean;
      files?: unknown[];
      error?: { code?: string; message?: string };
    } | null;

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

    onBatch(photos, true, photos.length);
    return { ok: true, photos };

  } catch (err) {
    if (signal?.aborted) {
      return {
        ok: false,
        error: { code: 'aborted', message: 'Request dibatalkan.' },
        fallback: 'manual',
      };
    }

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

/**
 * Parse an NDJSON stream from the edge function and emit batches of photos.
 */
async function parseNdjsonStream(
  body: ReadableStream<Uint8Array>,
  onBatch: StreamBatchCallback,
): Promise<FetchResult> {
  const reader = body.getReader();
  const decoder = new TextDecoder();
  let buffer = '';
  const allPhotos: PhotoFile[] = [];

  try {
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;

      buffer += decoder.decode(value, { stream: true });

      // Process complete lines
      const lines = buffer.split('\n');
      buffer = lines.pop() || ''; // Keep incomplete last line in buffer

      for (const line of lines) {
        const trimmed = line.trim();
        if (!trimmed) continue;

        try {
          const parsed = JSON.parse(trimmed) as {
            batch?: unknown[];
            done?: boolean;
            totalCount?: number;
            error?: { code?: string; message?: string };
            hasMore?: boolean;
          };

          // Error mid-stream
          if (parsed.error) {
            return {
              ok: false,
              error: {
                code: parsed.error.code ?? 'network',
                message: parsed.error.message ?? 'Error saat memuat foto.',
              },
              fallback: 'manual',
            };
          }

          // Batch of photos
          if (Array.isArray(parsed.batch)) {
            const batchPhotos = parsed.batch
              .map(normalizePhotoFile)
              .filter((p: PhotoFile | null): p is PhotoFile => p !== null);
            
            if (batchPhotos.length > 0) {
              allPhotos.push(...batchPhotos);
              onBatch(batchPhotos, false);
            }
          }

          // Stream complete
          if (parsed.done) {
            onBatch([], true, parsed.totalCount ?? allPhotos.length);
          }
        } catch {
          // Skip malformed JSON lines
        }
      }
    }
  } finally {
    reader.releaseLock();
  }

  if (allPhotos.length === 0) {
    return {
      ok: false,
      error: {
        code: 'no-photos',
        message: 'Tidak ada foto yang valid ditemukan di folder ini.',
      },
      fallback: 'manual',
    };
  }

  return { ok: true, photos: allPhotos };
}

/**
 * Legacy non-streaming fetch. Still used as fallback.
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
        Accept: 'application/json',
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
