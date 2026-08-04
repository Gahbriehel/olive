import React from "react";
import { Metadata } from "next";
import {
  Compass,
  Target,
  Heart,
  Users,
  BookOpen,
  ShieldCheck,
  Award,
} from "lucide-react";

export const metadata: Metadata = {
  title: "About Us, Mission & Vision",
  description:
    "Learn about Grace City Church, our core mission, vision, values, and pastoral leadership team.",
};

export default function AboutPage() {
  const leadershipTeam = [
    {
      name: "Pastor David & Sarah Jenkins",
      role: "Lead Pastors",
      bio: "Serving with a passion for biblical teaching, community outreach, and mentoring the next generation.",
      avatar:
        "https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=400&q=80",
    },
    {
      name: "Pastor Marcus Vance",
      role: "Youth & Executive Pastor",
      bio: "Dedicated to discipling youth, developing leadership teams, and organizing community events.",
      avatar:
        "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=400&q=80",
    },
    {
      name: "Rachel Coleman",
      role: "Worship & Arts Director",
      bio: "Leading creative arts, music ministry, and passionate corporate worship every week.",
      avatar:
        "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=400&q=80",
    },
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 lg:py-20 space-y-20">
      {/* HEADER SECTION */}
      <div className="text-center max-w-3xl mx-auto space-y-4">
        <div className="inline-flex items-center space-x-2 px-3.5 py-1 rounded-full bg-emerald-500/10 text-emerald-500 text-xs font-bold uppercase tracking-wider">
          <Compass className="w-4 h-4" />
          <span>Our Story & Foundation</span>
        </div>
        <h1 className="text-4xl sm:text-5xl font-extrabold text-slate-900 dark:text-white tracking-tight">
          Who We Are
        </h1>
        <p className="text-lg text-slate-600 dark:text-slate-300 leading-relaxed">
          Grace City Church was founded with a singular conviction: to cultivate
          an inclusive, spirit-filled community where lives are restored by
          Christ&apos;s love and sent out to impact the world.
        </p>
      </div>

      {/* MISSION & VISION GRID */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Mission Card */}
        <div className="glass-card p-8 sm:p-10 rounded-3xl border border-emerald-500/30 dark:border-emerald-500/20 relative overflow-hidden space-y-4">
          <div className="w-14 h-14 rounded-2xl bg-emerald-500/10 text-emerald-500 flex items-center justify-center">
            <Target className="w-7 h-7" />
          </div>
          <h2 className="text-2xl font-bold text-slate-900 dark:text-white">
            Our Mission
          </h2>
          <p className="text-slate-600 dark:text-slate-300 text-base leading-relaxed">
            To reach people with the transforming Gospel of Jesus Christ,
            disciple them into spiritual maturity, and equip every believer to
            serve their family, city, and nation with excellence and love.
          </p>
        </div>

        {/* Vision Card */}
        <div className="glass-card p-8 sm:p-10 rounded-3xl border border-indigo-500/30 dark:border-indigo-500/20 relative overflow-hidden space-y-4">
          <div className="w-14 h-14 rounded-2xl bg-indigo-500/10 text-indigo-500 flex items-center justify-center">
            <Compass className="w-7 h-7" />
          </div>
          <h2 className="text-2xl font-bold text-slate-900 dark:text-white">
            Our Vision
          </h2>
          <p className="text-slate-600 dark:text-slate-300 text-base leading-relaxed">
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
          <h2 className="text-3xl font-extrabold text-slate-900 dark:text-white">
            Our Core Values
          </h2>
          <p className="text-sm text-slate-600 dark:text-slate-400 mt-2">
            The principles that guide everything we do as a church family.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="p-6 rounded-2xl bg-slate-100 dark:bg-slate-800/40 border border-slate-200/80 dark:border-slate-800 space-y-3">
            <BookOpen className="w-6 h-6 text-emerald-500" />
            <h3 className="font-bold text-base text-slate-900 dark:text-white">
              Biblical Truth
            </h3>
            <p className="text-xs text-slate-600 dark:text-slate-400">
              Grounded firmly in scripture as our final authority and daily
              guide for living.
            </p>
          </div>

          <div className="p-6 rounded-2xl bg-slate-100 dark:bg-slate-800/40 border border-slate-200/80 dark:border-slate-800 space-y-3">
            <Heart className="w-6 h-6 text-rose-500" />
            <h3 className="font-bold text-base text-slate-900 dark:text-white">
              Genuine Love
            </h3>
            <p className="text-xs text-slate-600 dark:text-slate-400">
              Extending radical hospitality, kindness, and grace to every
              individual.
            </p>
          </div>

          <div className="p-6 rounded-2xl bg-slate-100 dark:bg-slate-800/40 border border-slate-200/80 dark:border-slate-800 space-y-3">
            <Users className="w-6 h-6 text-indigo-500" />
            <h3 className="font-bold text-base text-slate-900 dark:text-white">
              Authentic Fellowship
            </h3>
            <p className="text-xs text-slate-600 dark:text-slate-400">
              Walking together through life&apos;s triumphs and trials in
              genuine community.
            </p>
          </div>

          <div className="p-6 rounded-2xl bg-slate-100 dark:bg-slate-800/40 border border-slate-200/80 dark:border-slate-800 space-y-3">
            <Award className="w-6 h-6 text-amber-500" />
            <h3 className="font-bold text-base text-slate-900 dark:text-white">
              Excellence in Service
            </h3>
            <p className="text-xs text-slate-600 dark:text-slate-400">
              Honoring God by giving our very best effort in ministry and
              outreach.
            </p>
          </div>
        </div>
      </div>

      {/* LEADERSHIP TEAM */}
      <div className="space-y-10 pt-10 border-t border-slate-200/60 dark:border-slate-800/60">
        <div className="text-center max-w-2xl mx-auto space-y-2">
          <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-indigo-500/10 text-indigo-500 text-xs font-bold uppercase tracking-wider">
            <ShieldCheck className="w-4 h-4" />
            <span>Leadership</span>
          </div>
          <h2 className="text-3xl font-extrabold text-slate-900 dark:text-white">
            Meet Our Pastoral Team
          </h2>
          <p className="text-sm text-slate-600 dark:text-slate-400">
            Dedicated leaders serving our church community with wisdom and care.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {leadershipTeam.map((member, idx) => (
            <div
              key={idx}
              className="glass-card rounded-2xl overflow-hidden border border-slate-200/80 dark:border-slate-800/80 hover:border-emerald-500/40 transition-all duration-200 group"
            >
              <div className="h-64 overflow-hidden relative bg-slate-800">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={member.avatar}
                  alt={member.name}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-transparent to-transparent" />
                <div className="absolute bottom-4 left-4 right-4">
                  <span className="text-xs font-semibold text-emerald-400 uppercase tracking-wider">
                    {member.role}
                  </span>
                  <h3 className="text-lg font-bold text-white">
                    {member.name}
                  </h3>
                </div>
              </div>
              <div className="p-6">
                <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                  {member.bio}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
