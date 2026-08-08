"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useQuery } from "@tanstack/react-query";
import { webService } from "@/services/api";
import {
  Calendar,
  MapPin,
  Search,
  ArrowRight,
  AlertCircle,
} from "lucide-react";
import { motion } from "framer-motion";

export default function EventsListPage() {
  const [searchQuery, setSearchQuery] = useState("");

  const {
    data: events = [],
    isLoading,
    isError,
  } = useQuery({
    queryKey: ["publishedEvents"],
    queryFn: () => webService.getPublishedEvents(),
  });

  const filteredEvents = events.filter(
    (e) =>
      e.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (e.description &&
        e.description.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (e.location &&
        e.location.toLowerCase().includes(searchQuery.toLowerCase())),
  );

  return (
    <div className="bg-[#171717] min-h-screen text-[#F7F5F0] py-16 lg:py-24">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-16">
        {/* HEADER */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-8 border-b border-white/10 pb-12">
          <div className="space-y-4">
            <span className="text-[#B18A4A] text-xs font-sans font-medium uppercase tracking-[0.2em]">
              COMMUNITY GATHERINGS
            </span>
            <h1 className="text-4xl sm:text-5xl font-serif font-medium text-[#F7F5F0] tracking-tight">
              Upcoming Events
            </h1>
            <p className="text-[#D4D0C7] text-base font-sans font-light max-w-xl">
              Find and register for upcoming services, youth gatherings,
              conferences, and community outreach events.
            </p>
          </div>

          {/* SEARCH BAR */}
          <div className="relative w-full md:w-80">
            <Search className="w-4 h-4 absolute left-4 top-1/2 -translate-y-1/2 text-[#77736B]" />
            <input
              type="text"
              placeholder="Search events..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-11 pr-4 py-3 rounded-sm bg-[#1F1F1F] border border-white/10 text-[#F7F5F0] placeholder-[#77736B] text-xs font-sans focus:outline-none focus:border-[#B18A4A] transition-colors"
            />
          </div>
        </div>

        {/* LOADING STATE */}
        {isLoading && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[1, 2, 3].map((n) => (
              <div
                key={n}
                className="h-80 rounded-sm bg-white/5 animate-pulse border border-white/5"
              />
            ))}
          </div>
        )}

        {/* ERROR STATE */}
        {isError && (
          <div className="p-10 rounded-sm bg-rose-950/20 border border-rose-800/30 text-rose-300 text-center space-y-3 font-sans">
            <AlertCircle className="w-6 h-6 mx-auto text-rose-400" />
            <p className="font-medium text-sm">
              Unable to load events at this moment.
            </p>
            <p className="text-xs text-[#77736B]">
              Please check your network connection or refresh the page.
            </p>
          </div>
        )}

        {/* EMPTY STATE */}
        {!isLoading && !isError && filteredEvents.length === 0 && (
          <div className="text-center py-20 p-8 rounded-sm bg-[#1F1F1F] border border-white/10 space-y-4 font-sans">
            <Calendar className="w-10 h-10 text-[#77736B] mx-auto" />
            <h3 className="text-lg font-serif font-medium text-[#F7F5F0]">
              No published events found
            </h3>
            <p className="text-xs text-[#77736B] max-w-md mx-auto">
              {searchQuery
                ? `No events matching "${searchQuery}". Try clearing your search query.`
                : "There are currently no active published events. Check back soon!"}
            </p>
          </div>
        )}

        {/* EVENTS GRID */}
        {!isLoading && filteredEvents.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {filteredEvents.map((event, idx) => (
              <motion.div
                key={event.id}
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: idx * 0.05 }}
                className="rounded-sm border border-white/10 bg-[#1F1F1F] hover:border-[#B18A4A]/50 transition-colors duration-300 flex flex-col justify-between overflow-hidden group"
              >
                {event.imageUrl && (
                  <div className="relative w-full h-48 bg-[#141414] overflow-hidden border-b border-white/10">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={event.imageUrl}
                      alt={event.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                  </div>
                )}
                <div className="p-8 space-y-5">
                  {/* Status & Date Tag */}
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-sans font-medium uppercase tracking-wider text-[#B18A4A] border border-[#B18A4A]/30 px-2.5 py-0.5 rounded-sm">
                      Published Event
                    </span>
                    <div className="flex items-center space-x-1.5 text-xs font-sans text-[#77736B]">
                      <Calendar className="w-3.5 h-3.5 text-[#B18A4A]" />
                      <span>
                        {new Date(event.startDate).toLocaleDateString(
                          undefined,
                          {
                            month: "short",
                            day: "numeric",
                            year: "numeric",
                          },
                        )}
                      </span>
                    </div>
                  </div>

                  {/* Event Title */}
                  <h3 className="text-2xl font-serif font-medium text-[#F7F5F0] group-hover:text-[#B18A4A] transition-colors leading-tight">
                    {event.title}
                  </h3>

                  {/* Event Description */}
                  <p className="text-xs text-[#D4D0C7] font-sans font-light line-clamp-3 leading-relaxed">
                    {event.description ||
                      "Join us for this special church event. Everyone is welcome to register!"}
                  </p>

                  {/* Location */}
                  <div className="flex items-center space-x-2 text-xs font-sans text-[#77736B] pt-2">
                    <MapPin className="w-3.5 h-3.5 text-[#B18A4A] shrink-0" />
                    <span>{event.location || "Church Auditorium"}</span>
                  </div>
                </div>

                {/* Action Footer */}
                <div className="p-8 pt-0 border-t border-white/5 mt-4 flex items-center justify-between">
                  <span className="text-[11px] font-sans text-[#B18A4A]">
                    Open for Registration
                  </span>
                  <Link
                    href={`/events/${event.id}`}
                    className="inline-flex items-center space-x-2 px-5 py-2.5 rounded-sm bg-[#B18A4A] hover:bg-[#9C773B] text-white font-medium text-xs uppercase tracking-wider transition-colors group/btn"
                  >
                    <span>Register</span>
                    <ArrowRight className="w-3.5 h-3.5 group-hover/btn:translate-x-0.5 transition-transform" />
                  </Link>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
