"use client";
// Resolves image paths to base64 data URIs ahead of export so html-to-image
// never races a network fetch mid-snapshot. Render code should always read
// through `asset()`.

const resolved = new Map<string, string>();
const broken = new Set<string>();

async function toDataUri(path: string): Promise<string | null> {
  try {
    const res = await fetch(path);
    if (!res.ok) return null;
    const blob = await res.blob();
    return await new Promise<string>((accept, reject) => {
      const reader = new FileReader();
      reader.onloadend = () => accept(reader.result as string);
      reader.onerror = reject;
      reader.readAsDataURL(blob);
    });
  } catch {
    return null;
  }
}

// Warm a batch of paths, skipping anything already cached or known-broken.
export async function warmAssets(paths: string[]): Promise<void> {
  const pending = paths
    .filter(Boolean)
    .filter((p) => !resolved.has(p) && !broken.has(p));

  await Promise.all(
    pending.map(async (p) => {
      const data = await toDataUri(p);
      if (data) resolved.set(p, data);
      else broken.add(p);
    }),
  );
}

// Resolve a path to its cached data URI, or the path itself as a fallback.
export function asset(path: string | undefined): string {
  if (!path) return "";
  if (path.startsWith("data:")) return path;
  if (broken.has(path)) return "";
  return resolved.get(path) || path;
}

// Seed the cache directly (used right after an upload so previews are instant).
export function cacheAsset(path: string, dataUri: string): void {
  resolved.set(path, dataUri);
  broken.delete(path);
}

// True only for a real path we tried and failed to load.
export function assetBroken(path: string | undefined): boolean {
  if (!path) return false;
  if (path.startsWith("data:")) return false;
  return broken.has(path);
}
