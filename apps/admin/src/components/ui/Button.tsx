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
type Color = "primary" | "secondary" | "white" | "outline" | "danger";
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
    boxShadow: "0 10px 15px -3px rgb(0 0 0 / 0.1)",
  },
  whileHover: { scale: 1.01, boxShadow: "0 12px 18px -3px rgb(0 0 0 / 0.1)" },
  whileTap: { scale: 0.99, boxShadow: "0 8px 12px -2px rgb(0 0 0 / 0.1)" },
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
    position = "icon-first",
    hideText = false,
    ...props
  },
  ref,
) {
  const displayText = text || children;
  const classNames = cn(
    "relative flex h-10 cursor-pointer items-center justify-center gap-2 whitespace-nowrap rounded-md border px-3 py-2 text-sm font-semibold xs:text-base sm:h-12 sm:px-5 sm:py-3 disabled:cursor-not-allowed [&>span]:hover:opacity-100",
    {
      "border-slate-300 bg-white text-slate-700 hover:bg-slate-50 disabled:bg-slate-100 disabled:border-slate-200 disabled:text-slate-400 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-300 dark:hover:bg-slate-800 dark:disabled:bg-slate-800 dark:disabled:border-slate-700 dark:disabled:text-slate-500":
        color === "outline",
      "border-indigo-600 bg-gradient-to-r from-indigo-500 to-indigo-600 text-white hover:from-indigo-600 hover:to-indigo-700 disabled:from-slate-400 disabled:to-slate-500 disabled:border-slate-400 dark:disabled:from-slate-700 dark:disabled:to-slate-800 dark:disabled:border-slate-700 dark:disabled:text-slate-500":
        color === "primary",
      "border-rose-600 bg-gradient-to-r from-rose-500 to-rose-600 text-white hover:from-rose-600 hover:to-rose-700 disabled:from-slate-400 disabled:to-slate-500 disabled:border-slate-400 dark:disabled:from-slate-700 dark:disabled:to-slate-800 dark:disabled:border-slate-700 dark:disabled:text-slate-500":
        color === "danger",
      "border-slate-800 bg-gradient-to-r from-slate-700 to-slate-800 text-white hover:from-slate-800 hover:to-slate-900 disabled:from-slate-400 disabled:to-slate-500 disabled:border-slate-400 dark:disabled:from-slate-700 dark:disabled:to-slate-800 dark:disabled:border-slate-700 dark:disabled:text-slate-500":
        color === "secondary",
      "border-indigo-600 bg-white text-indigo-600 hover:bg-indigo-50 disabled:text-slate-400 disabled:border-slate-300 disabled:bg-slate-50 dark:bg-transparent dark:hover:bg-indigo-900/40 dark:disabled:text-slate-500 dark:disabled:border-slate-700 dark:disabled:bg-slate-800":
        color === "white",
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
      {...(!(props as BaseButtonTypeProps).disabled && motionProps)}
      {...(props as BaseButtonTypeProps)}
      ref={ref as ForwardedRef<HTMLButtonElement>}
      type={type as "button" | "submit" | "reset" | undefined}
      className={classNames}
    >
      {!loading && (
        <>
          {!hideText && displayText}
          {badgeNumber && (
            <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-gradient-to-r from-indigo-500 to-indigo-600 text-xs text-white">
              {badgeNumber}
            </span>
          )}
          {icon}
        </>
      )}
      {loading && (
        <ClipLoader
          size={12}
          color={["white", "outline"].includes(color) ? "#6366f1" : "#ffffff"}
        />
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
    size?: "sm" | "md" | "lg" | "icon";
  }
>(function Button(
  {
    variant,
    color,
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
        ? "outline"
        : (variant as Color) || "primary");
  const finalLoading = loading ?? isLoading;
  const finalIcon = icon || rightIcon || leftIcon;
  const displayText = text || children;

  return (
    <BaseButton
      ref={ref}
      color={finalColor}
      loading={finalLoading}
      icon={finalIcon}
      text={typeof displayText === "string" ? displayText : undefined}
      {...props}
    >
      {typeof displayText !== "string" ? displayText : undefined}
    </BaseButton>
  );
});
