"use client";
import { useEffect, useState, useMemo, useCallback } from "react";
import { createClient } from "@/lib/supabase/client";
import { Skeleton } from "@/components/admin/Skeleton";
import { EmptyState } from "@/components/admin/EmptyState";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  Legend,
} from "recharts";
import {
  BarChart2,
  TrendingUp,
  TrendingDown,
  Users,
  ShoppingBag,
  DollarSign,
  RefreshCw,
  Calendar,
} from "lucide-react";

interface Order {
  id: string;
  total: number;
  status: string;
  created_at: string;
  customer_id: string;
}

interface OrderItem {
  order_id?: string;
  quantity: number;
  price: number;
  products: { name: string; category: string } | null;
}

type DateRange = "today" | "7d" | "30d" | "90d" | "custom";

const PIE_COLORS = [
  "#3b82f6",
  "#10b981",
  "#f59e0b",
  "#8b5cf6",
  "#ef4444",
  "#06b6d4",
  "#f97316",
];

const CHART_TOOLTIP_STYLE = {
  background: "#1e293b",
  border: "1px solid rgba(255,255,255,0.1)",
  borderRadius: "12px",
  fontFamily: "Gilroy",
  fontSize: 12,
};

const CHART_LABEL_STYLE = { color: "rgba(255,255,255,0.6)" };

const TICK_STYLE = {
  fill: "rgba(255,255,255,0.4)",
  fontSize: 11,
  fontFamily: "Gilroy",
};

function getDateRange(
  range: DateRange,
  customFrom: string,
  customTo: string
): { from: Date; to: Date } {
  const now = new Date();
  const to =
    range === "custom" && customTo ? new Date(customTo + "T23:59:59") : now;
  let from: Date;
  if (range === "today") {
    from = new Date(now);
    from.setHours(0, 0, 0, 0);
  } else if (range === "7d") {
    from = new Date(now);
    from.setDate(now.getDate() - 7);
  } else if (range === "30d") {
    from = new Date(now);
    from.setDate(now.getDate() - 30);
  } else if (range === "90d") {
    from = new Date(now);
    from.setDate(now.getDate() - 90);
  } else if (range === "custom" && customFrom) {
    from = new Date(customFrom);
  } else {
    from = new Date(now);
    from.setDate(now.getDate() - 30);
  }
  return { from, to };
}

function prevPeriod(from: Date, to: Date) {
  const len = to.getTime() - from.getTime();
  return {
    from: new Date(from.getTime() - len),
    to: new Date(from.getTime() - 1),
  };
}

function groupByDay(orders: Order[]): { date: string; revenue: number }[] {
  const map: Record<string, number> = {};
  orders.forEach((o) => {
    const day = new Date(o.created_at).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
    });
    map[day] = (map[day] || 0) + o.total;
  });
  return Object.entries(map).map(([date, revenue]) => ({ date, revenue }));
}

function groupByHour(orders: Order[]): { date: string; revenue: number }[] {
  const map: Record<string, number> = {};
  orders.forEach((o) => {
    const hour = new Date(o.created_at).toLocaleString("en-US", {
      hour: "numeric",
      hour12: true,
    });
    map[hour] = (map[hour] || 0) + o.total;
  });
  return Object.entries(map).map(([date, revenue]) => ({ date, revenue }));
}

function groupByWeek(orders: Order[]): { date: string; revenue: number }[] {
  const map: Record<string, number> = {};
  orders.forEach((o) => {
    const d = new Date(o.created_at);
    const startOfWeek = new Date(d);
    startOfWeek.setDate(d.getDate() - d.getDay());
    const label = startOfWeek.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
    });
    map[label] = (map[label] || 0) + o.total;
  });
  return Object.entries(map).map(([date, revenue]) => ({ date, revenue }));
}

function groupOrdersByDay(orders: Order[]): { date: string; count: number }[] {
  const map: Record<string, number> = {};
  orders.forEach((o) => {
    const day = new Date(o.created_at).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
    });
    map[day] = (map[day] || 0) + 1;
  });
  return Object.entries(map).map(([date, count]) => ({ date, count }));
}

