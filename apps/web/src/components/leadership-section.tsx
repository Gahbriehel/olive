"use client";

import React from "react";
import { Users, HeartHandshake, ShieldCheck } from "lucide-react";
import { motion } from "framer-motion";

export interface Leader {
  id: string;
  name: string;
  role: string;
  bio: string;
  initials: string;
}

export function LeadershipSection({ compact = false }: { compact?: boolean }) {
  const leaders: Leader[] = [
    {
      id: "1",
      name: "Pastor Timothy Kolawole",
      role: "Lead Pastor & General Overseer",
      bio: "Dedicated man of God passionate about salvation, healing, and revival. Leading Grace City with over 20 years of faithful ministry experience.",
      initials: "TK",
    },
    {
      id: "2",
      name: "Pastor Elizabeth Kolawole",
      role: "Associate Pastor & Women's Ministry Lead",
      bio: "Serving alongside leadership with grace, nurturing families, spiritual growth, and community outreach programs across all age groups.",
      initials: "EK",
    },
    {
      id: "3",
      name: "Deacon Samuel Adebayo",
      role: "Head of Operations & Youth Outreach",
      bio: "Empowering young people to discover their God-given purpose through active discipleship, mentorship, and community engagement.",
      initials: "SA",
    },
  ];

  const displayedLeaders = compact ? leaders.slice(0, 3) : leaders;

  return (
    <section className="space-y-12">
      <div className="text-center max-w-3xl mx-auto space-y-4">
        <div className="inline-flex items-center space-x-2 px-3.5 py-1.5 rounded-full bg-amber-500/10 border border-amber-500/20 text-amber-700 text-xs font-bold uppercase tracking-widest">
          <Users className="w-3.5 h-3.5" />
          <span>Servant Leadership</span>
        </div>
        <h2 className="text-3xl sm:text-5xl font-serif font-semibold text-slate-900 tracking-wide">
          Meet Our Pastoral Team & Leaders
        </h2>
        <p className="text-slate-600 text-base sm:text-lg leading-relaxed">
          Dedicated servants of God committed to guiding our congregation with
          wisdom, humility, and divine love.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {displayedLeaders.map((leader, idx) => (
          <motion.div
            key={leader.id}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: idx * 0.1 }}
            className="relative group flex flex-col rounded-t-[5rem] rounded-b-2xl overflow-hidden border border-slate-200/60 bg-white hover:border-amber-600/40 hover:shadow-[0_20px_40px_rgba(0,0,0,0.06)] transition-all duration-300"
          >
            {/* TOP ARCHED NAVY HEADER */}
            <div className="bg-[#1A3A63] text-white p-6 pt-10 pb-8 flex flex-col items-center text-center space-y-4 rounded-t-[4.8rem]">
              <div className="w-20 h-20 rounded-full bg-amber-500/10 border border-amber-500/20 text-amber-400 flex items-center justify-center font-extrabold text-2xl tracking-wider group-hover:scale-105 transition-all duration-300">
                {leader.initials}
              </div>
              <span className="inline-flex items-center px-3 py-1 rounded-full bg-amber-600/20 border border-amber-500/30 text-amber-300 text-xs font-semibold uppercase tracking-wider text-center">
                {leader.role}
              </span>
              <h3 className="text-xl sm:text-2xl font-serif font-medium text-white tracking-wide">
                {leader.name}
              </h3>
            </div>

            {/* BOTTOM WHITE CARD BODY */}
            <div className="p-6 pb-8 flex-1 flex flex-col justify-between space-y-5">
              <p className="text-sm text-slate-600 leading-relaxed text-center px-2">
                {leader.bio}
              </p>

              <div className="pt-5 border-t border-slate-100 flex items-center justify-center space-x-3 text-xs text-slate-500">
                <span className="flex items-center space-x-1.5">
                  <ShieldCheck className="w-3.5 h-3.5 text-amber-600" />
                  <span>Faithful Ministry</span>
                </span>
                <span>•</span>
                <span className="flex items-center space-x-1.5">
                  <HeartHandshake className="w-3.5 h-3.5 text-amber-600" />
                  <span>Pastoral Care</span>
                </span>
              </div>
            </div>
          </motion.div>
        ))}
      </div>
    </section>
  );
}
