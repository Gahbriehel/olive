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
    <div className="bg-[#171717] text-[#F7F5F0]">
      {/* HERO SECTION */}
      <Hero />

      {/* MISSION & VISION EXCERPT SECTION */}
      <section className="w-full bg-[#171717] py-24 lg:py-32 border-b border-white/10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-start">
            {/* Left side: Heading */}
            <div className="lg:col-span-5 space-y-6">
              <span className="text-[#B18A4A] text-xs font-sans font-medium uppercase tracking-[0.2em]">
                OUR DIVINE MANDATE
              </span>
              <h2 className="text-4xl sm:text-5xl font-serif font-medium text-[#F7F5F0] tracking-tight leading-tight">
                Our Mission <br />
                &amp; Vision
              </h2>
              <p className="text-[#D4D0C7] text-base leading-relaxed font-sans font-light max-w-md">
                We are committed to making heaven, raising an army of believers,
                and taking the message of salvation, healing, and deliverance to
                the ends of the earth.
              </p>
              <div className="pt-2">
                <Link
                  href="/about"
                  className="inline-flex items-center space-x-2 text-xs font-sans font-medium uppercase tracking-wider text-[#B18A4A] hover:text-[#9C773B] transition-colors group"
                >
                  <span>Read Our Full Story</span>
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </Link>
              </div>
            </div>

            {/* Right side: Editorial Excerpt Columns */}
            <div className="lg:col-span-7 grid grid-cols-1 sm:grid-cols-2 gap-10 pt-2">
              {/* Mission Excerpt */}
              <div className="space-y-4 border-l border-[#B18A4A]/40 pl-6">
                <h3 className="text-xl font-serif font-medium text-[#B18A4A]">
                  Our Mission
                </h3>
                <ul className="space-y-2.5 text-sm text-[#D4D0C7] font-sans font-light">
                  <li className="flex items-start space-x-2">
                    <span className="text-[#B18A4A] font-semibold">•</span>
                    <span>To make heaven.</span>
                  </li>
                  <li className="flex items-start space-x-2">
                    <span className="text-[#B18A4A] font-semibold">•</span>
                    <span>To raise an army of believers to glorify God.</span>
                  </li>
                  <li className="flex items-start space-x-2">
                    <span className="text-[#B18A4A] font-semibold">•</span>
                    <span>To make holiness our lifestyle.</span>
                  </li>
                </ul>
              </div>

              {/* Vision Excerpt */}
              <div className="space-y-4 border-l border-white/10 pl-6">
                <h3 className="text-xl font-serif font-medium text-[#F7F5F0]">
                  Our Vision
                </h3>
                <p className="text-sm text-[#D4D0C7] leading-relaxed font-sans font-light">
                  To reach the lost with the gospel of Jesus Christ through
                  evangelism and Bible-based discipleship principles, and to
                  prepare a people fit for heaven.
                </p>
                <p className="text-xs italic text-[#77736B]">
                  Mark 16:15, Matthew 28:19-20
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* WEEKLY SERVICES SECTION — Ivory background for rhythmic visual break */}
      <section className="w-full bg-[#F7F5F0] text-[#171717] py-24 lg:py-32 border-b border-[#171717]/10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <WeeklyServices dark={false} />
        </div>
      </section>

      {/* FEATURED EVENT ANNOUNCEMENT BANNER */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24">
        <div className="bg-[#1F1F1F] text-[#F7F5F0] border border-white/10 rounded-sm overflow-hidden">
          <div
            className={`grid grid-cols-1 ${
              nextEvent?.imageUrl ? "lg:grid-cols-12" : ""
            } items-center`}
          >
            {nextEvent?.imageUrl && (
              <div className="lg:col-span-5 h-64 sm:h-80 lg:h-full relative min-h-[320px] bg-[#141414] overflow-hidden border-b lg:border-b-0 lg:border-r border-white/10">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={nextEvent.imageUrl}
                  alt={nextEvent.title}
                  className="w-full h-full object-cover"
                />
              </div>
            )}
            <div
              className={`${
                nextEvent?.imageUrl ? "lg:col-span-7" : ""
              } p-8 sm:p-12 lg:p-14 space-y-6`}
            >
              <span className="inline-flex items-center space-x-2 text-[#B18A4A] text-xs font-sans font-medium uppercase tracking-[0.2em]">
                <Calendar className="w-3.5 h-3.5" />
                <span>
                  {nextEvent
                    ? "Featured Upcoming Program"
                    : "Upcoming Gathering"}
                </span>
              </span>
              <h2 className="text-3xl sm:text-5xl font-serif font-medium text-[#F7F5F0] tracking-tight">
                {nextEvent ? nextEvent.title : "Night Of Wonders"}
              </h2>
              <p className="text-[#D4D0C7] text-base leading-relaxed font-sans font-light">
                {nextEvent?.description ||
                  "Join us for a special session of prayer, divine encounters, and spiritual renewal."}
              </p>
              <div className="flex flex-wrap gap-6 text-xs font-sans text-[#77736B]">
                <div className="flex items-center space-x-2">
                  <Clock className="w-4 h-4 text-[#B18A4A]" />
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
                      : "Coming Up This Month"}
                  </span>
                </div>
                <div className="flex items-center space-x-2">
                  <MapPin className="w-4 h-4 text-[#B18A4A]" />
                  <span>{nextEvent?.location || "Church Auditorium"}</span>
                </div>
              </div>
              <div className="pt-4">
                <Link
                  href={nextEvent ? `/events/${nextEvent.id}` : "/events"}
                  className="inline-flex items-center space-x-2 px-7 py-3 rounded-sm bg-[#B18A4A] hover:bg-[#9C773B] text-white font-medium text-xs uppercase tracking-wider transition-colors"
                >
                  <span>{nextEvent ? "Register Now" : "View All Events"}</span>
                  <ArrowRight className="w-4 h-4" />
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* WELCOME STATEMENT */}
      <section className="w-full bg-[#EFECE6] text-[#171717] py-24">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-6">
          <div className="w-10 h-10 rounded-full bg-[#B18A4A]/10 text-[#B18A4A] flex items-center justify-center mx-auto">
            <Heart className="w-5 h-5" />
          </div>
          <h2 className="text-3xl sm:text-4xl font-serif font-medium text-[#171717] tracking-tight">
            We Exist to Bring Glory to God &amp; Hope to Our City
          </h2>
          <p className="text-[#77736B] text-base leading-relaxed font-sans font-light max-w-2xl mx-auto">
            Whether you are exploring faith for the first time or looking for a
            home church to plant roots, you are warmly welcomed here.
          </p>

          <div className="pt-4 flex flex-col sm:flex-row items-center justify-center gap-6 max-w-2xl mx-auto">
            <div className="flex items-center space-x-2.5 text-xs font-sans font-medium text-[#171717]">
              <CheckCircle2 className="w-4 h-4 text-[#B18A4A] shrink-0" />
              <span>Biblical Preaching</span>
            </div>
            <div className="flex items-center space-x-2.5 text-xs font-sans font-medium text-[#171717]">
              <CheckCircle2 className="w-4 h-4 text-[#B18A4A] shrink-0" />
              <span>Vibrant Community</span>
            </div>
            <div className="flex items-center space-x-2.5 text-xs font-sans font-medium text-[#171717]">
              <BookOpen className="w-4 h-4 text-[#B18A4A] shrink-0" />
              <span>Active Discipleship</span>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
