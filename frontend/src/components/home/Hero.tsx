"use client";

import Image from "next/image";
import Link from "next/link";
import { motion, useScroll, useTransform, useReducedMotion } from "framer-motion";
import { Button } from "@/components/ui/Button";

export function Hero() {
  const { scrollY } = useScroll();
  const prefersReducedMotion = useReducedMotion();
  const y = useTransform(scrollY, [0, 500], [0, 150]);
  
  const headline = "30 Years. Zero Compromises.";
  const words = headline.split(" ");

  const wordVariants = prefersReducedMotion ? {
    hidden: { opacity: 0 },
    visible: { opacity: 1 },
  } : {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 },
  };

  return (
    <section className="relative w-full h-[95vh] min-h-[600px] flex items-center overflow-hidden pt-20">
      <motion.div 
        className="absolute inset-0 z-0"
        style={prefersReducedMotion ? {} : { y }}
      >
        <Image
          src="/images/hero.png"
          alt="Premium Event Production Stage"
          fill
          className="object-cover object-center"
          priority
        />
        <div className="absolute inset-0 bg-primary/80 mix-blend-multiply" />
        <div className="absolute inset-0 bg-gradient-to-t from-primary via-primary/50 to-transparent" />
        {/* Grain Overlay */}
        <div className="absolute inset-0 opacity-[0.03] mix-blend-overlay" style={{ backgroundImage: "url('data:image/svg+xml,%3Csvg viewBox=%220 0 200 200%22 xmlns=%22http://www.w3.org/2000/svg%22%3E%3Cfilter id=%22noiseFilter%22%3E%3CfeTurbulence type=%22fractalNoise%22 baseFrequency=%220.65%22 numOctaves=%223%22 stitchTiles=%22stitch%22/%3E%3C/filter%3E%3Crect width=%22100%25%22 height=%22100%25%22 filter=%22url(%23noiseFilter)%22/%3E%3C/svg%3E')" }}></div>
      </motion.div>

      <div className="container mx-auto px-4 relative z-10">
        <div className="max-w-4xl">
          <motion.h1 
            className="text-5xl md:text-7xl lg:text-8xl font-bold font-heading text-white leading-tight mb-6"
            initial="hidden"
            animate="visible"
            transition={{ staggerChildren: 0.2 }}
          >
            {words.map((word, i) => (
              <motion.span key={i} variants={wordVariants} transition={{ duration: 0.6, ease: "easeOut" }} className="inline-block mr-4">
                {word}
              </motion.span>
            ))}
          </motion.h1>

          <motion.p 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: prefersReducedMotion ? 0 : 1, duration: 0.8 }}
            className="text-xl md:text-2xl text-accent-light mb-10 max-w-2xl leading-relaxed"
          >
            Every deadline met. Every screen pixel-perfect. Every mic clear.
          </motion.p>

          <motion.div 
            initial={prefersReducedMotion ? { opacity: 0 } : { opacity: 0, y: 20 }}
            animate={prefersReducedMotion ? { opacity: 1 } : { opacity: 1, y: 0 }}
            transition={{ delay: prefersReducedMotion ? 0 : 1.4, duration: 0.6 }}
            className="flex flex-col sm:flex-row gap-4"
          >
            <Link href="/quote">
              <Button size="lg" className="w-full sm:w-auto">Get a Free Quote</Button>
            </Link>
            <Link href="/portfolio">
              <Button variant="ghost" size="lg" className="w-full sm:w-auto text-white border-white/20 hover:bg-white/10 hover:text-white">See Our Work</Button>
            </Link>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
