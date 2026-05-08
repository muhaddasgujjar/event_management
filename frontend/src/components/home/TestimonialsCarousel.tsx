"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Star } from "lucide-react";
import { fetchApi } from "@/lib/api";

export function TestimonialsCarousel() {
  const [testimonials, setTestimonials] = useState<any[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);

  useEffect(() => {
    const loadTestimonials = async () => {
      const { data } = await fetchApi("/api/testimonials/");
      if (data) setTestimonials(data);
    };
    loadTestimonials();
  }, []);

  useEffect(() => {
    if (testimonials.length <= 1 || isPaused) return;

    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % testimonials.length);
    }, 4000);

    return () => clearInterval(interval);
  }, [testimonials.length, isPaused]);

  if (testimonials.length === 0) return null;

  return (
    <section className="py-24 bg-surface-2 border-y border-white/5 overflow-hidden">
      <div className="container mx-auto px-4 text-center max-w-4xl relative">
        <h2 className="text-sm font-bold text-accent uppercase tracking-[0.2em] mb-12">Client Experiences</h2>
        
        <div 
          className="relative min-h-[250px] flex items-center justify-center"
          onMouseEnter={() => setIsPaused(true)}
          onMouseLeave={() => setIsPaused(false)}
        >
          <AnimatePresence mode="wait">
            <motion.div
              key={currentIndex}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.5, ease: "easeInOut" }}
              className="w-full"
            >
              <div className="flex justify-center gap-1 mb-8">
                {[...Array(5)].map((_, i) => (
                  <Star 
                    key={i} 
                    className={`w-5 h-5 ${i < testimonials[currentIndex].rating ? "text-accent fill-accent" : "text-white/10"}`} 
                  />
                ))}
              </div>
              <p className="text-2xl md:text-3xl font-light italic leading-relaxed text-white mb-10">
                "{testimonials[currentIndex].quote}"
              </p>
              <div>
                <p className="font-bold text-lg text-accent">{testimonials[currentIndex].client_name}</p>
                <p className="text-muted text-sm">{testimonials[currentIndex].company}</p>
              </div>
            </motion.div>
          </AnimatePresence>
        </div>

        <div className="flex justify-center gap-3 mt-12">
          {testimonials.map((_, i) => (
            <button
              key={i}
              onClick={() => setCurrentIndex(i)}
              className={`w-2.5 h-2.5 rounded-full transition-all duration-300 ${
                i === currentIndex ? "bg-accent w-8" : "bg-white/20 hover:bg-white/40"
              }`}
              aria-label={`Go to slide ${i + 1}`}
            />
          ))}
        </div>
      </div>
    </section>
  );
}
