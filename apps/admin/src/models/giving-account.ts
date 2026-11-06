export type GivingCurrency = "NGN" | "USD" | "GBP" | "EUR";

export type GivingPurpose =
  "TITHE" | "OFFERING" | "BUILDING" | "MISSIONS" | "SEED" | "SPECIAL";

export const GIVING_CURRENCIES: GivingCurrency[] = ["NGN", "USD", "GBP", "EUR"];

export const GIVING_PURPOSES: Array<{ id: GivingPurpose; label: string }> = [
  { id: "TITHE", label: "Tithe" },
  { id: "OFFERING", label: "Offering" },
  { id: "BUILDING", label: "Building" },
  { id: "MISSIONS", label: "Missions" },
  { id: "SEED", label: "Seed" },
  { id: "SPECIAL", label: "Special" },
];

export interface GivingAccount {
  id: string;
  label: string;
  bankName: string;
  accountName: string;
  accountNumber: string;
  currency: GivingCurrency;
  note: string | null;
  purposes: GivingPurpose[];
  sortOrder: number;
  isActive: boolean;
}

export interface CreateGivingAccountPayload {
  label: string;
  bankName: string;
  accountName: string;
  accountNumber: string;
  currency?: GivingCurrency;
  note?: string | null;
  purposes: GivingPurpose[];
  sortOrder?: number;
  isActive?: boolean;
}

export type UpdateGivingAccountPayload = Partial<CreateGivingAccountPayload>;

export interface ReorderGivingAccountsPayload {
  ids: string[];
}
