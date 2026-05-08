"use client";

import { motion, useInView, useSpring, useTransform, useReducedMotion } from "framer-motion";
import { useRef, useEffect } from "react";

function Counter({ value, suffix = "" }: { value: number; suffix?: string }) {
  const ref = useRef<HTMLSpanElement>(null);
  const isInView = useInView(ref, { once: true, margin: "-50px" });
  const prefersReducedMotion = useReducedMotion();
  
  const springValue = useSpring(0, {
    stiffness: 50,
    damping: 20,
    mass: 1,
  });

  useEffect(() => {
    if (isInView) {
      if (prefersReducedMotion) {
        springValue.set(value); // Instantly set if reduced motion
      } else {
        springValue.set(value);
      }
    }
  }, [isInView, value, springValue, prefersReducedMotion]);

  const displayValue = useTransform(springValue, (current) => {
    return `${Math.round(current)}${suffix}`;
  });

  return (
    <motion.span ref={ref} className="text-4xl md:text-5xl font-bold font-heading text-white">
      {displayValue}
    </motion.span>
  );
}

export function StatsBar() {
  const prefersReducedMotion = useReducedMotion();

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { 
      opacity: 1,
      transition: { staggerChildren: 0.2 }
    }
  };

  const itemVariants = prefersReducedMotion ? {
    hidden: { opacity: 0 },
    visible: { opacity: 1 },
  } : {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 },
  };

  return (
    <section className="bg-surface-2 border-y border-white/5 py-12">
      <div className="container mx-auto px-4">
        <motion.div 
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-50px" }}
          className="grid grid-cols-2 md:grid-cols-4 gap-8 md:gap-4 divide-x-0 md:divide-x divide-white/10"
        >
          <motion.div variants={itemVariants} className="flex flex-col items-center text-center px-4">
            <Counter value={30} suffix="+" />
            <span className="text-accent mt-2 font-medium uppercase tracking-wider text-sm">Years Experience</span>
          </motion.div>
          <motion.div variants={itemVariants} className="flex flex-col items-center text-center px-4">
            <Counter value={500} suffix="+" />
            <span className="text-accent mt-2 font-medium uppercase tracking-wider text-sm">Events Delivered</span>
          </motion.div>
          <motion.div variants={itemVariants} className="flex flex-col items-center text-center px-4">
            <Counter value={3} />
            <span className="text-accent mt-2 font-medium uppercase tracking-wider text-sm">Core Services</span>
          </motion.div>
          <motion.div variants={itemVariants} className="flex flex-col items-center text-center px-4">
            <Counter value={100} suffix="%" />
            <span className="text-accent mt-2 font-medium uppercase tracking-wider text-sm">On-Time Delivery</span>
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
}
