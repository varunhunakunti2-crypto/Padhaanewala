import * as React from "react"
import { cn } from "@/lib/utils"

interface Column<T> {
  key: keyof T | string
  header: React.ReactNode
  render?: (row: T) => React.ReactNode
  className?: string
  headerClassName?: string
}

interface TableProps<T> {
  columns: Column<T>[]
  data: T[]
  keyExtractor: (row: T, idx: number) => string
  className?: string
  emptyMessage?: string
  isLoading?: boolean
}

function TableSkeleton({ rows = 5, cols = 4 }: { rows?: number; cols?: number }) {
  return (
    <>
      {Array.from({ length: rows }).map((_, r) => (
        <tr key={r} className="border-b hairline-border">
          {Array.from({ length: cols }).map((_, c) => (
            <td key={c} className="px-6 py-4">
              <div className="h-4 bg-[var(--color-hairline-soft)] rounded animate-pulse" />
            </td>
          ))}
        </tr>
      ))}
    </>
  )
}

export function Table<T>({
  columns,
  data,
  keyExtractor,
  className,
  emptyMessage = "No data available.",
  isLoading = false,
}: TableProps<T>) {
  return (
    <div className={cn("w-full overflow-x-auto rounded-lg hairline-border", className)}>
      <table className="w-full text-sm">
        <thead className="bg-[var(--color-hairline-soft)]">
          <tr>
            {columns.map((col) => (
              <th
                key={String(col.key)}
                className={cn(
                  "px-6 py-3 text-left text-xs font-semibold text-[var(--color-mute)] uppercase tracking-wider whitespace-nowrap",
                  col.headerClassName
                )}
              >
                {col.header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y hairline-border bg-[var(--color-canvas-elevated)]">
          {isLoading ? (
            <TableSkeleton rows={5} cols={columns.length} />
          ) : data.length === 0 ? (
            <tr>
              <td
                colSpan={columns.length}
                className="px-6 py-12 text-center text-[var(--color-mute)]"
              >
                {emptyMessage}
              </td>
            </tr>
          ) : (
            data.map((row, idx) => (
              <tr
                key={keyExtractor(row, idx)}
                className="hover:bg-[var(--color-hairline-soft)] transition-colors"
              >
                {columns.map((col) => (
                  <td
                    key={String(col.key)}
                    className={cn("px-6 py-4 text-[var(--color-body)]", col.className)}
                  >
                    {col.render
                      ? col.render(row)
                      : String((row as Record<string, unknown>)[col.key as string] ?? "")}
                  </td>
                ))}
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  )
}