function groupOrdersByHour(
  orders: Order[]
): { date: string; count: number }[] {
  const map: Record<string, number> = {};
  orders.forEach((o) => {
    const hour = new Date(o.created_at).toLocaleString("en-US", {
      hour: "numeric",
      hour12: true,
    });
    map[hour] = (map[hour] || 0) + 1;
  });
  return Object.entries(map).map(([date, count]) => ({ date, count }));
}

function groupOrdersByWeek(
  orders: Order[]
): { date: string; count: number }[] {
  const map: Record<string, number> = {};
  orders.forEach((o) => {
    const d = new Date(o.created_at);
    const startOfWeek = new Date(d);
    startOfWeek.setDate(d.getDate() - d.getDay());
    const label = startOfWeek.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
    });
    map[label] = (map[label] || 0) + 1;
  });
  return Object.entries(map).map(([date, count]) => ({ date, count }));
}

function formatRevenue(value: number): string {
  return "$" + value.toLocaleString("en-US", { maximumFractionDigits: 0 });
}

function PctChange({ value }: { value: number | null }) {
  if (value === null)
    return <span className="font-gilroy text-xs text-white/40">N/A</span>;
  const isPositive = value >= 0;
  return (
    <span
      className={`font-gilroy text-xs flex items-center gap-1 ${isPositive ? "text-emerald-400" : "text-red-400"}`}
    >
      {isPositive ? (
        <TrendingUp className="w-3 h-3" />
      ) : (
        <TrendingDown className="w-3 h-3" />
      )}
      {isPositive ? "+" : ""}
      {value.toFixed(1)}%
    </span>
  );
}

