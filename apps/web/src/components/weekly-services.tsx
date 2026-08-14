"use client";

import React from "react";
import { motion } from "framer-motion";

export interface ServiceItem {
  number: string;
  title: string;
  day: string;
  time: string;
  description: string;
  highlights: string[];
}

interface WeeklyServicesProps {
  dark?: boolean;
}

export function WeeklyServices({ dark = false }: WeeklyServicesProps) {
  const services: ServiceItem[] = [
    {
      number: "01",
      title: "FOUNDATION CLASS & CELEBRATION SERVICE",
      day: "EVERY SUNDAY",
      time: "8:00 AM – 11:30 AM",
      description:
        "Our main weekly gathering for uplifting praise, biblical teaching, prayer, and warm Christian fellowship.",
      highlights: [
        "8:00 AM – 8:55 AM: Foundation Class",
        "9:00 AM – 11:30 AM: Praise, Worship & Word",
      ],
    },
    {
      number: "02",
      title: "BIBLE STUDY (DIGGING DEEP)",
      day: "EVERY TUESDAY",
      time: "5:30 PM – 7:00 PM",
      description:
        "In-depth interactive study of God's Word to build strong spiritual foundations and practical Christian living.",
      highlights: [
        "Verse-by-Verse Exposition",
        "Interactive Q&A & Practical Application",
      ],
    },
    {
      number: "03",
      title: "PRAYER MEETING (MISSIONS & OUTREACH)",
      day: "EVERY THURSDAY",
      time: "10:00 AM – 1:00 PM",
      description:
        "A dedicated prayer and outreach gathering for widows, widowers, and the less privileged, focusing on prayer, support, and missions.",
      highlights: [
        "10:00 AM – 1:00 PM: Prayer & Fellowship",
        "Missions & Support for Widows, Widowers & Less Privileged",
      ],
    },
  ];

  const textColor = dark ? "text-[#F7F5F0]" : "text-[#171717]";
  const mutedTextColor = dark ? "text-[#A3A3A3]" : "text-[#77736B]";
  const borderColor = dark ? "border-white/10" : "border-[#171717]/15";
  const numColor = dark ? "text-[#B18A4A]" : "text-[#B18A4A]";

  return (
    <section id="services" className="scroll-mt-24">
      <div className="space-y-4 mb-16">
        <span className="text-[#B18A4A] text-xs font-sans font-medium uppercase tracking-[0.2em]">
          WEEKLY GATHERINGS
        </span>
        <h2
          className={`text-3xl sm:text-5xl font-serif font-medium ${textColor} tracking-tight`}
        >
          Worship With Us
        </h2>
        <p
          className={`text-base sm:text-lg font-sans ${mutedTextColor} max-w-2xl font-light leading-relaxed`}
        >
          Join us in person for powerful worship, in-depth scripture study, and
          faith-filled prayer.
        </p>
      </div>

      <div className={`border-t ${borderColor}`}>
        {services.map((service, idx) => (
          <motion.div
            key={service.number}
            initial={{ opacity: 0, y: 15 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.4, delay: idx * 0.1 }}
            className={`py-8 sm:py-10 border-b ${borderColor} grid grid-cols-1 md:grid-cols-12 gap-6 items-baseline`}
          >
            {/* Number & Day */}
            <div className="md:col-span-3 flex items-baseline space-x-3">
              <span className={`text-lg font-mono font-medium ${numColor}`}>
                {service.number}
              </span>
              <span
                className={`text-xs font-sans font-semibold tracking-[0.15em] ${mutedTextColor} uppercase`}
              >
                {service.day}
              </span>
            </div>

            {/* Title & Description */}
            <div className="md:col-span-5 space-y-2">
              <h3
                className={`text-xl sm:text-2xl font-serif font-medium ${textColor} tracking-tight`}
              >
                {service.title}
              </h3>
              <p
                className={`text-sm font-sans ${mutedTextColor} leading-relaxed`}
              >
                {service.description}
              </p>
            </div>

            {/* Time & Schedule Details */}
            <div className="md:col-span-4 space-y-2 md:text-right">
              <div className="text-sm font-sans font-medium text-[#B18A4A] tracking-wider">
                {service.time}
              </div>
              <ul className="space-y-1">
                {service.highlights.map((item, i) => (
                  <li key={i} className={`text-xs font-sans ${mutedTextColor}`}>
                    {item}
                  </li>
                ))}
              </ul>
            </div>
          </motion.div>
        ))}
      </div>
    </section>
  );
}
