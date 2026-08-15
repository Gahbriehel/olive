import React, { type JSX, useState } from "react";
import { Copy, CopyCheck } from "lucide-react";
import { cn } from "@/helpers/cn";
import { useCopyToClipboard } from "@/hooks/useCopyToClipboard";

interface Props {
  text: string;
  maxLength?: number;
  textClassName?: string;
  containerClassName?: string;
  showIcon?: "hover" | "always" | "none";
  preserveSpace?: boolean;
}

export function TruncatedTextWithCopy({
  text = "",
  maxLength = 24,
  textClassName,
  containerClassName,
  showIcon = "hover",
  preserveSpace = true,
}: Props): JSX.Element {
  const [isHovered, setIsHovered] = useState(false);
  const { isCopied, copyToClipboard } = useCopyToClipboard();

  if (!text) return <></>;

  const truncatedText =
    maxLength > 0 && text.length > maxLength
      ? text.slice(0, maxLength) + "..."
      : text;

  const handleCopy = (e: React.MouseEvent) => {
    e.stopPropagation();
    void copyToClipboard(text);
  };

  const displayIcon =
    showIcon === "always" || (showIcon === "hover" && (isHovered || isCopied));

  return (
    <div
      className={cn(
        "inline-flex cursor-pointer items-center gap-1.5 transition-colors group select-none",
        containerClassName,
      )}
      onClick={handleCopy}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      title={`Click to copy: ${text}`}
    >
      <span
        className={cn(
          "max-w-xs overflow-hidden text-ellipsis whitespace-nowrap group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors",
          textClassName,
        )}
      >
        {truncatedText}
      </span>

      {displayIcon ? (
        <button
          type="button"
          className="cursor-pointer text-slate-400 hover:text-indigo-600 dark:text-slate-500 dark:hover:text-indigo-400 transition-colors flex items-center justify-center shrink-0"
          onClick={handleCopy}
          aria-label={`Copy ${text} to clipboard`}
        >
          {isCopied ? (
            <CopyCheck className="w-4 h-4 text-emerald-500 animate-in fade-in zoom-in-75 duration-200" />
          ) : (
            <Copy className="w-4 h-4" />
          )}
        </button>
      ) : preserveSpace && showIcon === "hover" ? (
        <span className="inline-block w-4 h-4 shrink-0" />
      ) : null}
    </div>
  );
}
