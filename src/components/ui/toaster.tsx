"use client";

import { useToastActions, useToastQueue } from "@/stores/toast.store";
import { cn } from "@/lib/utils";

const variants = {
  success: "border-green-200 bg-green-50 text-green-900",
  warning: "border-amber-200 bg-amber-50 text-amber-900",
  danger: "border-red-200 bg-red-50 text-red-900",
  info: "border-blue-200 bg-blue-50 text-blue-900",
};

export function Toaster() {
  const toasts = useToastQueue();
  const { dismissToast } = useToastActions();

  if (!toasts.length) {
    return null;
  }

  return (
    <div className="fixed right-4 top-4 z-50 grid max-w-sm gap-2" role="status" aria-live="polite">
      {toasts.map((toast) => (
        <button
          key={toast.id}
          className={cn("rounded-lg border px-4 py-3 text-left text-sm shadow-md", variants[toast.variant])}
          type="button"
          onClick={() => dismissToast(toast.id)}
        >
          {toast.message}
        </button>
      ))}
    </div>
  );
}
