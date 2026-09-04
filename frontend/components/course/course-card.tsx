import * as React from "react"
import { cn } from "@/lib/utils"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Clock, GraduationCap, Users } from "lucide-react"

export interface CourseCardData {
  id: string
  slug: string
  name: string
  degree: string
  duration: string
  eligibility: string
  collegesCount?: number
  stream?: string
}

interface CourseCardProps {
  course: CourseCardData
  className?: string
}

export function CourseCard({ course, className }: CourseCardProps) {
  return (
    <div
      className={cn(
        "bg-[var(--color-canvas-elevated)] rounded-lg hairline-border p-5 hover:shadow-md transition-shadow group",
        className
      )}
    >
      {course.stream && (
        <Badge variant="secondary" className="mb-3 text-xs">
          {course.stream}
        </Badge>
      )}
      <h3 className="font-semibold text-[var(--color-ink)] text-sm leading-snug group-hover:text-[var(--color-link)] transition-colors">
        {course.name}
      </h3>
      <p className="text-xs text-[var(--color-mute)] mt-1">{course.degree}</p>

      <div className="mt-3 space-y-1.5">
        <div className="flex items-center gap-2 text-xs text-[var(--color-body)]">
          <Clock className="h-3.5 w-3.5 text-[var(--color-mute)] flex-shrink-0" />
          <span>{course.duration}</span>
        </div>
        <div className="flex items-center gap-2 text-xs text-[var(--color-body)]">
          <GraduationCap className="h-3.5 w-3.5 text-[var(--color-mute)] flex-shrink-0" />
          <span className="line-clamp-1">{course.eligibility}</span>
        </div>
        {course.collegesCount !== undefined && (
          <div className="flex items-center gap-2 text-xs text-[var(--color-body)]">
            <Users className="h-3.5 w-3.5 text-[var(--color-mute)] flex-shrink-0" />
            <span>{course.collegesCount} colleges offering this course</span>
          </div>
        )}
      </div>

      <Button
        asChild
        variant="ghost-sm"
        className="w-full mt-4 text-xs h-8"
      >
        <a href={`/courses/${course.slug}`}>Explore Course</a>
      </Button>
    </div>
  )
}
