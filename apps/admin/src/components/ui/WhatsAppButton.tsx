"use client";

import React, { useState } from "react";
import {
  Button,
  type ButtonVariant,
  type ButtonSize,
} from "@/components/ui/Button";
import { WhatsAppIcon } from "@/components/ui/icons/WhatsAppIcon";
import { WhatsAppComposeModal } from "@/components/modals/WhatsAppComposeModal";
import { OutreachMessage, OutreachPurpose } from "@/models/outreach";

export interface WhatsAppButtonProps {
  personId: string;
  purpose: OutreachPurpose;
  checkInId?: string;
  size?: ButtonSize;
  label?: string;
  variant?: ButtonVariant;
  className?: string;
  disabled?: boolean;
  onConfirmedSent?: (message: OutreachMessage) => void;
  onSendEmailInstead?: () => void;
  onEditPerson?: () => void;
  title?: string;
}

export const WhatsAppButton: React.FC<WhatsAppButtonProps> = ({
  personId,
  purpose,
  checkInId,
  size = "sm",
  label,
  variant = "outline",
  className,
  disabled = false,
  onConfirmedSent,
  onSendEmailInstead,
  onEditPerson,
  title = "Send WhatsApp message",
}) => {
  const [modalOpen, setModalOpen] = useState(false);

  return (
    <>
      <Button
        type="button"
        variant={variant}
        size={size}
        title={title}
        aria-label={title}
        disabled={disabled}
        onClick={(e) => {
          e.stopPropagation();
          setModalOpen(true);
        }}
        leftIcon={
          <WhatsAppIcon className="w-3.5 h-3.5 flex-shrink-0 text-success-text" />
        }
        className={className}
      >
        {label}
      </Button>

      {modalOpen && (
        <WhatsAppComposeModal
          open={modalOpen}
          onClose={() => setModalOpen(false)}
          personId={personId}
          purpose={purpose}
          checkInId={checkInId}
          onConfirmedSent={onConfirmedSent}
          onSendEmailInstead={onSendEmailInstead}
          onEditPerson={onEditPerson}
        />
      )}
    </>
  );
};

export default WhatsAppButton;
