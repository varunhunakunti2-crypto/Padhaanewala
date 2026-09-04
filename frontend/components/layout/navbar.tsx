import Link from "next/link";
import { Button } from "../ui/button";

export function Navbar() {
  return (
    <nav className="border-b hairline-border bg-[var(--color-canvas)] sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16 items-center">
          <div className="flex-shrink-0 flex items-center">
            <Link href="/" className="text-xl font-bold tracking-tight text-[var(--color-ink)]">
              Padhaanewala
            </Link>
          </div>
          <div className="hidden md:flex space-x-8">
            <Link href="/colleges" className="text-[var(--color-body)] hover:text-[var(--color-ink)] transition-colors px-3 py-2 rounded-full text-sm">
              Colleges
            </Link>
            <Link href="/courses" className="text-[var(--color-body)] hover:text-[var(--color-ink)] transition-colors px-3 py-2 rounded-full text-sm">
              Courses
            </Link>
            <Link href="/scholarships" className="text-[var(--color-body)] hover:text-[var(--color-ink)] transition-colors px-3 py-2 rounded-full text-sm">
              Scholarships
            </Link>
            <Link href="/exams" className="text-[var(--color-body)] hover:text-[var(--color-ink)] transition-colors px-3 py-2 rounded-full text-sm">
              Exams
            </Link>
          </div>
          <div className="flex items-center space-x-2">
            <Link href="/login">
              <Button variant="ghost-sm">Log In</Button>
            </Link>
            <Link href="/register">
              <Button variant="primary-sm">Sign Up</Button>
            </Link>
          </div>
        </div>
      </div>
    </nav>
  );
}
