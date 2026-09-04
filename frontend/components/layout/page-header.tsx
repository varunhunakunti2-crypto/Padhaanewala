import * as React from "react"
import { cn } from "@/lib/utils"
import { Container } from "./container"

interface PageHeaderProps {
  title: string
  description?: string
  eyebrow?: string
  actions?: React.ReactNode
  breadcrumbs?: React.ReactNode
  className?: string
}

export function PageHeader({
  title,
  description,
  eyebrow,
  actions,
  breadcrumbs,
  className,
}: PageHeaderProps) {
  return (
    <div className={cn("border-b hairline-border bg-[var(--color-canvas)] py-8", className)}>
      <Container>
        {breadcrumbs && <div className="mb-4">{breadcrumbs}</div>}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            {eyebrow && (
              <p className="text-xs font-mono font-medium uppercase tracking-widest text-[var(--color-mute)] mb-2">
                {eyebrow}
              </p>
            )}
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-[var(--color-ink)]">
              {title}
            </h1>
            {description && (
              <p className="mt-2 text-[var(--color-body)] text-sm sm:text-base max-w-2xl">
                {description}
              </p>
            )}
          </div>
          {actions && (
            <div className="flex items-center gap-3 flex-shrink-0">{actions}</div>
          )}
        </div>
      </Container>
    </div>
  )
}
