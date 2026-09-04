import * as React from "react"
import { cn } from "@/lib/utils"

interface RadioProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string
}

const Radio = React.forwardRef<HTMLInputElement, RadioProps>(
  ({ className, label, id, ...props }, ref) => {
    return (
      <label className="inline-flex items-center gap-2 cursor-pointer" htmlFor={id}>
        <input
          type="radio"
          id={id}
          className={cn(
            "h-4 w-4 text-[var(--color-link)] border-[var(--color-hairline)] focus:ring-[var(--color-link)]",
            className
          )}
          ref={ref}
          {...props}
        />
        {label && (
          <span className="text-sm text-[var(--color-body)]">{label}</span>
        )}
      </label>
    )
  }
)
Radio.displayName = "Radio"

export { Radio }
