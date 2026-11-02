export type WhatsAppTarget = "web" | "android-business" | "universal";

const PREF_KEY = "olive_whatsapp_target_pref";

export function detectWhatsAppTarget(
  pref: "auto" | WhatsAppTarget = "auto",
): WhatsAppTarget {
  if (pref !== "auto") return pref;
  if (typeof navigator === "undefined") return "web";
  const ua = navigator.userAgent;
  if (/Android/i.test(ua)) return "android-business";
  if (/iPhone|iPod/i.test(ua)) return "universal";
  return "web"; // desktop, and iPad (which reports a desktop UA)
}

export function buildWhatsAppUrl(
  digits: string,
  text: string,
  target: WhatsAppTarget,
): string {
  // Strip any non-digits if present, just in case
  const cleanDigits = digits.replace(/\D/g, "");
  const t = encodeURIComponent(text);
  switch (target) {
    case "web":
      // Opens only the WhatsApp Web session, which is logged into the church number.
      return `https://web.whatsapp.com/send?phone=${cleanDigits}&text=${t}`;
    case "android-business": {
      // Forces the WhatsApp Business app (com.whatsapp.w4b); falls back to wa.me if it isn't installed.
      const fallback = encodeURIComponent(
        `https://wa.me/${cleanDigits}?text=${t}`,
      );
      return `intent://send/?phone=${cleanDigits}&text=${t}#Intent;scheme=whatsapp;package=com.whatsapp.w4b;S.browser_fallback_url=${fallback};end`;
    }
    case "universal":
      // iOS can't target a specific app. The UI shows a strong "check the account" warning.
      return `https://wa.me/${cleanDigits}?text=${t}`;
  }
}

export function getStoredWhatsAppTargetPref(): "auto" | WhatsAppTarget {
  if (typeof window === "undefined") return "auto";
  try {
    const val = localStorage.getItem(PREF_KEY);
    if (
      val === "web" ||
      val === "android-business" ||
      val === "universal" ||
      val === "auto"
    ) {
      return val;
    }
  } catch {}
  return "auto";
}

export function setStoredWhatsAppTargetPref(
  pref: "auto" | WhatsAppTarget,
): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(PREF_KEY, pref);
  } catch {}
}
