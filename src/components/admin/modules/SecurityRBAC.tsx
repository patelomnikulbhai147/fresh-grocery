"use client";
import { useState } from "react";
import { ShieldCheck, Lock, Key, Users, CheckCircle2, AlertCircle, Eye, UserCheck, Smartphone } from "lucide-react";
import { useAdminAuth, ROLE_PERMISSIONS, type AdminRole } from "@/store/adminAuth";
import { useToasts } from "@/store/shop";
import { cn } from "@/lib/utils";

interface StaffMember {
  id: string;
  name: string;
  email: string;
  role: AdminRole;
  status: "Active" | "Suspended";
  twoFactor: boolean;
  lastLogin: string;
}

export function SecurityRBAC() {
  const { user, hasPermission } = useAdminAuth();
  const pushToast = useToasts((s) => s.push);

  const [staff, setStaff] = useState<StaffMember[]>([
    { id: "stf-1", name: "Super Admin (Om Patel)", email: "+91 9773271029", role: "Super Admin", status: "Active", twoFactor: true, lastLogin: "Just Now (Online)" },
    { id: "stf-2", name: "Kaushik Patel", email: "+91 6352856495", role: "Admin", status: "Active", twoFactor: true, lastLogin: "10 mins ago" },
    { id: "stf-3", name: "Rakesh Godown", email: "inventory@flashkart.co", role: "Inventory Manager", status: "Active", twoFactor: false, lastLogin: "Yesterday" },
    { id: "stf-4", name: "Sneha Marketing", email: "growth@flashkart.co", role: "Marketing Manager", status: "Active", twoFactor: true, lastLogin: "3 hours ago" },
    { id: "stf-5", name: "Amit Support Desk", email: "flashkart.co@gmail.com", role: "Customer Support", status: "Active", twoFactor: true, lastLogin: "10 mins ago" },
    { id: "stf-6", name: "Logistics Hub Desk", email: "dispatch@flashkart.co", role: "Delivery Manager", status: "Active", twoFactor: false, lastLogin: "4 hours ago" }
  ]);

  const [enforce2FA, setEnforce2FA] = useState(true);
  const [selectedRole, setSelectedRole] = useState<AdminRole>("Super Admin");

  const canEdit = hasPermission("settings.edit");

  const handleToggle2FA = () => {
    if (!canEdit) {
      pushToast("Permission denied: You need 'settings.edit' permission", "info");
      return;
    }
    setEnforce2FA(!enforce2FA);
    pushToast(`Two-Factor Authentication enforcement is now ${!enforce2FA ? "ENABLED" : "DISABLED"}!`, "info");
  };

  const handleToggleStatus = (id: string, name: string) => {
    if (!canEdit) {
      pushToast("Permission denied: You need 'settings.edit' permission", "info");
      return;
    }
    setStaff((prev) =>
      prev.map((s) => (s.id === id ? { ...s, status: s.status === "Active" ? "Suspended" : "Active" } : s))
    );
    pushToast(`Staff member "${name}" account status updated!`, "info");
  };

  const rolesList: AdminRole[] = [
    "Super Admin",
    "Admin",
    "Inventory Manager",
    "Marketing Manager",
    "Delivery Manager",
    "Customer Support",
    "Read Only"
  ];

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Header */}
      <div className="bg-white dark:bg-zinc-900 rounded-3xl p-6 border border-brand-100 dark:border-zinc-800 shadow-soft flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="font-display text-xl md:text-2xl font-bold text-brand-950 dark:text-zinc-100 flex items-center gap-2">
            <ShieldCheck className="w-6 h-6 text-brand-600 dark:text-brand-400" /> RBAC Security & Staff Directory
          </h2>
          <p className="text-xs text-brand-600 dark:text-zinc-400 mt-0.5">
            Manage granular enterprise permissions across 7 administrative roles and enforce mandatory MFA.
          </p>
        </div>
        <div className="flex items-center gap-3 bg-brand-50 dark:bg-zinc-800 px-4 py-2 rounded-2xl border border-brand-100 dark:border-zinc-700">
          <Smartphone className="w-4 h-4 text-brand-600" />
          <span className="text-xs font-bold text-brand-950 dark:text-zinc-100">Enforce Staff 2FA</span>
          <input
            type="checkbox"
            checked={enforce2FA}
            onChange={handleToggle2FA}
            className="w-5 h-5 rounded border-brand-300 text-brand-600 focus:ring-brand-500"
          />
        </div>
      </div>

      {/* Staff Directory Table */}
      <div className="bg-white dark:bg-zinc-900 rounded-3xl border border-brand-100 dark:border-zinc-800 overflow-hidden shadow-soft">
        <div className="p-5 border-b border-brand-100 dark:border-zinc-800 bg-brand-50/50 dark:bg-zinc-800/50 flex items-center justify-between">
          <h3 className="font-display font-bold text-base text-brand-950 dark:text-zinc-100 flex items-center gap-2">
            <Users className="w-4 h-4 text-brand-600" /> Authorized Staff & Administrators ({staff.length})
          </h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-brand-50/60 dark:bg-zinc-800/80 border-b border-brand-100 dark:border-zinc-800 text-[11px] font-bold uppercase tracking-wider text-brand-600 dark:text-zinc-400">
                <th className="py-3.5 px-4">Staff Member</th>
                <th className="py-3.5 px-4">Assigned Role</th>
                <th className="py-3.5 px-4">MFA / 2FA Status</th>
                <th className="py-3.5 px-4">Last Activity</th>
                <th className="py-3.5 px-4">Status</th>
                <th className="py-3.5 px-4 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-brand-100/60 dark:divide-zinc-800 text-xs">
              {staff.map((st) => (
                <tr key={st.id} className="hover:bg-brand-50/40 dark:hover:bg-zinc-800/40 transition">
                  <td className="py-3.5 px-4 font-bold text-sm text-brand-950 dark:text-zinc-100">
                    <div>{st.name}</div>
                    <div className="text-[11px] font-normal text-brand-600 dark:text-zinc-400">{st.email}</div>
                  </td>
                  <td className="py-3.5 px-4">
                    <span className="text-[11px] font-bold px-2.5 py-1 rounded-xl bg-brand-900 dark:bg-brand-600 text-white shadow-sm inline-block">
                      {st.role}
                    </span>
                  </td>
                  <td className="py-3.5 px-4">
                    {st.twoFactor ? (
                      <span className="text-emerald-600 font-bold flex items-center gap-1"><CheckCircle2 className="w-3.5 h-3.5" /> Enabled (TOTP)</span>
                    ) : (
                      <span className="text-amber-600 font-semibold flex items-center gap-1"><AlertCircle className="w-3.5 h-3.5" /> Disabled</span>
                    )}
                  </td>
                  <td className="py-3.5 px-4 text-brand-600 dark:text-zinc-400 font-mono">{st.lastLogin}</td>
                  <td className="py-3.5 px-4">
                    <span className={cn("text-[10px] font-bold px-2.5 py-0.5 rounded-full", st.status === "Active" ? "bg-emerald-100 text-emerald-800" : "bg-rose-100 text-rose-800")}>
                      {st.status}
                    </span>
                  </td>
                  <td className="py-3.5 px-4 text-right">
                    {st.role !== "Super Admin" && (
                      <button
                        onClick={() => handleToggleStatus(st.id, st.name)}
                        className="px-3 py-1 rounded-xl bg-brand-50 dark:bg-zinc-800 hover:bg-brand-100 text-brand-800 dark:text-zinc-200 font-semibold text-xs transition"
                      >
                        {st.status === "Active" ? "Suspend Access" : "Restore Access"}
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Role Permission Matrix Explorer */}
      <div className="bg-white dark:bg-zinc-900 rounded-3xl p-6 border border-brand-100 dark:border-zinc-800 shadow-soft space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-brand-100 dark:border-zinc-800 pb-4">
          <div>
            <h3 className="font-display font-bold text-lg text-brand-950 dark:text-zinc-100 flex items-center gap-2">
              <Key className="w-5 h-5 text-brand-600" /> Enterprise Role Permission Matrix
            </h3>
            <p className="text-xs text-brand-600 dark:text-zinc-400">Inspect granular access rights assigned to each departmental role</p>
          </div>
          <div className="flex flex-wrap gap-1">
            {rolesList.map((rl) => (
              <button
                key={rl}
                onClick={() => setSelectedRole(rl)}
                className={cn(
                  "px-3 py-1 rounded-xl text-xs font-bold transition",
                  selectedRole === rl ? "bg-brand-900 dark:bg-brand-600 text-white shadow-sm" : "bg-brand-50 dark:bg-zinc-800 text-brand-700 dark:text-zinc-300 hover:bg-brand-100"
                )}
              >
                {rl}
              </button>
            ))}
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-brand-50/50 dark:bg-zinc-800/50 border border-brand-100 dark:border-zinc-700 space-y-3">
          <div className="font-bold text-sm text-brand-950 dark:text-zinc-100 flex items-center gap-2">
            <span>Permissions Assigned to Role:</span>
            <span className="text-brand-600 dark:text-brand-400 underline">{selectedRole}</span>
          </div>
          <div className="grid sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2">
            {(ROLE_PERMISSIONS[selectedRole] || []).map((perm) => (
              <div key={perm} className="p-2.5 rounded-xl bg-white dark:bg-zinc-800 border border-brand-200 dark:border-zinc-700 font-mono text-xs font-semibold text-brand-900 dark:text-zinc-200 flex items-center gap-2 shadow-sm">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                <span className="truncate">{perm}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
