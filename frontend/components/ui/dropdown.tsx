"use client"

import * as React from "react"
import { ChevronDown } from "lucide-react"
import { cn } from "@/lib/utils"

interface DropdownItem {
  label: string
  href?: string
  onClick?: () => void
  disabled?: boolean
  icon?: React.ReactNode
  danger?: boolean
}

interface DropdownSeparator {
  type: "separator"
}

type DropdownMenuEntry = DropdownItem | DropdownSeparator

interface DropdownProps {
  trigger: React.ReactNode
  items: DropdownMenuEntry[]
  align?: "left" | "right"
  className?: string
}

function isSeparator(item: DropdownMenuEntry): item is DropdownSeparator {
  return (item as DropdownSeparator).type === "separator"
}

export function Dropdown({ trigger, items, align = "left", className }: DropdownProps) {
  const [open, setOpen] = React.useState(false)
  const ref = React.useRef<HTMLDivElement>(null)

  React.useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false)
      }
    }
    document.addEventListener("mousedown", handleClickOutside)
    return () => document.removeEventListener("mousedown", handleClickOutside)
  }, [])

  return (
    <div ref={ref} className={cn("relative inline-block", className)}>
      <div onClick={() => setOpen((o) => !o)} className="cursor-pointer">
        {trigger}
      </div>
      {open && (
        <div
          className={cn(
            "absolute z-50 mt-2 w-48 bg-[var(--color-canvas-elevated)] rounded-md shadow-lg hairline-border py-1 text-sm",
            align === "right" ? "right-0" : "left-0"
          )}
          role="menu"
        >
          {items.map((item, idx) => {
            if (isSeparator(item)) {
              return <div key={idx} className="my-1 border-t hairline-border" />
            }
            return (
              <button
                key={idx}
                role="menuitem"
                disabled={item.disabled}
                onClick={() => {
                  if (!item.disabled) {
                    item.onClick?.()
                    setOpen(false)
                  }
                }}
                className={cn(
                  "w-full flex items-center gap-2 px-4 py-2 text-left transition-colors",
                  item.disabled
                    ? "text-[var(--color-faint)] cursor-not-allowed"
                    : item.danger
                    ? "text-[var(--color-error)] hover:bg-[var(--color-hairline-soft)]"
                    : "text-[var(--color-body)] hover:bg-[var(--color-hairline-soft)] hover:text-[var(--color-ink)]"
                )}
              >
                {item.icon && <span className="h-4 w-4">{item.icon}</span>}
                {item.label}
              </button>
            )
          })}
        </div>
      )}
    </div>
  )
}

// Simple trigger button for use with Dropdown
export function DropdownTrigger({
  label,
  className,
}: {
  label: React.ReactNode
  className?: string
}) {
  return (
    <button
      className={cn(
        "inline-flex items-center gap-1 px-3 py-2 rounded-md text-sm font-medium text-[var(--color-body)] hover:bg-[var(--color-hairline-soft)] hairline-border transition-colors",
        className
      )}
    >
      {label}
      <ChevronDown className="h-4 w-4" />
    </button>
  )
}
