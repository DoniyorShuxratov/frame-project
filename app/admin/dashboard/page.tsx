"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, BarChart, Bar,
} from "recharts";

interface Order {
  id: string; total: number; status: string; created_at: string;
  customer_id: string;
}

interface DailyRevenue { date: string; revenue: number }
interface TopProduct   { name: string; count: number }

export default function AdminDashboardPage() {
  const [orders, setOrders]             = useState<Order[]>([]);
  const [revenueData, setRevenueData]   = useState<DailyRevenue[]>([]);
  const [topProducts, setTopProducts]   = useState<TopProduct[]>([]);
  const [loading, setLoading]           = useState(true);

  useEffect(() => {
    const supabase = createClient();

    async function load() {
      const { data: ordersData } = await supabase
        .from("orders")
        .select("*")
        .order("created_at", { ascending: false });

      if (ordersData) {
        setOrders(ordersData);

        const byDay: Record<string, number> = {};
        ordersData.forEach((o) => {
          const day = new Date(o.created_at).toLocaleDateString("en-US", { month: "short", day: "numeric" });
          byDay[day] = (byDay[day] ?? 0) + o.total;
        });
        setRevenueData(
          Object.entries(byDay).slice(-7).map(([date, revenue]) => ({ date, revenue }))
        );
      }

      const { data: itemsData } = await supabase
        .from("order_items")
        .select("quantity, products(name)");

      if (itemsData) {
        const counts: Record<string, number> = {};
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        itemsData.forEach((item: any) => {
          const name = item.products?.name ?? "Unknown";
          counts[name] = (counts[name] ?? 0) + item.quantity;
        });
        setTopProducts(
          Object.entries(counts)
            .sort((a, b) => b[1] - a[1])
            .slice(0, 5)
            .map(([name, count]) => ({ name: name.length > 16 ? name.slice(0, 16) + "…" : name, count }))
        );
      }

      setLoading(false);
    }

    load();

    const channel = supabase
      .channel("orders-realtime")
      .on("postgres_changes", { event: "*", schema: "public", table: "orders" }, (payload) => {
        if (payload.eventType === "INSERT") {
          setOrders((prev) => [payload.new as Order, ...prev]);
        } else if (payload.eventType === "UPDATE") {
          setOrders((prev) =>
            prev.map((o) => (o.id === (payload.new as Order).id ? (payload.new as Order) : o))
          );
        }
      })
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, []);

  const totalRevenue = orders.reduce((s, o) => s + o.total, 0);
  const pending      = orders.filter((o) => o.status === "pending").length;
  const delivered    = orders.filter((o) => o.status === "delivered").length;

  const statusColor: Record<string, string> = {
    pending: "bg-warning/10 text-warning",
    processing: "bg-info/10 text-info",
    shipped: "bg-brand-primary/10 text-brand-primary",
    delivered: "bg-success/10 text-success",
    cancelled: "bg-error/10 text-error",
  };

  if (loading) {
    return (
      <div className="p-8 space-y-6">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="bg-[#1e293b] rounded-xl p-5 animate-pulse h-28" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 lg:p-8 space-y-8">
      <div>
        <h1 className="font-gilroy font-bold text-h2 text-white">Dashboard</h1>
        <p className="font-gilroy text-small text-white/50 mt-1">Real-time overview</p>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { title: "Total Revenue", value: `$${totalRevenue.toFixed(2)}` },
          { title: "Total Orders",  value: String(orders.length) },
          { title: "Pending",       value: String(pending) },
          { title: "Delivered",     value: String(delivered) },
        ].map((m) => (
          <div key={m.title} className="bg-[#1e293b] border border-white/10 rounded-xl p-5">
            <p className="font-gilroy font-semibold text-xs text-white/40 uppercase tracking-widest mb-2">{m.title}</p>
            <p className="font-gilroy font-bold text-h3 text-white">{m.value}</p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-[#1e293b] border border-white/10 rounded-xl p-6">
          <h2 className="font-gilroy font-bold text-body text-white mb-5">Revenue (Last 7 Days)</h2>
          <ResponsiveContainer width="100%" height={220}>
            <LineChart data={revenueData}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
              <XAxis dataKey="date" tick={{ fill: "rgba(255,255,255,0.4)", fontSize: 11, fontFamily: "Gilroy" }} />
              <YAxis tick={{ fill: "rgba(255,255,255,0.4)", fontSize: 11, fontFamily: "Gilroy" }} />
              <Tooltip
                contentStyle={{ background: "#0f172a", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 8, fontFamily: "Gilroy" }}
                labelStyle={{ color: "rgba(255,255,255,0.7)" }}
                itemStyle={{ color: "#0086cb" }}
                formatter={(value) => [`$${Number(value).toFixed(2)}`, "Revenue"]}
              />
              <Line type="monotone" dataKey="revenue" stroke="#0086cb" strokeWidth={2} dot={false} />
            </LineChart>
          </ResponsiveContainer>
        </div>

        <div className="bg-[#1e293b] border border-white/10 rounded-xl p-6">
          <h2 className="font-gilroy font-bold text-body text-white mb-5">Top Products</h2>
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={topProducts} layout="vertical">
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
              <XAxis type="number" tick={{ fill: "rgba(255,255,255,0.4)", fontSize: 11, fontFamily: "Gilroy" }} />
              <YAxis dataKey="name" type="category" width={90} tick={{ fill: "rgba(255,255,255,0.4)", fontSize: 11, fontFamily: "Gilroy" }} />
              <Tooltip
                contentStyle={{ background: "#0f172a", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 8, fontFamily: "Gilroy" }}
                labelStyle={{ color: "rgba(255,255,255,0.7)" }}
                itemStyle={{ color: "#0086cb" }}
              />
              <Bar dataKey="count" fill="#0086cb" radius={[0, 4, 4, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="bg-[#1e293b] border border-white/10 rounded-xl p-6">
        <h2 className="font-gilroy font-bold text-body text-white mb-5">Recent Orders</h2>
        <div className="overflow-x-auto">
          <table className="w-full text-sm font-gilroy">
            <thead>
              <tr className="border-b border-white/10">
                {["Order ID", "Date", "Total", "Status"].map((h) => (
                  <th key={h} className="text-left py-2 px-3 text-white/50 font-semibold text-xs uppercase tracking-widest">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {orders.slice(0, 10).map((order) => (
                <tr key={order.id} className="border-b border-white/5 hover:bg-white/5 transition-colors">
                  <td className="py-3 px-3 text-brand-primary font-semibold">#{order.id.slice(0, 8).toUpperCase()}</td>
                  <td className="py-3 px-3 text-white/60">
                    {new Date(order.created_at).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
                  </td>
                  <td className="py-3 px-3 text-white font-semibold">${order.total.toFixed(2)}</td>
                  <td className="py-3 px-3">
                    <span className={`px-2 py-0.5 rounded-full text-xs font-semibold capitalize ${statusColor[order.status] ?? "bg-white/10 text-white/60"}`}>
                      {order.status}
                    </span>
                  </td>
                </tr>
              ))}
              {orders.length === 0 && (
                <tr>
                  <td colSpan={4} className="py-8 text-center text-white/30">No orders yet</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
