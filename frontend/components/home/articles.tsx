import Link from "next/link";
import { FileText, ArrowRight } from "lucide-react";
import { Card } from "@/components/ui/card";
import { SectionHeading } from "@/components/home/section-heading";
import { EmptyState } from "@/components/home/empty-state";
import type { ArticleItem } from "@/types/homepage";

export function Articles({
  articles,
  title = "Latest Education Articles",
  eyebrow = "From the blog",
}: {
  articles: ArticleItem[];
  title?: string;
  eyebrow?: string;
}) {
  return (
    <section className="w-full border-t border-hairline py-3xl">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex items-end justify-between gap-4">
          <SectionHeading eyebrow={eyebrow} title={title} />
          <Link href="/blog" className="hidden shrink-0 text-[14px] font-medium text-link hover:text-link-deep sm:inline-flex">
            View all articles <ArrowRight className="ml-1 h-4 w-4" aria-hidden />
          </Link>
        </div>
        {!articles.length ? (
          <EmptyState message="Education articles will appear here once published." />
        ) : (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {articles.map((a) => (
              <Link key={a.id} href={`/blog/${a.slug}`} className="group">
                <Card className="h-full p-6 transition-colors hover:bg-hairline-soft">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full border border-hairline bg-canvas">
                    <FileText className="h-5 w-5 text-ink" aria-hidden />
                  </div>
                  <h3 className="mt-4 font-geist-sans text-[16px] font-semibold leading-6 tracking-[-0.2px] text-ink group-hover:text-link">
                    {a.title}
                  </h3>
                  {a.excerpt ? (
                    <p className="mt-2 line-clamp-3 text-[13px] leading-5 text-body">{a.excerpt}</p>
                  ) : null}
                </Card>
              </Link>
            ))}
          </div>
        )}
        <div className="mt-6 sm:hidden">
          <Link href="/blog" className="inline-flex items-center text-[14px] font-medium text-link">
            View all articles <ArrowRight className="ml-1 h-4 w-4" aria-hidden />
          </Link>
        </div>
      </div>
    </section>
  );
}