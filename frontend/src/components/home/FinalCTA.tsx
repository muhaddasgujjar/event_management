"use client";

import Link from "next/link";
import { Button } from "@/components/ui/Button";

export function FinalCTA() {
  return (
    <section className="py-24 bg-surface relative overflow-hidden">
      <div className="absolute inset-0 bg-primary/20 pointer-events-none" />
      <div className="container mx-auto px-4 relative z-10 text-center max-w-3xl">
        <h2 className="text-4xl md:text-5xl font-bold font-heading text-white mb-6 leading-tight">
          Ready to Build Something <span className="text-accent">Unforgettable?</span>
        </h2>
        <p className="text-xl text-muted mb-10">
          Partner with the production team that has set the standard in Lahore for three decades.
        </p>
        <Link href="/quote">
          <Button size="lg" className="px-10 py-5 text-lg shadow-[0_0_30px_rgba(201,168,76,0.3)] hover:shadow-[0_0_40px_rgba(201,168,76,0.5)]">
            Request a Quote
          </Button>
        </Link>
      </div>
    </section>
  );
}
