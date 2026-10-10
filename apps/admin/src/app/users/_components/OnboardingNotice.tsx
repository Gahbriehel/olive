import { UserPlus } from "lucide-react";
import { Button } from "@/components/ui/Button";

interface OnboardingNoticeProps {
  onInvite: () => void;
}

/** Shown instead of the user directory to admins who may not browse it. */
export function OnboardingNotice({ onInvite }: OnboardingNoticeProps) {
  return (
    <div className="p-8 sm:p-12 text-center rounded-3xl bg-subtle border border-border space-y-4 shadow-sm my-4 animate-fade-in">
      <div className="w-14 h-14 rounded-2xl bg-primary-soft text-primary-text flex items-center justify-center mx-auto">
        <UserPlus className="w-7 h-7" aria-hidden="true" />
      </div>
      <div className="space-y-1.5 max-w-md mx-auto">
        <h3 className="font-bold text-lg text-fg">Team Access & Onboarding</h3>
        <p className="text-xs sm:text-sm text-fg-muted leading-relaxed">
          Ready to add someone new to the team? You can invite new team members
          anytime with the button below. To review the full directory or request
          role updates for existing users, please contact a Super Administrator.
        </p>
      </div>
      <div className="pt-2 flex justify-center">
        <Button
          variant="primary"
          leftIcon={<UserPlus className="w-4 h-4" />}
          onClick={onInvite}
        >
          Invite New User
        </Button>
      </div>
    </div>
  );
}
