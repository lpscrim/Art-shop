interface Project {
  id: number;
  title: string;
  categories: string[];
  year: string;
  imageUrl: string;  // Cloudinary public ID
  galleryImages?: string[];
  text: string;
}

interface CloudinaryResource {
  public_id: string;
  secure_url?: string;
  format?: string;
  filename?: string;
  original_filename?: string;
  display_name?: string;
  created_at?: string;
}

interface CloudinarySearchResponse {
  resources: CloudinaryResource[];
  next_cursor?: string;
}

const CLOUDINARY_CACHE_TAG = "cloudinary-projects";
const CLOUDINARY_REVALIDATE_SECONDS = 60 * 60; // 1 hour

const DESCRIPTION_FORMATS = ["txt", "cd"] as const;

function getLastPathSegment(value: string): string {
  return value.split("/").pop() ?? "";
}

function stripExtension(filename: string): string {
  return filename.replace(/\.[^.]+$/, "");
}

function getDescriptionIndexFromName(name: string): number | null {
  // Supports: description.txt, description_1.txt, description_2.cd, etc.
  // Also supports Cloudinary-generated unique IDs like: description_ab12cd.txt
  const last = getLastPathSegment(name.trim());
  if (!last) return null;

  const base = stripExtension(last).toLowerCase();
  const match = base.match(/^description(?:_(\d+))?$/);
  if (!match) return null;
  if (!match[1]) return 0;

  const n = Number(match[1]);
  return Number.isFinite(n) ? n : null;
}

function isDescriptionLikeName(name: string): boolean {
  const last = getLastPathSegment(name.trim()).toLowerCase();
  if (!last) return false;
  const base = stripExtension(last);
  return base === "description" || base.startsWith("description_");
}

function getResourceNameCandidates(resource: CloudinaryResource): string[] {
  const candidates: string[] = [];
  if (resource.display_name) candidates.push(resource.display_name);
  if (resource.filename) candidates.push(resource.filename);

  if (resource.original_filename) {
    const format = (resource.format ?? "").trim();
    candidates.push(format ? `${resource.original_filename}.${format}` : resource.original_filename);
  }

  candidates.push(getLastPathSegment(resource.public_id));
  return candidates;
}

function getDescriptionIndex(resource: CloudinaryResource): number | null {
  const candidates = getResourceNameCandidates(resource);
  const numericIndices = candidates
    .map(getDescriptionIndexFromName)
    .filter((n): n is number => typeof n === "number")
    .sort((a, b) => a - b);

  if (numericIndices.length > 0) return numericIndices[0];
  if (candidates.some(isDescriptionLikeName)) return 1000;
  return null;
}

function isDescriptionResource(resource: CloudinaryResource): boolean {
  if (getDescriptionIndex(resource) === null) return false;

  const format = (resource.format ?? "").toLowerCase();
  if (format) return (DESCRIPTION_FORMATS as readonly string[]).includes(format);

  // Fallback if Cloudinary didn't provide `format`
  return getResourceNameCandidates(resource).some((name) => {
    const lower = name.toLowerCase();
    return lower.endsWith(".txt") || lower.endsWith(".cd");
  });
}

function normalizeText(text: string): string {
  return text.replace(/\r\n/g, "\n").trim();
}

