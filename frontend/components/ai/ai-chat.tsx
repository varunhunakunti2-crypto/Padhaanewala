"use client"

import * as React from "react"
import { cn } from "@/lib/utils"
import { Bot, User, Loader2, ShieldAlert } from "lucide-react"

interface ChatMessage {
  id: string
  role: "user" | "assistant"
  content: string
  sources?: { label: string; date?: string }[]
  isStreaming?: boolean
}

interface AIChatBubbleProps {
  message: ChatMessage
  className?: string
}

export function AIChatBubble({ message, className }: AIChatBubbleProps) {
  const isAssistant = message.role === "assistant"

  return (
    <div
      className={cn(
        "flex gap-3",
        isAssistant ? "items-start" : "items-start flex-row-reverse",
        className
      )}
    >
      {/* Avatar */}
      <div
        className={cn(
          "flex-shrink-0 h-8 w-8 rounded-full flex items-center justify-center",
          isAssistant
            ? "bg-[var(--color-link)] text-white"
            : "bg-[var(--color-hairline-soft)] text-[var(--color-body)]"
        )}
      >
        {isAssistant ? <Bot className="h-4 w-4" /> : <User className="h-4 w-4" />}
      </div>

      {/* Bubble */}
      <div className={cn("max-w-[80%]", isAssistant ? "" : "items-end")}>
        <div
          className={cn(
            "rounded-2xl px-4 py-3 text-sm leading-relaxed",
            isAssistant
              ? "bg-[var(--color-canvas-elevated)] hairline-border text-[var(--color-body)] rounded-tl-sm"
              : "bg-[var(--color-link)] text-white rounded-tr-sm"
          )}
        >
          {message.isStreaming ? (
            <span className="inline-flex items-center gap-1">
              <Loader2 className="h-3 w-3 animate-spin" />
              Thinking…
            </span>
          ) : (
            message.content
          )}
        </div>

        {/* Sources */}
        {isAssistant && message.sources && message.sources.length > 0 && (
          <div className="mt-1.5 flex flex-wrap gap-1.5">
            {message.sources.map((src, i) => (
              <span
                key={i}
                className="text-[10px] px-2 py-0.5 rounded-full bg-[var(--color-hairline-soft)] text-[var(--color-mute)] hairline-border"
              >
                {src.label}
                {src.date && ` · ${src.date}`}
              </span>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

export function AIDisclaimer({ className }: { className?: string }) {
  return (
    <div
      className={cn(
        "flex items-start gap-2 text-xs text-[var(--color-mute)] p-3 rounded-lg bg-[var(--color-hairline-soft)] hairline-border",
        className
      )}
    >
      <ShieldAlert className="h-4 w-4 flex-shrink-0 mt-0.5" />
      <p>
        Responses are based on our verified database. This is for guidance only and is not an
        admission guarantee. Always verify details with the institution.
      </p>
    </div>
  )
}

interface SuggestedQuestionsProps {
  questions: string[]
  onSelect: (q: string) => void
}

export function SuggestedQuestions({ questions, onSelect }: SuggestedQuestionsProps) {
  return (
    <div className="flex flex-wrap gap-2">
      {questions.map((q, i) => (
        <button
          key={i}
          onClick={() => onSelect(q)}
          className="text-xs px-3 py-1.5 rounded-full hairline-border bg-[var(--color-canvas-elevated)] hover:bg-[var(--color-link-soft)] hover:text-[var(--color-link-deep)] transition-colors text-[var(--color-body)]"
        >
          {q}
        </button>
      ))}
    </div>
  )
}
