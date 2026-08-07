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
    <section className="space-y-8">
      <div className="text-center max-w-3xl mx-auto space-y-3">
        <div className="inline-flex items-center space-x-2 px-3.5 py-1 rounded-full bg-amber-500/15 border border-amber-500/30 text-amber-400 text-xs font-bold uppercase tracking-wider">
          <Users className="w-3.5 h-3.5" />
          <span>Servant Leadership</span>
        </div>
        <h2 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
          Meet Our Pastoral Team & Leaders
        </h2>
        <p className="text-slate-400 text-base leading-relaxed">
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
            transition={{ duration: 0.4, delay: idx * 0.1 }}
            className="rounded-3xl p-6 border border-white/10 bg-[#0F1D33] hover:border-amber-500/20 shadow-sm hover:shadow-md transition-all duration-200 space-y-5 text-center flex flex-col justify-between"
          >
            <div className="space-y-4">
              {/* Leader Avatar Badge */}
              <div className="mx-auto w-20 h-20 rounded-full bg-gradient-to-br from-[#1A3A63] to-[#2A5090] flex items-center justify-center text-white font-extrabold text-2xl tracking-wider shadow-md border border-white/10">
                {leader.initials}
              </div>

              <div>
                <h3 className="text-xl font-bold text-white">{leader.name}</h3>
                <span className="inline-block mt-1 px-3 py-0.5 rounded-full bg-amber-500/15 text-amber-400 text-xs font-semibold">
                  {leader.role}
                </span>
              </div>

              <p className="text-sm text-slate-300 leading-relaxed px-2">
                {leader.bio}
              </p>
            </div>

            <div className="pt-4 border-t border-white/10 flex items-center justify-center space-x-3 text-xs text-slate-400">
              <span className="flex items-center space-x-1">
                <ShieldCheck className="w-3.5 h-3.5 text-amber-500" />
                <span>Faithful Ministry</span>
              </span>
              <span>•</span>
              <span className="flex items-center space-x-1">
                <HeartHandshake className="w-3.5 h-3.5 text-amber-500" />
                <span>Pastoral Care</span>
              </span>
            </div>
          </motion.div>
        ))}
      </div>
    </section>
  );
}
