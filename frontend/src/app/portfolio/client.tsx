"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import { fetchApi } from "@/lib/api";
import { API_URL } from "@/lib/constants";
import { AnimatedCard } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { PortfolioCardSkeleton } from "@/components/ui/Skeleton";

const CATEGORIES = ["ALL", "SMD", "SOUND", "STALL", "FULL_SETUP"];

export function PortfolioClient() {
  const [items, setItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("ALL");

  useEffect(() => {
    const loadPortfolio = async () => {
      const { data } = await fetchApi("/api/portfolio/");
      if (data) setItems(data);
      setLoading(false);
    };
    loadPortfolio();
  }, []);

  const filteredItems = filter === "ALL" 
    ? items 
    : items.filter(item => item.category === filter);

  return (
    <div className="pt-20 min-h-screen">
      <div className="bg-surface border-b border-white/5 py-16">
        <div className="container mx-auto px-4 max-w-4xl text-center">
          <h1 className="text-4xl md:text-5xl font-bold font-heading text-white mb-6">Our Work</h1>
          <p className="text-xl text-muted">
            A showcase of precision engineering and flawless execution across corporate and entertainment events.
          </p>
        </div>
      </div>

      <div className="container mx-auto px-4 py-12">
        {/* Filter Bar */}
        <div className="flex flex-wrap justify-center gap-2 mb-12">
          {CATEGORIES.map(cat => (
            <button
              key={cat}
              onClick={() => setFilter(cat)}
              className={`px-4 py-2 rounded-full text-sm font-bold transition-all ${
                filter === cat 
                  ? "bg-accent text-white shadow-[0_0_15px_rgba(201,168,76,0.4)]" 
                  : "bg-surface-2 text-muted hover:text-white hover:bg-white/10"
              }`}
            >
              {cat.replace("_", " ")}
            </button>
          ))}
        </div>

        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <PortfolioCardSkeleton key={i} />
            ))}
          </div>
        ) : (
          <motion.div layout className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            <AnimatePresence>
              {filteredItems.map((item, i) => {
                const imgSrc = item.image_url?.startsWith('/uploads/')
                  ? `${API_URL}${item.image_url}`
                  : item.image_url;
                return (
                <motion.div
                  key={item.id}
                  layout
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                  transition={{ duration: 0.3, delay: i * 0.05 }}
                >
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
            </AnimatePresence>
          </motion.div>
        )}
        
        {!loading && filteredItems.length === 0 && (
          <div className="text-center py-24 text-muted">
            <p>No portfolio items found for this category.</p>
          </div>
        )}
      </div>
    </div>
  );
}
