"use client";

import React from "react";
import Link from "next/link";
import {
  Calendar,
  ArrowRight,
  MapPin,
  Clock,
  Heart,
  CheckCircle2,
  BookOpen,
} from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { webService } from "@/services/api";
import { WeeklyServices } from "@/components/weekly-services";
import { LeadershipSection } from "@/components/leadership-section";
import { Hero } from "@/components/hero";

export default function HomePage() {
  const { data: events = [] } = useQuery({
    queryKey: ["publishedEvents"],
    queryFn: () => webService.getPublishedEvents(),
  });

  const nextEvent = events.length > 0 ? events[0] : null;

  return (
    <div className="space-y-24 pb-20">
      {/* HERO SECTION */}
      <Hero />

      {/* WEEKLY SERVICES SECTION */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <WeeklyServices />
      </section>

      {/* DYNAMIC FEATURED EVENT / THEME ANNOUNCEMENT BANNER */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="relative rounded-3xl overflow-hidden bg-[#0F1D33] p-8 sm:p-12 text-white border border-slate-700/50 shadow-2xl">
          <div className="space-y-6">
            <div className="space-y-6">
              <div className="inline-flex items-center space-x-2 px-3.5 py-1 rounded-full bg-amber-500/15 text-amber-300 text-xs font-bold uppercase tracking-wider">
                <Calendar className="w-4 h-4" />
                <span>
                  {nextEvent
                    ? "Featured Upcoming Program"
                    : "Special Church Revival & Theme"}
                </span>
              </div>
              <h2 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
                {nextEvent
                  ? nextEvent.title
                  : '4-Day Salvation & Faith Revival — "I Will Rise"'}
              </h2>
              <p className="text-slate-300 text-base leading-relaxed max-w-2xl">
                {nextEvent?.description ||
                  "Join us for a transformative gathering anchored on Acts 3:6. Experience the power of God through anointed worship, word, and corporate prayer."}
              </p>
              <div className="flex flex-wrap gap-4 text-xs font-semibold text-slate-300">
                <div className="flex items-center space-x-2 bg-white/5 px-3.5 py-2 rounded-xl border border-white/10">
                  <Clock className="w-4 h-4 text-amber-400" />
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
                      : "Coming Up Next Month"}
                  </span>
                </div>
                <div className="flex items-center space-x-2 bg-white/5 px-3.5 py-2 rounded-xl border border-white/10">
                  <MapPin className="w-4 h-4 text-amber-400" />
                  <span>
                    {nextEvent?.location || "Grace City Main Sanctuary"}
                  </span>
                </div>
              </div>
              <div>
                <Link
                  href={nextEvent ? `/events/${nextEvent.id}` : "/events"}
                  className="inline-flex items-center space-x-2 px-8 py-4 rounded-xl bg-amber-600 hover:bg-amber-500 text-white font-extrabold text-base shadow-xl shadow-amber-900/30 transition-all duration-200 group border border-amber-500/50"
                >
                  <span>
                    {nextEvent ? "Register Now" : "View Event Details"}
                  </span>
                  <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* LEADERSHIP TEAM PREVIEW */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <LeadershipSection compact={true} />
      </section>

      {/* WELCOME STATEMENT & PILLARS */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="p-10 rounded-3xl border border-slate-700/50 bg-[#0F1D33] text-center max-w-4xl mx-auto space-y-6">
          <div className="w-12 h-12 rounded-2xl bg-amber-500/15 text-amber-400 flex items-center justify-center mx-auto">
            <Heart className="w-6 h-6" />
          </div>
          <h2 className="text-3xl font-extrabold text-white tracking-tight">
            We Exist to Bring Glory to God & Hope to Our City
          </h2>
          <p className="text-slate-400 text-base leading-relaxed max-w-2xl mx-auto">
            Whether you are exploring faith for the first time or looking for a
            home church to plant roots, you are warmly welcomed here.
          </p>

          <div className="pt-4 flex flex-col sm:flex-row items-center justify-center gap-4 max-w-2xl mx-auto">
            <div className="flex items-center space-x-3 p-3 rounded-xl bg-white/5 border border-white/10">
              <CheckCircle2 className="w-5 h-5 text-amber-400 shrink-0" />
              <span className="text-xs font-semibold text-slate-200">
                Biblical Preaching
              </span>
            </div>
            <div className="flex items-center space-x-3 p-3 rounded-xl bg-white/5 border border-white/10">
              <CheckCircle2 className="w-5 h-5 text-amber-400 shrink-0" />
              <span className="text-xs font-semibold text-slate-200">
                Vibrant Community
              </span>
            </div>
            <div className="flex items-center space-x-3 p-3 rounded-xl bg-white/5 border border-white/10">
              <BookOpen className="w-5 h-5 text-amber-400 shrink-0" />
              <span className="text-xs font-semibold text-slate-200">
                Active Discipleship
              </span>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
