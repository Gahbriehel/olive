import Link from "next/link";
import { MapPin, Phone, Mail } from "lucide-react";
import Image from "next/image";

export function Footer() {
  return (
    <footer className="bg-[#121212] text-[#F7F5F0] border-t border-[#B18A4A]/20 pt-16 pb-12 font-sans">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-12 gap-10 lg:gap-12 pb-16 ">
          {/* BRAND & SCRIPTURE */}
          <div className="lg:col-span-4 space-y-6">
            <div className="flex items-center space-x-3">
              <Image
                src="/images/logo-gold.png"
                alt="Abiding Word Of Grace Missions Logo"
                width={40}
                height={40}
                className="rounded-sm shrink-0"
              />
              <div>
                <span className="font-serif font-medium text-lg tracking-tight text-[#F7F5F0] block leading-tight">
                  Abiding Word Of Grace
                </span>
                <span className="text-[10px] font-sans font-medium text-[#B18A4A] tracking-[0.18em] uppercase block mt-0.5">
                  Missions
                </span>
              </div>
            </div>

            <p className="text-xs text-[#D4D0C7] font-light leading-relaxed max-w-sm">
              A vibrant house of worship dedicated to proclaiming salvation,
              healing, and divine grace to all nations.
            </p>

            <div className="border-l-2 border-[#B18A4A]/50 pl-3 py-1 space-y-1">
              <p className="text-xs italic text-[#A3A3A3] leading-relaxed">
                &ldquo;If you abide in Me, and My words abide in you, you will
                ask what you desire, and it shall be done for you.&rdquo;
              </p>
              <p className="text-[11px] font-medium text-[#B18A4A] uppercase tracking-wider">
                — John 15:7 (NKJV)
              </p>
            </div>
          </div>

          {/* QUICK LINKS */}
          <div className="lg:col-span-4 space-y-4">
            <h4 className="text-xs font-sans font-medium tracking-[0.2em] text-[#B18A4A] uppercase">
              Navigation
            </h4>
            <ul className="space-y-2.5 text-xs font-light">
              <li>
                <Link
                  href="/"
                  className="text-[#D4D0C7] hover:text-[#B18A4A] transition-colors"
                >
                  Home
                </Link>
              </li>
              <li>
                <Link
                  href="/about"
                  className="text-[#D4D0C7] hover:text-[#B18A4A] transition-colors"
                >
                  About
                </Link>
              </li>
              <li>
                <Link
                  href="/#services"
                  className="text-[#D4D0C7] hover:text-[#B18A4A] transition-colors"
                >
                  Weekly Services
                </Link>
              </li>
              <li>
                <Link
                  href="/events"
                  className="text-[#D4D0C7] hover:text-[#B18A4A] transition-colors"
                >
                  Upcoming Events
                </Link>
              </li>
              <li>
                <Link
                  href="/contact"
                  className="text-[#D4D0C7] hover:text-[#B18A4A] transition-colors"
                >
                  Contact &amp; Prayer
                </Link>
              </li>
            </ul>
          </div>

          {/* CONTACT & LOCATION */}
          <div className="lg:col-span-4 space-y-4">
            <h4 className="text-xs font-sans font-medium tracking-[0.2em] text-[#B18A4A] uppercase">
              Location &amp; Contact
            </h4>
            <ul className="space-y-3 text-xs font-light text-[#D4D0C7]">
              <li className="flex items-start space-x-3">
                <MapPin className="w-4 h-4 text-[#B18A4A] shrink-0 mt-0.5" />
                <span className="leading-relaxed">
                  No 1, Makanjuola Layout, Sawmill, Dogo, Apata, Ibadan, Oyo
                  State, Nigeria
                </span>
              </li>
              <li className="flex items-center space-x-3">
                <Phone className="w-4 h-4 text-[#B18A4A] shrink-0" />
                <a
                  href="tel:+2348033926828"
                  className="hover:text-[#F7F5F0] transition-colors"
                >
                  +234 802 330 8877
                </a>
              </li>
              <li className="flex items-start space-x-3">
                <Mail className="w-4 h-4 text-[#B18A4A] shrink-0 mt-0.5" />
                <a
                  href="mailto:abidingwordofgracemissions@gmail.com"
                  className="hover:text-[#F7F5F0] transition-colors break-all"
                >
                  abidingwordofgracemissions@gmail.com
                </a>
              </li>
            </ul>
          </div>
        </div>

        {/* Legal / Copyright Bottom Bar */}
        <div className="mt-16 pt-8 border-t border-white/10 flex flex-col sm:flex-row justify-between items-center gap-4 text-xs font-light text-[#77736B]">
          <p>
            © {new Date().getFullYear()} Abiding Word Of Grace Missions (a.k.a.
            Amazing Grace Bible Church). All rights reserved.
          </p>
          <p className="tracking-wider uppercase text-[10px] text-[#B18A4A]">
            Salvation • Healing • Deliverance
          </p>
        </div>
      </div>
    </footer>
  );
}
