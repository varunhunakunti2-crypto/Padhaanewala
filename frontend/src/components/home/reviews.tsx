import type { ReviewItem } from "@/types/homepage";

export function Reviews({ reviews }: { reviews: ReviewItem[] }) {
  if (!reviews.length) return null;
  return (
    <section className="w-full bg-canvas py-16">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <h2 className="mb-8 text-2xl font-bold text-ink">Student Reviews</h2>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {reviews.map((r) => (
            <div key={r.id} className="rounded-xl border border-hairline bg-canvas-elevated p-5">
              <div className="flex items-center gap-2">
                <span className="text-sm font-bold text-link">{r.rating}/5</span>
                <span className="text-sm text-mute">— {r.college_name}</span>
              </div>
              {r.title && <h3 className="mt-2 font-medium text-ink">{r.title}</h3>}
              {r.content && <p className="mt-1 text-sm text-body line-clamp-3">{r.content}</p>}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
