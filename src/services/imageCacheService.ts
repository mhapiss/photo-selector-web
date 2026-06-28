/**
 * High performance image cache
 *
 * thumb  = gallery
 * medium = viewer
 * large  = zoom
 */

const imageCache = new Map<
  string,
  HTMLImageElement
>();

const pendingCache = new Map<
  string,
  Promise<HTMLImageElement>
>();

export function driveThumb(
  fileId: string,
  width = 250
): string {
  return `https://drive.google.com/thumbnail?id=${fileId}&sz=w${width}`;
}

export function driveMedium(
  fileId: string
): string {
  return `https://drive.google.com/thumbnail?id=${fileId}&sz=w1000`;
}

export function driveLarge(
  fileId: string
): string {
  return `https://drive.google.com/thumbnail?id=${fileId}&sz=w1600`;
}

export function preloadImage(
  url: string
): Promise<HTMLImageElement> {
  if (!url) {
    return Promise.reject(
      new Error('no-url')
    );
  }

  const cached =
    imageCache.get(url);

  if (cached) {
    return Promise.resolve(
      cached
    );
  }

  const pending =
    pendingCache.get(url);

  if (pending) {
    return pending;
  }

  const promise =
    new Promise<HTMLImageElement>(
      (resolve, reject) => {
        const img =
          new Image();

        img.decoding =
          'async';

        img.loading =
          'eager';

        img.onload = () => {
          imageCache.set(
            url,
            img
          );

          pendingCache.delete(
            url
          );

          resolve(img);
        };

        img.onerror = () => {
          pendingCache.delete(
            url
          );

          reject(
            new Error(
              `Failed to load: ${url}`
            )
          );
        };

        img.src = url;
      }
    );

  pendingCache.set(
    url,
    promise
  );

  return promise;
}

export function isCached(
  url: string
): boolean {
  return imageCache.has(
    url
  );
}

export function preloadPhotos(
  fileIds: string[],
  resolver: (
    fileId: string
  ) => string
): void {
  fileIds.forEach((id) => {
    void preloadImage(
      resolver(id)
    ).catch(() => {});
  });
}

export function extractFileIdFromUrl(
  url: string
): string | null {
  const idMatch =
    url.match(
      /[?&]id=([A-Za-z0-9_-]{20,})/
    );

  if (idMatch)
    return idMatch[1];

  const fileMatch =
    url.match(
      /\/file\/d\/([A-Za-z0-9_-]{20,})/
    );

  if (fileMatch)
    return fileMatch[1];

  return null;
}

export function getMediumUrl(
  thumbnailUrl: string
): string {
  const fid =
    extractFileIdFromUrl(
      thumbnailUrl
    );

  return fid
    ? driveMedium(fid)
    : thumbnailUrl;
}

export function getLargeUrl(
  thumbnailUrl: string
): string {
  const fid =
    extractFileIdFromUrl(
      thumbnailUrl
    );

  return fid
    ? driveLarge(fid)
    : thumbnailUrl;
}