import "jsr:@supabase/functions-js/edge-runtime.d.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Client-Info, Apikey",
};

const IMAGE_MIME_PREFIX = "image/";
const PAGE_SIZE = 200;
const FOLDER_MIME = "application/vnd.google-apps.folder";
const SHORTCUT_MIME = "application/vnd.google-apps.shortcut";

const IMAGE_EXTENSIONS_REGEX =
  /\.(jpe?g|png|webp|heic|heif|avif|gif|bmp|tiff?|raw|cr2|cr3|nef|arw|dng|raf|rw2|orf|pef|srw|psd)$/i;

const NON_IMAGE_MIMES = [
  "application/pdf",
  "application/zip",
  "application/x-zip-compressed",
  "application/x-rar-compressed",
  "application/x-7z-compressed",
];

interface DriveFile {
  id: string;
  name?: string;
  mimeType?: string;
  size?: string;
  thumbnailLink?: string;
  hasThumbnail?: boolean;
  shortcutDetails?: {
    targetId?: string;
    targetMimeType?: string;
  };
}

const isImageFile = (f: DriveFile): boolean => {
  if (f.mimeType === FOLDER_MIME || f.mimeType === SHORTCUT_MIME) return false;
  if (f.mimeType?.startsWith("video/") || f.mimeType?.startsWith("audio/")) return false;
  if (f.mimeType && NON_IMAGE_MIMES.includes(f.mimeType)) return false;

  // Recognized image mime type
  if (f.mimeType?.startsWith(IMAGE_MIME_PREFIX)) return true;

  // Recognized image or camera RAW extension
  if (f.name && IMAGE_EXTENSIONS_REGEX.test(f.name)) return true;

  // Has Google-generated thumbnail (Drive recognizes it as visual media)
  if (f.thumbnailLink) return true;

  return false;
};

const processFile = (f: DriveFile) => ({
  id: f.id,
  fileId: f.id,
  name: f.name ?? f.id,
  thumbnailUrl:
    f.thumbnailLink ??
    `https://drive.google.com/thumbnail?id=${f.id}&sz=w400`,
  directUrl: `https://drive.google.com/file/d/${f.id}/view`,
  size: f.size ? Number(f.size) : undefined,
});

const mapError = (err: unknown) => {
  const msg = err instanceof Error ? err.message : "unknown";
  let code = "network";
  let httpStatus = 502;
  let message = "Could not reach Google Drive. Please check the link and try again.";

  if (msg === "API_KEY_INVALID") {
    code = "api-key-invalid";
    httpStatus = 503;
    message = "The Google API key is invalid or revoked. Contact the photographer.";
  } else if (msg === "FOLDER_PRIVATE") {
    code = "folder-private";
    httpStatus = 403;
    message =
      "This folder is not shared publicly. Ask the photographer to set sharing to 'Anyone with the link'.";
  } else if (msg === "FOLDER_PRIVATE_ORG") {
    code = "folder-private";
    httpStatus = 403;
    message =
      "This folder belongs to a Google Workspace organization and can't be accessed via a public API key.";
  } else if (msg === "FOLDER_NOT_FOUND") {
    code = "folder-private";
    httpStatus = 404;
    message = "Folder not found. Please check the link is correct.";
  }

  return { code, message, httpStatus };
};

/**
 * Recursively list all files across the root folder and any subfolders.
 */
