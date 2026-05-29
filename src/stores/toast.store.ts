import { create } from "zustand";
import { useMemo } from "react";

export type ToastVariant = "success" | "warning" | "danger" | "info";

export interface ToastItem {
  id: string;
  message: string;
  variant: ToastVariant;
  duration: number;
}

export interface ToastStoreState {
  toasts: ToastItem[];
  addToast: (toast: Omit<ToastItem, "id"> & { id?: string }) => string;
  dismissToast: (id: string) => void;
  clearToasts: () => void;
}

export const useToastStore = create<ToastStoreState>((set) => ({
  toasts: [],
  addToast: (toast) => {
    const id = toast.id ?? crypto.randomUUID();

    set((state) => ({
      toasts: [
        ...state.toasts,
        {
          id,
          message: toast.message,
          variant: toast.variant,
          duration: toast.duration,
        },
      ],
    }));

    return id;
  },
  dismissToast: (id) =>
    set((state) => ({
      toasts: state.toasts.filter((toast) => toast.id !== id),
    })),
  clearToasts: () => set({ toasts: [] }),
}));

export const useToastQueue = () => useToastStore((state) => state.toasts);

export const useToastActions = () => {
  const addToast = useToastStore((state) => state.addToast);
  const dismissToast = useToastStore((state) => state.dismissToast);
  const clearToasts = useToastStore((state) => state.clearToasts);

  return useMemo(
    () => ({ addToast, dismissToast, clearToasts }),
    [addToast, dismissToast, clearToasts],
  );
};
