import React from "react";
import { Metadata } from "next";
import { Compass, Target, Heart, Users, BookOpen, Award } from "lucide-react";
import { LeadershipSection } from "@/components/leadership-section";
import { WeeklyServices } from "@/components/weekly-services";

export const metadata: Metadata = {
  title: "About Us, Mission & Vision",
  description:
    "Learn about Amazing Grace Bible Church, our core mission, vision, values, weekly service times, and pastoral leadership team.",
};

export default function AboutPage() {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 lg:py-20 space-y-20">
      {/* HEADER SECTION */}
      <div className="text-center max-w-3xl mx-auto space-y-4">
        <div className="inline-flex items-center space-x-2 px-3.5 py-1 rounded-full bg-amber-500/15 border border-amber-500/30 text-amber-400 text-xs font-bold uppercase tracking-wider">
          <Compass className="w-4 h-4" />
          <span>Our Story & Foundation</span>
        </div>
        <h1 className="text-4xl sm:text-5xl font-extrabold text-white tracking-tight">
          Who We Are
        </h1>
        <p className="text-lg text-slate-300 leading-relaxed">
          Amazing Grace Bible Church was founded with a singular
          conviction: to cultivate an inclusive, spirit-filled community where
          lives are restored by Christ&apos;s love and sent out to impact the
          world.
        </p>
      </div>

      {/* MISSION & VISION GRID */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Mission Card */}
        <div className="p-8 sm:p-10 rounded-3xl border border-white/10 bg-[#0F1D33] relative overflow-hidden space-y-4">
          <div className="w-14 h-14 rounded-2xl bg-amber-500/15 text-amber-400 flex items-center justify-center">
            <Target className="w-7 h-7" />
          </div>
          <h2 className="text-2xl font-bold text-white">Our Mission</h2>
          <p className="text-slate-300 text-base leading-relaxed">
            To reach people with the transforming Gospel of Jesus Christ,
            disciple them into spiritual maturity, and equip every believer to
            serve their family, city, and nation with excellence and love.
          </p>
        </div>

        {/* Vision Card */}
        <div className="p-8 sm:p-10 rounded-3xl border border-white/10 bg-[#0F1D33] relative overflow-hidden space-y-4">
          <div className="w-14 h-14 rounded-2xl bg-amber-500/15 text-amber-400 flex items-center justify-center">
            <Compass className="w-7 h-7" />
          </div>
          <h2 className="text-2xl font-bold text-white">Our Vision</h2>
          <p className="text-slate-300 text-base leading-relaxed">
            A thriving, multi-generational church movement known for
            unconditional love, impactful community initiatives, spirit-led
            worship, and raising up servant-leaders across all spheres of
            society.
          </p>
        </div>
      </div>

      {/* CORE VALUES */}
      <div className="space-y-10">
        <div className="text-center max-w-2xl mx-auto">
          <h2 className="text-3xl font-extrabold text-white">
            Our Core Values
          </h2>
          <p className="text-sm text-slate-400 mt-2">
            The principles that guide everything we do as a church family.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="p-6 rounded-2xl bg-[#0F1D33] border border-white/10 space-y-3">
            <BookOpen className="w-6 h-6 text-amber-400" />
            <h3 className="font-bold text-base text-white">Biblical Truth</h3>
            <p className="text-xs text-slate-400">
              Grounded firmly in scripture as our final authority and daily
              guide for living.
            </p>
          </div>

          <div className="p-6 rounded-2xl bg-[#0F1D33] border border-white/10 space-y-3">
            <Heart className="w-6 h-6 text-rose-400" />
            <h3 className="font-bold text-base text-white">Genuine Love</h3>
            <p className="text-xs text-slate-400">
              Extending radical hospitality, kindness, and grace to every
              individual.
            </p>
          </div>

          <div className="p-6 rounded-2xl bg-[#0F1D33] border border-white/10 space-y-3">
            <Users className="w-6 h-6 text-amber-400" />
            <h3 className="font-bold text-base text-white">
              Authentic Fellowship
            </h3>
            <p className="text-xs text-slate-400">
              Walking together through life&apos;s triumphs and trials in
              genuine community.
            </p>
          </div>

          <div className="p-6 rounded-2xl bg-[#0F1D33] border border-white/10 space-y-3">
            <Award className="w-6 h-6 text-amber-400" />
            <h3 className="font-bold text-base text-white">
              Excellence in Service
            </h3>
            <p className="text-xs text-slate-400">
              Honoring God by giving our very best effort in ministry and
              outreach.
            </p>
          </div>
        </div>
      </div>

      {/* WEEKLY SERVICES SECTION */}
      <div className="pt-10 border-t border-white/10">
        <WeeklyServices />
      </div>

      {/* LEADERSHIP SECTION */}
      <div className="pt-10 border-t border-white/10">
        <LeadershipSection />
      </div>
    </div>
  );
}
