import type { LocalizedCopy } from "@/domain/types";

export const BASE_LOCALE = "en";

// Read a localized field for `locale`. Falls back to the base locale, then to
// any populated locale, then "". Lets the editor preview a locale the user
// hasn't translated yet using the source copy instead of blanks.
export function readCopy(field: LocalizedCopy | undefined, locale: string): string {
  if (!field) return "";
  const exact = field[locale];
  if (exact && exact.length) return exact;
  const base = field[BASE_LOCALE];
  if (base && base.length) return base;
  for (const key of Object.keys(field)) {
    const candidate = field[key];
    if (candidate && candidate.length) return candidate;
  }
  return "";
}

// Write (or clear) the value for `locale`. Empty strings delete the key so the
// persisted JSON never accumulates "" placeholders.
export function editCopy(
  field: LocalizedCopy | undefined,
  locale: string,
  value: string,
): LocalizedCopy {
  const next: LocalizedCopy = { ...(field || {}) };
  if (value.length === 0) delete next[locale];
  else next[locale] = value;
  return next;
}

// Coerce a legacy plain-string field into the per-locale shape. Idempotent.
export function normalizeCopy(value: unknown): LocalizedCopy {
  if (typeof value === "string") return { [BASE_LOCALE]: value };
  if (value && typeof value === "object") return value as LocalizedCopy;
  return {};
}

// Expand `{locale}` tokens in a capture path. Data URLs and empties pass
// through untouched.
export function expandCapturePath(path: string | undefined, locale: string): string {
  if (!path) return "";
  if (path.startsWith("data:")) return path;
  if (!path.includes("{locale}")) return path;
  return path.replace(/\{locale\}/g, locale);
}
