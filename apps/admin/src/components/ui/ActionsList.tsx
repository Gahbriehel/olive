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
      className="inline-flex h-8 w-8 items-center justify-center rounded-lg text-fg-muted hover:bg-muted hover:text-fg transition-colors cursor-pointer border border-transparent hover:border-border-control"
      title="Options"
    >
      <MoreHorizontal className="h-4 w-4" />
    </button>
  ),
}: Props): JSX.Element {
  const [modalDisplay, setModalDisplay] = useState(false);
  // Function state must be wrapped: a bare function argument is treated as a lazy initializer.
  const [actionToConfirm, setActionToConfirm] = useState<() => void>(
    () => () => {},
  );

  return (
    <>
      <Popover.Root>
        <Popover.Trigger asChild>{trigger}</Popover.Trigger>
        <Popover.Portal>
          <Popover.Content
            sideOffset={5}
            align={align}
            className="z-50 min-w-44 space-y-1 rounded-xl border border-border bg-surface p-1.5 shadow-xl will-change-[transform,opacity] focus:outline-none"
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
                        "text-fg-secondary hover:bg-muted":
                          !action.disabled && !isDestructive,
                        "cursor-not-allowed text-fg-subtle opacity-50":
                          action.disabled,
                        "text-danger-text hover:bg-danger-soft":
                          !action.disabled && isDestructive,
                        "text-danger-text/40": action.disabled && isDestructive,
                      },
                    )}
                  >
                    {icon && <span className="shrink-0">{icon}</span>}
                    <span className="flex-1 truncate">{action.title}</span>
                  </Popover.Close>
                );
              },
            )}
            <Popover.Arrow className="fill-surface" />
          </Popover.Content>
        </Popover.Portal>
      </Popover.Root>
      <ConfirmActionModal
        actionName="delete"
        tone="danger"
        display={modalDisplay}
        close={() => {
          setModalDisplay(false);
        }}
        fn={actionToConfirm}
      />
    </>
  );
}
