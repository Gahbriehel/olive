import React, { useEffect, useState } from "react";
import { CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Modal } from "@/components/ui/Modal";

const LOGOUT_COUNTDOWN_SECONDS = 10;

interface PasswordChangedDialogProps {
  isOpen: boolean;
  /** Ends the session; called by the button or when the countdown reaches 0. */
  onLogout: () => void;
}

/**
 * Shown after a password change. It cannot be dismissed: the countdown and
 * the "Log out now" button are the only exits, and both log the user out.
 */
export const PasswordChangedDialog: React.FC<PasswordChangedDialogProps> = ({
  isOpen,
  onLogout,
}) => {
  const [countdown, setCountdown] = useState(LOGOUT_COUNTDOWN_SECONDS);

  useEffect(() => {
    if (!isOpen) return;
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setCountdown(LOGOUT_COUNTDOWN_SECONDS);
    const timer = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          onLogout();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, [isOpen, onLogout]);

  return (
    <Modal
      isOpen={isOpen}
      // Escape/backdrop must not trigger logout: the countdown and the
      // explicit button below are the only exits.
      onClose={() => {}}
      maxWidth="sm"
    >
      <div className="space-y-6 py-8 text-center">
        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-success-soft">
          <CheckCircle2 className="h-10 w-10 text-success-text" />
        </div>

        <div>
          <h3 className="text-xl font-semibold text-fg">
            Password changed successfully
          </h3>
          <p className="mt-2 text-fg-secondary">
            For security reasons, you will be logged out in{" "}
            <span className="font-medium text-warning-text">{countdown}</span>{" "}
            seconds.
          </p>
          <p className="mt-1 text-sm text-fg-muted">
            Please log in again with your new password.
          </p>
        </div>

        <Button
          onClick={onLogout}
          className="w-full animate-pulse hover:animate-none"
        >
          {`Log out now (${countdown}s)`}
        </Button>
      </div>
    </Modal>
  );
};
