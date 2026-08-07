"use client";

import React from "react";
import Link from "next/link";
import { Play } from "lucide-react";
import Image from "next/image";
import { motion } from "framer-motion";

export function Hero() {
  return (
    <section className="relative min-h-screen overflow-hidden text-white flex flex-col items-center justify-center">
      {/* Hero Background Image & Overlay */}
      <div className="absolute inset-0 z-0">
        <Image
          src="/images/hero-img.jpg"
          alt="Amazing Grace Bible Church background"
          fill
          priority
          className="object-cover"
        />
        {/* Linear gradient overlay: darker at the bottom for text contrast, lighter at the top to let the photo breathe */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/60 to-black/40" />
        {/* Soft amber radial glow to complement the gold typography */}
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(184, 103, 10, 0.15)_0%,transparent_75%)]" />
      </div>

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

        {/* Main Church Name — display font for the name */}
        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.1 }}
          className="text-5xl sm:text-7xl lg:text-8xl font-serif font-bold text-white tracking-wide leading-[1.05] uppercase"
        >
          Amazing Grace
          <span className="block text-2xl sm:text-4xl lg:text-5xl mt-3 text-amber-400 font-serif font-semibold tracking-widest uppercase">
            Bible Church
          </span>
        </motion.h1>

        {/* Tagline — clean sans for supporting tagline */}
        <motion.p
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.3 }}
          className="mt-8 text-lg sm:text-2xl font-sans text-slate-200/95 tracking-wide font-normal max-w-2xl"
        >
          Salvation, Healing and Miracles
        </motion.p>

        {/* Scripture quote — clean sans for supporting text */}
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.4 }}
          className="mt-5 text-sm sm:text-base italic text-slate-400 font-sans max-w-lg"
        >
          &ldquo;A touch from God will change your life forever!&rdquo;
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
    </section>
  );
}
