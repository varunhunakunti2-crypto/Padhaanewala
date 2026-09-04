import { Skeleton } from "@/components/ui/skeleton";

export function HomepageSkeleton() {
  return (
    <div className="flex flex-col items-center">
      {/* Hero skeleton */}
      <div className="w-full bg-canvas py-section">
        <div className="mx-auto flex max-w-7xl flex-col items-center px-4 text-center sm:px-6 lg:px-8">
          <Skeleton className="h-8 w-64 rounded-full" />
          <Skeleton className="mt-6 h-12 w-full max-w-3xl" />
          <Skeleton className="mt-3 h-5 w-2/3 max-w-2xl" />
          <div className="mt-10 flex w-full max-w-2xl flex-col gap-3 sm:flex-row">
            <Skeleton className="h-12 flex-1" />
            <Skeleton className="h-12 w-28 rounded-pill" />
          </div>
        </div>
      </div>

      {/* Quick actions */}
      <div className="w-full border-t border-hairline py-3xl">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {Array.from({ length: 6 }).map((_, i) => (
              <Skeleton key={i} className="h-28 rounded-md" />
            ))}
          </div>
        </div>
      </div>

      {/* Content sections */}
      {Array.from({ length: 4 }).map((_, i) => (
        <div key={i} className="w-full border-t border-hairline py-3xl">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <Skeleton className="h-4 w-24" />
            <Skeleton className="mt-2 h-10 w-72" />
            <div className="mt-8 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
              {Array.from({ length: 4 }).map((_, j) => (
                <Skeleton key={j} className="h-40 rounded-md" />
              ))}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}