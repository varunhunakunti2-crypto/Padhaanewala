import type { CTAContent } from "@/types/homepage";
import Link from "next/link";

export function AdmissionCTA({ cta }: { cta: CTAContent }) {
  if (!cta.title && !cta.subtitle) return null;
  return (
    <section className="w-full bg-gradient-to-r from-[#1e293b] to-[#334155] py-16">
      <div className="mx-auto max-w-3xl px-4 text-center sm:px-6">
        <h2 className="text-3xl font-bold text-white">{cta.title}</h2>
        {cta.subtitle && <p className="mt-4 text-lg text-slate-300">{cta.subtitle}</p>}
        <Link href={cta.button_href} className="mt-8 inline-block rounded-full bg-white px-8 py-3 text-sm font-semibold text-slate-900 transition-colors hover:bg-slate-200">
          {cta.button_label}
        </Link>
      </div>
    </section>
  );
}
