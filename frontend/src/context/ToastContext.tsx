import {
  useEffect,
  useState,
  type ReactNode,
} from "react";
import { ToastContext, type ToastMessage } from "./ToastContextValue";

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  const showToast = (message: string, kind: "success" | "error" | "info" = "info") => {
    const id = Date.now() + Math.random();
    setToasts((current) => [...current, { id, message, kind }].slice(-3));
  };

  const dismissToast = (id: number) => {
    setToasts((current) => current.filter((toast) => toast.id !== id));
  };

  useEffect(() => {
    const timers = toasts.map((toast) =>
      window.setTimeout(() => dismissToast(toast.id), 5000)
    );
    return () => timers.forEach(window.clearTimeout);
  }, [toasts]);

  useEffect(() => {
    const notifyInvalidField = (event: Event) => {
      const field = event.target;
      if (
        field instanceof HTMLInputElement ||
        field instanceof HTMLSelectElement ||
        field instanceof HTMLTextAreaElement
      ) {
        showToast(field.validationMessage, "error");
      }
    };

    document.addEventListener("invalid", notifyInvalidField, true);
    return () => document.removeEventListener("invalid", notifyInvalidField, true);
  }, []);

  return (
    <ToastContext.Provider value={{ showToast }}>
      {children}
      <div
        className="pointer-events-none fixed right-4 top-4 z-50 flex w-[min(26rem,calc(100vw-2rem))] flex-col gap-3 sm:right-6 sm:top-6"
        aria-live="polite"
        aria-relevant="additions"
      >
        {toasts.map((toast) => {
          const appearance = {
            success: {
              panel: "border-emerald-100 border-l-4 border-l-emerald-500 bg-white text-slate-800",
              icon: "bg-emerald-100 text-emerald-700",
              symbol: "✓",
            },
            error: {
              panel: "border-rose-100 border-l-4 border-l-rose-500 bg-white text-slate-800",
              icon: "bg-rose-100 text-rose-700",
              symbol: "!",
            },
            info: {
              panel: "border-teal-100 border-l-4 border-l-teal-500 bg-white text-slate-800",
              icon: "bg-teal-100 text-teal-700",
              symbol: "i",
            },
          }[toast.kind];

          return (
            <div
              key={toast.id}
              role={toast.kind === "error" ? "alert" : "status"}
              className={`pointer-events-auto flex items-center gap-3 rounded-2xl border border-l-4 p-4 shadow-[0_16px_40px_rgba(15,23,42,0.16)] ${appearance.panel}`}
            >
              <span
                aria-hidden="true"
                className={`grid h-9 w-9 shrink-0 place-items-center rounded-full text-base font-bold ${appearance.icon}`}
              >
                {appearance.symbol}
              </span>
              <p className="flex-1 text-[15px] font-semibold leading-6">
                {toast.message}
              </p>
              <button
                type="button"
                onClick={() => dismissToast(toast.id)}
                aria-label="Dismiss notification"
                className="grid h-8 w-8 shrink-0 place-items-center rounded-full text-xl leading-none text-slate-400 transition hover:bg-slate-100 hover:text-slate-700"
              >
                <span aria-hidden="true">×</span>
              </button>
            </div>
          );
        })}
      </div>
    </ToastContext.Provider>
  );
}
