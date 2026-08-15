import { useState, useCallback } from "react";
import { customToast } from "@/helpers/customToast";

interface UseCopyToClipboardOptions {
  callback?: () => void;
  showToast?: boolean;
  toastMessage?: string;
  resetDuration?: number;
}

export function useCopyToClipboard(
  optionsOptions?: UseCopyToClipboardOptions | (() => void),
): {
  isCopied: boolean;
  copyToClipboard: (text: string) => Promise<void>;
} {
  const options =
    typeof optionsOptions === "function"
      ? { callback: optionsOptions }
      : optionsOptions || {};

  const {
    callback,
    showToast = true,
    toastMessage = "Copied to clipboard",
    resetDuration = 1500,
  } = options;

  const [isCopied, setIsCopied] = useState(false);

  const fallbackCopyToClipboard = useCallback(
    (text = ""): void => {
      try {
        const textArea = document.createElement("textarea");
        textArea.value = text;
        textArea.style.position = "fixed";
        textArea.style.opacity = "0";
        document.body.appendChild(textArea);
        textArea.focus();
        textArea.select();

        const successful = document.execCommand("copy");
        document.body.removeChild(textArea);

        if (successful) {
          setIsCopied(true);
          if (showToast) {
            customToast.info(toastMessage, text);
          }
          callback?.();
          setTimeout(() => {
            setIsCopied(false);
          }, resetDuration);
        } else {
          customToast.error("Failed to copy text to clipboard");
        }
      } catch (error) {
        console.error("Failed to copy text:", error);
        customToast.error("Failed to copy text to clipboard");
      }
    },
    [callback, resetDuration, showToast, toastMessage],
  );

  const copyToClipboard = useCallback(
    async (text = ""): Promise<void> => {
      if (!text) return;

      if (navigator?.clipboard?.writeText) {
        try {
          await navigator.clipboard.writeText(text);
          setIsCopied(true);
          if (showToast) {
            customToast.info(toastMessage, text);
          }
          callback?.();
          setTimeout(() => {
            setIsCopied(false);
          }, resetDuration);
        } catch (error) {
          console.error("Clipboard API copy failed, trying fallback...", error);
          fallbackCopyToClipboard(text);
        }
      } else {
        fallbackCopyToClipboard(text);
      }
    },
    [callback, fallbackCopyToClipboard, resetDuration, showToast, toastMessage],
  );

  return { isCopied, copyToClipboard };
}
