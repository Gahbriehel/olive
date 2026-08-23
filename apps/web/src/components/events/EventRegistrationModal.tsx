"use client";

import React, { useState } from "react";
import { Dialog, DialogPanel, DialogTitle } from "@headlessui/react";
import { useMutation } from "@tanstack/react-query";
import { useForm, Controller } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";
import { Switch } from "@headlessui/react";
import { webService } from "@/services/api";
import { IRegisterPayload } from "@olive/types";
import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";
import {
  X,
  User,
  Mail,
  Phone,
  Calendar,
  CheckCircle2,
  QrCode,
  Loader2,
  Sparkles,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

const registrationSchema = yup.object().shape({
  firstName: yup.string().trim().required("First name is required"),
  lastName: yup.string().trim().required("Last name is required"),
  email: yup
    .string()
    .trim()
    .required("Email address is required")
    .email("Invalid email address"),
  phone: yup.string().trim().required("Phone number is required"),
  gender: yup.string().required("Gender selection is required"),
  dateOfBirth: yup.string().required("Date of birth is required"),
  googleCalendarSync: yup.boolean().optional().default(false),
});

interface EventRegistrationModalProps {
  isOpen: boolean;
  onClose: () => void;
  eventId: string;
  eventTitle: string;
  eventStartDate?: string;
  eventLocation?: string;
}

export function EventRegistrationModal({
  isOpen,
  onClose,
  eventId,
  eventTitle,
  eventStartDate,
  eventLocation,
}: EventRegistrationModalProps) {
  const [successRegistration, setSuccessRegistration] = useState<
    unknown | null
  >(null);

  const { control, handleSubmit, reset } = useForm<IRegisterPayload>({
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    resolver: yupResolver(registrationSchema) as any,
    defaultValues: {
      firstName: "",
      lastName: "",
      email: "",
      phone: "",
      gender: "MALE",
      dateOfBirth: "",
      googleCalendarSync: true,
    },
  });

  const registerMutation = useMutation({
    mutationFn: (data: IRegisterPayload) =>
      webService.registerForEvent(eventId, data),
    onSuccess: (data) => {
      setSuccessRegistration(data);
    },
  });

  const onSubmit = (data: IRegisterPayload) => {
    registerMutation.mutate(data);
  };

  const handleClose = () => {
    setSuccessRegistration(null);
    reset();
    onClose();
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <Dialog
          static
          open={isOpen}
          onClose={handleClose}
          className="relative z-50"
        >
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/80 backdrop-blur-sm"
            aria-hidden="true"
          />

          {/* Modal Container */}
          <div className="fixed inset-0 flex items-center justify-center p-4 overflow-y-auto">
            <DialogPanel className="w-full max-w-lg">
              <motion.div
                initial={{ opacity: 0, scale: 0.95, y: 10 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95, y: 10 }}
                transition={{ duration: 0.2, ease: "easeOut" }}
                className="w-full rounded-3xl bg-[#1F1F1F] border border-white/10 p-6 sm:p-8 text-[#F7F5F0] shadow-2xl space-y-6 relative overflow-hidden"
              >
                {/* Close Button */}
                <button
                  onClick={handleClose}
                  className="absolute top-5 right-5 p-2 rounded-full text-slate-400 hover:text-white hover:bg-white/10 transition-colors"
                  aria-label="Close Modal"
                >
                  <X className="w-5 h-5" />
                </button>

                {successRegistration ? (
                  /* SUCCESS CONFIRMATION STATE */
                  <div className="text-center space-y-6 py-2">
                    <div className="w-16 h-16 rounded-2xl bg-amber-500/15 text-amber-400 flex items-center justify-center mx-auto">
                      <CheckCircle2 className="w-10 h-10" />
                    </div>

                    <div className="space-y-2">
                      <span className="text-xs font-bold uppercase tracking-wider text-amber-400">
                        Registration Confirmed!
                      </span>
                      <DialogTitle className="text-2xl font-serif font-medium text-white">
                        You are registered for {eventTitle}
                      </DialogTitle>
                      <p className="text-xs text-slate-400 leading-relaxed">
                        We look forward to having you! A confirmation message
                        has been processed.
                      </p>
                    </div>

                    <div className="p-5 rounded-2xl bg-white/5 border border-white/10 text-left space-y-3">
                      <div className="flex items-center space-x-2 text-xs font-semibold text-amber-400">
                        <QrCode className="w-4 h-4" />
                        <span>Ticket Summary</span>
                      </div>
                      <p className="text-sm font-bold text-white">
                        {eventTitle}
                      </p>
                      {eventStartDate && (
                        <p className="text-xs text-slate-400">
                          Date:{" "}
                          {new Date(eventStartDate).toLocaleDateString(
                            "en-US",
                            {
                              timeZone: "Africa/Lagos",
                              month: "short",
                              day: "numeric",
                              year: "numeric",
                              hour: "2-digit",
                              minute: "2-digit",
                            },
                          )}
                        </p>
                      )}
                      {eventLocation && (
                        <p className="text-xs text-slate-400">
                          Location: {eventLocation}
                        </p>
                      )}
                    </div>

                    <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-3">
                      <button
                        onClick={() => {
                          setSuccessRegistration(null);
                          reset();
                        }}
                        className="w-full sm:w-auto px-5 py-2.5 rounded-xl border border-white/10 text-white text-xs font-semibold hover:bg-white/5 transition-colors"
                      >
                        Register Another Person
                      </button>
                      <button
                        onClick={handleClose}
                        className="w-full sm:w-auto px-6 py-2.5 rounded-xl bg-amber-600 hover:bg-amber-500 text-white text-xs font-bold shadow-md shadow-amber-900/20 transition-all"
                      >
                        Done
                      </button>
                    </div>
                  </div>
                ) : (
                  /* REGISTRATION FORM STATE */
                  <div className="space-y-6">
                    <div>
                      <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-amber-500/15 text-amber-400 text-[11px] font-bold uppercase tracking-wider mb-2">
                        <Sparkles className="w-3.5 h-3.5" />
                        <span>Event Registration</span>
                      </div>
                      <DialogTitle className="text-2xl font-serif font-medium text-white">
                        Reserve Your Spot
                      </DialogTitle>
                      <p className="text-xs text-slate-400 mt-1">
                        Registering for{" "}
                        <span className="text-white font-medium">
                          {eventTitle}
                        </span>
                      </p>
                    </div>

                    <form
                      onSubmit={handleSubmit(onSubmit)}
                      className="space-y-4"
                    >
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        {/* First Name */}
                        <Controller
                          name="firstName"
                          control={control}
                          render={({ field, fieldState: { error } }) => (
                            <Input
                              {...field}
                              label="First Name"
                              placeholder="John"
                              required
                              leftIcon={<User className="w-4 h-4" />}
                              error={error?.message}
                            />
                          )}
                        />

                        {/* Last Name */}
                        <Controller
                          name="lastName"
                          control={control}
                          render={({ field, fieldState: { error } }) => (
                            <Input
                              {...field}
                              label="Last Name"
                              placeholder="Doe"
                              required
                              leftIcon={<User className="w-4 h-4" />}
                              error={error?.message}
                            />
                          )}
                        />
                      </div>

                      {/* Email */}
                      <Controller
                        name="email"
                        control={control}
                        render={({ field, fieldState: { error } }) => (
                          <Input
                            {...field}
                            type="email"
                            label="Email Address"
                            placeholder="john.doe@example.com"
                            required
                            leftIcon={<Mail className="w-4 h-4" />}
                            error={error?.message}
                          />
                        )}
                      />

                      {/* Phone */}
                      <Controller
                        name="phone"
                        control={control}
                        render={({ field, fieldState: { error } }) => (
                          <Input
                            {...field}
                            type="tel"
                            label="Phone Number"
                            placeholder="+234 123 4567 890"
                            required
                            leftIcon={<Phone className="w-4 h-4" />}
                            error={error?.message}
                          />
                        )}
                      />

                      {/* Gender & DOB */}
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <Controller
                          name="gender"
                          control={control}
                          render={({ field, fieldState: { error } }) => (
                            <Select
                              {...field}
                              label="Gender"
                              required
                              error={error?.message}
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
                            </Select>
                          )}
                        />

                        <Controller
                          name="dateOfBirth"
                          control={control}
                          render={({ field, fieldState: { error } }) => (
                            <Input
                              {...field}
                              type="date"
                              label="Date of Birth"
                              required
                              error={error?.message}
                            />
                          )}
                        />
                      </div>

                      {/* Google Calendar Sync Switch */}
                      <Controller
                        name="googleCalendarSync"
                        control={control}
                        render={({ field: { value, onChange } }) => (
                          <div className="flex items-center justify-between p-3.5 rounded-xl bg-white/5 border border-white/10 mt-2">
                            <div className="space-y-0.5">
                              <label className="text-xs font-semibold text-slate-200 flex items-center gap-1.5 cursor-pointer">
                                <Calendar className="w-3.5 h-3.5 text-amber-400" />
                                <span>Add to Google Calendar</span>
                              </label>
                              <p className="text-[11px] text-slate-400">
                                Sync this event directly to your personal Google
                                Calendar.
                              </p>
                            </div>
                            <Switch
                              checked={Boolean(value)}
                              onChange={onChange}
                              className={`${
                                value ? "bg-amber-600" : "bg-slate-700"
                              } relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus-visible:ring-2 focus-visible:ring-white/75`}
                            >
                              <span className="sr-only">
                                Google Calendar Sync
                              </span>
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

                      <div className="pt-3">
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
              </motion.div>
            </DialogPanel>
          </div>
        </Dialog>
      )}
    </AnimatePresence>
  );
}
