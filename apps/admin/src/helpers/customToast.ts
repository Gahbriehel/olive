import toast, { type ToastOptions } from "react-hot-toast";

/*
 * Toasts read the design tokens from globals.css, so they follow light/dark
 * mode. A neutral surface with a coloured accent bar keeps them calm; the
 * icon carries the meaning. Messages dedupe by text unless an id is given.
 */
const base: ToastOptions = {
  duration: 4000,
  position: "top-right",
  style: {
    background: "var(--surface-raised)",
    color: "var(--fg)",
    border: "1px solid var(--border-control)",
    borderRadius: "12px",
    boxShadow: "var(--shadow-lg)",
    fontSize: "14px",
    fontWeight: 500,
    padding: "12px 16px",
    maxWidth: "400px",
  },
};

const withAccent = (accent: string, options: ToastOptions = {}) => ({
  ...base,
  ...options,
  style: { ...base.style, borderLeft: `4px solid var(${accent})` },
  iconTheme: { primary: `var(${accent})`, secondary: "var(--surface-raised)" },
});

export const customToast = {
  success: (message: string, id?: string) =>
    toast.success(message, {
      id: id ?? encodeURI(message),
      ...withAccent("--success"),
    }),

  error: (message: string, id?: string) =>
    toast.error(message, {
      id: id ?? encodeURI(message),
      ...withAccent("--danger", { duration: 6000 }),
    }),

  info: (message: string, id?: string) =>
    toast(message, {
      id: id ?? encodeURI(message),
      ...withAccent("--primary"),
    }),

  warning: (message: string, id?: string) =>
    toast(message, {
      id: id ?? encodeURI(message),
      ...withAccent("--warning"),
    }),

  loading: (message: string, id?: string) =>
    toast.loading(message, {
      id: id ?? encodeURI(message),
      ...withAccent("--primary"),
    }),

  dismiss: (id?: string) => {
    toast.dismiss(id);
  },

  dismissAll: () => {
    toast.dismiss();
  },
};
