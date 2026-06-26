import type { PhotoFile } from '../types';

const IMAGE_EXTENSIONS =
  /\.(jpe?g|png|webp|heic|gif|bmp|tiff?|raw|cr2|nef|arw|dng)$/i;

const FOLDER_PATTERNS = [
  /\/folders\/([A-Za-z0-9_-]{20,})/,
  /[?&]id=([A-Za-z0-9_-]{20,})/,
  /^([A-Za-z0-9_-]{20,})$/,
];

/**
 * Extract Google Drive folder ID from:
 * - https://drive.google.com/drive/folders/...
 * - https://drive.google.com/open?id=...
 * - raw folder ID
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
 * Thumbnail URL optimized for gallery view.
 *
 * 250px is enough for grid thumbnails and
 * much faster than 500px when loading 1000 photos.
 */
export function driveThumbUrl(
  fileId: string,
  size = 250
): string {
  return `https://drive.google.com/thumbnail?id=${fileId}&sz=w${size}`;
}

/**
 * Medium image for fullscreen preview.
 */
export function driveMediumUrl(
  fileId: string
): string {
  return `https://drive.google.com/thumbnail?id=${fileId}&sz=w1000`;
}

/**
 * Large image for zoom.
 */
export function driveLargeUrl(
  fileId: string
): string {
  return `https://drive.google.com/thumbnail?id=${fileId}&sz=w1600`;
}

/**
 * Direct file viewer.
 */
export function driveFileUrl(
  fileId: string
): string {
  return `https://drive.google.com/file/d/${fileId}/view`;
}

export function isImageFile(
  name: string
): boolean {
  return IMAGE_EXTENSIONS.test(name);
}

/**
 * Parse manual filename list.
 */
export function parseFilenameList(
  raw: string
): string[] {
  return raw
    .split(/[\n,;]+/)
    .map((item) => item.trim())
    .filter(
      (item) =>
        item.length > 0 &&
        IMAGE_EXTENSIONS.test(item)
    );
}

/**
 * Convert Drive API response into PhotoFile.
 */
export function mapDriveFiles(
  items: Array<{
    id: string;
    name?: string;
    mimeType?: string;
    size?: string;
  }>
): PhotoFile[] {
  return items
    .filter(
      (file) =>
        file.mimeType?.startsWith('image/') ||
        (file.name &&
          isImageFile(file.name))
    )
    .map((file) => ({
      id: file.id,
      name: file.name ?? file.id,
      mimeType: file.mimeType || 'image/jpeg',
      thumbnailUrl: driveThumbUrl(
        file.id,
        250
      ),
      directUrl: driveFileUrl(
        file.id
      ),
      size: file.size
        ? Number(file.size)
        : undefined,
    }));
}