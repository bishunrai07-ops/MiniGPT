import React from 'react';
import { motion } from 'motion/react';

export const Logo = ({ className = "w-8 h-8" }: { className?: string }) => (
  <div className={`relative ${className} flex items-center justify-center shrink-0`}>
    <svg viewBox="0 0 100 100" className="w-full h-full overflow-visible" fill="none">
      {/* Background Glow - Animated */}
      <motion.circle 
        cx="50" 
        cy="50" 
        r="40" 
        className="fill-indigo-500/20 blur-md"
        animate={{
          scale: [1, 1.2, 1],
          opacity: [0.1, 0.25, 0.1],
        }}
        transition={{
          duration: 4,
          repeat: Infinity,
          ease: "easeInOut"
        }}
      />
      
      {/* Sharp M shape - Solid and bold */}
      <path 
        d="M20 75 V25 L50 52 L80 25 V75 H68 V42 L50 58 L32 42 V75 Z" 
        className="fill-white"
      />
      
      {/* 4 Point Star - Highly active pulse */}
      <motion.path
        d="M82 5 L85 17 L97 20 L85 23 L82 35 L79 23 L67 20 L79 17 Z"
        className="fill-indigo-500"
        initial={{ scale: 0.8 }}
        animate={{
          scale: [0.8, 1.1, 0.8],
          filter: [
            "drop-shadow(0 0 2px rgba(99,102,241,0.3))",
            "drop-shadow(0 0 10px rgba(99,102,241,0.8))",
            "drop-shadow(0 0 2px rgba(99,102,241,0.3))"
          ]
        }}
        transition={{
          duration: 2.5,
          repeat: Infinity,
          ease: "easeInOut"
        }}
      />
    </svg>
  </div>
);
