"use client";
import Link from "next/link";
import { Building, Hotel, Store, ArrowRight } from "lucide-react";
import { motion } from "framer-motion";

const supplyCards = [
  {
    id: "hostels-pgs",
    title: "Hostels & PGs",
    subtitle: "Nutritious and fresh vegetables & fruits for healthy meals",
    icon: Building,
    bgColor: "bg-[#f0fdf4]",
    borderColor: "border-emerald-200/80",
    iconBg: "bg-[#067a46]",
    btnColor: "bg-[#067a46] hover:bg-[#046338] text-white",
  },
  {
    id: "hotels",
    title: "Hotels",
    subtitle: "Quality produce for delicious and healthy cuisine",
    icon: Hotel,
    bgColor: "bg-[#eff6ff]",
    borderColor: "border-blue-200/80",
    iconBg: "bg-[#1d4ed8]",
    btnColor: "bg-[#1d4ed8] hover:bg-[#1e40af] text-white",
  },
  {
    id: "shops",
    title: "Shops",
    subtitle: "Reliable supply for your daily business needs",
    icon: Store,
    bgColor: "bg-[#fff7ed]",
    borderColor: "border-orange-200/80",
    iconBg: "bg-[#ea580c]",
    btnColor: "bg-[#ea580c] hover:bg-[#c2410c] text-white",
  },
];

export function WhereWeSupplySection() {
  return (
    <section id="where-we-supply" className="py-14 md:py-20 bg-white">
      <div className="mx-auto max-w-[1400px] px-4 md:px-8">
        
        {/* Section Header */}
        <div className="text-center max-w-2xl mx-auto mb-12">
          <div className="inline-flex items-center gap-3 text-xs font-black uppercase tracking-widest text-slate-500 mb-2">
            <span className="h-[2px] w-6 bg-[#ea580c]" />
            <span>Where We Supply</span>
            <span className="h-[2px] w-6 bg-[#16a34a]" />
          </div>
          <h2 className="font-display text-3xl md:text-4xl font-extrabold text-slate-900">
            Where We Supply
          </h2>
          <p className="mt-2 text-slate-600 text-sm md:text-base">
            Proudly supplying fresh produce to businesses and communities
          </p>
        </div>

        {/* 3 Supply Segment Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 lg:gap-8">
          {supplyCards.map((card, idx) => (
            <motion.div
              key={card.id}
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: idx * 0.1, duration: 0.4 }}
              className={`${card.bgColor} rounded-3xl p-6 border ${card.borderColor} shadow-sm hover:shadow-md transition flex flex-col justify-between items-start text-left min-h-[220px]`}
            >
              <div>
                {/* Circle Icon */}
                <div className={`w-14 h-14 rounded-full ${card.iconBg} text-white flex items-center justify-center mb-5 shadow-sm`}>
                  <card.icon className="w-7 h-7" />
                </div>

                {/* Title & Subtitle */}
                <h3 className="font-display text-2xl font-extrabold text-slate-900 mb-2">
                  {card.title}
                </h3>
                <p className="text-xs md:text-sm text-slate-600 leading-relaxed font-medium mb-6">
                  {card.subtitle}
                </p>
              </div>

              {/* Know More Button */}
              <Link
                href={`/where-we-supply#${card.id}`}
                className={`inline-flex items-center gap-2 px-6 py-2.5 rounded-full text-xs font-bold transition shadow-sm ${card.btnColor}`}
              >
                <span>Know More</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </motion.div>
          ))}
        </div>

      </div>
    </section>
  );
}
