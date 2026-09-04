import * as React from "react"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

export function Pagination({ className, currentPage, totalPages, onPageChange }: { 
  className?: string, 
  currentPage: number, 
  totalPages: number,
  onPageChange: (page: number) => void 
}) {
  return (
    <div className={cn("flex items-center justify-between px-4 py-3 sm:px-6", className)}>
      <div className="flex flex-1 justify-between sm:hidden">
        <Button variant="ghost-sm" disabled={currentPage === 1} onClick={() => onPageChange(currentPage - 1)}>
          Previous
        </Button>
        <Button variant="ghost-sm" disabled={currentPage === totalPages} onClick={() => onPageChange(currentPage + 1)}>
          Next
        </Button>
      </div>
      <div className="hidden sm:flex sm:flex-1 sm:items-center sm:justify-between">
        <div>
          <p className="text-[14px] text-body">
            Showing page <span className="font-medium text-ink">{currentPage}</span> of{" "}
            <span className="font-medium text-ink">{totalPages}</span>
          </p>
        </div>
        <div>
          <nav className="isolate inline-flex -space-x-px rounded-md shadow-sm" aria-label="Pagination">
            <Button 
              variant="ghost-sm" 
              className="rounded-r-none focus:z-20"
              disabled={currentPage === 1} 
              onClick={() => onPageChange(currentPage - 1)}
            >
              Previous
            </Button>
            {/* Simple page numbers */}
            {Array.from({ length: totalPages }).map((_, i) => (
              <Button
                key={i}
                variant={currentPage === i + 1 ? "secondary" : "ghost-sm"}
                className={cn(
                  "rounded-none focus:z-20", 
                  currentPage === i + 1 ? "bg-hairline-soft" : ""
                )}
                onClick={() => onPageChange(i + 1)}
              >
                {i + 1}
              </Button>
            ))}
            <Button 
              variant="ghost-sm" 
              className="rounded-l-none focus:z-20"
              disabled={currentPage === totalPages} 
              onClick={() => onPageChange(currentPage + 1)}
            >
              Next
            </Button>
          </nav>
        </div>
      </div>
    </div>
  )
}
