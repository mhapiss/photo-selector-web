import "jsr:@supabase/functions-js/edge-runtime.d.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Client-Info, Apikey",
};

const IMAGE_MIME_PREFIX = "image/";
const PAGE_SIZE = 500;
const FOLDER_MIME = "application/vnd.google-apps.folder";

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
    targetId: string;
    targetMimeType: string;
  };
}

const isImageFile = (f: DriveFile): boolean => {
  const mime = f.mimeType === "application/vnd.google-apps.shortcut"
    ? f.shortcutDetails?.targetMimeType
    : f.mimeType;

  if (mime === FOLDER_MIME) return false;
  if (mime?.startsWith("video/") || mime?.startsWith("audio/")) return false;
  if (mime && NON_IMAGE_MIMES.includes(mime)) return false;

  if (mime?.startsWith(IMAGE_MIME_PREFIX)) return true;
  if (f.name && IMAGE_EXTENSIONS_REGEX.test(f.name)) return true;
  if (f.thumbnailLink) return true;

  return false;
};

const processFile = (f: DriveFile) => {
  const targetId = f.mimeType === "application/vnd.google-apps.shortcut" && f.shortcutDetails 
    ? f.shortcutDetails.targetId 
    : f.id;
    
  return {
    id: f.id,
    fileId: targetId,
    name: f.name ?? f.id,
    thumbnailUrl:
      f.thumbnailLink ??
      `https://drive.google.com/thumbnail?id=${targetId}&sz=w400`,
    directUrl: `https://drive.google.com/file/d/${targetId}/view`,
    size: f.size ? Number(f.size) : undefined,
  };
};

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
  try {
    const u = new URL(req.url);
    if (req.method === "POST") {
      const body = await req.json().catch(() => ({}));
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

  const bodyStream = new ReadableStream({
    async start(controller) {
      const encoder = new TextEncoder();
      const send = (obj: any) => {
        controller.enqueue(encoder.encode(JSON.stringify(obj) + "\n"));
      };

      try {
        const folderQueue: string[] = [folderId];
        const visitedFolders = new Set<string>([folderId]);
        const seenFileIds = new Set<string>();
        let totalCount = 0;

        while (folderQueue.length > 0) {
          const currentFolder = folderQueue.shift()!;
          let pageToken: string | undefined;

          do {
            const url = new URL("https://www.googleapis.com/drive/v3/files");
            url.searchParams.set("q", `'${currentFolder}' in parents and trashed = false`);
            url.searchParams.set("key", apiKey);
            url.searchParams.set("pageSize", String(PAGE_SIZE));
            url.searchParams.set("includeItemsFromAllDrives", "true");
            url.searchParams.set("supportsAllDrives", "true");
            url.searchParams.set(
              "fields",
              "nextPageToken,files(id,name,mimeType,size,thumbnailLink,shortcutDetails(targetId,targetMimeType))",
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
              break; // Skip inaccessible subfolder
            }

            if (res.status === 404) {
              if (currentFolder === folderId) throw new Error("FOLDER_NOT_FOUND");
              break;
            }

            if (!res.ok) {
              if (currentFolder === folderId) throw new Error("DRIVE_ERROR");
              break;
            }

            const data = await res.json();
            const files: DriveFile[] = Array.isArray(data.files) ? data.files : [];
            const imagesBatch = [];

            for (const f of files) {
              const isFolder = f.mimeType === FOLDER_MIME || (f.mimeType === "application/vnd.google-apps.shortcut" && f.shortcutDetails?.targetMimeType === FOLDER_MIME);
              
              if (isFolder) {
                const targetId = f.mimeType === "application/vnd.google-apps.shortcut" && f.shortcutDetails ? f.shortcutDetails.targetId : f.id;
                if (!visitedFolders.has(targetId) && visitedFolders.size < 50) {
                  visitedFolders.add(targetId);
                  folderQueue.push(targetId);
                }
              } else if (!seenFileIds.has(f.id)) {
                seenFileIds.add(f.id);
                if (isImageFile(f)) {
                  imagesBatch.push(processFile(f));
                  totalCount++;
                }
              }
            }

            if (imagesBatch.length > 0) {
              send({ batch: imagesBatch });
            }

            pageToken = data.nextPageToken;
          } while (pageToken);
        }

        send({ done: true, totalCount });
        controller.close();
      } catch (err) {
        const { code, message } = mapError(err);
        send({ error: { code, message } });
        controller.close();
      }
    }
  });

  return new Response(bodyStream, {
    headers: {
      ...corsHeaders,
      "Content-Type": "application/x-ndjson",
    },
  });
});
