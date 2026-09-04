import * as React from "react"
import { cn } from "@/lib/utils"
import { AlertTriangle, RefreshCcw } from "lucide-react"
import { Button } from "./button"

interface ErrorStateProps {
  title?: string
  description?: string
  onRetry?: () => void
  className?: string
}

export function ErrorState({
  title = "Something went wrong",
  description = "An unexpected error occurred. Please try again.",
  onRetry,
  className,
}: ErrorStateProps) {
  return (
    <div
      className={cn(
        "flex flex-col items-center justify-center text-center py-16 px-6",
        className
      )}
      role="alert"
    >
      <div className="text-[var(--color-error)] mb-4">
        <AlertTriangle className="h-12 w-12" />
      </div>
      <h3 className="text-base font-semibold text-[var(--color-ink)] mb-2">{title}</h3>
      <p className="text-sm text-[var(--color-mute)] max-w-sm mb-6">{description}</p>
      {onRetry && (
        <Button variant="ghost-sm" size="md" onClick={onRetry} className="gap-2">
          <RefreshCcw className="h-4 w-4" />
          Try Again
        </Button>
      )}
    </div>
  )
}
