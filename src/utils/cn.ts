export type ClassValue = string | false | null | undefined;

/**
 * Joins class names, dropping the falsy ones. There is no tailwind-merge in this project, so a
 * component's own utilities and a caller's `className` must not set the same CSS property.
 */
export function cn(...values: ClassValue[]): string {
  return values.filter(Boolean).join(" ");
}
