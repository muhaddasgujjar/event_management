"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { Crosshair, ShieldCheck, Diamond, PackageOpen, Wrench, Clock } from "lucide-react";
import { Button } from "@/components/ui/Button";

// Assuming Next.js app directory handles metadata separately, we usually export it in page.tsx if Server Component.
// Since this is "use client" for Framer Motion, we should separate layout/metadata, 
// but Next.js allows metadata in layout or page if it's not a client component.
// To keep it simple, I'll make a wrapper page or just export metadata in layout. 
// I'll skip metadata here or add it in a layout.tsx for about if needed, or just let it use default.
// Wait, the spec says "Every public page must export generateMetadata (or a static metadata object)".
// If I use "use client", I cannot export metadata from the same file in Next.js.
// So I will make page.tsx a Server Component that imports a Client Component.

// This file will be the Client component `client.tsx` and I'll create a Server `page.tsx` next.

export function AboutClient() {
  const values = [
    { title: "Precision", desc: "Every pixel mapped perfectly, every decibel calibrated.", icon: <Crosshair className="w-8 h-8" /> },
    { title: "Reliability", desc: "Zero tolerance for equipment failure. On-time, every time.", icon: <ShieldCheck className="w-8 h-8" /> },
    { title: "Excellence", desc: "Delivering an uncompromising standard of quality.", icon: <Diamond className="w-8 h-8" /> },
  ];

  const differentiators = [
    { title: "We Own All Equipment", desc: "No sub-renting delays or markups.", icon: <PackageOpen className="w-6 h-6" /> },
    { title: "No Middlemen", desc: "Direct communication with the technical teams.", icon: <Wrench className="w-6 h-6" /> },
    { title: "On-Site Engineers", desc: "Expert support stays until the event ends.", icon: <Clock className="w-6 h-6" /> },
  ];

  return (
    <div className="pt-20">
      {/* Hero */}
      <section className="bg-surface border-b border-white/5 py-24 relative overflow-hidden">
        <div className="absolute inset-0 bg-primary/30 mix-blend-multiply" />
        <div className="container mx-auto px-4 max-w-4xl text-center relative z-10">
          <motion.h1 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-4xl md:text-6xl font-bold font-heading text-white mb-6"
          >
            About H&B Event Solution
          </motion.h1>
          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-xl text-muted leading-relaxed"
          >
            Setting the standard for premium event production in Lahore for over 30 years.
          </motion.p>
        </div>
      </section>

      {/* Origin Story */}
      <section className="py-24">
        <div className="container mx-auto px-4 max-w-5xl">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-16 items-center">
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
            >
              <h2 className="text-sm font-bold text-accent uppercase tracking-widest mb-4">Our Origin Story</h2>
              <h3 className="text-3xl md:text-4xl font-bold font-heading text-white mb-6">Founded on a Promise of Perfection</h3>
              <div className="space-y-4 text-muted leading-relaxed">
                <p>
                  H&B Event Solution was founded 30 years ago in Lahore with a simple but unyielding philosophy: event production should be flawless. In an industry plagued by sub-contractors, faulty rentals, and missed deadlines, we decided to do things differently.
                </p>
                <p>
                  We invested heavily in owning our own inventory of high-end SMD screens, professional line-array sound systems, and a dedicated 3D stall fabrication workshop. By eliminating middlemen, we guarantee the quality of every component that reaches your venue.
                </p>
              </div>
            </motion.div>
            <motion.div
              initial={{ opacity: 0, x: 30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              className="bg-surface-2 border border-white/5 p-8 rounded-2xl relative"
            >
              <div className="absolute -top-4 -left-4 w-24 h-24 bg-accent/10 rounded-full blur-2xl"></div>
              <h4 className="text-2xl font-bold font-heading text-white mb-4 relative z-10">Mission Statement</h4>
              <p className="text-xl text-accent-light/90 italic leading-relaxed relative z-10">
                "To empower organizations to deliver unforgettable experiences by providing rock-solid technical infrastructure and unparalleled on-site engineering."
              </p>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Core Values */}
      <section className="py-24 bg-surface border-y border-white/5">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl md:text-4xl font-bold font-heading text-center text-white mb-16">Our Core Values</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {values.map((val, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="bg-primary border border-white/5 p-8 rounded-2xl text-center flex flex-col items-center"
              >
                <div className="w-16 h-16 bg-accent/10 text-accent rounded-full flex items-center justify-center mb-6">
                  {val.icon}
                </div>
                <h3 className="text-xl font-bold text-white mb-3">{val.title}</h3>
                <p className="text-muted">{val.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Differentiators */}
      <section className="py-24">
        <div className="container mx-auto px-4 max-w-4xl text-center">
          <h2 className="text-3xl md:text-4xl font-bold font-heading text-white mb-12">What Makes Us Different</h2>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-8">
            {differentiators.map((diff, i) => (
              <div key={i} className="flex flex-col items-center">
                <div className="mb-4 text-accent">{diff.icon}</div>
                <h4 className="text-lg font-bold text-white mb-2">{diff.title}</h4>
                <p className="text-sm text-muted">{diff.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 30 Years Strip */}
      <section className="bg-accent text-primary py-12">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl md:text-4xl font-bold font-heading tracking-tight">30 Years of Excellence. Thousands of Events. Zero Compromises.</h2>
        </div>
      </section>

      {/* Final CTA */}
      <section className="py-24 text-center">
        <div className="container mx-auto px-4 max-w-2xl">
          <h2 className="text-4xl font-bold font-heading text-white mb-6">Experience the Difference</h2>
          <p className="text-xl text-muted mb-10">Stop worrying about the technical details. Leave it to the veterans.</p>
          <Link href="/quote">
            <Button size="lg" className="px-10 py-5">Start Your Quote Now</Button>
          </Link>
        </div>
      </section>
    </div>
  );
}
