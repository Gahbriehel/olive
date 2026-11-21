"use client";

import Link from "next/link";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { motion } from "framer-motion";
import { AlertCircle, Info, Landmark, RotateCw } from "lucide-react";
import { webService } from "@/services/api";
import {
  GIVING_PURPOSE_TABS,
  currencyTitle,
  groupByCurrency,
} from "@/lib/giving";
import { GivingAccountCard } from "@/components/give/GivingAccountCard";

export function GiveView() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const rawPurpose = searchParams.get("purpose")?.toUpperCase();

  const {
    data: allAccounts,
    isLoading,
    isError,
    refetch,
    isFetching,
  } = useQuery({
    queryKey: ["givingAccounts"],
    queryFn: () => webService.getGivingAccounts(),
    retry: 1,
  });

  // Only offer purposes that have at least one account.
  const visible = allAccounts
    ? GIVING_PURPOSE_TABS.filter((p) =>
        allAccounts.some((a) => a.purposes.includes(p.id)),
      )
    : [];
  const selected = visible.find((p) => p.id === rawPurpose) ?? visible[0];
  const accounts =
    allAccounts && selected
      ? allAccounts.filter((a) => a.purposes.includes(selected.id))
      : (allAccounts ?? []);

  const selectPurpose = (id: string) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set("purpose", id);
    router.replace(`${pathname}?${params}`, { scroll: false });
  };

  return (
    <div className="bg-[#171717] min-h-screen text-[#F7F5F0] py-16 lg:py-24">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
        {/* HEADER */}
        <div className="space-y-4 border-b border-white/10 pb-12">
          <motion.span
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            className="block text-[#B18A4A] text-xs font-sans font-medium uppercase tracking-[0.2em]"
          >
            PARTNER WITH US
          </motion.span>
          <motion.h1
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-4xl sm:text-5xl font-serif font-medium text-[#F7F5F0] tracking-tight"
          >
            Give
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="text-[#D4D0C7] text-base font-sans font-light max-w-2xl"
          >
            Thank you for sowing into the work of God. Choose what you&apos;re
            giving towards, then make a transfer from your bank app.
          </motion.p>
        </div>

        {/* PURPOSE TABS */}
        {visible.length > 0 && (
          <nav
            aria-label="Giving purpose"
            className="grid grid-cols-2 gap-2 sm:grid-cols-3 lg:grid-cols-6"
          >
            {visible.map((p) => {
              const active = p.id === selected?.id;
              return (
                <button
                  key={p.id}
                  type="button"
                  onClick={() => selectPurpose(p.id)}
                  aria-current={active ? "page" : undefined}
                  className={`rounded-sm border px-4 py-3 text-left font-sans transition-colors ${
                    active
                      ? "border-[#B18A4A] bg-[#B18A4A]/10"
                      : "border-white/10 bg-[#1F1F1F] hover:border-[#B18A4A]/50"
                  }`}
                >
                  <span
                    className={`block text-xs font-medium uppercase tracking-wider ${
                      active ? "text-[#B18A4A]" : "text-[#F7F5F0]"
                    }`}
                  >
                    {p.label}
                  </span>
                  <span className="mt-1 block text-[11px] font-light text-[#77736B]">
                    {p.hint}
                  </span>
                </button>
              );
            })}
          </nav>
        )}

        {/* TRANSFER NARRATION HINT — shown even when an account has no note */}
        {!isLoading && !isError && accounts.length > 0 && (
          <div className="flex items-start gap-3 rounded-sm border border-[#B18A4A]/30 bg-[#B18A4A]/5 px-5 py-4 font-sans">
            <Info
              aria-hidden
              className="mt-0.5 size-4 shrink-0 text-[#B18A4A]"
            />
            <p className="text-sm text-[#D4D0C7]">
              <span className="font-medium text-[#F7F5F0]">
                Use your name and the purpose as the transfer narration
              </span>{" "}
              (for example, &ldquo;Ada Obi – {selected?.label ?? "Tithe"}
              &rdquo;) so we can record correctly.
            </p>
          </div>
        )}

        {/* LOADING STATE */}
        {isLoading && (
          <div className="grid gap-6 md:grid-cols-2">
            {[1, 2].map((n) => (
              <div
                key={n}
                className="h-72 rounded-sm bg-white/5 animate-pulse border border-white/5"
              />
            ))}
          </div>
        )}

        {/* ERROR STATE */}
        {isError && (
          <div className="p-10 rounded-sm bg-rose-950/20 border border-rose-800/30 text-rose-300 text-center space-y-3 font-sans">
            <AlertCircle className="w-6 h-6 mx-auto text-rose-400" />
            <p className="font-medium text-sm">
              We couldn&apos;t load our giving details.
            </p>
            <p className="text-xs text-[#77736B]">
              Please check your connection and try again.
            </p>
            <button
              type="button"
              onClick={() => refetch()}
              disabled={isFetching}
              className="mt-2 inline-flex items-center gap-2 rounded-sm border border-white/10 px-4 py-2 text-xs font-medium uppercase tracking-wider text-[#F7F5F0] hover:border-[#B18A4A]/50 disabled:opacity-50"
            >
              <RotateCw
                aria-hidden
                className={`size-3.5 ${isFetching ? "animate-spin" : ""}`}
              />
              Try again
            </button>
          </div>
        )}

        {/* EMPTY STATE */}
        {!isLoading && !isError && accounts.length === 0 && (
          <div className="text-center py-20 p-8 rounded-sm bg-[#1F1F1F] border border-white/10 space-y-4 font-sans">
            <Landmark className="w-10 h-10 text-[#77736B] mx-auto" />
            <h2 className="text-lg font-serif font-medium text-[#F7F5F0]">
              Giving details aren&apos;t available yet
            </h2>
            <p className="text-xs text-[#77736B] max-w-md mx-auto">
              Please check back soon, or{" "}
              <Link href="/contact" className="text-[#B18A4A] hover:underline">
                contact the church office
              </Link>
              .
            </p>
          </div>
        )}

        {/* ACCOUNTS, GROUPED BY CURRENCY */}
        {!isLoading &&
          !isError &&
          groupByCurrency(accounts).map(([currency, list]) => (
            <section
              key={currency}
              aria-labelledby={`grp-${currency}`}
              className="space-y-4"
            >
              <h2
                id={`grp-${currency}`}
                className="text-xs font-sans font-medium uppercase tracking-[0.2em] text-[#77736B]"
              >
                {currencyTitle(currency)}
              </h2>
              <div className="grid gap-6 md:grid-cols-2">
                {list.map((account) => (
                  <GivingAccountCard key={account.id} account={account} />
                ))}
              </div>
            </section>
          ))}

        {!isLoading && !isError && accounts.length > 0 && (
          <p className="text-center text-xs font-sans text-[#77736B] md:text-left">
            Always confirm account details with the{" "}
            <Link href="/contact" className="text-[#B18A4A] hover:underline">
              church office
            </Link>{" "}
            if anything looks unfamiliar.
          </p>
        )}
      </div>
    </div>
  );
}
