import React from "react";
import { Metadata } from "next";
import { Compass, Target, Heart, Users, BookOpen, Award } from "lucide-react";
import { WeeklyServices } from "@/components/weekly-services";

export const metadata: Metadata = {
  title: "About Us, Mission & Vision",
  description:
    "Learn about Abiding Word Of Grace Missions (a.k.a. Amazing Grace Bible Church), our core mission, vision, values, weekly service times, and pastoral leadership team.",
};

export default function AboutPage() {
  return (
    <div className="w-full flex flex-col bg-[#171717] text-[#F7F5F0]">
      {/* HEADER HERO SECTION */}
      <section className="py-20 lg:py-32 border-b border-white/10">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-6">
          <span className="text-[#B18A4A] text-xs font-sans font-medium uppercase tracking-[0.25em]">
            OUR STORY &amp; FOUNDATION
          </span>
          <h1 className="text-4xl sm:text-6xl font-serif font-medium text-[#F7F5F0] tracking-tight">
            Who We Are
          </h1>
          <p className="text-lg sm:text-xl text-[#D4D0C7] leading-relaxed font-sans font-light max-w-3xl mx-auto">
            Abiding Word Of Grace Missions (a.k.a. Amazing Grace Bible Church)
            was founded with a singular conviction: to cultivate an inclusive,
            spirit-filled community where lives are restored by Christ&apos;s
            love and sent out to impact the world.
          </p>
        </div>
      </section>

      {/* MISSION & VISION EDITORIAL GRID */}
      <section className="py-24 border-b border-white/10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 lg:gap-24">
            {/* Mission Column */}
            <div className="space-y-8">
              <div className="flex items-center space-x-3">
                <Target className="w-5 h-5 text-[#B18A4A]" />
                <h2 className="text-3xl font-serif font-medium text-[#F7F5F0] tracking-tight">
                  Our Mission
                </h2>
              </div>

              <div className="space-y-8 border-l border-white/10 pl-6 sm:pl-8">
                <div className="space-y-2">
                  <span className="text-xs font-mono text-[#B18A4A]">01</span>
                  <h3 className="text-lg font-serif font-medium text-[#F7F5F0]">
                    Make Heaven
                  </h3>
                  <p className="text-sm font-sans text-[#D4D0C7] leading-relaxed font-light">
                    To make heaven and ensure our final destination is secure in
                    Christ.
                  </p>
                </div>

                <div className="space-y-2">
                  <span className="text-xs font-mono text-[#B18A4A]">02</span>
                  <h3 className="text-lg font-serif font-medium text-[#F7F5F0]">
                    Raise an Army of Believers
                  </h3>
                  <p className="text-sm font-sans text-[#D4D0C7] leading-relaxed font-light">
                    To raise believers who glorify God in worship, service,
                    fellowship, character, and family life.
                  </p>
                </div>

                <div className="space-y-2">
                  <span className="text-xs font-mono text-[#B18A4A]">03</span>
                  <h3 className="text-lg font-serif font-medium text-[#F7F5F0]">
                    Lifestyle of Holiness
                  </h3>
                  <p className="text-sm font-sans text-[#D4D0C7] leading-relaxed font-light">
                    To make holiness our standard of living, reflecting the
                    character of Christ daily.
                  </p>
                </div>

                <div className="space-y-2">
                  <span className="text-xs font-mono text-[#B18A4A]">04</span>
                  <h3 className="text-lg font-serif font-medium text-[#F7F5F0]">
                    Plant Churches
                  </h3>
                  <p className="text-sm font-sans text-[#D4D0C7] leading-relaxed font-light">
                    To plant churches in every city and town all over the world,
                    expanding the Kingdom of God.
                  </p>
                </div>
              </div>
            </div>

            {/* Vision Column */}
            <div className="space-y-8">
              <div className="flex items-center space-x-3">
                <Compass className="w-5 h-5 text-[#B18A4A]" />
                <h2 className="text-3xl font-serif font-medium text-[#F7F5F0] tracking-tight">
                  Our Vision
                </h2>
              </div>

              <div className="border-l border-[#B18A4A]/40 pl-6 sm:pl-8 py-4 space-y-6">
                <p className="text-2xl sm:text-3xl font-serif font-normal text-[#F7F5F0] leading-relaxed italic">
                  &ldquo;To reach the lost with the gospel of Jesus Christ
                  through evangelism and Bible-based discipleship principles,
                  and to prepare a people fit for heaven.&rdquo;
                </p>

                <div className="space-y-1">
                  <span className="text-xs font-sans text-[#B18A4A] uppercase tracking-[0.2em]">
                    Scripture Foundation
                  </span>
                  <p className="text-sm font-serif text-[#D4D0C7]">
                    Mark 16:15 &bull; Matthew 28:19-20
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CORE VALUES SECTION */}
      <section className="py-24 border-b border-white/10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-16">
          <div className="space-y-3 max-w-xl">
            <span className="text-[#B18A4A] text-xs font-sans font-medium uppercase tracking-[0.2em]">
              THE PILLARS
            </span>
            <h2 className="text-3xl sm:text-4xl font-serif font-medium text-[#F7F5F0] tracking-tight">
              Our Core Values
            </h2>
            <p className="text-[#77736B] text-sm font-sans font-light leading-relaxed">
              The foundational principles that guide our ministry and community
              life.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-10">
            <div className="space-y-3 border-t border-white/10 pt-6">
              <BookOpen className="w-5 h-5 text-[#B18A4A]" />
              <h3 className="font-serif font-medium text-lg text-[#F7F5F0]">
                Biblical Truth
              </h3>
              <p className="text-xs font-sans text-[#D4D0C7] leading-relaxed font-light">
                Grounded firmly in scripture as our final authority and daily
                guide for living in accordance with God&apos;s will.
              </p>
            </div>

            <div className="space-y-3 border-t border-white/10 pt-6">
              <Heart className="w-5 h-5 text-[#B18A4A]" />
              <h3 className="font-serif font-medium text-lg text-[#F7F5F0]">
                Genuine Love
              </h3>
              <p className="text-xs font-sans text-[#D4D0C7] leading-relaxed font-light">
                Extending radical hospitality, kindness, and grace to every
                individual, reflecting Christ&apos;s unconditional love.
              </p>
            </div>

            <div className="space-y-3 border-t border-white/10 pt-6">
              <Users className="w-5 h-5 text-[#B18A4A]" />
              <h3 className="font-serif font-medium text-lg text-[#F7F5F0]">
                Authentic Fellowship
              </h3>
              <p className="text-xs font-sans text-[#D4D0C7] leading-relaxed font-light">
                Walking together through life&apos;s triumphs and trials in
                genuine community and transparent relationships.
              </p>
            </div>

            <div className="space-y-3 border-t border-white/10 pt-6">
              <Award className="w-5 h-5 text-[#B18A4A]" />
              <h3 className="font-serif font-medium text-lg text-[#F7F5F0]">
                Excellence in Service
              </h3>
              <p className="text-xs font-sans text-[#D4D0C7] leading-relaxed font-light">
                Honoring God by giving our very best effort in ministry,
                operation, and community outreach.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* WEEKLY SERVICES SECTION — Ivory visual break */}
      <section className="w-full bg-[#F7F5F0] text-[#171717] py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <WeeklyServices dark={false} />
        </div>
      </section>
    </div>
  );
}
