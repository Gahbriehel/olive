import jsQR from "jsqr";

/**
 * Decodes a QR code from a Canvas ImageData buffer.
 */
export function decodeQrFromImageData(imageData: ImageData): string | null {
  try {
    const code = jsQR(imageData.data, imageData.width, imageData.height, {
      inversionAttempts: "dontInvert",
    });
    return code ? code.data : null;
  } catch (error) {
    console.error("Error decoding QR code from image data:", error);
    return null;
  }
}

/**
 * Decodes a QR code from an uploaded File (Image format).
 */
export function decodeQrFromImageFile(file: File): Promise<string | null> {
  return new Promise((resolve) => {
    if (typeof window === "undefined") {
      resolve(null);
      return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement("canvas");
        canvas.width = img.width;
        canvas.height = img.height;
        const ctx = canvas.getContext("2d");
        if (!ctx) {
          resolve(null);
          return;
        }
        ctx.drawImage(img, 0, 0, img.width, img.height);
        const imageData = ctx.getImageData(0, 0, img.width, img.height);
        const result = decodeQrFromImageData(imageData);
        resolve(result);
      };
      img.onerror = () => resolve(null);
      img.src = e.target?.result as string;
    };
    reader.onerror = () => resolve(null);
    reader.readAsDataURL(file);
  });
}

/**
 * Plays a pleasant double-beep confirmation tone using the browser Web Audio API.
 */
export function playSuccessBeep(): void {
  if (typeof window === "undefined") return;

  try {
    const AudioContextClass =
      window.AudioContext ||
      (window as unknown as { webkitAudioContext: typeof AudioContext })
        .webkitAudioContext;
    if (!AudioContextClass) return;

    const audioCtx = new AudioContextClass();

    const playTone = (freq: number, startTime: number, duration: number) => {
      const osc = audioCtx.createOscillator();
      const gain = audioCtx.createGain();

      osc.type = "sine";
      osc.frequency.setValueAtTime(freq, startTime);

      gain.gain.setValueAtTime(0.15, startTime);
      gain.gain.exponentialRampToValueAtTime(0.001, startTime + duration);

      osc.connect(gain);
      gain.connect(audioCtx.destination);

      osc.start(startTime);
      osc.stop(startTime + duration);
    };

    const now = audioCtx.currentTime;
    // First high note (880Hz - A5)
    playTone(880, now, 0.08);
    // Second higher note (1760Hz - A6)
    playTone(1760, now + 0.09, 0.12);
  } catch {
    // Ignore audio context autoplay policy blocks gracefully
  }
}

/**
 * Triggers device haptic vibration feedback if supported by browser/device.
 */
export function triggerHapticFeedback(): void {
  if (typeof window !== "undefined" && "vibrate" in navigator) {
    try {
      navigator.vibrate([100, 50, 100]);
    } catch {
      // Ignore vibration errors
    }
  }
}
