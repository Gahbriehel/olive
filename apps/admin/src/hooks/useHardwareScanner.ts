import { useEffect, useRef } from "react";

interface UseHardwareScannerOptions {
  onScan: (code: string) => void;
  enabled?: boolean;
  maxIntervalMs?: number;
  minLength?: number;
}

/**
 * Custom hook to detect physical handheld HID barcode / QR scanners (USB or Bluetooth).
 * Scanners act as keyboard wedge devices that type characters in rapid succession (< 35ms)
 * terminated by an Enter keypress.
 */
export function useHardwareScanner({
  onScan,
  enabled = true,
  maxIntervalMs = 35,
  minLength = 3,
}: UseHardwareScannerOptions): void {
  const bufferRef = useRef<string>("");
  const lastKeyTimeRef = useRef<number>(0);
  const onScanRef = useRef(onScan);

  useEffect(() => {
    onScanRef.current = onScan;
  }, [onScan]);

  useEffect(() => {
    if (!enabled || typeof window === "undefined") return;

    const handleKeyDown = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement | null;

      // Ignore inputs if user is manually typing into standard text inputs or textareas,
      // UNLESS it's an explicit scan trigger key combo or rapid sequence
      const isInputTarget =
        target &&
        (target.tagName === "INPUT" ||
          target.tagName === "TEXTAREA" ||
          target.isContentEditable);

      const currentTime = performance.now();
      const timeDiff = currentTime - lastKeyTimeRef.current;
      lastKeyTimeRef.current = currentTime;

      // Reset buffer if time between keypresses is too long (human typing speed)
      if (timeDiff > maxIntervalMs && bufferRef.current.length > 0) {
        bufferRef.current = "";
      }

      if (e.key === "Enter") {
        if (bufferRef.current.length >= minLength) {
          const scannedCode = bufferRef.current.trim();
          bufferRef.current = "";
          if (scannedCode) {
            // Prevent form submit if pressed in an input
            if (isInputTarget) e.preventDefault();
            onScanRef.current(scannedCode);
          }
        } else {
          bufferRef.current = "";
        }
        return;
      }

      // Collect single printable characters
      if (e.key.length === 1 && !e.ctrlKey && !e.altKey && !e.metaKey) {
        bufferRef.current += e.key;
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [enabled, maxIntervalMs, minLength]);
}
