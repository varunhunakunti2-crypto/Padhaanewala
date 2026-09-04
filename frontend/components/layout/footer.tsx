import * as React from "react"
import Link from "next/link"

export function Footer() {
  return (
    <footer className="border-t border-hairline bg-canvas">
      <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
        <div className="grid grid-cols-2 gap-8 md:grid-cols-4 lg:grid-cols-5">
          <div className="col-span-2 lg:col-span-2">
            <Link href="/" className="flex items-center gap-2 mb-4">
              <div className="h-6 w-6 rounded-full bg-gradient-to-tr from-gradient-develop-start to-gradient-preview-end" />
              <span className="font-geist-sans text-[16px] font-semibold tracking-tight text-ink">
                Padhaanewala
              </span>
            </Link>
            <p className="text-[14px] text-body mb-6 max-w-xs">
              The modern EdTech platform empowering students to find the best colleges and master new courses.
            </p>
          </div>
          <div>
            <h3 className="font-geist-mono text-[12px] font-medium uppercase tracking-wider text-ink mb-4">
              Platform
            </h3>
            <ul className="flex flex-col space-y-3">
              <li>
                <Link href="/courses" className="text-[14px] text-body hover:text-ink transition-colors">Courses</Link>
              </li>
              <li>
                <Link href="/colleges" className="text-[14px] text-body hover:text-ink transition-colors">Colleges</Link>
              </li>
              <li>
                <Link href="/mock-tests" className="text-[14px] text-body hover:text-ink transition-colors">Mock Tests</Link>
              </li>
            </ul>
          </div>
          <div>
            <h3 className="font-geist-mono text-[12px] font-medium uppercase tracking-wider text-ink mb-4">
              Resources
            </h3>
            <ul className="flex flex-col space-y-3">
              <li>
                <Link href="/docs" className="text-[14px] text-body hover:text-ink transition-colors">Documentation</Link>
              </li>
              <li>
                <Link href="/blog" className="text-[14px] text-body hover:text-ink transition-colors">Blog</Link>
              </li>
              <li>
                <Link href="/support" className="text-[14px] text-body hover:text-ink transition-colors">Support</Link>
              </li>
            </ul>
          </div>
          <div>
            <h3 className="font-geist-mono text-[12px] font-medium uppercase tracking-wider text-ink mb-4">
              Legal
            </h3>
            <ul className="flex flex-col space-y-3">
              <li>
                <Link href="/privacy" className="text-[14px] text-body hover:text-ink transition-colors">Privacy Policy</Link>
              </li>
              <li>
                <Link href="/terms" className="text-[14px] text-body hover:text-ink transition-colors">Terms of Service</Link>
              </li>
            </ul>
          </div>
        </div>
        <div className="mt-16 flex flex-col items-center justify-between border-t border-hairline pt-8 md:flex-row">
          <p className="text-[14px] text-mute">
            &copy; {new Date().getFullYear()} Padhaanewala. All rights reserved.
          </p>
          <div className="mt-4 flex space-x-6 md:mt-0">
            {/* Social links placeholder */}
          </div>
        </div>
      </div>
    </footer>
  )
}
