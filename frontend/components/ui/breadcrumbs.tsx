import * as React from "react"
import Link from "next/link"
import { cn } from "@/lib/utils"

export function Breadcrumbs({ className, children }: { className?: string, children: React.ReactNode }) {
  return (
    <nav className={cn("flex items-center text-[14px] text-mute", className)} aria-label="Breadcrumb">
      <ol className="flex items-center space-x-2">
        {children}
      </ol>
    </nav>
  )
}

export function BreadcrumbItem({ href, children, isLast }: { href?: string, children: React.ReactNode, isLast?: boolean }) {
  return (
    <li className="flex items-center">
      {href && !isLast ? (
        <Link href={href} className="hover:text-ink transition-colors">
          {children}
        </Link>
      ) : (
        <span className="text-ink font-medium">{children}</span>
      )}
      {!isLast && <span className="mx-2">/</span>}
    </li>
  )
}
