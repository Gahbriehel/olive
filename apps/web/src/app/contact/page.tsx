"use client";

import React, { useState } from "react";
import {
  MapPin,
  Phone,
  Mail,
  Clock,
  Heart,
  Send,
  CheckCircle2,
  MessageSquare,
} from "lucide-react";
import { motion } from "framer-motion";

export default function ContactPage() {
  const [activeTab, setActiveTab] = useState<"prayer" | "inquiry">("prayer");
  const [submitted, setSubmitted] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    category: "General Prayer",
    message: "",
    isPrivate: false,
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitted(true);
  };

  const handleReset = () => {
    setSubmitted(false);
    setFormData({
      name: "",
      email: "",
      phone: "",
      category: "General Prayer",
      message: "",
      isPrivate: false,
    });
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-16">
      {/* HEADER SECTION */}
      <div className="text-center max-w-3xl mx-auto space-y-4">
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          className="inline-flex items-center space-x-2 px-4 py-1.5 rounded-full bg-amber-500/15 border border-amber-500/30 text-amber-400 text-xs font-bold uppercase tracking-wider"
        >
          <Heart className="w-3.5 h-3.5" />
          <span>We Are Here For You</span>
        </motion.div>

        <motion.h1
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="text-4xl sm:text-5xl font-extrabold text-white tracking-tight"
        >
          Get In Touch & Prayer Requests
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="text-lg text-slate-400 leading-relaxed"
        >
          Whether you have questions, need prayer, or want to visit us this
          Sunday, our pastoral team and church community welcome you with open
          arms.
        </motion.p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start">
        {/* LEFT COLUMN: CONTACT DETAILS & SERVICE TIMES */}
        <div className="lg:col-span-5 space-y-8">
          <div className="rounded-3xl p-8 border border-white/10 bg-[#0F1D33] space-y-6 shadow-sm">
            <h2 className="text-2xl font-bold text-white flex items-center space-x-3">
              <MapPin className="w-6 h-6 text-amber-400" />
              <span>Visit & Contact Us</span>
            </h2>

            <div className="space-y-6 text-sm text-slate-400">
              <div className="flex items-start space-x-4">
                <div className="w-10 h-10 rounded-xl bg-amber-500/15 text-amber-400 flex items-center justify-center shrink-0 mt-0.5">
                  <MapPin className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bold text-white text-base">
                    Church Campus Address
                  </h3>
                  <p className="mt-1 leading-relaxed">
                    123 Hope Boulevard, Cityville, ST 12345
                  </p>
                  <span className="inline-block mt-2 px-2.5 py-1 rounded-md bg-white/5 text-xs font-semibold text-amber-400">
                    Free Campus Parking Available
                  </span>
                </div>
              </div>

              <div className="flex items-start space-x-4">
                <div className="w-10 h-10 rounded-xl bg-white/5 text-slate-300 flex items-center justify-center shrink-0 mt-0.5">
                  <Phone className="w-5 h-5 text-amber-400" />
                </div>
                <div>
                  <h3 className="font-bold text-white text-base">
                    Phone Lines
                  </h3>
                  <div className="mt-1 space-y-1 font-medium">
                    <p>(555) 123-4567</p>
                    <p>(555) 987-6543</p>
                  </div>
                </div>
              </div>

              <div className="flex items-start space-x-4">
                <div className="w-10 h-10 rounded-xl bg-amber-500/15 text-amber-400 flex items-center justify-center shrink-0 mt-0.5">
                  <Mail className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bold text-white text-base">
                    Email Address
                  </h3>
                  <p className="mt-1 font-medium text-amber-400">
                    contact@gracecitychurch.org
                  </p>
                </div>
              </div>

              <div className="flex items-start space-x-4">
                <div className="w-10 h-10 rounded-xl bg-white/5 text-amber-400 flex items-center justify-center shrink-0 mt-0.5">
                  <Clock className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bold text-white text-base">
                    Weekly Service Schedule
                  </h3>
                  <ul className="mt-2 space-y-1.5 text-xs">
                    <li className="flex justify-between">
                      <span className="font-semibold">Sunday Service:</span>
                      <span>9:00 AM & 11:30 AM</span>
                    </li>
                    <li className="flex justify-between">
                      <span className="font-semibold">
                        Tuesday Bible Study:
                      </span>
                      <span>6:30 PM – 8:00 PM</span>
                    </li>
                    <li className="flex justify-between">
                      <span className="font-semibold">Thursday Prayer:</span>
                      <span>6:00 PM – 7:30 PM</span>
                    </li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* RIGHT COLUMN: PRAYER REQUEST & INQUIRY FORM */}
        <div className="lg:col-span-7">
          <div className="rounded-3xl p-8 border border-white/10 bg-[#0F1D33] space-y-6 shadow-sm">
            {/* Form Mode Selector */}
            <div className="flex bg-white/5 p-1.5 rounded-2xl">
              <button
                type="button"
                onClick={() => {
                  setActiveTab("prayer");
                  setSubmitted(false);
                }}
                className={`flex-1 py-3 rounded-xl font-bold text-sm transition-all duration-200 flex items-center justify-center space-x-2 ${
                  activeTab === "prayer"
                    ? "bg-[#0F1D33] text-amber-400 shadow-sm"
                    : "text-slate-400 hover:text-white"
                }`}
              >
                <Heart className="w-4 h-4" />
                <span>Submit Prayer Request</span>
              </button>
              <button
                type="button"
                onClick={() => {
                  setActiveTab("inquiry");
                  setSubmitted(false);
                }}
                className={`flex-1 py-3 rounded-xl font-bold text-sm transition-all duration-200 flex items-center justify-center space-x-2 ${
                  activeTab === "inquiry"
                    ? "bg-[#0F1D33] text-amber-400 shadow-sm"
                    : "text-slate-400 hover:text-white"
                }`}
              >
                <MessageSquare className="w-4 h-4" />
                <span>General Inquiry</span>
              </button>
            </div>

            {submitted ? (
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="py-12 text-center space-y-4"
              >
                <div className="w-16 h-16 rounded-full bg-amber-500/15 text-amber-400 flex items-center justify-center mx-auto">
                  <CheckCircle2 className="w-10 h-10" />
                </div>
                <h3 className="text-2xl font-bold text-white">
                  {activeTab === "prayer"
                    ? "Prayer Request Received"
                    : "Message Sent Successfully"}
                </h3>
                <p className="text-sm text-slate-400 max-w-md mx-auto leading-relaxed">
                  {activeTab === "prayer"
                    ? "Our pastoral and prayer team will stand in prayer with you. God bless you abundantly!"
                    : "Thank you for reaching out. We will get back to you shortly."}
                </p>
                <button
                  type="button"
                  onClick={handleReset}
                  className="mt-4 px-6 py-2.5 rounded-xl bg-amber-600 text-white font-semibold text-sm shadow-md hover:bg-amber-500 transition-colors"
                >
                  Send Another Submission
                </button>
              </motion.div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-5">
                <div>
                  <h3 className="text-lg font-bold text-white">
                    {activeTab === "prayer"
                      ? "Share Your Prayer Request"
                      : "Send Us a Message"}
                  </h3>
                  <p className="text-xs text-slate-500 mt-1">
                    {activeTab === "prayer"
                      ? "Confidential requests will only be seen by our prayer team."
                      : "Fill in your details and we will connect with you."}
                  </p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="block text-xs font-semibold text-slate-300">
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
                      className="w-full px-4 py-2.5 rounded-xl border border-white/10 bg-[#0F1D33] text-white focus:ring-2 focus:ring-amber-500 focus:outline-none text-sm"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="block text-xs font-semibold text-slate-300">
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
                      className="w-full px-4 py-2.5 rounded-xl border border-white/10 bg-[#0F1D33] text-white focus:ring-2 focus:ring-amber-500 focus:outline-none text-sm"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="block text-xs font-semibold text-slate-300">
                      Phone Number (Optional)
                    </label>
                    <input
                      type="tel"
                      value={formData.phone}
                      onChange={(e) =>
                        setFormData({ ...formData, phone: e.target.value })
                      }
                      placeholder="e.g. (555) 123-4567"
                      className="w-full px-4 py-2.5 rounded-xl border border-white/10 bg-[#0F1D33] text-white focus:ring-2 focus:ring-amber-500 focus:outline-none text-sm"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="block text-xs font-semibold text-slate-300">
                      Category
                    </label>
                    <select
                      value={formData.category}
                      onChange={(e) =>
                        setFormData({ ...formData, category: e.target.value })
                      }
                      className="w-full px-4 py-2.5 rounded-xl border border-white/10 bg-[#0F1D33] text-white focus:ring-2 focus:ring-amber-500 focus:outline-none text-sm"
                    >
                      {activeTab === "prayer" ? (
                        <>
                          <option value="Healing & Health">
                            Healing & Health
                          </option>
                          <option value="Family & Marriage">
                            Family & Marriage
                          </option>
                          <option value="Financial Breakthrough">
                            Financial Breakthrough
                          </option>
                          <option value="Spiritual Growth">
                            Spiritual Growth
                          </option>
                          <option value="General Prayer">General Prayer</option>
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

                <div className="space-y-1">
                  <label className="block text-xs font-semibold text-slate-300">
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
                    className="w-full px-4 py-2.5 rounded-xl border border-white/10 bg-[#0F1D33] text-white focus:ring-2 focus:ring-amber-500 focus:outline-none text-sm"
                  />
                </div>

                {activeTab === "prayer" && (
                  <div className="flex items-center space-x-2 text-xs text-slate-400">
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
                      className="rounded border-white/10 text-amber-400 focus:ring-amber-500"
                    />
                    <label htmlFor="isPrivate">
                      Keep this request strictly confidential (Pastoral team
                      only)
                    </label>
                  </div>
                )}

                <button
                  type="submit"
                  className="w-full py-3.5 rounded-xl bg-amber-600 hover:bg-amber-500 text-white font-bold text-base shadow-lg shadow-amber-900/25 transition-all duration-200 flex items-center justify-center space-x-2"
                >
                  <Send className="w-4 h-4" />
                  <span>
                    {activeTab === "prayer"
                      ? "Submit Prayer Request"
                      : "Send Message"}
                  </span>
                </button>
              </form>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
