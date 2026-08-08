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
import { Hero } from "@/components/hero";

export default function HomePage() {
  const { data: events = [] } = useQuery({
    queryKey: ["publishedEvents"],
    queryFn: () => webService.getPublishedEvents(),
  });

  const nextEvent = events.length > 0 ? events[0] : null;

  return (
    <div className="pb-20">
      {/* HERO SECTION */}
      <Hero />

      {/* MISSION & VISION EXCERPT SECTION */}
      <section className="w-full bg-[#0B1426] py-24 border-b border-white/5 relative overflow-hidden">
        {/* Soft radial glow */}
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(217,119,6,0.08)_0%,transparent_70%)] pointer-events-none" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            {/* Left side: Heading */}
            <div className="lg:col-span-5 space-y-6">
              <div className="inline-flex items-center space-x-2 px-3.5 py-1 rounded-full bg-amber-500/10 border border-amber-500/20 text-amber-400 text-xs font-bold uppercase tracking-widest">
                <span>Our Divine Mandate</span>
              </div>
              <h2 className="text-4xl sm:text-5xl font-serif font-semibold text-white tracking-wide leading-tight">
                Our Mission <br />& Vision
              </h2>
              <p className="text-slate-300 text-base leading-relaxed font-sans max-w-md">
                We are committed to making heaven, raising an army of believers,
                and taking the message of salvation, healing, and miracles to
                the ends of the earth.
              </p>
              <div className="pt-2">
                <Link
                  href="/about"
                  className="inline-flex items-center space-x-2 px-6 py-3 rounded-xl bg-amber-600 hover:bg-amber-500 text-white font-bold text-sm tracking-wider shadow-lg shadow-amber-900/20 transition-all duration-200 group border border-amber-500/50"
                >
                  <span>Read Our Full Story</span>
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </Link>
              </div>
            </div>

            {/* Right side: Excerpt Cards */}
            <div className="lg:col-span-7 grid grid-cols-1 sm:grid-cols-2 gap-6">
              {/* Mission Card */}
              <div className="relative group flex flex-col rounded-2xl overflow-hidden border border-white/10 bg-[#0F1D33] hover:border-amber-500/30 transition-all duration-300 shadow-xl">
                <div className="bg-[#162744] p-6 pt-8 pb-6 text-center border-b border-white/5">
                  <h3 className="text-xl font-serif font-semibold text-amber-400">
                    Our Mission
                  </h3>
                </div>
                <div className="p-6 flex-grow flex flex-col justify-between space-y-4">
                  <ul className="space-y-3 text-sm text-slate-300">
                    <li className="flex items-start space-x-2.5">
                      <span className="text-amber-500 font-bold shrink-0 mt-0.5">
                        •
                      </span>
                      <span>To make heaven.</span>
                    </li>
                    <li className="flex items-start space-x-2.5">
                      <span className="text-amber-500 font-bold shrink-0 mt-0.5">
                        •
                      </span>
                      <span>To raise an army of believers to glorify God.</span>
                    </li>
                    <li className="flex items-start space-x-2.5">
                      <span className="text-amber-500 font-bold shrink-0 mt-0.5">
                        •
                      </span>
                      <span>To make holiness our lifestyle.</span>
                    </li>
                  </ul>
                  <div className="text-xs text-amber-400 font-semibold pt-2 text-right group-hover:text-amber-300 transition-colors">
                    And more...
                  </div>
                </div>
              </div>

              {/* Vision Card */}
              <div className="relative group flex flex-col rounded-2xl overflow-hidden border border-white/10 bg-[#0F1D33] hover:border-amber-500/30 transition-all duration-300 shadow-xl">
                <div className="bg-[#162744] p-6 pt-8 pb-6 text-center border-b border-white/5">
                  <h3 className="text-xl font-serif font-semibold text-amber-400">
                    Our Vision
                  </h3>
                </div>
                <div className="p-6 flex-grow flex flex-col justify-between space-y-4">
                  <p className="text-sm text-slate-300 leading-relaxed font-sans">
                    To reach the lost with the gospel of Jesus Christ through
                    evangelism and Bible-based discipleship principles, and to
                    prepare a people fit for heaven.
                  </p>
                  <p className="text-xs italic text-slate-400 pt-2">
                    Mark 16:15, Matthew 28:19-20
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* WEEKLY SERVICES SECTION */}
      <section className="w-full bg-[#EFECE6] py-24 border-b border-slate-200/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <WeeklyServices />
        </div>
      </section>

      {/* DYNAMIC FEATURED EVENT / THEME ANNOUNCEMENT BANNER */}
      <section className="max-w-7xl min-h-screen mx-auto px-4 sm:px-6 lg:px-8 py-24">
        <div className="relative rounded-3xl overflow-hidden bg-[#0b0f19]/80 backdrop-blur-md p-8 sm:p-12 text-white border border-white/5 shadow-2xl">
          <div className="space-y-6">
            <div className="space-y-6">
              <div className="inline-flex items-center space-x-2 px-3.5 py-1.5 rounded-full bg-amber-500/10 border border-amber-500/20 text-amber-400 text-xs font-bold uppercase tracking-widest">
                <Calendar className="w-4 h-4" />
                <span>
                  {nextEvent ? "Featured Upcoming Program" : "Night Of Wonders"}
                </span>
              </div>
              <h2 className="text-3xl sm:text-5xl font-serif font-semibold text-white tracking-wide">
                {nextEvent ? nextEvent.title : "Night Of Wonders"}
              </h2>
              <p className="text-slate-300 text-base leading-relaxed max-w-2xl">
                {nextEvent?.description || ""}
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
                      : "Coming Up this Month"}
                  </span>
                </div>
                <div className="flex items-center space-x-2 bg-white/5 px-3.5 py-2 rounded-xl border border-white/10">
                  <MapPin className="w-4 h-4 text-amber-400" />
                  <span>{nextEvent?.location || "Church Auditorium"}</span>
                </div>
              </div>
              <div className="pt-2">
                <Link
                  href={nextEvent ? `/events/${nextEvent.id}` : "/events"}
                  className="inline-flex items-center space-x-2 px-8 py-4 rounded-xl bg-amber-600 hover:bg-amber-500 text-white font-extrabold text-base shadow-xl shadow-amber-900/30 transition-all duration-200 group border border-amber-500/50"
                >
                  <span>{nextEvent ? "Register Now" : ""}</span>
                  <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* LEADERSHIP TEAM PREVIEW */}
      {/* <section className="w-full bg-[#FAF7F2] py-24 border-t border-slate-200/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <LeadershipSection compact={true} />
        </div>
      </section> */}

      {/* WELCOME STATEMENT & PILLARS */}
      <section className="w-full bg-[#FAF7F2] mx-auto px-4 sm:px-6 lg:px-8 py-24">
        <div className="p-10 rounded-3xl border border-amber-600/15 bg-[#EFECE6] text-center max-w-4xl mx-auto space-y-6 shadow-md text-slate-900">
          <div className="w-12 h-12 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-amber-600 flex items-center justify-center mx-auto">
            <Heart className="w-6 h-6" />
          </div>
          <h2 className="text-3xl sm:text-4xl font-serif font-semibold text-slate-900 tracking-wide">
            We Exist to Bring Glory to God & Hope to Our City
          </h2>
          <p className="text-slate-600 text-base leading-relaxed max-w-2xl mx-auto">
            Whether you are exploring faith for the first time or looking for a
            home church to plant roots, you are warmly welcomed here.
          </p>

          <div className="pt-4 flex flex-col sm:flex-row items-center justify-center gap-4 max-w-2xl mx-auto">
            <div className="flex items-center space-x-3 p-3 rounded-xl bg-white border border-slate-200/60 shadow-sm">
              <CheckCircle2 className="w-5 h-5 text-amber-600 shrink-0" />
              <span className="text-xs font-semibold text-slate-800">
                Biblical Preaching
              </span>
            </div>
            <div className="flex items-center space-x-3 p-3 rounded-xl bg-white border border-slate-200/60 shadow-sm">
              <CheckCircle2 className="w-5 h-5 text-amber-600 shrink-0" />
              <span className="text-xs font-semibold text-slate-800">
                Vibrant Community
              </span>
            </div>
            <div className="flex items-center space-x-3 p-3 rounded-xl bg-white border border-slate-200/60 shadow-sm">
              <BookOpen className="w-5 h-5 text-amber-600 shrink-0" />
              <span className="text-xs font-semibold text-slate-800">
                Active Discipleship
              </span>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
