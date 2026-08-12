"use client";
import { useState } from "react";
import { History, Search, Download, Trash2, ShieldCheck, User, Globe, Laptop, Filter, Calendar } from "lucide-react";
import { useAdminStore } from "@/store/adminStore";
import { useAdminAuth } from "@/store/adminAuth";
import { useToasts } from "@/store/shop";
import { cn } from "@/lib/utils";

export function ActivityLogsModule() {
  const { activityLogs, clearActivityLogs } = useAdminStore();
  const { hasPermission } = useAdminAuth();
  const pushToast = useToasts((s) => s.push);

  const [query, setQuery] = useState("");
  const [roleFilter, setRoleFilter] = useState("All");
  const [moduleFilter, setModuleFilter] = useState("All");

  const canViewLogs = hasPermission("logs.view");
  if (!canViewLogs) {
    return (
      <div className="bg-white dark:bg-zinc-900 rounded-3xl p-12 text-center border border-brand-100 dark:border-zinc-800 space-y-3">
        <ShieldCheck className="w-12 h-12 text-rose-500 mx-auto" />
        <h3 className="font-display text-xl font-bold text-brand-950 dark:text-zinc-100">Access Restricted</h3>
        <p className="text-sm text-brand-600 dark:text-zinc-400 max-w-md mx-auto">
          Your current role does not have permission to view System Activity Audit Logs. Please switch to a role with &quot;logs.view&quot; permission.
        </p>
      </div>
    );
  }

  const filteredLogs = activityLogs.filter((log) => {
    const matchesQuery =
      log.action.toLowerCase().includes(query.toLowerCase()) ||
      log.user.toLowerCase().includes(query.toLowerCase()) ||
      log.ip.includes(query) ||
      log.module.toLowerCase().includes(query.toLowerCase());
    const matchesRole = roleFilter === "All" || log.role === roleFilter;
    const matchesModule = moduleFilter === "All" || log.module === moduleFilter;
    return matchesQuery && matchesRole && matchesModule;
  });

  const modulesList = Array.from(new Set(activityLogs.map((l) => l.module)));

  const handleExportCSV = () => {
    if (filteredLogs.length === 0) {
      pushToast("No logs to export", "info");
      return;
    }
    const headers = ["Timestamp", "Date", "Time", "User", "Role", "Module", "Action", "IP Address", "Browser"];
    const rows = filteredLogs.map((l) => [
      `"${l.timestamp}"`,
      `"${l.date}"`,
      `"${l.time}"`,
      `"${l.user}"`,
      `"${l.role}"`,
      `"${l.module}"`,
      `"${l.action.replace(/"/g, '""')}"`,
      `"${l.ip}"`,
      `"${l.browser}"`
    ]);

    const csvContent = "data:text/csv;charset=utf-8," + [headers.join(","), ...rows.map((r) => r.join(","))].join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `flashkart_audit_logs_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    pushToast("Audit logs exported to CSV successfully!", "success");
  };

  const handleClear = () => {
    if (window.confirm("Are you sure you want to clear all activity audit logs? This action cannot be undone.")) {
      clearActivityLogs();
      pushToast("Activity audit logs cleared", "info");
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Header Bar */}
      <div className="bg-white dark:bg-zinc-900 rounded-3xl p-6 border border-brand-100 dark:border-zinc-800 shadow-soft flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="font-display text-xl font-bold text-brand-950 dark:text-zinc-100 flex items-center gap-2">
            <History className="w-5 h-5 text-brand-600 dark:text-brand-400" /> Activity Audit Logs
          </h2>
          <p className="text-xs text-brand-600 dark:text-zinc-400 mt-0.5">
            Track every admin action, login attempt, stock modification, and role assignment.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={handleExportCSV}
            className="px-4 py-2 rounded-xl bg-brand-900 dark:bg-brand-600 hover:bg-brand-800 text-white text-xs font-semibold flex items-center gap-2 shadow-sm transition active:scale-95"
          >
            <Download className="w-4 h-4" /> Export CSV
          </button>
          {activityLogs.length > 0 && (
            <button
              onClick={handleClear}
              className="px-4 py-2 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900 text-rose-700 dark:text-rose-300 hover:bg-rose-100 text-xs font-semibold flex items-center gap-1.5 transition"
            >
              <Trash2 className="w-3.5 h-3.5" /> Clear
            </button>
          )}
        </div>
      </div>

      {/* Filter Toolbar */}
      <div className="bg-white dark:bg-zinc-900 rounded-2xl p-4 border border-brand-100 dark:border-zinc-800 shadow-sm flex flex-wrap items-center gap-3">
        <div className="flex-1 min-w-[200px] relative">
          <Search className="w-4 h-4 text-brand-500 dark:text-zinc-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search by action, user, IP address, or module..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="w-full pl-9 pr-4 py-2 rounded-xl bg-brand-50/70 dark:bg-zinc-800 border border-brand-100 dark:border-zinc-700 text-xs text-brand-950 dark:text-zinc-100 outline-none focus:border-brand-500 transition"
          />
        </div>

        <div className="flex items-center gap-2">
          <Filter className="w-3.5 h-3.5 text-brand-600 dark:text-zinc-400" />
          <select
            value={roleFilter}
            onChange={(e) => setRoleFilter(e.target.value)}
            className="bg-brand-50/70 dark:bg-zinc-800 border border-brand-100 dark:border-zinc-700 rounded-xl px-3 py-2 text-xs font-semibold text-brand-900 dark:text-zinc-200 outline-none"
          >
            <option value="All">All Roles</option>
            <option value="Super Admin">Super Admin</option>
            <option value="Admin">Admin</option>
            <option value="Inventory Manager">Inventory Manager</option>
            <option value="Marketing Manager">Marketing Manager</option>
            <option value="Delivery Manager">Delivery Manager</option>
            <option value="Customer Support">Customer Support</option>
          </select>

          <select
            value={moduleFilter}
            onChange={(e) => setModuleFilter(e.target.value)}
            className="bg-brand-50/70 dark:bg-zinc-800 border border-brand-100 dark:border-zinc-700 rounded-xl px-3 py-2 text-xs font-semibold text-brand-900 dark:text-zinc-200 outline-none"
          >
            <option value="All">All Modules</option>
            {modulesList.map((m) => (
              <option key={m} value={m}>{m}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Logs Table */}
      <div className="bg-white dark:bg-zinc-900 rounded-3xl border border-brand-100 dark:border-zinc-800 overflow-hidden shadow-soft">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-brand-50/60 dark:bg-zinc-800/80 border-b border-brand-100 dark:border-zinc-800 text-[11px] font-bold uppercase tracking-wider text-brand-600 dark:text-zinc-400">
                <th className="py-3.5 px-4">Timestamp & Date</th>
                <th className="py-3.5 px-4">User & Role</th>
                <th className="py-3.5 px-4">Module</th>
                <th className="py-3.5 px-4">Action Details</th>
                <th className="py-3.5 px-4">IP & Browser</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-brand-100/60 dark:divide-zinc-800 text-xs">
              {filteredLogs.length === 0 ? (
                <tr>
                  <td colSpan={5} className="py-12 text-center text-brand-600 dark:text-zinc-500 font-medium">
                    No activity logs found matching your criteria.
                  </td>
                </tr>
              ) : (
                filteredLogs.map((log) => (
                  <tr key={log.id} className="hover:bg-brand-50/40 dark:hover:bg-zinc-800/40 transition">
                    <td className="py-3.5 px-4 whitespace-nowrap">
                      <div className="font-bold text-brand-950 dark:text-zinc-100 flex items-center gap-1.5">
                        <Calendar className="w-3.5 h-3.5 text-brand-600 dark:text-brand-400" /> {log.date}
                      </div>
                      <div className="text-[11px] text-brand-600 dark:text-zinc-400 mt-0.5">{log.time}</div>
                    </td>
                    <td className="py-3.5 px-4">
                      <div className="font-semibold text-brand-900 dark:text-zinc-200 flex items-center gap-1.5">
                        <User className="w-3.5 h-3.5 text-brand-600 dark:text-brand-400 shrink-0" /> {log.user}
                      </div>
                      <div className="mt-1 inline-block text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-brand-100 dark:bg-brand-900/60 text-brand-700 dark:text-brand-300">
                        {log.role}
                      </div>
                    </td>
                    <td className="py-3.5 px-4 whitespace-nowrap">
                      <span className="px-2.5 py-1 rounded-lg bg-brand-50 dark:bg-zinc-800 border border-brand-200/60 dark:border-zinc-700 font-semibold text-brand-800 dark:text-zinc-300">
                        {log.module}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 font-medium text-brand-950 dark:text-zinc-100 max-w-md">
                      {log.action}
                    </td>
                    <td className="py-3.5 px-4 whitespace-nowrap text-[11px] text-brand-600 dark:text-zinc-400 space-y-0.5">
                      <div className="flex items-center gap-1">
                        <Globe className="w-3 h-3 text-brand-500" /> IP: <strong className="text-brand-900 dark:text-zinc-300">{log.ip}</strong>
                      </div>
                      <div className="flex items-center gap-1">
                        <Laptop className="w-3 h-3 text-brand-500" /> {log.browser}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
