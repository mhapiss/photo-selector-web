import "jsr:@supabase/functions-js/edge-runtime.d.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Client-Info, Apikey",
};

const IMAGE_MIME_PREFIX = "image/";
const PAGE_SIZE = 200;

interface DriveFile {
  id: string;
  name?: string;
  mimeType?: string;
  size?: string;
  thumbnailLink?: string;
  hasThumbnail?: boolean;
}

async function listAllFiles(folderId: string, apiKey: string): Promise<DriveFile[]> {
  const all: DriveFile[] = [];
  let pageToken: string | undefined;

  do {
    const url = new URL("https://www.googleapis.com/drive/v3/files");
    url.searchParams.set("q", `'${folderId}' in parents and trashed = false`);
    url.searchParams.set("key", apiKey);
    url.searchParams.set("pageSize", String(PAGE_SIZE));
    url.searchParams.set(
      "fields",
      "nextPageToken,files(id,name,mimeType,size,thumbnailLink)",
    );
    url.searchParams.set("orderBy", "name");

    if (pageToken) url.searchParams.set("pageToken", pageToken);

    const res = await fetch(url.toString(), {
      headers: { Accept: "application/json" },
    });

    if (res.status === 403) {
      const body = await res.json().catch(() => ({}));
      const reason = body?.error?.errors?.[0]?.reason ?? "forbidden";
      if (reason === "canOnlyShareOrganizationalFolders") {
        throw new Error("FOLDER_PRIVATE_ORG");
      }
      if (reason === "keyInvalid" || reason === "badRequest") {
        throw new Error("API_KEY_INVALID");
      }
      throw new Error("FOLDER_PRIVATE");
    }

    if (res.status === 404) {
      throw new Error("FOLDER_NOT_FOUND");
    }

    if (!res.ok) {
      throw new Error("DRIVE_ERROR");
    }

    const data = await res.json();
    if (Array.isArray(data.files)) {
      all.push(...data.files);
    }
    pageToken = data.nextPageToken;
  } while (pageToken);

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
  try {
    if (req.method === "POST") {
      const body = await req.json();
      folderId = body?.folderId ?? "";
    } else {
      const u = new URL(req.url);
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

  try {
    const files = await listAllFiles(folderId, apiKey);
    const images: DriveFile[] = files.filter(
      (f) =>
        f.mimeType?.startsWith(IMAGE_MIME_PREFIX) ||
        (f.name && /\.(jpe?g|png|webp|heic|gif|bmp|tiff?|raw|cr2|nef|arw|dng)$/i.test(f.name)),
    );

    return Response.json(
      {
        ok: true,
        count: images.length,
        files: images.map((f) => ({
          id: f.id,
          fileId: f.id,
          name: f.name ?? f.id,
          thumbnailUrl:
            f.thumbnailLink ??
            `https://drive.google.com/thumbnail?id=${f.id}&sz=w400`,
          directUrl: `https://drive.google.com/file/d/${f.id}/view`,
          size: f.size ? Number(f.size) : undefined,
        })),
      },
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } },
    );
  } catch (err) {
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

    return Response.json(
      { ok: false, error: { code, message } },
      { status: httpStatus, headers: { ...corsHeaders, "Content-Type": "application/json" } },
    );
  }
});
