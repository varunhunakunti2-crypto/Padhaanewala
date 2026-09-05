"use client";

import Link from "next/link";

export function HomepageError() {
  return (
    <div className="flex min-h-[60vh] flex-col items-center justify-center px-4 text-center">
      <h2 className="text-2xl font-bold text-ink">Something went wrong</h2>
      <p className="mt-3 text-body">We could not load the homepage. Please try again.</p>
      <button
        onClick={() => window.location.reload()}
        className="mt-6 rounded-full bg-link px-6 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-link/90"
      >
        Retry
      </button>
      <Link href="/colleges" className="mt-3 text-sm text-link underline">
        Browse colleges instead
      </Link>
    </div>
  );
}
