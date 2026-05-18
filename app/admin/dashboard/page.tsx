"use client";
import { useEffect, useState, useCallback } from "react";
import { createClient } from "@/lib/supabase/client";
import { StatusBadge } from "@/components/admin/StatusBadge";
import { Skeleton, SkeletonCard } from "@/components/admin/Skeleton";
import { SlideOver } from "@/components/admin/SlideOver";
import { useToast } from "@/components/admin/Toast";
import { StatusSelect } from "@/components/admin/StatusSelect";
import { Button } from "@/components/Button";
import {
  TrendingUp,
  TrendingDown,
  RefreshCw,
  Package,
  Users,
  ShoppingBag,
  DollarSign,
  AlertTriangle,
  Clock,
  CheckCircle,

} from "lucide-react";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend,
  BarChart,
  Bar,
  ComposedChart,
  Line,
} from "recharts";

// в"Ђв"Ђв"Ђ Types в"Ђв"Ђв"Ђв"Ђв"Ђв"Ђв"Ђв"Ђв"Ђв"Ђв"Ђв"Ђв"Ђв"Ђв"Ђв"Ђв"Ђв"Ђв"Ђв"Ђв"Ђв"Ђв"Ђв"Ђв"Ђв"Ђв"Ђв"Ђв"Ђв"Ђв"Ђв"Ђв"Ђв"Ђв"Ђв"Ђв"Ђв"Ђв"Ђв"Ђв"Ђв"Ђв"Ђв"Ђв"Ђв"Ђв"Ђв"Ђв"Ђв"Ђв"Ђв"Ђв"Ђв"Ђв"Ђв"Ђв"Ђв"Ђв"Ђв"Ђв"Ђв"Ђв"Ђв"Ђв"Ђв"Ђв"Ђ

interface Order {
  id: string;
  customer_id: string;
  total: number;
  status: string;
  created_at: string;
}

interface Product {
  id: string;
  name: string;
  category: string;
  image_url: string;
  stock: number;
}

interface OrderItemRaw {
  quantity: number;
  price: number;
  products: {
    id: string;
    name: string;
    category: string;
    image_url: string;
    stock: number;
  } | null;
}

interface Profile {
  id: string;
  username: string;
  role: string;
}

interface TopProduct {
  id: string;
  name: string;
  category: string;
  image_url: string;
  stock: number;
  unitsSold: number;
  revenue: number;
}

interface DayPoint {
  date: string;
  revenue: number;
  orders: number;
}

interface SparkPoint {
  v: number;
}

// в"Ђв"Ђв"Ђ Helpers в"Ђв"Ђв"Ђв"Ђв"Ђв"Ђв"Ђв"Ђв"Ђв"Ђв"Ђв"Ђв"Ђв"Ђв"Ђв"Ђв"Ђв"Ђв"Ђв"Ђв"Ђв"Ђв"Ђв"Ђв"Ђв"Ђв"Ђв"Ђв"Ђв"Ђв"Ђв"Ђв"Ђв"Ђв"Ђв"Ђв"Ђв"Ђв"Ђв"Ђв"Ђв"Ђв"Ђв"Ђв"Ђв"Ђв"Ђв"Ђв"Ђв"Ђв"Ђв"Ђв"Ђв"Ђв"Ђв"Ђв"Ђв"Ђв"Ђв"Ђв"Ђв"Ђв"Ђв"Ђв"Ђ

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
  });
}

