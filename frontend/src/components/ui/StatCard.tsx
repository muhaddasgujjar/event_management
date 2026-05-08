"use client";

import { ReactNode } from "react";
import { motion, useSpring, useTransform, useInView } from "framer-motion";
import { useRef, useEffect } from "react";
import { AnimatedCard } from "./Card";

interface StatCardProps {
  title: string;
  value: number;
  icon: ReactNode;
  badge?: ReactNode;
  prefix?: string;
  suffix?: string;
}

export function StatCard({ title, value, icon, badge, prefix = "", suffix = "" }: StatCardProps) {
  const ref = useRef<HTMLDivElement>(null);
  const isInView = useInView(ref, { once: true, margin: "-50px" });
  
  const springValue = useSpring(0, {
    stiffness: 50,
    damping: 20,
    mass: 1,
  });

  useEffect(() => {
    if (isInView) {
      springValue.set(value);
    }
  }, [isInView, value, springValue]);

  const displayValue = useTransform(springValue, (current) => {
    return `${prefix}${Math.round(current).toLocaleString()}${suffix}`;
  });

  return (
    <AnimatedCard ref={ref} className="p-6 flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <h3 className="text-muted font-medium">{title}</h3>
        <div className="text-accent/80 bg-accent/10 p-2 rounded-lg">
          {icon}
        </div>
      </div>
      <div className="flex items-end gap-3">
        <motion.span className="text-3xl font-bold font-heading text-white tracking-tight">
          {displayValue}
        </motion.span>
        {badge && <div className="mb-1">{badge}</div>}
      </div>
    </AnimatedCard>
  );
}
