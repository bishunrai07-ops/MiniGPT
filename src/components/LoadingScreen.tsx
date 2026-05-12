import React, { useState, useEffect } from 'react';
import { motion, useSpring, useTransform } from 'motion/react';
import { Logo } from './Logo';

export const LoadingScreen: React.FC = () => {
  const [progress, setProgress] = useState(0);
  
  // Use a spring for smoother number animation
  const springProgress = useSpring(0, {
    stiffness: 70,
    damping: 20
  });

  useEffect(() => {
    // Simulate loading progress with varying speeds
    const startTime = Date.now();
    const duration = 2200; // Match the delay in App.tsx roughly

    const timer = setInterval(() => {
      const elapsed = Date.now() - startTime;
      const factor = Math.min(elapsed / duration, 1);
      
      // Add some non-linearity
      const easedFactor = factor < 0.5 
        ? 4 * factor * factor * factor 
        : 1 - Math.pow(-2 * factor + 2, 3) / 2;

      setProgress(Math.round(easedFactor * 100));

      if (factor >= 1) clearInterval(timer);
    }, 16);

    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    springProgress.set(progress);
  }, [progress, springProgress]);

  const displayProgress = useTransform(springProgress, (latest) => Math.floor(latest));

  return (
    <div className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-zinc-950 text-white overflow-hidden">
      {/* Decorative background elements */}
      <div className="absolute inset-0 pointer-events-none">
        <motion.div 
          animate={{ 
            scale: [1, 1.2, 1],
            opacity: [0.3, 0.5, 0.3] 
          }}
          transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
          className="absolute -top-[10%] -left-[10%] w-[40%] h-[40%] bg-indigo-500/20 rounded-full blur-[120px]"
        />
        <motion.div 
          animate={{ 
            scale: [1, 1.1, 1],
            opacity: [0.2, 0.4, 0.2] 
          }}
          transition={{ duration: 7, repeat: Infinity, ease: "easeInOut", delay: 1 }}
          className="absolute -bottom-[10%] -right-[10%] w-[50%] h-[50%] bg-purple-500/10 rounded-full blur-[140px]"
        />
      </div>

      <div className="relative flex flex-col items-center select-none">
        {/* Animated Logo Container */}
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.5 }}
          className="relative mb-8"
        >
          <div className="w-32 h-32 rounded-[2.5rem] bg-zinc-900/50 backdrop-blur-xl border border-white/10 flex items-center justify-center shadow-2xl relative group">
            {/* Pulsing rings around logo */}
            <motion.div 
              animate={{ 
                scale: [1, 1.3, 1],
                opacity: [0.2, 0.4, 0.2] 
              }}
              transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
              className="absolute inset-0 border-2 border-indigo-500/20 rounded-[2.5rem]"
            />
            
            <Logo className="w-20 h-20" />
            
            {/* Orbital light streak */}
            <motion.div 
              animate={{
                rotate: [0, 360]
              }}
              transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
              className="absolute inset-[-20%] pointer-events-none opacity-20"
            >
              <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[2px] h-20 bg-gradient-to-t from-indigo-500 to-transparent blur-sm" />
            </motion.div>
          </div>
        </motion.div>

        {/* Counter and Text */}
        <div className="flex flex-col items-center space-y-2">
          <motion.div 
            className="text-7xl font-bold tracking-tighter font-mono flex items-baseline gap-1 bg-clip-text text-transparent bg-gradient-to-b from-white to-white/40"
          >
            <motion.span>{displayProgress}</motion.span>
            <span className="text-2xl text-zinc-700">%</span>
          </motion.div>
          
          <div className="text-center space-y-1">
            <motion.h1 
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="text-sm font-black tracking-[0.3em] uppercase text-zinc-400"
            >
              MiniGPT
            </motion.h1>
            <motion.p 
              className="text-[10px] text-zinc-600 font-bold uppercase tracking-widest"
            >
              {progress < 100 ? "Processing Neural Link" : "System Synchronized"}
            </motion.p>
          </div>

          {/* Progress bar */}
          <div className="w-64 h-1 bg-zinc-900 rounded-full mt-10 overflow-hidden border border-white/5 relative">
            <motion.div
              style={{ width: `${progress}%` }}
              className="h-full bg-gradient-to-r from-indigo-600 to-purple-500 shadow-[0_0_15px_rgba(99,102,241,0.5)]"
            />
          </div>
        </div>

        {/* Matrix-style loading details (subtle) */}
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 0.3 }}
          transition={{ delay: 0.8 }}
          className="fixed bottom-12 font-mono text-[9px] text-zinc-500 flex flex-col items-center space-y-1 uppercase tracking-[0.25em]"
        >
          <div className="flex gap-8">
            <span className="flex items-center gap-2">
              <div className={`w-1 h-1 rounded-full ${progress > 30 ? 'bg-indigo-500' : 'bg-zinc-800'}`} />
              DATA_CORE
            </span>
            <span className="flex items-center gap-2">
              <div className={`w-1 h-1 rounded-full ${progress > 60 ? 'bg-indigo-500' : 'bg-zinc-800'}`} />
              NEURAL_FX
            </span>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

