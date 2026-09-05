"use client"

import { useRouter } from "next/navigation"
import { GitCompareArrows } from "lucide-react"
import { Button } from "@/components/ui/button"
import { COMPARE_LIMIT, upsertCompare, useCompareList } from "@/lib/shortlist"

interface CompareButtonProps {
  slug: string
  name: string
  className?: string
}

export function CompareButton({ slug, name, className }: CompareButtonProps) {
  const router = useRouter()
  const compareList = useCompareList()
  const added = compareList.some((e) => e.slug === slug)

  const onCompare = () => {
    upsertCompare(slug, name)
    router.push("/compare")
  }

  return (
    <Button
      type="button"
      variant={added ? "secondary" : "ghost-sm"}
      className={className}
      title={
        added
          ? `${name} is already in your compare list`
          : `Add ${name} to compare (up to ${COMPARE_LIMIT})`
      }
      onClick={onCompare}
    >
      <GitCompareArrows className="h-4 w-4" aria-hidden />
      Compare
    </Button>
  )
}