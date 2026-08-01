import { type JSX, type ReactNode, useEffect } from "react";

import { AnimatePresence, motion } from "framer-motion";
import { XCircle } from "lucide-react";

import { useWindowDimension } from "@/hooks/useWindowDimension";

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
  const { width = 0 } = useWindowDimension();
  useEffect(() => {
    const html = document.querySelector("html");
    if (display && html !== null) {
      html.style.overflow = "hidden";
    }
    if (!display && html !== null) {
      html.style.removeProperty("overflow");
    }
  }, [display]);

  return (
    <AnimatePresence>
      {display && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0, transition: { duration: 0.2 } }}
            transition={{ type: "tween", duration: 0.3 }}
            onClick={close}
            className="fixed left-0 top-0 z-30 h-screen w-screen bg-black/25 dark:bg-black/60"
          />
          <motion.div
            initial={
              width > 640
                ? { x: "100%", y: "-50%" }
                : { scale: 0, x: "-50%", y: "-50%" }
            }
            animate={
              width > 640
                ? { x: width > 2400 ? (width - 2400) / 2 : 0, y: "-50%" }
                : { scale: 1 }
            }
            exit={
              width > 640
                ? { x: "100%", transition: { duration: 0.3 } }
                : { scale: 0, opacity: 0, transition: { duration: 0.1 } }
            }
            transition={{ type: "tween", duration: 0.3 }}
            onClick={close}
            style={
              width > 640
                ? { right: width > 2400 ? (width - 2400) / 2 : 0 }
                : {}
            }
            className="absolute left-1/2 top-1/2 z-30 flex h-5/6 w-full max-w-lg -translate-x-1/2 -translate-y-1/2 justify-end p-4 sm:left-auto sm:right-0 sm:h-full"
          >
            <div
              className="flex size-full shrink-0 flex-col rounded-2xl bg-white dark:bg-slate-900"
              onClick={(e) => {
                e.stopPropagation();
              }}
            >
              <div className="flex items-center justify-between gap-4 px-4 py-5">
                <h1 className="font-SpaceGrotesk text-lg font-semibold text-gray-800 dark:text-slate-100 sm:text-xl">
                  {title}
                </h1>
                <div
                  className="flex h-6 w-6 cursor-pointer items-center justify-center rounded-full duration-300 hover:bg-gray-100 dark:text-slate-300 dark:hover:bg-slate-800 dark:hover:text-white"
                  onClick={close}
                >
                  <XCircle className="h-8 w-8" />
                </div>
              </div>
              <div className="flex-1 overflow-y-auto overflow-x-hidden">
                {children}
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};
