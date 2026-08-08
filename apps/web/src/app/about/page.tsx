import React from "react";
import { Metadata } from "next";
import { Compass, Target, Heart, Users, BookOpen, Award } from "lucide-react";
import { WeeklyServices } from "@/components/weekly-services";

export const metadata: Metadata = {
  title: "About Us, Mission & Vision",
  description:
    "Learn about Amazing Grace Bible Church, our core mission, vision, values, weekly service times, and pastoral leadership team.",
};

export default function AboutPage() {
  return (
    <div className="w-full flex flex-col">
      {/* HEADER HERO SECTION */}
      <section className="relative bg-[#0B1426] py-20 lg:py-28 overflow-hidden border-b border-white/5">
        {/* Decorative background grid and glow */}
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(217,119,6,0.08)_0%,transparent_75%)] pointer-events-none" />

        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 text-center space-y-6">
          <div className="inline-flex items-center space-x-2 px-3.5 py-1 rounded-full bg-amber-500/10 border border-amber-500/20 text-amber-400 text-xs font-bold uppercase tracking-widest">
            <Compass className="w-3.5 h-3.5" />
            <span>Our Story & Foundation</span>
          </div>
          <h1 className="text-4xl sm:text-6xl font-serif font-semibold text-white tracking-wide">
            Who We Are
          </h1>
          <p className="text-lg sm:text-xl text-slate-300 leading-relaxed font-sans max-w-3xl mx-auto">
            Amazing Grace Bible Church was founded with a singular conviction:
            to cultivate an inclusive, spirit-filled community where lives are
            restored by Christ&apos;s love and sent out to impact the world.
          </p>
        </div>
      </section>

      {/* MISSION & VISION GRID SECTION */}
      <section className="bg-[#0B1426] py-24 relative overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16">
            {/* Mission Card (Chapel Window Theme) */}
            <div className="relative group flex flex-col rounded-t-[8rem] rounded-b-3xl border border-white/10 bg-[#0F1D33] p-8 sm:p-12 hover:border-amber-500/30 transition-all duration-300 shadow-2xl">
              <div className="w-16 h-16 rounded-full bg-amber-500/10 border border-amber-500/20 text-amber-400 flex items-center justify-center mx-auto mb-6 group-hover:scale-105 transition-transform duration-300">
                <Target className="w-8 h-8" />
              </div>
              <h2 className="text-3xl font-serif font-semibold text-white text-center mb-8 tracking-wide">
                Our Mission
              </h2>

              <div className="flex-grow space-y-6">
                <div className="flex items-start space-x-4">
                  <span className="w-8 h-8 rounded-full bg-amber-500/10 text-amber-400 flex items-center justify-center shrink-0 font-bold text-sm border border-amber-500/20 mt-0.5 font-sans">
                    1
                  </span>
                  <div>
                    <h3 className="text-lg font-semibold text-white font-serif tracking-wide">
                      Make Heaven
                    </h3>
                    <p className="text-sm text-slate-450 mt-1 leading-relaxed">
                      To make heaven and ensure our final destination is secure
                      in Christ.
                    </p>
                  </div>
                </div>

                <div className="flex items-start space-x-4">
                  <span className="w-8 h-8 rounded-full bg-amber-500/10 text-amber-400 flex items-center justify-center shrink-0 font-bold text-sm border border-amber-500/20 mt-0.5 font-sans">
                    2
                  </span>
                  <div>
                    <h3 className="text-lg font-semibold text-white font-serif tracking-wide">
                      Raise an Army of Believers
                    </h3>
                    <p className="text-sm text-slate-450 mt-1 leading-relaxed">
                      To raise believers who glorify God in worship, service,
                      fellowship, character, and family life.
                    </p>
                  </div>
                </div>

                <div className="flex items-start space-x-4">
                  <span className="w-8 h-8 rounded-full bg-amber-500/10 text-amber-400 flex items-center justify-center shrink-0 font-bold text-sm border border-amber-500/20 mt-0.5 font-sans">
                    3
                  </span>
                  <div>
                    <h3 className="text-lg font-semibold text-white font-serif tracking-wide">
                      Lifestyle of Holiness
                    </h3>
                    <p className="text-sm text-slate-455 mt-1 leading-relaxed">
                      To make holiness our standard of living, reflecting the
                      character of Christ daily.
                    </p>
                  </div>
                </div>

                <div className="flex items-start space-x-4">
                  <span className="w-8 h-8 rounded-full bg-amber-500/10 text-amber-400 flex items-center justify-center shrink-0 font-bold text-sm border border-amber-500/20 mt-0.5 font-sans">
                    4
                  </span>
                  <div>
                    <h3 className="text-lg font-semibold text-white font-serif tracking-wide">
                      Plant Churches
                    </h3>
                    <p className="text-sm text-slate-450 mt-1 leading-relaxed">
                      To plant churches in every city and town all over the
                      world, expanding the Kingdom of God.
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Vision Card (Chapel Window Theme) */}
            <div className="relative group flex flex-col rounded-t-[8rem] rounded-b-3xl border border-white/10 bg-[#0F1D33] p-8 sm:p-12 hover:border-amber-500/30 transition-all duration-300 shadow-2xl text-center">
              <div className="w-16 h-16 rounded-full bg-amber-500/10 border border-amber-500/20 text-amber-400 flex items-center justify-center mx-auto mb-6 group-hover:scale-105 transition-transform duration-300">
                <Compass className="w-8 h-8" />
              </div>
              <h2 className="text-3xl font-serif font-semibold text-white mb-8 tracking-wide">
                Our Vision
              </h2>

              <div className="flex-grow flex flex-col justify-center space-y-6 px-2 sm:px-6">
                <p className="text-2xl sm:text-3xl font-serif font-medium text-slate-200 leading-relaxed italic">
                  &ldquo;To reach the lost with the gospel of Jesus Christ
                  through evangelism and Bible-based discipleship principles,
                  and to prepare a people fit for heaven.&rdquo;
                </p>

                <div className="pt-6 border-t border-white/5 space-y-2">
                  <p className="text-xs font-semibold text-amber-400 tracking-widest uppercase font-sans">
                    Scripture Foundation
                  </p>
                  <p className="text-sm font-serif text-slate-300 font-semibold tracking-wide">
                    Mark 16:15 &bull; Matthew 28:19-20
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CORE VALUES SECTION */}
      <section className="bg-[#0F1D33] py-24 border-t border-b border-white/5">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-16">
          <div className="text-center max-w-2xl mx-auto space-y-4">
            <h2 className="text-3xl sm:text-5xl font-serif font-semibold text-white tracking-wide">
              Our Core Values
            </h2>
            <p className="text-slate-400 text-base font-sans leading-relaxed">
              The foundational pillars that guide everything we do as a church
              family.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
            <div className="p-8 rounded-2xl bg-[#162744]/40 border border-white/10 space-y-4 hover:-translate-y-1 hover:border-amber-500/30 hover:shadow-lg transition-all duration-300">
              <div className="w-12 h-12 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-400 flex items-center justify-center">
                <BookOpen className="w-6 h-6" />
              </div>
              <h3 className="font-serif font-semibold text-lg text-white">
                Biblical Truth
              </h3>
              <p className="text-sm text-slate-400 leading-relaxed font-sans">
                Grounded firmly in scripture as our final authority and daily
                guide for living in accordance with God&apos;s will.
              </p>
            </div>

            <div className="p-8 rounded-2xl bg-[#162744]/40 border border-white/10 space-y-4 hover:-translate-y-1 hover:border-amber-500/30 hover:shadow-lg transition-all duration-300">
              <div className="w-12 h-12 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-400 flex items-center justify-center">
                <Heart className="w-6 h-6" />
              </div>
              <h3 className="font-serif font-semibold text-lg text-white">
                Genuine Love
              </h3>
              <p className="text-sm text-slate-400 leading-relaxed font-sans">
                Extending radical hospitality, kindness, and grace to every
                individual, reflecting Christ&apos;s unconditional love.
              </p>
            </div>

            <div className="p-8 rounded-2xl bg-[#162744]/40 border border-white/10 space-y-4 hover:-translate-y-1 hover:border-amber-500/30 hover:shadow-lg transition-all duration-300">
              <div className="w-12 h-12 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-400 flex items-center justify-center">
                <Users className="w-6 h-6" />
              </div>
              <h3 className="font-serif font-semibold text-lg text-white">
                Authentic Fellowship
              </h3>
              <p className="text-sm text-slate-400 leading-relaxed font-sans">
                Walking together through life&apos;s triumphs and trials in
                genuine community and transparent relationships.
              </p>
            </div>

            <div className="p-8 rounded-2xl bg-[#162744]/40 border border-white/10 space-y-4 hover:-translate-y-1 hover:border-amber-500/30 hover:shadow-lg transition-all duration-300">
              <div className="w-12 h-12 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-400 flex items-center justify-center">
                <Award className="w-6 h-6" />
              </div>
              <h3 className="font-serif font-semibold text-lg text-white">
                Excellence in Service
              </h3>
              <p className="text-sm text-slate-400 leading-relaxed font-sans">
                Honoring God by giving our very best effort in ministry,
                operation, and community outreach.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* WEEKLY SERVICES & LEADERSHIP SECTION (LIGHT THEME) */}
      <section className="w-full bg-[#FAF7F2] py-24 space-y-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <WeeklyServices />
        </div>

        {/* <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-16 border-t border-slate-200/50">
          <LeadershipSection compact={false} />
        </div> */}
      </section>
    </div>
  );
}
