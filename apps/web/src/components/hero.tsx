"use client";

import Link from "next/link";
import Image from "next/image";
import { motion } from "framer-motion";

export function Hero() {
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
        {/* Hebrews 13:8 metadata label */}
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="inline-flex items-center text-[#B18A4A] text-xs font-medium uppercase tracking-[0.25em] mb-6"
        >
          Hebrews 13:8
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
          {/* <Link
            href="/contact"
            className="px-8 py-3.5 rounded-sm border border-white/20 hover:border-white/40 bg-white/5 hover:bg-white/10 text-[#F7F5F0] font-medium text-xs uppercase tracking-wider transition-colors duration-200 flex items-center space-x-2"
          >
            <Play className="w-3.5 h-3.5 fill-[#F7F5F0]" />
            <span>Watch Live</span>
          </Link> */}
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
