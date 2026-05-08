"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { motion, useReducedMotion } from "framer-motion";
import { MonitorPlay, Speaker, Hammer, ArrowRight } from "lucide-react";
import { fetchApi } from "@/lib/api";
import { AnimatedCard } from "@/components/ui/Card";
import { Skeleton } from "@/components/ui/Skeleton";

export function ServicesPreview() {
  const [services, setServices] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const prefersReducedMotion = useReducedMotion();

  useEffect(() => {
    const loadServices = async () => {
      const { data } = await fetchApi("/api/services/");
      if (data) {
        setServices(data.slice(0, 3)); // Ensure only 3
      }
      setLoading(false);
    };
    loadServices();
  }, []);

  const getIcon = (slug: string) => {
    if (slug.includes("smd")) return <MonitorPlay className="w-8 h-8" />;
    if (slug.includes("sound")) return <Speaker className="w-8 h-8" />;
    if (slug.includes("stall")) return <Hammer className="w-8 h-8" />;
    return <MonitorPlay className="w-8 h-8" />;
  };

  const getImage = (slug: string) => {
    if (slug.includes("smd")) return "/images/smd.png";
    if (slug.includes("sound")) return "/images/sound.png";
    if (slug.includes("stall")) return "/images/stall.png";
    return "/images/hero.png";
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { 
      opacity: 1,
      transition: { staggerChildren: 0.1 }
    }
  };

  const itemVariants = prefersReducedMotion ? {
    hidden: { opacity: 0 },
    visible: { opacity: 1 },
  } : {
    hidden: { opacity: 0, y: 30 },
    visible: { opacity: 1, y: 0 },
  };

  return (
    <section className="py-24 bg-primary relative">
      <div className="container mx-auto px-4">
        <div className="max-w-3xl mb-16">
          <h2 className="text-4xl md:text-5xl font-bold font-heading text-white mb-6">Our Core Expertise</h2>
          <p className="text-xl text-muted">
            We own our equipment and employ our own fabricators, meaning no hidden markups and complete accountability.
          </p>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-96 rounded-2xl bg-surface-2 border border-white/5 animate-pulse" />
            ))}
          </div>
        ) : (
          <motion.div 
            variants={containerVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-100px" }}
            className="grid grid-cols-1 md:grid-cols-3 gap-8"
          >
            {services.map((service) => (
              <motion.div key={service.id} variants={itemVariants}>
                <AnimatedCard className="h-full flex flex-col relative group overflow-hidden border-white/10 hover:border-accent/50 transition-colors duration-500">
                  <div className="absolute inset-0 z-0">
                    <Image
                      src={getImage(service.slug)}
                      alt={service.name}
                      fill
                      className="object-cover transition-transform duration-700 group-hover:scale-105"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-primary via-primary/90 to-primary/40" />
                  </div>
                  
                  <div className="relative z-10 p-8 flex flex-col h-full">
                    <div className="w-16 h-16 rounded-xl bg-accent/20 border border-accent/30 text-accent flex items-center justify-center mb-8 backdrop-blur-md">
                      {getIcon(service.slug)}
                    </div>
                    
                    <h3 className="text-2xl font-bold font-heading text-white mb-4">{service.name}</h3>
                    <p className="text-accent-light/80 mb-8 flex-grow">{service.short_description}</p>
                    
                    <Link href={`/services#${service.slug}`} className="inline-flex items-center text-accent font-bold hover:text-accent-light transition-colors mt-auto group/link">
                      Learn More 
                      <ArrowRight className="w-5 h-5 ml-2 transition-transform group-hover/link:translate-x-1" />
                    </Link>
                  </div>
                </AnimatedCard>
              </motion.div>
            ))}
          </motion.div>
        )}
      </div>
    </section>
  );
}