async function listAllFiles(rootFolderId: string, apiKey: string): Promise<DriveFile[]> {
  const all: DriveFile[] = [];
  const folderQueue: string[] = [rootFolderId];
  const visitedFolders = new Set<string>([rootFolderId]);
  const seenFileIds = new Set<string>();

  while (folderQueue.length > 0) {
    const currentFolder = folderQueue.shift()!;
    let pageToken: string | undefined;

    do {
      const url = new URL("https://www.googleapis.com/drive/v3/files");
      url.searchParams.set("q", `'${currentFolder}' in parents and trashed = false`);
      url.searchParams.set("key", apiKey);
      url.searchParams.set("pageSize", String(PAGE_SIZE));
      url.searchParams.set(
        "fields",
        "nextPageToken,files(id,name,mimeType,size,thumbnailLink,shortcutDetails)",
      );
      url.searchParams.set("orderBy", "name");

      if (pageToken) url.searchParams.set("pageToken", pageToken);

      const res = await fetch(url.toString(), {
        headers: { Accept: "application/json" },
      });

      if (res.status === 403) {
        const body = await res.json().catch(() => ({}));
        const reason = body?.error?.errors?.[0]?.reason ?? "forbidden";
        if (currentFolder === rootFolderId) {
          if (reason === "canOnlyShareOrganizationalFolders") {
            throw new Error("FOLDER_PRIVATE_ORG");
          }
          if (reason === "keyInvalid" || reason === "badRequest") {
            throw new Error("API_KEY_INVALID");
          }
          throw new Error("FOLDER_PRIVATE");
        }
        break; // Skip inaccessible subfolder
      }

      if (res.status === 404) {
        if (currentFolder === rootFolderId) throw new Error("FOLDER_NOT_FOUND");
        break; // Skip deleted subfolder
      }

      if (!res.ok) {
        if (currentFolder === rootFolderId) throw new Error("DRIVE_ERROR");
        break;
      }

      const data = await res.json();
      const files: DriveFile[] = Array.isArray(data.files) ? data.files : [];

      for (const f of files) {
        if (f.mimeType === FOLDER_MIME) {
          if (!visitedFolders.has(f.id) && visitedFolders.size < 100) {
            visitedFolders.add(f.id);
            folderQueue.push(f.id);
          }
        } else if (
          f.mimeType === SHORTCUT_MIME &&
          f.shortcutDetails?.targetMimeType === FOLDER_MIME &&
          f.shortcutDetails?.targetId
        ) {
          const targetId = f.shortcutDetails.targetId;
          if (!visitedFolders.has(targetId) && visitedFolders.size < 100) {
            visitedFolders.add(targetId);
            folderQueue.push(targetId);
          }
        } else if (!seenFileIds.has(f.id)) {
          seenFileIds.add(f.id);
          all.push(f);
        }
      }

      pageToken = data.nextPageToken;
    } while (pageToken);
  }

  return all;
}

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { status: 200, headers: corsHeaders });
  }

  const apiKey = Deno.env.get("GOOGLE_API_KEY");

  if (!apiKey) {
    return Response.json(
      {
        ok: false,
        error: {
          code: "api-key-missing",
          message:
            "The photographer has not connected a Google API key. Please paste filenames manually instead.",
        },
      },
      { status: 503, headers: { ...corsHeaders, "Content-Type": "application/json" } },
    );
  }

  let folderId = "";
  let isJsonFormat = false;
  try {
    const u = new URL(req.url);
    isJsonFormat =
      u.searchParams.get("format") === "json" ||
      req.headers.get("accept")?.includes("application/json") ||
      false;
    if (req.method === "POST") {
      const body = await req.json();
      folderId = body?.folderId ?? "";
    } else {
      folderId = u.searchParams.get("folderId") ?? "";
    }
  } catch {
    // ignore parse errors
  }

  if (!folderId) {
    return Response.json(
      { ok: false, error: { code: "invalid-link", message: "A folder ID is required." } },
      { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } },
    );
  }

  // Non-streaming JSON mode fallback
  if (isJsonFormat) {
    try {
      const files = await listAllFiles(folderId, apiKey);
      const images: DriveFile[] = files.filter(isImageFile);

      return Response.json(
        {
          ok: true,
          count: images.length,
          files: images.map(processFile),
        },
        { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } },
      );
    } catch (err) {
      const { code, message, httpStatus } = mapError(err);
      return Response.json(
        { ok: false, error: { code, message } },
        { status: httpStatus, headers: { ...corsHeaders, "Content-Type": "application/json" } },
      );
    }
  }

  // Progressive streaming NDJSON mode (supports recursive subfolders)
  const encoder = new TextEncoder();
  return new Response(
    new ReadableStream({
      async start(controller) {
        const folderQueue: string[] = [folderId];
        const visitedFolders = new Set<string>([folderId]);
        const seenFileIds = new Set<string>();
        let totalCount = 0;

        try {
          while (folderQueue.length > 0) {
            const currentFolder = folderQueue.shift()!;
            let pageToken: string | undefined;

            do {
              const url = new URL("https://www.googleapis.com/drive/v3/files");
              url.searchParams.set("q", `'${currentFolder}' in parents and trashed = false`);
              url.searchParams.set("key", apiKey);
              url.searchParams.set("pageSize", String(PAGE_SIZE));
              url.searchParams.set(
                "fields",
                "nextPageToken,files(id,name,mimeType,size,thumbnailLink,shortcutDetails)",
              );
              url.searchParams.set("orderBy", "name");

              if (pageToken) url.searchParams.set("pageToken", pageToken);

              const res = await fetch(url.toString(), {
                headers: { Accept: "application/json" },
              });

              if (res.status === 403) {
                const body = await res.json().catch(() => ({}));
                const reason = body?.error?.errors?.[0]?.reason ?? "forbidden";
                if (currentFolder === folderId) {
                  if (reason === "canOnlyShareOrganizationalFolders") {
                    throw new Error("FOLDER_PRIVATE_ORG");
                  }
                  if (reason === "keyInvalid" || reason === "badRequest") {
                    throw new Error("API_KEY_INVALID");
                  }
                  throw new Error("FOLDER_PRIVATE");
                }
                break; // Skip inaccessible subfolder, continue other folders
              }

              if (res.status === 404) {
                if (currentFolder === folderId) throw new Error("FOLDER_NOT_FOUND");
                break; // Skip deleted subfolder
              }

              if (!res.ok) {
                if (currentFolder === folderId) throw new Error("DRIVE_ERROR");
                break;
              }

              const data = await res.json();
              const files: DriveFile[] = Array.isArray(data.files) ? data.files : [];

              // Discover subfolders
              for (const f of files) {
                if (f.mimeType === FOLDER_MIME) {
                  if (!visitedFolders.has(f.id) && visitedFolders.size < 100) {
                    visitedFolders.add(f.id);
                    folderQueue.push(f.id);
                  }
                } else if (
                  f.mimeType === SHORTCUT_MIME &&
                  f.shortcutDetails?.targetMimeType === FOLDER_MIME &&
                  f.shortcutDetails?.targetId
                ) {
                  const targetId = f.shortcutDetails.targetId;
                  if (!visitedFolders.has(targetId) && visitedFolders.size < 100) {
                    visitedFolders.add(targetId);
                    folderQueue.push(targetId);
                  }
                }
              }

              // Filter to unique image files
              const images = files.filter((f) => {
                if (!isImageFile(f)) return false;
                if (seenFileIds.has(f.id)) return false;
                seenFileIds.add(f.id);
                return true;
              });

              if (images.length > 0) {
                totalCount += images.length;
                const batch = images.map(processFile);
                const hasMore = !!data.nextPageToken || folderQueue.length > 0;

                controller.enqueue(
                  encoder.encode(JSON.stringify({ batch, hasMore }) + "\n")
                );
              }

              pageToken = data.nextPageToken;
            } while (pageToken);
          }

          controller.enqueue(
            encoder.encode(JSON.stringify({ done: true, totalCount }) + "\n")
          );
        } catch (err) {
          const { code, message } = mapError(err);
          controller.enqueue(
            encoder.encode(JSON.stringify({ error: { code, message } }) + "\n")
          );
        } finally {
          controller.close();
        }
      },
    }),
    {
      headers: {
        ...corsHeaders,
        "Content-Type": "application/x-ndjson",
        "Cache-Control": "no-cache",
      },
    }
  );
});
