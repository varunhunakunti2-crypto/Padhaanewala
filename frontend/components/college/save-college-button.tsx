"use client"

import * as React from "react"
import { Check, Bookmark } from "lucide-react"
import { Button } from "@/components/ui/button"
import { toggleSaved, useSavedSlugs } from "@/lib/shortlist"

interface SaveCollegeButtonProps {
  slug: string
  name: string
  className?: string
}

export function SaveCollegeButton({ slug, name, className }: SaveCollegeButtonProps) {
  const savedSlugs = useSavedSlugs()
  const saved = savedSlugs.includes(slug)

  const onToggle = React.useCallback(() => {
    toggleSaved(slug)
  }, [slug])

  return (
    <Button
      type="button"
      variant={saved ? "secondary" : "ghost-sm"}
      className={className}
      aria-pressed={saved}
      title={
        saved
          ? `${name} is in your saved list`
          : `Save ${name} to your shortlist (stored on this device)`
      }
      onClick={onToggle}
    >
      {saved ? <Check className="h-4 w-4" aria-hidden /> : <Bookmark className="h-4 w-4" aria-hidden />}
      {saved ? "Saved" : "Save College"}
    </Button>
  )
}