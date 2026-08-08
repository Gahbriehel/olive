"use client";

import React, { useState, use } from "react";
import Link from "next/link";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useForm, Controller } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";
import { Switch } from "@headlessui/react";
import { webService } from "@/services/api";
import { IRegisterPayload } from "@olive/types";
import {
  Calendar,
  MapPin,
  ArrowLeft,
  CheckCircle2,
  AlertCircle,
  User,
  Mail,
  Phone,
  QrCode,
  Sparkles,
  Loader2,
} from "lucide-react";
import { motion } from "framer-motion";

const registrationSchema = yup.object().shape({
  firstName: yup.string().required("First name is required"),
  lastName: yup.string().required("Last name is required"),
  email: yup.string().email("Invalid email address").optional(),
  phone: yup.string().optional(),
  gender: yup.string().optional(),
  dateOfBirth: yup.string().optional(),
  googleCalendarSync: yup.boolean().optional(),
});

export default function EventRegistrationPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const [successRegistration, setSuccessRegistration] = useState<
    unknown | null
  >(null);

  const {
    data: event,
    isLoading,
    isError,
  } = useQuery({
    queryKey: ["eventDetail", id],
    queryFn: () => webService.getEventById(id),
  });

  const {
    register,
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<IRegisterPayload>({
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    resolver: yupResolver(registrationSchema) as any,
    defaultValues: {
      firstName: "",
      lastName: "",
      email: "",
      phone: "",
      gender: "MALE",
      dateOfBirth: "",
      googleCalendarSync: false,
    },
  });

  const registerMutation = useMutation({
    mutationFn: (data: IRegisterPayload) =>
      webService.registerForEvent(id, data),
    onSuccess: (data) => {
      setSuccessRegistration(data);
    },
  });

  const onSubmit = (data: IRegisterPayload) => {
    registerMutation.mutate(data);
  };

  if (isLoading) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-20">
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
        <h1 className="text-2xl font-bold text-white">Event Not Found</h1>
        <p className="text-sm text-slate-500">
          The event you are looking for may have been removed or is unavailable.
        </p>
        <Link
          href="/events"
          className="inline-flex items-center space-x-2 px-6 py-3 rounded-xl bg-slate-800 text-white font-semibold text-sm"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Events</span>
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-10">
      {/* Back Button */}
      <Link
        href="/events"
        className="inline-flex items-center space-x-2 text-sm font-semibold text-slate-500 hover:text-amber-400 transition-colors"
      >
        <ArrowLeft className="w-4 h-4" />
        <span>Back to All Events</span>
      </Link>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
        {/* LEFT COL: Event Information */}
        <div className="lg:col-span-5 space-y-6">
          <div className="rounded-3xl border border-white/10 bg-[#1F1F1F] overflow-hidden shadow-sm">
            {event.imageUrl && (
              <div className="relative w-full h-56 bg-[#141414] overflow-hidden border-b border-white/10">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={event.imageUrl}
                  alt={event.title}
                  className="w-full h-full object-cover"
                />
              </div>
            )}
            <div className="p-8 space-y-6">
              <div className="inline-flex items-center space-x-2 px-3.5 py-1 rounded-full bg-amber-500/15 text-amber-400 text-xs font-bold uppercase tracking-wider">
                <Sparkles className="w-4 h-4" />
                <span>Event Details</span>
              </div>

              <h1 className="text-3xl font-extrabold text-white tracking-tight leading-tight">
                {event.title}
              </h1>

              <p className="text-sm text-slate-400 leading-relaxed">
                {event.description ||
                  "Join us for this inspiring event. Registration is free and open to everyone."}
              </p>

              <div className="space-y-4 pt-4 border-t border-white/10 text-sm">
                <div className="flex items-start space-x-3">
                  <Calendar className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
                  <div>
                    <p className="font-semibold text-white">
                      Start Date & Time
                    </p>
                    <p className="text-xs text-slate-500">
                      {new Date(event.startDate).toLocaleString(undefined, {
                        dateStyle: "full",
                        timeStyle: "short",
                      })}
                    </p>
                  </div>
                </div>

                <div className="flex items-start space-x-3">
                  <MapPin className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
                  <div>
                    <p className="font-semibold text-white">Location</p>
                    <p className="text-xs text-slate-500">
                      {event.location || "Main Campus Sanctuary"}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* RIGHT COL: Registration Form or Confirmation */}
        <div className="lg:col-span-7">
          {successRegistration ? (
            /* SUCCESS CONFIRMATION STATE */
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="rounded-3xl p-8 sm:p-10 border border-amber-500/30 bg-[#1F1F1F] text-center space-y-6 shadow-sm"
            >
              <div className="w-16 h-16 rounded-2xl bg-amber-500/15 text-amber-400 flex items-center justify-center mx-auto">
                <CheckCircle2 className="w-10 h-10" />
              </div>

              <div className="space-y-2">
                <span className="text-xs font-bold uppercase tracking-wider text-amber-400">
                  Registration Successful!
                </span>
                <h2 className="text-2xl font-extrabold text-white">
                  You are registered for {event.title}
                </h2>
                <p className="text-sm text-slate-400">
                  We look forward to welcoming you! A confirmation message has
                  been processed.
                </p>
              </div>

              <div className="p-6 rounded-2xl bg-white/5 border border-white/10 text-left space-y-3">
                <div className="flex items-center space-x-2 text-xs font-semibold text-slate-500">
                  <QrCode className="w-4 h-4 text-amber-400" />
                  <span>Ticket Details</span>
                </div>
                <p className="text-sm font-bold text-white">
                  Event: {event.title}
                </p>
                <p className="text-xs text-slate-500">
                  Date: {new Date(event.startDate).toLocaleDateString()}
                </p>
              </div>

              <div className="pt-4 flex flex-col sm:flex-row items-center justify-center gap-3">
                <button
                  onClick={() => setSuccessRegistration(null)}
                  className="w-full sm:w-auto px-6 py-3 rounded-xl border border-white/10 text-white text-xs font-semibold"
                >
                  Register Another Person
                </button>
                <Link
                  href="/events"
                  className="w-full sm:w-auto px-6 py-3 rounded-xl bg-amber-600 hover:bg-amber-500 text-white text-xs font-bold shadow-md shadow-amber-900/20"
                >
                  View All Events
                </Link>
              </div>
            </motion.div>
          ) : (
            /* REGISTRATION FORM */
            <div className="rounded-3xl p-8 border border-white/10 bg-[#1F1F1F] space-y-6 shadow-sm">
              <div>
                <h2 className="text-2xl font-bold text-white">
                  Reserve Your Spot
                </h2>
                <p className="text-xs text-slate-500 mt-1">
                  Please complete the form below to register for this event.
                </p>
              </div>

              {registerMutation.isError && (
                <div className="p-4 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-500 text-xs flex items-center space-x-2">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>
                    {(
                      registerMutation.error as {
                        response?: { data?: { message?: string } };
                      }
                    )?.response?.data?.message ||
                      "Registration failed. You may have already registered for this event."}
                  </span>
                </div>
              )}

              <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {/* First Name */}
                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-slate-300">
                      First Name *
                    </label>
                    <div className="relative">
                      <User className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                      <input
                        {...register("firstName")}
                        type="text"
                        placeholder="John"
                        className="w-full pl-9 pr-3 py-2.5 rounded-xl bg-white/5 border border-white/10 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500"
                      />
                    </div>
                    {errors.firstName && (
                      <p className="text-xs text-rose-500">
                        {errors.firstName.message}
                      </p>
                    )}
                  </div>

                  {/* Last Name */}
                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-slate-300">
                      Last Name *
                    </label>
                    <div className="relative">
                      <User className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                      <input
                        {...register("lastName")}
                        type="text"
                        placeholder="Doe"
                        className="w-full pl-9 pr-3 py-2.5 rounded-xl bg-white/5 border border-white/10 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500"
                      />
                    </div>
                    {errors.lastName && (
                      <p className="text-xs text-rose-500">
                        {errors.lastName.message}
                      </p>
                    )}
                  </div>
                </div>

                {/* Email */}
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-slate-300">
                    Email Address
                  </label>
                  <div className="relative">
                    <Mail className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                    <input
                      {...register("email")}
                      type="email"
                      placeholder="john.doe@example.com"
                      className="w-full pl-9 pr-3 py-2.5 rounded-xl bg-white/5 border border-white/10 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500"
                    />
                  </div>
                  {errors.email && (
                    <p className="text-xs text-rose-500">
                      {errors.email.message}
                    </p>
                  )}
                </div>

                {/* Phone */}
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-slate-300">
                    Phone Number
                  </label>
                  <div className="relative">
                    <Phone className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                    <input
                      {...register("phone")}
                      type="tel"
                      placeholder="+234 123 4567 890"
                      className="w-full pl-9 pr-3 py-2.5 rounded-xl bg-white/5 border border-white/10 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500"
                    />
                  </div>
                </div>

                {/* Gender & DOB */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-slate-300">
                      Gender
                    </label>
                    <select
                      {...register("gender")}
                      className="w-full px-3 py-2.5 rounded-xl bg-white/5 border border-white/10 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500 text-white"
                    >
                      <option
                        value="MALE"
                        className="bg-[#1F1F1F] text-[#F7F5F0]"
                      >
                        Male
                      </option>
                      <option
                        value="FEMALE"
                        className="bg-[#1F1F1F] text-[#F7F5F0]"
                      >
                        Female
                      </option>
                    </select>
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-slate-300">
                      Date of Birth
                    </label>
                    <input
                      {...register("dateOfBirth")}
                      type="date"
                      className="w-full px-3 py-2.5 rounded-xl bg-white/5 border border-white/10 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500"
                    />
                  </div>
                </div>

                {/* Google Calendar Sync Switch */}
                <Controller
                  name="googleCalendarSync"
                  control={control}
                  defaultValue={false}
                  render={({ field: { value, onChange } }) => (
                    <div className="flex items-center justify-between p-3.5 rounded-xl bg-white/5 border border-white/10 mt-2">
                      <div className="space-y-0.5">
                        <label className="text-xs font-semibold text-slate-200 flex items-center gap-1.5 cursor-pointer">
                          <Calendar className="w-3.5 h-3.5 text-amber-400" />
                          <span>Add to Google Calendar</span>
                        </label>
                        <p className="text-[11px] text-slate-400">
                          Sync this event directly to your personal Google
                          Calendar upon registration.
                        </p>
                      </div>
                      <Switch
                        checked={Boolean(value)}
                        onChange={onChange}
                        className={`${
                          value ? "bg-amber-600" : "bg-slate-700"
                        } relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus-visible:ring-2 focus-visible:ring-white/75`}
                      >
                        <span className="sr-only">Google Calendar Sync</span>
                        <span
                          aria-hidden="true"
                          className={`${
                            value ? "translate-x-5" : "translate-x-0"
                          } pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow-lg ring-0 transition duration-200 ease-in-out`}
                        />
                      </Switch>
                    </div>
                  )}
                />

                <div className="pt-4">
                  <button
                    type="submit"
                    disabled={registerMutation.isPending}
                    className="w-full py-3.5 rounded-xl bg-amber-600 hover:bg-amber-500 disabled:opacity-50 text-white font-bold text-sm shadow-lg shadow-amber-900/25 transition-all duration-200 flex items-center justify-center gap-2 min-h-[48px]"
                  >
                    {registerMutation.isPending ? (
                      <Loader2 className="w-5 h-5 animate-spin text-white" />
                    ) : (
                      <span>Complete Registration</span>
                    )}
                  </button>
                </div>
              </form>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