function formatDateFull(iso: string) {
  return new Date(iso).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function calcChange(thisWeek: number, lastWeek: number): { pct: number; up: boolean } {
  if (lastWeek === 0) return { pct: 0, up: true };
  const pct = ((thisWeek - lastWeek) / lastWeek) * 100;
  return { pct: Math.abs(pct), up: pct >= 0 };
}

function getDayLabel(daysAgo: number): string {
  const d = new Date();
  d.setDate(d.getDate() - daysAgo);
  return d.toLocaleDateString("en-US", { month: "short", day: "numeric" });
}

function buildLast30Days(orders: Order[]): DayPoint[] {
  const map: Record<string, DayPoint> = {};
  for (let i = 29; i >= 0; i--) {
    const label = getDayLabel(i);
    map[label] = { date: label, revenue: 0, orders: 0 };
  }
  const cutoff = new Date();
  cutoff.setDate(cutoff.getDate() - 30);
  orders.forEach((o) => {
    const d = new Date(o.created_at);
    if (d >= cutoff) {
      const label = d.toLocaleDateString("en-US", { month: "short", day: "numeric" });
      if (map[label]) {
        map[label].revenue += o.total;
        map[label].orders += 1;
      }
    }
  });
  return Object.values(map);
}

function buildLast7Days(orders: Order[]): DayPoint[] {
  const map: Record<string, DayPoint> = {};
  for (let i = 6; i >= 0; i--) {
    const label = getDayLabel(i);
    map[label] = { date: label, revenue: 0, orders: 0 };
  }
  const cutoff = new Date();
  cutoff.setDate(cutoff.getDate() - 7);
  orders.forEach((o) => {
    const d = new Date(o.created_at);
    if (d >= cutoff) {
      const label = d.toLocaleDateString("en-US", { month: "short", day: "numeric" });
      if (map[label]) {
        map[label].revenue += o.total;
        map[label].orders += 1;
      }
    }
  });
  return Object.values(map);
}

function buildSparkline(orders: Order[], metric: "revenue" | "orders"): SparkPoint[] {
  return buildLast7Days(orders).map((d) => ({ v: metric === "revenue" ? d.revenue : d.orders }));
}

// в"Ђв"Ђв"Ђ Sub-components в"Ђв"Ђв"Ђв"Ђв"Ђв"Ђв"Ђв"Ђв"Ђв"Ђв"Ђв"Ђв"Ђв"Ђв"Ђв"Ђв"Ђв"Ђв"Ђв"Ђв"Ђв"Ђв"Ђв"Ђв"Ђв"Ђв"Ђв"Ђв"Ђв"Ђв"Ђв"Ђв"Ђв"Ђв"Ђв"Ђв"Ђв"Ђв"Ђв"Ђв"Ђв"Ђв"Ђв"Ђв"Ђв"Ђв"Ђв"Ђв"Ђв"Ђв"Ђв"Ђв"Ђв"Ђв"Ђв"Ђв"Ђв"Ђ

const STATUS_COLORS: Record<string, string> = {
  pending: "#f59e0b",
  processing: "#3b82f6",
  shipped: "#8b5cf6",
  delivered: "#10b981",
  cancelled: "#ef4444",
};

const CHART_TOOLTIP_STYLE = {
  contentStyle: {
    background: "#080808",
    border: "1px solid rgba(255,255,255,0.1)",
    borderRadius: "12px",
    fontFamily: "Gilroy",
    fontSize: 12,
  },
  labelStyle: { color: "rgba(255,255,255,0.6)" },
};

function Sparkline({ data }: { data: SparkPoint[] }) {
  return (
    <ResponsiveContainer width="100%" height={40}>
      <AreaChart data={data} margin={{ top: 4, right: 0, left: 0, bottom: 0 }}>
        <defs>
          <linearGradient id="sparkGrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#3b82f6" stopOpacity={0.3} />
            <stop offset="100%" stopColor="#3b82f6" stopOpacity={0} />
          </linearGradient>
        </defs>
        <Area
          type="monotone"
          dataKey="v"
          stroke="#3b82f6"
          strokeWidth={1.5}
          fill="url(#sparkGrad)"
          dot={false}
        />
      </AreaChart>
    </ResponsiveContainer>
  );
}

interface MetricCardProps {
  title: string;
  value: string;
  icon: React.ReactNode;
  spark: SparkPoint[];
  change: { pct: number; up: boolean };
}

function MetricCard({ title, value, icon, spark, change }: MetricCardProps) {
  return (
    <div className="bg-white/5 border border-white/10 rounded-xl flex flex-col overflow-hidden">
      <div className="px-5 pt-5 pb-3 flex items-start justify-between gap-3">
        <div>
          <p className="font-gilroy text-small text-white/40 uppercase tracking-wider mb-2">
            {title}
          </p>
          <p className="font-gilroy font-bold text-h3 text-white leading-tight">{value}</p>
          <div className="flex items-center gap-1 mt-1.5">
            {change.up ? (
              <TrendingUp className="w-3 h-3 text-green-400" />
            ) : (
              <TrendingDown className="w-3 h-3 text-red-400" />
            )}
            <span
              className={`font-gilroy text-xs font-semibold ${
                change.up ? "text-green-400" : "text-red-400"
              }`}
            >
              {change.pct.toFixed(1)}%
            </span>
            <span className="font-gilroy text-xs text-white/25">vs last week</span>
          </div>
        </div>
        <div className="w-10 h-10 rounded-full bg-brand-primary/15 flex items-center justify-center shrink-0">
          {icon}
        </div>
      </div>
      <div className="mt-auto">
        <Sparkline data={spark} />
      </div>
    </div>
  );
}

interface OrderTimelineProps {
  status: string;
}

const TIMELINE_STEPS = ["pending", "processing", "shipped", "delivered"];

function OrderTimeline({ status }: OrderTimelineProps) {
  const currentIdx = TIMELINE_STEPS.indexOf(status);
  return (
    <div className="flex items-center gap-0">
      {TIMELINE_STEPS.map((step, idx) => {
        const reached = idx <= currentIdx;
        return (
          <div key={step} className="flex items-center gap-0 flex-1 last:flex-none">
            <div className="flex flex-col items-center gap-1">
              <div
                className={`w-3 h-3 rounded-full border-2 transition-colors ${
                  reached
                    ? "bg-green-500 border-green-500"
                    : "bg-transparent border-white/20"
                }`}
              />
              <span className="font-gilroy text-xs text-white/40 capitalize">{step}</span>
            </div>
            {idx < TIMELINE_STEPS.length - 1 && (
              <div
                className={`flex-1 h-px mb-5 transition-colors ${
                  idx < currentIdx ? "bg-green-500/60" : "bg-white/10"
                }`}
              />
            )}
          </div>
        );
      })}
    </div>
  );
}

// в"Ђв"Ђв"Ђ Main Page в"Ђв"Ђв"Ђв"Ђв"Ђв"Ђв"Ђв"Ђв"Ђв"Ђв"Ђв"Ђв"Ђв"Ђв"Ђв"Ђв"Ђв"Ђв"Ђв"Ђв"Ђв"Ђв"Ђв"Ђв"Ђв"Ђв"Ђв"Ђв"Ђв"Ђв"Ђв"Ђв"Ђв"Ђв"Ђв"Ђв"Ђв"Ђв"Ђв"Ђв"Ђв"Ђв"Ђв"Ђв"Ђв"Ђв"Ђв"Ђв"Ђв"Ђв"Ђв"Ђв"Ђв"Ђв"Ђв"Ђв"Ђв"Ђв"Ђв"Ђв"Ђв"Ђв"Ђв"Ђ

export default function AdminDashboardPage() {
  const { toast } = useToast();

  const [orders, setOrders] = useState<Order[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [orderItems, setOrderItems] = useState<OrderItemRaw[]>([]);
  const [customerCount, setCustomerCount] = useState(0);
  const [profiles, setProfiles] = useState<Profile[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [secondsAgo, setSecondsAgo] = useState(0);
  const [lastUpdatedAt, setLastUpdatedAt] = useState<Date>(new Date());

  // SlideOver state
  const [slideOpen, setSlideOpen] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [selectedOrderItems, setSelectedOrderItems] = useState<OrderItemRaw[]>([]);
  const [statusUpdating, setStatusUpdating] = useState(false);

  // в"Ђв"Ђ Data loading в"Ђв"Ђв"Ђв"Ђв"Ђв"Ђв"Ђв"Ђв"Ђв"Ђв"Ђв"Ђв"Ђв"Ђв"Ђв"Ђв"Ђв"Ђв"Ђв"Ђв"Ђв"Ђв"Ђв"Ђв"Ђв"Ђв"Ђв"Ђв"Ђв"Ђв"Ђв"Ђв"Ђв"Ђв"Ђв"Ђв"Ђв"Ђв"Ђв"Ђв"Ђв"Ђв"Ђв"Ђв"Ђв"Ђв"Ђв"Ђв"Ђв"Ђв"Ђв"Ђв"Ђв"Ђв"Ђв"Ђв"Ђв"Ђв"Ђв"Ђ

  const loadData = useCallback(async (silent = false) => {
    const supabase = createClient();
    if (!silent) setLoading(true);

    try {
      const [
        { data: ordersData },
        { data: productsData },
        { data: itemsData },
        { count: custCount },
      ] = await Promise.all([
        supabase.from("orders").select("*").order("created_at", { ascending: false }),
        supabase.from("products").select("id, name, category, image_url, stock"),
        supabase
          .from("order_items")
          .select("quantity, price, products(id, name, category, image_url, stock)"),
        supabase
          .from("profiles")
          .select("*", { count: "exact", head: true })
          .eq("role", "customer"),
      ]);

      const fetchedOrders: Order[] = ordersData ?? [];
      const fetchedProducts: Product[] = (productsData as Product[]) ?? [];
      const fetchedItems: OrderItemRaw[] = (itemsData as unknown as OrderItemRaw[]) ?? [];

      // Fetch profiles for recent order customers
      const recentOrders = fetchedOrders.slice(0, 10);
      const customerIds = Array.from(new Set(recentOrders.map((o) => o.customer_id)));
      let fetchedProfiles: Profile[] = [];
      if (customerIds.length > 0) {
        const { data: profilesData } = await supabase
          .from("profiles")
          .select("id, username, role")
          .in("id", customerIds);
        fetchedProfiles = (profilesData as Profile[]) ?? [];
      }

      setOrders(fetchedOrders);
      setProducts(fetchedProducts);
      setOrderItems(fetchedItems);
      setCustomerCount(custCount ?? 0);
      setProfiles(fetchedProfiles);
      setLastUpdatedAt(new Date());
      setSecondsAgo(0);
    } catch (err) {
      console.error("Dashboard load error:", err);
      toast({ title: "Failed to load dashboard data", variant: "error" });
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [toast]);

  const handleRefresh = useCallback(async () => {
    setRefreshing(true);
    await loadData(true);
  }, [loadData]);

  // в"Ђв"Ђ Initial load в"Ђв"Ђв"Ђв"Ђв"Ђв"Ђв"Ђв"Ђв"Ђв"Ђв"Ђв"Ђв"Ђв"Ђв"Ђв"Ђв"Ђв"Ђв"Ђв"Ђв"Ђв"Ђв"Ђв"Ђв"Ђв"Ђв"Ђв"Ђв"Ђв"Ђв"Ђв"Ђв"Ђв"Ђв"Ђв"Ђв"Ђв"Ђв"Ђв"Ђв"Ђв"Ђв"Ђв"Ђв"Ђв"Ђв"Ђв"Ђв"Ђв"Ђв"Ђв"Ђв"Ђв"Ђв"Ђв"Ђв"Ђв"Ђв"Ђв"Ђ

  useEffect(() => {
    loadData();
  }, [loadData]);

  // в"Ђв"Ђ Auto-refresh every 30s в"Ђв"Ђв"Ђв"Ђв"Ђв"Ђв"Ђв"Ђв"Ђв"Ђв"Ђв"Ђв"Ђв"Ђв"Ђв"Ђв"Ђв"Ђв"Ђв"Ђв"Ђв"Ђв"Ђв"Ђв"Ђв"Ђв"Ђв"Ђв"Ђв"Ђв"Ђв"Ђв"Ђв"Ђв"Ђв"Ђв"Ђв"Ђв"Ђв"Ђв"Ђв"Ђв"Ђв"Ђв"Ђв"Ђв"Ђв"Ђв"Ђв"Ђ

  useEffect(() => {
    const interval = setInterval(() => {
      loadData(true);
    }, 30_000);
    return () => clearInterval(interval);
  }, [loadData]);

  // в"Ђв"Ђ Seconds-ago counter в"Ђв"Ђв"Ђв"Ђв"Ђв"Ђв"Ђв"Ђв"Ђв"Ђв"Ђв"Ђв"Ђв"Ђв"Ђв"Ђв"Ђв"Ђв"Ђв"Ђв"Ђв"Ђв"Ђв"Ђв"Ђв"Ђв"Ђв"Ђв"Ђв"Ђв"Ђв"Ђв"Ђв"Ђв"Ђв"Ђв"Ђв"Ђв"Ђв"Ђв"Ђв"Ђв"Ђв"Ђв"Ђв"Ђв"Ђв"Ђв"Ђв"Ђв"Ђв"Ђв"Ђ

  useEffect(() => {
    const timer = setInterval(() => {
      setSecondsAgo(Math.floor((Date.now() - lastUpdatedAt.getTime()) / 1000));
    }, 1000);
    return () => clearInterval(timer);
  }, [lastUpdatedAt]);

  // в"Ђв"Ђ Realtime subscription в"Ђв"Ђв"Ђв"Ђв"Ђв"Ђв"Ђв"Ђв"Ђв"Ђв"Ђв"Ђв"Ђв"Ђв"Ђв"Ђв"Ђв"Ђв"Ђв"Ђв"Ђв"Ђв"Ђв"Ђв"Ђв"Ђв"Ђв"Ђв"Ђв"Ђв"Ђв"Ђв"Ђв"Ђв"Ђв"Ђв"Ђв"Ђв"Ђв"Ђв"Ђв"Ђв"Ђв"Ђв"Ђв"Ђв"Ђв"Ђв"Ђв"Ђв"Ђ

  useEffect(() => {
    const supabase = createClient();
    const channel = supabase
      .channel("dashboard-orders-rt")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "orders" },
        (payload) => {
          if (payload.eventType === "INSERT") {
            setOrders((prev) => [payload.new as Order, ...prev]);
          } else if (payload.eventType === "UPDATE") {
            setOrders((prev) =>
              prev.map((o) =>
                o.id === (payload.new as Order).id ? (payload.new as Order) : o
              )
            );
          }
        }
      )
      .subscribe();
    return () => { supabase.removeChannel(channel); };
  }, []);

  // в"Ђв"Ђ Derived metrics в"Ђв"Ђв"Ђв"Ђв"Ђв"Ђв"Ђв"Ђв"Ђв"Ђв"Ђв"Ђв"Ђв"Ђв"Ђв"Ђв"Ђв"Ђв"Ђв"Ђв"Ђв"Ђв"Ђв"Ђв"Ђв"Ђв"Ђв"Ђв"Ђв"Ђв"Ђв"Ђв"Ђв"Ђв"Ђв"Ђв"Ђв"Ђв"Ђв"Ђв"Ђв"Ђв"Ђв"Ђв"Ђв"Ђв"Ђв"Ђв"Ђв"Ђв"Ђв"Ђв"Ђв"Ђв"Ђв"Ђв"Ђ

  const now = new Date();
  const thisWeekCutoff = new Date(now);
  thisWeekCutoff.setDate(now.getDate() - 7);
  const lastWeekCutoff = new Date(now);
  lastWeekCutoff.setDate(now.getDate() - 14);

  const thisWeekOrders = orders.filter((o) => new Date(o.created_at) >= thisWeekCutoff);
  const lastWeekOrders = orders.filter(
    (o) =>
      new Date(o.created_at) >= lastWeekCutoff &&
      new Date(o.created_at) < thisWeekCutoff
  );

  const totalRevenue = orders.reduce((s, o) => s + o.total, 0);
  const thisWeekRevenue = thisWeekOrders.reduce((s, o) => s + o.total, 0);
  const lastWeekRevenue = lastWeekOrders.reduce((s, o) => s + o.total, 0);

  const pendingOrders = orders.filter((o) => o.status === "pending");
  const deliveredOrders = orders.filter((o) => o.status === "delivered");
  const lowStockProducts = products.filter((p) => p.stock < 5);

  const avgOrderValue = orders.length > 0 ? totalRevenue / orders.length : 0;
  const thisWeekAvg =
    thisWeekOrders.length > 0
      ? thisWeekOrders.reduce((s, o) => s + o.total, 0) / thisWeekOrders.length
      : 0;
  const lastWeekAvg =
    lastWeekOrders.length > 0
      ? lastWeekOrders.reduce((s, o) => s + o.total, 0) / lastWeekOrders.length
      : 0;

  // в"Ђв"Ђ Chart data в"Ђв"Ђв"Ђв"Ђв"Ђв"Ђв"Ђв"Ђв"Ђв"Ђв"Ђв"Ђв"Ђв"Ђв"Ђв"Ђв"Ђв"Ђв"Ђв"Ђв"Ђв"Ђв"Ђв"Ђв"Ђв"Ђв"Ђв"Ђв"Ђв"Ђв"Ђв"Ђв"Ђв"Ђв"Ђв"Ђв"Ђв"Ђв"Ђв"Ђв"Ђв"Ђв"Ђв"Ђв"Ђв"Ђв"Ђв"Ђв"Ђв"Ђв"Ђв"Ђв"Ђв"Ђв"Ђв"Ђв"Ђв"Ђв"Ђв"Ђв"Ђв"Ђв"Ђ

  const last30Days = buildLast30Days(orders);
  const last7Days = buildLast7Days(orders);

  // Status distribution
  const statusDistribution = Object.entries(
    orders.reduce<Record<string, number>>((acc, o) => {
      acc[o.status] = (acc[o.status] ?? 0) + 1;
      return acc;
    }, {})
  ).map(([name, value]) => ({ name, value }));

  // Category sales
  const categoryMap: Record<string, number> = {};
  orderItems.forEach((item) => {
    const cat = item.products?.category ?? "Other";
    categoryMap[cat] = (categoryMap[cat] ?? 0) + item.quantity;
  });
  const categorySales = Object.entries(categoryMap)
    .sort((a, b) => b[1] - a[1])
    .map(([category, units]) => ({ category, units }));

  // в"Ђв"Ђ Top products в"Ђв"Ђв"Ђв"Ђв"Ђв"Ђв"Ђв"Ђв"Ђв"Ђв"Ђв"Ђв"Ђв"Ђв"Ђв"Ђв"Ђв"Ђв"Ђв"Ђв"Ђв"Ђв"Ђв"Ђв"Ђв"Ђв"Ђв"Ђв"Ђв"Ђв"Ђв"Ђв"Ђв"Ђв"Ђв"Ђв"Ђв"Ђв"Ђв"Ђв"Ђв"Ђв"Ђв"Ђв"Ђв"Ђв"Ђв"Ђв"Ђв"Ђв"Ђв"Ђв"Ђв"Ђв"Ђв"Ђв"Ђв"Ђв"Ђв"Ђв"Ђ

  const productSalesMap: Record<
    string,
    { unitsSold: number; revenue: number; product: OrderItemRaw["products"] }
  > = {};
  orderItems.forEach((item) => {
    if (!item.products) return;
    const pid = item.products.id;
    if (!productSalesMap[pid]) {
      productSalesMap[pid] = { unitsSold: 0, revenue: 0, product: item.products };
    }
    productSalesMap[pid].unitsSold += item.quantity;
    productSalesMap[pid].revenue += item.price * item.quantity;
  });

  const topProducts: TopProduct[] = Object.values(productSalesMap)
    .sort((a, b) => b.unitsSold - a.unitsSold)
    .slice(0, 5)
    .map((entry) => ({
      id: entry.product!.id,
      name: entry.product!.name,
      category: entry.product!.category,
      image_url: entry.product!.image_url,
      stock: entry.product!.stock,
      unitsSold: entry.unitsSold,
      revenue: entry.revenue,
    }));

  // в"Ђв"Ђ Profile lookup в"Ђв"Ђв"Ђв"Ђв"Ђв"Ђв"Ђв"Ђв"Ђв"Ђв"Ђв"Ђв"Ђв"Ђв"Ђв"Ђв"Ђв"Ђв"Ђв"Ђв"Ђв"Ђв"Ђв"Ђв"Ђв"Ђв"Ђв"Ђв"Ђв"Ђв"Ђв"Ђв"Ђв"Ђв"Ђв"Ђв"Ђв"Ђв"Ђв"Ђв"Ђв"Ђв"Ђв"Ђв"Ђв"Ђв"Ђв"Ђв"Ђв"Ђв"Ђв"Ђв"Ђв"Ђв"Ђв"Ђв"Ђв"Ђв"Ђ

  const profileMap = new Map<string, Profile>(profiles.map((p) => [p.id, p]));

  function getCustomerName(customerId: string): string {
    const profile = profileMap.get(customerId);
    return profile?.username ?? `Customer #${customerId.slice(0, 6).toUpperCase()}`;
  }

  // в"Ђв"Ђ Status update в"Ђв"Ђв"Ђв"Ђв"Ђв"Ђв"Ђв"Ђв"Ђв"Ђв"Ђв"Ђв"Ђв"Ђв"Ђв"Ђв"Ђв"Ђв"Ђв"Ђв"Ђв"Ђв"Ђв"Ђв"Ђв"Ђв"Ђв"Ђв"Ђв"Ђв"Ђв"Ђв"Ђв"Ђв"Ђв"Ђв"Ђв"Ђв"Ђв"Ђв"Ђв"Ђв"Ђв"Ђв"Ђв"Ђв"Ђв"Ђв"Ђв"Ђв"Ђв"Ђв"Ђв"Ђв"Ђв"Ђв"Ђв"Ђв"Ђв"Ђ

  async function handleStatusChange(orderId: string, newStatus: string) {
    setStatusUpdating(true);
    const supabase = createClient();
    const { error } = await supabase
      .from("orders")
      .update({ status: newStatus })
      .eq("id", orderId);

    if (error) {
      toast({ title: "Failed to update order status", variant: "error" });
    } else {
      toast({ title: "Order status updated", variant: "success" });
      setOrders((prev) =>
        prev.map((o) => (o.id === orderId ? { ...o, status: newStatus } : o))
      );
      if (selectedOrder?.id === orderId) {
        setSelectedOrder((prev) => (prev ? { ...prev, status: newStatus } : prev));
      }
    }
    setStatusUpdating(false);
  }

  function openOrderDetail(order: Order) {
    setSelectedOrder(order);
    setSelectedOrderItems(orderItems.slice(0, 5)); // fallback: show first items
    setSlideOpen(true);
  }

  // в"Ђв"Ђ Loading skeleton в"Ђв"Ђв"Ђв"Ђв"Ђв"Ђв"Ђв"Ђв"Ђв"Ђв"Ђв"Ђв"Ђв"Ђв"Ђв"Ђв"Ђв"Ђв"Ђв"Ђв"Ђв"Ђв"Ђв"Ђв"Ђв"Ђв"Ђв"Ђв"Ђв"Ђв"Ђв"Ђв"Ђв"Ђв"Ђв"Ђв"Ђв"Ђв"Ђв"Ђв"Ђв"Ђв"Ђв"Ђв"Ђв"Ђв"Ђв"Ђв"Ђв"Ђв"Ђв"Ђв"Ђв"Ђв"Ђв"Ђв"Ђв"Ђ

  if (loading) {
    return (
      <div className="p-6 lg:p-8 space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <Skeleton className="w-40 h-8 rounded-lg" />
            <Skeleton className="w-48 h-4 rounded mt-2" />
          </div>
          <Skeleton className="w-28 h-9 rounded-lg" />
        </div>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <SkeletonCard key={i} />
          ))}
        </div>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <SkeletonCard key={i} />
          ))}
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Skeleton className="h-64 rounded-xl" />
          <Skeleton className="h-64 rounded-xl" />
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Skeleton className="h-64 rounded-xl" />
          <Skeleton className="h-64 rounded-xl" />
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            <Skeleton className="h-80 rounded-xl" />
          </div>
          <Skeleton className="h-80 rounded-xl" />
        </div>
      </div>
    );
  }

  // в"Ђв"Ђ Metric cards config в"Ђв"Ђв"Ђв"Ђв"Ђв"Ђв"Ђв"Ђв"Ђв"Ђв"Ђв"Ђв"Ђв"Ђв"Ђв"Ђв"Ђв"Ђв"Ђв"Ђв"Ђв"Ђв"Ђв"Ђв"Ђв"Ђв"Ђв"Ђв"Ђв"Ђв"Ђв"Ђв"Ђв"Ђв"Ђв"Ђв"Ђв"Ђв"Ђв"Ђв"Ђв"Ђв"Ђв"Ђв"Ђв"Ђв"Ђв"Ђв"Ђв"Ђв"Ђв"Ђв"Ђв"Ђв"Ђ

  const revenueChange = calcChange(thisWeekRevenue, lastWeekRevenue);
  const ordersChange = calcChange(thisWeekOrders.length, lastWeekOrders.length);
  const pendingChange = calcChange(
    thisWeekOrders.filter((o) => o.status === "pending").length,
    lastWeekOrders.filter((o) => o.status === "pending").length
  );
  const deliveredChange = calcChange(
    thisWeekOrders.filter((o) => o.status === "delivered").length,
    lastWeekOrders.filter((o) => o.status === "delivered").length
  );
  const avgChange = calcChange(thisWeekAvg, lastWeekAvg);

  // в"Ђв"Ђ Render в"Ђв"Ђв"Ђв"Ђв"Ђв"Ђв"Ђв"Ђв"Ђв"Ђв"Ђв"Ђв"Ђв"Ђв"Ђв"Ђв"Ђв"Ђв"Ђв"Ђв"Ђв"Ђв"Ђв"Ђв"Ђв"Ђв"Ђв"Ђв"Ђв"Ђв"Ђв"Ђв"Ђв"Ђв"Ђв"Ђв"Ђв"Ђв"Ђв"Ђв"Ђв"Ђв"Ђв"Ђв"Ђв"Ђв"Ђв"Ђв"Ђв"Ђв"Ђв"Ђв"Ђв"Ђв"Ђв"Ђв"Ђв"Ђв"Ђв"Ђв"Ђв"Ђв"Ђв"Ђв"Ђв"Ђв"Ђв"Ђ

  return (
    <div className="p-6 lg:p-8 space-y-6">
      {/* Page header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-gilroy font-bold text-h2 text-white">Dashboard</h1>
          <p className="font-gilroy text-small text-white/40 mt-1">Real-time store overview</p>
        </div>
        <div className="flex items-center gap-3">
          <span className="font-gilroy text-xs text-white/30">
            Last updated: {secondsAgo}s ago
          </span>
          <Button variant="outline" size="sm" onClick={handleRefresh} disabled={refreshing}>
            <RefreshCw className={`w-3.5 h-3.5 ${refreshing ? "animate-spin" : ""}`} />
            Refresh
          </Button>
        </div>
      </div>

      {/* Metric cards row 1 */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <MetricCard
          title="Total Revenue"
          value={`$${totalRevenue.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`}
          icon={<DollarSign className="w-4 h-4 text-brand-primary" />}
          spark={buildSparkline(orders, "revenue")}
          change={revenueChange}
        />
        <MetricCard
          title="Total Orders"
          value={orders.length.toString()}
          icon={<ShoppingBag className="w-4 h-4 text-brand-primary" />}
          spark={buildSparkline(orders, "orders")}
          change={ordersChange}
        />
        <MetricCard
          title="Pending Orders"
          value={pendingOrders.length.toString()}
          icon={<Clock className="w-4 h-4 text-brand-primary" />}
          spark={buildLast7Days(orders)
            .map((d) => ({
              v: orders.filter(
                (o) =>
                  o.status === "pending" &&
                  formatDate(o.created_at) === d.date
              ).length,
            }))}
          change={pendingChange}
        />
        <MetricCard
          title="Delivered"
          value={deliveredOrders.length.toString()}
          icon={<CheckCircle className="w-4 h-4 text-brand-primary" />}
          spark={buildLast7Days(orders).map((d) => ({
            v: orders.filter(
              (o) =>
                o.status === "delivered" &&
                formatDate(o.created_at) === d.date
            ).length,
          }))}
          change={deliveredChange}
        />
      </div>

      {/* Metric cards row 2 */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <MetricCard
          title="Total Customers"
          value={customerCount.toString()}
          icon={<Users className="w-4 h-4 text-brand-primary" />}
          spark={Array.from({ length: 7 }, (_, i) => ({ v: Math.max(0, customerCount - i * 2) }))}
          change={{ pct: 0, up: true }}
        />
        <MetricCard
          title="Total Products"
          value={products.length.toString()}
          icon={<Package className="w-4 h-4 text-brand-primary" />}
          spark={Array.from({ length: 7 }, () => ({ v: products.length }))}
          change={{ pct: 0, up: true }}
        />
        <MetricCard
          title="Low Stock"
          value={lowStockProducts.length.toString()}
          icon={<AlertTriangle className="w-4 h-4 text-brand-primary" />}
          spark={Array.from({ length: 7 }, () => ({ v: lowStockProducts.length }))}
          change={{ pct: 0, up: false }}
        />
        <MetricCard
          title="Avg Order Value"
          value={`$${avgOrderValue.toFixed(2)}`}
          icon={<TrendingUp className="w-4 h-4 text-brand-primary" />}
          spark={buildLast7Days(orders).map((d) => {
            const dayOrds = orders.filter((o) => formatDate(o.created_at) === d.date);
            const avg =
              dayOrds.length > 0
                ? dayOrds.reduce((s, o) => s + o.total, 0) / dayOrds.length
                : 0;
            return { v: avg };
          })}
          change={avgChange}
        />
      </div>

      {/* Charts row 1 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Revenue chart */}
        <div className="bg-white/5 border border-white/10 rounded-xl">
          <div className="px-6 py-4 border-b border-white/[0.07] flex items-center justify-between">
            <h2 className="font-gilroy font-semibold text-body text-white">Revenue (Last 30 Days)</h2>
            <span className="font-gilroy text-xs text-white/40">Daily</span>
          </div>
          <div className="p-6">
            <ResponsiveContainer width="100%" height={220}>
              <AreaChart data={last30Days} margin={{ top: 4, right: 4, left: -16, bottom: 0 }}>
                <defs>
                  <linearGradient id="revenueGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#3b82f6" stopOpacity={0.35} />
                    <stop offset="100%" stopColor="#3b82f6" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid stroke="rgba(255,255,255,0.05)" strokeDasharray="3 3" />
                <XAxis
                  dataKey="date"
                  tick={{ fill: "rgba(255,255,255,0.4)", fontSize: 11, fontFamily: "Gilroy" }}
                  tickLine={false}
                  axisLine={false}
                  interval={4}
                />
                <YAxis
                  tick={{ fill: "rgba(255,255,255,0.4)", fontSize: 11, fontFamily: "Gilroy" }}
                  tickLine={false}
                  axisLine={false}
                  tickFormatter={(v) => `$${v}`}
                />
                <Tooltip
                  {...CHART_TOOLTIP_STYLE}
                  formatter={(value: unknown) => [`$${Number(value ?? 0).toFixed(2)}`, "Revenue"]}
                />
                <Area
                  type="monotone"
                  dataKey="revenue"
                  stroke="#3b82f6"
                  strokeWidth={2}
                  fill="url(#revenueGrad)"
                  dot={false}
                  activeDot={{ r: 4, fill: "#3b82f6" }}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Orders by status donut */}
        <div className="bg-white/5 border border-white/10 rounded-xl">
          <div className="px-6 py-4 border-b border-white/[0.07] flex items-center justify-between">
            <h2 className="font-gilroy font-semibold text-body text-white">Orders by Status</h2>
            <span className="font-gilroy text-xs text-white/40">{orders.length} total</span>
          </div>
          <div className="p-6">
            <ResponsiveContainer width="100%" height={220}>
              <PieChart>
                <Pie
                  data={statusDistribution}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={90}
                  paddingAngle={3}
                  dataKey="value"
                >
                  {statusDistribution.map((entry) => (
                    <Cell
                      key={entry.name}
                      fill={STATUS_COLORS[entry.name] ?? "#64748b"}
                    />
                  ))}
                </Pie>
                <Tooltip
                  {...CHART_TOOLTIP_STYLE}
                  formatter={(value: unknown, name: unknown) => [
                    `${Number(value ?? 0)} orders`,
                    String(name).charAt(0).toUpperCase() + String(name).slice(1),
                  ]}
                />
                <Legend
                  iconType="circle"
                  iconSize={8}
                  formatter={(value: string) => {
                    const count =
                      statusDistribution.find((d) => d.name === value)?.value ?? 0;
                    return (
                      <span
                        style={{
                          fontFamily: "Gilroy",
                          fontSize: 12,
                          color: "rgba(255,255,255,0.6)",
                        }}
                      >
                        {value.charAt(0).toUpperCase() + value.slice(1)} ({count})
                      </span>
                    );
                  }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Charts row 2 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Category bar */}
        <div className="bg-white/5 border border-white/10 rounded-xl">
          <div className="px-6 py-4 border-b border-white/[0.07] flex items-center justify-between">
            <h2 className="font-gilroy font-semibold text-body text-white">Sales by Category</h2>
            <span className="font-gilroy text-xs text-white/40">Units sold</span>
          </div>
          <div className="p-6">
            <ResponsiveContainer width="100%" height={200}>
              <BarChart
                data={categorySales}
                layout="vertical"
                margin={{ top: 0, right: 16, left: 16, bottom: 0 }}
              >
                <CartesianGrid stroke="rgba(255,255,255,0.05)" horizontal={false} />
                <XAxis
                  type="number"
                  tick={{ fill: "rgba(255,255,255,0.4)", fontSize: 11, fontFamily: "Gilroy" }}
                  tickLine={false}
                  axisLine={false}
                />
                <YAxis
                  dataKey="category"
                  type="category"
                  width={80}
                  tick={{ fill: "rgba(255,255,255,0.4)", fontSize: 11, fontFamily: "Gilroy" }}
                  tickLine={false}
                  axisLine={false}
                />
                <Tooltip
                  {...CHART_TOOLTIP_STYLE}
                  formatter={(value: unknown) => [`${Number(value ?? 0)} units`, "Sold"]}
                />
                <Bar
                  dataKey="units"
                  fill="#3b82f6"
                  radius={[0, 4, 4, 0]}
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Revenue vs Orders (last 7 days) */}
        <div className="bg-white/5 border border-white/10 rounded-xl">
          <div className="px-6 py-4 border-b border-white/[0.07] flex items-center justify-between">
            <h2 className="font-gilroy font-semibold text-body text-white">Revenue vs Orders</h2>
            <span className="font-gilroy text-xs text-white/40">Last 7 days</span>
          </div>
          <div className="p-6">
            <ResponsiveContainer width="100%" height={200}>
              <ComposedChart
                data={last7Days}
                margin={{ top: 4, right: 4, left: -16, bottom: 0 }}
              >
                <CartesianGrid stroke="rgba(255,255,255,0.05)" strokeDasharray="3 3" />
                <XAxis
                  dataKey="date"
                  tick={{ fill: "rgba(255,255,255,0.4)", fontSize: 11, fontFamily: "Gilroy" }}
                  tickLine={false}
                  axisLine={false}
                />
                <YAxis
                  yAxisId="rev"
                  tick={{ fill: "rgba(255,255,255,0.4)", fontSize: 11, fontFamily: "Gilroy" }}
                  tickLine={false}
                  axisLine={false}
                  tickFormatter={(v) => `$${v}`}
                />
                <YAxis
                  yAxisId="ord"
                  orientation="right"
                  tick={{ fill: "rgba(255,255,255,0.4)", fontSize: 11, fontFamily: "Gilroy" }}
                  tickLine={false}
                  axisLine={false}
                  allowDecimals={false}
                />
                <Tooltip
                  {...CHART_TOOLTIP_STYLE}
                  formatter={(value: unknown, name: unknown) =>
                    name === "revenue"
                      ? [`$${Number(value ?? 0).toFixed(2)}`, "Revenue"]
                      : [Number(value ?? 0), "Orders"]
                  }
                />
                <Bar
                  yAxisId="ord"
                  dataKey="orders"
                  fill="#10b981"
                  opacity={0.6}
                  radius={[3, 3, 0, 0]}
                  barSize={18}
                />
                <Line
                  yAxisId="rev"
                  type="monotone"
                  dataKey="revenue"
                  stroke="#3b82f6"
                  strokeWidth={2}
                  dot={{ r: 3, fill: "#3b82f6" }}
                  activeDot={{ r: 5 }}
                />
              </ComposedChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Recent orders + Top products */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent orders table */}
        <div className="lg:col-span-2 bg-white/5 border border-white/10 rounded-xl">
          <div className="px-6 py-4 border-b border-white/[0.07] flex items-center justify-between">
            <h2 className="font-gilroy font-semibold text-body text-white">Recent Orders</h2>
            <span className="font-gilroy text-xs text-white/40">Latest 5</span>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full font-gilroy text-small">
              <thead>
                <tr className="border-b border-white/[0.07]">
                  {["Order ID", "Customer", "Total", "Status", "Date", "Actions"].map((h) => (
                    <th
                      key={h}
                      className="px-5 py-3 text-left font-gilroy text-xs text-white/40 uppercase tracking-wider font-semibold"
                    >
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {orders.slice(0, 5).map((order) => (
                  <tr
                    key={order.id}
                    className="border-b border-white/[0.05] hover:bg-white/[0.03] transition-colors"
                  >
                    <td className="px-5 py-3.5 font-semibold text-brand-primary">
                      #{order.id.slice(0, 8).toUpperCase()}
                    </td>
                    <td className="px-5 py-3.5 text-white/60">
                      {getCustomerName(order.customer_id)}
                    </td>
                    <td className="px-5 py-3.5 font-semibold text-white">
                      ${order.total.toFixed(2)}
                    </td>
                    <td className="px-5 py-3.5">
                      <StatusBadge status={order.status} size="sm" />
                    </td>
                    <td className="px-5 py-3.5 text-white/40 text-xs">
                      {formatDate(order.created_at)}
                    </td>
                    <td className="px-5 py-3.5">
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => openOrderDetail(order)}
                          className="font-gilroy text-xs text-brand-primary hover:text-white transition-colors font-semibold"
                        >
                          View
                        </button>
                        <StatusSelect
                          value={order.status}
                          onChange={(v) => handleStatusChange(order.id, v)}
                          compact
                          disabled={statusUpdating}
                        />
                      </div>
                    </td>
                  </tr>
                ))}
                {orders.length === 0 && (
                  <tr>
                    <td
                      colSpan={6}
                      className="px-5 py-10 text-center font-gilroy text-small text-white/25"
                    >
                      No orders yet
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Top products */}
        <div className="bg-white/5 border border-white/10 rounded-xl">
          <div className="px-6 py-4 border-b border-white/[0.07] flex items-center justify-between">
            <h2 className="font-gilroy font-semibold text-body text-white">Top Products</h2>
            <span className="font-gilroy text-xs text-white/40">By units sold</span>
          </div>
          <div className="p-4 space-y-2">
            {topProducts.length === 0 && (
              <p className="font-gilroy text-small text-white/25 text-center py-8">
                No data yet
              </p>
            )}
            {topProducts.map((product, idx) => {
              const stockColor =
                product.stock > 10
                  ? "text-green-400 bg-green-400/10"
                  : product.stock >= 5
                  ? "text-yellow-400 bg-yellow-400/10"
                  : "text-red-400 bg-red-400/10";

              return (
                <div
                  key={product.id}
                  className="flex items-center gap-3 p-2.5 rounded-lg hover:bg-white/[0.04] transition-colors"
                >
                  <span className="font-gilroy text-xs text-white/25 w-4 shrink-0 text-center">
                    {idx + 1}
                  </span>
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={product.image_url || "/placeholder.png"}
                    alt={product.name}
                    className="w-10 h-10 rounded-lg object-cover shrink-0 bg-white/5"
                    onError={(e) => {
                      (e.currentTarget as HTMLImageElement).src = "/placeholder.png";
                    }}
                  />
                  <div className="flex-1 min-w-0">
                    <p className="font-gilroy text-small text-white font-medium truncate">
                      {product.name}
                    </p>
                    <p className="font-gilroy text-xs text-white/50">{product.category}</p>
                  </div>
                  <div className="flex flex-col items-end gap-1 shrink-0">
                    <span className="font-gilroy text-xs font-semibold text-white/70 bg-white/[0.08] px-2 py-0.5 rounded-full">
                      {product.unitsSold} sold
                    </span>
                    <span
                      className={`font-gilroy text-xs font-semibold px-2 py-0.5 rounded-full ${stockColor}`}
                    >
                      {product.stock} in stock
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Order detail SlideOver */}
      <SlideOver
        open={slideOpen}
        onClose={() => setSlideOpen(false)}
        title={
          selectedOrder
            ? `Order #${selectedOrder.id.slice(0, 8).toUpperCase()}`
            : "Order Details"
        }
      >
        {selectedOrder && (
          <div className="space-y-6">
            {/* Customer info */}
            <div>
              <h3 className="font-gilroy font-semibold text-small text-white/40 uppercase tracking-wider mb-3">
                Customer
              </h3>
              <div className="bg-black rounded-xl px-4 py-3">
                <p className="font-gilroy text-body text-white font-semibold">
                  {getCustomerName(selectedOrder.customer_id)}
                </p>
                <p className="font-gilroy text-xs text-white/40 mt-0.5">
                  ID: {selectedOrder.customer_id.slice(0, 16)}...
                </p>
              </div>
            </div>

            {/* Order summary */}
            <div>
              <h3 className="font-gilroy font-semibold text-small text-white/40 uppercase tracking-wider mb-3">
                Order Summary
              </h3>
              <div className="bg-black rounded-xl divide-y divide-white/[0.05]">
                <div className="px-4 py-3 flex justify-between">
                  <span className="font-gilroy text-small text-white/60">Order ID</span>
                  <span className="font-gilroy text-small text-brand-primary font-semibold">
                    #{selectedOrder.id.slice(0, 8).toUpperCase()}
                  </span>
                </div>
                <div className="px-4 py-3 flex justify-between">
                  <span className="font-gilroy text-small text-white/60">Date</span>
                  <span className="font-gilroy text-small text-white">
                    {formatDateFull(selectedOrder.created_at)}
                  </span>
                </div>
                <div className="px-4 py-3 flex justify-between">
                  <span className="font-gilroy text-small text-white/60">Total</span>
                  <span className="font-gilroy text-body text-white font-bold">
                    ${selectedOrder.total.toFixed(2)}
                  </span>
                </div>
              </div>
            </div>

            {/* Order items */}
            {selectedOrderItems.length > 0 && (
              <div>
                <h3 className="font-gilroy font-semibold text-small text-white/40 uppercase tracking-wider mb-3">
                  Items
                </h3>
                <div className="space-y-2">
                  {selectedOrderItems.map((item, idx) => (
                    <div
                      key={idx}
                      className="bg-black rounded-xl px-4 py-3 flex items-center gap-3"
                    >
                      {item.products?.image_url && (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img
                          src={item.products.image_url}
                          alt={item.products.name}
                          className="w-10 h-10 rounded-lg object-cover bg-white/5"
                        />
                      )}
                      <div className="flex-1 min-w-0">
                        <p className="font-gilroy text-small text-white font-medium truncate">
                          {item.products?.name ?? "Unknown Product"}
                        </p>
                        <p className="font-gilroy text-xs text-white/40">
                          Qty: {item.quantity} &middot; ${item.price.toFixed(2)} each
                        </p>
                      </div>
                      <span className="font-gilroy text-small text-white font-semibold shrink-0">
                        ${(item.price * item.quantity).toFixed(2)}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Order timeline */}
            <div>
              <h3 className="font-gilroy font-semibold text-small text-white/40 uppercase tracking-wider mb-4">
                Order Timeline
              </h3>
              <OrderTimeline status={selectedOrder.status} />
            </div>

            {/* Status change */}
            <div>
              <h3 className="font-gilroy font-semibold text-small text-white/40 uppercase tracking-wider mb-3">
                Update Status
              </h3>
              <StatusSelect
                value={selectedOrder.status}
                onChange={(v) => handleStatusChange(selectedOrder.id, v)}
                disabled={statusUpdating}
              />
            </div>
          </div>
        )}
      </SlideOver>
    </div>
  );
}
