"use client";

import { useToast } from "@/context/ToastContext";
import { AnimatePresence, motion } from "framer-motion";
import { CheckCircle, AlertCircle, Info, X } from "lucide-react";

export function ToastContainer() {
  const { toasts, removeToast } = useToast();

  return (
    <div className="fixed top-4 left-1/2 -translate-x-1/2 z-[100] flex flex-col gap-2 pointer-events-none w-full max-w-md px-4">
      <AnimatePresence>
        {toasts.map((toast) => (
          <motion.div
            key={toast.id}
            initial={{ opacity: 0, y: -50, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -20, scale: 0.9 }}
            className={`pointer-events-auto flex items-start gap-3 p-4 rounded-lg shadow-lg border min-w-[300px] max-w-md backdrop-blur-md ${
              toast.variant === "success"
                ? "bg-success/10 border-success/20 text-success"
                : toast.variant === "error"
                ? "bg-danger/10 border-danger/20 text-danger"
                : "bg-surface-2 border-surface text-accent-light"
            }`}
          >
            <div className="shrink-0 mt-0.5">
              {toast.variant === "success" && <CheckCircle className="w-5 h-5" />}
              {toast.variant === "error" && <AlertCircle className="w-5 h-5" />}
              {toast.variant === "info" && <Info className="w-5 h-5" />}
            </div>
            <p className="flex-grow text-sm font-medium leading-relaxed">{toast.message}</p>
            <button
              onClick={() => removeToast(toast.id)}
              className="shrink-0 p-1 rounded-md opacity-70 hover:opacity-100 hover:bg-black/10 transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
}
