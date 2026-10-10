import { type ReactNode } from "react";
import { cn } from "@/helpers/cn";

const FALLBACK_COLOR = "#6366f1";

/** Dark text on light team colours (e.g. yellow), white text otherwise. */
function readableTextColor(hex: string): string {
  const m = /^#?([0-9a-f]{6})$/i.exec(hex.trim());
  if (!m) return "#ffffff";
  const n = parseInt(m[1], 16);
  const [r, g, b] = [(n >> 16) & 255, (n >> 8) & 255, n & 255];
  // Perceived luminance (ITU-R BT.601).
  return (r * 299 + g * 587 + b * 114) / 1000 > 160 ? "#0f172a" : "#ffffff";
}

interface TeamBadgeProps {
  /** Team colour as a hex string; falls back to the brand indigo. */
  color?: string | null;
  children: ReactNode;
  className?: string;
}

/** Pill tinted with a team's own colour. */
export function TeamBadge({ color, children, className }: TeamBadgeProps) {
  const background = color || FALLBACK_COLOR;
  return (
    <span
      className={cn(
        "inline-block rounded-md px-2 py-0.5 text-[11px] font-bold shadow-xs",
        className,
      )}
      style={{
        backgroundColor: background,
        color: readableTextColor(background),
      }}
    >
      {children}
    </span>
  );
}
