import * as React from "react"
import { cn } from "@/lib/utils"

interface TypographyProps extends React.HTMLAttributes<HTMLElement> {
  children: React.ReactNode
}

export function DisplayXL({ className, children, ...props }: TypographyProps) {
  return (
    <h1
      className={cn("font-geist-sans text-[48px] font-semibold leading-[48px] tracking-[-2.4px]", className)}
      {...props}
    >
      {children}
    </h1>
  )
}

export function HeadingLG({ className, children, ...props }: TypographyProps) {
  return (
    <h2
      className={cn("font-geist-sans text-[32px] font-semibold leading-[40px] tracking-[-1.28px]", className)}
      {...props}
    >
      {children}
    </h2>
  )
}

export function HeadingMD({ className, children, ...props }: TypographyProps) {
  return (
    <h3
      className={cn("font-geist-sans text-[20px] font-semibold leading-[28px] tracking-[-0.4px]", className)}
      {...props}
    >
      {children}
    </h3>
  )
}

export function MonoEyebrow({ className, children, ...props }: TypographyProps) {
  return (
    <p
      className={cn("font-geist-mono text-[12px] font-medium leading-[16px] tracking-normal uppercase", className)}
      {...props}
    >
      {children}
    </p>
  )
}

export function BodyLG({ className, children, ...props }: TypographyProps) {
  return (
    <p className={cn("font-geist-sans text-[16px] font-normal leading-[24px] tracking-normal", className)} {...props}>
      {children}
    </p>
  )
}

export function BodyMD({ className, children, ...props }: TypographyProps) {
  return (
    <p className={cn("font-geist-sans text-[14px] font-normal leading-[20px] tracking-normal", className)} {...props}>
      {children}
    </p>
  )
}

export function BodySM({ className, children, ...props }: TypographyProps) {
  return (
    <p className={cn("font-geist-sans text-[12px] font-normal leading-[16px] tracking-normal", className)} {...props}>
      {children}
    </p>
  )
}

export function CodeText({ className, children, ...props }: TypographyProps) {
  return (
    <code className={cn("font-geist-mono text-[14px] font-normal leading-[20px] tracking-normal", className)} {...props}>
      {children}
    </code>
  )
}
