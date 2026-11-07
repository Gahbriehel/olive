"use client";

import React, { Suspense, useEffect, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { isAxiosError } from "axios";
import { AlertCircle, CheckCircle2, Eye, EyeOff, Lock } from "lucide-react";
import { AuthCardLayout } from "@/components/auth/AuthCardLayout";
import { Spinner } from "@/components/ui/Spinner";
import { authService } from "@/services/auth.service";
import { extractErrorMessage } from "@/utils/api-client";

const MIN_PASSWORD_LENGTH = 8;
const REDIRECT_DELAY_MS = 2500;

function InvalidLinkState({ message }: { message?: string }) {
  return (
    <AuthCardLayout title="Link not valid">
      <div className="flex flex-col items-center text-center gap-4">
        <div className="w-12 h-12 rounded-full bg-rose-500/10 border border-rose-500/30 flex items-center justify-center">
          <AlertCircle className="w-6 h-6 text-rose-400" />
        </div>
        <p className="text-sm text-slate-300">
          {message || "Reset link is invalid or has expired"}
        </p>
        <Link
          href="/forgot-password"
          className="w-full py-3.5 px-4 bg-indigo-600 hover:bg-indigo-500 text-white font-medium text-sm rounded-xl transition-all shadow-md shadow-indigo-600/20 flex items-center justify-center min-h-[48px]"
        >
          Request a new link
        </Link>
        <Link
          href="/login"
          className="text-xs text-slate-400 hover:text-white transition-colors"
        >
          Back to login
        </Link>
      </div>
    </AuthCardLayout>
  );
}

function ResetPasswordForm() {
  const router = useRouter();
  const searchParams = useSearchParams();

  // Keep the token in state only; it is stripped from the URL below.
  const [token] = useState(() => searchParams.get("token"));
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isDone, setIsDone] = useState(false);
  const [linkInvalid, setLinkInvalid] = useState(false);
  const [linkMessage, setLinkMessage] = useState<string | undefined>();
  const [error, setError] = useState<string | null>(null);

  // Remove the token from the address bar so it doesn't linger in history or
  // leak through the Referer header.
  useEffect(() => {
    window.history.replaceState(null, "", window.location.pathname);
  }, []);

  useEffect(() => {
    if (!isDone) return;
    const timer = setTimeout(
      () => router.push("/login?reset=1"),
      REDIRECT_DELAY_MS,
    );
    return () => clearTimeout(timer);
  }, [isDone, router]);

  if (!token || linkInvalid) {
    return <InvalidLinkState message={linkMessage} />;
  }

  if (isDone) {
    return (
      <AuthCardLayout title="Password updated">
        <div className="flex flex-col items-center text-center gap-4">
          <div className="w-12 h-12 rounded-full bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center">
            <CheckCircle2 className="w-6 h-6 text-emerald-400" />
          </div>
          <p className="text-sm text-slate-300">
            Password reset successfully. Please log in.
          </p>
          <Link
            href="/login?reset=1"
            className="w-full py-3.5 px-4 bg-indigo-600 hover:bg-indigo-500 text-white font-medium text-sm rounded-xl transition-all shadow-md shadow-indigo-600/20 flex items-center justify-center min-h-[48px]"
          >
            Go to login
          </Link>
        </div>
      </AuthCardLayout>
    );
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isSubmitting) return;
    setError(null);

    if (newPassword.length < MIN_PASSWORD_LENGTH) {
      setError(`Password must be at least ${MIN_PASSWORD_LENGTH} characters.`);
      return;
    }
    if (newPassword !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    setIsSubmitting(true);
    try {
      await authService.resetPassword({ token, newPassword });
      setNewPassword("");
      setConfirmPassword("");
      setIsDone(true);
    } catch (err) {
      const status = isAxiosError(err) ? err.response?.status : undefined;
      const message = extractErrorMessage(err, "Something went wrong.");
      if (status === 429) {
        setError("Too many attempts, please try again later.");
      } else if (status === 400 && /invalid|expired/i.test(message)) {
        setLinkMessage(message);
        setLinkInvalid(true);
      } else if (status === 400) {
        setError(message);
      } else {
        setError("Something went wrong. Please try again.");
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const inputClass =
    "w-full bg-slate-950/60 border border-slate-800 focus:border-indigo-500 rounded-xl py-3 pl-10 pr-10 text-base text-slate-200 placeholder:text-slate-600 focus:outline-none transition-colors";

  return (
    <AuthCardLayout
      title="Set a new password"
      subtitle="Choose a password of at least 8 characters"
    >
      {error && (
        <div
          role="alert"
          className="mb-6 p-4 rounded-2xl bg-rose-500/10 border border-rose-500/30 flex items-start gap-3 text-rose-400 text-xs"
        >
          <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
          <span>{error}</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-5" noValidate>
        <div>
          <label
            htmlFor="new-password"
            className="block text-xs font-semibold text-slate-300 mb-2"
          >
            New Password
          </label>
          <div className="relative">
            <Lock className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              id="new-password"
              type={showPassword ? "text" : "password"}
              autoComplete="new-password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              placeholder="••••••••"
              required
              className={inputClass}
            />
            <button
              type="button"
              onClick={() => setShowPassword((s) => !s)}
              aria-label={showPassword ? "Hide password" : "Show password"}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300 transition-colors"
            >
              {showPassword ? (
                <EyeOff className="w-5 h-5" />
              ) : (
                <Eye className="w-5 h-5" />
              )}
            </button>
          </div>
        </div>

        <div>
          <label
            htmlFor="confirm-password"
            className="block text-xs font-semibold text-slate-300 mb-2"
          >
            Confirm Password
          </label>
          <div className="relative">
            <Lock className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              id="confirm-password"
              type={showPassword ? "text" : "password"}
              autoComplete="new-password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="••••••••"
              required
              className={inputClass}
            />
          </div>
        </div>

        <button
          type="submit"
          disabled={isSubmitting}
          className="w-full py-3.5 px-4 bg-indigo-600 hover:bg-indigo-500 text-white font-medium text-sm rounded-xl transition-all shadow-md shadow-indigo-600/20 flex items-center justify-center gap-2 disabled:opacity-50 cursor-pointer min-h-[48px]"
        >
          {isSubmitting ? (
            <Spinner size="sm" className="text-white" />
          ) : (
            "Reset password"
          )}
        </button>
      </form>
    </AuthCardLayout>
  );
}

export default function ResetPasswordPage() {
  return (
    <Suspense fallback={null}>
      <ResetPasswordForm />
    </Suspense>
  );
}
