"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { isAxiosError } from "axios";
import { AlertCircle, ArrowLeft, Mail, MailCheck } from "lucide-react";
import { AuthCardLayout } from "@/components/auth/AuthCardLayout";
import { Spinner } from "@/components/ui/Spinner";
import { authService } from "@/services/auth.service";

const RESEND_COOLDOWN_SECONDS = 60;
const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSent, setIsSent] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [cooldown, setCooldown] = useState(0);

  useEffect(() => {
    if (cooldown <= 0) return;
    const timer = setTimeout(() => setCooldown((c) => c - 1), 1000);
    return () => clearTimeout(timer);
  }, [cooldown]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isSubmitting || cooldown > 0) return;
    setError(null);

    const trimmed = email.trim();
    if (!EMAIL_PATTERN.test(trimmed)) {
      setError("Please enter a valid email address.");
      return;
    }

    setIsSubmitting(true);
    try {
      await authService.forgotPassword({ email: trimmed });
      // The API answers 200 whether or not the account exists. Always show
      // the same confirmation so accounts can't be enumerated.
      setIsSent(true);
      setCooldown(RESEND_COOLDOWN_SECONDS);
    } catch (err) {
      if (isAxiosError(err) && err.response?.status === 429) {
        setError("Too many attempts, please try again later.");
      } else if (isAxiosError(err) && err.response?.status === 400) {
        setError("Please enter a valid email address.");
      } else {
        setError("Something went wrong. Please try again.");
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isSent) {
    return (
      <AuthCardLayout title="Check your email">
        <div className="flex flex-col items-center text-center gap-4">
          <div className="w-12 h-12 rounded-full bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center">
            <MailCheck className="w-6 h-6 text-emerald-400" />
          </div>
          <p className="text-sm text-slate-300">
            If an account exists for that email, we&apos;ve sent a reset link.
            It expires in 1 hour.
          </p>
          <p className="text-xs text-slate-500">
            Don&apos;t see it? Check your spam folder. Only the newest link
            works.
          </p>
          <button
            type="button"
            onClick={() => setIsSent(false)}
            disabled={cooldown > 0}
            className="text-xs font-medium text-cyan-400 hover:text-cyan-300 disabled:text-slate-600 disabled:cursor-not-allowed cursor-pointer transition-colors"
          >
            {cooldown > 0 ? `Send again in ${cooldown}s` : "Send again"}
          </button>
          <Link
            href="/login"
            className="mt-2 inline-flex items-center gap-2 text-xs text-slate-400 hover:text-white transition-colors"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            Back to login
          </Link>
        </div>
      </AuthCardLayout>
    );
  }

  return (
    <AuthCardLayout
      title="Forgot password?"
      subtitle="Enter your email and we'll send you a reset link"
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
            htmlFor="forgot-email"
            className="block text-xs font-semibold text-slate-300 mb-2"
          >
            Email Address
          </label>
          <div className="relative">
            <Mail className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              id="forgot-email"
              type="email"
              autoComplete="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="admin@olive.church"
              required
              className="w-full bg-slate-950/60 border border-slate-800 focus:border-cyan-500 rounded-xl py-3 pl-10 pr-4 text-base text-slate-200 placeholder:text-slate-600 focus:outline-none transition-colors"
            />
          </div>
        </div>

        <button
          type="submit"
          disabled={isSubmitting || cooldown > 0}
          className="w-full py-3.5 px-4 bg-indigo-600 hover:bg-indigo-500 text-white font-medium text-sm rounded-xl transition-all shadow-md shadow-indigo-600/20 flex items-center justify-center gap-2 disabled:opacity-50 cursor-pointer min-h-[48px]"
        >
          {isSubmitting ? (
            <Spinner size="sm" className="text-white" />
          ) : (
            "Send reset link"
          )}
        </button>

        <div className="text-center">
          <Link
            href="/login"
            className="inline-flex items-center gap-2 text-xs text-slate-400 hover:text-white transition-colors"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            Back to login
          </Link>
        </div>
      </form>
    </AuthCardLayout>
  );
}
