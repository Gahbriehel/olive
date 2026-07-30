import { useState, useEffect } from "react";

/**
 * Custom hook for debouncing search input values.
 * @param value The raw search string input
 * @param delay Delay in milliseconds (defaults to 1000ms)
 * @returns The debounced value updated after specified delay
 */
export function useDebouncedSearch<T>(value: T, delay: number = 1000): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value);

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => {
      clearTimeout(timer);
    };
  }, [value, delay]);

  return debouncedValue;
}

/**
 * Utility helper function for debouncing callback functions with 1000ms delay.
 */
export function createDebouncedSearch<Args extends unknown[]>(
  func: (...args: Args) => void,
  delay: number = 1000,
): (...args: Args) => void {
  let timeoutId: ReturnType<typeof setTimeout> | null = null;

  return (...args: Args) => {
    if (timeoutId) {
      clearTimeout(timeoutId);
    }
    timeoutId = setTimeout(() => {
      func(...args);
    }, delay);
  };
}
