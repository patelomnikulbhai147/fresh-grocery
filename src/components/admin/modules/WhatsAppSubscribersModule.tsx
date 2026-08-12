"use client";
import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Users, UserCheck, UserMinus, CalendarClock, Search, Download,
  Trash2, BellOff, Send, RefreshCw, ChevronLeft, ChevronRight,
  CheckCircle2, XCircle, Loader2, Megaphone, X,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface Subscriber {
  id: string;
  phone_number: string;
  country_code: string;
  is_subscribed: number;
  source: string;
  created_at: string;
  updated_at: string;
  last_notif_sent: string | null;
}

interface Stats {
  total: number;
  active: number;
  todayNew: number;
  lastNotifDate: string | null;
}

function StatCard({ icon: Icon, label, value, tone }: {
  icon: typeof Users; label: string; value: string | number; tone: string;
}) {
  return (
    <div className={cn(
      "rounded-2xl p-5 border flex items-start gap-4",
      tone === "green"  && "bg-emerald-50 border-emerald-100 dark:bg-emerald-950/30 dark:border-emerald-800/50",
      tone === "blue"   && "bg-blue-50 border-blue-100 dark:bg-blue-950/30 dark:border-blue-800/50",
      tone === "amber"  && "bg-amber-50 border-amber-100 dark:bg-amber-950/30 dark:border-amber-800/50",
      tone === "purple" && "bg-purple-50 border-purple-100 dark:bg-purple-950/30 dark:border-purple-800/50",
    )}>
      <div className={cn(
        "w-10 h-10 rounded-xl flex items-center justify-center shrink-0",
        tone === "green"  && "bg-emerald-500/15 text-emerald-600 dark:text-emerald-400",
        tone === "blue"   && "bg-blue-500/15 text-blue-600 dark:text-blue-400",
        tone === "amber"  && "bg-amber-500/15 text-amber-600 dark:text-amber-400",
        tone === "purple" && "bg-purple-500/15 text-purple-600 dark:text-purple-400",
      )}>
        <Icon className="w-5 h-5" />
      </div>
      <div>
        <div className="text-2xl font-display font-bold text-brand-950 dark:text-zinc-100">{value}</div>
        <div className="text-xs text-brand-600 dark:text-zinc-400 mt-0.5">{label}</div>
      </div>
    </div>
  );
}

