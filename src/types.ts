export type PhotoFile = {
  id: string;
  name: string;
  mimeType: string;
  thumbnailUrl: string;
  directUrl: string; // URL untuk akses langsung ke file
  webContentLink: string;
  size: number;
  _raw?: any; // Optional untuk debugging
};

export type AlbumMeta = {
  folderId: string;
  eventName: string;
  // tambahan field lain sesuai kebutuhan
};

export type LoadState = 'idle' | 'loading' | 'success' | 'error';

export type LoadError = {
  code: string;
  message: string;
};