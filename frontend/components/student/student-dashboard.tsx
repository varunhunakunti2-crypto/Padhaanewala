import * as React from "react"
import { cn } from "@/lib/utils"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"

interface StudentDashboardCardProps {
  title: string
  children: React.ReactNode
  className?: string
  action?: React.ReactNode
}

export function StudentDashboardCard({ title, children, className, action }: StudentDashboardCardProps) {
  return (
    <div className={cn("bg-[var(--color-canvas-elevated)] rounded-lg hairline-border", className)}>
      <div className="flex items-center justify-between px-5 py-4 border-b hairline-border">
        <h3 className="font-semibold text-sm text-[var(--color-ink)]">{title}</h3>
        {action && <div>{action}</div>}
      </div>
      <div className="p-5">{children}</div>
    </div>
  )
}

interface SavedCollegeItemProps {
  name: string
  location: string
  onRemove?: () => void
  onCompare?: () => void
}

export function SavedCollegeItem({ name, location, onRemove, onCompare }: SavedCollegeItemProps) {
  return (
    <div className="flex items-center justify-between py-3 border-b hairline-border last:border-0">
      <div>
        <p className="text-sm font-medium text-[var(--color-ink)]">{name}</p>
        <p className="text-xs text-[var(--color-mute)]">{location}</p>
      </div>
      <div className="flex gap-2">
        {onCompare && (
          <button onClick={onCompare} className="text-xs text-[var(--color-link)] hover:underline">Compare</button>
        )}
        {onRemove && (
          <button onClick={onRemove} className="text-xs text-[var(--color-error)] hover:underline">Remove</button>
        )}
      </div>
    </div>
  )
}

interface ProfileLoadingProps {
  className?: string
}

export function ProfileLoading({ className }: ProfileLoadingProps) {
  return (
    <div className={cn("space-y-4", className)}>
      <Skeleton className="h-6 w-1/3" />
      <Skeleton className="h-4 w-full" />
      <Skeleton className="h-4 w-2/3" />
    </div>
  )
}
