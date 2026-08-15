import { customToast } from "./customToast";

export function copyToClipboard(text: string): void {
  if (!text || !text.trim()) return;

  if (navigator?.clipboard?.writeText) {
    navigator.clipboard
      .writeText(text)
      .then(() => {
        customToast.info("Copied to clipboard", text);
      })
      .catch(() => {
        customToast.error("Failed to copy text to clipboard");
      });
  } else {
    try {
      const textarea = document.createElement("textarea");
      textarea.value = text;
      textarea.style.position = "fixed";
      textarea.style.opacity = "0";
      document.body.appendChild(textarea);
      textarea.focus();
      textarea.select();
      document.execCommand("copy");
      document.body.removeChild(textarea);
      customToast.info("Copied to clipboard", text);
    } catch {
      customToast.error("Failed to copy text to clipboard");
    }
  }
}
