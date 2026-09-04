import * as React from "react"
import { Slot } from "@radix-ui/react-slot"
import { cva, type VariantProps } from "class-variance-authority"
import { cn } from "@/lib/utils"

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0",
  {
    variants: {
      variant: {
        default:
          "bg-primary text-on-primary font-medium",
        primary:
          "bg-primary text-on-primary font-medium",
        secondary:
          "bg-canvas-elevated text-ink font-medium hover:bg-hairline-soft",
        "ghost-sm":
          "bg-canvas-elevated text-ink font-medium hairline-border hover:bg-hairline-soft",
        "primary-sm":
          "bg-primary text-on-primary font-medium",
        "category-pill":
          "bg-canvas-elevated text-ink font-medium hover:bg-hairline-soft",
        "icon-circular":
          "bg-canvas-elevated text-ink hairline-border hover:bg-hairline-soft p-0",
      },
      size: {
        default: "h-9 px-4 py-2",
        lg: "h-10 px-14 py-0 text-[16px] leading-[20px]", // 0px 14px horizontal only conceptually
        md: "h-8 px-6 py-0 text-[14px] leading-[20px]",  // nav controls
        icon: "h-9 w-9",
      },
      shape: {
        default: "rounded-md",
        pill: "rounded-pill",
        "pill-category": "rounded-pill-category",
        sm: "rounded-sm",
        full: "rounded-full",
      }
    },
    compoundVariants: [
      { variant: "primary", className: "px-[14px] rounded-pill text-[16px]" },
      { variant: "secondary", className: "px-[14px] rounded-pill text-[16px]" },
      { variant: "primary-sm", className: "px-[6px] rounded-sm text-[14px]" },
      { variant: "ghost-sm", className: "px-[6px] rounded-sm text-[14px]" },
      { variant: "category-pill", className: "px-[16px] rounded-pill-category text-[14px]" },
      { variant: "icon-circular", className: "h-8 w-8 rounded-full flex items-center justify-center" }
    ],
    defaultVariants: {
      variant: "default",
      size: "default",
      shape: "default"
    },
  }
)

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, shape, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : "button"
    return (
      <Comp
        className={cn(buttonVariants({ variant, size, shape, className }))}
        ref={ref}
        {...props}
      />
    )
  }
)
Button.displayName = "Button"

export { Button, buttonVariants }
