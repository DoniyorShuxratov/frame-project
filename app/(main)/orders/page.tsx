"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import { Badge } from "@/components/Badge";
import { Button } from "@/components/Button";

interface OrderItem {
  id: string; quantity: number; size: string; price: number;
  products: { name: string; image_url: string } | null;
}
interface Order {
  id: string; total: number; status: string; created_at: string;
  order_items: OrderItem[];
}

const statusVariant: Record<string, "success" | "info" | "warning" | "error" | "neutral"> = {
  delivered: "success", shipped: "info", processing: "warning",
  pending: "neutral", cancelled: "error",
};

export default function OrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      const supabase = createClient();
      const { data } = await supabase
        .from("orders")
        .select("*, order_items(*, products(name, image_url))")
        .order("created_at", { ascending: false });
      if (data) setOrders(data as Order[]);
      setLoading(false);
    }
    load();
  }, []);

  if (loading) {
    return (
      <div className="max-w-3xl mx-auto px-ds-4 py-ds-10">
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="bg-surface-card border border-stroke-default rounded-xl p-ds-6 animate-pulse">
              <div className="h-4 bg-surface-item rounded w-1/4 mb-3" />
              <div className="h-3 bg-surface-item rounded w-1/3" />
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (orders.length === 0) {
    return (
      <div className="max-w-3xl mx-auto px-ds-4 py-24 text-center">
        <div className="w-20 h-20 bg-brand-bg rounded-full flex items-center justify-center mx-auto mb-ds-6">
          <svg className="w-9 h-9 text-brand-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
              d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
          </svg>
        </div>
        <h1 className="font-gilroy font-bold text-h2 text-content-primary mb-3">No orders yet</h1>
        <p className="text-content-secondary font-gilroy text-body mb-ds-8">
          Your order history will appear here.
        </p>
        <Link href="/home"><Button size="lg">Start Shopping</Button></Link>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto px-ds-4 sm:px-ds-6 py-ds-10">
      <h1 className="font-gilroy font-bold text-h1 text-content-primary mb-ds-8">My Orders</h1>

      <div className="space-y-ds-4">
        {orders.map((order) => (
          <div key={order.id} className="bg-surface-card border border-stroke-default rounded-xl p-ds-6">
            <div className="flex items-start justify-between mb-ds-4">
              <div>
                <p className="font-gilroy font-bold text-body text-brand-primary">
                  #{order.id.slice(0, 8).toUpperCase()}
                </p>
                <p className="text-small text-content-secondary font-gilroy mt-0.5">
                  {new Date(order.created_at).toLocaleDateString("en-US", {
                    year: "numeric", month: "long", day: "numeric",
                  })}
                </p>
              </div>
              <div className="flex flex-col items-end gap-2">
                <Badge variant={statusVariant[order.status] ?? "neutral"}>
                  {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                </Badge>
                <span className="font-gilroy font-bold text-h5 text-content-primary">
                  ${order.total.toFixed(2)}
                </span>
              </div>
            </div>

            <div className="space-y-2 border-t border-stroke-default pt-ds-4">
              {order.order_items.map((item) => (
                <div key={item.id} className="flex justify-between items-center font-gilroy text-body text-content-secondary">
                  <span>
                    {item.products?.name ?? "Product"}{" "}
                    <span className="text-small">× {item.quantity}</span>
                    {" "}<span className="text-small">({item.size})</span>
                  </span>
                  <span>${(item.price * item.quantity).toFixed(2)}</span>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
