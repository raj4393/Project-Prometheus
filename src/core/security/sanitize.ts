/**
 * @module Sanitize
 * @description Strict client-side HTML entity sanitizer to neutralize XSS attack vectors.
 * Replaces dangerous characters with safe HTML entities before any user input
 * touches the application store or DOM.
 */

/**
 * Map of dangerous characters to their safe HTML entity replacements.
 * Covers the OWASP-recommended set for XSS prevention.
 */
const ENTITY_MAP: Readonly<Record<string, string>> = {
  '&': '&amp;',
  '<': '&lt;',
  '>': '&gt;',
  '"': '&quot;',
  "'": '&#x27;',
  '/': '&#x2F;',
};

/**
 * Pre-compiled regex pattern matching all dangerous characters.
 */
const DANGEROUS_CHARS_PATTERN = /[&<>"'/]/g;

/**
 * Sanitizes a string by replacing dangerous HTML characters with safe entities.
 * This prevents XSS attacks when user input is rendered in the DOM.
 *
 * @param input - The raw string to sanitize
 * @returns The sanitized string with HTML entities replacing dangerous characters
 * @throws Never — returns empty string for null/undefined inputs
 *
 * @example
 * ```typescript
 * sanitizeInput('<script>alert("xss")</script>')
 * // Returns: '&lt;script&gt;alert(&quot;xss&quot;)&lt;&#x2F;script&gt;'
 * ```
 */
export function sanitizeInput(input: string): string {
  if (!input) {
    return '';
  }
  return input.replace(DANGEROUS_CHARS_PATTERN, (char) => ENTITY_MAP[char] ?? char);
}

/**
 * Sanitizes all string values within a plain object, recursively.
 * Non-string values are passed through unchanged.
 *
 * @param obj - The object whose string values should be sanitized
 * @returns A new object with all string values sanitized
 * @throws Never — returns empty object for null/undefined inputs
 */
export function sanitizeObject<T extends Record<string, unknown>>(obj: T): T {
  if (!obj || typeof obj !== 'object') {
    return {} as T;
  }

  const result: Record<string, unknown> = {};
  for (const [key, value] of Object.entries(obj)) {
    if (typeof value === 'string') {
      result[key] = sanitizeInput(value);
    } else if (Array.isArray(value)) {
      result[key] = value.map((item) =>
        typeof item === 'string'
          ? sanitizeInput(item)
          : typeof item === 'object' && item !== null
            ? sanitizeObject(item as Record<string, unknown>)
            : item
      );
    } else if (typeof value === 'object' && value !== null) {
      result[key] = sanitizeObject(value as Record<string, unknown>);
    } else {
      result[key] = value;
    }
  }
  return result as T;
}
