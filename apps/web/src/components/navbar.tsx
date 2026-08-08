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
    ? "bg-[#171717]/90 backdrop-blur-md border-b border-white/10 shadow-sm"
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
              <div className="w-10 h-10 rounded-md overflow-hidden flex items-center justify-center">
                <Image
                  src="/images/logo-gold.png"
                  alt="Logo"
                  width={40}
                  height={40}
                  className="object-contain"
                />
              </div>
              <div>
                <span className="font-serif font-bold text-xl tracking-tight text-[#F7F5F0] group-hover:text-[#B18A4A] transition-colors">
                  Amazing Grace
                </span>
                <span className="block text-[10px] font-sans font-medium text-[#77736B] tracking-[0.2em] uppercase">
                  Bible Church
                </span>
              </div>
            </Link>

            {/* Desktop Navigation Links */}
            <nav className="hidden md:flex items-center space-x-2">
              {navLinks.map((link) => {
                const isActive = pathname === link.href;
                return (
                  <Link
                    key={link.href}
                    href={link.href}
                    className={`px-3.5 py-1.5 text-sm font-medium transition-all duration-200 ${
                      isActive
                        ? "text-[#B18A4A] font-semibold border-b border-[#B18A4A]"
                        : "text-[#D4D0C7] hover:text-[#F7F5F0]"
                    }`}
                  >
                    {link.label}
                  </Link>
                );
              })}
            </nav>

            {/* Right Action Controls */}
            <div className="hidden md:flex items-center space-x-3">
              <Link
                href="/contact"
                className="px-4 py-2 rounded-md bg-[#B18A4A] hover:bg-[#9C773B] text-white font-medium text-xs uppercase tracking-wider transition-colors duration-200"
              >
                Join Us
              </Link>
            </div>

            {/* Mobile Menu Toggle Button */}
            <div className="flex md:hidden items-center space-x-2">
              <button
                onClick={() => setMobileOpen(true)}
                aria-label="Open mobile menu"
                className="p-2 rounded-md bg-white/5 text-[#F7F5F0] hover:bg-white/10 transition-colors"
              >
                <Menu className="w-5 h-5" />
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
              className="fixed inset-0 z-50 bg-black/80 backdrop-blur-xs md:hidden"
            />

            {/* Slide-out Drawer Panel */}
            <motion.div
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{ type: "spring", damping: 25, stiffness: 200 }}
              className="fixed top-0 right-0 bottom-0 z-50 w-4/5 max-w-xs bg-[#171717] text-[#F7F5F0] shadow-2xl flex flex-col justify-between p-6 md:hidden border-l border-white/10"
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
                      className="rounded-sm"
                    />
                    <span className="font-serif font-bold text-lg text-[#F7F5F0] tracking-tight">
                      Amazing Grace
                    </span>
                  </div>
                  <button
                    onClick={() => setMobileOpen(false)}
                    aria-label="Close menu"
                    className="p-2 rounded-md bg-white/5 text-[#77736B] hover:text-[#F7F5F0] hover:bg-white/10 transition-colors"
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
                        className={`block py-3 px-3 rounded-md text-sm font-medium transition-colors border-b border-white/5 ${
                          isActive
                            ? "text-[#B18A4A] font-semibold border-b-[#B18A4A]/30 bg-white/5"
                            : "text-[#D4D0C7] hover:bg-white/5 hover:text-[#F7F5F0]"
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
                <div className="text-xs text-[#77736B] space-y-2">
                  <p className="flex items-center space-x-2">
                    <Clock className="w-3.5 h-3.5 text-[#B18A4A] shrink-0" />
                    <span>Sun: 8:00 AM & 9:00 AM</span>
                  </p>
                  <p className="flex items-center space-x-2 leading-tight">
                    <MapPin className="w-3.5 h-3.5 text-[#B18A4A] shrink-0" />
                    <span>
                      No 1, Makanjuola Layout, Sawmill, Dogo, Apata, Ibadan
                    </span>
                  </p>
                </div>

                <Link
                  href="/contact"
                  onClick={() => setMobileOpen(false)}
                  className="block text-center w-full py-3 rounded-md bg-[#B18A4A] hover:bg-[#9C773B] text-white font-semibold text-xs uppercase tracking-wider transition-colors"
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
