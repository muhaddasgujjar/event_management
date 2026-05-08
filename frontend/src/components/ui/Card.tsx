import { HTMLAttributes, forwardRef } from "react";
import { motion, HTMLMotionProps } from "framer-motion";

export const Card = forwardRef<HTMLDivElement, HTMLAttributes<HTMLDivElement>>(
  ({ className = "", children, ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={`bg-surface border border-white/5 rounded-2xl overflow-hidden ${className}`}
        {...props}
      >
        {children}
      </div>
    );
  }
);
Card.displayName = "Card";

export const AnimatedCard = forwardRef<HTMLDivElement, HTMLMotionProps<"div">>(
  ({ className = "", children, ...props }, ref) => {
    return (
      <motion.div
        ref={ref}
        whileHover={{ scale: 1.02, boxShadow: "0 0 20px rgba(201,168,76,0.3)", borderColor: "rgba(201,168,76,0.5)" }}
        className={`bg-surface border border-white/5 rounded-2xl overflow-hidden transition-colors ${className}`}
        {...props}
      >
        {children}
      </motion.div>
    );
  }
);
AnimatedCard.displayName = "AnimatedCard";
