"use client";

import { useState, useRef, useEffect } from "react";
import { MapPin, ChevronDown, ChevronUp, CheckCircle2, Clock, Building2, X } from "lucide-react";

export function LocationStatusCard() {
  const [isOpen, setIsOpen] = useState(false);
  const cardRef = useRef<HTMLDivElement>(null);

  // Close dropdown on click outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (cardRef.current && !cardRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div ref={cardRef} className="relative z-30 mb-2">
      {/* Collapsed Default Pill/Card */}
      <button
        type="button"
        onClick={() => setIsOpen((prev) => !prev)}
        className="w-full max-w-[340px] sm:max-w-[360px] bg-white/95 backdrop-blur-md border border-slate-100/90 shadow-md hover:shadow-lg rounded-[20px] p-3 sm:p-3.5 flex items-center justify-between gap-3 text-left transition-all duration-200 hover:border-emerald-200 group"
        aria-expanded={isOpen}
      >
        <div className="flex items-center gap-3">
          {/* Location Pin Icon inside soft green circle */}
          <div className="w-10 h-10 rounded-full bg-emerald-100/80 border border-emerald-200/80 text-[#16a34a] flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
            <MapPin className="w-5 h-5 text-[#16a34a]" />
          </div>

          <div>
            <div className="text-[11px] font-extrabold text-[#16a34a] tracking-wide leading-none uppercase">
              Currently Serving
            </div>
            <div className="text-base sm:text-lg font-extrabold text-slate-900 leading-tight mt-0.5">
              Gandhinagar
            </div>
            <div className="text-[11px] font-semibold text-slate-500 leading-none mt-0.5">
              Fresh supply available in your city
            </div>
          </div>
        </div>

        {/* Dropdown Chevron Arrow */}
        <div className="text-slate-400 group-hover:text-slate-600 transition-colors shrink-0 pr-1">
          {isOpen ? (
            <ChevronUp className="w-5 h-5 text-slate-600" />
          ) : (
            <ChevronDown className="w-5 h-5 text-slate-500" />
          )}
        </div>
      </button>

      {/* Expanded View Dropdown */}
      {isOpen && (
        <div className="absolute top-full left-0 mt-2 w-full max-w-[340px] sm:max-w-[360px] bg-white/98 backdrop-blur-xl border border-slate-100 shadow-2xl rounded-[20px] p-4 sm:p-5 z-50 animate-in fade-in slide-in-from-top-2 duration-200">
          
          {/* Header Row */}
          <div className="flex items-center justify-between mb-3 pb-2 border-b border-slate-100">
            <span className="text-[11px] font-extrabold text-[#16a34a] tracking-wider uppercase">
              Currently Serving
            </span>
            <button
              onClick={() => setIsOpen(false)}
              className="w-6 h-6 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-500 flex items-center justify-center transition"
              aria-label="Close location dropdown"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Currently Serving Cities List */}
          <div className="space-y-2.5">
            <div className="flex items-center gap-2.5 text-slate-900 font-extrabold text-sm sm:text-base">
              <CheckCircle2 className="w-4 h-4 text-[#16a34a] shrink-0" />
              <span>Gandhinagar</span>
            </div>
            <div className="flex items-center gap-2.5 text-slate-900 font-extrabold text-sm sm:text-base">
              <CheckCircle2 className="w-4 h-4 text-[#16a34a] shrink-0" />
              <span>Ahmedabad</span>
            </div>
          </div>

          {/* Upcoming Cities Section */}
          <div className="mt-5 pt-3 border-t border-slate-100">
            <span className="text-[11px] font-extrabold text-[#f97316] tracking-wider uppercase block mb-2">
              Upcoming Cities
            </span>
            
            <div className="flex items-start gap-2.5">
              <Clock className="w-4 h-4 text-[#f97316] shrink-0 mt-0.5" />
              <div>
                <div className="text-slate-900 font-extrabold text-sm sm:text-base leading-tight">
                  Nearby cities — Coming Soon
                </div>
                <div className="text-[11px] font-semibold text-slate-500 mt-0.5">
                  More locations will be added soon
                </div>
              </div>
            </div>
          </div>

          {/* Footer Info Box */}
          <div className="mt-4 bg-emerald-50/80 border border-emerald-100 rounded-xl p-3 flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-emerald-100 text-[#16a34a] flex items-center justify-center shrink-0">
              <Building2 className="w-4 h-4 text-[#16a34a]" />
            </div>
            <p className="text-xs font-extrabold text-slate-800 leading-snug">
              Expanding our fresh supply network to more nearby cities.
            </p>
          </div>

        </div>
      )}
    </div>
  );
}
