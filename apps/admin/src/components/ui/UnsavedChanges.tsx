"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { Dialog, DialogPanel, DialogTitle } from "@headlessui/react";
import { AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/Button";

/*
 * Unsaved-changes guard for overlays (docs/architecture.md §6.3).
 *
 * Modal and SidebarModal wrap their content in an UnsavedChangesBoundary.
 * A form inside reports its dirty state with useUnsavedChangesGuard(isDirty);
 * Escape, backdrop click and the close button then ask before discarding.
 * Use the returned `guard` for the form's own Cancel button so it asks too.
 */

interface GuardContextValue {
  setDirty: (dirty: boolean) => void;
  guard: (proceed: () => void) => void;
}

const GuardContext = createContext<GuardContextValue | null>(null);

/** Call from a form rendered inside Modal/SidebarModal. */
export function useUnsavedChangesGuard(isDirty: boolean) {
  const ctx = useContext(GuardContext);

  useEffect(() => {
    ctx?.setDirty(isDirty);
  }, [ctx, isDirty]);

  // A form that unmounts (e.g. after a successful save) is no longer dirty.
  useEffect(() => () => ctx?.setDirty(false), [ctx]);

  const guard = useCallback(
    (proceed: () => void) => (ctx ? ctx.guard(proceed) : proceed()),
    [ctx],
  );

  return { guard };
}

/** Provides the guard to forms inside an overlay. */
export const UnsavedChangesProvider = GuardContext.Provider;

/**
 * Used by Modal/SidebarModal. Returns the close handler to give to the
 * dialog, the provider value for <UnsavedChangesProvider>, and the discard
 * confirmation to render inside the dialog panel (so it nests correctly).
 */
export function useCloseGuard(onClose: () => void) {
  const [dirty, setDirty] = useState(false);
  const [pending, setPending] = useState<(() => void) | null>(null);
  const dirtyRef = useRef(false);

  useEffect(() => {
    dirtyRef.current = dirty;
  }, [dirty]);

  // Stable identity so consumers' effects don't re-run on every render.
  const guard = useCallback((proceed: () => void) => {
    if (dirtyRef.current) setPending(() => proceed);
    else proceed();
  }, []);

  const requestClose = useCallback(() => guard(onClose), [guard, onClose]);

  // Reloading or leaving the page with unsaved edits gets the browser prompt.
  useEffect(() => {
    if (!dirty) return;
    const onBeforeUnload = (e: BeforeUnloadEvent) => e.preventDefault();
    window.addEventListener("beforeunload", onBeforeUnload);
    return () => window.removeEventListener("beforeunload", onBeforeUnload);
  }, [dirty]);

  const guardValue = useMemo(() => ({ setDirty, guard }), [guard]);

  const discardDialog = (
    <DiscardChangesDialog
      open={pending !== null}
      onKeepEditing={() => setPending(null)}
      onDiscard={() => {
        const proceed = pending;
        setPending(null);
        setDirty(false);
        dirtyRef.current = false;
        proceed?.();
      }}
    />
  );

  return { requestClose, guardValue, discardDialog };
}

function DiscardChangesDialog({
  open,
  onKeepEditing,
  onDiscard,
}: {
  open: boolean;
  onKeepEditing: () => void;
  onDiscard: () => void;
}) {
  return (
    <Dialog open={open} onClose={onKeepEditing} className="relative z-[60]">
      <div className="fixed inset-0 bg-overlay" aria-hidden="true" />
      <div className="fixed inset-0 flex items-center justify-center p-4">
        <DialogPanel className="w-full max-w-sm rounded-2xl border border-border bg-surface p-6 text-center shadow-2xl">
          <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-2xl bg-warning-soft text-warning-text">
            <AlertTriangle className="h-6 w-6" aria-hidden="true" />
          </div>
          <DialogTitle className="text-base font-bold text-fg">
            Discard unsaved changes?
          </DialogTitle>
          <p className="mt-1.5 text-xs text-fg-muted">
            You have edits that haven&apos;t been saved. They&apos;ll be lost if
            you close this now.
          </p>
          <div className="mt-6 grid grid-cols-2 gap-3">
            <Button variant="outline" onClick={onKeepEditing}>
              Keep editing
            </Button>
            <Button variant="danger" onClick={onDiscard}>
              Discard
            </Button>
          </div>
        </DialogPanel>
      </div>
    </Dialog>
  );
}
