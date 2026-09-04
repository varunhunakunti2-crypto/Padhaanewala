import { ShieldCheck, Layers, HeartHandshake, Bot, ArrowUpRight } from "lucide-react";
import { Card } from "@/components/ui/card";
import { SectionHeading } from "@/components/home/section-heading";
import { EmptyState } from "@/components/home/empty-state";
import type { WhyUsItem } from "@/types/homepage";

const ICONS: Record<string, React.ComponentType<{ className?: string }>> = {
  shield: ShieldCheck,
  layers: Layers,
  heart: HeartHandshake,
  bot: Bot,
};

export function WhyUs({
  items,
  title = "Why Padhaanewala",
  eyebrow = "Built for students",
}: {
  items: WhyUsItem[];
  title?: string;
  eyebrow?: string;
}) {
  return (
    <section className="w-full border-t border-hairline py-3xl">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <SectionHeading eyebrow={eyebrow} title={title} description="Everything on one platform — grounded in verified data, guided by real counsellors." />
        {!items.length ? (
          <EmptyState message="Why Padhaanewala content will appear here once configured." />
        ) : (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {items.map((item) => {
              const Icon = ICONS[item.icon ?? ""] ?? ArrowUpRight;
              return (
                <Card key={item.title} className="h-full p-6">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full border border-hairline bg-canvas">
                    <Icon className="h-5 w-5 text-ink" aria-hidden />
                  </div>
                  <h3 className="mt-4 font-geist-sans text-[20px] font-semibold leading-7 tracking-[-0.4px] text-ink">
                    {item.title}
                  </h3>
                  <p className="mt-1 text-[14px] leading-5 text-body">{item.description}</p>
                </Card>
              );
            })}
          </div>
        )}
      </div>
    </section>
  );
}