export default function AnalyticsPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [items, setItems] = useState<OrderItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [range, setRange] = useState<DateRange>("30d");
  const [customFrom, setCustomFrom] = useState("");
  const [customTo, setCustomTo] = useState("");
  const [refreshKey, setRefreshKey] = useState(0);

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const supabase = createClient();
      const [ordersRes, itemsRes] = await Promise.all([
        supabase
          .from("orders")
          .select("*")
          .order("created_at", { ascending: false }),
        supabase
          .from("order_items")
          .select("order_id, quantity, price, products(name, category)"),
      ]);
      setOrders((ordersRes.data as Order[]) || []);
      setItems((itemsRes.data as unknown as OrderItem[]) || []);
    } catch {
      // silent
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData, refreshKey]);

  const { from, to } = useMemo(
    () => getDateRange(range, customFrom, customTo),
    [range, customFrom, customTo]
  );

  const filteredOrders = useMemo(
    () =>
      orders.filter((o) => {
        const d = new Date(o.created_at);
        return d >= from && d <= to;
      }),
    [orders, from, to]
  );

  const filteredOrderIds = useMemo(
    () => new Set(filteredOrders.map((o) => o.id)),
    [filteredOrders]
  );

  const filteredItems = useMemo(
    () => items.filter((i) => i.order_id && filteredOrderIds.has(i.order_id)),
    [items, filteredOrderIds]
  );

  const prevRange = useMemo(() => prevPeriod(from, to), [from, to]);

  const prevOrders = useMemo(
    () =>
      orders.filter((o) => {
        const d = new Date(o.created_at);
        return d >= prevRange.from && d <= prevRange.to;
      }),
    [orders, prevRange]
  );

  const stats = useMemo(() => {
    const totalRevenue = filteredOrders.reduce((s, o) => s + o.total, 0);
    const totalOrders = filteredOrders.length;
    const avgOrderValue = totalOrders > 0 ? totalRevenue / totalOrders : 0;
    const uniqueCustomers = new Set(filteredOrders.map((o) => o.customer_id))
      .size;

    const prevRevenue = prevOrders.reduce((s, o) => s + o.total, 0);
    const prevOrderCount = prevOrders.length;

    const revenuePct =
      prevRevenue > 0 ? ((totalRevenue - prevRevenue) / prevRevenue) * 100 : null;
    const ordersPct =
      prevOrderCount > 0
        ? ((totalOrders - prevOrderCount) / prevOrderCount) * 100
        : null;

    return {
      totalRevenue,
      totalOrders,
      avgOrderValue,
      uniqueCustomers,
      revenuePct,
      ordersPct,
    };
  }, [filteredOrders, prevOrders]);

  const revenueChartData = useMemo(() => {
    if (range === "today") return groupByHour(filteredOrders);
    if (range === "90d") return groupByWeek(filteredOrders);
    return groupByDay(filteredOrders);
  }, [filteredOrders, range]);

  const ordersChartData = useMemo(() => {
    if (range === "today") return groupOrdersByHour(filteredOrders);
    if (range === "90d") return groupOrdersByWeek(filteredOrders);
    return groupOrdersByDay(filteredOrders);
  }, [filteredOrders, range]);

  const categoryData = useMemo(() => {
    const map: Record<string, number> = {};
    filteredItems.forEach((i) => {
      const cat = i.products?.category || "Unknown";
      map[cat] = (map[cat] || 0) + i.price * i.quantity;
    });
    const total = Object.values(map).reduce((s, v) => s + v, 0);
    return Object.entries(map)
      .map(([name, value]) => ({
        name,
        value,
        pct: total > 0 ? ((value / total) * 100).toFixed(1) : "0",
      }))
      .sort((a, b) => b.value - a.value);
  }, [filteredItems]);

  const bestSellers = useMemo(() => {
    const map: Record<string, { category: string; units: number; revenue: number }> = {};
    filteredItems.forEach((i) => {
      const name = i.products?.name || "Unknown";
      const cat = i.products?.category || "Unknown";
      if (!map[name]) map[name] = { category: cat, units: 0, revenue: 0 };
      map[name].units += i.quantity;
      map[name].revenue += i.price * i.quantity;
    });
    return Object.entries(map)
      .map(([name, v]) => ({ name, ...v }))
      .sort((a, b) => b.revenue - a.revenue)
      .slice(0, 10);
  }, [filteredItems]);

  const dayOfWeekData = useMemo(() => {
    const days = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
    const map: Record<string, number> = {};
    days.forEach((d) => (map[d] = 0));
    filteredOrders.forEach((o) => {
      const d = new Date(o.created_at);
      const dayIdx = (d.getDay() + 6) % 7;
      const dayName = days[dayIdx];
      map[dayName] = (map[dayName] || 0) + o.total;
    });
    return days.map((day) => ({ day, revenue: map[day] }));
  }, [filteredOrders]);

  const miniMetrics = useMemo(() => {
    const customerOrderMap: Record<string, number> = {};
    orders.forEach((o) => {
      customerOrderMap[o.customer_id] =
        (customerOrderMap[o.customer_id] || 0) + 1;
    });
    const totalWithOrders = Object.keys(customerOrderMap).length;
    const repeatCustomers = Object.values(customerOrderMap).filter(
      (c) => c >= 2
    ).length;
    const repeatRate =
      totalWithOrders > 0
        ? ((repeatCustomers / totalWithOrders) * 100).toFixed(1)
        : "0";

    const totalItemsCount = filteredItems.reduce(
      (s, i) => s + i.quantity,
      0
    );
    const avgItemsPerOrder =
      filteredOrders.length > 0
        ? (totalItemsCount / filteredOrders.length).toFixed(1)
        : "0";

    const catMap: Record<string, number> = {};
    filteredItems.forEach((i) => {
      const cat = i.products?.category || "Unknown";
      catMap[cat] = (catMap[cat] || 0) + i.quantity;
    });
    const topCategory =
      Object.entries(catMap).sort((a, b) => b[1] - a[1])[0]?.[0] || "N/A";

    return { repeatRate, avgItemsPerOrder, topCategory };
  }, [orders, filteredOrders, filteredItems]);

  const rangeOptions: { label: string; value: DateRange }[] = [
    { label: "Today", value: "today" },
    { label: "7D", value: "7d" },
    { label: "30D", value: "30d" },
    { label: "90D", value: "90d" },
    { label: "Custom", value: "custom" },
  ];

  const isEmpty = !loading && filteredOrders.length === 0;

  return (
    <div className="p-6 lg:p-8 min-h-screen">
      {/* HEADER */}
      <div className="flex flex-col gap-4 mb-8 lg:flex-row lg:items-start lg:justify-between">
        <div>
          <h1 className="font-gilroy text-2xl font-bold text-white">
            Analytics
          </h1>
          <p className="font-gilroy text-sm text-white/40 mt-1">
            Track revenue, orders, and customer insights
          </p>
        </div>

        <div className="flex flex-col gap-3 items-start lg:items-end">
          {/* Range chips */}
          <div className="flex items-center gap-2 flex-wrap">
            {rangeOptions.map((opt) => (
              <button
                key={opt.value}
                onClick={() => setRange(opt.value)}
                className={
                  range === opt.value
                    ? "bg-brand-primary text-white rounded-lg px-4 py-2 font-gilroy font-semibold text-sm"
                    : "bg-white/[0.05] hover:bg-white/[0.08] text-white/60 hover:text-white rounded-lg px-4 py-2 font-gilroy font-semibold text-sm transition-all"
                }
              >
                {opt.label}
              </button>
            ))}
            <button
              onClick={() => setRefreshKey((k) => k + 1)}
              className="bg-white/[0.05] hover:bg-white/[0.08] text-white/60 hover:text-white rounded-lg px-3 py-2 transition-all"
              title="Refresh"
            >
              <RefreshCw className="w-4 h-4" />
            </button>
          </div>

          {/* Custom date inputs */}
          {range === "custom" && (
            <div className="flex items-center gap-2">
              <Calendar className="w-4 h-4 text-white/40" />
              <input
                type="date"
                value={customFrom}
                onChange={(e) => setCustomFrom(e.target.value)}
                className="font-gilroy text-sm text-white bg-[#0f172a] border border-white/10 rounded-md px-3 py-2.5 outline-none placeholder:text-white/25 focus:border-white/30 transition-colors"
              />
              <span className="font-gilroy text-white/40 text-sm">to</span>
              <input
                type="date"
                value={customTo}
                onChange={(e) => setCustomTo(e.target.value)}
                className="font-gilroy text-sm text-white bg-[#0f172a] border border-white/10 rounded-md px-3 py-2.5 outline-none placeholder:text-white/25 focus:border-white/30 transition-colors"
              />
            </div>
          )}
        </div>
      </div>

      {/* KEY STATS ROW */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        {loading ? (
          Array.from({ length: 4 }).map((_, i) => (
            <div
              key={i}
              className="bg-[#1e293b] border border-white/10 rounded-xl p-5"
            >
              <Skeleton className="h-4 w-24 mb-3" />
              <Skeleton className="h-8 w-32 mb-2" />
              <Skeleton className="h-3 w-16" />
            </div>
          ))
        ) : (
          <>
            <StatCard
              icon={<DollarSign className="w-5 h-5 text-blue-400" />}
              label="Total Revenue"
              value={formatRevenue(stats.totalRevenue)}
              pct={stats.revenuePct}
              accent="blue"
            />
            <StatCard
              icon={<ShoppingBag className="w-5 h-5 text-emerald-400" />}
              label="Total Orders"
              value={stats.totalOrders.toLocaleString()}
              pct={stats.ordersPct}
              accent="emerald"
            />
            <StatCard
              icon={<Users className="w-5 h-5 text-violet-400" />}
              label="New Customers"
              value={stats.uniqueCustomers.toLocaleString()}
              pct={null}
              accent="violet"
            />
            <StatCard
              icon={<TrendingUp className="w-5 h-5 text-amber-400" />}
              label="Avg Order Value"
              value={formatRevenue(stats.avgOrderValue)}
              pct={null}
              accent="amber"
            />
          </>
        )}
      </div>

      {/* EMPTY STATE */}
      {isEmpty && (
        <div className="bg-[#1e293b] border border-white/10 rounded-xl p-12 flex items-center justify-center">
          <EmptyState
            icon={BarChart2}
            title="No orders in this period"
            description="Try selecting a different date range to see analytics data."
          />
        </div>
      )}

      {!isEmpty && (
        <>
          {/* REVENUE OVER TIME */}
          <div className="bg-[#1e293b] border border-white/10 rounded-xl mb-6">
            <div className="px-6 py-4 border-b border-white/[0.07] flex items-center justify-between">
              <div>
                <h2 className="font-gilroy font-semibold text-white text-base">
                  Revenue Over Time
                </h2>
                {!loading && (
                  <p className="font-gilroy text-xs text-white/40 mt-0.5">
                    {revenueChartData.length} data point
                    {revenueChartData.length !== 1 ? "s" : ""}
                  </p>
                )}
              </div>
            </div>
            <div className="p-6">
              {loading ? (
                <Skeleton className="h-[250px] w-full rounded-lg" />
              ) : (
                <ResponsiveContainer width="100%" height={250}>
                  <AreaChart data={revenueChartData}>
                    <defs>
                      <linearGradient
                        id="revenueGrad"
                        x1="0"
                        y1="0"
                        x2="0"
                        y2="1"
                      >
                        <stop
                          offset="5%"
                          stopColor="#3b82f6"
                          stopOpacity={0.3}
                        />
                        <stop
                          offset="95%"
                          stopColor="#3b82f6"
                          stopOpacity={0}
                        />
                      </linearGradient>
                    </defs>
                    <CartesianGrid stroke="rgba(255,255,255,0.05)" strokeDasharray="3 3" />
                    <XAxis
                      dataKey="date"
                      tick={TICK_STYLE}
                      axisLine={false}
                      tickLine={false}
                    />
                    <YAxis
                      tick={TICK_STYLE}
                      axisLine={false}
                      tickLine={false}
                      tickFormatter={(v) => "$" + v.toLocaleString()}
                    />
                    <Tooltip
                      contentStyle={CHART_TOOLTIP_STYLE}
                      labelStyle={CHART_LABEL_STYLE}
                      formatter={(v: unknown) => [formatRevenue(Number(v ?? 0)), "Revenue"]}
                    />
                    <Area
                      type="monotone"
                      dataKey="revenue"
                      stroke="#3b82f6"
                      strokeWidth={2}
                      fill="url(#revenueGrad)"
                      dot={false}
                    />
                  </AreaChart>
                </ResponsiveContainer>
              )}
            </div>
          </div>

          {/* ORDERS OVER TIME */}
          <div className="bg-[#1e293b] border border-white/10 rounded-xl mb-6">
            <div className="px-6 py-4 border-b border-white/[0.07] flex items-center justify-between">
              <h2 className="font-gilroy font-semibold text-white text-base">
                Orders Over Time
              </h2>
            </div>
            <div className="p-6">
              {loading ? (
                <Skeleton className="h-[200px] w-full rounded-lg" />
              ) : (
                <ResponsiveContainer width="100%" height={200}>
                  <BarChart data={ordersChartData}>
                    <CartesianGrid stroke="rgba(255,255,255,0.05)" strokeDasharray="3 3" />
                    <XAxis
                      dataKey="date"
                      tick={TICK_STYLE}
                      axisLine={false}
                      tickLine={false}
                    />
                    <YAxis
                      tick={TICK_STYLE}
                      axisLine={false}
                      tickLine={false}
                      allowDecimals={false}
                    />
                    <Tooltip
                      contentStyle={CHART_TOOLTIP_STYLE}
                      labelStyle={CHART_LABEL_STYLE}
                      formatter={(v: unknown) => [Number(v ?? 0), "Orders"]}
                    />
                    <Bar dataKey="count" fill="#10b981" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              )}
            </div>
          </div>

          {/* ROW 2: Category Breakdown + Best Sellers */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
            {/* Category Breakdown */}
            <div className="bg-[#1e293b] border border-white/10 rounded-xl">
              <div className="px-6 py-4 border-b border-white/[0.07]">
                <h2 className="font-gilroy font-semibold text-white text-base">
                  Category Breakdown
                </h2>
              </div>
              <div className="p-6">
                {loading ? (
                  <Skeleton className="h-[220px] w-full rounded-lg" />
                ) : categoryData.length === 0 ? (
                  <div className="h-[220px] flex items-center justify-center">
                    <p className="font-gilroy text-white/40 text-sm">
                      No category data
                    </p>
                  </div>
                ) : (
                  <ResponsiveContainer width="100%" height={220}>
                    <PieChart>
                      <Pie
                        data={categoryData}
                        dataKey="value"
                        nameKey="name"
                        innerRadius={50}
                        outerRadius={80}
                        paddingAngle={3}
                      >
                        {categoryData.map((entry, index) => (
                          <Cell
                            key={entry.name}
                            fill={PIE_COLORS[index % PIE_COLORS.length]}
                          />
                        ))}
                      </Pie>
                      <Tooltip
                        contentStyle={CHART_TOOLTIP_STYLE}
                        labelStyle={CHART_LABEL_STYLE}
                        // eslint-disable-next-line @typescript-eslint/no-explicit-any
                        formatter={(v: unknown, _name: unknown, props: any) => [
                          `${formatRevenue(Number(v ?? 0))} (${props?.payload?.pct ?? 0}%)`,
                          "Revenue",
                        ]}
                      />
                      <Legend
                        formatter={(value) => (
                          <span
                            style={{
                              color: "rgba(255,255,255,0.6)",
                              fontFamily: "Gilroy",
                              fontSize: 12,
                            }}
                          >
                            {value}
                          </span>
                        )}
                      />
                    </PieChart>
                  </ResponsiveContainer>
                )}
              </div>
            </div>

            {/* Best Sellers */}
            <div className="bg-[#1e293b] border border-white/10 rounded-xl">
              <div className="px-6 py-4 border-b border-white/[0.07]">
                <h2 className="font-gilroy font-semibold text-white text-base">
                  Best Sellers
                </h2>
              </div>
              <div className="p-0">
                {loading ? (
                  <div className="p-6">
                    <Skeleton className="h-[220px] w-full rounded-lg" />
                  </div>
                ) : bestSellers.length === 0 ? (
                  <div className="h-[220px] flex items-center justify-center">
                    <p className="font-gilroy text-white/40 text-sm">
                      No product data
                    </p>
                  </div>
                ) : (
                  <div className="overflow-auto max-h-[280px]">
                    <table className="w-full text-left">
                      <thead>
                        <tr className="border-b border-white/[0.05]">
                          <th className="font-gilroy text-xs text-white/40 font-medium px-6 py-3 w-8">
                            #
                          </th>
                          <th className="font-gilroy text-xs text-white/40 font-medium px-2 py-3">
                            Product
                          </th>
                          <th className="font-gilroy text-xs text-white/40 font-medium px-2 py-3 hidden md:table-cell">
                            Category
                          </th>
                          <th className="font-gilroy text-xs text-white/40 font-medium px-2 py-3 text-right">
                            Units
                          </th>
                          <th className="font-gilroy text-xs text-white/40 font-medium px-6 py-3 text-right">
                            Revenue
                          </th>
                        </tr>
                      </thead>
                      <tbody>
                        {bestSellers.map((product, idx) => (
                          <tr
                            key={product.name}
                            className="border-b border-white/[0.04] hover:bg-white/[0.02] transition-colors"
                          >
                            <td className="px-6 py-3">
                              {idx === 0 ? (
                                <span className="inline-flex items-center justify-center w-5 h-5 rounded-full bg-amber-400/20 text-amber-400 font-gilroy font-bold text-xs">
                                  1
                                </span>
                              ) : (
                                <span className="font-gilroy text-xs text-white/40">
                                  {idx + 1}
                                </span>
                              )}
                            </td>
                            <td className="px-2 py-3">
                              <span className="font-gilroy text-sm text-white truncate block max-w-[120px]">
                                {product.name}
                              </span>
                            </td>
                            <td className="px-2 py-3 hidden md:table-cell">
                              <span className="font-gilroy text-xs text-white/50">
                                {product.category}
                              </span>
                            </td>
                            <td className="px-2 py-3 text-right">
                              <span className="font-gilroy text-sm text-white/70">
                                {product.units.toLocaleString()}
                              </span>
                            </td>
                            <td className="px-6 py-3 text-right">
                              <span className="font-gilroy text-sm text-white font-semibold">
                                {formatRevenue(product.revenue)}
                              </span>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* REVENUE BY DAY OF WEEK */}
          <div className="bg-[#1e293b] border border-white/10 rounded-xl mb-6">
            <div className="px-6 py-4 border-b border-white/[0.07]">
              <h2 className="font-gilroy font-semibold text-white text-base">
                Revenue by Day of Week
              </h2>
            </div>
            <div className="p-6">
              {loading ? (
                <Skeleton className="h-[240px] w-full rounded-lg" />
              ) : (
                <ResponsiveContainer width="100%" height={240}>
                  <BarChart
                    data={dayOfWeekData}
                    layout="vertical"
                    margin={{ left: 8, right: 24 }}
                  >
                    <CartesianGrid
                      stroke="rgba(255,255,255,0.05)"
                      horizontal={false}
                    />
                    <XAxis
                      type="number"
                      tick={TICK_STYLE}
                      axisLine={false}
                      tickLine={false}
                      tickFormatter={(v) => "$" + v.toLocaleString()}
                    />
                    <YAxis
                      type="category"
                      dataKey="day"
                      tick={TICK_STYLE}
                      axisLine={false}
                      tickLine={false}
                      width={36}
                    />
                    <Tooltip
                      contentStyle={CHART_TOOLTIP_STYLE}
                      labelStyle={CHART_LABEL_STYLE}
                      formatter={(v: unknown) => [formatRevenue(Number(v ?? 0)), "Revenue"]}
                    />
                    <Bar dataKey="revenue" fill="#3b82f6" radius={[0, 4, 4, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              )}
            </div>
          </div>

          {/* KEY METRICS CHIPS */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
            {loading ? (
              Array.from({ length: 4 }).map((_, i) => (
                <div
                  key={i}
                  className="bg-[#1e293b] border border-white/10 rounded-xl p-5"
                >
                  <Skeleton className="h-3 w-20 mb-3" />
                  <Skeleton className="h-6 w-16" />
                </div>
              ))
            ) : (
              <>
                <MiniMetricCard
                  label="Repeat Customer Rate"
                  value={miniMetrics.repeatRate + "%"}
                  description="Customers with 2+ orders"
                />
                <MiniMetricCard
                  label="Conversion Rate"
                  value="N/A"
                  description="Requires visit tracking"
                  muted
                />
                <MiniMetricCard
                  label="Avg Items / Order"
                  value={miniMetrics.avgItemsPerOrder}
                  description="Items per transaction"
                />
                <MiniMetricCard
                  label="Top Category"
                  value={miniMetrics.topCategory}
                  description="Most ordered category"
                />
              </>
            )}
          </div>
        </>
      )}
    </div>
  );
}

function StatCard({
  icon,
  label,
  value,
  pct,
  accent,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
  pct: number | null;
  accent: "blue" | "emerald" | "violet" | "amber";
}) {
  const bgMap = {
    blue: "bg-blue-500/10",
    emerald: "bg-emerald-500/10",
    violet: "bg-violet-500/10",
    amber: "bg-amber-500/10",
  };

  return (
    <div className="bg-[#1e293b] border border-white/10 rounded-xl p-5">
      <div className="flex items-start justify-between mb-3">
        <div className={`p-2 rounded-lg ${bgMap[accent]}`}>{icon}</div>
        <PctChange value={pct} />
      </div>
      <div className="font-gilroy text-2xl font-bold text-white mb-1">
        {value}
      </div>
      <div className="font-gilroy text-xs text-white/40">{label}</div>
    </div>
  );
}

function MiniMetricCard({
  label,
  value,
  description,
  muted,
}: {
  label: string;
  value: string;
  description: string;
  muted?: boolean;
}) {
  return (
    <div className="bg-[#1e293b] border border-white/10 rounded-xl p-5">
      <div className="font-gilroy text-xs text-white/40 mb-2">{label}</div>
      <div
        className={`font-gilroy text-xl font-bold mb-1 ${muted ? "text-white/30" : "text-white"}`}
      >
        {value}
      </div>
      <div className="font-gilroy text-xs text-white/30">{description}</div>
    </div>
  );
}
