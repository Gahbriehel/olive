"use client";

import React, { useState } from "react";
import { TruncatedTextWithCopy } from "@/components/ui/TruncatedTextWithCopy";
import { webService } from "@/services/api";
import { PrayerCategory, InquiryCategory } from "@olive/types";
import {
  MapPin,
  Phone,
  Mail,
  Clock,
  Heart,
  Send,
  CheckCircle2,
  MessageSquare,
  Loader2,
} from "lucide-react";
import { motion } from "framer-motion";

export default function ContactPage() {
  const [activeTab, setActiveTab] = useState<"prayer" | "inquiry">("prayer");
  const [submitted, setSubmitted] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    category: "General Prayer",
    message: "",
    isPrivate: false,
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      await webService.submitContactForm({
        type: activeTab,
        name: formData.name,
        email: formData.email,
        phone: formData.phone || undefined,
        category: formData.category as PrayerCategory | InquiryCategory,
        message: formData.message,
        isPrivate: activeTab === "prayer" ? formData.isPrivate : undefined,
      });
      setSubmitted(true);
    } catch (err) {
      console.error("Failed to submit contact form:", err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleReset = () => {
    setSubmitted(false);
    setFormData({
      name: "",
      email: "",
      phone: "",
      category: activeTab === "prayer" ? "General Prayer" : "General Question",
      message: "",
      isPrivate: false,
    });
  };

  return (
    <div className="bg-[#171717] min-h-screen text-[#F7F5F0] py-16 lg:py-24">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-16">
        {/* HEADER SECTION */}
        <div className="text-center max-w-3xl mx-auto space-y-4">
          <motion.span
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-[#B18A4A] text-xs font-sans font-medium uppercase tracking-[0.2em]"
          >
            WE ARE HERE FOR YOU
          </motion.span>

          <motion.h1
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-4xl sm:text-5xl font-serif font-medium text-[#F7F5F0] tracking-tight"
          >
            Get In Touch &amp; Prayer Requests
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="text-base text-[#D4D0C7] font-sans font-light leading-relaxed max-w-2xl mx-auto"
          >
            Whether you have questions, need prayer, or want to visit us this
            Sunday, our pastoral team and church community welcome you with open
            arms.
          </motion.p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-start">
          {/* LEFT COLUMN: CONTACT DETAILS & SERVICE TIMES */}
          <div className="lg:col-span-5 space-y-10 border-r border-white/10 pr-0 lg:pr-12">
            <div className="space-y-3">
              <span className="text-[#B18A4A] text-xs font-sans font-medium uppercase tracking-[0.2em]">
                LOCATION &amp; SCHEDULE
              </span>
              <h2 className="text-2xl font-serif font-medium text-[#F7F5F0]">
                Visit &amp; Contact Us
              </h2>
            </div>

            <div className="space-y-8 text-sm font-sans">
              {/* Address */}
              <div className="flex items-start space-x-4">
                <MapPin className="w-5 h-5 text-[#B18A4A] shrink-0 mt-1" />
                <div className="space-y-1">
                  <h3 className="font-medium text-[#F7F5F0] text-base font-serif">
                    Church Address
                  </h3>
                  <p className="text-[#D4D0C7] font-light leading-relaxed">
                    No 1, Makanjuola Layout, Sawmill, Dogo, Apata, Ibadan, Oyo
                    State, Nigeria
                  </p>
                </div>
              </div>

              {/* Phone */}
              <div className="flex items-start space-x-4">
                <Phone className="w-5 h-5 text-[#B18A4A] shrink-0 mt-1" />
                <div className="space-y-1">
                  <h3 className="font-medium text-[#F7F5F0] text-base font-serif">
                    Phone Contact
                  </h3>
                  <p className="text-[#D4D0C7] font-light">+234 802 3308 877</p>
                </div>
              </div>

              {/* Email */}
              <div className="flex items-start space-x-4">
                <Mail className="w-5 h-5 text-[#B18A4A] shrink-0 mt-1" />
                <div className="space-y-1">
                  <h3 className="font-medium text-[#F7F5F0] text-base font-serif">
                    Email Address
                  </h3>
                  <TruncatedTextWithCopy
                    text="abidingwordofgracemissions@gmail.com"
                    maxLength={0}
                    textClassName="text-[#B18A4A] font-light"
                  />
                </div>
              </div>

              {/* Weekly Schedule */}
              <div className="flex items-start space-x-4 border-t border-white/10 pt-6">
                <Clock className="w-5 h-5 text-[#B18A4A] shrink-0 mt-1" />
                <div className="space-y-3 w-full">
                  <h3 className="font-medium text-[#F7F5F0] text-base font-serif">
                    Weekly Service Schedule
                  </h3>
                  <ul className="space-y-2 text-xs font-light text-[#D4D0C7]">
                    <li className="flex justify-between border-b border-white/5 pb-2">
                      <span className="font-medium text-[#F7F5F0]">
                        Foundation Class:
                      </span>
                      <span>8:00 AM – 8:55 AM</span>
                    </li>
                    <li className="flex justify-between border-b border-white/5 pb-2">
                      <span className="font-medium text-[#F7F5F0]">
                        Sunday Service:
                      </span>
                      <span>9:00 AM – 11:30 AM</span>
                    </li>
                    <li className="flex justify-between border-b border-white/5 pb-2">
                      <span className="font-medium text-[#F7F5F0]">
                        Tuesday (Digging Deep):
                      </span>
                      <span>6:00 PM – 7:30 PM</span>
                    </li>
                    <li className="flex justify-between pb-1">
                      <span className="font-medium text-[#F7F5F0]">
                        Thursday (Prayer &amp; Missions):
                      </span>
                      <span>10:00 AM – 1:00 PM</span>
                    </li>
                  </ul>
                </div>
              </div>
            </div>
          </div>

          {/* RIGHT COLUMN: PRAYER REQUEST & INQUIRY FORM */}
          <div className="lg:col-span-7">
            <div className="bg-[#1F1F1F] p-8 sm:p-12 border border-white/10 rounded-sm space-y-8">
              {/* Form Mode Selector */}
              <div className="flex border-b border-white/10 pb-4 space-x-8">
                <button
                  type="button"
                  onClick={() => {
                    setActiveTab("prayer");
                    setSubmitted(false);
                    setFormData((prev) => ({
                      ...prev,
                      category: "General Prayer",
                    }));
                  }}
                  className={`pb-2 text-xs font-sans uppercase tracking-wider transition-colors relative ${
                    activeTab === "prayer"
                      ? "text-[#B18A4A] font-medium"
                      : "text-[#77736B] hover:text-[#F7F5F0]"
                  }`}
                >
                  <span className="flex items-center space-x-2">
                    <Heart className="w-3.5 h-3.5" />
                    <span>Prayer Request</span>
                  </span>
                  {activeTab === "prayer" && (
                    <span className="absolute bottom-0 left-0 right-0 h-[2px] bg-[#B18A4A]" />
                  )}
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setActiveTab("inquiry");
                    setSubmitted(false);
                    setFormData((prev) => ({
                      ...prev,
                      category: "General Question",
                    }));
                  }}
                  className={`pb-2 text-xs font-sans uppercase tracking-wider transition-colors relative ${
                    activeTab === "inquiry"
                      ? "text-[#B18A4A] font-medium"
                      : "text-[#77736B] hover:text-[#F7F5F0]"
                  }`}
                >
                  <span className="flex items-center space-x-2">
                    <MessageSquare className="w-3.5 h-3.5" />
                    <span>General Inquiry</span>
                  </span>
                  {activeTab === "inquiry" && (
                    <span className="absolute bottom-0 left-0 right-0 h-[2px] bg-[#B18A4A]" />
                  )}
                </button>
              </div>

              {submitted ? (
                <motion.div
                  initial={{ opacity: 0, scale: 0.98 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="py-12 text-center space-y-4"
                >
                  <div className="w-12 h-12 rounded-full bg-[#B18A4A]/10 text-[#B18A4A] flex items-center justify-center mx-auto">
                    <CheckCircle2 className="w-6 h-6" />
                  </div>
                  <h3 className="text-2xl font-serif font-medium text-[#F7F5F0]">
                    {activeTab === "prayer"
                      ? "Prayer Request Received"
                      : "Message Sent Successfully"}
                  </h3>
                  <p className="text-xs text-[#D4D0C7] font-sans font-light max-w-md mx-auto leading-relaxed">
                    {activeTab === "prayer"
                      ? "Our pastoral and prayer team will stand in prayer with you. God bless you abundantly!"
                      : "Thank you for reaching out. We will get back to you shortly."}
                  </p>
                  <button
                    type="button"
                    onClick={handleReset}
                    className="mt-4 px-6 py-2.5 rounded-sm bg-[#B18A4A] hover:bg-[#9C773B] text-white font-medium text-xs uppercase tracking-wider transition-colors"
                  >
                    Send Another Submission
                  </button>
                </motion.div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-6 font-sans">
                  <div className="space-y-1">
                    <h3 className="text-xl font-serif font-medium text-[#F7F5F0]">
                      {activeTab === "prayer"
                        ? "Share Your Prayer Request"
                        : "Send Us a Message"}
                    </h3>
                    <p className="text-xs text-[#77736B] font-light">
                      {activeTab === "prayer"
                        ? "Confidential requests will only be seen by our prayer team."
                        : "Fill in your details and we will connect with you."}
                    </p>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <label className="block text-xs font-medium text-[#D4D0C7]">
                        Your Full Name
                      </label>
                      <input
                        type="text"
                        required
                        value={formData.name}
                        onChange={(e) =>
                          setFormData({ ...formData, name: e.target.value })
                        }
                        placeholder="e.g. John Doe"
                        className="w-full px-4 py-3 rounded-sm bg-[#171717] border border-white/10 text-[#F7F5F0] placeholder-[#77736B] text-xs focus:outline-none focus:border-[#B18A4A] transition-colors"
                      />
                    </div>

                    <div className="space-y-2">
                      <label className="block text-xs font-medium text-[#D4D0C7]">
                        Email Address
                      </label>
                      <input
                        type="email"
                        required
                        value={formData.email}
                        onChange={(e) =>
                          setFormData({ ...formData, email: e.target.value })
                        }
                        placeholder="e.g. john@example.com"
                        className="w-full px-4 py-3 rounded-sm bg-[#171717] border border-white/10 text-[#F7F5F0] placeholder-[#77736B] text-xs focus:outline-none focus:border-[#B18A4A] transition-colors"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <label className="block text-xs font-medium text-[#D4D0C7]">
                        Phone Number (Optional)
                      </label>
                      <input
                        type="tel"
                        value={formData.phone}
                        onChange={(e) =>
                          setFormData({ ...formData, phone: e.target.value })
                        }
                        placeholder="e.g. +234 800 000 0000"
                        className="w-full px-4 py-3 rounded-sm bg-[#171717] border border-white/10 text-[#F7F5F0] placeholder-[#77736B] text-xs focus:outline-none focus:border-[#B18A4A] transition-colors"
                      />
                    </div>

                    <div className="space-y-2">
                      <label className="block text-xs font-medium text-[#D4D0C7]">
                        Category
                      </label>
                      <select
                        value={formData.category}
                        onChange={(e) =>
                          setFormData({ ...formData, category: e.target.value })
                        }
                        className="w-full px-4 py-3 rounded-sm bg-[#171717] border border-white/10 text-[#F7F5F0] text-xs focus:outline-none focus:border-[#B18A4A] transition-colors"
                      >
                        {activeTab === "prayer" ? (
                          <>
                            <option value="Healing & Health">
                              Healing &amp; Health
                            </option>
                            <option value="Family & Marriage">
                              Family &amp; Marriage
                            </option>
                            <option value="Financial Breakthrough">
                              Financial Breakthrough
                            </option>
                            <option value="Spiritual Growth">
                              Spiritual Growth
                            </option>
                            <option value="General Prayer">
                              General Prayer
                            </option>
                          </>
                        ) : (
                          <>
                            <option value="Visiting This Sunday">
                              Visiting This Sunday
                            </option>
                            <option value="Small Groups / Ministries">
                              Small Groups / Ministries
                            </option>
                            <option value="Volunteering">Volunteering</option>
                            <option value="General Question">
                              General Question
                            </option>
                          </>
                        )}
                      </select>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="block text-xs font-medium text-[#D4D0C7]">
                      {activeTab === "prayer"
                        ? "Your Prayer Request"
                        : "Message / Detail"}
                    </label>
                    <textarea
                      rows={4}
                      required
                      value={formData.message}
                      onChange={(e) =>
                        setFormData({ ...formData, message: e.target.value })
                      }
                      placeholder={
                        activeTab === "prayer"
                          ? "Please write your prayer request here..."
                          : "How can we assist you?"
                      }
                      className="w-full px-4 py-3 rounded-sm bg-[#171717] border border-white/10 text-[#F7F5F0] placeholder-[#77736B] text-xs focus:outline-none focus:border-[#B18A4A] transition-colors"
                    />
                  </div>

                  {activeTab === "prayer" && (
                    <div className="flex items-center space-x-2 text-xs text-[#77736B]">
                      <input
                        type="checkbox"
                        id="isPrivate"
                        checked={formData.isPrivate}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            isPrivate: e.target.checked,
                          })
                        }
                        className="rounded-sm border-white/10 bg-[#171717] text-[#B18A4A] focus:ring-[#B18A4A]"
                      />
                      <label htmlFor="isPrivate">
                        Keep this request strictly confidential (Pastoral team
                        only)
                      </label>
                    </div>
                  )}

                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full py-3.5 rounded-sm bg-[#B18A4A] hover:bg-[#9C773B] disabled:opacity-50 text-white font-medium text-xs uppercase tracking-wider transition-colors flex items-center justify-center space-x-2"
                  >
                    {isSubmitting ? (
                      <Loader2 className="w-4 h-4 animate-spin text-white" />
                    ) : (
                      <>
                        <Send className="w-3.5 h-3.5" />
                        <span>
                          {activeTab === "prayer"
                            ? "Submit Prayer Request"
                            : "Send Message"}
                        </span>
                      </>
                    )}
                  </button>
                </form>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
