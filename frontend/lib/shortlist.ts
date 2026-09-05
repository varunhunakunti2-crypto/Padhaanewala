// Client-side shortlist storage (localStorage) for "Save College" and
// "Compare". Unauthenticated shortlist behaviour; a DB-backed per-student
// version (student_saved_colleges) is planned once auth lands.
//
// The module doubles as a tiny external store so components can react to
// changes through React.useSyncExternalStore (no effect-driven setState).

import * as React from "react"

const SAVED_KEY = "padhaanewala:saved"
const COMPARE_KEY = "padhaanewala:compare"

export interface CompareEntry {
  slug: string
  name: string
}

export const COMPARE_LIMIT = 4

type Listener = () => void

const listeners = new Set<Listener>()

function notify() {
  for (const l of listeners) l()
}

function subscribe(listener: Listener) {
  listeners.add(listener)
  window.addEventListener("storage", listener as EventListener)
  return () => {
    listeners.delete(listener)
    window.removeEventListener("storage", listener as EventListener)
  }
}

// ─── Saved colleges ────────────────────────────────────────────────────────

let savedCache: string[] = []

function readSaved(): string[] {
  if (typeof window === "undefined") return savedCache
  try {
    savedCache = JSON.parse(window.localStorage.getItem(SAVED_KEY) ?? "[]") as string[]
  } catch {
    savedCache = []
  }
  return savedCache
}

export function getSavedSlugs(): string[] {
  return readSaved()
}

export function toggleSaved(slug: string): string[] {
  const slugs = readSaved()
  const next = slugs.includes(slug) ? slugs.filter((s) => s !== slug) : [...slugs, slug]
  try {
    window.localStorage.setItem(SAVED_KEY, JSON.stringify(next))
  } catch {
    // storage unavailable — still reflect in-memory state for this session
  }
  savedCache = next
  notify()
  return next
}

export function isSaved(slug: string): boolean {
  return readSaved().includes(slug)
}

export function useSavedSlugs(): string[] {
  return React.useSyncExternalStore(subscribe, readSaved, () => savedCache)
}

// ─── Compare list ──────────────────────────────────────────────────────────

let compareCache: CompareEntry[] = []

function readCompare(): CompareEntry[] {
  if (typeof window === "undefined") return compareCache
  try {
    compareCache = JSON.parse(window.localStorage.getItem(COMPARE_KEY) ?? "[]") as CompareEntry[]
  } catch {
    compareCache = []
  }
  return compareCache
}

export function getCompareList(): CompareEntry[] {
  return readCompare()
}

/**
 * Upsert a college into the compare list. Returns whether it was added
 * (false when already present or the cap was reached).
 */
export function upsertCompare(slug: string, name: string): boolean {
  const list = readCompare().filter((e) => e.slug !== slug)
  let added = false
  if (list.length < COMPARE_LIMIT) {
    list.push({ slug, name })
    added = true
  }
  try {
    window.localStorage.setItem(COMPARE_KEY, JSON.stringify(list))
  } catch {
    // ignore
  }
  compareCache = list
  notify()
  return added
}

export function removeCompare(slug: string): CompareEntry[] {
  const next = readCompare().filter((e) => e.slug !== slug)
  try {
    window.localStorage.setItem(COMPARE_KEY, JSON.stringify(next))
  } catch {
    // ignore
  }
  compareCache = next
  notify()
  return next
}

export function clearCompare(): void {
  try {
    window.localStorage.setItem(COMPARE_KEY, "[]")
  } catch {
    // ignore
  }
  compareCache = []
  notify()
}

export function useCompareList(): CompareEntry[] {
  return React.useSyncExternalStore(subscribe, readCompare, () => compareCache)
}