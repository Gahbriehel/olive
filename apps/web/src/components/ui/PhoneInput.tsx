"use client";

import { useState, useRef, useEffect } from "react";
import type { Country } from "@/types/country";
import { DEFAULT_COUNTRIES } from "@/data/countries";
import { ChevronDown, Loader2 } from "lucide-react";
import { cn } from "@olive/ui";

export interface PhoneInputProps {
  countries?: Country[];
  value?: string;
  onChange: (val: string) => void;
  selectedCountryName?: string;
  defaultDialCode?: string;
  label?: string;
  error?: string;
  required?: boolean;
  loading?: boolean;
  disabled?: boolean;
  placeholder?: string;
  className?: string;
}

export default function PhoneInput({
  countries = DEFAULT_COUNTRIES,
  value = "",
  onChange,
  selectedCountryName,
  defaultDialCode = "+234",
  label,
  error,
  required = false,
  loading = false,
  disabled = false,
  placeholder = "801 234 5678",
  className,
}: PhoneInputProps) {
  const countryList = countries.length > 0 ? countries : DEFAULT_COUNTRIES;

  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // If selectedCountryName is provided, determine dial code from it
  const countryFromName = selectedCountryName
    ? countryList.find((c) => c.name === selectedCountryName)
    : undefined;
  const initialDialCode = countryFromName
    ? `+${countryFromName.phone_code}`
    : defaultDialCode;

  const [selectedDialCode, setSelectedDialCode] = useState(initialDialCode);

  // Derive active dialCode and localNumber directly from `value` prop
  let activeDialCode = selectedDialCode;
  let localNumber = "";

  const cleanVal = (value || "").trim();
  if (cleanVal.startsWith("+")) {
    const match = countryList
      .slice()
      .sort((a, b) => b.phone_code.length - a.phone_code.length)
      .find((c) => cleanVal.startsWith(`+${c.phone_code}`));

    if (match) {
      activeDialCode = `+${match.phone_code}`;
      localNumber = cleanVal
        .slice(activeDialCode.length)
        .replace(/[^0-9\s-]/g, "");
    } else {
      localNumber = cleanVal.replace(/[^0-9\s-]/g, "");
    }
  } else {
    localNumber = cleanVal.replace(/[^0-9\s-]/g, "");
  }

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleNumberChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const raw = e.target.value.replace(/[^0-9\s-]/g, "");
    const cleanNum = raw.replace(/[\s-]/g, "");
    onChange(cleanNum ? `${activeDialCode}${cleanNum}` : "");
  };

  const handleDialCodeSelect = (code: string) => {
    const newDialCode = `+${code}`;
    setSelectedDialCode(newDialCode);
    setIsOpen(false);
    const cleanNum = localNumber.replace(/[\s-]/g, "");
    onChange(cleanNum ? `${newDialCode}${cleanNum}` : "");
  };

  const currentCountry = countryList.find(
    (c) => `+${c.phone_code}` === activeDialCode,
  );

  return (
    <div className="flex flex-col gap-1.5 w-full font-sans">
      {label && (
        <label className="text-xs font-semibold text-slate-300">
          {label}
          {required && <span className="text-rose-500 ml-1">*</span>}
        </label>
      )}

      <div
        ref={dropdownRef}
        className={cn(
          "relative flex items-center w-full bg-white/5 border border-white/10 rounded-xl transition-all duration-150 focus-within:ring-2 focus-within:ring-amber-500/50 focus-within:border-amber-500 min-h-[42px]",
          (disabled || loading) && "opacity-60 cursor-not-allowed",
          error &&
            "border-rose-500/60 focus-within:ring-rose-500/30 focus-within:border-rose-500",
          className,
        )}
      >
        <button
          type="button"
          className={cn(
            "flex items-center gap-1.5 px-3 py-2.5 text-sm text-slate-200 bg-white/5 border-r border-white/10 rounded-l-xl transition-colors focus:outline-none shrink-0 min-h-[42px]",
            disabled || loading
              ? "cursor-not-allowed"
              : "hover:bg-white/10 cursor-pointer",
          )}
          onClick={() => {
            if (!disabled && !loading) setIsOpen(!isOpen);
          }}
          tabIndex={-1}
          disabled={disabled || loading}
        >
          {loading ? (
            <Loader2 className="w-3.5 h-3.5 animate-spin text-slate-400" />
          ) : (
            <>
              {currentCountry?.flag && (
                <span className="text-base leading-none">
                  {currentCountry.flag}
                </span>
              )}
              <span className="font-semibold text-xs text-white">
                {activeDialCode}
              </span>
              <ChevronDown
                className={cn(
                  "w-3.5 h-3.5 text-slate-400 transition-transform duration-200",
                  isOpen && "rotate-180",
                )}
              />
            </>
          )}
        </button>

        <input
          type="tel"
          className={cn(
            "flex-1 px-3.5 py-2.5 text-sm bg-transparent w-full text-white placeholder-slate-500 focus:outline-none rounded-r-xl",
            (disabled || loading) && "cursor-not-allowed",
          )}
          placeholder={placeholder}
          value={localNumber}
          onChange={handleNumberChange}
          required={required}
          disabled={disabled || loading}
        />

        {isOpen && (
          <div className="absolute top-[calc(100%+6px)] left-0 z-50 w-64 max-h-60 overflow-y-auto bg-[#1F1F1F] border border-white/10 rounded-xl shadow-2xl py-1 backdrop-blur-md">
            <ul className="flex flex-col">
              {countryList.map((c) => {
                const formattedCode = `+${c.phone_code}`;
                const isSelected = formattedCode === activeDialCode;
                return (
                  <li
                    key={`${c.name}-${c.phone_code}`}
                    className={cn(
                      "flex items-center justify-between px-3.5 py-2.5 text-sm cursor-pointer hover:bg-white/10 transition-colors text-slate-200",
                      isSelected &&
                        "bg-amber-500/15 text-amber-400 font-semibold",
                    )}
                    onClick={() => handleDialCodeSelect(c.phone_code)}
                  >
                    <div className="flex items-center gap-2 truncate">
                      {c.flag && (
                        <span className="text-base leading-none">{c.flag}</span>
                      )}
                      <span className="truncate">{c.name}</span>
                    </div>
                    <span className="text-xs text-slate-400 font-mono ml-2">
                      {formattedCode}
                    </span>
                  </li>
                );
              })}
            </ul>
          </div>
        )}
      </div>

      {error && <p className="text-xs text-rose-400 mt-0.5">{error}</p>}
    </div>
  );
}
