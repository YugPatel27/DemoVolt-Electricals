import { useEffect, useState } from "react";
import { CheckCircle2, AlertCircle } from "lucide-react";
import { subscribeToasts } from "../lib/toast";

export function ToastContainer() {
  const [toasts, setToasts] = useState([]);

  useEffect(() => {
    return subscribeToasts(({ action, toast, id }) => {
      if (action === "add") {
        setToasts((prev) => [...prev, toast]);
      } else {
        setToasts((prev) => prev.filter((t) => t.id !== id));
      }
    });
  }, []);

  if (toasts.length === 0) return null;

  return (
    <div
      className="fixed bottom-6 left-1/2 -translate-x-1/2 z-[100] flex flex-col gap-2 pointer-events-none items-center"
      aria-live="polite"
    >
      {toasts.map((toast) => (
        <ToastItem key={toast.id} toast={toast} />
      ))}
    </div>
  );
}

function ToastItem({ toast }) {
  const isSuccess = toast.type === "success";
  const Icon = isSuccess ? CheckCircle2 : AlertCircle;

  return (
    <div
      className={`pointer-events-auto flex items-center gap-3 rounded-full px-5 py-3 text-sm font-semibold shadow-2xl animate-fade-up backdrop-blur-md border max-w-sm text-center
        ${
          isSuccess
            ? "border-emerald-500/30 bg-slate-900/90 text-white ring-1 ring-emerald-500/40"
            : "border-rose-500/30 bg-slate-900/90 text-white ring-1 ring-rose-500/40"
        }`}
    >
      <Icon
        className={`h-4 w-4 shrink-0 ${isSuccess ? "text-emerald-400" : "text-rose-400"}`}
      />
      <span className="flex-1 truncate">{toast.message}</span>
    </div>
  );
}
