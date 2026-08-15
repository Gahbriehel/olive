import toast from "react-hot-toast";

const toastConfig = {
  duration: 4000,
  style: {
    borderRadius: "12px",
    background: "#ffffff",
    color: "#374151",
    fontSize: "14px",
    fontWeight: "500",
    padding: "16px 20px",
    boxShadow:
      "0 10px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)",
    border: "1px solid #e5e7eb",
    maxWidth: "400px",
  },
  position: "top-right" as const,
};

const successConfig = {
  ...toastConfig,
  style: {
    ...toastConfig.style,
    background: "linear-gradient(135deg, #10b981 0%, #059669 100%)",
    color: "#ffffff",
    border: "1px solid #059669",
  },
  iconTheme: {
    primary: "#ffffff",
    secondary: "#10b981",
  },
};

const errorConfig = {
  ...toastConfig,
  style: {
    ...toastConfig.style,
    background: "linear-gradient(135deg, #ef4444 0%, #dc2626 100%)",
    color: "#ffffff",
    border: "1px solid #dc2626",
  },
  iconTheme: {
    primary: "#ffffff",
    secondary: "#ef4444",
  },
};

const infoConfig = {
  ...toastConfig,
  style: {
    ...toastConfig.style,
    background: "linear-gradient(135deg, #6366f1 0%, #4f46e5 100%)",
    color: "#ffffff",
    border: "1px solid #4f46e5",
  },
  icon: null,
};

const warningConfig = {
  ...toastConfig,
  style: {
    ...toastConfig.style,
    background: "linear-gradient(135deg, #f59e0b 0%, #d97706 100%)",
    color: "#ffffff",
    border: "1px solid #d97706",
  },
  icon: "⚠️",
};

const loadingConfig = {
  ...toastConfig,
  style: {
    ...toastConfig.style,
    background: "linear-gradient(135deg, #6366f1 0%, #4f46e5 100%)",
    color: "#ffffff",
    border: "1px solid #4f46e5",
  },
};

export const customToast = {
  success: (message: string, id?: string) =>
    toast.success(message, {
      id: id ?? encodeURI(message),
      ...successConfig,
    }),

  error: (message: string, id?: string) =>
    toast.error(message, {
      id: id ?? encodeURI(message),
      ...errorConfig,
    }),

  info: (message: string, id?: string) =>
    toast(message, {
      id: id ?? encodeURI(message),
      ...infoConfig,
    }),

  warning: (message: string, id?: string) =>
    toast(message, {
      id: id ?? encodeURI(message),
      ...warningConfig,
    }),

  loading: (message: string, id?: string) =>
    toast.loading(message, {
      id: id ?? encodeURI(message),
      ...loadingConfig,
    }),

  dismiss: (id?: string) => {
    toast.dismiss(id);
  },

  dismissAll: () => {
    toast.dismiss();
  },
};
