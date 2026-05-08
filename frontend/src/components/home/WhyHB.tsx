"use client";

import { motion, useReducedMotion } from "framer-motion";
import { ShieldCheck, HardHat, Award } from "lucide-react";
import { Card } from "@/components/ui/Card";

export function WhyHB() {
  const prefersReducedMotion = useReducedMotion();

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

  const reasons = [
    {
      title: "We Own All Equipment",
      description: "No middlemen, no sub-renting. We maintain full control over the quality, availability, and condition of every screen and speaker.",
      icon: <ShieldCheck className="w-8 h-8 text-accent" />
    },
    {
      title: "On-Site Engineers Always Included",
      description: "Our veteran crew remains on-site for the duration of your event to ensure flawless technical execution and immediate troubleshooting.",
      icon: <HardHat className="w-8 h-8 text-accent" />
    },
    {
      title: "30-Year Track Record",
      description: "Three decades of delivering high-stakes corporate and pharmaceutical events with a strict zero-failure policy.",
      icon: <Award className="w-8 h-8 text-accent" />
    }
  ];

  return (
    <section className="py-24 bg-surface relative border-y border-white/5">
      {/* Decorative background element */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-4xl h-[1px] bg-gradient-to-r from-transparent via-accent/50 to-transparent"></div>
      
      <div className="container mx-auto px-4">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <h2 className="text-sm font-bold text-accent uppercase tracking-[0.2em] mb-4">Why Choose Us</h2>
          <h3 className="text-3xl md:text-4xl font-bold font-heading text-white">Trust is Built Over Decades</h3>
        </div>

        <motion.div 
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-50px" }}
          className="grid grid-cols-1 md:grid-cols-3 gap-8"
        >
          {reasons.map((reason, i) => (
            <motion.div key={i} variants={itemVariants}>
              <Card className="p-8 h-full bg-surface-2 flex flex-col items-center text-center">
                <div className="w-16 h-16 rounded-full bg-accent/10 flex items-center justify-center mb-6">
                  {reason.icon}
                </div>
                <h4 className="text-xl font-bold text-white mb-4">{reason.title}</h4>
                <p className="text-muted leading-relaxed">
                  {reason.description}
                </p>
              </Card>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
