import type { UpcomingExamItem } from "@/types/homepage";

export function UpcomingExams({ exams }: { exams: UpcomingExamItem[] }) {
  if (!exams.length) return null;
  return (
    <section className="w-full py-16">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <h2 className="mb-8 text-2xl font-bold text-ink">Upcoming Exams</h2>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {exams.map((e) => (
            <div key={e.id} className="rounded-xl border border-hairline bg-canvas-elevated p-5">
              <h3 className="font-semibold text-ink">{e.name}</h3>
              <p className="mt-1 text-sm text-mute">{e.event_name}</p>
              {e.event_date && <p className="mt-2 text-sm text-body">{e.event_date}</p>}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