function CampaignModal({ onClose }: { onClose: () => void }) {
  const [loading, setLoading] = useState(false);
  const [result, setResult]   = useState<any>(null);
  const [testPhone, setTestPhone] = useState("");

  const send = async (isTest: boolean) => {
    setLoading(true);
    try {
      const res = await fetch("/api/whatsapp/send-campaign", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(isTest ? { testPhone } : {}),
      });
      const data = await res.json();
      setResult(data);
    } catch {
      setResult({ success: false, message: "Network error." });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
      <motion.div
        initial={{ opacity: 0, scale: 0.94 }}
        animate={{ opacity: 1, scale: 1 }}
        className="w-full max-w-lg bg-white dark:bg-zinc-900 rounded-3xl p-6 shadow-2xl border border-brand-100 dark:border-zinc-800"
      >
        <div className="flex items-center justify-between mb-5">
          <h3 className="font-display font-bold text-xl text-brand-950 dark:text-zinc-100">
            Send WhatsApp Campaign
          </h3>
          <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-brand-50 dark:hover:bg-zinc-800 transition">
            <X className="w-5 h-5 text-brand-500" />
          </button>
        </div>

        {!result ? (
          <div className="space-y-4">
            <div className="rounded-2xl bg-green-50 dark:bg-green-950/30 border border-green-100 dark:border-green-800/50 p-4 text-sm text-green-800 dark:text-green-300">
              <p className="font-semibold mb-2">📋 Today&apos;s Campaign Preview</p>
              <pre className="whitespace-pre-wrap font-sans text-xs leading-relaxed opacity-80">{`🔥 Today's Biggest Deals are Live!

🥭 Mangoes – 35% OFF
🥕 Vegetables – 25% OFF
🥬 Leafy Greens – 20% OFF

🛒 Shop: https://flashkart.co
⏰ Fresh produce arrives every morning!`}</pre>
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-brand-700 dark:text-zinc-300 mb-1.5">
                Test Phone (optional)
              </label>
              <input
                value={testPhone}
                onChange={(e) => setTestPhone(e.target.value)}
                placeholder="+91 9876543210"
                className="w-full px-4 py-2.5 rounded-xl border border-brand-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-brand-900 dark:text-zinc-100 placeholder:text-brand-400 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500 transition"
              />
            </div>

            <div className="flex gap-3 pt-1">
              <button
                onClick={() => send(true)}
                disabled={loading || !testPhone}
                className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl bg-brand-100 dark:bg-zinc-800 text-brand-900 dark:text-zinc-100 font-semibold text-sm hover:bg-brand-200 disabled:opacity-50 transition"
              >
                {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
                Send Test
              </button>
              <button
                onClick={() => send(false)}
                disabled={loading}
                className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl bg-green-500 hover:bg-green-400 text-white font-bold text-sm disabled:opacity-50 transition shadow-lg hover:shadow-green-500/30"
              >
                {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Megaphone className="w-4 h-4" />}
                Send Campaign Now
              </button>
            </div>
          </div>
        ) : (
          <div className="text-center py-6">
            {result.success ? (
              <CheckCircle2 className="w-12 h-12 text-green-500 mx-auto mb-3" />
            ) : (
              <XCircle className="w-12 h-12 text-red-500 mx-auto mb-3" />
            )}
            <p className="font-semibold text-brand-900 dark:text-zinc-100 mb-1">
              {result.success ? "Campaign Queued!" : "Failed"}
            </p>
            <p className="text-sm text-brand-600 dark:text-zinc-400">{result.message}</p>
            {result.recipientCount !== undefined && (
              <p className="text-xs text-brand-500 dark:text-zinc-500 mt-1">
                Recipients: {result.recipientCount}
              </p>
            )}
            <button
              onClick={onClose}
              className="mt-5 px-6 py-2 rounded-xl bg-brand-900 text-white text-sm font-semibold hover:bg-brand-800 transition"
            >
              Close
            </button>
          </div>
        )}
      </motion.div>
    </div>
  );
}

export function WhatsAppSubscribersModule() {
  const [subscribers, setSubscribers] = useState<Subscriber[]>([]);
  const [stats, setStats]             = useState<Stats>({ total: 0, active: 0, todayNew: 0, lastNotifDate: null });
  const [loading, setLoading]         = useState(true);
  const [search, setSearch]           = useState("");
  const [page, setPage]               = useState(1);
  const [total, setTotal]             = useState(0);
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [campaignOpen, setCampaignOpen]   = useState(false);
  const limit = 20;

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const res  = await fetch(`/api/whatsapp/subscribers?page=${page}&limit=${limit}&search=${encodeURIComponent(search)}`);
      const data = await res.json();
      if (data.success) {
        setSubscribers(data.subscribers);
        setTotal(data.total);

        // Derive stats
        const today = new Date().toISOString().slice(0, 10);
        const todayNew = data.subscribers.filter((s: Subscriber) =>
          s.created_at?.slice(0, 10) === today
        ).length;
        const active = data.subscribers.filter((s: Subscriber) => s.is_subscribed).length;
        const lastNotif = data.subscribers.reduce((acc: string | null, s: Subscriber) => {
          if (!s.last_notif_sent) return acc;
          if (!acc || s.last_notif_sent > acc) return s.last_notif_sent;
          return acc;
        }, null);
        setStats({ total: data.total, active, todayNew, lastNotifDate: lastNotif });
      }
    } catch {
      // silently handle
    } finally {
      setLoading(false);
    }
  }, [page, search]);

  useEffect(() => { fetchData(); }, [fetchData]);

  const handleAction = async (id: string, action: "unsubscribe" | "delete") => {
    setActionLoading(id + action);
    try {
      await fetch("/api/whatsapp/subscribers", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, action }),
      });
      fetchData();
    } finally {
      setActionLoading(null);
    }
  };

  const exportCSV = () => {
    if (!subscribers.length) return;
    const headers = ["ID", "Phone", "Country Code", "Subscribed", "Source", "Created At", "Last Notified"];
    const rows = subscribers.map((s) => [
      s.id, s.phone_number, s.country_code,
      s.is_subscribed ? "Yes" : "No",
      s.source,
      new Date(s.created_at).toLocaleString(),
      s.last_notif_sent ? new Date(s.last_notif_sent).toLocaleString() : "Never",
    ]);
    const csv = [headers, ...rows].map((r) => r.join(",")).join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const a    = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = `whatsapp_subscribers_${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
  };

  const totalPages = Math.ceil(total / limit);

  return (
    <div className="p-4 md:p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="font-display text-2xl font-bold text-brand-950 dark:text-zinc-100">
            WhatsApp Subscribers
          </h1>
          <p className="text-sm text-brand-600 dark:text-zinc-400 mt-0.5">
            Manage deal alert subscribers and send campaigns
          </p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={exportCSV}
            className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-white dark:bg-zinc-800 border border-brand-200 dark:border-zinc-700 text-brand-800 dark:text-zinc-200 text-sm font-semibold hover:border-brand-400 transition shadow-sm"
          >
            <Download className="w-4 h-4" /> Export CSV
          </button>
          <button
            onClick={() => setCampaignOpen(true)}
            className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-green-500 hover:bg-green-400 text-white text-sm font-bold transition shadow-lg hover:shadow-green-500/30"
          >
            <Megaphone className="w-4 h-4" /> Send Campaign
          </button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard icon={Users}       label="Total Subscribers"   value={stats.total}   tone="blue"   />
        <StatCard icon={UserCheck}   label="Active Subscribers"  value={stats.active}  tone="green"  />
        <StatCard icon={CalendarClock} label="Today's New"       value={stats.todayNew} tone="amber" />
        <StatCard icon={UserMinus}   label="Last Campaign Sent"
          value={stats.lastNotifDate ? new Date(stats.lastNotifDate).toLocaleDateString() : "Never"}
          tone="purple" />
      </div>

      {/* Search + Refresh */}
      <div className="flex gap-3">
        <div className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-brand-400 dark:text-zinc-500" />
          <input
            value={search}
            onChange={(e) => { setSearch(e.target.value); setPage(1); }}
            placeholder="Search by phone number..."
            className="w-full pl-9 pr-4 py-2.5 rounded-xl border border-brand-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-brand-900 dark:text-zinc-100 placeholder:text-brand-400 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500 transition"
          />
        </div>
        <button
          onClick={fetchData}
          className="p-2.5 rounded-xl border border-brand-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-brand-600 dark:text-zinc-300 hover:border-brand-400 transition"
        >
          <RefreshCw className={cn("w-4 h-4", loading && "animate-spin")} />
        </button>
      </div>

      {/* Table */}
      <div className="bg-white dark:bg-zinc-900 rounded-2xl border border-brand-100 dark:border-zinc-800 overflow-hidden shadow-soft">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-brand-100 dark:border-zinc-800 bg-brand-50/50 dark:bg-zinc-800/50">
                <th className="text-left px-4 py-3 text-xs font-bold uppercase tracking-wider text-brand-600 dark:text-zinc-400">Phone</th>
                <th className="text-left px-4 py-3 text-xs font-bold uppercase tracking-wider text-brand-600 dark:text-zinc-400">Status</th>
                <th className="text-left px-4 py-3 text-xs font-bold uppercase tracking-wider text-brand-600 dark:text-zinc-400 hidden md:table-cell">Source</th>
                <th className="text-left px-4 py-3 text-xs font-bold uppercase tracking-wider text-brand-600 dark:text-zinc-400 hidden lg:table-cell">Joined</th>
                <th className="text-left px-4 py-3 text-xs font-bold uppercase tracking-wider text-brand-600 dark:text-zinc-400 hidden lg:table-cell">Last Notified</th>
                <th className="text-right px-4 py-3 text-xs font-bold uppercase tracking-wider text-brand-600 dark:text-zinc-400">Actions</th>
              </tr>
            </thead>
            <tbody>
              <AnimatePresence mode="wait">
                {loading ? (
                  <tr>
                    <td colSpan={6} className="py-16 text-center">
                      <Loader2 className="w-6 h-6 animate-spin text-brand-400 mx-auto mb-2" />
                      <p className="text-sm text-brand-500 dark:text-zinc-500">Loading subscribers...</p>
                    </td>
                  </tr>
                ) : subscribers.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="py-16 text-center">
                      <div className="text-4xl mb-3">📭</div>
                      <p className="text-sm font-semibold text-brand-700 dark:text-zinc-300">No subscribers yet</p>
                      <p className="text-xs text-brand-500 dark:text-zinc-500 mt-1">Subscribers will appear here once someone signs up via the hot deals section.</p>
                    </td>
                  </tr>
                ) : (
                  subscribers.map((s, i) => (
                    <motion.tr
                      key={s.id}
                      initial={{ opacity: 0, y: 6 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: i * 0.02 }}
                      className="border-b border-brand-50 dark:border-zinc-800/60 hover:bg-brand-50/40 dark:hover:bg-zinc-800/40 transition"
                    >
                      <td className="px-4 py-3 font-medium text-brand-900 dark:text-zinc-100">
                        {s.country_code} {s.phone_number}
                      </td>
                      <td className="px-4 py-3">
                        <span className={cn(
                          "inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-semibold",
                          s.is_subscribed
                            ? "bg-green-100 text-green-700 dark:bg-green-950/40 dark:text-green-400"
                            : "bg-red-100 text-red-600 dark:bg-red-950/40 dark:text-red-400"
                        )}>
                          {s.is_subscribed ? <><CheckCircle2 className="w-3 h-3" /> Active</> : <><XCircle className="w-3 h-3" /> Unsubscribed</>}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-brand-600 dark:text-zinc-400 hidden md:table-cell text-xs">
                        {s.source.replace(/_/g, " ")}
                      </td>
                      <td className="px-4 py-3 text-brand-500 dark:text-zinc-500 hidden lg:table-cell text-xs">
                        {new Date(s.created_at).toLocaleDateString()}
                      </td>
                      <td className="px-4 py-3 text-brand-500 dark:text-zinc-500 hidden lg:table-cell text-xs">
                        {s.last_notif_sent ? new Date(s.last_notif_sent).toLocaleDateString() : "Never"}
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center justify-end gap-1">
                          {s.is_subscribed && (
                            <button
                              onClick={() => handleAction(s.id, "unsubscribe")}
                              disabled={actionLoading === s.id + "unsubscribe"}
                              title="Unsubscribe"
                              className="p-1.5 rounded-lg text-amber-600 hover:bg-amber-50 dark:hover:bg-amber-950/30 disabled:opacity-50 transition"
                            >
                              {actionLoading === s.id + "unsubscribe"
                                ? <Loader2 className="w-3.5 h-3.5 animate-spin" />
                                : <BellOff className="w-3.5 h-3.5" />}
                            </button>
                          )}
                          <button
                            onClick={() => handleAction(s.id, "delete")}
                            disabled={actionLoading === s.id + "delete"}
                            title="Delete"
                            className="p-1.5 rounded-lg text-red-500 hover:bg-red-50 dark:hover:bg-red-950/30 disabled:opacity-50 transition"
                          >
                            {actionLoading === s.id + "delete"
                              ? <Loader2 className="w-3.5 h-3.5 animate-spin" />
                              : <Trash2 className="w-3.5 h-3.5" />}
                          </button>
                        </div>
                      </td>
                    </motion.tr>
                  ))
                )}
              </AnimatePresence>
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between px-4 py-3 border-t border-brand-100 dark:border-zinc-800 bg-brand-50/30 dark:bg-zinc-800/30">
            <p className="text-xs text-brand-500 dark:text-zinc-500">
              Showing {(page - 1) * limit + 1}–{Math.min(page * limit, total)} of {total}
            </p>
            <div className="flex gap-1">
              <button
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page === 1}
                className="p-1.5 rounded-lg border border-brand-200 dark:border-zinc-700 text-brand-600 dark:text-zinc-400 disabled:opacity-40 hover:border-brand-400 transition"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <button
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                disabled={page === totalPages}
                className="p-1.5 rounded-lg border border-brand-200 dark:border-zinc-700 text-brand-600 dark:text-zinc-400 disabled:opacity-40 hover:border-brand-400 transition"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Campaign Modal */}
      <AnimatePresence>
        {campaignOpen && <CampaignModal onClose={() => setCampaignOpen(false)} />}
      </AnimatePresence>
    </div>
  );
}
