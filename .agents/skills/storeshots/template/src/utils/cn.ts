import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

// Merge conditional class names while letting later Tailwind utilities win.
export function cn(...parts: ClassValue[]): string {
  return twMerge(clsx(parts));
}
