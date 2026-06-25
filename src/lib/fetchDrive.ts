import type { LoadError, PhotoFile } from '../types';
import { supabaseUrl, supabaseAnonKey } from './supabase';

export type FetchResult =
  | { ok: true; photos: PhotoFile[] }
  | { ok: false; error: LoadError; fallback: 'manual' };

function isValidHttpUrl(value: unknown): value is string {
  return (
    typeof value === 'string' &&
    /^https?:\/\//i.test(value.trim())
  );
}

function normalizePhotoFile(file: any): PhotoFile | null {
  if (!file || typeof file !== 'object') return null;

  const id = typeof file.id === 'string' ? file.id.trim() : '';
  const name = typeof file.name === 'string' ? file.name.trim() : '';

  if (!id || !name) return null;

  // Coba berbagai source untuk thumbnail URL
  let thumbnailUrl = '';
  
  // 1. Coba dari field thumbnailUrl
  if (isValidHttpUrl(file.thumbnailUrl)) {
    thumbnailUrl = file.thumbnailUrl.trim();
  } 
  // 2. Coba dari thumbnailLink
  else if (isValidHttpUrl(file.thumbnailLink)) {
    thumbnailUrl = file.thumbnailLink.trim();
  } 
  // 3. Coba dari webContentLink
  else if (isValidHttpUrl(file.webContentLink)) {
    thumbnailUrl = file.webContentLink.trim();
  } 
  // 4. Coba dari webViewLink
  else if (isValidHttpUrl(file.webViewLink)) {
    thumbnailUrl = file.webViewLink.trim();
  }
  // 5. Coba dari iconLink (untuk fallback)
  else if (isValidHttpUrl(file.iconLink)) {
    thumbnailUrl = file.iconLink.trim();
  }
  // 6. Build dari ID dengan format standar
  else {
    thumbnailUrl = `https://drive.google.com/thumbnail?id=${encodeURIComponent(id)}&sz=w400`;
  }

  // Buat directUrl (untuk preview ukuran besar)
  const directUrl = file.webContentLink || 
                    file.webViewLink || 
                    `https://drive.google.com/uc?id=${id}&export=download`;

  // Log untuk debugging
  console.log(`📸 Photo: ${name}, thumbnailUrl: ${thumbnailUrl.substring(0, 50)}...`);

  // Buat PhotoFile dengan field yang lengkap
  return {
    id,
    name,
    mimeType: file.mimeType || 'image/jpeg',
    thumbnailUrl,
    directUrl,
    webContentLink: directUrl,
    size: file.size || 0,
    // Simpan data tambahan untuk fallback
    _raw: file,
  } as unknown as PhotoFile;
}

/**
 * Calls the `drive-list` edge function to enumerate image files inside a
 * Google Drive folder. Falls back gracefully with a clear error when the
 * photographer has not configured a Google API key or the folder is private.
 */
export async function fetchDrivePhotos(folderId: string): Promise<FetchResult> {
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

    const data = await res.json().catch(() => null);

    // Log response untuk debugging
    console.log('📡 Drive list response:', data);

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

    if (!Array.isArray(data?.files)) {
      console.error('❌ Invalid response format:', data);
      return {
        ok: false,
        error: {
          code: 'unknown',
          message: 'Unexpected response from the server.',
        },
        fallback: 'manual',
      };
    }

    // Log raw files untuk debugging
    console.log(`📁 Raw files (${data.files.length}):`, data.files.slice(0, 3));

    const photos = data.files
      .map(normalizePhotoFile)
      .filter((photo: PhotoFile | null): photo is PhotoFile => photo !== null);

    console.log(`✅ Normalized photos (${photos.length}):`, photos.slice(0, 3));

    if (photos.length === 0) {
      return {
        ok: false,
        error: {
          code: 'no-photos',
          message: 'No valid photos found in this folder.',
        },
        fallback: 'manual',
      };
    }

    return { ok: true, photos };
  } catch (err) {
    console.error('❌ Fetch error:', err);
    const message =
      err instanceof Error && err.message.includes('Failed to fetch')
        ? 'Network error. Please check your connection and try again.'
        : 'Something went wrong loading the album.';

    return {
      ok: false,
      error: { code: 'network', message },
      fallback: 'manual',
    };
  }
}