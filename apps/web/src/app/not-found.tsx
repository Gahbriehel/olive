"use client";

import React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Compass,
  ArrowLeft,
  Home,
  Calendar,
  Info,
  Mail,
  ChevronRight,
  Sparkles,
} from "lucide-react";
import { motion } from "framer-motion";

export default function WebNotFound() {
  const router = useRouter();

  const popularDestinations = [
    {
      href: "/",
      title: "Home",
      description: "Welcome & Worship Services",
      icon: Home,
    },
    {
      href: "/events",
      title: "Events",
      description: "Church Calendar & Gatherings",
      icon: Calendar,
    },
    {
      href: "/about",
      title: "About Us",
      description: "Mission, Vision & Leadership",
      icon: Info,
    },
    {
      href: "/contact",
      title: "Contact Us",
      description: "Location, Hours & Prayer",
      icon: Mail,
    },
  ];

  return (
    <div className="fixed inset-0 z-[9999] overflow-y-auto bg-[#171717] text-[#F7F5F0] flex items-center justify-center px-4 sm:px-6 lg:px-8 py-16">
      <motion.div
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: "easeOut" }}
        className="w-full max-w-4xl text-center space-y-10"
      >
        {/* Glow & Floating Icon */}
        <div className="relative inline-block">
          <div className="absolute -inset-8 rounded-full bg-[#B18A4A]/15 blur-2xl animate-pulse" />
          <div className="relative flex flex-col items-center">
            <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-3xl bg-[#222222] border border-[#B18A4A]/30 text-[#B18A4A] flex items-center justify-center shadow-2xl mb-4">
              <Compass className="w-10 h-10 sm:w-12 sm:h-12 animate-spin-slow" />
            </div>

            <span className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-full bg-[#B18A4A]/10 border border-[#B18A4A]/30 text-[#B18A4A] text-xs font-medium uppercase tracking-widest mb-3">
              <Sparkles className="w-3.5 h-3.5" />
              Page Not Found
            </span>

            <h1 className="text-7xl sm:text-9xl font-serif font-bold text-[#F7F5F0] tracking-tight">
              4<span className="text-[#B18A4A]">0</span>4
            </h1>
          </div>
        </div>

        {/* Message */}
        <div className="max-w-xl mx-auto space-y-3">
          <h2 className="text-2xl sm:text-4xl font-serif font-bold text-[#F7F5F0]">
            Lost Your Way?
          </h2>
          <p className="text-sm sm:text-base text-[#D4D0C7] leading-relaxed font-sans">
            The page you are looking for doesn’t exist or has been relocated.
            Let us help guide you back to our community and worship services.
          </p>
        </div>

        {/* Primary Buttons */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
          <Link
            href="/"
            className="w-full sm:w-auto px-6 py-3.5 rounded-lg bg-[#B18A4A] hover:bg-[#9C773B] text-white font-semibold text-xs uppercase tracking-wider transition-all duration-200 shadow-lg shadow-[#B18A4A]/20 flex items-center justify-center gap-2 active:scale-[0.98]"
          >
            <Home className="w-4 h-4" />
            Return to Home
          </Link>
          <Link
            href="/events"
            className="w-full sm:w-auto px-6 py-3.5 rounded-lg bg-transparent hover:bg-white/5 border border-[#B18A4A]/50 text-[#F7F5F0] hover:text-[#B18A4A] font-semibold text-xs uppercase tracking-wider transition-all duration-200 flex items-center justify-center gap-2 active:scale-[0.98]"
          >
            <Calendar className="w-4 h-4 text-[#B18A4A]" />
            Explore Events
          </Link>
          <button
            onClick={() => router.back()}
            className="w-full sm:w-auto px-6 py-3.5 rounded-lg bg-white/5 hover:bg-white/10 text-[#D4D0C7] hover:text-white font-medium text-xs uppercase tracking-wider transition-all duration-200 flex items-center justify-center gap-2"
          >
            <ArrowLeft className="w-4 h-4" />
            Go Back
          </button>
        </div>

        {/* Quick Destinations Grid */}
        <div className="pt-8 border-t border-white/10">
          <p className="text-xs font-semibold uppercase tracking-widest text-[#77736B] mb-6 text-left">
            Popular Destinations
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 text-left">
            {popularDestinations.map((item) => {
              const Icon = item.icon;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className="group p-5 rounded-xl bg-[#222222]/80 border border-white/10 hover:border-[#B18A4A]/60 hover:bg-[#282828] transition-all duration-300 flex flex-col justify-between space-y-4"
                >
                  <div className="flex items-center justify-between">
                    <div className="w-10 h-10 rounded-lg bg-[#B18A4A]/10 text-[#B18A4A] flex items-center justify-center group-hover:scale-110 transition-transform">
                      <Icon className="w-5 h-5" />
                    </div>
                    <ChevronRight className="w-4 h-4 text-[#77736B] group-hover:text-[#B18A4A] group-hover:translate-x-1 transition-all" />
                  </div>
                  <div>
                    <h3 className="font-serif font-bold text-base text-[#F7F5F0] group-hover:text-[#B18A4A] transition-colors">
                      {item.title}
                    </h3>
                    <p className="text-xs text-[#77736B] mt-1">
                      {item.description}
                    </p>
                  </div>
                </Link>
              );
            })}
          </div>
        </div>
      </motion.div>
    </div>
  );
}
