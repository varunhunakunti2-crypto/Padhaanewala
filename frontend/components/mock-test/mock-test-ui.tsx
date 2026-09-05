"use client"

import * as React from "react"
import { cn } from "@/lib/utils"
import { Clock, CheckCircle2, XCircle } from "lucide-react"
import { Badge } from "@/components/ui/badge"

interface QuestionNavProps {
  total: number
  current: number
  answered: Set<number>
  flagged?: Set<number>
  onNavigate: (index: number) => void
}

export function QuestionNav({
  total,
  current,
  answered,
  flagged,
  onNavigate,
}: QuestionNavProps) {
  return (
    <div className="bg-[var(--color-canvas-elevated)] rounded-lg hairline-border p-4">
      <p className="text-xs font-semibold text-[var(--color-mute)] mb-3">Questions</p>
      <div className="grid grid-cols-5 gap-1.5">
        {Array.from({ length: total }).map((_, i) => (
          <button
            key={i}
            onClick={() => onNavigate(i)}
            className={cn(
              "h-8 w-8 rounded-md text-xs font-medium transition-colors",
              current === i
                ? "bg-[var(--color-link)] text-white"
                : answered.has(i)
                ? "bg-emerald-100 text-emerald-800"
                : flagged?.has(i)
                ? "bg-amber-100 text-amber-800"
                : "hairline-border text-[var(--color-mute)] hover:bg-[var(--color-hairline-soft)]"
            )}
          >
            {i + 1}
          </button>
        ))}
      </div>
      <div className="mt-4 space-y-1">
        <Legend color="bg-emerald-100 text-emerald-800" label="Answered" />
        <Legend color="bg-amber-100 text-amber-800" label="Flagged" />
        <Legend color="hairline-border text-[var(--color-mute)]" label="Not answered" />
      </div>
    </div>
  )
}

function Legend({ color, label }: { color: string; label: string }) {
  return (
    <div className="flex items-center gap-2 text-xs text-[var(--color-mute)]">
      <span className={cn("inline-block h-3 w-3 rounded-sm", color)} />
      {label}
    </div>
  )
}

interface TimerProps {
  seconds: number
  warning?: boolean
}

export function TestTimer({ seconds, warning }: TimerProps) {
  const mins = Math.floor(seconds / 60)
  const secs = seconds % 60
  return (
    <div
      className={cn(
        "flex items-center gap-2 px-4 py-2 rounded-full hairline-border text-sm font-mono font-semibold",
        warning
          ? "bg-red-50 text-[var(--color-error)] border-red-200"
          : "bg-[var(--color-canvas-elevated)] text-[var(--color-ink)]"
      )}
    >
      <Clock className="h-4 w-4" />
      {String(mins).padStart(2, "0")}:{String(secs).padStart(2, "0")}
    </div>
  )
}

interface ResultCardProps {
  score: number
  total: number
  correct: number
  incorrect: number
  unattempted: number
  timeTaken: string
  rank?: number
}

export function TestResultCard({
  score,
  total,
  correct,
  incorrect,
  timeTaken,
  rank,
}: ResultCardProps) {
  const pct = Math.round((score / total) * 100)
  return (
    <div className="bg-[var(--color-canvas-elevated)] rounded-xl hairline-border overflow-hidden">
      <div className="p-6 text-center border-b hairline-border bg-gradient-to-br from-[var(--color-link-soft)] to-white">
        <p className="text-sm text-[var(--color-mute)] mb-1">Your Score</p>
        <p className="text-5xl font-bold text-[var(--color-ink)]">
          {score}<span className="text-2xl text-[var(--color-mute)]">/{total}</span>
        </p>
        <p className="text-sm text-[var(--color-mute)] mt-1">{pct}%</p>
        {rank && (
          <Badge variant="secondary" className="mt-3">
            Rank #{rank}
          </Badge>
        )}
      </div>
      <div className="grid grid-cols-3 divide-x hairline-border">
        <Stat icon={<CheckCircle2 className="h-4 w-4 text-emerald-500" />} label="Correct" value={correct} />
        <Stat icon={<XCircle className="h-4 w-4 text-[var(--color-error)]" />} label="Incorrect" value={incorrect} />
        <Stat icon={<Clock className="h-4 w-4 text-[var(--color-mute)]" />} label="Time" value={timeTaken} />
      </div>
    </div>
  )
}

function Stat({ icon, label, value }: { icon: React.ReactNode; label: string; value: React.ReactNode }) {
  return (
    <div className="p-4 text-center">
      <div className="flex justify-center mb-1">{icon}</div>
      <p className="text-base font-semibold text-[var(--color-ink)]">{value}</p>
      <p className="text-xs text-[var(--color-mute)]">{label}</p>
    </div>
  )
}
