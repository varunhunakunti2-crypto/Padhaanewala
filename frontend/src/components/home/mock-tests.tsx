import type { MockTestItem } from "@/types/homepage";

export function MockTests({ tests }: { tests: MockTestItem[] }) {
  if (!tests.length) return null;
  return (
    <section className="w-full bg-canvas py-16">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <h2 className="mb-8 text-2xl font-bold text-ink">Mock Tests</h2>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {tests.map((t) => (
            <div key={t.id} className="rounded-xl border border-hairline bg-canvas-elevated p-5">
              <h3 className="font-semibold text-ink">{t.title}</h3>
              {t.description && <p className="mt-1 text-sm text-mute">{t.description}</p>}
              {t.duration_minutes && <p className="mt-2 text-xs text-body">{t.duration_minutes} min</p>}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
