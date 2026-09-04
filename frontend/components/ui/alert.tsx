import * as React from "react"
import { cn } from "@/lib/utils"
import { cva, type VariantProps } from "class-variance-authority"
import { AlertCircle, CheckCircle2, Info, XCircle, X } from "lucide-react"

const alertVariants = cva(
  "relative flex items-start gap-3 w-full rounded-md p-4 text-sm hairline-border",
  {
    variants: {
      variant: {
        info: "bg-[var(--color-link-soft)] text-[var(--color-link-deep)] border-[var(--color-link)]",
        success: "bg-emerald-50 text-emerald-800 border-emerald-300",
        warning: "bg-[var(--color-warning-soft)] text-[var(--color-warning-deep)] border-[var(--color-warning)]",
        error: "bg-red-50 text-[var(--color-error-deep)] border-[var(--color-error)]",
      },
    },
    defaultVariants: {
      variant: "info",
    },
  }
)

const icons = {
  info: Info,
  success: CheckCircle2,
  warning: AlertCircle,
  error: XCircle,
}

interface AlertProps extends VariantProps<typeof alertVariants> {
  title?: string
  children: React.ReactNode
  className?: string
  dismissible?: boolean
  onDismiss?: () => void
}

export function Alert({
  variant = "info",
  title,
  children,
  className,
  dismissible,
  onDismiss,
}: AlertProps) {
  const Icon = icons[variant ?? "info"]

  return (
    <div className={cn(alertVariants({ variant }), className)} role="alert">
      <Icon className="h-5 w-5 flex-shrink-0 mt-0.5" />
      <div className="flex-1">
        {title && <p className="font-semibold mb-0.5">{title}</p>}
        <div className="leading-relaxed">{children}</div>
      </div>
      {dismissible && (
        <button
          onClick={onDismiss}
          className="flex-shrink-0 p-0.5 rounded opacity-70 hover:opacity-100 transition-opacity"
          aria-label="Dismiss"
        >
          <X className="h-4 w-4" />
        </button>
      )}
    </div>
  )
}
