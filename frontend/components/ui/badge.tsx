import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"

const badgeVariants = cva(
  "inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2",
  {
    variants: {
      variant: {
        default:
          "border-transparent bg-primary text-on-primary hover:bg-primary/80",
        secondary:
          "border-transparent bg-[var(--color-hairline-soft)] text-[var(--color-ink)] hover:bg-[var(--color-hairline)]",
        outline: "text-[var(--color-ink)] hairline-border",
        "category-pill":
          "border-transparent bg-[var(--color-hairline-soft)] text-[var(--color-ink)] hover:bg-[var(--color-hairline)] rounded-pill-category px-4 py-1 text-[14px]",
        success:
          "border-transparent bg-emerald-100 text-emerald-800",
        warning:
          "border-transparent bg-[var(--color-warning-soft)] text-[var(--color-warning-deep)]",
        error:
          "border-transparent bg-red-100 text-[var(--color-error-deep)]",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
)

export interface BadgeProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof badgeVariants> {}

function Badge({ className, variant, ...props }: BadgeProps) {
  return (
    <div className={cn(badgeVariants({ variant }), className)} {...props} />
  )
}

export { Badge, badgeVariants }
