"use client";

import React from "react";
import Link from "next/link";
import {
  Calendar,
  ArrowRight,
  MapPin,
  Clock,
  Heart,
  Users,
  Sparkles,
  CheckCircle2,
} from "lucide-react";
import { motion } from "framer-motion";
import { useQuery } from "@tanstack/react-query";
import { webService } from "@/services/api";

export default function HomePage() {
  const { data: events = [] } = useQuery({
    queryKey: ["publishedEvents"],
    queryFn: () => webService.getPublishedEvents(),
  });

  const nextEvent = events.length > 0 ? events[0] : null;

  return (
    <div className="space-y-20 pb-20">
      {/* HERO SECTION */}
      <section className="relative overflow-hidden pt-12 lg:pt-20 pb-16 lg:pb-28 border-b border-slate-200/60 dark:border-slate-800/60">
        {/* Background glow effects */}
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[350px] bg-gradient-to-tr from-emerald-500/20 via-teal-500/15 to-indigo-500/20 blur-[120px] rounded-full pointer-events-none" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="inline-flex items-center space-x-2 px-4 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 dark:text-emerald-400 text-xs font-semibold uppercase tracking-wider mb-6"
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>Welcome Home to Grace City</span>
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="text-4xl sm:text-6xl lg:text-7xl font-extrabold text-slate-900 dark:text-white tracking-tight leading-[1.1]"
          >
            A Place to Belong, <br />
            <span className="bg-gradient-to-r from-emerald-500 via-teal-400 to-indigo-500 bg-clip-text text-transparent">
              Grow, and Worship Together
            </span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="mt-6 max-w-2xl mx-auto text-lg sm:text-xl text-slate-600 dark:text-slate-300 font-normal leading-relaxed"
          >
            Discover vibrant Sunday services, engaging community groups, and
            life-changing events designed for every generation.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
            className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4"
          >
            <Link
              href="/events"
              className="w-full sm:w-auto px-8 py-4 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-white font-bold text-base shadow-lg shadow-emerald-500/25 hover:shadow-emerald-500/35 transition-all duration-200 flex items-center justify-center space-x-2 group"
            >
              <span>Explore Upcoming Events</span>
              <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </Link>
            <Link
              href="/about"
              className="w-full sm:w-auto px-8 py-4 rounded-xl border border-slate-300 dark:border-slate-700 bg-white/50 dark:bg-slate-900/50 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-900 dark:text-white font-semibold text-base transition-colors duration-200"
            >
              Our Mission & Vision
            </Link>
          </motion.div>
        </div>
      </section>

      {/* QUICK INFO CARDS */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="glass-card p-8 rounded-2xl border border-slate-200/80 dark:border-slate-800/80 space-y-4 hover:border-emerald-500/40 transition-colors">
            <div className="w-12 h-12 rounded-xl bg-emerald-500/10 text-emerald-500 flex items-center justify-center">
              <Clock className="w-6 h-6" />
            </div>
            <h3 className="text-xl font-bold text-slate-900 dark:text-white">
              Sunday Services
            </h3>
            <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
              Join us live in-person or online every Sunday at 9:00 AM & 11:30
              AM for inspiring worship and biblical teachings.
            </p>
          </div>

          <div className="glass-card p-8 rounded-2xl border border-slate-200/80 dark:border-slate-800/80 space-y-4 hover:border-emerald-500/40 transition-colors">
            <div className="w-12 h-12 rounded-xl bg-teal-500/10 text-teal-500 flex items-center justify-center">
              <MapPin className="w-6 h-6" />
            </div>
            <h3 className="text-xl font-bold text-slate-900 dark:text-white">
              Location & Campus
            </h3>
            <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
              Main Campus located at 123 Hope Boulevard, Cityville. Ample
              parking and friendly greeters await your arrival.
            </p>
          </div>

          <div className="glass-card p-8 rounded-2xl border border-slate-200/80 dark:border-slate-800/80 space-y-4 hover:border-emerald-500/40 transition-colors">
            <div className="w-12 h-12 rounded-xl bg-indigo-500/10 text-indigo-500 flex items-center justify-center">
              <Users className="w-6 h-6" />
            </div>
            <h3 className="text-xl font-bold text-slate-900 dark:text-white">
              Youth & Small Groups
            </h3>
            <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
              Connect deeply in small groups meeting during the week for
              fellowship, prayer, and personal encouragement.
            </p>
          </div>
        </div>
      </section>

      {/* FEATURED NEXT EVENT */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="relative rounded-3xl overflow-hidden bg-gradient-to-br from-slate-900 via-slate-900 to-emerald-950 p-8 sm:p-12 text-white border border-emerald-500/20 shadow-2xl">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
            <div className="lg:col-span-8 space-y-6">
              <div className="inline-flex items-center space-x-2 px-3.5 py-1 rounded-full bg-emerald-500/20 text-emerald-400 text-xs font-bold uppercase tracking-wider">
                <Calendar className="w-4 h-4" />
                <span>Next Upcoming Highlight Event</span>
              </div>
              <h2 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
                {nextEvent
                  ? nextEvent.title
                  : "Annual Faith & Worship Conference 2026"}
              </h2>
              <p className="text-slate-300 text-base leading-relaxed max-w-2xl">
                {nextEvent?.description ||
                  "Gather with believers across the region for three transformative days of praise, dynamic speakers, breakout sessions, and fellowship."}
              </p>
              <div className="flex flex-wrap gap-4 text-xs font-semibold text-slate-300">
                <div className="flex items-center space-x-2 bg-slate-800/80 px-3.5 py-2 rounded-xl border border-slate-700">
                  <Clock className="w-4 h-4 text-emerald-400" />
                  <span>
                    {nextEvent?.startDate
                      ? new Date(nextEvent.startDate).toLocaleDateString(
                          undefined,
                          {
                            weekday: "short",
                            month: "short",
                            day: "numeric",
                          },
                        )
                      : "Coming Up Soon"}
                  </span>
                </div>
                <div className="flex items-center space-x-2 bg-slate-800/80 px-3.5 py-2 rounded-xl border border-slate-700">
                  <MapPin className="w-4 h-4 text-emerald-400" />
                  <span>{nextEvent?.location || "Main Sanctuary"}</span>
                </div>
              </div>
            </div>

            <div className="lg:col-span-4 flex justify-start lg:justify-end">
              <Link
                href={nextEvent ? `/events/${nextEvent.id}` : "/events"}
                className="w-full sm:w-auto px-8 py-4 rounded-2xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-extrabold text-base shadow-xl shadow-emerald-500/30 transition-all duration-200 flex items-center justify-center space-x-2 group"
              >
                <span>Register Now</span>
                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* WELCOME STATEMENT */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto space-y-6">
          <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 text-emerald-500 flex items-center justify-center mx-auto">
            <Heart className="w-6 h-6" />
          </div>
          <h2 className="text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
            We exist to bring glory to God and hope to our city
          </h2>
          <p className="text-slate-600 dark:text-slate-400 text-base leading-relaxed">
            Whether you are exploring faith for the first time or looking for a
            home church to plant roots, you are warmly welcomed here. Join us in
            building a generation empowered by faith.
          </p>

          <div className="pt-4 grid grid-cols-1 sm:grid-cols-3 gap-4 text-left max-w-2xl mx-auto">
            <div className="flex items-center space-x-3 p-3 rounded-xl bg-slate-100 dark:bg-slate-800/50">
              <CheckCircle2 className="w-5 h-5 text-emerald-500 shrink-0" />
              <span className="text-xs font-semibold text-slate-800 dark:text-slate-200">
                Biblical Preaching
              </span>
            </div>
            <div className="flex items-center space-x-3 p-3 rounded-xl bg-slate-100 dark:bg-slate-800/50">
              <CheckCircle2 className="w-5 h-5 text-emerald-500 shrink-0" />
              <span className="text-xs font-semibold text-slate-800 dark:text-slate-200">
                Vibrant Community
              </span>
            </div>
            <div className="flex items-center space-x-3 p-3 rounded-xl bg-slate-100 dark:bg-slate-800/50">
              <CheckCircle2 className="w-5 h-5 text-emerald-500 shrink-0" />
              <span className="text-xs font-semibold text-slate-800 dark:text-slate-200">
                Active Ministries
              </span>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
