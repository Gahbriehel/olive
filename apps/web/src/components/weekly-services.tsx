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
      time: "7:30 AM & 9:00 AM",
      tagline: "Sunday School & Main Worship",
      description:
        "Our main weekly gathering for uplifting praise, biblical teaching, prayer, and warm Christian fellowship.",
      icon: Calendar,
      badgeColor: "bg-amber-500/15 text-amber-400 border-amber-500/30",
      highlights: [
        "9:00 AM – 10:00 AM: Sunday School",
        "10:00 AM – 12:30 PM: Praise, Worship & Word",
      ],
    },
    {
      id: "tuesday",
      title: "Bible Study (Digging Deep)",
      day: "Every Tuesday",
      time: "6:30 PM – 8:00 PM",
      tagline: "Verse-by-Verse Scripture Study",
      description:
        "In-depth interactive study of God's Word to build spiritual foundation and practical Christian living.",
      icon: BookOpen,
      badgeColor: "bg-white/5 text-slate-300 border-white/10",
      highlights: [
        "Verse-by-Verse Exposition",
        "Interactive Q&A & Practical Application",
      ],
    },
    {
      id: "thursday",
      title: "Corporate Prayer Meeting",
      day: "Every Thursday",
      time: "6:00 PM – 7:30 PM",
      tagline: "Intercession & Spiritual Growth",
      description:
        "Coming together to intercede for families, the church, nations, and personal breakthroughs in God's presence.",
      icon: ShieldCheck,
      badgeColor: "bg-amber-500/15 text-amber-400 border-amber-500/30",
      highlights: [
        "Corporate Prayer & Intercession",
        "Testimonies & Breakthroughs",
      ],
    },
  ];

  return (
    <section id="services" className="space-y-8 scroll-mt-24">
      <div className="text-center max-w-3xl mx-auto space-y-3">
        <div className="inline-flex items-center space-x-2 px-3.5 py-1 rounded-full bg-amber-500/15 border border-amber-500/30 text-amber-400 text-xs font-bold uppercase tracking-wider">
          <Clock className="w-3.5 h-3.5" />
          <span>Worship With Us</span>
        </div>
        <h2 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
          Weekly Service Times
        </h2>
        <p className="text-slate-400 text-base leading-relaxed">
          Join us in person for powerful worship, in-depth scripture study, and
          faith-filled prayer.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 lg:gap-8">
        {services.map((service, idx) => {
          const Icon = service.icon;
          return (
            <motion.div
              key={service.id}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4, delay: idx * 0.1 }}
              className="relative group rounded-3xl p-7 border border-white/10 bg-[#0F1D33] shadow-sm hover:shadow-lg hover:border-amber-500/20 transition-all duration-200 flex flex-col justify-between"
            >
              <div className="space-y-5">
                <div className="flex items-center justify-between">
                  <div className="w-12 h-12 rounded-2xl bg-white/5 flex items-center justify-center text-amber-400 group-hover:scale-105 transition-transform">
                    <Icon className="w-6 h-6" />
                  </div>
                  <span
                    className={`inline-flex items-center px-3 py-1 rounded-full border text-xs font-semibold uppercase tracking-wider ${service.badgeColor}`}
                  >
                    {service.day}
                  </span>
                </div>

                <div>
                  <h3 className="text-xl font-bold text-white group-hover:text-amber-400 transition-colors">
                    {service.title}
                  </h3>
                  <div className="flex items-center space-x-2 text-sm font-semibold text-amber-400 mt-1">
                    <Clock className="w-4 h-4" />
                    <span>{service.time}</span>
                  </div>
                </div>

                <p className="text-xs font-medium text-slate-500 italic">
                  &quot;{service.tagline}&quot;
                </p>

                <p className="text-sm text-slate-300 leading-relaxed">
                  {service.description}
                </p>

                <div className="pt-2 border-t border-white/10 space-y-2">
                  {service.highlights.map((item, i) => (
                    <div
                      key={i}
                      className="flex items-center space-x-2 text-xs text-slate-300"
                    >
                      <Heart className="w-3.5 h-3.5 text-amber-500 shrink-0" />
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
