"use client";

import React from "react";
import Link from "next/link";
import { Play } from "lucide-react";
import { motion } from "framer-motion";

export function Hero() {
  return (
    <section className="relative min-h-screen overflow-hidden text-white flex flex-col items-center justify-center">
      {/* Deep blue gradient background */}
      <div className="absolute inset-0 bg-gradient-to-b from-[#1A3A63] via-[#2A5090] to-[#1A3A63]" />

      {/* Radial ambient glow */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(80,128,208,0.3)_0%,transparent_70%)]" />

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 text-center flex flex-col items-center">
        {/* Hebrews 13:8 pill badge */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="inline-flex items-center px-5 py-1.5 rounded-full border border-amber-500/40 text-amber-300/90 text-xs font-semibold uppercase tracking-[0.2em] mb-10"
        >
          Hebrews 13:8
        </motion.div>

        {/* Main Church Name — large serif */}
        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.1 }}
          className="text-5xl sm:text-7xl lg:text-8xl font-serif font-bold text-white tracking-wide leading-[1.05] uppercase"
          style={{ fontVariant: "small-caps" }}
        >
          Amazing Grace
        </motion.h1>

        {/* Subtitle — gold tracked */}
        <motion.p
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="mt-4 text-sm sm:text-base font-bold uppercase tracking-[0.35em] text-amber-400/90"
        >
          Bible Church
        </motion.p>

        {/* Tagline */}
        <motion.p
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.3 }}
          className="mt-5 text-lg sm:text-2xl font-serif text-white/90 tracking-wide"
        >
          Salvation, Healing and Miracles
        </motion.p>

        {/* Scripture quote */}
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.4 }}
          className="mt-6 text-sm sm:text-base italic text-white/60 font-serif max-w-lg"
        >
          &ldquo;Jesus Christ the same yesterday, and today, and forever.&rdquo;
        </motion.p>

        {/* CTA Buttons */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.5 }}
          className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4"
        >
          <Link
            href="/events"
            className="px-8 py-3.5 rounded-md bg-amber-600 hover:bg-amber-500 text-white font-bold text-sm uppercase tracking-wider shadow-lg shadow-amber-900/30 transition-all duration-200 border border-amber-500/50"
          >
            Join Us This Sunday
          </Link>
          <Link
            href="/contact"
            className="px-8 py-3.5 rounded-md border border-white/20 hover:border-white/40 bg-white/5 hover:bg-white/10 text-white font-semibold text-sm transition-all duration-200 flex items-center space-x-2.5"
          >
            <Play className="w-4 h-4 fill-white" />
            <span>Watch Live</span>
          </Link>
        </motion.div>
      </div>

      {/* Scroll indicator at bottom */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5, delay: 0.8 }}
        className="absolute bottom-10 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 z-10"
      >
        <span className="text-[10px] uppercase tracking-[0.3em] text-white/40 font-semibold">
          Scroll
        </span>
        <motion.div
          animate={{ y: [0, 6, 0] }}
          transition={{ duration: 1.8, repeat: Infinity, ease: "easeInOut" }}
          className="w-px h-8 bg-gradient-to-b from-white/40 to-transparent"
        />
      </motion.div>
    </section>
  );
}
