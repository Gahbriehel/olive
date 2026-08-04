"use client";

import { type JSX, type ReactNode, useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { AnimatePresence, motion } from "framer-motion";
import { X } from "lucide-react";

export interface Props {
  children: ReactNode;
  title: string;
  display: boolean;
  close: () => void;
}

export const SidebarModal = ({
  title,
  children,
  display,
  close,
}: Props): JSX.Element => {
  const [mounted] = useState(() => typeof document !== "undefined");

  useEffect(() => {
    if (display) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [display]);

  const modalContent = (
    <AnimatePresence>
      {display && (
        <div className="fixed inset-0 z-50 flex justify-end">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            onClick={close}
            className="fixed inset-0 bg-black/40 backdrop-blur-sm"
          />

          {/* Slide-over Drawer Container */}
          <motion.div
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ type: "spring", damping: 28, stiffness: 320 }}
            className="relative z-10 flex h-full w-full max-w-lg flex-col bg-white p-6 shadow-2xl dark:bg-zinc-900 border-l border-slate-200 dark:border-zinc-800"
          >
            {/* Header */}
            <div className="flex items-center justify-between pb-4 mb-4 border-b border-slate-100 dark:border-zinc-800">
              <h2 className="text-lg font-bold text-slate-900 dark:text-slate-100 sm:text-xl">
                {title}
              </h2>
              <button
                type="button"
                onClick={close}
                className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-600 dark:hover:bg-zinc-800 dark:hover:text-slate-200 transition-colors"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Content */}
            <div className="flex-1 overflow-y-auto pr-1">{children}</div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );

  if (!mounted) return <></>;

  return createPortal(modalContent, document.body);
};
