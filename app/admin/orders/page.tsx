"use client";
import { useEffect, useState, useCallback, useMemo } from "react";
import { createClient } from "@/lib/supabase/client";
import { StatusBadge } from "@/components/admin/StatusBadge";
import { SkeletonRow } from "@/components/admin/Skeleton";
import { SlideOver } from "@/components/admin/SlideOver";
import { EmptyState } from "@/components/admin/EmptyState";
import { useToast } from "@/components/admin/Toast";
import { AdminSelect } from "@/components/admin/AdminSelect";
import { StatusSelect } from "@/components/admin/StatusSelect";
import {
  Search, Download, Eye, ChevronLeft, ChevronRight,
  ShoppingBag, ArrowUpDown, ArrowUp, ArrowDown, CheckSquare, Square,
  Package, Clock, CheckCircle, Truck, XCircle,
} from "lucide-react";

// в"Ђв"Ђв"Ђ Types в"Ђв"Ђв"Ђв"Ђв"Ђв"Ђв"Ђв"Ђв"Ђв"Ђв"Ђв"Ђв"Ђв"Ђв"Ђв"Ђв"Ђв"Ђв"Ђв"Ђв"Ђв"Ђв"Ђв"Ђв"Ђв"Ђв"Ђв"Ђв"Ђв"Ђв"Ђв"Ђв"Ђв"Ђв"Ђв"Ђв"Ђв"Ђв"Ђв"Ђв"Ђв"Ђв"Ђв"Ђв"Ђв"Ђв"Ђв"Ђв"Ђв"Ђв"Ђв"Ђв"Ђв"Ђв"Ђв"Ђв"Ђв"Ђв"Ђв"Ђв"Ђв"Ђв"Ђв"Ђв"Ђв"Ђв"Ђ

interface OrderItem {
  id: string;
  quantity: number;
  size: string;
  price: number;
  products: { name: string; image_url: string } | null;
}

interface Order {
  id: string;
  total: number;
  status: string;
  created_at: string;
  customer_id: string;
  order_items?: OrderItem[];
  profile?: { username: string } | null;
}

// в"Ђв"Ђв"Ђ Constants в"Ђв"Ђв"Ђв"Ђв"Ђв"Ђв"Ђв"Ђв"Ђв"Ђв"Ђв"Ђв"Ђв"Ђв"Ђв"Ђв"Ђв"Ђв"Ђв"Ђв"Ђв"Ђв"Ђв"Ђв"Ђв"Ђв"Ђв"Ђв"Ђв"Ђв"Ђв"Ђв"Ђв"Ђв"Ђв"Ђв"Ђв"Ђв"Ђв"Ђв"Ђв"Ђв"Ђв"Ђв"Ђв"Ђв"Ђв"Ђв"Ђв"Ђв"Ђв"Ђв"Ђв"Ђв"Ђв"Ђв"Ђв"Ђв"Ђв"Ђв"Ђв"Ђв"Ђ

const PAGE_SIZE = 10;

const ORDER_STEPS = ["placed", "processing", "shipped", "delivered"] as const;

const STATUS_INDEX: Record<string, number> = {
  pending: 0,
  processing: 1,
  shipped: 2,
  delivered: 3,
  cancelled: -1,
};


// в"Ђв"Ђв"Ђ Helpers в"Ђв"Ђв"Ђв"Ђв"Ђв"Ђв"Ђв"Ђв"Ђв"Ђв"Ђв"Ђв"Ђв"Ђв"Ђв"Ђв"Ђв"Ђв"Ђв"Ђв"Ђв"Ђв"Ђв"Ђв"Ђв"Ђв"Ђв"Ђв"Ђв"Ђв"Ђв"Ђв"Ђв"Ђв"Ђв"Ђв"Ђв"Ђв"Ђв"Ђв"Ђв"Ђв"Ђв"Ђв"Ђв"Ђв"Ђв"Ђв"Ђв"Ђв"Ђв"Ђв"Ђв"Ђв"Ђв"Ђв"Ђв"Ђв"Ђв"Ђв"Ђв"Ђв"Ђв"Ђв"Ђ

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

function formatDateTime(iso: string) {
  return new Date(iso).toLocaleString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
}