async function fetchCloudinaryResources(folder: string): Promise<string[]> {
  const cloudName = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME;
  const apiKey = process.env.CLOUDINARY_API_KEY;
  const apiSecret = process.env.CLOUDINARY_API_SECRET;

  if (!cloudName || !apiKey || !apiSecret) return [];
  
  const auth = Buffer.from(`${apiKey}:${apiSecret}`).toString('base64');
  
  const response = await fetch(
    `https://api.cloudinary.com/v1_1/${cloudName}/resources/search`,
    {
      method: 'POST',
      headers: {
        'Authorization': `Basic ${auth}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        expression: `folder:photos/${folder}/*`,
        max_results: 500,
        resource_type: "image",
        type: "upload",
        fields: ["public_id", "format", "filename", "original_filename", "display_name"],
      }),
      next: {
        revalidate: CLOUDINARY_REVALIDATE_SECONDS,
        tags: [CLOUDINARY_CACHE_TAG],
      },
    }
  );
  
  const data: CloudinarySearchResponse = await response.json();
  return data.resources
    .filter((r) => !isDescriptionResource(r))
    .map((r) => r.public_id)
    .sort();
}

async function fetchCloudinaryDescriptionText(folder: string): Promise<string> {
  const cloudName = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME;
  const apiKey = process.env.CLOUDINARY_API_KEY;
  const apiSecret = process.env.CLOUDINARY_API_SECRET;

  if (!cloudName || !apiKey || !apiSecret) return "";

  const auth = Buffer.from(`${apiKey}:${apiSecret}`).toString("base64");

  try {
    const response = await fetch(
      `https://api.cloudinary.com/v1_1/${cloudName}/resources/search`,
      {
        method: "POST",
        headers: {
          Authorization: `Basic ${auth}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          expression: `folder:photos/${folder}/*`,
          max_results: 200,
          resource_type: "raw",
          type: "upload",
          fields: [
            "public_id",
            "secure_url",
            "format",
            "filename",
            "original_filename",
            "display_name",
            "created_at",
          ],
        }),
        next: {
          revalidate: CLOUDINARY_REVALIDATE_SECONDS,
          tags: [CLOUDINARY_CACHE_TAG],
        },
      }
    );

    if (!response.ok) return "";

    const data: CloudinarySearchResponse = await response.json();
    const candidates = data.resources
      .filter((r) => isDescriptionResource(r))
      .map((r) => ({
        resource: r,
        idx: getDescriptionIndex(r) ?? Number.POSITIVE_INFINITY,
        createdAtMs: r.created_at ? Date.parse(r.created_at) : 0,
      }))
      // Prefer lowest index (description.txt / description_0), then newest upload
      .sort((a, b) => (a.idx - b.idx) || (b.createdAtMs - a.createdAtMs));

    const descriptionResource = candidates[0]?.resource;
    if (!descriptionResource?.secure_url) return "";

    const textResponse = await fetch(descriptionResource.secure_url, {
      next: {
        revalidate: CLOUDINARY_REVALIDATE_SECONDS,
        tags: [CLOUDINARY_CACHE_TAG],
      },
    });

    if (!textResponse.ok) return "";
    return normalizeText(await textResponse.text());
  } catch {
    return "";
  }
}

async function fetchCloudinaryFolders(): Promise<string[]> {
  const cloudName = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME;
  const apiKey = process.env.CLOUDINARY_API_KEY;
  const apiSecret = process.env.CLOUDINARY_API_SECRET;
  
  const auth = Buffer.from(`${apiKey}:${apiSecret}`).toString('base64');
  
  const response = await fetch(
    `https://api.cloudinary.com/v1_1/${cloudName}/folders/photos`,
    {
      headers: {
        'Authorization': `Basic ${auth}`,
      },
      next: {
        revalidate: CLOUDINARY_REVALIDATE_SECONDS,
        tags: [CLOUDINARY_CACHE_TAG],
      },
    }
  );
  
  const data = await response.json();
  return data.folders?.map((f: { name: string }) => f.name) ?? [];
}

export async function getProjects(): Promise<Project[]> {
  const folders = await fetchCloudinaryFolders();
  
  const projects: Project[] = await Promise.all(
    folders.map(async (folder) => {
      // Parse folder name: {id}_{name}_{date}_{category,category}
      const parts = folder.split("_");
      
      // Extract id from first part
      const id = parseInt(parts.shift() ?? "0", 10);
      
      // Last part is categories, second to last is date
      const categories = parts.pop()?.split(",") ?? [];
      const year = parts.pop() ?? new Date().getFullYear().toString();
      
      // Remaining parts form the project name
      const projectName = parts.join("_");

      // Format title: replace hyphens/underscores with spaces and uppercase
      const title = projectName
        .replace(/[-_]/g, " ")
        .toUpperCase();

      // Fetch images from Cloudinary
      const images = await fetchCloudinaryResources(folder);

      // Fetch optional project description text (from description.cd uploaded as a raw file)
      const text = await fetchCloudinaryDescriptionText(folder);

      // Sort so images named "0" (e.g., 0.webp, 0.jpg) come first as cover
      const sortedImages = images.sort((a, b) => {
        const aName = a.split('/').pop()?.replace(/\.[^.]+$/, '') ?? '';
        const bName = b.split('/').pop()?.replace(/\.[^.]+$/, '') ?? '';
        if (aName === '0') return -1;
        if (bName === '0') return 1;
        return aName.localeCompare(bName);
      });

      // Use first image as cover, rest as gallery
      const [coverImage, ...galleryImages] = sortedImages;

      return {
        id,
        title,
        categories,
        year,
        imageUrl: coverImage ?? "",
        ...(galleryImages.length > 0 && { galleryImages }),
        text,
      };
    })
  );

  // Sort by year (newest first), then by title
  return projects.sort((a, b) => {
    if (b.year !== a.year) return b.year.localeCompare(a.year);
    return a.title.localeCompare(b.title);
  });
}
