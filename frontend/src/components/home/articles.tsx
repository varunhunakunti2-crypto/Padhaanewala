import type { ArticleItem } from "@/types/homepage";
import Link from "next/link";

export function Articles({ articles }: { articles: ArticleItem[] }) {
  if (!articles.length) return null;
  return (
    <section className="w-full py-16">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <h2 className="mb-8 text-2xl font-bold text-ink">Latest Articles</h2>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {articles.map((a) => (
            <Link key={a.id} href={`/blog/${a.slug}`} className="rounded-xl border border-hairline bg-canvas-elevated p-5 transition-shadow hover:shadow-md">
              <h3 className="font-semibold text-ink">{a.title}</h3>
              {a.excerpt && <p className="mt-2 text-sm text-body line-clamp-2">{a.excerpt}</p>}
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
