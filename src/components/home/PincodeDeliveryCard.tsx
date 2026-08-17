"use client";

import { useState } from "react";
import Image from "next/image";
import { MapPin, CheckCircle2, XCircle, ArrowRight, Sparkles } from "lucide-react";
import { LocationStatusCard } from "./LocationStatusCard";

export function PincodeDeliveryCard() {
  const [pincode, setPincode] = useState("");
  const [status, setStatus] = useState<"idle" | "serviceable" | "unserviceable">("idle");

  const validPincodes = [
    "382001", "382002", "382003", "382004", "382005", "382006", "382007", "382008", "382009",
    "382010", "382016", "382021", "382024", "382028", "382421", "382423", "382424"
  ];

  const handleCheck = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const cleanPin = pincode.trim();
    if (!cleanPin) {
      setStatus("idle");
      return;
    }

    // Check if pincode starts with 3820 or 3824, or is in valid list
    if (cleanPin.startsWith("3820") || cleanPin.startsWith("3824") || validPincodes.includes(cleanPin)) {
      setStatus("serviceable");
    } else {
      setStatus("unserviceable");
    }
  };

  const handleInputChange = (val: string) => {
    setPincode(val);
    if (!val.trim()) {
      setStatus("idle");
    }
  };

  return (
    <div className="w-full bg-[#f2fcf5]/95 backdrop-blur-xl border-2 border-emerald-200/90 shadow-xl shadow-emerald-950/5 rounded-[28px] p-5 sm:p-6 lg:p-7 mb-8 sm:mb-10 ring-1 ring-emerald-500/10">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-6 items-center">
        
        {/* LEFT COLUMN: Currently Serving Dropdown & Badge */}
        <div className="lg:col-span-3 xl:col-span-3 flex flex-col items-start gap-3 border-b lg:border-b-0 lg:border-r border-emerald-200/80 pb-5 lg:pb-0 lg:pr-5">
          {/* Location / Supply Status Card */}
          <LocationStatusCard />

          {/* Brand Tagline Badge */}
          <div className="inline-flex items-center gap-2 text-[#16a34a] font-bold text-xs tracking-widest uppercase bg-white px-3 py-1.5 rounded-full border border-emerald-300 shadow-2xs">
            <span className="w-2.5 h-[1.5px] bg-[#16a34a]"></span>
            <span>Fresh. Fast. Reliable.</span>
            <span className="w-2.5 h-[1.5px] bg-[#16a34a]"></span>
          </div>
        </div>

        {/* CENTER COLUMN: Pincode Check Form */}
        <div className="lg:col-span-5 xl:col-span-5 flex flex-col justify-center border-b lg:border-b-0 lg:border-r border-emerald-200/80 pb-5 lg:pb-0 lg:pr-5">
          <div className="flex items-center gap-2 mb-1">
            <div className="w-8 h-8 rounded-full bg-emerald-100 text-[#16a34a] flex items-center justify-center shrink-0 border border-emerald-200">
              <MapPin className="w-4 h-4 text-[#16a34a]" />
            </div>
            <h3 className="font-extrabold text-base sm:text-lg text-slate-900">
              Check if we deliver in your area
            </h3>
          </div>
          <p className="text-xs font-semibold text-slate-500 mb-3 ml-1">
            Enter your pincode to check delivery availability
          </p>

          {/* Form Input */}
          <form onSubmit={handleCheck} className="flex flex-col sm:flex-row gap-2 w-full">
            <input
              type="text"
              value={pincode}
              onChange={(e) => handleInputChange(e.target.value)}
              placeholder="Enter Pincode (e.g. 382421)"
              maxLength={6}
              className="flex-1 min-w-0 bg-white border-2 border-slate-200 focus:border-[#16a34a] focus:ring-2 focus:ring-[#16a34a]/20 rounded-xl px-3.5 py-2.5 text-xs sm:text-sm font-bold text-slate-900 placeholder:text-slate-400 outline-none transition shadow-2xs"
            />
            <button
              type="submit"
              className="bg-[#16a34a] hover:bg-[#15803d] text-white font-extrabold px-4 sm:px-5 py-2.5 rounded-xl text-xs sm:text-sm flex items-center justify-center gap-2 transition shadow-md hover:shadow-lg shrink-0 active:scale-[0.98]"
            >
              <span>Check Availability</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>
        </div>

        {/* RIGHT COLUMN: Info & Status Results + Illustration */}
        <div className="lg:col-span-4 xl:col-span-4 flex items-center justify-between gap-3">
          <div className="flex-1 space-y-3 min-w-0">
            
            {/* YES, WE PROVIDE! Status Box */}
            <div className={`p-3 rounded-2xl transition-all duration-200 border-2 ${
              status === "serviceable" 
                ? "bg-emerald-100 border-[#16a34a] ring-4 ring-emerald-500/20 shadow-md scale-[1.02]" 
                : "bg-emerald-50/70 border-emerald-200/90 shadow-2xs hover:border-emerald-300"
            }`}>
              <div className="flex items-center gap-2 mb-1">
                <span className="bg-emerald-100 text-[#16a34a] text-[10px] font-black px-2.5 py-0.5 rounded-full uppercase tracking-wider border border-emerald-300">
                  YES, WE PROVIDE!
                </span>
                <CheckCircle2 className={`w-4 h-4 ${status === "serviceable" ? "text-[#16a34a] animate-bounce" : "text-[#16a34a]"}`} />
              </div>
              <p className="text-xs text-slate-700 font-semibold leading-relaxed">
                If your pincode is from{" "}
                <span className="font-extrabold text-[#16a34a]">Gandhinagar Sector 1–29</span>{" "}
                and <span className="font-extrabold text-[#16a34a]">Sargasan, Kudasan</span>
              </p>
            </div>

            {/* NOT PROVIDING YET Status Box */}
            <div className={`p-3 rounded-2xl transition-all duration-200 border-2 ${
              status === "unserviceable" 
                ? "bg-amber-100 border-[#f97316] ring-4 ring-amber-500/20 shadow-md scale-[1.02]" 
                : "bg-amber-50/70 border-amber-200/90 shadow-2xs hover:border-amber-300"
            }`}>
              <div className="flex items-center gap-2 mb-1">
                <span className="bg-amber-100 text-[#f97316] text-[10px] font-black px-2.5 py-0.5 rounded-full uppercase tracking-wider border border-amber-300">
                  NOT PROVIDING YET
                </span>
                <XCircle className={`w-4 h-4 ${status === "unserviceable" ? "text-[#f97316] animate-bounce" : "text-[#f97316]"}`} />
              </div>
              <p className="text-xs text-slate-700 font-semibold leading-relaxed">
                For other areas, we are currently not providing.
              </p>
            </div>

          </div>

          {/* Right Map Pin Produce Basket Illustration */}
          <div className="hidden 2xl:flex relative w-24 h-24 shrink-0 items-center justify-center">
            <Image
              src="/images/hero_produce_basket.png"
              alt="Fresh Produce Basket Location"
              fill
              className="object-contain drop-shadow-md hover:scale-105 transition-transform"
              unoptimized
            />
          </div>

        </div>

      </div>
    </div>
  );
}
