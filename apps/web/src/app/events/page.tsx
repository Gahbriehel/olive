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
  Sparkles,
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
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 lg:py-16 space-y-12">
      {/* HEADER */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div className="space-y-3">
          <div className="inline-flex items-center space-x-2 px-3.5 py-1 rounded-full bg-emerald-500/10 text-emerald-500 text-xs font-bold uppercase tracking-wider">
            <Sparkles className="w-4 h-4" />
            <span>Community Events</span>
          </div>
          <h1 className="text-4xl font-extrabold text-slate-900 dark:text-white tracking-tight">
            Upcoming Church Events
          </h1>
          <p className="text-slate-600 dark:text-slate-300 text-base max-w-xl">
            Find and register for upcoming services, youth gatherings,
            conferences, and community outreach events.
          </p>
        </div>

        {/* SEARCH BAR */}
        <div className="relative w-full md:w-80">
          <Search className="w-5 h-5 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Search events by title..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-3 rounded-xl bg-slate-100 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
          />
        </div>
      </div>

      {/* LOADING STATE */}
      {isLoading && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {[1, 2, 3].map((n) => (
            <div
              key={n}
              className="h-80 rounded-2xl bg-slate-100 dark:bg-slate-800/50 animate-pulse"
            />
          ))}
        </div>
      )}

      {/* ERROR STATE */}
      {isError && (
        <div className="p-8 rounded-2xl bg-rose-500/10 border border-rose-500/20 text-rose-500 text-center space-y-2">
          <AlertCircle className="w-8 h-8 mx-auto" />
          <p className="font-bold">Unable to load events at this moment.</p>
          <p className="text-xs text-slate-500">
            Please check your backend connection or refresh.
          </p>
        </div>
      )}

      {/* EMPTY STATE */}
      {!isLoading && !isError && filteredEvents.length === 0 && (
        <div className="text-center py-16 p-8 rounded-3xl bg-slate-100/50 dark:bg-slate-800/30 border border-slate-200 dark:border-slate-800 space-y-4">
          <Calendar className="w-12 h-12 text-slate-400 mx-auto" />
          <h3 className="text-xl font-bold text-slate-900 dark:text-white">
            No published events found
          </h3>
          <p className="text-sm text-slate-500 max-w-md mx-auto">
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
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: idx * 0.05 }}
              className="glass-card rounded-2xl border border-slate-200/80 dark:border-slate-800/80 hover:border-emerald-500/50 transition-all duration-300 flex flex-col justify-between overflow-hidden group shadow-sm hover:shadow-md"
            >
              <div className="p-6 space-y-4">
                {/* Status & Date Tag */}
                <div className="flex items-center justify-between">
                  <span className="px-3 py-1 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 text-xs font-bold">
                    Published Event
                  </span>
                  <div className="flex items-center space-x-1 text-xs font-semibold text-slate-500 dark:text-slate-400">
                    <Calendar className="w-3.5 h-3.5 text-emerald-500" />
                    <span>
                      {new Date(event.startDate).toLocaleDateString(undefined, {
                        month: "short",
                        day: "numeric",
                        year: "numeric",
                      })}
                    </span>
                  </div>
                </div>

                {/* Event Title */}
                <h3 className="text-xl font-bold text-slate-900 dark:text-white group-hover:text-emerald-500 transition-colors">
                  {event.title}
                </h3>

                {/* Event Description */}
                <p className="text-sm text-slate-600 dark:text-slate-300 line-clamp-3 leading-relaxed">
                  {event.description ||
                    "Join us for this special church event. Everyone is welcome to register!"}
                </p>

                {/* Location */}
                <div className="flex items-center space-x-2 text-xs font-medium text-slate-500 dark:text-slate-400">
                  <MapPin className="w-4 h-4 text-emerald-500 shrink-0" />
                  <span>{event.location || "Grace City Main Sanctuary"}</span>
                </div>
              </div>

              {/* Action Footer */}
              <div className="p-6 pt-0 border-t border-slate-100 dark:border-slate-800/60 mt-4 flex items-center justify-between">
                <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400">
                  Open for Registration
                </span>
                <Link
                  href={`/events/${event.id}`}
                  className="px-4 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-white font-semibold text-xs transition-colors flex items-center space-x-1 group/btn"
                >
                  <span>Register</span>
                  <ArrowRight className="w-4 h-4 group-hover/btn:translate-x-1 transition-transform" />
                </Link>
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
}