function getInitials(name: string) {
  return name
    .split(" ")
    .map((p) => p[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);
}

// в"Ђв"Ђв"Ђ Timeline в"Ђв"Ђв"Ђв"Ђв"Ђв"Ђв"Ђв"Ђв"Ђв"Ђв"Ђв"Ђв"Ђв"Ђв"Ђв"Ђв"Ђв"Ђв"Ђв"Ђв"Ђв"Ђв"Ђв"Ђв"Ђв"Ђв"Ђв"Ђв"Ђв"Ђв"Ђв"Ђв"Ђв"Ђв"Ђв"Ђв"Ђв"Ђв"Ђв"Ђв"Ђв"Ђв"Ђв"Ђв"Ђв"Ђв"Ђв"Ђв"Ђв"Ђв"Ђв"Ђв"Ђв"Ђв"Ђв"Ђв"Ђв"Ђв"Ђв"Ђв"Ђв"Ђв"Ђв"Ђ

function OrderTimeline({ order }: { order: Order }) {
  const currentIdx = STATUS_INDEX[order.status] ?? 0;
  const isCancelled = order.status === "cancelled";

  const stepIcons = [Clock, Package, Truck, CheckCircle];

  return (
    <div className="space-y-0">
      {ORDER_STEPS.map((step, idx) => {
        const reached = !isCancelled && currentIdx >= idx;
        const Icon = stepIcons[idx];
        const isLast = idx === ORDER_STEPS.length - 1;

        return (
          <div key={step} className="flex gap-3">
            <div className="flex flex-col items-center">
              <div
                className={[
                  "w-7 h-7 rounded-full flex items-center justify-center flex-shrink-0 transition-colors",
                  reached
                    ? "bg-emerald-500/20 text-emerald-400"
                    : "bg-white/5 text-white/20",
                ].join(" ")}
              >
                <Icon size={14} />
              </div>
              {!isLast && (
                <div
                  className={[
                    "w-px flex-1 my-1",
                    reached && currentIdx > idx ? "bg-emerald-500/30" : "bg-white/10",
                  ].join(" ")}
                  style={{ minHeight: 20 }}
                />
              )}
            </div>
            <div className="pb-4 pt-1">
              <p
                className={[
                  "font-gilroy text-sm font-semibold capitalize",
                  reached ? "text-white" : "text-white/25",
                ].join(" ")}
              >
                {step === "placed" ? "Order Placed" : step}
              </p>
              {reached && (
                <p className="font-gilroy text-xs text-white/40 mt-0.5">
                  {formatDateTime(order.created_at)}
                </p>
              )}
            </div>
          </div>
        );
      })}

      {isCancelled && (
        <div className="flex gap-3">
          <div className="flex flex-col items-center">
            <div className="w-7 h-7 rounded-full flex items-center justify-center flex-shrink-0 bg-red-500/20 text-red-400">
              <XCircle size={14} />
            </div>
          </div>
          <div className="pb-4 pt-1">
            <p className="font-gilroy text-sm font-semibold text-red-400">Cancelled</p>
          </div>
        </div>
      )}
    </div>
  );
}

// в"Ђв"Ђв"Ђ Slide-Over Content в"Ђв"Ђв"Ђв"Ђв"Ђв"Ђв"Ђв"Ђв"Ђв"Ђв"Ђв"Ђв"Ђв"Ђв"Ђв"Ђв"Ђв"Ђв"Ђв"Ђв"Ђв"Ђв"Ђв"Ђв"Ђв"Ђв"Ђв"Ђв"Ђв"Ђв"Ђв"Ђв"Ђв"Ђв"Ђв"Ђв"Ђв"Ђв"Ђв"Ђв"Ђв"Ђв"Ђв"Ђв"Ђв"Ђв"Ђв"Ђв"Ђв"Ђв"Ђв"Ђв"Ђв"Ђв"Ђ

function OrderDetail({
  order,
  onStatusChange,
}: {
  order: Order;
  onStatusChange: (id: string, status: string) => void;
}) {
  const [pendingStatus, setPendingStatus] = useState(order.status);
  useEffect(() => { setPendingStatus(order.status); }, [order.status]);
  const displayName =
    order.profile?.username || `Customer ${order.customer_id?.slice(0, 6) ?? ""}`;

  return (
    <div className="space-y-6">
      {/* Order Info */}
      <div className="bg-black border border-white/10 rounded-xl p-5 space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <p className="font-gilroy text-xs text-white/40 uppercase tracking-wider mb-1">
              Order ID
            </p>
            <p className="font-gilroy text-xl font-bold text-brand-primary">
              #{order.id.slice(0, 8).toUpperCase()}
            </p>
          </div>
          <StatusBadge status={order.status} />
        </div>
        <div>
          <p className="font-gilroy text-xs text-white/40 uppercase tracking-wider mb-1">
            Placed on
          </p>
          <p className="font-gilroy text-sm text-white/70">{formatDateTime(order.created_at)}</p>
        </div>
        <div>
          <p className="font-gilroy text-xs text-white/40 uppercase tracking-wider mb-2">
            Update Status
          </p>
          <StatusSelect value={pendingStatus} onChange={setPendingStatus} />
          {pendingStatus !== order.status && (
            <button
              type="button"
              onClick={() => onStatusChange(order.id, pendingStatus)}
              className="mt-2 w-full font-gilroy font-medium text-sm text-white rounded-lg px-4 py-2.5"
              style={{ backgroundColor: "#1B9CFC", transition: "box-shadow 150ms" }}
              onMouseEnter={(e) => {
                (e.currentTarget as HTMLButtonElement).style.boxShadow = "0 0 0 2px rgba(27,156,252,0.3)";
              }}
              onMouseLeave={(e) => {
                (e.currentTarget as HTMLButtonElement).style.boxShadow = "none";
              }}
            >
              Confirm Status Change
            </button>
          )}
        </div>
      </div>

      {/* Customer Info */}
      <div className="bg-black border border-white/10 rounded-xl p-5">
        <p className="font-gilroy text-xs text-white/40 uppercase tracking-wider mb-3">
          Customer
        </p>
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-brand-primary/20 flex items-center justify-center flex-shrink-0">
            <span className="font-gilroy font-bold text-sm text-brand-primary">
              {getInitials(displayName)}
            </span>
          </div>
          <div>
            <p className="font-gilroy text-sm font-semibold text-white">{displayName}</p>
            <p className="font-gilroy text-xs text-white/40">
              {order.customer_id?.slice(0, 8).toUpperCase() ?? "N/A"}
            </p>
          </div>
        </div>
      </div>

      {/* Order Items */}
      <div className="bg-black border border-white/10 rounded-xl p-5">
        <p className="font-gilroy text-xs text-white/40 uppercase tracking-wider mb-3">
          Items
        </p>
        <div className="space-y-3">
          {(order.order_items || []).map((item) => (
            <div key={item.id} className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-white/5 flex items-center justify-center flex-shrink-0 overflow-hidden">
                {item.products?.image_url ? (
                  <img
                    src={item.products.image_url}
                    alt={item.products?.name || "Product"}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <Package size={16} className="text-white/20" />
                )}
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-gilroy text-sm text-white truncate">
                  {item.products?.name || "Unknown Product"}
                </p>
                <div className="flex items-center gap-2 mt-0.5">
                  <span className="font-gilroy text-xs text-white/40 bg-white/5 px-2 py-0.5 rounded">
                    {item.size}
                  </span>
                  <span className="font-gilroy text-xs text-white/40">
                    Г— {item.quantity}
                  </span>
                </div>
              </div>
              <p className="font-gilroy text-sm font-semibold text-white flex-shrink-0">
                ${(item.price * item.quantity).toFixed(2)}
              </p>
            </div>
          ))}
        </div>
        <div className="mt-4 pt-4 border-t border-white/10 flex justify-between items-center">
          <p className="font-gilroy text-sm text-white/50">Total</p>
          <p className="font-gilroy text-base font-bold text-white">
            ${order.total.toFixed(2)}
          </p>
        </div>
      </div>

      {/* Timeline */}
      <div className="bg-black border border-white/10 rounded-xl p-5">
        <p className="font-gilroy text-xs text-white/40 uppercase tracking-wider mb-4">
          Order Timeline
        </p>
        <OrderTimeline order={order} />
      </div>
    </div>
  );
}

// в"Ђв"Ђв"Ђ Sort Button в"Ђв"Ђв"Ђв"Ђв"Ђв"Ђв"Ђв"Ђв"Ђв"Ђв"Ђв"Ђв"Ђв"Ђв"Ђв"Ђв"Ђв"Ђв"Ђв"Ђв"Ђв"Ђв"Ђв"Ђв"Ђв"Ђв"Ђв"Ђв"Ђв"Ђв"Ђв"Ђв"Ђв"Ђв"Ђв"Ђв"Ђв"Ђв"Ђв"Ђв"Ђв"Ђв"Ђв"Ђв"Ђв"Ђв"Ђв"Ђв"Ђв"Ђв"Ђв"Ђв"Ђв"Ђв"Ђв"Ђв"Ђв"Ђв"Ђв"Ђв"Ђв"Ђ

type SortType = "date-desc" | "date-asc" | "total-desc" | "total-asc";

function SortButton({ sort, onSort }: { sort: SortType; onSort: (s: SortType) => void }) {
  const cycles: SortType[] = ["date-desc", "date-asc", "total-desc", "total-asc"];
  const labels: Record<SortType, string> = {
    "date-desc": "Newest",
    "date-asc": "Oldest",
    "total-desc": "Highest",
    "total-asc": "Lowest",
  };

  function next() {
    const idx = cycles.indexOf(sort);
    onSort(cycles[(idx + 1) % cycles.length]);
  }

  const Icon =
    sort === "date-desc" || sort === "total-desc"
      ? ArrowDown
      : sort === "date-asc" || sort === "total-asc"
      ? ArrowUp
      : ArrowUpDown;

  return (
    <button
      onClick={next}
      className="font-gilroy text-small text-white/60 bg-black border border-white/10 rounded-md px-3 py-2.5 outline-none hover:border-white/30 transition-colors flex items-center gap-2 whitespace-nowrap"
    >
      <Icon size={14} />
      {labels[sort]}
    </button>
  );
}

// в"Ђв"Ђв"Ђ Pagination в"Ђв"Ђв"Ђв"Ђв"Ђв"Ђв"Ђв"Ђв"Ђв"Ђв"Ђв"Ђв"Ђв"Ђв"Ђв"Ђв"Ђв"Ђв"Ђв"Ђв"Ђв"Ђв"Ђв"Ђв"Ђв"Ђв"Ђв"Ђв"Ђв"Ђв"Ђв"Ђв"Ђв"Ђв"Ђв"Ђв"Ђв"Ђв"Ђв"Ђв"Ђв"Ђв"Ђв"Ђв"Ђв"Ђв"Ђв"Ђв"Ђв"Ђв"Ђв"Ђв"Ђв"Ђв"Ђв"Ђв"Ђв"Ђв"Ђв"Ђв"Ђв"Ђв"Ђ

function Pagination({
  page,
  total,
  pageSize,
  onPage,
}: {
  page: number;
  total: number;
  pageSize: number;
  onPage: (p: number) => void;
}) {
  const totalPages = Math.max(1, Math.ceil(total / pageSize));

  function getPages(): (number | "...")[] {
    if (totalPages <= 7) return Array.from({ length: totalPages }, (_, i) => i + 1);
    const pages: (number | "...")[] = [1];
    if (page > 3) pages.push("...");
    for (let i = Math.max(2, page - 1); i <= Math.min(totalPages - 1, page + 1); i++) {
      pages.push(i);
    }
    if (page < totalPages - 2) pages.push("...");
    pages.push(totalPages);
    return pages;
  }

  const from = (page - 1) * pageSize + 1;
  const to = Math.min(page * pageSize, total);

  return (
    <div className="flex items-center justify-between px-6 py-4 border-t border-white/[0.07]">
      <p className="font-gilroy text-xs text-white/40">
        Showing {total === 0 ? 0 : from}&ndash;{to} of {total} orders
      </p>
      <div className="flex items-center gap-1">
        <button
          onClick={() => onPage(1)}
          disabled={page === 1}
          className="w-8 h-8 flex items-center justify-center rounded font-gilroy text-xs text-white/50 hover:text-white hover:bg-white/5 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
        >
          В«
        </button>
        <button
          onClick={() => onPage(page - 1)}
          disabled={page === 1}
          className="w-8 h-8 flex items-center justify-center rounded text-white/50 hover:text-white hover:bg-white/5 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
        >
          <ChevronLeft size={14} />
        </button>
        {getPages().map((p, i) =>
          p === "..." ? (
            <span key={`ellipsis-${i}`} className="w-8 h-8 flex items-center justify-center font-gilroy text-xs text-white/30">
              вЂ¦
            </span>
          ) : (
            <button
              key={p}
              onClick={() => onPage(p as number)}
              className={[
                "w-8 h-8 flex items-center justify-center rounded font-gilroy text-xs transition-colors",
                p === page
                  ? "bg-brand-primary text-white font-bold"
                  : "text-white/50 hover:text-white hover:bg-white/5",
              ].join(" ")}
            >
              {p}
            </button>
          )
        )}
        <button
          onClick={() => onPage(page + 1)}
          disabled={page === totalPages}
          className="w-8 h-8 flex items-center justify-center rounded text-white/50 hover:text-white hover:bg-white/5 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
        >
          <ChevronRight size={14} />
        </button>
        <button
          onClick={() => onPage(totalPages)}
          disabled={page === totalPages}
          className="w-8 h-8 flex items-center justify-center rounded font-gilroy text-xs text-white/50 hover:text-white hover:bg-white/5 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
        >
          В»
        </button>
      </div>
    </div>
  );
}

// в"Ђв"Ђв"Ђ Page в"Ђв"Ђв"Ђв"Ђв"Ђв"Ђв"Ђв"Ђв"Ђв"Ђв"Ђв"Ђв"Ђв"Ђв"Ђв"Ђв"Ђв"Ђв"Ђв"Ђв"Ђв"Ђв"Ђв"Ђв"Ђв"Ђв"Ђв"Ђв"Ђв"Ђв"Ђв"Ђв"Ђв"Ђв"Ђв"Ђв"Ђв"Ђв"Ђв"Ђв"Ђв"Ђв"Ђв"Ђв"Ђв"Ђв"Ђв"Ђв"Ђв"Ђв"Ђв"Ђв"Ђв"Ђв"Ђв"Ђв"Ђв"Ђв"Ђв"Ђв"Ђв"Ђв"Ђв"Ђв"Ђв"Ђв"Ђв"Ђв"Ђ

export default function AdminOrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");
  const [sort, setSort] = useState<SortType>("date-desc");
  const [page, setPage] = useState(1);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [slideOpen, setSlideOpen] = useState(false);
  const { toast } = useToast();

  // в"Ђв"Ђ Load Data в"Ђв"Ђв"Ђв"Ђв"Ђв"Ђв"Ђв"Ђв"Ђв"Ђв"Ђв"Ђв"Ђв"Ђв"Ђв"Ђв"Ђв"Ђв"Ђв"Ђв"Ђв"Ђв"Ђв"Ђв"Ђв"Ђв"Ђв"Ђв"Ђв"Ђв"Ђв"Ђв"Ђв"Ђв"Ђв"Ђв"Ђв"Ђв"Ђв"Ђв"Ђв"Ђв"Ђв"Ђв"Ђв"Ђв"Ђв"Ђв"Ђв"Ђв"Ђв"Ђв"Ђв"Ђв"Ђв"Ђв"Ђв"Ђв"Ђв"Ђв"Ђв"Ђ

  const loadOrders = useCallback(async () => {
    const supabase = createClient();

    const { data: ordersData } = await supabase
      .from("orders")
      .select(
        `id, total, status, created_at, customer_id, order_items(id, quantity, size, price, products(name, image_url))`
      )
      .order("created_at", { ascending: false });

    if (!ordersData) {
      setLoading(false);
      return;
    }

    const ids = Array.from(new Set(ordersData.map((o) => o.customer_id).filter(Boolean)));

    let profileMap: Record<string, { username: string }> = {};
    if (ids.length > 0) {
      const { data: profiles } = await supabase
        .from("profiles")
        .select("id, username")
        .in("id", ids);
      profileMap = Object.fromEntries((profiles || []).map((p) => [p.id, p]));
    }

    const merged: Order[] = ordersData.map((o) => ({
      ...(o as unknown as Order),
      profile: profileMap[o.customer_id] || null,
    }));

    setOrders(merged);
    setLoading(false);
  }, []);

  useEffect(() => {
    loadOrders();

    const supabase = createClient();
    const channel = supabase
      .channel("admin-orders-realtime")
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "orders" },
        () => {
          loadOrders();
        }
      )
      .on(
        "postgres_changes",
        { event: "UPDATE", schema: "public", table: "orders" },
        (payload) => {
          const updated = payload.new as Order;
          setOrders((prev) =>
            prev.map((o) => (o.id === updated.id ? { ...o, status: updated.status } : o))
          );
          setSelectedOrder((prev) =>
            prev && prev.id === updated.id ? { ...prev, status: updated.status } : prev
          );
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [loadOrders]);

  // Reset page on filter change
  useEffect(() => {
    setPage(1);
  }, [search, statusFilter, dateFrom, dateTo, sort]);

  // в"Ђв"Ђ Filtering в"Ђв"Ђв"Ђв"Ђв"Ђв"Ђв"Ђв"Ђв"Ђв"Ђв"Ђв"Ђв"Ђв"Ђв"Ђв"Ђв"Ђв"Ђв"Ђв"Ђв"Ђв"Ђв"Ђв"Ђв"Ђв"Ђв"Ђв"Ђв"Ђв"Ђв"Ђв"Ђв"Ђв"Ђв"Ђв"Ђв"Ђв"Ђв"Ђв"Ђв"Ђв"Ђв"Ђв"Ђв"Ђв"Ђв"Ђв"Ђв"Ђв"Ђв"Ђв"Ђв"Ђв"Ђв"Ђв"Ђв"Ђв"Ђв"Ђв"Ђв"Ђв"Ђ

  const filteredOrders = useMemo(() => {
    let result = orders;

    if (search) {
      result = result.filter(
        (o) =>
          o.id.toLowerCase().includes(search.toLowerCase()) ||
          (o.profile?.username || "").toLowerCase().includes(search.toLowerCase())
      );
    }

    if (statusFilter !== "all") {
      result = result.filter((o) => o.status === statusFilter);
    }

    if (dateFrom) {
      result = result.filter((o) => new Date(o.created_at) >= new Date(dateFrom));
    }

    if (dateTo) {
      result = result.filter(
        (o) => new Date(o.created_at) <= new Date(dateTo + "T23:59:59")
      );
    }

    result = [...result].sort((a, b) => {
      if (sort === "date-desc")
        return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
      if (sort === "date-asc")
        return new Date(a.created_at).getTime() - new Date(b.created_at).getTime();
      if (sort === "total-desc") return b.total - a.total;
      if (sort === "total-asc") return a.total - b.total;
      return 0;
    });

    return result;
  }, [orders, search, statusFilter, dateFrom, dateTo, sort]);

  // в"Ђв"Ђ Pagination slice в"Ђв"Ђв"Ђв"Ђв"Ђв"Ђв"Ђв"Ђв"Ђв"Ђв"Ђв"Ђв"Ђв"Ђв"Ђв"Ђв"Ђв"Ђв"Ђв"Ђв"Ђв"Ђв"Ђв"Ђв"Ђв"Ђв"Ђв"Ђв"Ђв"Ђв"Ђв"Ђв"Ђв"Ђв"Ђв"Ђв"Ђв"Ђв"Ђв"Ђв"Ђв"Ђв"Ђв"Ђв"Ђв"Ђв"Ђв"Ђв"Ђв"Ђв"Ђв"Ђв"Ђв"Ђв"Ђ

  const paginatedOrders = useMemo(
    () => filteredOrders.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE),
    [filteredOrders, page]
  );

  // в"Ђв"Ђ Stats в"Ђв"Ђв"Ђв"Ђв"Ђв"Ђв"Ђв"Ђв"Ђв"Ђв"Ђв"Ђв"Ђв"Ђв"Ђв"Ђв"Ђв"Ђв"Ђв"Ђв"Ђв"Ђв"Ђв"Ђв"Ђв"Ђв"Ђв"Ђв"Ђв"Ђв"Ђв"Ђв"Ђв"Ђв"Ђв"Ђв"Ђв"Ђв"Ђв"Ђв"Ђв"Ђв"Ђв"Ђв"Ђв"Ђв"Ђв"Ђв"Ђв"Ђв"Ђв"Ђв"Ђв"Ђв"Ђв"Ђв"Ђв"Ђв"Ђв"Ђв"Ђв"Ђв"Ђв"Ђв"Ђв"Ђ

  const stats = useMemo(
    () => ({
      total: orders.length,
      pending: orders.filter((o) => o.status === "pending").length,
      inTransit: orders.filter((o) => o.status === "processing" || o.status === "shipped")
        .length,
      delivered: orders.filter((o) => o.status === "delivered").length,
    }),
    [orders]
  );

  // в"Ђв"Ђ Status Change в"Ђв"Ђв"Ђв"Ђв"Ђв"Ђв"Ђв"Ђв"Ђв"Ђв"Ђв"Ђв"Ђв"Ђв"Ђв"Ђв"Ђв"Ђв"Ђв"Ђв"Ђв"Ђв"Ђв"Ђв"Ђв"Ђв"Ђв"Ђв"Ђв"Ђв"Ђв"Ђв"Ђв"Ђв"Ђв"Ђв"Ђв"Ђв"Ђв"Ђв"Ђв"Ђв"Ђв"Ђв"Ђв"Ђв"Ђв"Ђв"Ђв"Ђв"Ђв"Ђв"Ђв"Ђв"Ђв"Ђв"Ђв"Ђ

  const handleStatusChange = useCallback(
    async (id: string, status: string) => {
      const supabase = createClient();
      const { error } = await supabase.from("orders").update({ status }).eq("id", id);
      if (error) {
        toast({ title: "Error", description: "Failed to update status.", variant: "error" });
      } else {
        setOrders((prev) => prev.map((o) => (o.id === id ? { ...o, status } : o)));
        setSelectedOrder((prev) => (prev && prev.id === id ? { ...prev, status } : prev));
        toast({ title: "Updated", description: "Order status updated.", variant: "success" });
      }
    },
    [toast]
  );

  // в"Ђв"Ђ Bulk Actions в"Ђв"Ђв"Ђв"Ђв"Ђв"Ђв"Ђв"Ђв"Ђв"Ђв"Ђв"Ђв"Ђв"Ђв"Ђв"Ђв"Ђв"Ђв"Ђв"Ђв"Ђв"Ђв"Ђв"Ђв"Ђв"Ђв"Ђв"Ђв"Ђв"Ђв"Ђв"Ђв"Ђв"Ђв"Ђв"Ђв"Ђв"Ђв"Ђв"Ђв"Ђв"Ђв"Ђв"Ђв"Ђв"Ђв"Ђв"Ђв"Ђв"Ђв"Ђв"Ђв"Ђв"Ђв"Ђв"Ђв"Ђв"Ђв"Ђ

  const allPageSelected =
    paginatedOrders.length > 0 &&
    paginatedOrders.every((o) => selectedIds.has(o.id));

  function toggleAll() {
    if (allPageSelected) {
      setSelectedIds((prev) => {
        const next = new Set(prev);
        paginatedOrders.forEach((o) => next.delete(o.id));
        return next;
      });
    } else {
      setSelectedIds((prev) => {
        const next = new Set(prev);
        paginatedOrders.forEach((o) => next.add(o.id));
        return next;
      });
    }
  }

  function toggleOne(id: string) {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  const handleBulkStatus = useCallback(
    async (status: string) => {
      const ids = Array.from(selectedIds);
      if (ids.length === 0) return;
      const supabase = createClient();
      const { error } = await supabase.from("orders").update({ status }).in("id", ids);
      if (error) {
        toast({ title: "Error", description: "Bulk update failed.", variant: "error" });
      } else {
        setOrders((prev) =>
          prev.map((o) => (selectedIds.has(o.id) ? { ...o, status } : o))
        );
        setSelectedIds(new Set());
        toast({
          title: "Updated",
          description: `${ids.length} orders marked as ${status}.`,
          variant: "success",
        });
      }
    },
    [selectedIds, toast]
  );

  // в"Ђв"Ђ CSV Export в"Ђв"Ђв"Ђв"Ђв"Ђв"Ђв"Ђв"Ђв"Ђв"Ђв"Ђв"Ђв"Ђв"Ђв"Ђв"Ђв"Ђв"Ђв"Ђв"Ђв"Ђв"Ђв"Ђв"Ђв"Ђв"Ђв"Ђв"Ђв"Ђв"Ђв"Ђв"Ђв"Ђв"Ђв"Ђв"Ђв"Ђв"Ђв"Ђв"Ђв"Ђв"Ђв"Ђв"Ђв"Ђв"Ђв"Ђв"Ђв"Ђв"Ђв"Ђв"Ђв"Ђв"Ђв"Ђв"Ђв"Ђв"Ђв"Ђв"Ђв"Ђ

  function exportCSV() {
    const headers = ["Order ID", "Date", "Customer", "Items", "Total", "Status"];
    const rows = filteredOrders.map((o) => [
      `#${o.id.slice(0, 8).toUpperCase()}`,
      new Date(o.created_at).toLocaleDateString("en-US"),
      o.profile?.username || o.customer_id?.slice(0, 8) || "N/A",
      (o.order_items?.length || 0).toString(),
      o.total.toFixed(2),
      o.status,
    ]);
    const csv = [headers, ...rows]
      .map((r) => r.map((v) => `"${v}"`).join(","))
      .join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "orders.csv";
    a.click();
    URL.revokeObjectURL(url);
    toast({
      title: "Exported",
      description: `${filteredOrders.length} orders exported`,
      variant: "success",
    });
  }

  // в"Ђв"Ђ Active Filters в"Ђв"Ђв"Ђв"Ђв"Ђв"Ђв"Ђв"Ђв"Ђв"Ђв"Ђв"Ђв"Ђв"Ђв"Ђв"Ђв"Ђв"Ђв"Ђв"Ђв"Ђв"Ђв"Ђв"Ђв"Ђв"Ђв"Ђв"Ђв"Ђв"Ђв"Ђв"Ђв"Ђв"Ђв"Ђв"Ђв"Ђв"Ђв"Ђв"Ђв"Ђв"Ђв"Ђв"Ђв"Ђв"Ђв"Ђв"Ђв"Ђв"Ђв"Ђв"Ђв"Ђв"Ђв"Ђв"Ђв"Ђ

  const hasFilters =
    search !== "" || statusFilter !== "all" || dateFrom !== "" || dateTo !== "";

  function clearFilters() {
    setSearch("");
    setStatusFilter("all");
    setDateFrom("");
    setDateTo("");
    setSort("date-desc");
  }

  // в"Ђв"Ђв"Ђв"Ђв"Ђв"Ђв"Ђв"Ђв"Ђв"Ђв"Ђв"Ђв"Ђв"Ђв"Ђв"Ђв"Ђв"Ђв"Ђв"Ђв"Ђв"Ђв"Ђв"Ђв"Ђв"Ђв"Ђв"Ђв"Ђв"Ђв"Ђв"Ђв"Ђв"Ђв"Ђв"Ђв"Ђв"Ђв"Ђв"Ђв"Ђв"Ђв"Ђв"Ђв"Ђв"Ђв"Ђв"Ђв"Ђв"Ђв"Ђв"Ђв"Ђв"Ђв"Ђв"Ђв"Ђв"Ђв"Ђв"Ђв"Ђв"Ђв"Ђв"Ђв"Ђв"Ђв"Ђв"Ђв"Ђв"Ђв"Ђв"Ђв"Ђ

  return (
    <div className="p-6 lg:p-8 space-y-6">
      {/* Page Title */}
      <div>
        <h1 className="font-gilroy font-bold text-2xl text-white">Orders</h1>
        <p className="font-gilroy text-sm text-white/50 mt-1">
          Manage and track all customer orders
        </p>
      </div>

      {/* Stats Row */}
      <div className="flex flex-wrap gap-3">
        {[
          { label: "Total", value: stats.total },
          { label: "Pending", value: stats.pending },
          { label: "In Transit", value: stats.inTransit },
          { label: "Delivered", value: stats.delivered },
        ].map(({ label, value }) => (
          <div
            key={label}
            className="bg-white/5 border border-white/10 rounded-lg px-4 py-2.5 flex items-center gap-2"
          >
            <span className="font-gilroy text-xs text-white/40">{label}</span>
            <span className="font-gilroy text-sm font-bold text-white">{value}</span>
          </div>
        ))}
      </div>

      {/* Filter Bar */}
      <div className="flex flex-wrap items-center gap-3">
        {/* Search */}
        <div className="relative flex-1 min-w-[220px]">
          <Search
            size={14}
            className="absolute left-3 top-1/2 -translate-y-1/2 text-white/30 pointer-events-none"
          />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by order ID or customer..."
            className="font-gilroy text-small text-white bg-black border border-white/10 rounded-md pl-9 pr-3 py-2.5 outline-none placeholder:text-white/25 focus:border-white/30 transition-colors w-full"
          />
        </div>

        {/* Status Filter */}
        <AdminSelect
          value={statusFilter}
          onChange={setStatusFilter}
          options={[
            { value: "all",        label: "All Statuses" },
            { value: "pending",    label: "Pending" },
            { value: "processing", label: "Processing" },
            { value: "shipped",    label: "Shipped" },
            { value: "delivered",  label: "Delivered" },
            { value: "cancelled",  label: "Cancelled" },
          ]}
          className="min-w-[140px]"
        />

        {/* Date From */}
        <div className="relative">
          <input
            type="date"
            value={dateFrom}
            onChange={(e) => setDateFrom(e.target.value)}
            className="font-gilroy text-small text-white bg-black border border-white/10 rounded-md px-3 py-2.5 outline-none focus:border-white/30 transition-colors [color-scheme:dark]"
            placeholder="From"
          />
        </div>

        {/* Date To */}
        <div className="relative">
          <input
            type="date"
            value={dateTo}
            onChange={(e) => setDateTo(e.target.value)}
            className="font-gilroy text-small text-white bg-black border border-white/10 rounded-md px-3 py-2.5 outline-none focus:border-white/30 transition-colors [color-scheme:dark]"
            placeholder="To"
          />
        </div>

        {/* Sort */}
        <SortButton sort={sort} onSort={setSort} />

        {/* Export */}
        <button
          onClick={exportCSV}
          className="font-gilroy text-small text-white/60 bg-black border border-white/10 rounded-md px-3 py-2.5 outline-none hover:border-white/30 hover:text-white transition-colors flex items-center gap-2"
        >
          <Download size={14} />
          Export
        </button>

        {/* Clear Filters */}
        {hasFilters && (
          <button
            onClick={clearFilters}
            className="font-gilroy text-small text-white/50 hover:text-white transition-colors px-2"
          >
            Clear
          </button>
        )}
      </div>

      {/* Bulk Actions Bar */}
      {selectedIds.size > 0 && (
        <div className="bg-brand-primary/10 border border-brand-primary/20 rounded-xl px-5 py-3 flex flex-wrap items-center gap-4">
          <span className="font-gilroy text-sm font-semibold text-white">
            {selectedIds.size} order{selectedIds.size > 1 ? "s" : ""} selected
          </span>
          <div className="flex items-center gap-2">
            <button
              onClick={() => handleBulkStatus("processing")}
              className="font-gilroy text-xs text-white bg-white/10 hover:bg-white/20 rounded-md px-3 py-1.5 transition-colors"
            >
              Mark as Processing
            </button>
            <button
              onClick={() => handleBulkStatus("shipped")}
              className="font-gilroy text-xs text-white bg-white/10 hover:bg-white/20 rounded-md px-3 py-1.5 transition-colors"
            >
              Mark as Shipped
            </button>
            <button
              onClick={() => setSelectedIds(new Set())}
              className="font-gilroy text-xs text-white/50 hover:text-white transition-colors px-2"
            >
              Deselect All
            </button>
          </div>
        </div>
      )}

      {/* Table Card */}
      <div className="bg-white/5 border border-white/10 rounded-xl overflow-hidden">
        {/* Card Header */}
        <div className="px-6 py-4 border-b border-white/[0.07] flex items-center justify-between">
          <p className="font-gilroy font-semibold text-white text-sm">
            All Orders
          </p>
          <p className="font-gilroy text-xs text-white/40">
            {filteredOrders.length} result{filteredOrders.length !== 1 ? "s" : ""}
          </p>
        </div>

        {/* Loading */}
        {loading ? (
          <div className="p-6 space-y-3">
            {[1, 2, 3].map((i) => (
              <SkeletonRow key={i} />
            ))}
          </div>
        ) : filteredOrders.length === 0 ? (
          <div className="py-16">
            <EmptyState
              icon={ShoppingBag}
              title="No orders found"
              description="Try adjusting your filters."
            />
          </div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-white/[0.07]">
                    <th className="w-10 px-4 py-3">
                      <button
                        onClick={toggleAll}
                        className="text-white/40 hover:text-white transition-colors"
                      >
                        {allPageSelected ? (
                          <CheckSquare size={15} />
                        ) : (
                          <Square size={15} />
                        )}
                      </button>
                    </th>
                    {["Order ID", "Customer", "Items", "Total", "Payment", "Status", "Date", "Actions"].map(
                      (h) => (
                        <th
                          key={h}
                          className="font-gilroy text-xs font-semibold text-white/40 uppercase tracking-wider text-left px-4 py-3 whitespace-nowrap"
                        >
                          {h}
                        </th>
                      )
                    )}
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/[0.04]">
                  {paginatedOrders.map((order) => {
                    const displayName =
                      order.profile?.username ||
                      `Customer ${order.customer_id?.slice(0, 6) ?? ""}`;
                    const itemCount = order.order_items?.length || 0;

                    return (
                      <tr
                        key={order.id}
                        className={[
                          "hover:bg-white/[0.02] transition-colors",
                          selectedIds.has(order.id) ? "bg-brand-primary/5" : "",
                        ].join(" ")}
                      >
                        {/* Checkbox */}
                        <td className="px-4 py-3.5">
                          <button
                            onClick={() => toggleOne(order.id)}
                            className="text-white/40 hover:text-white transition-colors"
                          >
                            {selectedIds.has(order.id) ? (
                              <CheckSquare size={15} className="text-brand-primary" />
                            ) : (
                              <Square size={15} />
                            )}
                          </button>
                        </td>

                        {/* Order ID */}
                        <td className="px-4 py-3.5">
                          <span className="font-gilroy text-sm font-semibold text-brand-primary">
                            #{order.id.slice(0, 8).toUpperCase()}
                          </span>
                        </td>

                        {/* Customer */}
                        <td className="px-4 py-3.5">
                          <span className="font-gilroy text-sm text-white/70 whitespace-nowrap">
                            {displayName}
                          </span>
                        </td>

                        {/* Items */}
                        <td className="px-4 py-3.5">
                          <span className="font-gilroy text-sm text-white/60 whitespace-nowrap">
                            {itemCount} item{itemCount !== 1 ? "s" : ""}
                          </span>
                        </td>

                        {/* Total */}
                        <td className="px-4 py-3.5">
                          <span className="font-gilroy text-sm font-semibold text-white whitespace-nowrap">
                            ${order.total.toFixed(2)}
                          </span>
                        </td>

                        {/* Payment */}
                        <td className="px-4 py-3.5">
                          <StatusBadge status="paid" size="sm" />
                        </td>

                        {/* Status */}
                        <td className="px-4 py-3.5">
                          <StatusBadge status={order.status} size="sm" />
                        </td>

                        {/* Date */}
                        <td className="px-4 py-3.5">
                          <span className="font-gilroy text-sm text-white/50 whitespace-nowrap">
                            {formatDate(order.created_at)}
                          </span>
                        </td>

                        {/* Actions */}
                        <td className="px-4 py-3.5">
                          <div className="flex items-center gap-2">
                            <button
                              onClick={() => {
                                setSelectedOrder(order);
                                setSlideOpen(true);
                              }}
                              className="font-gilroy text-xs text-white rounded-lg px-3 py-1.5 flex items-center gap-1 whitespace-nowrap"
                              style={{
                                border: "1px solid rgba(255,255,255,0.15)",
                                transition: "background-color 150ms, box-shadow 150ms",
                              }}
                              onMouseEnter={(e) => {
                                (e.currentTarget as HTMLButtonElement).style.backgroundColor = "rgba(255,255,255,0.05)";
                              }}
                              onMouseLeave={(e) => {
                                (e.currentTarget as HTMLButtonElement).style.backgroundColor = "";
                              }}
                            >
                              <Eye size={12} />
                              View
                            </button>

                            <StatusSelect
                              value={order.status}
                              onChange={(v) => handleStatusChange(order.id, v)}
                              compact
                            />
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            <Pagination
              page={page}
              total={filteredOrders.length}
              pageSize={PAGE_SIZE}
              onPage={setPage}
            />
          </>
        )}
      </div>

      {/* Slide-Over */}
      {selectedOrder && (
        <SlideOver
          open={slideOpen}
          onClose={() => setSlideOpen(false)}
          title={`Order #${selectedOrder.id.slice(0, 8).toUpperCase()}`}
          width="xl"
        >
          <OrderDetail order={selectedOrder} onStatusChange={handleStatusChange} />
        </SlideOver>
      )}
    </div>
  );
}
