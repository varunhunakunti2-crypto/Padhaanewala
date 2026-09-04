"use client"

import * as React from "react"
import { cn } from "@/lib/utils"
import { Search, X } from "lucide-react"

interface GlobalSearchProps {
  placeholder?: string
  onSearch?: (query: string) => void
  className?: string
  size?: "sm" | "md" | "lg"
}

const sizeClasses = {
  sm: "h-9 text-sm",
  md: "h-11 text-base",
  lg: "h-14 text-lg",
}

export function GlobalSearch({
  placeholder = "Search colleges, courses, exams or locations…",
  onSearch,
  className,
  size = "md",
}: GlobalSearchProps) {
  const [value, setValue] = React.useState("")

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onSearch?.(value.trim())
  }

  const clear = () => {
    setValue("")
    onSearch?.("")
  }

  return (
    <form onSubmit={handleSubmit} className={cn("relative w-full", className)}>
      <div className="relative">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-[var(--color-mute)]" />
        <input
          type="search"
          value={value}
          onChange={(e) => setValue(e.target.value)}
          placeholder={placeholder}
          className={cn(
            "w-full pl-12 pr-12 bg-[var(--color-canvas-elevated)] hairline-border rounded-full focus:outline-none focus:ring-2 focus:ring-[var(--color-link)] focus:border-transparent placeholder:text-[var(--color-faint)] text-[var(--color-ink)]",
            sizeClasses[size]
          )}
        />
        {value && (
          <button
            type="button"
            onClick={clear}
            className="absolute right-4 top-1/2 -translate-y-1/2 text-[var(--color-mute)] hover:text-[var(--color-ink)] transition-colors"
            aria-label="Clear search"
          >
            <X className="h-4 w-4" />
          </button>
        )}
      </div>
    </form>
  )
}

interface FilterPanelProps {
  children: React.ReactNode
  title?: string
  className?: string
}

export function FilterPanel({ children, title = "Filters", className }: FilterPanelProps) {
  return (
    <aside
      className={cn(
        "bg-[var(--color-canvas-elevated)] rounded-lg hairline-border p-5",
        className
      )}
    >
      <h2 className="font-semibold text-sm text-[var(--color-ink)] mb-4">{title}</h2>
      <div className="space-y-5">{children}</div>
    </aside>
  )
}

interface FilterGroupProps {
  label: string
  children: React.ReactNode
}

export function FilterGroup({ label, children }: FilterGroupProps) {
  return (
    <div>
      <h3 className="text-xs font-semibold uppercase tracking-wider text-[var(--color-mute)] mb-2">
        {label}
      </h3>
      {children}
    </div>
  )
}
