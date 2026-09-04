import Link from "next/link";
import {
  Building2,
  Scale,
  Sparkles,
  BadgeIndianRupee,
  ClipboardPen,
  Headset,
  ArrowUpRight,
} from "lucide-react";
import { Card } from "@/components/ui/card";
import type { QuickActionItem } from "@/types/homepage";

const ICONS: Record<string, React.ComponentType<{ className?: string }>> = {
  building: Building2,
  scale: Scale,
  sparkles: Sparkles,
  rupee: BadgeIndianRupee,
  pen: ClipboardPen,
  headset: Headset,
};

export function QuickActions({ items }: { items: QuickActionItem[] }) {
  if (!items.length) return null;
  return (
    <section className="w-full border-t border-hairline py-3xl">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {items.map((item) => {
            const Icon = ICONS[item.icon ?? ""] ?? ArrowUpRight;
            return (
              <Link key={`${item.label}-${item.href}`} href={item.href} className="group">
                <Card className="h-full p-6 transition-colors hover:bg-hairline-soft">
                  <div className="flex items-start justify-between">
                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-canvas border-hairline border">
                      <Icon className="h-5 w-5 text-ink" aria-hidden />
                    </div>
                    <ArrowUpRight
                      className="h-4 w-4 text-mute transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5"
                      aria-hidden
                    />
                  </div>
                  <h3 className="mt-4 font-geist-sans text-[20px] font-semibold leading-7 tracking-[-0.4px] text-ink">
                    {item.label}
                  </h3>
                  {item.description ? (
                    <p className="mt-1 text-[14px] leading-5 text-body">{item.description}</p>
                  ) : null}
                </Card>
              </Link>
            );
          })}
        </div>
      </div>
    </section>
  );
}