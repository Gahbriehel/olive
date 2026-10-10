"use client";

import React, { useState } from "react";
import {
  MutationCache,
  QueryClient,
  QueryClientProvider,
} from "@tanstack/react-query";
import { Provider } from "react-redux";
import { Toaster } from "react-hot-toast";
import { store } from "@/store";
import { customToast } from "@/helpers/customToast";

export function AppProviders({ children }: { children: React.ReactNode }) {
  const [queryClient] = useState(
    () =>
      new QueryClient({
        // One success toast per user action: mutations declare
        // `meta: { successMessage }` and this cache shows it. Errors are
        // toasted by the API client interceptor.
        mutationCache: new MutationCache({
          onSuccess: (_data, _variables, _context, mutation) => {
            const message = mutation.meta?.successMessage;
            if (message) customToast.success(message);
          },
        }),
        defaultOptions: {
          queries: {
            refetchOnWindowFocus: false,
            retry: 1,
          },
        },
      }),
  );

  return (
    <Provider store={store}>
      <QueryClientProvider client={queryClient}>
        {children}
        <Toaster position="top-right" />
      </QueryClientProvider>
    </Provider>
  );
}
