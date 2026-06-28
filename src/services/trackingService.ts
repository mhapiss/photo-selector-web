import { supabase } from './supabaseService';
import type { AlbumMeta, PhotoFile } from '../types';

/**
 * Persists an album submission + the client's selection so the photographer
 * can audit it later. Non-blocking — failures are swallowed so they never
 * block the user's flow.
 */
export async function recordSelection(
  meta: AlbumMeta,
  photos: PhotoFile[],
): Promise<void> {
  if (!supabase) return;
  try {
    await supabase.from('albums').insert({
      client_name: meta.clientName,
      event_name: meta.eventName,
      folder_link: meta.folderLink,
      folder_id: meta.folderId,
      photo_count: photos.length,
      selections: photos.map((p) => p.name),
    });
  } catch {
    // best-effort; do not block user flow
  }
}
