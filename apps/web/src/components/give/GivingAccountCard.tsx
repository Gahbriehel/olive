"use client";

import { Check, Copy } from "lucide-react";
import type { GivingAccount } from "@olive/types";
import { useCopyToClipboard } from "@/hooks/useCopyToClipboard";

export function GivingAccountCard({ account }: { account: GivingAccount }) {
  const { isCopied, copyToClipboard } = useCopyToClipboard({
    toastMessage: "Account number copied",
    resetDuration: 2500,
  });

  return (
    <section
      aria-label={account.label}
      className="flex flex-col rounded-sm border border-white/10 bg-[#1F1F1F] p-6 sm:p-8 hover:border-[#B18A4A]/40 transition-colors"
    >
      <div className="flex items-start justify-between gap-3">
        <h3 className="min-w-0 break-words text-xl font-serif font-medium text-[#F7F5F0]">
          {account.label}
        </h3>
        {account.currency !== "NGN" && (
          <span className="shrink-0 rounded-sm border border-[#B18A4A]/30 bg-[#B18A4A]/10 px-2.5 py-0.5 text-[10px] font-sans font-semibold uppercase tracking-wider text-[#B18A4A]">
            {account.currency}
          </span>
        )}
      </div>

      <dl className="mt-6 grid gap-4 font-sans sm:grid-cols-2">
        <div>
          <dt className="text-[10px] font-medium uppercase tracking-[0.2em] text-[#77736B]">
            Bank
          </dt>
          <dd className="mt-1 text-sm font-medium text-[#F7F5F0]">
            {account.bankName}
          </dd>
        </div>
        <div>
          <dt className="text-[10px] font-medium uppercase tracking-[0.2em] text-[#77736B]">
            Account name
          </dt>
          <dd className="mt-1 break-words text-sm font-medium text-[#F7F5F0]">
            {account.accountName}
          </dd>
        </div>
        <div className="rounded-sm border border-white/5 bg-[#171717] px-4 py-3 sm:col-span-2">
          <dt className="text-[10px] font-medium uppercase tracking-[0.2em] text-[#77736B]">
            Account number
          </dt>
          <dd className="mt-1 font-mono text-2xl font-semibold tracking-wider text-[#F7F5F0] break-all">
            {account.accountNumber}
          </dd>
        </div>
      </dl>

      {account.note && (
        <p className="mt-4 text-xs font-sans font-light leading-relaxed text-[#D4D0C7]">
          {account.note}
        </p>
      )}

      <div aria-hidden className="hidden flex-1 sm:block sm:min-h-4" />

      <button
        type="button"
        onClick={() => copyToClipboard(account.accountNumber)}
        className={`mt-6 inline-flex w-full items-center justify-center gap-2 rounded-sm border px-4 py-3 text-xs font-sans font-medium uppercase tracking-wider transition-colors ${
          isCopied
            ? "border-emerald-500/40 bg-emerald-500/10 text-emerald-300"
            : "border-[#B18A4A]/50 text-[#B18A4A] hover:bg-[#B18A4A] hover:text-white"
        }`}
      >
        {isCopied ? (
          <Check aria-hidden className="size-4" />
        ) : (
          <Copy aria-hidden className="size-4" />
        )}
        {isCopied ? "Copied" : "Copy account number"}
      </button>
      <span role="status" aria-live="polite" className="sr-only">
        {isCopied ? "Account number copied" : ""}
      </span>
    </section>
  );
}
