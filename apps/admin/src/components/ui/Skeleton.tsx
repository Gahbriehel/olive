"use client";

import { clsx } from "clsx";

interface Props {
  className?: string;
}

export function Skeleton({ className }: Props) {
  return (
    <div
      className={clsx("animate-pulse rounded-md bg-muted-strong", className)}
    />
  );
}
