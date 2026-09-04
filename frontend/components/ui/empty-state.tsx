import * as React from "react"
import { cn } from "@/lib/utils"
import { SearchX, FolderOpen, FileSearch } from "lucide-react"
import { Button } from "./button"

interface EmptyStateProps {
  icon?: React.ReactNode
  title: string
  description?: string
  action?: {
    label: string
    onClick: () => void
  }
  className?: string
  variant?: "default" | "search" | "folder"
}

const defaultIcons = {
  default: <FileSearch className="h-12 w-12" />,
  search: <SearchX className="h-12 w-12" />,
  folder: <FolderOpen className="h-12 w-12" />,
}

export function EmptyState({
  icon,
  title,
  description,
  action,
  className,
  variant = "default",
}: EmptyStateProps) {
  const displayIcon = icon ?? defaultIcons[variant]

  return (
    <div
      className={cn(
        "flex flex-col items-center justify-center text-center py-16 px-6",
        className
      )}
    >
      <div className="text-[var(--color-hairline)] mb-4">{displayIcon}</div>
      <h3 className="text-base font-semibold text-[var(--color-ink)] mb-2">{title}</h3>
      {description && (
        <p className="text-sm text-[var(--color-mute)] max-w-sm mb-6">{description}</p>
      )}
      {action && (
        <Button variant="ghost-sm" size="md" onClick={action.onClick}>
          {action.label}
        </Button>
      )}
    </div>
  )
}
