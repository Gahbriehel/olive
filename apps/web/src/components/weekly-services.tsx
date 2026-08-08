"use client";

import React from "react";
import { Clock, Calendar, BookOpen, Heart, ShieldCheck } from "lucide-react";
import { motion } from "framer-motion";

export interface ServiceItem {
  id: string;
  title: string;
  day: string;
  time: string;
  tagline: string;
  description: string;
  icon: React.ElementType;
  badgeColor: string;
  highlights: string[];
}

export function WeeklyServices() {
  const services: ServiceItem[] = [
    {
      id: "sunday",
      title: "Sunday Celebration Service",
      day: "Every Sunday",
      time: "8:00 AM & 9:00 AM",
      tagline: "Sunday School & Celebration Service",
      description:
        "Our main weekly gathering for uplifting praise, biblical teaching, prayer, and warm Christian fellowship.",
      icon: Calendar,
      badgeColor: "bg-amber-500/10 text-amber-800 border-amber-500/20",
      highlights: [
        "9:00 AM – 8:55 AM: Sunday School",
        "9:00 AM – 11:30 PM: Praise, Worship & Word",
      ],
    },
    {
      id: "tuesday",
      title: "Bible Study (Digging Deep)",
      day: "Every Tuesday",
      time: "5:30 PM – 7:00 PM",
      tagline: "Verse-by-Verse Scripture Study",
      description:
        "In-depth interactive study of God's Word to build spiritual foundation and practical Christian living.",
      icon: BookOpen,
      badgeColor: "bg-slate-100 text-slate-700 border-slate-200",
      highlights: [
        "Verse-by-Verse Exposition",
        "Interactive Q&A & Practical Application",
      ],
    },
    {
      id: "thursday",
      title: "Corporate Prayer Meeting",
      day: "Every Thursday",
      time: "6:00 PM – 8:00 PM",
      tagline: "Intercession & Spiritual Growth",
      description:
        "Coming together to intercede for families, the church, nations, and personal breakthroughs in God's presence.",
      icon: ShieldCheck,
      badgeColor: "bg-amber-500/10 text-amber-800 border-amber-500/20",
      highlights: [
        "Corporate Prayer & Intercession",
        "Testimonies & Breakthroughs",
      ],
    },
  ];

  return (
    <section id="services" className="space-y-12 scroll-mt-24">
      <div className="text-center max-w-3xl mx-auto space-y-4">
        <div className="inline-flex items-center space-x-2 px-3.5 py-1.5 rounded-full bg-amber-500/10 border border-amber-500/20 text-amber-700 text-xs font-bold uppercase tracking-widest">
          <Clock className="w-3.5 h-3.5" />
          <span>Worship With Us</span>
        </div>
        <h2 className="text-3xl sm:text-5xl font-serif font-semibold text-slate-900 tracking-wide">
          Weekly Service Times
        </h2>
        <p className="text-slate-600 text-base sm:text-lg leading-relaxed">
          Join us in person for powerful worship, in-depth scripture study, and
          faith-filled prayer.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {services.map((service, idx) => {
          const Icon = service.icon;
          return (
            <motion.div
              key={service.id}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: idx * 0.1 }}
              className="relative group flex flex-col rounded-t-[5rem] rounded-b-2xl overflow-hidden border border-slate-200/60 bg-white hover:border-amber-600/40 hover:shadow-[0_20px_40px_rgba(0,0,0,0.06)] transition-all duration-300"
            >
              {/* TOP ARCHED NAVY HEADER */}
              <div className="bg-[#1A3A63] text-white p-6 pt-10 pb-8 flex flex-col items-center text-center space-y-4 rounded-t-[4.8rem]">
                <div className="w-14 h-14 rounded-full bg-amber-500/10 border border-amber-500/20 text-amber-400 flex items-center justify-center group-hover:scale-105 transition-all duration-300">
                  <Icon className="w-6 h-6" />
                </div>
                <span className="inline-flex items-center px-3 py-1 rounded-full bg-amber-600/20 border border-amber-500/30 text-amber-300 text-xs font-semibold uppercase tracking-wider">
                  {service.day}
                </span>
                <h3 className="text-xl sm:text-2xl font-serif font-medium text-white tracking-wide">
                  {service.title}
                </h3>
              </div>

              {/* BOTTOM WHITE CARD BODY */}
              <div className="p-6 pb-8 flex-1 flex flex-col justify-between space-y-5">
                <div className="space-y-4">
                  <div className="flex items-center justify-center space-x-2 text-sm font-semibold text-amber-800 bg-amber-500/10 py-1.5 px-3 rounded-xl border border-amber-500/15 max-w-max mx-auto">
                    <Clock className="w-4 h-4 text-amber-700" />
                    <span>{service.time}</span>
                  </div>

                  <p className="text-xs font-medium text-slate-400 italic text-center">
                    &quot;{service.tagline}&quot;
                  </p>

                  <p className="text-sm text-slate-600 leading-relaxed text-center">
                    {service.description}
                  </p>
                </div>

                <div className="pt-5 border-t border-slate-100 space-y-2.5">
                  {service.highlights.map((item, i) => (
                    <div
                      key={i}
                      className="flex items-center space-x-2.5 text-xs text-slate-600 justify-center"
                    >
                      <Heart className="w-3.5 h-3.5 text-amber-600 shrink-0" />
                      <span>{item}</span>
                    </div>
                  ))}
                </div>
              </div>
            </motion.div>
          );
        })}
      </div>
    </section>
  );
}
