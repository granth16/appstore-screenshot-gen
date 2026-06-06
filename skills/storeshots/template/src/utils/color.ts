// Lighten (positive percent) or darken (negative percent) a hex colour by a
// flat RGB offset. Accepts #rgb or #rrggbb and always returns #rrggbb.
export function shiftLightness(hex: string, percent: number): string {
  const raw = hex.replace("#", "");
  const full = raw.length === 3 ? raw.split("").map((c) => c + c).join("") : raw;
  const value = parseInt(full, 16);

  const offset = Math.round((255 * percent) / 100);
  const clamp = (n: number) => Math.max(0, Math.min(255, n + offset));

  const r = clamp((value >> 16) & 0xff);
  const g = clamp((value >> 8) & 0xff);
  const b = clamp(value & 0xff);

  return `#${((r << 16) | (g << 8) | b).toString(16).padStart(6, "0")}`;
}
