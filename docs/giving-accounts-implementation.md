# Giving Accounts: Admin Implementation Guide

This guide covers the Olive (`apps/admin`) implementation of the **Giving Accounts** management screen, backed by Dove's `/api/v1/giving-accounts` API.

**Access Level:** `SUPER_ADMIN` only.

---

## 1. Overview

Giving Accounts allow the church to display official bank transfer details (account name, bank, account number, currency, and purposes) in the member PWA (`abwog-lifestyle`). 

Super Admins can:
1. List all accounts (active and inactive).
2. Add new bank accounts.
3. Edit existing account details or toggle their active status.
4. Drag/reorder accounts to change their display order in the PWA.
5. Permanently delete an account.

---

## 2. API Endpoints

Base URL: `/api/v1/giving-accounts` (Dove API)
Header: `Authorization: Bearer <super_admin_jwt>`

| Method | Path | Action |
|---|---|---|
| `GET` | `/giving-accounts` | Fetch all accounts (includes inactive) |
| `POST` | `/giving-accounts` | Create account |
| `PATCH` | `/giving-accounts/:id` | Update account / toggle `isActive` |
| `PATCH` | `/giving-accounts/reorder` | Update account ordering |
| `DELETE` | `/giving-accounts/:id` | Delete account |

---

## 3. Data Model & Types

```typescript
export type GivingCurrency = 'NGN' | 'USD' | 'GBP' | 'EUR';

export type GivingPurpose =
  | 'TITHE'
  | 'OFFERING'
  | 'BUILDING'
  | 'MISSIONS'
  | 'SEED'
  | 'SPECIAL';

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
```

---

## 4. Validation Rules

- `label`: 1–100 chars (e.g., "Tithes & Offerings", "Building Project")
- `bankName`: 1–100 chars (e.g., "GTBank", "Zenith Bank")
- `accountName`: 1–255 chars (e.g., "Abiding Word Of Grace Missions")
- `accountNumber`: Digits only after stripping spaces and hyphens. 6–34 digits. For `currency = 'NGN'`, **must be exactly 10 digits**.
- `currency`: `'NGN' | 'USD' | 'GBP' | 'EUR'`, defaults to `'NGN'`
- `note`: Optional, max 500 chars (empty strings converted to `null`)
- `purposes`: 1–6 unique values selected from `['TITHE', 'OFFERING', 'BUILDING', 'MISSIONS', 'SEED', 'SPECIAL']`
- `isActive`: Boolean, defaults to `true`

---

## 5. Service & React Query Integration

### `src/services/giving-accounts.service.ts`
```typescript
import apiClient from './apiClient';
import { extractData } from '@/utils/api';
import {
  GivingAccount,
  CreateGivingAccountPayload,
  UpdateGivingAccountPayload,
  ReorderGivingAccountsPayload,
} from '@/models/giving-account';

export const givingAccountsService = {
  async getAll(): Promise<GivingAccount[]> {
    const response = await apiClient.get('/giving-accounts');
    return extractData<GivingAccount[]>(response);
  },

  async create(payload: CreateGivingAccountPayload): Promise<GivingAccount> {
    const response = await apiClient.post('/giving-accounts', payload);
    return extractData<GivingAccount>(response);
  },

  async update(id: string, payload: UpdateGivingAccountPayload): Promise<GivingAccount> {
    const response = await apiClient.patch(`/giving-accounts/${id}`, payload);
    return extractData<GivingAccount>(response);
  },

  async reorder(payload: ReorderGivingAccountsPayload): Promise<{ message: string }> {
    const response = await apiClient.patch('/giving-accounts/reorder', payload);
    return extractData<{ message: string }>(response);
  },

  async remove(id: string): Promise<{ message: string }> {
    const response = await apiClient.delete(`/giving-accounts/${id}`);
    return extractData<{ message: string }>(response);
  },
};
```

### `src/hooks/useGivingAccounts.ts`
```typescript
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'react-hot-toast';
import { givingAccountsService } from '@/services/giving-accounts.service';
import {
  CreateGivingAccountPayload,
  UpdateGivingAccountPayload,
  ReorderGivingAccountsPayload,
} from '@/models/giving-account';

export const GIVING_ACCOUNTS_QUERY_KEY = ['giving-accounts'];

export function useGivingAccounts() {
  const queryClient = useQueryClient();

  const query = useQuery({
    queryKey: GIVING_ACCOUNTS_QUERY_KEY,
    queryFn: () => givingAccountsService.getAll(),
  });

  const createMutation = useMutation({
    mutationFn: (payload: CreateGivingAccountPayload) =>
      givingAccountsService.create(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: GIVING_ACCOUNTS_QUERY_KEY });
      toast.success('Giving account created successfully');
    },
    onError: (err: any) => {
      toast.error(err.response?.data?.message || 'Failed to create giving account');
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: UpdateGivingAccountPayload }) =>
      givingAccountsService.update(id, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: GIVING_ACCOUNTS_QUERY_KEY });
      toast.success('Giving account updated');
    },
    onError: (err: any) => {
      toast.error(err.response?.data?.message || 'Failed to update giving account');
    },
  });

  const reorderMutation = useMutation({
    mutationFn: (payload: ReorderGivingAccountsPayload) =>
      givingAccountsService.reorder(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: GIVING_ACCOUNTS_QUERY_KEY });
      toast.success('Display order saved');
    },
    onError: (err: any) => {
      toast.error(err.response?.data?.message || 'Failed to reorder accounts');
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => givingAccountsService.remove(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: GIVING_ACCOUNTS_QUERY_KEY });
      toast.success('Giving account removed');
    },
    onError: (err: any) => {
      toast.error(err.response?.data?.message || 'Failed to delete account');
    },
  });

  return {
    ...query,
    createAccount: createMutation.mutateAsync,
    updateAccount: updateMutation.mutateAsync,
    reorderAccounts: reorderMutation.mutateAsync,
    deleteAccount: deleteMutation.mutateAsync,
  };
}
```
