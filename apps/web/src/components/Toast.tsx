import {
  createContext,
  useCallback,
  useContext,
  useState,
  type ReactNode,
} from "react";

type ToastKind = "success" | "info" | "error";

interface Toast {
  id: number;
  message: string;
  kind: ToastKind;
}

interface ToastCtx {
  toast: (message: string, kind?: ToastKind) => void;
}

const Ctx = createContext<ToastCtx | null>(null);

const ICON: Record<ToastKind, string> = {
  success: "✓",
  info: "•",
  error: "!",
};

const ACCENT: Record<ToastKind, string> = {
  success: "text-positive",
  info: "text-brand",
  error: "text-warn",
};

let counter = 0;

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const toast = useCallback((message: string, kind: ToastKind = "success") => {
    const id = ++counter;
    setToasts((t) => [...t, { id, message, kind }]);
    setTimeout(() => {
      setToasts((t) => t.filter((x) => x.id !== id));
    }, 2600);
  }, []);

  return (
    <Ctx.Provider value={{ toast }}>
      {children}
      <div
        className="pointer-events-none fixed inset-x-0 bottom-4 z-[60] flex flex-col items-center gap-2 px-4"
        aria-live="polite"
        aria-atomic="true"
      >
        {toasts.map((t) => (
          <div
            key={t.id}
            role="status"
            className="animate-slide-in pointer-events-auto flex items-center gap-3 rounded-xl border border-border bg-surface px-4 py-2.5 shadow-calm"
            style={{ boxShadow: "0 12px 32px -12px rgb(0 0 0 / 0.25)" }}
          >
            <span
              aria-hidden="true"
              className={`grid h-6 w-6 place-items-center rounded-full bg-surface-2 text-sm font-bold ${ACCENT[t.kind]}`}
            >
              {ICON[t.kind]}
            </span>
            <span className="text-sm font-medium">{t.message}</span>
          </div>
        ))}
      </div>
    </Ctx.Provider>
  );
}

export function useToast(): ToastCtx {
  const ctx = useContext(Ctx);
  if (!ctx) throw new Error("useToast must be used within a ToastProvider");
  return ctx;
}
