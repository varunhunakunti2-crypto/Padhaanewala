"use client";

import { AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/button";

interface HomepageErrorProps {
  message?: string;
}

export function HomepageError({
  message = "Something went wrong loading this page. Please try again.",
}: HomepageErrorProps) {
  return (
    <div className="mx-auto flex max-w-7xl flex-col items-center justify-center gap-4 px-4 py-24 text-center">
      <div className="flex h-12 w-12 items-center justify-center rounded-full border border-hairline bg-canvas-elevated">
        <AlertTriangle className="h-6 w-6 text-warning" aria-hidden />
      </div>
      <h2 className="font-geist-sans text-[24px] font-semibold tracking-[-0.4px] text-ink">
        Something went wrong
      </h2>
      <p className="max-w-md text-[14px] text-body">{message}</p>
      <Button variant="secondary" onClick={() => window.location.reload()} className="mt-2">
        Try again
      </Button>
    </div>
  );
}