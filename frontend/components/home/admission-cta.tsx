import { Headset } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { CTAContent } from "@/types/homepage";

export function AdmissionCTA({ cta }: { cta: CTAContent }) {
  return (
    <section className="w-full border-t border-hairline py-4xl">
      <div className="mx-auto flex max-w-7xl flex-col items-center px-4 text-center sm:px-6 lg:px-8">
        <div className="flex h-12 w-12 items-center justify-center rounded-full border border-hairline bg-canvas-elevated">
          <Headset className="h-6 w-6 text-ink" aria-hidden />
        </div>
        <h2 className="mt-6 font-geist-sans text-[32px] font-semibold leading-[40px] tracking-[-1.28px] text-ink sm:text-[40px] sm:leading-[44px]">
          {cta.title || "Confused about admission?"}
        </h2>
        <p className="mt-3 max-w-xl text-[16px] leading-6 text-body">
          {cta.subtitle ||
            "Share your details and our counsellor will contact you with free admission guidance."}
        </p>
        <Button variant="primary" size="lg" className="mt-8 h-12 px-8">
          <a href={cta.button_href || "/contact"} className="inline-flex items-center gap-2">
            {cta.button_label || "Get Admission Assistance"}
          </a>
        </Button>
      </div>
    </section>
  );
}