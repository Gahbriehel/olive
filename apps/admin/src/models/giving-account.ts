import type {
  GivingAccount as SharedGivingAccount,
  GivingCurrency,
  GivingPurpose,
} from "@olive/types";

export type { GivingCurrency, GivingPurpose } from "@olive/types";
export { GIVING_CURRENCIES, GIVING_PURPOSES } from "@olive/types";

/** The admin listing always includes isActive, since it returns inactive accounts too. */
export interface GivingAccount extends SharedGivingAccount {
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
