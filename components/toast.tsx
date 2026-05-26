'use client';

import { createContext, useContext, useMemo, useState, type ReactNode } from 'react';
import { CheckCircle2, X } from 'lucide-react';
import { cn } from '@/lib/utils';

type Toast = {
  id: number;
  title: string;
  description?: string;
};

type ToastContextValue = {
  toast: (toast: Omit<Toast, 'id'>) => void;
};

const ToastContext = createContext<ToastContextValue | null>(null);

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const value = useMemo(
    () => ({
      toast: (incoming: Omit<Toast, 'id'>) => {
        const id = Date.now();
        setToasts((current) => [...current, { id, ...incoming }]);
        window.setTimeout(() => {
          setToasts((current) => current.filter((item) => item.id !== id));
        }, 3200);
      }
    }),
    []
  );

  return (
    <ToastContext.Provider value={value}>
      {children}
      <div className="fixed right-4 top-4 z-50 flex w-[calc(100%-2rem)] max-w-sm flex-col gap-3 sm:w-full">
        {toasts.map((toast) => (
          <div key={toast.id} className="glass animate-in slide-in-from-top-2 rounded-2xl border p-4 shadow-xl">
            <div className="flex items-start gap-3">
              <div className="mt-0.5 rounded-full bg-brand-100 p-2 text-brand-700 dark:bg-brand-900/40 dark:text-brand-300">
                <CheckCircle2 className="h-4 w-4" />
              </div>
              <div className="min-w-0 flex-1">
                <p className="font-semibold">{toast.title}</p>
                {toast.description ? <p className="text-sm text-muted-foreground">{toast.description}</p> : null}
              </div>
              <button
                type="button"
                onClick={() => setToasts((current) => current.filter((item) => item.id !== toast.id))}
                className={cn('rounded-full p-1 text-muted-foreground transition hover:bg-secondary hover:text-foreground')}
                aria-label="Dismiss toast"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
}

export function useToast() {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error('useToast must be used within ToastProvider');
  }
  return context;
}