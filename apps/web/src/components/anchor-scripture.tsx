"use client";

import React, { useState } from "react";
import { motion } from "framer-motion";
import { BookOpen, Copy, Check, Sparkles } from "lucide-react";
import toast from "react-hot-toast";

const VERSES = [
  {
    num: 1,
    text: "I am the true vine, and My Father is the vinedresser.",
  },
  {
    num: 2,
    text: "Every branch in Me that does not bear fruit He takes away; and every branch that bears fruit He prunes, that it may bear more fruit.",
  },
  {
    num: 3,
    text: "You are already clean because of the word which I have spoken to you.",
  },
  {
    num: 4,
    text: "Abide in Me, and I in you. As the branch cannot bear fruit of itself, unless it abides in the vine, neither can you, unless you abide in Me.",
  },
  {
    num: 5,
    text: "I am the vine, you are the branches. He who abides in Me, and I in him, bears much fruit; for without Me you can do nothing.",
  },
  {
    num: 6,
    text: "If anyone does not abide in Me, he is cast out as a branch and is withered; and they gather them and throw them into the fire, and they are burned.",
  },
  {
    num: 7,
    isKey: true,
    text: "If you abide in Me, and My words abide in you, you will ask what you desire, and it shall be done for you.",
  },
  {
    num: 8,
    text: "By this My Father is glorified, that you bear much fruit; so you will be My disciples.",
  },
];

export function AnchorScripture() {
  const [copied, setCopied] = useState(false);

  const fullText =
    `John 15:1–8 (NKJV)\n\n` +
    VERSES.map((v) => `${v.num}. ${v.text}`).join("\n");

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(fullText);
      setCopied(true);
      toast.success("Scripture passage copied to clipboard");
      setTimeout(() => setCopied(false), 2000);
    } catch {
      toast.error("Failed to copy scripture");
    }
  };

  return (
    <section className="w-full bg-[#121212] text-[#F7F5F0] py-24 border-b border-white/10 relative overflow-hidden">
      {/* Background ambient lighting */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-96 h-96 bg-[#B18A4A]/5 blur-3xl rounded-full pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-start">
          {/* Left Column: Heading & Context */}
          <div className="lg:col-span-5 space-y-6 lg:sticky lg:top-28">
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="inline-flex items-center space-x-2 text-[#B18A4A] text-xs font-sans font-medium uppercase tracking-[0.25em]"
            >
              <BookOpen className="w-3.5 h-3.5" />
              <span>Anchor Scripture</span>
            </motion.div>

            <motion.h2
              initial={{ opacity: 0, y: 15 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.1 }}
              className="text-4xl sm:text-5xl font-serif font-medium tracking-tight text-[#F7F5F0] leading-tight"
            >
              The Abiding Word <br />
              <span className="text-[#B18A4A] text-2xl sm:text-3xl font-serif font-normal italic">
                John 15:1–8 (NKJV)
              </span>
            </motion.h2>

            <motion.p
              initial={{ opacity: 0, y: 15 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.2 }}
              className="text-[#D4D0C7] text-sm sm:text-base font-sans font-light leading-relaxed"
            >
              Our ministry stands firmly upon the promise of spiritual
              connection, fruitfulness, and prevailing prayer as taught by Jesus
              Christ in the Gospel of John.
            </motion.p>

            {/* Key Theme Pills */}
            <motion.div
              initial={{ opacity: 0, y: 15 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.3 }}
              className="flex flex-wrap gap-2 pt-2"
            >
              {[
                "The True Vine",
                "Abiding in Christ",
                "Fruitfulness",
                "Prevailing Prayer",
              ].map((pill) => (
                <span
                  key={pill}
                  className="px-3 py-1 rounded-full text-[11px] font-sans text-[#D4D0C7] bg-white/5 border border-white/10 uppercase tracking-wider"
                >
                  {pill}
                </span>
              ))}
            </motion.div>

            {/* Copy Button */}
            <motion.div
              initial={{ opacity: 0, y: 15 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.4 }}
              className="pt-4"
            >
              <button
                type="button"
                onClick={handleCopy}
                className="inline-flex items-center space-x-2 px-5 py-2.5 rounded-sm border border-[#B18A4A]/40 bg-[#B18A4A]/10 hover:bg-[#B18A4A]/20 text-[#B18A4A] text-xs font-medium uppercase tracking-wider transition-colors duration-200"
              >
                {copied ? (
                  <>
                    <Check className="w-3.5 h-3.5 text-emerald-400" />
                    <span className="text-emerald-400">Passage Copied</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-3.5 h-3.5" />
                    <span>Copy Full Passage</span>
                  </>
                )}
              </button>
            </motion.div>
          </div>

          {/* Right Column: Verses Passage List */}
          <div className="lg:col-span-7 space-y-4">
            {VERSES.map((verse, index) => (
              <motion.div
                key={verse.num}
                initial={{ opacity: 0, y: 15 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.05 }}
                className={`p-5 rounded-sm border transition-colors ${
                  verse.isKey
                    ? "bg-[#1F1C16] border-[#B18A4A] shadow-lg relative"
                    : "bg-[#171717] border-white/10 hover:border-white/20"
                }`}
              >
                {verse.isKey && (
                  <div className="absolute -top-3 right-4 inline-flex items-center space-x-1 px-2.5 py-0.5 rounded-full bg-[#B18A4A] text-white text-[10px] uppercase font-semibold tracking-wider">
                    <Sparkles className="w-3 h-3" />
                    <span>Anchor Tag Verse</span>
                  </div>
                )}
                <div className="flex items-start space-x-4">
                  <span
                    className={`font-serif text-sm font-semibold shrink-0 mt-0.5 ${
                      verse.isKey ? "text-[#B18A4A]" : "text-[#77736B]"
                    }`}
                  >
                    0{verse.num}
                  </span>
                  <p
                    className={`text-sm sm:text-base leading-relaxed font-serif ${
                      verse.isKey
                        ? "text-[#F7F5F0] font-normal italic"
                        : "text-[#D4D0C7] font-light"
                    }`}
                  >
                    &ldquo;{verse.text}&rdquo;
                  </p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
