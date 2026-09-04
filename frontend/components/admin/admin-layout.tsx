import * as React from "react"
import { cn } from "@/lib/utils"
import { Container } from "@/components/layout/container"

interface AdminLayoutProps {
  children: React.ReactNode
  sidebar?: React.ReactNode
  className?: string
}

export function AdminLayout({ children, sidebar, className }: AdminLayoutProps) {
  return (
    <div className={cn("flex min-h-screen bg-[var(--color-canvas)]", className)}>
      {sidebar && (
        <aside className="hidden lg:flex w-64 flex-shrink-0 border-r hairline-border bg-[var(--color-canvas-elevated)] flex-col">
          {sidebar}
        </aside>
      )}
      <main className="flex-1 overflow-auto">
        <Container size="full" className="py-6">
          {children}
        </Container>
      </main>
    </div>
  )
}

interface AdminDataTableHeaderProps {
  title: string
  description?: string
  actions?: React.ReactNode
}

export function AdminDataTableHeader({ title, description, actions }: AdminDataTableHeaderProps) {
  return (
    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
      <div>
        <h2 className="text-lg font-semibold text-[var(--color-ink)]">{title}</h2>
        {description && <p className="text-sm text-[var(--color-mute)] mt-0.5">{description}</p>}
      </div>
      {actions && <div className="flex items-center gap-3">{actions}</div>}
    </div>
  )
}

interface StatCardProps {
  label: string
  value: string | number
  change?: string
  changeType?: "up" | "down" | "neutral"
  icon?: React.ReactNode
}

export function StatCard({ label, value, change, changeType = "neutral", icon }: StatCardProps) {
  const changeColor = changeType === "up" ? "text-emerald-600" : changeType === "down" ? "text-[var(--color-error)]" : "text-[var(--color-mute)]"
  return (
    <div className="bg-[var(--color-canvas-elevated)] rounded-lg hairline-border p-5">
      <div className="flex items-center justify-between mb-3">
        <p className="text-sm text-[var(--color-mute)]">{label}</p>
        {icon && <span className="text-[var(--color-mute)]">{icon}</span>}
      </div>
      <p className="text-2xl font-bold text-[var(--color-ink)]">{value}</p>
      {change && <p className={cn("text-xs mt-1", changeColor)}>{change}</p>}
    </div>
  )
}
