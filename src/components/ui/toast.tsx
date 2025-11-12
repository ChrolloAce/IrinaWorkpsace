'use client';

import React, { createContext, useContext, useState } from 'react';

type ToastType = 'default' | 'success' | 'error' | 'warning' | 'info' | 'destructive';

interface ToastProps {
  title?: string;
  description?: string;
  variant?: ToastType;
  duration?: number;
}

interface ToastContextType {
  toast: (props: ToastProps) => void;
}

const ToastContext = createContext<ToastContextType | undefined>(undefined);

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<Array<ToastProps & { id: string }>>([]);

  const removeToast = (id: string) => {
    setToasts((prev) => prev.filter((toast) => toast.id !== id));
  };

  const toast = (props: ToastProps) => {
    const id = Math.random().toString(36).substring(2, 9);
    const newToast = { ...props, id };
    setToasts((prev) => [...prev, newToast]);

    if (props.duration !== 0) {
      setTimeout(() => {
        removeToast(id);
      }, props.duration || 3000);
    }
  };

  return (
    <ToastContext.Provider value={{ toast }}>
      {children}
      <div className="fixed top-4 right-4 z-50 flex flex-col gap-2">
        {toasts.map((toast) => (
          <div
            key={toast.id}
            className={`p-4 rounded-md shadow-md min-w-[300px] max-w-md animate-slide-in ${
              toast.variant === 'destructive'
                ? 'bg-red-50 border-l-4 border-red-500'
                : toast.variant === 'success'
                ? 'bg-green-50 border-l-4 border-green-500'
                : toast.variant === 'warning'
                ? 'bg-yellow-50 border-l-4 border-yellow-500'
                : toast.variant === 'info'
                ? 'bg-blue-50 border-l-4 border-blue-500'
                : 'bg-white border-l-4 border-gray-500'
            }`}
          >
            <div className="flex items-start justify-between">
              <div>
                {toast.title && (
                  <h3 className="font-medium text-gray-900">{toast.title}</h3>
                )}
                {toast.description && (
                  <p className="mt-1 text-sm text-gray-500">{toast.description}</p>
                )}
              </div>
              <button
                onClick={() => removeToast(toast.id)}
                className="ml-4 text-gray-400 hover:text-gray-500"
              >
                &times;
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
  if (context === undefined) {
    throw new Error('useToast must be used within a ToastProvider');
  }
  return context;
} 