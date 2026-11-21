import Link from "next/link";
import { ArrowRight, HandHeart } from "lucide-react";

/** Short "Partner with us" banner that links to the Give page. */
export function GiveCallout() {
  return (
    <section className="w-full bg-[#171717] py-24 border-b border-white/10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col gap-8 rounded-sm border border-[#B18A4A]/30 bg-[#1F1F1F] p-8 sm:p-12 md:flex-row md:items-center md:justify-between">
          <div className="space-y-4 max-w-2xl">
            <span className="inline-flex items-center gap-2 text-[#B18A4A] text-xs font-sans font-medium uppercase tracking-[0.2em]">
              <HandHeart aria-hidden className="w-4 h-4" />
              PARTNER WITH US
            </span>
            <h2 className="text-3xl sm:text-4xl font-serif font-medium text-[#F7F5F0] tracking-tight">
              Sow Into the Work of God
            </h2>
            <p className="text-[#D4D0C7] text-base leading-relaxed font-sans font-light">
              Give your tithes, offerings and seeds, or support our building and
              missions work, by bank transfer.
            </p>
          </div>
          <Link
            href="/give"
            className="inline-flex shrink-0 items-center justify-center space-x-2 px-7 py-3 rounded-sm bg-[#B18A4A] hover:bg-[#9C773B] text-white font-medium text-xs uppercase tracking-wider transition-colors"
          >
            <span>Give Now</span>
            <ArrowRight aria-hidden className="w-4 h-4" />
          </Link>
        </div>
      </div>
    </section>
  );
}
