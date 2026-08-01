/**
 * Capitalizes the first letter of each word in a string
 * @param str - The string to capitalize
 * @returns The string with each word's first letter capitalized
 */
export function capitalizeWords(str: string): string {
  if (!str) return "";

  return str
    .toLowerCase()
    .split(" ")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
}

/**
 * Alternative implementation that handles multiple spaces and special characters better
 * @param str - The string to capitalize
 * @returns The string with each word's first letter capitalized
 */
export function capitalizeWordsAdvanced(str: string): string {
  if (!str) return "";

  return str.toLowerCase().replace(/\b\w/g, (char) => char.toUpperCase());
}
