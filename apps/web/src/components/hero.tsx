"use client";

import React, { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import { BookOpen } from "lucide-react";

export function Hero() {
  const [showTooltip, setShowTooltip] = useState(false);

  return (
    <section className="relative min-h-[90vh] lg:min-h-screen overflow-hidden text-[#F7F5F0] flex flex-col items-center justify-center py-20 lg:py-32">
      {/* Hero Background Image & Overlay */}
      <div className="absolute inset-0 z-0">
        <Image
          src="/images/hero-img.jpg"
          alt="Abiding Word Of Grace Missions (a.k.a. Amazing Grace Bible Church) auditorium congregation"
          fill
          priority
          className="object-cover object-center grayscale contrast-[1.05] brightness-[0.85]"
        />
        {/* Subtle dark vignette overlay for legibility without obscuring the photograph */}
        <div className="absolute inset-0 bg-gradient-to-t from-[#171717] via-[#171717]/65 to-[#171717]/40" />
      </div>

      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 text-center flex flex-col items-center">
        {/* John 15:7 metadata label with interactive tooltip */}
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="relative mb-6 z-20"
        >
          <button
            type="button"
            onClick={() => setShowTooltip((prev) => !prev)}
            onMouseEnter={() => setShowTooltip(true)}
            onMouseLeave={() => setShowTooltip(false)}
            onFocus={() => setShowTooltip(true)}
            onBlur={() => setShowTooltip(false)}
            aria-label="John 15:7 anchor scripture tooltip"
            className="inline-flex items-center space-x-2 px-3.5 py-1.5 rounded-full border border-[#B18A4A]/40 bg-[#B18A4A]/10 hover:bg-[#B18A4A]/20 hover:border-[#B18A4A] text-[#B18A4A] text-xs font-medium uppercase tracking-[0.25em] transition-all duration-200 cursor-pointer group focus:outline-none focus:ring-2 focus:ring-[#B18A4A]/50"
          >
            <BookOpen className="w-3.5 h-3.5 text-[#B18A4A] group-hover:scale-110 transition-transform" />
            <span>John 15:7</span>
          </button>

          <AnimatePresence>
            {showTooltip && (
              <motion.div
                initial={{ opacity: 0, y: 8, scale: 0.96 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 5, scale: 0.96 }}
                transition={{ duration: 0.2, ease: "easeOut" }}
                className="absolute left-1/2 -translate-x-1/2 top-full mt-3 w-72 sm:w-96 p-4 rounded-md bg-[#1F1F1F]/95 backdrop-blur-md border border-[#B18A4A]/40 shadow-2xl text-left pointer-events-none z-30"
              >
                <div className="flex items-center justify-between pb-2 mb-2 border-b border-white/10">
                  <span className="text-[10px] font-sans uppercase tracking-[0.2em] text-[#B18A4A] font-semibold">
                    Anchor Scripture (NKJV)
                  </span>
                  <span className="text-[10px] text-[#77736B]">John 15:7</span>
                </div>
                <p className="text-xs sm:text-sm font-sans font-light italic text-[#F7F5F0] leading-relaxed">
                  &ldquo;If you abide in Me, and My words abide in you, you will
                  ask what you desire, and it shall be done for you.&rdquo;
                </p>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>

        {/* Main Church Name — Editorial Display Serif */}
        <motion.h1
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="text-4xl sm:text-6xl lg:text-7xl font-serif font-medium text-[#F7F5F0] tracking-tight leading-[1.08] uppercase"
        >
          Abiding Word
          <span className="block text-2xl sm:text-4xl lg:text-5xl mt-3 text-[#B18A4A] font-serif font-normal tracking-[0.15em] uppercase">
            Of Grace Missions
          </span>
          <span className="block text-sm sm:text-lg lg:text-xl mt-3 text-[#D4D0C7] font-sans font-light tracking-[0.2em] normal-case">
            (a.k.a. Amazing Grace Bible Church)
          </span>
        </motion.h1>

        {/* Tagline — clean sans body */}
        <motion.p
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="mt-6 text-lg sm:text-2xl font-sans text-[#D4D0C7] font-light max-w-2xl leading-relaxed"
        >
          Salvation, Healing and Deliverance
        </motion.p>

        {/* Scripture quote */}
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.3 }}
          className="mt-4 text-sm sm:text-base italic text-[#77736B] font-sans max-w-lg"
        >
          &ldquo;A touch from God will change your life forever!&rdquo;
        </motion.p>

        {/* CTA Buttons */}
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.4 }}
          className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4"
        >
          <Link
            href="/events"
            className="px-8 py-3.5 rounded-sm bg-[#B18A4A] hover:bg-[#9C773B] text-white font-medium text-xs uppercase tracking-wider transition-colors duration-200"
          >
            Join Us This Sunday
          </Link>
          <Link
            href="/contact"
            className="px-8 py-3.5 rounded-sm border border-white/20 hover:border-white/40 bg-white/5 hover:bg-white/10 text-[#F7F5F0] font-medium text-xs uppercase tracking-wider transition-colors duration-200 flex items-center space-x-2"
          >
            <span>Contact Us</span>
          </Link>
        </motion.div>
      </div>
    </section>
  );
}
