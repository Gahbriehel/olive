import "@tanstack/react-query";

declare module "@tanstack/react-query" {
  interface Register {
    mutationMeta: {
      /** Shown as a success toast by the global MutationCache (app/providers.tsx). */
      successMessage?: string;
    };
  }
}
