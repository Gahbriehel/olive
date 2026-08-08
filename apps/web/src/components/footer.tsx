import React from "react";
import Link from "next/link";
import { MapPin, Phone, Mail } from "lucide-react";
import Image from "next/image";

export function Footer() {
  return (
    <footer className="border-t border-white/10 bg-[#1A3A63]/95 text-slate-300 pt-16 pb-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
          {/* Col 1: Branding & Scripture Quote */}
          <div className="space-y-4 md:col-span-1">
            <div className="flex items-center space-x-3">
              <Image
                src="/images/logo-gold.png"
                alt="Logo"
                width={32}
                height={32}
                className="rounded-lg"
              />
              <span className="font-extrabold text-xl tracking-tight text-white">
                Amazing Grace Bible Church
              </span>
            </div>
            <p className="text-sm text-slate-400 leading-relaxed">
              Salvation, Healing, and Transformation. A vibrant community of
              believers rooted in the grace of Jesus Christ.
            </p>
            <p className="text-xs text-slate-400 italic">
              &quot;Jesus Christ the same yesterday, and today, and
              forever.&quot; — Heb. 13:8
            </p>
          </div>

          {/* Col 2: Quick Links */}
          <div>
            <h3 className="text-sm font-bold uppercase tracking-wider text-white mb-4">
              Quick Navigation
            </h3>
            <ul className="space-y-2.5 text-sm">
              <li>
                <Link
                  href="/"
                  className="hover:text-amber-400 transition-colors"
                >
                  Home
                </Link>
              </li>
              <li>
                <Link
                  href="/about"
                  className="hover:text-amber-400 transition-colors"
                >
                  About & Leadership
                </Link>
              </li>
              <li>
                <Link
                  href="/events"
                  className="hover:text-amber-400 transition-colors"
                >
                  Upcoming Events
                </Link>
              </li>
              <li>
                <Link
                  href="/contact"
                  className="hover:text-amber-400 transition-colors"
                >
                  Contact & Prayer Request
                </Link>
              </li>
            </ul>
          </div>

          {/* Col 4: Contact Info */}
          <div>
            <h3 className="text-sm font-bold uppercase tracking-wider text-white mb-4">
              Contact & Location
            </h3>
            <ul className="space-y-3 text-sm">
              <li className="flex items-start space-x-3">
                <MapPin className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
                <span className="text-xs text-slate-300">
                  No 1, Makanjuola Street, Adifase, Dogo, Apata, Ibadan
                </span>
              </li>
              <li className="flex items-center space-x-3">
                <Phone className="w-5 h-5 text-amber-400 shrink-0" />
                <span className="text-xs text-slate-300">(+234) 123-4567</span>
              </li>
              <li className="flex items-center space-x-3">
                <Mail className="w-5 h-5 text-amber-400 shrink-0" />
                <span className="text-xs text-slate-300">
                  abidingwordofgracemissionsgmai.com
                </span>
              </li>
            </ul>
          </div>
        </div>
      </div>
    </footer>
  );
}
