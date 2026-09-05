import type { WhyUsItem } from "@/types/homepage";

export function WhyUs({ items }: { items: WhyUsItem[] }) {
  if (!items.length) return null;
  return (
    <section className="w-full py-16">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <h2 className="mb-8 text-center text-2xl font-bold text-ink">Why Padhaanewala?</h2>
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {items.map((item) => (
            <div key={item.title} className="rounded-xl border border-hairline bg-canvas-elevated p-6 text-center">
              <h3 className="text-lg font-semibold text-ink">{item.title}</h3>
              <p className="mt-2 text-sm text-body">{item.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
