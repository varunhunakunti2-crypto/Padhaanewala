import * as React from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"

export function Navbar() {
  return (
    <header className="sticky top-0 z-50 w-full border-b border-hairline bg-canvas">
      <div className="mx-auto flex h-14 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        <div className="flex items-center gap-6">
          <Link href="/" className="flex items-center gap-2">
            {/* Simple geometric logo placeholder */}
            <div className="h-6 w-6 rounded-full bg-gradient-to-tr from-gradient-develop-start to-gradient-preview-end" />
            <span className="font-geist-sans text-[16px] font-semibold tracking-tight text-ink">
              Padhaanewala
            </span>
          </Link>
          <nav className="hidden md:flex items-center gap-1">
            <Link
              href="/courses"
              className="rounded-full px-3 py-1.5 text-[14px] font-medium text-body transition-colors hover:text-ink"
            >
              Courses
            </Link>
            <Link
              href="/colleges"
              className="rounded-full px-3 py-1.5 text-[14px] font-medium text-body transition-colors hover:text-ink"
            >
              Colleges
            </Link>
            <Link
              href="/mock-tests"
              className="rounded-full px-3 py-1.5 text-[14px] font-medium text-body transition-colors hover:text-ink"
            >
              Mock Tests
            </Link>
          </nav>
        </div>
        <div className="flex items-center gap-3">
          <Button variant="ghost-sm" className="hidden sm:inline-flex">
            Log In
          </Button>
          <Button variant="primary-sm">Sign Up</Button>
        </div>
      </div>
    </header>
  )
}
