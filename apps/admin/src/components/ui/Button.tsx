"use client";

import {
  type ForwardedRef,
  type JSX,
  type ReactNode,
  forwardRef,
  useState,
} from "react";

import Link, { type LinkProps } from "next/link";

import { type HTMLMotionProps, motion } from "framer-motion";
import { ClipLoader } from "react-spinners";

import { cn } from "@/helpers/cn";

import { ConfirmActionModal } from "@/components/modals/ConfirmActionModal";

type Type = "button" | "submit" | "reset" | "link";
type Color = "primary" | "secondary" | "white" | "outline" | "danger" | "ghost";
type Size = "sm" | "md" | "lg" | "icon";
type BaseButtonTypeProps = HTMLMotionProps<"button">;
type BaseLinkTypeProps = LinkProps;

type BaseButtonProps = {
  icon?: ReactNode;
  children?: ReactNode;
  type?: Type;
  text?: string;
  loading?: boolean;
  hideText?: boolean;
  color?: Color;
  size?: Size;
  className?: string;
  badgeNumber?: number;
  position?: "icon-first" | "icon-last";
} & (BaseButtonTypeProps | BaseLinkTypeProps);

interface DeleteButtonProps {
  text?: string;
  title?: string;
  color?: Color;
  loading?: boolean;
  type?: Exclude<Type, "link">;
  onClick?: () => void;
}

const motionProps = {
  initial: {
    boxShadow: "0 4px 6px -1px rgb(0 0 0 / 0.05)",
  },
  whileHover: { scale: 1.01, boxShadow: "0 10px 15px -3px rgb(0 0 0 / 0.1)" },
  whileTap: { scale: 0.99, boxShadow: "0 4px 6px -1px rgb(0 0 0 / 0.05)" },
};

export const BaseButton = forwardRef<
  HTMLButtonElement | HTMLAnchorElement,
  BaseButtonProps
>(function BaseButton(
  {
    icon,
    children,
    type,
    text,
    className,
    loading,
    badgeNumber,
    color = "primary",
    size = "md",
    position = "icon-first",
    hideText = false,
    ...props
  },
  ref,
) {
  const displayText = text || children;
  const classNames = cn(
    "relative flex cursor-pointer items-center justify-center whitespace-nowrap rounded-xl border font-semibold transition-all disabled:cursor-not-allowed disabled:opacity-50 [&>span]:hover:opacity-100",
    {
      // Sizes
      "h-9 px-3 py-1.5 text-xs gap-1.5": size === "sm",
      "h-9 w-9 p-0 text-xs justify-center items-center": size === "icon",
      "h-10 px-4 py-2 text-sm gap-2": size === "md",
      "h-12 px-5 py-3 text-base gap-2": size === "lg",
    },
    {
      "border-slate-200 bg-white text-slate-700 hover:bg-slate-50 dark:border-zinc-700/80 dark:bg-zinc-800/80 dark:text-slate-200 dark:hover:bg-zinc-700 shadow-xs":
        color === "outline",
      "border-indigo-600 bg-indigo-600 text-white hover:bg-indigo-700 shadow-xs":
        color === "primary",
      "border-rose-600 bg-rose-600 text-white hover:bg-rose-700 shadow-xs":
        color === "danger",
      "border-slate-800 bg-slate-800 text-white hover:bg-slate-900 shadow-xs dark:bg-zinc-800 dark:border-zinc-700 dark:hover:bg-zinc-700":
        color === "secondary",
      "border-indigo-600 bg-white text-indigo-600 hover:bg-indigo-50 dark:bg-transparent dark:hover:bg-indigo-900/40":
        color === "white",
      "border-transparent bg-transparent text-slate-600 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-zinc-800":
        color === "ghost",
    },
    { "flex-row-reverse": position === "icon-first" },
    className,
  );

  if (type === "link" || (props as BaseLinkTypeProps).href) {
    return (
      <Link
        {...(props as BaseLinkTypeProps)}
        ref={ref as ForwardedRef<HTMLAnchorElement>}
        className={classNames}
      >
        {!hideText && displayText}
        {icon}
        {hideText && typeof displayText === "string" && (
          <span className="pointer-events-none absolute bottom-10 left-1/2 -translate-x-1/2 whitespace-nowrap rounded-md bg-black px-3 py-2 text-sm text-white opacity-0 transition-opacity duration-300">
            {displayText}
          </span>
        )}
      </Link>
    );
  }

  return (
    <motion.button
      {...(!((props as BaseButtonTypeProps).disabled || loading) &&
        motionProps)}
      {...(props as BaseButtonTypeProps)}
      disabled={(props as BaseButtonTypeProps).disabled || loading}
      ref={ref as ForwardedRef<HTMLButtonElement>}
      type={type as "button" | "submit" | "reset" | undefined}
      className={classNames}
    >
      {loading ? (
        <div className="flex items-center justify-center py-0.5">
          <ClipLoader
            size={16}
            color={
              ["white", "outline", "ghost"].includes(color)
                ? "#6366f1"
                : "#ffffff"
            }
          />
        </div>
      ) : (
        <>
          {!hideText && displayText}
          {badgeNumber && (
            <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-indigo-600 text-xs text-white">
              {badgeNumber}
            </span>
          )}
          {icon}
        </>
      )}
      {hideText && typeof displayText === "string" && (
        <span className="pointer-events-none absolute bottom-10 left-1/2 -translate-x-1/2 whitespace-nowrap rounded-md bg-black px-3 py-2 text-sm text-white opacity-0 transition-opacity duration-300">
          {displayText}
        </span>
      )}
    </motion.button>
  );
});

export function DeleteButton({
  loading,
  onClick,
  title,
  text = "Delete",
  color = "danger",
  type = "button",
}: DeleteButtonProps): JSX.Element {
  const [display, setDisplay] = useState(false);
  return (
    <>
      <BaseButton
        type={type}
        color={color}
        text={text}
        onClick={() => {
          setDisplay(true);
        }}
        loading={loading}
      />
      <ConfirmActionModal
        actionName={text}
        title={title}
        fn={onClick ?? (() => {})}
        loading={loading}
        close={() => {
          setDisplay(false);
        }}
        display={display}
      />
    </>
  );
}

// Backwards compatibility alias for Button
export const Button = forwardRef<
  HTMLButtonElement | HTMLAnchorElement,
  BaseButtonProps & {
    variant?: Color | "ghost" | "destructive";
    isLoading?: boolean;
    leftIcon?: ReactNode;
    rightIcon?: ReactNode;
    size?: Size;
  }
>(function Button(
  {
    variant,
    color,
    size,
    isLoading,
    loading,
    leftIcon,
    rightIcon,
    icon,
    children,
    text,
    ...props
  },
  ref,
) {
  const finalColor: Color =
    color ||
    (variant === "destructive"
      ? "danger"
      : variant === "ghost"
        ? "ghost"
        : (variant as Color) || "primary");
  const finalLoading = loading ?? isLoading;
  const finalIcon = icon || rightIcon || leftIcon;
  const displayText = text || children;

  return (
    <BaseButton
      ref={ref}
      color={finalColor}
      size={size}
      loading={finalLoading}
      icon={finalIcon}
      text={typeof displayText === "string" ? displayText : undefined}
      {...props}
    >
      {typeof displayText !== "string" ? displayText : undefined}
    </BaseButton>
  );
});
