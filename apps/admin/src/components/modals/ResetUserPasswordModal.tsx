"use client";

import React, { useState } from "react";
import { Copy, Check, Wand2 } from "lucide-react";

import { Button } from "@/components/ui/Button";
import { Modal } from "@/components/ui/Modal";
import { Input } from "@/components/FormElements/Input";
import { extractErrorMessage } from "@/utils/api-client";

const MIN_PASSWORD_LENGTH = 8;
const GENERATED_LENGTH = 16;
// Unambiguous characters only (no 0/O, 1/l/I) so it can be read out loud.
const CHARSET =
  "ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz23456789!@#$%&*?";

function generatePassword(length = GENERATED_LENGTH): string {
  const limit = 256 - (256 % CHARSET.length);
  const out: string[] = [];
  while (out.length < length) {
    const bytes = crypto.getRandomValues(new Uint8Array(length));
    for (const b of bytes) {
      // Rejection sampling avoids modulo bias.
      if (b < limit && out.length < length)
        out.push(CHARSET[b % CHARSET.length]);
    }
  }
  return out.join("");
}

interface ResetUserPasswordModalProps {
  isOpen: boolean;
  userName: string;
  onClose: () => void;
  onSubmit: (password: string) => Promise<void>;
  loading?: boolean;
}

export function ResetUserPasswordModal({
  isOpen,
  userName,
  onClose,
  onSubmit,
  loading,
}: ResetUserPasswordModalProps) {
  const [password, setPassword] = useState("");
  const [visible, setVisible] = useState(false);
  const [copied, setCopied] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleClose = () => {
    setPassword("");
    setVisible(false);
    setCopied(false);
    setError(null);
    onClose();
  };

  const handleGenerate = () => {
    setPassword(generatePassword());
    setVisible(true);
    setCopied(false);
    setError(null);
  };

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(password);
      setCopied(true);
    } catch {
      setError("Could not copy. Select the password and copy it manually.");
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (loading) return;
    if (password.length < MIN_PASSWORD_LENGTH) {
      setError(`Password must be at least ${MIN_PASSWORD_LENGTH} characters.`);
      return;
    }
    setError(null);
    try {
      await onSubmit(password);
      handleClose();
    } catch (err) {
      setError(extractErrorMessage(err, "Failed to reset password."));
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      title="Reset password"
      description={`This will sign ${userName} out on all devices. Share the new password with them securely.`}
      footerStart={
        <Button variant="outline" onClick={handleClose} disabled={loading}>
          Cancel
        </Button>
      }
      footer={
        <Button
          variant="primary"
          type="submit"
          form="reset-user-password-form"
          loading={loading}
        >
          Reset password
        </Button>
      }
    >
      <form
        id="reset-user-password-form"
        onSubmit={handleSubmit}
        className="space-y-3"
        noValidate
      >
        <Input
          label="New password"
          type={visible ? "text" : "password"}
          password
          showPassword={() => setVisible(true)}
          hidePassword={() => setVisible(false)}
          autoComplete="new-password"
          value={password}
          onChange={(e) => {
            setPassword(e.target.value);
            setCopied(false);
          }}
          placeholder="At least 8 characters"
          error={error ?? undefined}
          hint="They can change it after logging in."
        />
        <div className="flex gap-2">
          <Button
            type="button"
            variant="outline"
            size="sm"
            leftIcon={<Wand2 className="h-3.5 w-3.5" />}
            onClick={handleGenerate}
          >
            Generate
          </Button>
          {password && (
            <Button
              type="button"
              variant="outline"
              size="sm"
              leftIcon={
                copied ? (
                  <Check className="h-3.5 w-3.5" />
                ) : (
                  <Copy className="h-3.5 w-3.5" />
                )
              }
              onClick={handleCopy}
            >
              {copied ? "Copied" : "Copy"}
            </Button>
          )}
        </div>
      </form>
    </Modal>
  );
}
