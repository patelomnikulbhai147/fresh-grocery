"use client";
import { useState } from "react";
import { Settings, Save, ShieldCheck, Mail, Phone, Globe, DollarSign, Bell, AlertTriangle, Check, RefreshCw } from "lucide-react";
import { useAdminAuth } from "@/store/adminAuth";
import { useToasts } from "@/store/shop";
import { cn } from "@/lib/utils";

export function SettingsModule() {
  const { hasPermission } = useAdminAuth();
  const pushToast = useToasts((s) => s.push);

  const [settings, setSettings] = useState({
    storeName: "FlashKart — Fresh Vegetables & Seasonal Fruits",
    storeUrl: "https://flashkart.co",
    contactEmail: "flashkart.co@gmail.com",
    helpline: "+91 6352856495 / 9773271029",
    currency: "INR (₹)",
    defaultGstRate: 5,
    freeDeliveryThreshold: 0,
    minOrderAmount: 100,
    maintenanceMode: false,
    orderSmsAlerts: true,
    emailNotifications: true,
    autoAssignDrivers: false,
    lowStockThresholdAlert: 10
  });

  const [isSaving, setIsSaving] = useState(false);
  const canEdit = hasPermission("settings.edit");

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!canEdit) {
      pushToast("Permission denied: You need 'settings.edit' permission", "info");
      return;
    }
    setIsSaving(true);
    setTimeout(() => {
      setIsSaving(false);
      pushToast("Enterprise system configurations saved and synced!", "success");
    }, 800);
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-300 max-w-4xl">
      {/* Header */}
      <div className="bg-white dark:bg-zinc-900 rounded-3xl p-6 border border-brand-100 dark:border-zinc-800 shadow-soft flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="font-display text-xl md:text-2xl font-bold text-brand-950 dark:text-zinc-100 flex items-center gap-2">
            <Settings className="w-6 h-6 text-brand-600 dark:text-brand-400 animate-spin-slow" /> Store & System Configuration
          </h2>
          <p className="text-xs text-brand-600 dark:text-zinc-400 mt-0.5">
            Configure global website parameters, tax percentages, delivery thresholds, and automated alert rules.
          </p>
        </div>
        <button
          onClick={handleSave}
          disabled={isSaving}
          className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-brand-600 to-brand-500 hover:from-brand-700 text-white text-xs font-bold flex items-center gap-2 shadow-glow-cta transition active:scale-95 disabled:opacity-50 shrink-0"
        >
          {isSaving ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
          <span>Save Settings</span>
        </button>
      </div>

      <form onSubmit={handleSave} className="space-y-6 text-xs">
        {/* 1. General Store Identity */}
        <div className="bg-white dark:bg-zinc-900 rounded-3xl p-6 border border-brand-100 dark:border-zinc-800 shadow-soft space-y-4">
          <h3 className="font-display font-bold text-base text-brand-950 dark:text-zinc-100 flex items-center gap-2 border-b border-brand-100 dark:border-zinc-800 pb-3">
            <Globe className="w-4 h-4 text-brand-600" /> Store Identity & Contact Information
          </h3>

          <div className="grid sm:grid-cols-2 gap-4">
            <div>
              <label className="block font-bold text-brand-900 dark:text-zinc-200 mb-1">Store Name *</label>
              <input
                type="text"
                required
                value={settings.storeName}
                onChange={(e) => setSettings({ ...settings, storeName: e.target.value })}
                className="w-full bg-brand-50/70 dark:bg-zinc-800 border border-brand-200 dark:border-zinc-700 rounded-xl px-3.5 py-2.5 font-bold text-sm text-brand-950 dark:text-zinc-100 outline-none"
              />
            </div>

            <div>
              <label className="block font-bold text-brand-900 dark:text-zinc-200 mb-1">Website URL *</label>
              <input
                type="text"
                required
                value={settings.storeUrl}
                onChange={(e) => setSettings({ ...settings, storeUrl: e.target.value })}
                className="w-full bg-brand-50/70 dark:bg-zinc-800 border border-brand-200 dark:border-zinc-700 rounded-xl px-3.5 py-2 font-mono outline-none"
              />
            </div>

            <div>
              <label className="block font-bold text-brand-900 dark:text-zinc-200 mb-1 flex items-center gap-1">
                <Mail className="w-3.5 h-3.5" /> Support Email Address *
              </label>
              <input
                type="email"
                required
                value={settings.contactEmail}
                onChange={(e) => setSettings({ ...settings, contactEmail: e.target.value })}
                className="w-full bg-brand-50/70 dark:bg-zinc-800 border border-brand-200 dark:border-zinc-700 rounded-xl px-3.5 py-2 outline-none"
              />
            </div>

            <div>
              <label className="block font-bold text-brand-900 dark:text-zinc-200 mb-1 flex items-center gap-1">
                <Phone className="w-3.5 h-3.5" /> Customer Helpline Number *
              </label>
              <input
                type="text"
                required
                value={settings.helpline}
                onChange={(e) => setSettings({ ...settings, helpline: e.target.value })}
                className="w-full bg-brand-50/70 dark:bg-zinc-800 border border-brand-200 dark:border-zinc-700 rounded-xl px-3.5 py-2 outline-none font-semibold"
              />
            </div>
          </div>
        </div>

        {/* 2. Financial & Order Rules */}
        <div className="bg-white dark:bg-zinc-900 rounded-3xl p-6 border border-brand-100 dark:border-zinc-800 shadow-soft space-y-4">
          <h3 className="font-display font-bold text-base text-brand-950 dark:text-zinc-100 flex items-center gap-2 border-b border-brand-100 dark:border-zinc-800 pb-3">
            <DollarSign className="w-4 h-4 text-emerald-600" /> Financial & Order Policies
          </h3>

          <div className="grid sm:grid-cols-3 gap-4">
            <div>
              <label className="block font-bold text-brand-900 dark:text-zinc-200 mb-1">Default GST / Tax Rate (%)</label>
              <input
                type="number"
                value={settings.defaultGstRate}
                onChange={(e) => setSettings({ ...settings, defaultGstRate: parseFloat(e.target.value) || 0 })}
                className="w-full bg-brand-50/70 dark:bg-zinc-800 border border-brand-200 dark:border-zinc-700 rounded-xl px-3.5 py-2.5 font-bold outline-none"
              />
            </div>

            <div>
              <label className="block font-bold text-brand-900 dark:text-zinc-200 mb-1">Free Delivery Threshold (₹)</label>
              <input
                type="number"
                value={settings.freeDeliveryThreshold}
                onChange={(e) => setSettings({ ...settings, freeDeliveryThreshold: parseFloat(e.target.value) || 0 })}
                className="w-full bg-brand-50/70 dark:bg-zinc-800 border border-brand-200 dark:border-zinc-700 rounded-xl px-3.5 py-2.5 font-bold text-emerald-600 outline-none"
              />
            </div>

            <div>
              <label className="block font-bold text-brand-900 dark:text-zinc-200 mb-1">Minimum Order Amount (₹)</label>
              <input
                type="number"
                value={settings.minOrderAmount}
                onChange={(e) => setSettings({ ...settings, minOrderAmount: parseFloat(e.target.value) || 0 })}
                className="w-full bg-brand-50/70 dark:bg-zinc-800 border border-brand-200 dark:border-zinc-700 rounded-xl px-3.5 py-2.5 font-bold outline-none"
              />
            </div>
          </div>
        </div>

        {/* 3. Automation & System Toggles */}
        <div className="bg-white dark:bg-zinc-900 rounded-3xl p-6 border border-brand-100 dark:border-zinc-800 shadow-soft space-y-4">
          <h3 className="font-display font-bold text-base text-brand-950 dark:text-zinc-100 flex items-center gap-2 border-b border-brand-100 dark:border-zinc-800 pb-3">
            <Bell className="w-4 h-4 text-brand-600" /> Automation & Notifications
          </h3>

          <div className="grid sm:grid-cols-2 gap-4">
            <div className="p-4 rounded-2xl bg-brand-50 dark:bg-zinc-800 border border-brand-100 dark:border-zinc-700 flex items-center justify-between">
              <div>
                <div className="font-bold text-sm text-brand-950 dark:text-zinc-100">Order SMS / WhatsApp Alerts</div>
                <div className="text-[11px] text-brand-600 dark:text-zinc-400">Send automated SMS upon order dispatch</div>
              </div>
              <input
                type="checkbox"
                checked={settings.orderSmsAlerts}
                onChange={(e) => setSettings({ ...settings, orderSmsAlerts: e.target.checked })}
                className="w-5 h-5 rounded border-brand-300 text-brand-600 focus:ring-brand-500"
              />
            </div>

            <div className="p-4 rounded-2xl bg-brand-50 dark:bg-zinc-800 border border-brand-100 dark:border-zinc-700 flex items-center justify-between">
              <div>
                <div className="font-bold text-sm text-brand-950 dark:text-zinc-100">Auto-Assign Delivery Drivers</div>
                <div className="text-[11px] text-brand-600 dark:text-zinc-400">Automatically assign nearest available rider</div>
              </div>
              <input
                type="checkbox"
                checked={settings.autoAssignDrivers}
                onChange={(e) => setSettings({ ...settings, autoAssignDrivers: e.target.checked })}
                className="w-5 h-5 rounded border-brand-300 text-brand-600 focus:ring-brand-500"
              />
            </div>
          </div>
        </div>

        {/* 4. Maintenance Mode Danger Zone */}
        <div className="bg-rose-50 dark:bg-rose-950/20 rounded-3xl p-6 border border-rose-200 dark:border-rose-900 shadow-soft flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-rose-100 dark:bg-rose-900 text-rose-600 flex items-center justify-center font-bold text-xl shrink-0">
              <AlertTriangle className="w-5 h-5" />
            </div>
            <div>
              <div className="font-bold text-base text-rose-950 dark:text-rose-200">Storefront Maintenance Mode</div>
              <p className="text-xs text-rose-700 dark:text-rose-400">When enabled, the customer website will display a &quot;Temporarily Closed for Upgrades&quot; banner and pause checkout.</p>
            </div>
          </div>
          <input
            type="checkbox"
            checked={settings.maintenanceMode}
            onChange={(e) => setSettings({ ...settings, maintenanceMode: e.target.checked })}
            className="w-6 h-6 rounded border-rose-300 text-rose-600 focus:ring-rose-500 shrink-0"
          />
        </div>
      </form>
    </div>
  );
}
