"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronDown } from "lucide-react";
import { fetchApi } from "@/lib/api";

export function FAQAccordion() {
  const [faqs, setFaqs] = useState<any[]>([]);
  const [openId, setOpenId] = useState<number | null>(null);

  useEffect(() => {
    const loadFaqs = async () => {
      const { data } = await fetchApi("/api/faq/");
      if (data) setFaqs(data);
    };
    loadFaqs();
  }, []);

  if (faqs.length === 0) return null;

  return (
    <section className="py-24 bg-primary relative">
      <div className="container mx-auto px-4 max-w-3xl">
        <h2 className="text-3xl md:text-4xl font-bold font-heading text-center text-white mb-16">Frequently Asked Questions</h2>
        
        <div className="space-y-4">
          {faqs.map((faq) => {
            const isOpen = openId === faq.id;
            
            return (
              <div 
                key={faq.id} 
                className={`bg-surface border rounded-2xl overflow-hidden transition-colors ${
                  isOpen ? "border-accent/50" : "border-white/5 hover:border-white/10"
                }`}
              >
                <button
                  onClick={() => setOpenId(isOpen ? null : faq.id)}
                  className="w-full p-6 flex items-center justify-between text-left focus:outline-none focus-visible:ring-2 focus-visible:ring-accent"
                >
                  <span className={`font-bold text-lg pr-8 transition-colors ${isOpen ? "text-accent" : "text-white"}`}>
                    {faq.question}
                  </span>
                  <motion.div
                    animate={{ rotate: isOpen ? 180 : 0 }}
                    transition={{ duration: 0.3, ease: "easeInOut" }}
                    className={`shrink-0 flex items-center justify-center w-8 h-8 rounded-full ${isOpen ? "bg-accent/10 text-accent" : "bg-white/5 text-muted"}`}
                  >
                    <ChevronDown className="w-5 h-5" />
                  </motion.div>
                </button>
                
                <AnimatePresence initial={false}>
                  {isOpen && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.3, ease: "easeInOut" }}
                    >
                      <div className="px-6 pb-6 pt-0 text-muted leading-relaxed">
                        {faq.answer}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
