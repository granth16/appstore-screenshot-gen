// Turn arbitrary text into a filesystem-friendly slug.
export function toSlug(input: string, fallback = "storeshots"): string {
  return (
    input
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/(^-|-$)/g, "") || fallback
  );
}

// Compact local timestamp (YYYYMMDD-HHMM) for export filenames.
export function compactTimestamp(date = new Date()): string {
  const pad = (n: number) => String(n).padStart(2, "0");
  return (
    `${date.getFullYear()}${pad(date.getMonth() + 1)}${pad(date.getDate())}` +
    `-${pad(date.getHours())}${pad(date.getMinutes())}`
  );
}

// Humanize "saved N ago" relative to now.
export function relativeSince(then: number, now = Date.now()): string {
  const seconds = Math.max(0, Math.round((now - then) / 1000));
  if (seconds < 5) return "saved";
  if (seconds < 60) return `saved ${seconds}s ago`;
  if (seconds < 3600) return `saved ${Math.round(seconds / 60)}m ago`;
  return `saved ${Math.round(seconds / 3600)}h ago`;
}
