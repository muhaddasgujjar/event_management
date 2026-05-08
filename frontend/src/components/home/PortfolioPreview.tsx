"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { motion, useReducedMotion } from "framer-motion";
import { fetchApi } from "@/lib/api";
import { API_URL } from "@/lib/constants";
import { AnimatedCard } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { PortfolioCardSkeleton } from "@/components/ui/Skeleton";
import { Button } from "@/components/ui/Button";

export function PortfolioPreview() {
  const [items, setItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const prefersReducedMotion = useReducedMotion();

  useEffect(() => {
    const loadFeatured = async () => {
      const { data } = await fetchApi("/api/portfolio/featured");
      if (data) {
        setItems(data.slice(0, 3));
      }
      setLoading(false);
    };
    loadFeatured();
  }, []);

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
    hidden: { opacity: 0, scale: 0.95 },
    visible: { opacity: 1, scale: 1 },
  };

  return (
    <section className="py-24 bg-primary relative">
      <div className="container mx-auto px-4">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-16">
          <div className="max-w-2xl">
            <h2 className="text-4xl md:text-5xl font-bold font-heading text-white mb-6">Featured Work</h2>
            <p className="text-xl text-muted">
              Explore our recent setups for top pharmaceutical and corporate clients.
            </p>
          </div>
          <Link href="/portfolio" className="hidden md:block">
            <Button variant="ghost">View Full Portfolio</Button>
          </Link>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[1, 2, 3].map((i) => (
              <PortfolioCardSkeleton key={i} />
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
            {items.map((item) => {
              const imgSrc = item.image_url?.startsWith('/uploads/')
                ? `${API_URL}${item.image_url}`
                : item.image_url;
              return (
              <motion.div key={item.id} variants={itemVariants}>
                <AnimatedCard className="h-full flex flex-col group cursor-pointer">
                  <div className="relative h-64 w-full overflow-hidden bg-surface-2">
                    {imgSrc ? (
                      <Image
                        src={imgSrc ?? ""}
                        alt={item.title}
                        fill
                        className="object-cover transition-transform duration-700 group-hover:scale-110"
                      />
                    ) : (
                      <div className="absolute inset-0 bg-gradient-to-br from-surface-2 to-surface flex items-center justify-center">
                        <span className="text-muted/50 font-heading text-2xl font-bold">H&B</span>
                      </div>
                    )}
                    <div className="absolute top-4 left-4 z-10">
                      <Badge status={item.category} className="bg-primary/80 backdrop-blur-md" />
                    </div>
                  </div>
                  <div className="p-6 flex flex-col flex-grow">
                    <div className="flex items-center justify-between mb-3">
                      <span className="text-sm font-medium text-accent">{item.event_type || item.category}</span>
                      <span className="text-xs text-muted">{new Date(item.created_at).getFullYear()}</span>
                    </div>
                    <h3 className="text-xl font-bold text-white mb-3">{item.title}</h3>
                    <p className="text-muted text-sm line-clamp-3 mb-4">{item.description}</p>
                    <div className="mt-auto pt-4 border-t border-white/5">
                      <span className="text-xs text-muted uppercase tracking-wider">{item.event_type}</span>
                    </div>
                  </div>
                </AnimatedCard>
              </motion.div>
              );
            })}
          </motion.div>
        )}

        <div className="mt-12 md:hidden">
          <Link href="/portfolio" className="block w-full">
            <Button variant="ghost" className="w-full">View Full Portfolio</Button>
          </Link>
        </div>
      </div>
    </section>
  );
}
