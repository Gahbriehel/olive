import React from "react";
import Link from "next/link";
import { Church, MapPin, Phone, Mail, Clock, Heart } from "lucide-react";

export function Footer() {
  return (
    <footer className="border-t border-slate-200/80 dark:border-slate-800/80 bg-slate-900 text-slate-300 pt-16 pb-12 transition-colors duration-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-10">
          {/* Col 1: Branding */}
          <div className="space-y-4 md:col-span-1">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-emerald-500 to-teal-400 flex items-center justify-center text-white shadow-md shadow-emerald-500/20">
                <Church className="w-6 h-6" />
              </div>
              <span className="font-extrabold text-xl tracking-tight text-white">
                GRACE CITY
              </span>
            </div>
            <p className="text-sm text-slate-400 leading-relaxed">
              Loving God, serving people, and building a community rooted in
              faith, hope, and compassion.
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
                  className="hover:text-emerald-400 transition-colors"
                >
                  Home
                </Link>
              </li>
              <li>
                <Link
                  href="/about"
                  className="hover:text-emerald-400 transition-colors"
                >
                  About & Mission
                </Link>
              </li>
              <li>
                <Link
                  href="/events"
                  className="hover:text-emerald-400 transition-colors"
                >
                  Upcoming Events
                </Link>
              </li>
            </ul>
          </div>

          {/* Col 3: Service Times */}
          <div>
            <h3 className="text-sm font-bold uppercase tracking-wider text-white mb-4">
              Service Times
            </h3>
            <ul className="space-y-3 text-sm">
              <li className="flex items-start space-x-3">
                <Clock className="w-5 h-5 text-emerald-400 mt-0.5 shrink-0" />
                <div>
                  <p className="font-semibold text-white">Sunday Worship</p>
                  <p className="text-xs text-slate-400">9:00 AM & 11:30 AM</p>
                </div>
              </li>
              <li className="flex items-start space-x-3">
                <Clock className="w-5 h-5 text-emerald-400 mt-0.5 shrink-0" />
                <div>
                  <p className="font-semibold text-white">
                    Wednesday Bible Study
                  </p>
                  <p className="text-xs text-slate-400">6:30 PM</p>
                </div>
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
                <MapPin className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
                <span className="text-xs text-slate-300">
                  123 Hope Boulevard, Main Campus, Cityville
                </span>
              </li>
              <li className="flex items-center space-x-3">
                <Phone className="w-5 h-5 text-emerald-400 shrink-0" />
                <span className="text-xs text-slate-300">
                  +1 (555) 234-5678
                </span>
              </li>
              <li className="flex items-center space-x-3">
                <Mail className="w-5 h-5 text-emerald-400 shrink-0" />
                <span className="text-xs text-slate-300">
                  contact@gracecity.org
                </span>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-12 pt-8 border-t border-slate-800 flex flex-col md:flex-row items-center justify-between text-xs text-slate-500">
          <p>
            © {new Date().getFullYear()} Grace City Church. Built with Olive
            Platform.
          </p>
          <p className="flex items-center space-x-1 mt-4 md:mt-0">
            <span>Crafted with</span>
            <Heart className="w-3.5 h-3.5 text-rose-500 fill-rose-500" />
            <span>for the church community</span>
          </p>
        </div>
      </div>
    </footer>
  );
}
