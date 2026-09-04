import { Star } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { SectionHeading } from "@/components/home/section-heading";
import { EmptyState } from "@/components/home/empty-state";
import type { ReviewItem } from "@/types/homepage";

function Stars({ rating }: { rating: number }) {
  return (
    <div className="flex items-center gap-0.5" aria-label={`${rating} out of 5 stars`} role="img">
      {Array.from({ length: 5 }).map((_, i) => (
        <Star
          key={i}
          className={`h-4 w-4 ${i < rating ? "fill-ink text-ink" : "text-hairline"}`}
          aria-hidden
        />
      ))}
    </div>
  );
}

export function Reviews({
  reviews,
  title = "Student Reviews",
  eyebrow = "From real students",
}: {
  reviews: ReviewItem[];
  title?: string;
  eyebrow?: string;
}) {
  return (
    <section className="w-full border-t border-hairline py-3xl">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <SectionHeading eyebrow={eyebrow} title={title} description="Moderated reviews from approved, verified student feedback." />
        {!reviews.length ? (
          <EmptyState message="Student reviews will appear here once approved." />
        ) : (
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
            {reviews.map((r) => (
              <Card key={r.id} className="flex h-full flex-col p-6">
                <Stars rating={r.rating} />
                {r.title ? <h3 className="mt-3 font-geist-sans text-[16px] font-semibold text-ink">{r.title}</h3> : null}
                {r.content ? (
                  <p className="mt-2 line-clamp-4 text-[14px] leading-5 text-body">{r.content}</p>
                ) : null}
                <CardContent className="p-0 pt-4 mt-auto">
                  <p className="font-geist-mono text-[12px] text-mute">{r.college_name}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}