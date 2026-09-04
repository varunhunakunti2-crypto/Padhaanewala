"use client";

import * as React from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Search, Sparkles } from "lucide-react";
import type { HeroContent } from "@/types/homepage";

export function HeroSection({ hero }: { hero: HeroContent }) {
  const [q, setQ] = React.useState("");
  return (
    <section className="relative w-full overflow-hidden bg-canvas py-section">
      {/* Mesh gradient background (single decorative system from DESIGN.md) */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 z-0 flex items-center justify-center opacity-30"
      >
        <div className="h-[600px] w-[800px] rounded-full bg-gradient-to-tr from-gradient-develop-start via-gradient-preview-start to-gradient-ship-end opacity-40 blur-3xl mix-blend-multiply" />
      </div>

      <div className="relative z-10 mx-auto flex max-w-7xl flex-col items-center px-4 text-center sm:px-6 lg:px-8">
        <Badge variant="category-pill" className="mb-6 border-hairline">
          Verified colleges · Courses · Exams · Scholarships
        </Badge>
        <h1 className="font-geist-sans text-[34px] font-semibold leading-[40px] tracking-[-1.6px] text-ink sm:text-[40px] sm:leading-[44px] lg:text-[48px] lg:leading-[48px] lg:tracking-[-2.4px] max-w-3xl mb-6">
          {hero.heading}
        </h1>
        {hero.subtitle ? (
          <p className="mb-10 max-w-2xl text-[16px] leading-6 text-body">{hero.subtitle}</p>
        ) : null}

        {/* Large search */}
        <form
          role="search"
          className="flex w-full max-w-2xl flex-col gap-3 sm:flex-row sm:items-center"
          onSubmit={(e) => {
            e.preventDefault();
            const target = q.trim() ? `/colleges?q=${encodeURIComponent(q.trim())}` : "/colleges";
            window.location.assign(target);
          }}
        >
          <div className="relative flex-1">
            <Search className="pointer-events-none absolute left-3.5 top-1/2 h-5 w-5 -translate-y-1/2 text-faint" aria-hidden />
            <Input
              type="search"
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder={hero.search_placeholder}
              aria-label={hero.search_placeholder}
              className="h-12 w-full rounded-sm pl-11 pr-3 text-[16px]"
            />
          </div>
          <Button type="submit" variant="primary" size="lg" className="h-12 shrink-0">
            {hero.search_button_label}
          </Button>
        </form>

        {/* Primary actions */}
        <div className="mt-4 flex flex-col items-center gap-3 sm:flex-row">
          <Button variant="secondary" size="lg" asChild className="h-11 px-6">
            <a href="/college-predictor">
              <Sparkles className="h-4 w-4" aria-hidden />
              {hero.predictor_button_label}
            </a>
          </Button>
        </div>
      </div>
    </section>
  );
}