"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Menu, X, Clock, MapPin } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import Image from "next/image";

export function Navbar() {
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 20) {
        setScrolled(true);
      } else {
        setScrolled(false);
      }
    };
    window.addEventListener("scroll", handleScroll);
    handleScroll();
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const isHome = pathname === "/";
  const headerClass = isHome
    ? "fixed top-0 left-0 right-0 z-50 transition-all duration-300 ease-in-out"
    : "sticky top-0 z-50 transition-all duration-300 ease-in-out";

  const bgClass = scrolled
    ? "bg-[#1A3A63]/95 backdrop-blur-md border-b border-white/10 shadow-lg shadow-black/20"
    : "bg-transparent border-b border-transparent";

  const navLinks = [
    { href: "/", label: "Home" },
    { href: "/about", label: "About" },
    { href: "/#services", label: "Services" },
    { href: "/events", label: "Events" },
    { href: "/contact", label: "Contact" },
  ];

  return (
    <header className={headerClass}>
      {/* MAIN NAVBAR */}
      <div className={`transition-all duration-300 ease-in-out ${bgClass}`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-20">
            {/* Logo / Branding */}
            <Link href="/" className="flex items-center space-x-3 group">
              <div className="w-10 h-10 rounded-xl flex items-center justify-center">
                <Image
                  src="/images/logo-gold.png"
                  alt="Logo"
                  width={100}
                  height={100}
                />
              </div>
              <div>
                <span className="font-extrabold text-xl tracking-tight text-white group-hover:text-amber-400 transition-colors">
                  Amazing Grace
                </span>
                <span className="block text-xs font-medium text-slate-400 tracking-widest uppercase">
                  Bible Church
                </span>
              </div>
            </Link>

            {/* Desktop Navigation Links */}
            <nav className="hidden md:flex items-center space-x-1">
              {navLinks.map((link) => {
                const isActive = pathname === link.href;
                return (
                  <Link
                    key={link.href}
                    href={link.href}
                    className={`px-4 py-2 rounded-xl text-sm font-semibold transition-all duration-200 ${
                      isActive
                        ? "bg-white/10 text-amber-400 font-bold"
                        : "text-slate-300 hover:text-white hover:bg-white/5"
                    }`}
                  >
                    {link.label}
                  </Link>
                );
              })}
            </nav>

            {/* Right Action Controls */}
            <div className="hidden md:flex items-center space-x-3">
              {/* CTA Button */}
              {/* <Link
                href="/contact"
                className="px-5 py-2.5 rounded-xl bg-amber-600 hover:bg-amber-500 text-white font-semibold text-sm shadow-md shadow-amber-900/20 transition-all duration-200 border border-amber-500/50"
              >
                Watch Live
              </Link> */}
            </div>

            {/* Mobile Menu Toggle Button */}
            <div className="flex md:hidden items-center space-x-2">
              <button
                onClick={() => setMobileOpen(true)}
                aria-label="Open mobile menu"
                className="p-2.5 rounded-xl bg-white/10 text-white hover:bg-white/15 transition-colors"
              >
                <Menu className="w-6 h-6" />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* MOBILE SLIDE-OUT DRAWER OVERLAY */}
      <AnimatePresence>
        {mobileOpen && (
          <>
            {/* Dimmed Backdrop Overlay */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setMobileOpen(false)}
              className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-sm md:hidden"
            />

            {/* Slide-out Drawer Panel */}
            <motion.div
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{ type: "spring", damping: 25, stiffness: 200 }}
              className="fixed top-0 right-0 bottom-0 z-50 w-4/5 max-w-xs bg-[#0F1D33] text-white shadow-2xl flex flex-col justify-between p-6 md:hidden border-l border-white/10"
            >
              {/* Drawer Top Header */}
              <div>
                <div className="flex items-center justify-between pb-6 border-b border-white/10">
                  <div className="flex items-center space-x-2.5">
                    <Image
                      src="/images/logo-gold.png"
                      alt="Logo"
                      width={32}
                      height={32}
                      className="rounded-lg"
                    />
                    <span className="font-extrabold text-lg text-white tracking-tight">
                      Amazing Grace
                    </span>
                  </div>
                  <button
                    onClick={() => setMobileOpen(false)}
                    aria-label="Close menu"
                    className="p-2 rounded-xl bg-white/10 text-slate-400 hover:text-white hover:bg-white/15 transition-colors"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>

                {/* Vertical Navigation Links */}
                <nav className="mt-6 space-y-1">
                  {navLinks.map((link) => {
                    const isActive = pathname === link.href;
                    return (
                      <Link
                        key={link.href}
                        href={link.href}
                        onClick={() => setMobileOpen(false)}
                        className={`block py-3.5 px-4 rounded-xl text-base font-semibold transition-colors border-b border-white/5 ${
                          isActive
                            ? "bg-amber-500/15 text-amber-400 border-amber-500/20"
                            : "text-slate-300 hover:bg-white/5 hover:text-white"
                        }`}
                      >
                        {link.label}
                      </Link>
                    );
                  })}
                </nav>
              </div>

              {/* Drawer Bottom Action & Contact Info */}
              <div className="pt-6 border-t border-white/10 space-y-4">
                <div className="text-xs text-slate-400 space-y-1.5">
                  <p className="flex items-center space-x-2">
                    <Clock className="w-4 h-4 text-amber-400 shrink-0" />
                    <span>Sun: 7:30 AM & 9:00 AM</span>
                  </p>
                  <p className="flex items-center space-x-2">
                    <MapPin className="w-4 h-4 text-amber-400 shrink-0" />
                    <span>
                      No 1, Makanjuola Street, Adifase, Dogo, Apata, Ibadan
                    </span>
                  </p>
                </div>

                <Link
                  href="/contact"
                  onClick={() => setMobileOpen(false)}
                  className="block text-center w-full py-3.5 rounded-xl bg-amber-600 hover:bg-amber-500 text-white font-bold text-sm shadow-lg shadow-amber-900/30 transition-all border border-amber-500/50"
                >
                  Contact & Prayer Request
                </Link>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </header>
  );
}
