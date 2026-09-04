"use client"

import * as React from "react"
import { cn } from "@/lib/utils"
import { CheckCircle2, XCircle, AlertCircle, Info, X } from "lucide-react"
import { cva, type VariantProps } from "class-variance-authority"

const toastVariants = cva(
  "relative flex items-start gap-3 w-full max-w-sm rounded-lg p-4 text-sm shadow-lg hairline-border pointer-events-auto",
  {
    variants: {
      variant: {
        default: "bg-[var(--color-canvas-elevated)] text-[var(--color-ink)]",
        success: "bg-emerald-50 text-emerald-900 border-emerald-200",
        error: "bg-red-50 text-red-900 border-red-200",
        warning: "bg-[var(--color-warning-soft)] text-[var(--color-warning-deep)] border-amber-200",
        info: "bg-[var(--color-link-soft)] text-[var(--color-link-deep)] border-blue-200",
      },
    },
    defaultVariants: { variant: "default" },
  }
)

const toastIcons = {
  default: Info,
  success: CheckCircle2,
  error: XCircle,
  warning: AlertCircle,
  info: Info,
}

export interface ToastData extends VariantProps<typeof toastVariants> {
  id: string
  title: string
  description?: string
}

interface ToastProps extends ToastData {
  onDismiss: (id: string) => void
}

function Toast({ id, title, description, variant = "default", onDismiss }: ToastProps) {
  const Icon = toastIcons[variant ?? "default"]

  React.useEffect(() => {
    const timer = setTimeout(() => onDismiss(id), 5000)
    return () => clearTimeout(timer)
  }, [id, onDismiss])

  return (
    <div className={cn(toastVariants({ variant }))} role="alert" aria-live="polite">
      <Icon className="h-5 w-5 flex-shrink-0 mt-0.5" />
      <div className="flex-1 min-w-0">
        <p className="font-semibold">{title}</p>
        {description && <p className="mt-0.5 text-xs opacity-80">{description}</p>}
      </div>
      <button
        onClick={() => onDismiss(id)}
        className="flex-shrink-0 p-0.5 rounded opacity-50 hover:opacity-100 transition-opacity"
        aria-label="Dismiss"
      >
        <X className="h-4 w-4" />
      </button>
    </div>
  )
}

// Toast context for global access
type AddToastFn = (toast: Omit<ToastData, "id">) => void

const ToastContext = React.createContext<AddToastFn>(() => {})

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = React.useState<ToastData[]>([])

  const addToast: AddToastFn = React.useCallback((toast) => {
    const id = Math.random().toString(36).slice(2)
    setToasts((prev) => [...prev, { ...toast, id }])
  }, [])

  const dismissToast = React.useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id))
  }, [])

  return (
    <ToastContext.Provider value={addToast}>
      {children}
      {/* Toast viewport */}
      <div
        aria-label="Notifications"
        className="fixed bottom-4 right-4 z-[100] flex flex-col gap-2 pointer-events-none"
      >
        {toasts.map((t) => (
          <Toast key={t.id} {...t} onDismiss={dismissToast} />
        ))}
      </div>
    </ToastContext.Provider>
  )
}

export function useToast() {
  const addToast = React.useContext(ToastContext)
  return {
    toast: addToast,
    success: (title: string, description?: string) =>
      addToast({ title, description, variant: "success" }),
    error: (title: string, description?: string) =>
      addToast({ title, description, variant: "error" }),
    warning: (title: string, description?: string) =>
      addToast({ title, description, variant: "warning" }),
    info: (title: string, description?: string) =>
      addToast({ title, description, variant: "info" }),
  }
}
