import type { QuickActionItem } from "@/types/homepage";
import Link from "next/link";

export function QuickActions({ items }: { items: QuickActionItem[] }) {
  if (!items.length) return null;
  return (
    <section className="w-full bg-canvas py-12">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-6">
          {items.map((item) => (
            <Link key={item.label} href={item.href} className="flex flex-col items-center gap-2 rounded-xl border border-hairline bg-canvas-elevated p-4 text-center transition-shadow hover:shadow-md">
              <span className="text-sm font-medium text-ink">{item.label}</span>
              {item.description && <span className="text-xs text-mute">{item.description}</span>}
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
