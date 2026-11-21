import type { GivingAccount, GivingPurpose } from "@olive/types";

export const GIVING_PURPOSE_TABS: {
  id: GivingPurpose;
  label: string;
  hint: string;
}[] = [
  { id: "TITHE", label: "Tithe", hint: "Your faithful 10%" },
  { id: "OFFERING", label: "Offering", hint: "A generous gift to God" },
  { id: "BUILDING", label: "Building fund", hint: "Build the house of God" },
  { id: "MISSIONS", label: "Missions", hint: "Advance the gospel" },
  { id: "SEED", label: "Seed", hint: "Sow into good ground" },
  { id: "SPECIAL", label: "Special", hint: "Welfare and other giving" },
];

const CURRENCY_ORDER = ["NGN", "USD", "GBP", "EUR"];

const CURRENCY_TITLE: Record<string, string> = {
  NGN: "Naira accounts",
  USD: "Dollar accounts",
  GBP: "Pound accounts",
  EUR: "Euro accounts",
};

export function currencyTitle(currency: string): string {
  return CURRENCY_TITLE[currency] ?? `${currency} accounts`;
}

/** Groups accounts by currency, Naira first, keeping each account's order. */
export function groupByCurrency(
  accounts: GivingAccount[],
): [string, GivingAccount[]][] {
  const groups = new Map<string, GivingAccount[]>();
  for (const account of accounts) {
    groups.set(account.currency, [
      ...(groups.get(account.currency) ?? []),
      account,
    ]);
  }
  const rank = (c: string) => {
    const i = CURRENCY_ORDER.indexOf(c);
    return i === -1 ? 99 : i;
  };
  return [...groups.entries()].sort(([a], [b]) => rank(a) - rank(b));
}
