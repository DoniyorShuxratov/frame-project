"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";

interface OrderItem {
  id: string; quantity: number; size: string; price: number;
  products: { name: string } | null;
}
interface Order {
  id: string; total: number; status: string; created_at: string;
  customer_id: string; order_items: OrderItem[];
}

const STATUSES = ["pending", "processing", "shipped", "delivered", "cancelled"];

const statusColor: Record<string, string> = {
  pending:    "bg-warning/10 text-warning",
  processing: "bg-info/10 text-info",
  shipped:    "bg-brand-primary/10 text-brand-primary",
  delivered:  "bg-success/10 text-success",
  cancelled:  "bg-error/10 text-error",
};

export default function AdminOrdersPage() {
  const [orders, setOrders]     = useState<Order[]>([]);
  const [loading, setLoading]   = useState(true);
  const [expanded, setExpanded] = useState<string | null>(null);
  const [updating, setUpdating] = useState<string | null>(null);

  useEffect(() => {
    const supabase = createClient();

    async function load() {
      const { data } = await supabase
        .from("orders")
        .select("*, order_items(*, products(name))")
        .order("created_at", { ascending: false });
      if (data) setOrders(data as Order[]);
      setLoading(false);
    }

    load();

    const channel = supabase
      .channel("admin-orders-realtime")
      .on("postgres_changes", { event: "INSERT", schema: "public", table: "orders" }, async () => {
        load();
      })
      .on("postgres_changes", { event: "UPDATE", schema: "public", table: "orders" }, (payload) => {
        setOrders((prev) =>
          prev.map((o) => (o.id === (payload.new as Order).id ? { ...o, status: (payload.new as Order).status } : o))
        );
      })
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, []);

  async function updateStatus(orderId: string, status: string) {
    setUpdating(orderId);
    const supabase = createClient();
    await supabase.from("orders").update({ status }).eq("id", orderId);
    setOrders((prev) => prev.map((o) => (o.id === orderId ? { ...o, status } : o)));
    setUpdating(null);
  }

  if (loading) {
    return (
      <div className="p-6 lg:p-8 space-y-3">
        {[1, 2, 3].map((i) => (
          <div key={i} className="bg-[#1e293b] border border-white/10 rounded-xl p-5 animate-pulse h-20" />
        ))}
      </div>
    );
  }

  return (
    <div className="p-6 lg:p-8">
      <div className="mb-8">
        <h1 className="font-gilroy font-bold text-h2 text-white">Orders</h1>
        <p className="font-gilroy text-small text-white/50 mt-1">{orders.length} total • live updates</p>
      </div>

      {orders.length === 0 ? (
        <div className="bg-[#1e293b] border border-white/10 rounded-xl p-12 text-center">
          <p className="font-gilroy text-white/40 text-body">No orders yet</p>
        </div>
      ) : (
        <div className="space-y-3">
          {orders.map((order) => (
            <div key={order.id} className="bg-[#1e293b] border border-white/10 rounded-xl overflow-hidden">
              <button
                onClick={() => setExpanded(expanded === order.id ? null : order.id)}
                className="w-full flex items-center justify-between p-5 text-left hover:bg-white/5 transition-colors"
              >
                <div className="flex items-center gap-4">
                  <span className="font-gilroy font-bold text-brand-primary text-small">
                    #{order.id.slice(0, 8).toUpperCase()}
                  </span>
                  <span className="font-gilroy text-small text-white/40">
                    {new Date(order.created_at).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
                  </span>
                  <span className={`px-2 py-0.5 rounded-full text-xs font-gilroy font-semibold capitalize ${statusColor[order.status] ?? "bg-white/10 text-white/60"}`}>
                    {order.status}
                  </span>
                </div>
                <div className="flex items-center gap-4">
                  <span className="font-gilroy font-bold text-white">${order.total.toFixed(2)}</span>
                  <span className="text-white/30 text-xs">{expanded === order.id ? "▲" : "▼"}</span>
                </div>
              </button>

              {expanded === order.id && (
                <div className="px-5 pb-5 border-t border-white/10 pt-4 space-y-4">
                  <div className="space-y-2">
                    {order.order_items.map((item) => (
                      <div key={item.id} className="flex justify-between font-gilroy text-small text-white/60">
                        <span>
                          {item.products?.name ?? "Product"} × {item.quantity}
                          <span className="ml-2 text-white/30">({item.size})</span>
                        </span>
                        <span>${(item.price * item.quantity).toFixed(2)}</span>
                      </div>
                    ))}
                  </div>

                  <div className="flex items-center gap-3 pt-2 border-t border-white/10">
                    <span className="font-gilroy text-small text-white/50 font-semibold">Update Status:</span>
                    <div className="flex flex-wrap gap-2">
                      {STATUSES.map((s) => (
                        <button
                          key={s}
                          onClick={() => updateStatus(order.id, s)}
                          disabled={order.status === s || updating === order.id}
                          className={[
                            "px-3 py-1 rounded-full text-xs font-gilroy font-semibold capitalize transition-all disabled:opacity-50",
                            order.status === s
                              ? `${statusColor[s]} opacity-100`
                              : "bg-white/10 text-white/60 hover:bg-white/20",
                          ].join(" ")}
                        >
                          {s}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
