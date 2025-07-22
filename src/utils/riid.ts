/**
 * Generates a random ID
 */
export function riid(): string {
  return Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
}
