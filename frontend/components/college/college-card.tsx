import * as React from "react"
import Image from "next/image"
import { cn } from "@/lib/utils"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { MapPin, Star, BookOpen, Heart } from "lucide-react"

// Strict interface — no hardcoded data
export interface CollegeCardData {
  id: string
  slug: string
  name: string
  location: string
  state: string
  type: "government" | "private" | "deemed"
  rating?: number
  reviewCount?: number
  courses?: string[]
  feeRange?: string
  coverImage?: string
  isVerified?: boolean
}

interface CollegeCardProps {
  college: CollegeCardData
  onSave?: (id: string) => void
  onCompare?: (id: string) => void
  isSaved?: boolean
  className?: string
}

export function CollegeCard({
  college,
  onSave,
  onCompare,
  isSaved = false,
  className,
}: CollegeCardProps) {
  return (
    <div
      className={cn(
        "bg-[var(--color-canvas-elevated)] rounded-lg hairline-border overflow-hidden hover:shadow-md transition-shadow group",
        className
      )}
    >
      {/* Cover image placeholder */}
      <div className="h-36 bg-gradient-to-br from-[var(--color-link-soft)] to-[var(--color-violet-soft)] relative">
        {college.coverImage && (
          <Image
            src={college.coverImage}
            alt={college.name}
            fill
            className="object-cover"
          />
        )}
        <div className="absolute top-3 right-3 flex gap-2">
          <Badge variant={college.type === "government" ? "success" : "default"}>
            {college.type === "government" ? "Government" : college.type === "private" ? "Private" : "Deemed"}
          </Badge>
        </div>
        {/* Save button */}
        {onSave && (
          <button
            onClick={() => onSave(college.id)}
            className="absolute top-3 left-3 p-1.5 rounded-full bg-white/80 backdrop-blur-sm hover:bg-white transition-colors"
            aria-label={isSaved ? "Unsave college" : "Save college"}
          >
            <Heart
              className={cn("h-4 w-4", isSaved ? "fill-[var(--color-error)] text-[var(--color-error)]" : "text-[var(--color-mute)]")}
            />
          </button>
        )}
      </div>

      <div className="p-4">
        <h3 className="font-semibold text-[var(--color-ink)] text-sm leading-snug line-clamp-2 group-hover:text-[var(--color-link)] transition-colors">
          {college.name}
        </h3>
        <div className="flex items-center gap-1 mt-1.5 text-xs text-[var(--color-mute)]">
          <MapPin className="h-3 w-3 flex-shrink-0" />
          <span className="truncate">{college.location}, {college.state}</span>
        </div>

        {/* Rating */}
        {college.rating !== undefined && (
          <div className="flex items-center gap-1 mt-2">
            <Star className="h-3.5 w-3.5 fill-amber-400 text-amber-400" />
            <span className="text-xs font-medium text-[var(--color-ink)]">{college.rating.toFixed(1)}</span>
            {college.reviewCount && (
              <span className="text-xs text-[var(--color-mute)]">({college.reviewCount})</span>
            )}
          </div>
        )}

        {/* Courses */}
        {college.courses && college.courses.length > 0 && (
          <div className="flex items-center gap-1 mt-2">
            <BookOpen className="h-3.5 w-3.5 text-[var(--color-mute)] flex-shrink-0" />
            <span className="text-xs text-[var(--color-mute)] truncate">
              {college.courses.slice(0, 3).join(", ")}
              {college.courses.length > 3 && ` +${college.courses.length - 3} more`}
            </span>
          </div>
        )}

        {/* Fee range */}
        {college.feeRange && (
          <div className="mt-2 text-xs font-medium text-[var(--color-link)]">
            {college.feeRange}
          </div>
        )}

        {/* Actions */}
        <div className="flex gap-2 mt-4">
          <Button
            asChild
            variant="primary-sm"
            className="flex-1 text-xs h-8"
          >
            <a href={`/college/${college.slug}`}>View Details</a>
          </Button>
          {onCompare && (
            <Button
              variant="ghost-sm"
              className="text-xs h-8 px-3"
              onClick={() => onCompare(college.id)}
            >
              Compare
            </Button>
          )}
        </div>
      </div>
    </div>
  )
}
