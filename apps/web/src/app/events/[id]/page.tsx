"use client";

import React, { useState, use } from "react";
import Link from "next/link";
import { useQuery } from "@tanstack/react-query";
import { webService } from "@/services/api";
import { EventRegistrationModal } from "@/components/events/EventRegistrationModal";
import { customToast } from "@/helpers/customToast";
import {
  Calendar,
  MapPin,
  ArrowLeft,
  AlertCircle,
  Trophy,
  Sparkles,
  Share2,
  Users,
  Gamepad2,
  Ticket,
  Clock,
  ChevronRight,
} from "lucide-react";
import { motion } from "framer-motion";

function isEventStarted(startDate?: string): boolean {
  if (!startDate) return false;
  return new Date(startDate).getTime() <= Date.now();
}

function isEventEnded(endDate?: string): boolean {
  if (!endDate) return false;
  return new Date(endDate).getTime() <= Date.now();
}

export default function EventDetailsPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const [isRegisterModalOpen, setIsRegisterModalOpen] = useState(false);

  const {
    data: event,
    isLoading,
    isError,
  } = useQuery({
    queryKey: ["eventDetail", id],
    queryFn: () => webService.getEventById(id),
  });

  const hasStarted = isEventStarted(event?.startDate);
  const hasEnded = isEventEnded(event?.endDate);

  const handleShare = () => {
    if (typeof window !== "undefined") {
      navigator.clipboard.writeText(window.location.href);
      customToast.success("Event link copied to clipboard!");
    }
  };

  if (isLoading) {
    return (
      <div className="max-w-6xl mx-auto px-4 py-20 space-y-8">
        <div className="h-10 w-32 bg-white/5 rounded-lg animate-pulse" />
        <div className="h-96 rounded-3xl bg-white/5 animate-pulse" />
      </div>
    );
  }

  if (isError || !event) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-20 text-center space-y-6">
        <div className="w-16 h-16 rounded-full bg-rose-500/10 text-rose-500 flex items-center justify-center mx-auto">
          <AlertCircle className="w-8 h-8" />
        </div>
        <h1 className="text-3xl font-serif text-white">Event Not Found</h1>
        <p className="text-sm text-slate-400 max-w-md mx-auto">
          The event you are looking for may have been removed or is temporarily
          unavailable.
        </p>
        <Link
          href="/events"
          className="inline-flex items-center space-x-2 px-6 py-3 rounded-xl bg-slate-800 text-white font-semibold text-sm hover:bg-slate-700 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Events</span>
        </Link>
      </div>
    );
  }

  // Calculate spots remaining if capacity exists
  const registeredCount = event.registeredCount ?? 0;
  const capacity = event.capacity;
  const isFull = capacity ? registeredCount >= capacity : false;
  const isFiftyPercentFull = capacity
    ? registeredCount / capacity >= 0.5
    : false;

  return (
    <div className="bg-[#171717] min-h-screen text-[#F7F5F0] py-10 lg:py-16">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        {/* TOP BREADCRUMB / BACK LINK */}
        <div className="flex items-center justify-between">
          <Link
            href="/events"
            className="inline-flex items-center space-x-2 text-xs font-semibold uppercase tracking-wider text-slate-400 hover:text-amber-400 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>All Events</span>
          </Link>

          <button
            onClick={handleShare}
            className="inline-flex items-center space-x-1.5 px-3 py-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-xs font-medium text-slate-300 border border-white/10 transition-colors"
          >
            <Share2 className="w-3.5 h-3.5" />
            <span>Share</span>
          </button>
        </div>

        {/* HERO BANNER SECTION */}
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          className="rounded-3xl border border-white/10 bg-[#1F1F1F] overflow-hidden shadow-2xl relative"
        >
          {/* Banner Image */}
          {event.imageUrl ? (
            <div className="relative w-full h-72 sm:h-96 bg-[#141414] overflow-hidden border-b border-white/10">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={event.imageUrl}
                alt={event.title}
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-[#1F1F1F] via-[#1F1F1F]/40 to-transparent" />
            </div>
          ) : (
            <div className="w-full h-40 bg-gradient-to-r from-amber-950/40 via-amber-900/20 to-slate-900 border-b border-white/10" />
          )}

          {/* Hero Details Header */}
          <div className="p-6 sm:p-10 space-y-6 relative -mt-16 sm:-mt-24">
            {/* Status Badges */}
            <div className="flex flex-wrap items-center gap-2">
              <span className="inline-flex items-center space-x-1.5 px-3.5 py-1 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/30 text-xs font-bold uppercase tracking-wider shadow-sm">
                <Sparkles className="w-3.5 h-3.5" />
                <span>Published Event</span>
              </span>

              {hasStarted && !hasEnded && (
                <span className="inline-flex items-center space-x-1.5 px-3.5 py-1 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 text-xs font-bold uppercase tracking-wider">
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                  <span>Event Is Live</span>
                </span>
              )}

              {hasEnded && (
                <span className="inline-flex items-center space-x-1.5 px-3.5 py-1 rounded-full bg-slate-700/50 text-slate-300 border border-slate-600 text-xs font-bold uppercase tracking-wider">
                  <span>Event Concluded</span>
                </span>
              )}
            </div>

            {/* Event Title */}
            <h1 className="text-3xl sm:text-5xl font-serif font-medium text-white tracking-tight leading-tight">
              {event.title}
            </h1>

            {/* Key Meta Ribbon */}
            <div className="flex flex-wrap items-center gap-6 text-sm text-slate-300 pt-2 border-t border-white/10">
              <div className="flex items-center space-x-2.5">
                <Calendar className="w-5 h-5 text-amber-400 shrink-0" />
                <div>
                  <p className="text-[11px] uppercase tracking-wider text-slate-500 font-semibold">
                    Date & Time
                  </p>
                  <p className="font-medium text-white text-xs sm:text-sm">
                    {new Date(event.startDate).toLocaleString("en-US", {
                      timeZone: "Africa/Lagos",
                      weekday: "short",
                      month: "short",
                      day: "numeric",
                      year: "numeric",
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </p>
                </div>
              </div>

              <div className="flex items-center space-x-2.5">
                <MapPin className="w-5 h-5 text-amber-400 shrink-0" />
                <div>
                  <p className="text-[11px] uppercase tracking-wider text-slate-500 font-semibold">
                    Location
                  </p>
                  <p className="font-medium text-white text-xs sm:text-sm">
                    {event.location || "Main Auditorium"}
                  </p>
                </div>
              </div>
            </div>

            {/* PROMINENT ACTION BUTTONS STRIP */}
            <div className="pt-6 border-t border-white/10 flex flex-wrap items-center gap-4">
              {/* PRIMARY ACTION: REGISTER */}
              <button
                onClick={() => setIsRegisterModalOpen(true)}
                disabled={hasEnded || isFull}
                className="px-8 py-4 rounded-2xl bg-amber-600 hover:bg-amber-500 disabled:opacity-50 text-white font-bold text-sm shadow-xl shadow-amber-950/40 transition-all flex items-center space-x-2.5 cursor-pointer"
              >
                <Ticket className="w-5 h-5" />
                <span>
                  {hasEnded
                    ? "Registration Closed"
                    : isFull
                      ? "Event Full"
                      : "Register for Event"}
                </span>
              </button>

              {/* PROMINENT ACTION: VIEW STANDINGS */}
              {hasStarted && (
                <Link
                  href={`/leaderboard/${id}`}
                  className="px-8 py-4 rounded-2xl bg-gradient-to-r from-amber-500/20 via-amber-500/10 to-amber-600/20 border border-amber-500/50 hover:border-amber-400 text-amber-300 font-bold text-sm uppercase tracking-wider transition-all flex items-center space-x-2.5 shadow-lg shadow-amber-950/30 group"
                >
                  <Trophy className="w-5 h-5 text-amber-400 group-hover:scale-110 transition-transform" />
                  <span>View Live Standings</span>
                  <ChevronRight className="w-4 h-4 text-amber-400 group-hover:translate-x-1 transition-transform" />
                </Link>
              )}
            </div>
          </div>
        </motion.div>

        {/* MAIN BODY GRID */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* LEFT / MAIN CONTENT COLUMN */}
          <div className="lg:col-span-8 space-y-8">
            {/* EVENT DESCRIPTION */}
            <div className="rounded-3xl border border-white/10 bg-[#1F1F1F] p-8 space-y-4 shadow-sm">
              <h2 className="text-xl font-serif font-medium text-white flex items-center space-x-2">
                <span>About This Event</span>
              </h2>
              <p className="text-slate-300 text-sm leading-relaxed whitespace-pre-line font-light">
                {event.description ||
                  "Join us for this special church gathering. All members, visitors, and families are warmly welcomed to participate."}
              </p>
            </div>

            {/* LIVE STANDINGS FEATURED CARD (WHEN EVENT HAS STARTED) */}
            {hasStarted && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="rounded-3xl border border-amber-500/40 bg-gradient-to-br from-[#1F1F1F] via-[#241F16] to-[#1F1F1F] p-8 space-y-4 shadow-xl relative overflow-hidden"
              >
                <div className="absolute top-0 right-0 p-6 opacity-10 pointer-events-none">
                  <Trophy className="w-32 h-32 text-amber-400" />
                </div>

                <div className="space-y-2">
                  <span className="text-xs font-bold uppercase tracking-widest text-amber-400 flex items-center space-x-1.5">
                    <Trophy className="w-4 h-4" />
                    <span>Real-Time Competition</span>
                  </span>
                  <h3 className="text-2xl font-serif font-medium text-white">
                    Event Standings & Leaderboard
                  </h3>
                  <p className="text-xs text-slate-300 max-w-xl leading-relaxed">
                    Check out live scores, team standings, and performance
                    updates in real-time as games and activities unfold.
                  </p>
                </div>

                <div className="pt-2">
                  <Link
                    href={`/leaderboard/${id}`}
                    className="inline-flex items-center space-x-2 px-6 py-3 rounded-xl bg-amber-500 hover:bg-amber-400 text-black font-bold text-xs uppercase tracking-wider transition-colors shadow-md"
                  >
                    <Trophy className="w-4 h-4" />
                    <span>Open Leaderboard</span>
                  </Link>
                </div>
              </motion.div>
            )}

            {/* EVENT SCHEDULE & DETAILS */}
            <div className="rounded-3xl border border-white/10 bg-[#1F1F1F] p-8 space-y-6 shadow-sm">
              <h2 className="text-xl font-serif font-medium text-white">
                Schedule & Information
              </h2>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <div className="p-4 rounded-2xl bg-white/5 border border-white/5 space-y-2">
                  <div className="flex items-center space-x-2 text-xs font-semibold text-amber-400">
                    <Clock className="w-4 h-4" />
                    <span>Start Time</span>
                  </div>
                  <p className="text-sm font-semibold text-white">
                    {new Date(event.startDate).toLocaleString("en-US", {
                      timeZone: "Africa/Lagos",
                      dateStyle: "full",
                      timeStyle: "short",
                    })}
                  </p>
                </div>

                {event.endDate && (
                  <div className="p-4 rounded-2xl bg-white/5 border border-white/5 space-y-2">
                    <div className="flex items-center space-x-2 text-xs font-semibold text-amber-400">
                      <Clock className="w-4 h-4" />
                      <span>End Time</span>
                    </div>
                    <p className="text-sm font-semibold text-white">
                      {new Date(event.endDate).toLocaleString("en-US", {
                        timeZone: "Africa/Lagos",
                        dateStyle: "full",
                        timeStyle: "short",
                      })}
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* RIGHT / SIDEBAR COLUMN */}
          <div className="lg:col-span-4 space-y-6">
            {/* AT A GLANCE CARD */}
            <div className="rounded-3xl border border-white/10 bg-[#1F1F1F] p-6 space-y-6 shadow-sm">
              <h3 className="text-lg font-serif font-medium text-white border-b border-white/10 pb-4">
                Event Overview
              </h3>

              <div className="space-y-4 text-xs">
                {/* Capacity */}
                {capacity !== undefined &&
                  capacity > 0 &&
                  isFiftyPercentFull && (
                    <div className="space-y-2 pb-4 border-b border-white/5">
                      <div className="flex items-center justify-between text-slate-400 font-medium">
                        <span className="flex items-center space-x-1.5">
                          <Users className="w-4 h-4 text-amber-400" />
                          <span>Capacity</span>
                        </span>
                        <span className="text-white font-semibold">
                          {registeredCount} / {capacity}
                        </span>
                      </div>

                      <div className="w-full h-2 rounded-full bg-white/10 overflow-hidden">
                        <div
                          className="h-full bg-amber-500 rounded-full transition-all duration-500"
                          style={{
                            width: `${Math.min(
                              100,
                              Math.round((registeredCount / capacity) * 100),
                            )}%`,
                          }}
                        />
                      </div>
                    </div>
                  )}

                {/* Teams Count */}
                {event.teams !== undefined && event.teams > 0 && (
                  <div className="flex items-center justify-between py-2 border-b border-white/5 text-slate-400">
                    <span className="flex items-center space-x-1.5">
                      <Users className="w-4 h-4 text-amber-400" />
                      <span>Participating Teams</span>
                    </span>
                    <span className="text-white font-semibold">
                      {event.teams} Teams
                    </span>
                  </div>
                )}

                {/* Games Count */}
                {event.games !== undefined && event.games > 0 && (
                  <div className="flex items-center justify-between py-2 border-b border-white/5 text-slate-400">
                    <span className="flex items-center space-x-1.5">
                      <Gamepad2 className="w-4 h-4 text-amber-400" />
                      <span>Scheduled Games</span>
                    </span>
                    <span className="text-white font-semibold">
                      {event.games} Games
                    </span>
                  </div>
                )}
              </div>

              {/* ACTION CALLOUT IN SIDEBAR */}
              <div className="pt-2 space-y-3">
                <button
                  onClick={() => setIsRegisterModalOpen(true)}
                  disabled={hasEnded || isFull}
                  className="w-full py-3.5 rounded-xl bg-amber-600 hover:bg-amber-500 disabled:opacity-50 text-white font-bold text-xs uppercase tracking-wider transition-all shadow-md flex items-center justify-center space-x-2 cursor-pointer"
                >
                  <Ticket className="w-4 h-4" />
                  <span>
                    {hasEnded
                      ? "Registration Closed"
                      : isFull
                        ? "Event Full"
                        : "Register Now"}
                  </span>
                </button>

                {hasStarted && (
                  <Link
                    href={`/leaderboard/${id}`}
                    className="w-full py-3.5 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-amber-400 font-bold text-xs uppercase tracking-wider transition-all flex items-center justify-center space-x-2"
                  >
                    <Trophy className="w-4 h-4" />
                    <span>View Standings</span>
                  </Link>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* REGISTRATION MODAL */}
      <EventRegistrationModal
        isOpen={isRegisterModalOpen}
        onClose={() => setIsRegisterModalOpen(false)}
        eventId={id}
        eventTitle={event.title}
        eventStartDate={event.startDate}
        eventLocation={event.location}
      />
    </div>
  );
}
