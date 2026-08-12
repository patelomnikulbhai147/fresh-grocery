"use client";
import React from 'react';
import { motion } from 'framer-motion';

export function IndependenceDayBanner() {
  return (
    <div className="relative overflow-hidden bg-white shadow-sm">
      {/* Tricolor top border */}
      <div className="h-1.5 w-full bg-gradient-to-r from-india-saffron via-white to-india-green" />
      
      {/* Subtle Ashoka Chakra watermark */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 opacity-[0.04] pointer-events-none flex justify-center items-center">
        <svg viewBox="0 0 100 100" className="w-48 h-48 text-india-navy animate-spin" style={{ animationDuration: '60s', animationTimingFunction: 'linear' }} fill="none" stroke="currentColor">
          <circle cx="50" cy="50" r="46" strokeWidth="2" />
          <circle cx="50" cy="50" r="10" fill="currentColor" stroke="none" />
          {Array.from({ length: 24 }).map((_, i) => (
            <line key={i} x1="50" y1="50" x2="50" y2="4" strokeWidth="1.5" transform={`rotate(${i * 15} 50 50)`} />
          ))}
        </svg>
      </div>

      <div className="relative mx-auto max-w-7xl px-4 py-3 md:py-4 flex flex-col items-center justify-center text-center z-10">
        <motion.div
          initial={{ opacity: 0, y: -5 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center gap-3 sm:gap-4 bg-white/60 backdrop-blur-sm px-4 py-1.5 rounded-full"
        >
          <div className="hidden sm:flex gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-india-saffron shadow-sm"></span>
            <span className="w-2.5 h-2.5 rounded-full bg-slate-100 shadow-sm border border-slate-200"></span>
            <span className="w-2.5 h-2.5 rounded-full bg-india-green shadow-sm"></span>
          </div>
          
          <p className="font-display font-bold text-slate-800 text-sm md:text-base tracking-wide uppercase">
            Happy Independence Day <span className="ml-1 text-lg hidden sm:inline-block">🇮🇳</span>
          </p>
          
          <div className="hidden sm:flex gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-india-green shadow-sm"></span>
            <span className="w-2.5 h-2.5 rounded-full bg-slate-100 shadow-sm border border-slate-200"></span>
            <span className="w-2.5 h-2.5 rounded-full bg-india-saffron shadow-sm"></span>
          </div>
        </motion.div>
      </div>
      
      {/* Tricolor bottom border */}
      <div className="h-px w-full bg-gradient-to-r from-india-saffron/40 via-white to-india-green/40" />
    </div>
  );
}
