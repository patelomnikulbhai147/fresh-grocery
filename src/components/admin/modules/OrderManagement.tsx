"use client";
import { useState, useMemo } from "react";
import {
  ShoppingBag,
  Search,
  Filter,
  Download,
  Eye,
  Truck,
  CheckCircle2,
  Clock,
  AlertCircle,
  X,
  User,
  MapPin,
  Phone,
  FileText,
  Printer,
  ChevronRight,
  ShieldCheck,
  RotateCcw,
  PackageCheck
} from "lucide-react";
import { useAdminStore, type AdminOrder, type OrderStatus } from "@/store/adminStore";
import { useAdminAuth } from "@/store/adminAuth";
import { useToasts } from "@/store/shop";
import { cn, formatINR } from "@/lib/utils";

export function OrderManagement() {
  const { orders, updateOrderStatus, assignOrderDriver, bulkUpdateOrderStatus } = useAdminStore();
  const { user, hasPermission } = useAdminAuth();
  const pushToast = useToasts((s) => s.push);

  const [query, setQuery] = useState("");
  const [statusTab, setStatusTab] = useState<"All" | OrderStatus>("All");
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [activeOrder, setActiveOrder] = useState<AdminOrder | null>(null);

  // Driver Assignment state in drawer
  const [selDriver, setSelDriver] = useState("");

  const canEdit = hasPermission("orders.edit");
  const canBulk = hasPermission("orders.bulk");

  const driversList = [
    "Ramesh Kumar (DL-01-AB-1234 — 4.9★)",
    "Suresh Yadav (DL-02-XY-9988 — 4.8★)",
    "Amit Sharma (DL-03-ZZ-4567 — 5.0★)",
    "Vikram Singh (DL-04-QQ-1122 — 4.7★)",
    "Deepak Verma (DL-05-MM-3344 — 4.9★)"
  ];

  const filteredOrders = useMemo(() => {
    return orders.filter((o) => {
      const matchQ =
        o.id.toLowerCase().includes(query.toLowerCase()) ||
        o.invoiceNo.toLowerCase().includes(query.toLowerCase()) ||
        o.customerName.toLowerCase().includes(query.toLowerCase()) ||
        o.customerPhone.includes(query);
      const matchStatus = statusTab === "All" || o.status === statusTab;
      return matchQ && matchStatus;
    });
  }, [orders, query, statusTab]);

  const handleSelectAll = (checked: boolean) => {
    if (checked) setSelectedIds(filteredOrders.map((o) => o.id));
    else setSelectedIds([]);
  };

  const handleSelectOne = (id: string, checked: boolean) => {
    if (checked) setSelectedIds((prev) => [...prev, id]);
    else setSelectedIds((prev) => prev.filter((x) => x !== id));
  };

  const handleStatusChange = (orderId: string, newStatus: OrderStatus) => {
    if (!canEdit) {
      pushToast("Permission denied: You need 'orders.edit' permission", "info");
      return;
    }
    const u = user?.name || "Super Admin";
    const r = user?.role || "Super Admin";
    updateOrderStatus(orderId, newStatus, u, r);
    pushToast(`Order #${orderId} status updated to "${newStatus}"!`, "success");
    if (activeOrder && activeOrder.id === orderId) {
      setActiveOrder((prev) => (prev ? { ...prev, status: newStatus } : null));
    }
  };

  const handleAssignDriver = () => {
    if (!activeOrder || !selDriver) return;
    if (!canEdit) {
      pushToast("Permission denied: You need 'orders.edit' permission", "info");
      return;
    }
    const u = user?.name || "Super Admin";
    const r = user?.role || "Super Admin";
    assignOrderDriver(activeOrder.id, selDriver, u, r);
    pushToast(`Assigned driver "${selDriver.split(" ")[0]}" to Order #${activeOrder.id}!`, "success");
    setActiveOrder((prev) => (prev ? { ...prev, assignedDriver: selDriver, status: "Out for Delivery" } : null));
  };

  const handleBulkStatus = (status: OrderStatus) => {
    if (!canBulk) {
      pushToast("Permission denied: You need 'orders.bulk' permission", "info");
      return;
    }
    if (selectedIds.length === 0) return;
    const u = user?.name || "Super Admin";
    const r = user?.role || "Super Admin";
    bulkUpdateOrderStatus(selectedIds, status, u, r);
    pushToast(`Bulk updated ${selectedIds.length} orders to "${status}"!`, "success");
    setSelectedIds([]);
  };

  const handleExportCSV = () => {
    if (filteredOrders.length === 0) {
      pushToast("No orders to export", "info");
      return;
    }
    const headers = ["Order ID", "Invoice No", "Date", "Customer", "Phone", "Items Count", "Total Amount", "Payment Method", "Payment Status", "Order Status", "Assigned Driver"];
    const rows = filteredOrders.map((o) => [
      `"${o.id}"`,
      `"${o.invoiceNo}"`,
      `"${o.createdAt}"`,
      `"${o.customerName.replace(/"/g, '""')}"`,
      `"${o.customerPhone}"`,
      o.items.length,
      o.total,
      `"${o.paymentMethod}"`,
      `"${o.paymentStatus}"`,
      `"${o.status}"`,
      `"${o.assignedDriver || "Unassigned"}"`
    ]);

    const csvContent = "data:text/csv;charset=utf-8," + [headers.join(","), ...rows.map((r) => r.join(","))].join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `flashkart_orders_export_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    pushToast(`Exported ${filteredOrders.length} orders to CSV!`, "success");
  };

  const handlePrintInvoice = () => {
    if (!activeOrder) return;
    pushToast(`Generating PDF Invoice for #${activeOrder.invoiceNo}... Sending to printer simulation!`, "success");
    setTimeout(() => {
      window.print();
    }, 500);
  };

  const statusList: (OrderStatus | "All")[] = [
    "All",
    "Pending",
    "Processing",
    "Packed",
    "Out for Delivery",
    "Delivered",
    "Cancelled"
  ];

  const getStatusBadge = (st: OrderStatus) => {
    switch (st) {
      case "Delivered":
        return "bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300 border-emerald-300";
      case "Out for Delivery":
        return "bg-sky-100 dark:bg-sky-950 text-sky-800 dark:text-sky-300 border-sky-300";
      case "Packed":
      case "Processing":
        return "bg-blue-100 dark:bg-blue-950 text-blue-800 dark:text-blue-300 border-blue-300";
      case "Pending":
      case "Confirmed":
        return "bg-amber-100 dark:bg-amber-950 text-amber-800 dark:text-amber-300 border-amber-300";
      case "Cancelled":
      case "Returned":
        return "bg-rose-100 dark:bg-rose-950 text-rose-800 dark:text-rose-300 border-rose-300";
      default:
        return "bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300";
    }
  };

  const stepIndexMap: Record<OrderStatus, number> = {
    "Pending": 1,
    "Confirmed": 2,
    "Processing": 3,
    "Packed": 4,
    "Out for Delivery": 5,
    "Delivered": 6,
    "Cancelled": 0,
    "Returned": 0,
    "Refunded": 0
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* 1. Header & Actions */}
      <div className="bg-white dark:bg-zinc-900 rounded-3xl p-6 border border-brand-100 dark:border-zinc-800 shadow-soft flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="font-display text-xl md:text-2xl font-bold text-brand-950 dark:text-zinc-100 flex items-center gap-2">
            <ShoppingBag className="w-6 h-6 text-brand-600 dark:text-brand-400" /> Orders & Invoices
          </h2>
          <p className="text-xs text-brand-600 dark:text-zinc-400 mt-0.5">
            Manage customer deliveries, assign delivery partners, generate tax invoices, and track fulfillment SLAs.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={handleExportCSV}
            className="px-4 py-2.5 rounded-xl bg-brand-900 dark:bg-brand-600 hover:bg-brand-800 text-white text-xs font-bold flex items-center gap-2 shadow-sm transition active:scale-95"
          >
            <Download className="w-4 h-4" /> Export CSV
          </button>
        </div>
      </div>

      {/* 2. Bulk Actions Toolbar */}
      {selectedIds.length > 0 && (
        <div className="bg-brand-950 text-white dark:bg-brand-900 rounded-2xl p-4 shadow-xl flex flex-wrap items-center justify-between gap-4 animate-in slide-in-from-top-4">
          <div className="flex items-center gap-3">
            <span className="w-7 h-7 rounded-lg bg-cta-500 text-white font-bold text-xs flex items-center justify-center">
              {selectedIds.length}
            </span>
            <span className="text-sm font-semibold">Orders Selected</span>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-xs text-zinc-400">Set Bulk Status:</span>
            <button onClick={() => handleBulkStatus("Processing")} className="px-3 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-xs font-semibold transition">
              Processing
            </button>
            <button onClick={() => handleBulkStatus("Packed")} className="px-3 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-xs font-semibold transition">
              Packed
            </button>
            <button onClick={() => handleBulkStatus("Out for Delivery")} className="px-3 py-1.5 rounded-xl bg-sky-600 hover:bg-sky-500 text-xs font-semibold transition">
              Out for Delivery
            </button>
            <button onClick={() => handleBulkStatus("Delivered")} className="px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-xs font-semibold transition">
              Delivered
            </button>
            <button onClick={() => setSelectedIds([])} className="p-1.5 rounded-lg hover:bg-white/10 text-zinc-400 hover:text-white transition">
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* 3. Status Tabs & Search Bar */}
      <div className="bg-white dark:bg-zinc-900 rounded-2xl p-4 border border-brand-100 dark:border-zinc-800 shadow-sm space-y-4">
        <div className="flex items-center gap-1 overflow-x-auto scrollbar-hide text-xs font-bold border-b border-brand-100 dark:border-zinc-800 pb-2">
          {statusList.map((st) => {
            const count = st === "All" ? orders.length : orders.filter((o) => o.status === st).length;
            const isActive = statusTab === st;
            return (
              <button
                key={st}
                onClick={() => { setStatusTab(st as any); setSelectedIds([]); }}
                className={cn(
                  "px-3.5 py-1.5 rounded-xl transition flex items-center gap-1.5 whitespace-nowrap",
                  isActive
                    ? "bg-brand-900 dark:bg-brand-600 text-white shadow-sm font-bold"
                    : "text-brand-700 dark:text-zinc-400 hover:bg-brand-50 dark:hover:bg-zinc-800"
                )}
              >
                <span>{st}</span>
                <span className={cn("text-[10px] px-1.5 py-0.2 rounded-full", isActive ? "bg-white/20 text-white" : "bg-brand-100 dark:bg-zinc-800 text-brand-800 dark:text-zinc-300")}>
                  {count}
                </span>
              </button>
            );
          })}
        </div>

        <div className="flex items-center gap-3">
          <div className="flex-1 relative">
            <Search className="w-4 h-4 text-brand-500 dark:text-zinc-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search by Order ID, Invoice Number, Customer Name, or Phone..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              className="w-full pl-9 pr-4 py-2 rounded-xl bg-brand-50/70 dark:bg-zinc-800 border border-brand-100 dark:border-zinc-700 text-xs text-brand-950 dark:text-zinc-100 outline-none"
            />
          </div>
        </div>
      </div>

      {/* 4. Orders Table */}
      <div className="bg-white dark:bg-zinc-900 rounded-3xl border border-brand-100 dark:border-zinc-800 overflow-hidden shadow-soft">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-brand-50/60 dark:bg-zinc-800/80 border-b border-brand-100 dark:border-zinc-800 text-[11px] font-bold uppercase tracking-wider text-brand-600 dark:text-zinc-400">
                <th className="py-3.5 px-4 w-10">
                  <input
                    type="checkbox"
                    checked={filteredOrders.length > 0 && selectedIds.length === filteredOrders.length}
                    onChange={(e) => handleSelectAll(e.target.checked)}
                    className="rounded border-brand-300 text-brand-600 focus:ring-brand-500"
                  />
                </th>
                <th className="py-3.5 px-4">Order ID & Date</th>
                <th className="py-3.5 px-4">Customer Details</th>
                <th className="py-3.5 px-4">Payment & Total</th>
                <th className="py-3.5 px-4">Fulfillment Status</th>
                <th className="py-3.5 px-4">Delivery Partner</th>
                <th className="py-3.5 px-4 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-brand-100/60 dark:divide-zinc-800 text-xs">
              {filteredOrders.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-brand-600 dark:text-zinc-500 font-medium">
                    No grocery orders found matching your filter criteria.
                  </td>
                </tr>
              ) : (
                filteredOrders.map((ord) => {
                  const isChecked = selectedIds.includes(ord.id);
                  return (
                    <tr key={ord.id} className={cn("hover:bg-brand-50/40 dark:hover:bg-zinc-800/40 transition", isChecked && "bg-brand-50/80 dark:bg-brand-950/20")}>
                      <td className="py-3.5 px-4">
                        <input
                          type="checkbox"
                          checked={isChecked}
                          onChange={(e) => handleSelectOne(ord.id, e.target.checked)}
                          className="rounded border-brand-300 text-brand-600 focus:ring-brand-500"
                        />
                      </td>
                      <td className="py-3.5 px-4 whitespace-nowrap">
                        <div onClick={() => { setActiveOrder(ord); setSelDriver(ord.assignedDriver || ""); }} className="font-bold text-sm text-brand-950 dark:text-zinc-100 hover:text-brand-600 dark:hover:text-brand-400 cursor-pointer flex items-center gap-1">
                          {ord.id}
                        </div>
                        <div className="text-[11px] text-brand-600 dark:text-zinc-500 font-mono mt-0.5">{ord.invoiceNo}</div>
                        <div className="text-[10px] text-brand-500 dark:text-zinc-500">{ord.createdAt}</div>
                      </td>
                      <td className="py-3.5 px-4">
                        <div className="font-semibold text-brand-900 dark:text-zinc-200 flex items-center gap-1">
                          <User className="w-3 h-3 text-brand-500" /> {ord.customerName}
                        </div>
                        <div className="text-[11px] text-brand-600 dark:text-zinc-400 flex items-center gap-1 mt-0.5">
                          <Phone className="w-3 h-3 text-brand-500" /> {ord.customerPhone}
                        </div>
                      </td>
                      <td className="py-3.5 px-4 whitespace-nowrap">
                        <div className="font-bold text-sm text-brand-950 dark:text-zinc-100">{formatINR(ord.total)}</div>
                        <div className="text-[10px] font-semibold uppercase tracking-wider px-1.5 py-0.5 rounded bg-cream-200 dark:bg-zinc-800 text-brand-800 dark:text-zinc-300 inline-block mt-0.5">
                          {ord.paymentMethod} · {ord.paymentStatus}
                        </div>
                      </td>
                      <td className="py-3.5 px-4">
                        <span className={cn("text-[11px] font-bold px-3 py-1 rounded-full border inline-block", getStatusBadge(ord.status))}>
                          {ord.status}
                        </span>
                      </td>
                      <td className="py-3.5 px-4">
                        {ord.assignedDriver ? (
                          <div className="text-xs font-semibold text-emerald-700 dark:text-emerald-400 flex items-center gap-1">
                            <Truck className="w-3.5 h-3.5 shrink-0" /> <span className="truncate max-w-[140px]">{ord.assignedDriver.split(" ")[0]}</span>
                          </div>
                        ) : (
                          <span className="text-[11px] text-amber-600 dark:text-amber-400 font-semibold italic flex items-center gap-1">
                            <AlertCircle className="w-3.5 h-3.5" /> Unassigned
                          </span>
                        )}
                      </td>
                      <td className="py-3.5 px-4 text-right whitespace-nowrap">
                        <button
                          onClick={() => { setActiveOrder(ord); setSelDriver(ord.assignedDriver || ""); }}
                          className="px-3 py-1.5 rounded-xl bg-brand-50 dark:bg-zinc-800 hover:bg-brand-100 dark:hover:bg-zinc-700 text-brand-800 dark:text-zinc-200 font-bold text-xs flex items-center gap-1.5 ml-auto transition shadow-sm"
                        >
                          <Eye className="w-3.5 h-3.5" /> Manage
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* 5. Order Details Drawer / Modal */}
      {activeOrder && (
        <div className="fixed inset-0 z-50 flex items-center justify-end bg-brand-950/60 backdrop-blur-sm animate-in fade-in">
          <div className="bg-white dark:bg-zinc-900 w-full max-w-2xl h-full flex flex-col border-l border-brand-100 dark:border-zinc-800 shadow-2xl overflow-hidden animate-in slide-in-from-right">
            {/* Drawer Header */}
            <div className="p-6 border-b border-brand-100 dark:border-zinc-800 bg-brand-50/50 dark:bg-zinc-800/50 flex items-center justify-between">
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="font-display text-xl font-bold text-brand-950 dark:text-zinc-100">Order {activeOrder.id}</h3>
                  <span className={cn("text-xs font-bold px-2.5 py-0.5 rounded-full border", getStatusBadge(activeOrder.status))}>
                    {activeOrder.status}
                  </span>
                </div>
                <p className="text-xs text-brand-600 dark:text-zinc-400 font-mono mt-0.5">Invoice: {activeOrder.invoiceNo} · Placed on {activeOrder.createdAt}</p>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={handlePrintInvoice}
                  className="p-2 rounded-xl bg-white dark:bg-zinc-800 border border-brand-200 dark:border-zinc-700 text-brand-700 dark:text-zinc-300 hover:bg-brand-50 transition"
                  title="Print Invoice / PDF"
                >
                  <Printer className="w-4 h-4" />
                </button>
                <button onClick={() => setActiveOrder(null)} className="p-1.5 rounded-xl text-brand-700 dark:text-zinc-400 hover:bg-brand-100 dark:hover:bg-zinc-700 transition">
                  <X className="w-6 h-6" />
                </button>
              </div>
            </div>

            {/* Drawer Body */}
            <div className="flex-1 overflow-y-auto p-6 space-y-6 text-xs text-brand-950 dark:text-zinc-100">
              {/* Fulfillment SLA Stepper */}
              <div className="p-4 rounded-2xl bg-brand-50/70 dark:bg-zinc-800/70 border border-brand-100 dark:border-zinc-700 space-y-3">
                <div className="font-bold text-sm text-brand-950 dark:text-zinc-100 flex items-center justify-between">
                  <span>30-Minute Delivery SLA Tracker</span>
                  <span className="text-[11px] text-emerald-600 font-semibold">On Schedule</span>
                </div>
                <div className="grid grid-cols-6 gap-1 relative pt-2">
                  {(["Pending", "Confirmed", "Processing", "Packed", "Out for Delivery", "Delivered"] as OrderStatus[]).map((st, idx) => {
                    const curIdx = stepIndexMap[activeOrder.status] || 0;
                    const isDone = idx + 1 <= curIdx;
                    return (
                      <div key={st} className="flex flex-col items-center text-center gap-1.5 z-10">
                        <div className={cn("w-6 h-6 rounded-full flex items-center justify-center font-bold text-[10px] transition", isDone ? "bg-emerald-500 text-white shadow-sm" : "bg-cream-200 dark:bg-zinc-700 text-zinc-500")}>
                          {isDone ? <CheckCircle2 className="w-3.5 h-3.5" /> : idx + 1}
                        </div>
                        <span className={cn("text-[9px] font-semibold leading-tight", isDone ? "text-brand-950 dark:text-zinc-100 font-bold" : "text-brand-600 dark:text-zinc-500")}>{st}</span>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Status & Driver Assignment Actions */}
              <div className="grid sm:grid-cols-2 gap-4 p-4 rounded-2xl bg-white dark:bg-zinc-800 border border-brand-200 dark:border-zinc-700 shadow-sm">
                <div>
                  <label className="block font-bold text-brand-900 dark:text-zinc-200 mb-1">Update Order Status</label>
                  <select
                    value={activeOrder.status}
                    onChange={(e) => handleStatusChange(activeOrder.id, e.target.value as OrderStatus)}
                    className="w-full bg-brand-50 dark:bg-zinc-900 border border-brand-200 dark:border-zinc-700 rounded-xl px-3 py-2 font-bold text-brand-950 dark:text-zinc-100 outline-none"
                  >
                    <option value="Pending">Pending</option>
                    <option value="Confirmed">Confirmed</option>
                    <option value="Processing">Processing</option>
                    <option value="Packed">Packed</option>
                    <option value="Out for Delivery">Out for Delivery</option>
                    <option value="Delivered">Delivered</option>
                    <option value="Cancelled">Cancelled</option>
                    <option value="Returned">Returned</option>
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-brand-900 dark:text-zinc-200 mb-1">Assign Delivery Driver</label>
                  <div className="flex gap-2">
                    <select
                      value={selDriver}
                      onChange={(e) => setSelDriver(e.target.value)}
                      className="flex-1 bg-brand-50 dark:bg-zinc-900 border border-brand-200 dark:border-zinc-700 rounded-xl px-3 py-2 font-semibold text-brand-950 dark:text-zinc-100 outline-none truncate"
                    >
                      <option value="">-- Choose Driver --</option>
                      {driversList.map((d) => (
                        <option key={d} value={d}>{d}</option>
                      ))}
                    </select>
                    <button
                      onClick={handleAssignDriver}
                      className="px-3 py-2 rounded-xl bg-brand-900 dark:bg-brand-600 hover:bg-brand-800 text-white font-bold text-xs shadow-sm transition shrink-0 active:scale-95"
                    >
                      Assign
                    </button>
                  </div>
                </div>
              </div>

              {/* Customer & Address Details */}
              <div className="grid sm:grid-cols-2 gap-4">
                <div className="p-4 rounded-2xl bg-brand-50/50 dark:bg-zinc-800/50 border border-brand-100 dark:border-zinc-700 space-y-2">
                  <div className="font-bold text-sm text-brand-950 dark:text-zinc-100 flex items-center gap-1.5">
                    <User className="w-4 h-4 text-brand-600" /> Customer Information
                  </div>
                  <div className="space-y-1 text-brand-700 dark:text-zinc-400">
                    <div className="font-semibold text-brand-900 dark:text-zinc-200">{activeOrder.customerName}</div>
                    <div>Email: {activeOrder.customerEmail}</div>
                    <div>Phone: <strong className="text-brand-900 dark:text-zinc-200">{activeOrder.customerPhone}</strong></div>
                  </div>
                </div>

                <div className="p-4 rounded-2xl bg-brand-50/50 dark:bg-zinc-800/50 border border-brand-100 dark:border-zinc-700 space-y-2">
                  <div className="font-bold text-sm text-brand-950 dark:text-zinc-100 flex items-center gap-1.5">
                    <MapPin className="w-4 h-4 text-brand-600" /> Delivery Address
                  </div>
                  <p className="text-brand-700 dark:text-zinc-400 leading-relaxed">
                    {activeOrder.deliveryAddress}
                  </p>
                  <a
                    href={`https://maps.google.com/?q=${encodeURIComponent(activeOrder.deliveryAddress || activeOrder.shippingAddress || "")}`}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-block text-[11px] font-bold text-brand-600 dark:text-brand-400 hover:underline pt-1"
                  >
                    🗺️ Open on Google Maps →
                  </a>
                </div>
              </div>

              {/* Items Ordered List */}
              <div className="space-y-3">
                <div className="font-bold text-sm text-brand-950 dark:text-zinc-100 flex items-center justify-between">
                  <span>Ordered Grocery Items ({activeOrder.items.length})</span>
                  <span>Subtotal: {formatINR(activeOrder.subtotal)}</span>
                </div>
                <div className="divide-y divide-brand-100 dark:divide-zinc-800 border border-brand-100 dark:border-zinc-800 rounded-2xl overflow-hidden bg-white dark:bg-zinc-900">
                  {activeOrder.items.map((item) => (
                    <div key={item.productId} className="p-3.5 flex items-center justify-between gap-3">
                      <div className="flex items-center gap-3 min-w-0">
                        <div className="w-10 h-10 rounded-xl bg-cream-100 dark:bg-zinc-800 flex items-center justify-center font-bold text-xs shrink-0">
                          📦
                        </div>
                        <div className="min-w-0">
                          <div className="font-bold text-sm text-brand-950 dark:text-zinc-100 truncate">{item.name}</div>
                          <div className="text-[11px] text-brand-600 dark:text-zinc-400">Unit: {item.unit} · Qty: <strong className="text-brand-900 dark:text-zinc-200">{item.quantity}</strong></div>
                        </div>
                      </div>
                      <div className="font-bold text-sm text-brand-950 dark:text-zinc-100 whitespace-nowrap">
                        {formatINR(item.price * item.quantity)}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Financial Bill Summary */}
              <div className="p-4 rounded-2xl bg-brand-50 dark:bg-zinc-800/80 border border-brand-100 dark:border-zinc-700 space-y-2 text-brand-800 dark:text-zinc-300">
                <div className="flex justify-between"><span>Subtotal:</span><span className="font-semibold">{formatINR(activeOrder.subtotal)}</span></div>
                <div className="flex justify-between"><span>Delivery Charge:</span><span className="font-semibold">{activeOrder.deliveryFee === 0 ? "FREE" : formatINR(activeOrder.deliveryFee)}</span></div>
                <div className="flex justify-between"><span>Estimated Taxes (GST):</span><span className="font-semibold">{formatINR(activeOrder.tax)}</span></div>
                {activeOrder.discount > 0 && (
                  <div className="flex justify-between text-emerald-600 dark:text-emerald-400"><span>Coupon Discount:</span><span className="font-bold">-{formatINR(activeOrder.discount)}</span></div>
                )}
                <div className="border-t border-brand-200 dark:border-zinc-700 pt-2 flex justify-between font-display font-bold text-lg text-brand-950 dark:text-zinc-100">
                  <span>Grand Total Paid:</span>
                  <span className="text-cta-600 dark:text-cta-400">{formatINR(activeOrder.total)}</span>
                </div>
              </div>
            </div>

            {/* Drawer Footer Actions */}
            <div className="p-4 border-t border-brand-100 dark:border-zinc-800 bg-brand-50/50 dark:bg-zinc-800/50 flex items-center justify-end gap-3">
              <button
                onClick={() => setActiveOrder(null)}
                className="px-5 py-2.5 rounded-xl border border-brand-200 dark:border-zinc-700 font-semibold text-brand-800 dark:text-zinc-300 hover:bg-brand-50 transition"
              >
                Close Drawer
              </button>
              <button
                onClick={() => handleStatusChange(activeOrder.id, "Delivered")}
                className="px-6 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold shadow-sm transition flex items-center gap-1.5 active:scale-95"
              >
                <PackageCheck className="w-4 h-4" /> Mark Delivered
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
