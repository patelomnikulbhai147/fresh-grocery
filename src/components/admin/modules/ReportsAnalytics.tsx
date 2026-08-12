"use client";
import { useState } from "react";
import { BarChart3, TrendingUp, DollarSign, Download, Calendar, PieChart, ArrowUpRight, ArrowDownRight, Layers, ShoppingBag, Users, Truck } from "lucide-react";
import { useAdminStore } from "@/store/adminStore";
import { useToasts } from "@/store/shop";
import { cn, formatINR } from "@/lib/utils";

export function ReportsAnalytics() {
  const { orders, products, customers } = useAdminStore();
  const pushToast = useToasts((s) => s.push);

  const [dateRange, setDateRange] = useState("30D");

  const totalRevenue = orders.reduce((acc, o) => acc + (o.status !== "Cancelled" ? o.total : 0), 0) || 1245800;
  const totalCost = Math.round(totalRevenue * 0.72);
  const netProfit = totalRevenue - totalCost;

  const categorySales = [
    { name: "Vegetables", revenue: 420500, pct: 34, color: "bg-emerald-500" },
    { name: "Fruits", revenue: 290300, pct: 23, color: "bg-amber-500" },
    { name: "Dairy & Eggs", revenue: 210000, pct: 17, color: "bg-blue-500" },
    { name: "Bakery", revenue: 150000, pct: 12, color: "bg-orange-500" },
    { name: "Snacks & Drinks", revenue: 175000, pct: 14, color: "bg-purple-500" }
  ];

  const dailyTrend = [
    { day: "Mon", orders: 120, rev: 45000 },
    { day: "Tue", orders: 145, rev: 52000 },
    { day: "Wed", orders: 180, rev: 68000 },
    { day: "Thu", orders: 160, rev: 59000 },
    { day: "Fri", orders: 220, rev: 84000 },
    { day: "Sat", orders: 310, rev: 115000 },
    { day: "Sun", orders: 290, rev: 108000 }
  ];

  const maxRev = Math.max(...dailyTrend.map((d) => d.rev));

  const handleExportReport = (type: "CSV" | "PDF") => {
    pushToast(`Generating full financial & inventory report (${type})... Downloading file!`, "success");
    if (type === "CSV") {
      const headers = ["Metric", "Value", "Period"];
      const rows = [
        ["Total Revenue", totalRevenue, dateRange],
        ["Cost of Goods Sold (COGS)", totalCost, dateRange],
        ["Net Profit", netProfit, dateRange],
        ["Total Orders", orders.length, dateRange],
        ["Active Customers", customers.length, dateRange]
      ];
      const csvContent = "data:text/csv;charset=utf-8," + [headers.join(","), ...rows.map((r) => r.join(","))].join("\n");
      const encodedUri = encodeURI(csvContent);
      const link = document.createElement("a");
      link.setAttribute("href", encodedUri);
      link.setAttribute("download", `flashkart_financial_report_${dateRange}_${new Date().toISOString().slice(0, 10)}.csv`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } else {
      setTimeout(() => {
        window.print();
      }, 500);
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Header Bar */}
      <div className="bg-white dark:bg-zinc-900 rounded-3xl p-6 border border-brand-100 dark:border-zinc-800 shadow-soft flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="font-display text-xl md:text-2xl font-bold text-brand-950 dark:text-zinc-100 flex items-center gap-2">
            <BarChart3 className="w-6 h-6 text-brand-600 dark:text-brand-400" /> Business Analytics & Reports
          </h2>
          <p className="text-xs text-brand-600 dark:text-zinc-400 mt-0.5">
            Deep financial intelligence, revenue breakdown, category sales performance, and audit export tools.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center bg-brand-50 dark:bg-zinc-800 p-1 rounded-xl border border-brand-100 dark:border-zinc-700 text-xs font-bold">
            {["7D", "30D", "90D", "1Y"].map((r) => (
              <button
                key={r}
                onClick={() => setDateRange(r)}
                className={cn("px-3 py-1 rounded-lg transition", dateRange === r ? "bg-white dark:bg-zinc-700 text-brand-950 dark:text-zinc-100 shadow-sm" : "text-brand-700 dark:text-zinc-400 hover:text-brand-950")}
              >
                {r}
              </button>
            ))}
          </div>

          <button
            onClick={() => handleExportReport("CSV")}
            className="px-4 py-2 rounded-xl bg-brand-900 dark:bg-brand-600 hover:bg-brand-800 text-white text-xs font-bold flex items-center gap-1.5 shadow-sm transition active:scale-95"
          >
            <Download className="w-3.5 h-3.5" /> Export CSV
          </button>

          <button
            onClick={() => handleExportReport("PDF")}
            className="px-4 py-2 rounded-xl bg-gradient-to-r from-brand-600 to-brand-500 hover:from-brand-700 text-white text-xs font-bold flex items-center gap-1.5 shadow-glow-cta transition active:scale-95"
          >
            <Download className="w-3.5 h-3.5" /> PDF Report
          </button>
        </div>
      </div>

      {/* Financial KPIs Grid */}
      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white dark:bg-zinc-900 p-5 rounded-3xl border border-brand-100 dark:border-zinc-800 shadow-soft">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-brand-600 dark:text-zinc-400 uppercase tracking-wider">Gross Revenue</span>
            <div className="w-10 h-10 rounded-2xl bg-emerald-50 dark:bg-emerald-950 text-emerald-600 flex items-center justify-center font-bold">
              ₹
            </div>
          </div>
          <div className="font-display font-bold text-2xl text-brand-950 dark:text-zinc-100 mt-2">{formatINR(totalRevenue)}</div>
          <div className="flex items-center gap-1 text-xs font-bold text-emerald-600 mt-1">
            <ArrowUpRight className="w-4 h-4" /> +18.4% vs last period
          </div>
        </div>

        <div className="bg-white dark:bg-zinc-900 p-5 rounded-3xl border border-brand-100 dark:border-zinc-800 shadow-soft">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-brand-600 dark:text-zinc-400 uppercase tracking-wider">Estimated COGS</span>
            <div className="w-10 h-10 rounded-2xl bg-amber-50 dark:bg-amber-950 text-amber-600 flex items-center justify-center font-bold">
              ₹
            </div>
          </div>
          <div className="font-display font-bold text-2xl text-brand-950 dark:text-zinc-100 mt-2">{formatINR(totalCost)}</div>
          <div className="flex items-center gap-1 text-xs font-bold text-amber-600 mt-1">
            <span>72.0% of revenue</span>
          </div>
        </div>

        <div className="bg-white dark:bg-zinc-900 p-5 rounded-3xl border border-brand-100 dark:border-zinc-800 shadow-soft">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-brand-600 dark:text-zinc-400 uppercase tracking-wider">Net Profit Margin</span>
            <div className="w-10 h-10 rounded-2xl bg-blue-50 dark:bg-blue-950 text-blue-600 flex items-center justify-center font-bold">
              %
            </div>
          </div>
          <div className="font-display font-bold text-2xl text-brand-950 dark:text-zinc-100 mt-2">{formatINR(netProfit)}</div>
          <div className="flex items-center gap-1 text-xs font-bold text-emerald-600 mt-1">
            <ArrowUpRight className="w-4 h-4" /> 28.0% Net Margin
          </div>
        </div>

        <div className="bg-white dark:bg-zinc-900 p-5 rounded-3xl border border-brand-100 dark:border-zinc-800 shadow-soft">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-brand-600 dark:text-zinc-400 uppercase tracking-wider">Avg Order Value</span>
            <div className="w-10 h-10 rounded-2xl bg-purple-50 dark:bg-purple-950 text-purple-600 flex items-center justify-center font-bold">
              🛒
            </div>
          </div>
          <div className="font-display font-bold text-2xl text-brand-950 dark:text-zinc-100 mt-2">₹540.50</div>
          <div className="flex items-center gap-1 text-xs font-bold text-emerald-600 mt-1">
            <ArrowUpRight className="w-4 h-4" /> +5.2% basket size
          </div>
        </div>
      </div>

      {/* 2 Big Charts: Daily Trend & Category Breakdown */}
      <div className="grid lg:grid-cols-3 gap-6">
        {/* Daily Revenue Bar Chart (2 Cols) */}
        <div className="lg:col-span-2 bg-white dark:bg-zinc-900 rounded-3xl p-6 border border-brand-100 dark:border-zinc-800 shadow-soft space-y-6">
          <div className="flex items-center justify-between border-b border-brand-100 dark:border-zinc-800 pb-4">
            <div>
              <h3 className="font-display font-bold text-lg text-brand-950 dark:text-zinc-100 flex items-center gap-2">
                <TrendingUp className="w-5 h-5 text-brand-600" /> Daily Revenue & Order Volume
              </h3>
              <p className="text-xs text-brand-600 dark:text-zinc-400">Week-over-week performance breakdown</p>
            </div>
            <span className="text-xs font-bold bg-brand-50 dark:bg-zinc-800 px-3 py-1 rounded-full text-brand-800 dark:text-zinc-300">
              Peak: Saturday ({formatINR(115000)})
            </span>
          </div>

          <div className="h-64 flex items-end justify-between gap-4 pt-4 px-2">
            {dailyTrend.map((item) => {
              const heightPct = Math.round((item.rev / maxRev) * 100);
              return (
                <div key={item.day} className="flex-1 flex flex-col items-center gap-2 group h-full justify-end">
                  <div className="text-[10px] font-bold text-brand-950 dark:text-zinc-100 opacity-0 group-hover:opacity-100 transition whitespace-nowrap bg-brand-50 dark:bg-zinc-800 px-1.5 py-0.5 rounded shadow-sm">
                    {formatINR(item.rev)}
                  </div>
                  <div className="w-full max-w-[48px] bg-brand-100 dark:bg-zinc-800 rounded-2xl overflow-hidden h-full flex items-end p-1">
                    <div
                      style={{ height: `${heightPct}%` }}
                      className="w-full bg-gradient-to-t from-brand-700 to-brand-500 rounded-xl transition-all duration-500 group-hover:brightness-110 shadow-sm"
                    />
                  </div>
                  <div className="text-xs font-bold text-brand-800 dark:text-zinc-400">{item.day}</div>
                  <div className="text-[10px] text-brand-600 dark:text-zinc-500 font-mono">{item.orders} ord</div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Category Share Distribution (1 Col) */}
        <div className="bg-white dark:bg-zinc-900 rounded-3xl p-6 border border-brand-100 dark:border-zinc-800 shadow-soft space-y-6 flex flex-col justify-between">
          <div>
            <h3 className="font-display font-bold text-lg text-brand-950 dark:text-zinc-100 flex items-center gap-2 border-b border-brand-100 dark:border-zinc-800 pb-4">
              <PieChart className="w-5 h-5 text-brand-600" /> Category Sales Share
            </h3>
            <p className="text-xs text-brand-600 dark:text-zinc-400 mt-2">Revenue contribution by grocery section</p>

            <div className="space-y-3 mt-4">
              {categorySales.map((cat) => (
                <div key={cat.name} className="space-y-1">
                  <div className="flex justify-between text-xs font-bold text-brand-900 dark:text-zinc-200">
                    <span>{cat.name}</span>
                    <span className="font-mono">{formatINR(cat.revenue)} ({cat.pct}%)</span>
                  </div>
                  <div className="w-full h-2 bg-brand-50 dark:bg-zinc-800 rounded-full overflow-hidden">
                    <div style={{ width: `${cat.pct}%` }} className={cn("h-full rounded-full", cat.color)} />
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="p-4 rounded-2xl bg-brand-50/70 dark:bg-zinc-800/70 border border-brand-100 dark:border-zinc-700 text-xs text-brand-800 dark:text-zinc-300">
            💡 <strong>Insight:</strong> Fresh Vegetables & Fruits account for over <strong>57%</strong> of total storefront revenue.
          </div>
        </div>
      </div>
    </div>
  );
}
