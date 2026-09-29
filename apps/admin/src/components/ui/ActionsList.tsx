import { type JSX, type ReactNode, useState } from "react";
import dynamic from "next/dynamic";
import * as Popover from "@radix-ui/react-popover";
import { MoreHorizontal } from "lucide-react";
import { cn } from "@/helpers/cn";

export interface ActionItem {
  title: string;
  fn?: () => void;
  icon?: ReactNode;
  loading?: boolean;
  color?: "blue" | "red";
  href?: string;
  disabled?: boolean;
  confirmDelete?: boolean;
  destructive?: boolean;
  releaseDate?: Date;
}

interface Props {
  trigger?: ReactNode;
  actions: ActionItem[];
  align?: "start" | "center" | "end";
}

const ConfirmActionModal = dynamic(
  async () =>
    (await import("@/components/modals/ConfirmActionModal")).ConfirmActionModal,
);

export function ActionsList({
  actions,
  align = "end",
  trigger = (
    <button
      type="button"
      className="inline-flex h-8 w-8 items-center justify-center rounded-lg text-slate-500 hover:bg-slate-100 hover:text-slate-900 dark:text-slate-400 dark:hover:bg-zinc-800 dark:hover:text-slate-100 transition-colors cursor-pointer border border-transparent hover:border-slate-200 dark:hover:border-zinc-700"
      title="Options"
    >
      <MoreHorizontal className="h-4 w-4" />
    </button>
  ),
}: Props): JSX.Element {
  const [modalDisplay, setModalDisplay] = useState(false);
  const [actionToConfirm, setActionToConfirm] = useState<() => void>(() => {});

  return (
    <>
      <Popover.Root>
        <Popover.Trigger asChild>{trigger}</Popover.Trigger>
        <Popover.Portal>
          <Popover.Content
            sideOffset={5}
            align={align}
            className="z-50 min-w-44 space-y-1 rounded-xl border border-slate-200/90 bg-white p-1.5 shadow-xl will-change-[transform,opacity] focus:outline-none dark:border-zinc-800 dark:bg-zinc-900"
          >
            {actions?.map(
              ({
                color = "blue",
                confirmDelete,
                destructive,
                icon,
                ...action
              }) => {
                const titleLower = action.title?.toLowerCase() ?? "";
                const legacyDeleteConfirm = ["delete", "delete all"].includes(
                  titleLower,
                );
                const legacyDestructive = [
                  "delete",
                  "delete all",
                  "deactivate",
                ].includes(titleLower);
                const needsDeleteConfirm =
                  confirmDelete === true || legacyDeleteConfirm;
                const isDestructive =
                  destructive === true || color === "red" || legacyDestructive;

                return (
                  <Popover.Close
                    key={action.title}
                    onClick={() => {
                      if (action.disabled) {
                        return;
                      }
                      if (needsDeleteConfirm) {
                        setActionToConfirm(() => action.fn);
                        setModalDisplay(true);
                        return;
                      }
                      action.fn?.();
                    }}
                    className={cn(
                      "flex w-full items-center gap-2.5 rounded-lg px-2.5 py-2 text-xs font-semibold transition-colors cursor-pointer text-left select-none",
                      {
                        "text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-zinc-800":
                          !action.disabled && !isDestructive,
                        "cursor-not-allowed text-slate-400 opacity-50 dark:text-slate-500":
                          action.disabled,
                        "text-rose-600 hover:bg-rose-50 dark:text-rose-400 dark:hover:bg-rose-950/40":
                          !action.disabled && isDestructive,
                        "text-rose-300 dark:text-rose-900":
                          action.disabled && isDestructive,
                      },
                    )}
                  >
                    {icon && <span className="shrink-0">{icon}</span>}
                    <span className="flex-1 truncate">{action.title}</span>
                  </Popover.Close>
                );
              },
            )}
            <Popover.Arrow className="fill-white dark:fill-zinc-900" />
          </Popover.Content>
        </Popover.Portal>
      </Popover.Root>
      <ConfirmActionModal
        actionName="delete"
        display={modalDisplay}
        close={() => {
          setModalDisplay(false);
        }}
        fn={actionToConfirm}
      />
    </>
  );
}
