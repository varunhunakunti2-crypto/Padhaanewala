import type { ScholarshipSummary } from "@/types/homepage";

export function Scholarships({ scholarships }: { scholarships: ScholarshipSummary[] }) {
  if (!scholarships.length) return null;
  return (
    <section className="w-full bg-canvas py-16">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <h2 className="mb-8 text-2xl font-bold text-ink">Scholarships</h2>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {scholarships.map((s) => (
            <div key={s.id} className="rounded-xl border border-hairline bg-canvas-elevated p-5">
              <h3 className="font-semibold text-ink">{s.name}</h3>
              <p className="mt-1 text-sm text-mute">{s.provider_name}</p>
              {s.amount && <p className="mt-2 text-sm font-medium text-link">₹{s.amount.toLocaleString()}</p>}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
