"use client";
import { useEffect, useState, useMemo } from "react";
import { createClient } from "@/lib/supabase/client";
import { StatusBadge } from "@/components/admin/StatusBadge";
import { Skeleton, SkeletonRow } from "@/components/admin/Skeleton";
import { SlideOver } from "@/components/admin/SlideOver";
import { EmptyState } from "@/components/admin/EmptyState";
import { Button } from "@/components/Button";
import {
  Search,
  Users,
  ChevronLeft,
  ChevronRight,
  ShoppingBag,
  Calendar,
  DollarSign,
  Package,
  ArrowUpDown,
} from "lucide-react";

interface Profile {
  id: string;
  username: string;
  role: string;
}

interface Order {
  id: string;
  total: number;
  status: string;
  created_at: string;
  customer_id: string;
  order_items?: { quantity: number; products: { name: string } | null }[];
}

interface Customer {
  id: string;
  username: string;
  orderCount: number;
  totalSpent: number;
  lastOrderAt: string | null;
  joinedAt: string;
  orders: Order[];
}

function getInitials(name: string) {
  return (
    name
      .split(/\s+/)
      .filter(Boolean)
      .map((w) => w[0].toUpperCase())
      .join("")
      .slice(0, 2) || "?"
  );
}

function timeAgo(dateStr: string | null): string {
  if (!dateStr) return "Never";
  const seconds = Math.floor(
    (Date.now() - new Date(dateStr).getTime()) / 1000
  );
  if (seconds < 60) return "Just now";
  if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`;
  if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`;
  if (seconds < 2592000) return `${Math.floor(seconds / 86400)}d ago`;
  return new Date(dateStr).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

const PAGE_SIZE = 10;

export default function CustomersPage() {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [sort, setSort] = useState("most-orders");
  const [filter, setFilter] = useState("all");
  const [page, setPage] = useState(1);
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(
    null
  );
  const [slideOpen, setSlideOpen] = useState(false);

  useEffect(() => {
    async function fetchData() {
      setLoading(true);
      const supabase = createClient();

      const { data: profiles } = await supabase
        .from("profiles")
        .select("id, username, role")
        .eq("role", "customer");

      const { data: ordersData } = await supabase
        .from("orders")
        .select(
          "id, total, status, created_at, customer_id, order_items(quantity, products(name))"
        )
        .order("created_at", { ascending: false });

      const built: Customer[] = (profiles || []).map((p: Profile) => {
        const customerOrders = ((ordersData || []) as unknown as Order[]).filter(
          (o: Order) => o.customer_id === p.id
        );
        return {
          id: p.id,
          username: p.username || `User ${p.id.slice(0, 6)}`,
          orderCount: customerOrders.length,
          totalSpent: customerOrders.reduce((s: number, o: Order) => s + (o.total ?? 0), 0),
          lastOrderAt: customerOrders[0]?.created_at || null,
          joinedAt:
            customerOrders[customerOrders.length - 1]?.created_at || "N/A",
          orders: customerOrders,
        };
      });

      setCustomers(built);
      setLoading(false);
    }

    fetchData();
  }, []);

  const filtered = useMemo(() => {
    let r = customers;
    if (search)
      r = r.filter(
        (c) =>
          c.username.toLowerCase().includes(search.toLowerCase()) ||
          c.id.toLowerCase().includes(search.toLowerCase())
      );
    if (filter === "new") r = r.filter((c) => c.orderCount === 0);
    if (filter === "active") r = r.filter((c) => c.orderCount > 0);
    if (filter === "vip")
      r = r.filter((c) => c.orderCount >= 5 || c.totalSpent >= 500);
    return [...r].sort((a, b) => {
      if (sort === "most-orders") return b.orderCount - a.orderCount;
      if (sort === "highest-spent") return b.totalSpent - a.totalSpent;
      if (sort === "most-recent") {
        if (!a.lastOrderAt) return 1;
        if (!b.lastOrderAt) return -1;
        return (
          new Date(b.lastOrderAt).getTime() -
          new Date(a.lastOrderAt).getTime()
        );
      }
      if (sort === "name-asc") return a.username.localeCompare(b.username);
      return 0;
    });
  }, [customers, search, sort, filter]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const paginated = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  const totalCustomers = customers.length;
  const activeCustomers = customers.filter((c) => c.orderCount > 0).length;
  const totalRevenue = customers.reduce((s, c) => s + c.totalSpent, 0);
  const avgOrders =
    totalCustomers > 0
      ? (
          customers.reduce((s, c) => s + c.orderCount, 0) / totalCustomers
        ).toFixed(1)
      : "0";

  function handleViewCustomer(c: Customer) {
    setSelectedCustomer(c);
    setSlideOpen(true);
  }

  function handlePageChange(newPage: number) {
    if (newPage < 1 || newPage > totalPages) return;
    setPage(newPage);
  }

  useEffect(() => {
    setPage(1);
  }, [search, sort, filter]);

  const avgOrderValue =
    selectedCustomer && selectedCustomer.orderCount > 0
      ? selectedCustomer.totalSpent / selectedCustomer.orderCount
      : 0;

  return (
    <div className="p-6 lg:p-8 font-gilroy">
      {/* Page Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-white font-gilroy">
          Customers
        </h1>
        <p className="text-white/60 text-sm mt-1 font-gilroy">
          Manage and view all registered customers
        </p>
      </div>

      {/* Stats Row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <div className="bg-[#1e293b] border border-white/10 rounded-xl px-5 py-4 flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-brand-primary/20 flex items-center justify-center flex-shrink-0">
            <Users className="w-5 h-5 text-brand-primary" />
          </div>
          <div>
            <p className="text-white/60 text-xs font-gilroy">Total Customers</p>
            {loading ? (
              <Skeleton className="h-6 w-12 mt-1" />
            ) : (
              <p className="text-white text-lg font-bold font-gilroy">
                {totalCustomers}
              </p>
            )}
          </div>
        </div>

        <div className="bg-[#1e293b] border border-white/10 rounded-xl px-5 py-4 flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-green-500/20 flex items-center justify-center flex-shrink-0">
            <ShoppingBag className="w-5 h-5 text-green-400" />
          </div>
          <div>
            <p className="text-white/60 text-xs font-gilroy">
              Active Customers
            </p>
            {loading ? (
              <Skeleton className="h-6 w-12 mt-1" />
            ) : (
              <p className="text-white text-lg font-bold font-gilroy">
                {activeCustomers}
              </p>
            )}
          </div>
        </div>

        <div className="bg-[#1e293b] border border-white/10 rounded-xl px-5 py-4 flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-blue-500/20 flex items-center justify-center flex-shrink-0">
            <DollarSign className="w-5 h-5 text-blue-400" />
          </div>
          <div>
            <p className="text-white/60 text-xs font-gilroy">Total Revenue</p>
            {loading ? (
              <Skeleton className="h-6 w-20 mt-1" />
            ) : (
              <p className="text-white text-lg font-bold font-gilroy">
                ${totalRevenue.toFixed(2)}
              </p>
            )}
          </div>
        </div>

        <div className="bg-[#1e293b] border border-white/10 rounded-xl px-5 py-4 flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-purple-500/20 flex items-center justify-center flex-shrink-0">
            <Package className="w-5 h-5 text-purple-400" />
          </div>
          <div>
            <p className="text-white/60 text-xs font-gilroy">
              Avg Orders / Customer
            </p>
            {loading ? (
              <Skeleton className="h-6 w-12 mt-1" />
            ) : (
              <p className="text-white text-lg font-bold font-gilroy">
                {avgOrders}
              </p>
            )}
          </div>
        </div>
      </div>

      {/* Filter Bar */}
      <div className="bg-[#1e293b] border border-white/10 rounded-xl mb-6">
        <div className="px-6 py-4 flex flex-col sm:flex-row gap-3 items-start sm:items-center">
          {/* Search */}
          <div className="relative flex-1 min-w-0">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/40" />
            <input
              type="text"
              placeholder="Search by name or ID..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="font-gilroy text-sm text-white bg-[#0f172a] border border-white/10 rounded-md pl-9 pr-3 py-2.5 outline-none placeholder:text-white/25 focus:border-white/30 transition-colors w-full"
            />
          </div>

          <div className="flex gap-3 flex-wrap sm:flex-nowrap">
            {/* Sort */}
            <div className="relative">
              <ArrowUpDown className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-white/40 pointer-events-none" />
              <select
                value={sort}
                onChange={(e) => setSort(e.target.value)}
                className="font-gilroy text-sm text-white bg-[#0f172a] border border-white/10 rounded-md pl-8 pr-3 py-2.5 outline-none focus:border-white/30 transition-colors appearance-none cursor-pointer"
              >
                <option value="most-orders">Most Orders</option>
                <option value="highest-spent">Highest Spent</option>
                <option value="most-recent">Most Recent</option>
                <option value="name-asc">Name A–Z</option>
              </select>
            </div>

            {/* Filter */}
            <select
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
              className="font-gilroy text-sm text-white bg-[#0f172a] border border-white/10 rounded-md px-3 py-2.5 outline-none focus:border-white/30 transition-colors appearance-none cursor-pointer"
            >
              <option value="all">All Customers</option>
              <option value="new">New (0 orders)</option>
              <option value="active">Active (1+ orders)</option>
              <option value="vip">VIP (5+ orders or $500+)</option>
            </select>
          </div>
        </div>
      </div>

      {/* Table Card */}
      <div className="bg-[#1e293b] border border-white/10 rounded-xl">
        <div className="px-6 py-4 border-b border-white/[0.07] flex items-center justify-between">
          <h2 className="text-white font-semibold font-gilroy">
            Customer List
          </h2>
          {!loading && (
            <span className="text-white/40 text-sm font-gilroy">
              {filtered.length} result{filtered.length !== 1 ? "s" : ""}
            </span>
          )}
        </div>

        {loading ? (
          <div className="divide-y divide-white/[0.05]">
            {Array.from({ length: 5 }).map((_, i) => (
              <SkeletonRow key={i} />
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <EmptyState
            icon={Users}
            title="No customers found"
            description={
              search
                ? "Try adjusting your search or filters."
                : "No customers have registered yet."
            }
          />
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-white/[0.05]">
                    <th className="px-6 py-3 text-left text-xs font-semibold text-white/40 uppercase tracking-wider font-gilroy">
                      Customer
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-white/40 uppercase tracking-wider font-gilroy whitespace-nowrap">
                      Join Date
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-white/40 uppercase tracking-wider font-gilroy">
                      Orders
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-white/40 uppercase tracking-wider font-gilroy whitespace-nowrap">
                      Total Spent
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-white/40 uppercase tracking-wider font-gilroy whitespace-nowrap">
                      Last Order
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-white/40 uppercase tracking-wider font-gilroy">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/[0.05]">
                  {paginated.map((customer) => (
                    <tr
                      key={customer.id}
                      className="hover:bg-white/[0.02] transition-colors"
                    >
                      {/* Customer */}
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 rounded-full bg-brand-primary/20 flex items-center justify-center flex-shrink-0">
                            <span className="text-brand-primary text-xs font-bold font-gilroy">
                              {getInitials(customer.username)}
                            </span>
                          </div>
                          <div>
                            <p className="text-white text-sm font-medium font-gilroy">
                              {customer.username}
                            </p>
                            <p className="text-white/40 text-xs font-gilroy">
                              ID: {customer.id.slice(0, 8)}
                            </p>
                          </div>
                        </div>
                      </td>

                      {/* Join Date */}
                      <td className="px-6 py-4">
                        <span className="text-white/60 text-sm font-gilroy">
                          {customer.joinedAt === "N/A"
                            ? "No orders yet"
                            : new Date(customer.joinedAt).toLocaleDateString(
                                "en-US",
                                {
                                  month: "short",
                                  day: "numeric",
                                  year: "numeric",
                                }
                              )}
                        </span>
                      </td>

                      {/* Orders */}
                      <td className="px-6 py-4">
                        <span className="text-white text-sm font-gilroy">
                          {customer.orderCount}
                        </span>
                      </td>

                      {/* Total Spent */}
                      <td className="px-6 py-4">
                        <span
                          className={`text-sm font-gilroy ${
                            customer.totalSpent > 100
                              ? "text-white font-bold"
                              : "text-white/60"
                          }`}
                        >
                          ${customer.totalSpent.toFixed(2)}
                        </span>
                      </td>

                      {/* Last Order */}
                      <td className="px-6 py-4">
                        <span className="text-white/60 text-sm font-gilroy">
                          {timeAgo(customer.lastOrderAt)}
                        </span>
                      </td>

                      {/* Actions */}
                      <td className="px-6 py-4">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleViewCustomer(customer)}
                          className="font-gilroy text-sm"
                        >
                          View
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="px-6 py-4 border-t border-white/[0.07] flex items-center justify-between gap-4">
                <p className="text-white/40 text-sm font-gilroy">
                  Page {page} of {totalPages}
                </p>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handlePageChange(page - 1)}
                    disabled={page === 1}
                    className="w-8 h-8 rounded-md bg-white/5 border border-white/10 flex items-center justify-center text-white/60 hover:text-white hover:bg-white/10 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                  >
                    <ChevronLeft className="w-4 h-4" />
                  </button>

                  {Array.from({ length: totalPages }, (_, i) => i + 1)
                    .filter(
                      (p) =>
                        p === 1 ||
                        p === totalPages ||
                        Math.abs(p - page) <= 1
                    )
                    .reduce<(number | "...")[]>((acc, p, idx, arr) => {
                      if (idx > 0 && p - (arr[idx - 1] as number) > 1) {
                        acc.push("...");
                      }
                      acc.push(p);
                      return acc;
                    }, [])
                    .map((item, idx) =>
                      item === "..." ? (
                        <span
                          key={`ellipsis-${idx}`}
                          className="text-white/40 text-sm font-gilroy px-1"
                        >
                          …
                        </span>
                      ) : (
                        <button
                          key={item}
                          onClick={() => handlePageChange(item as number)}
                          className={`w-8 h-8 rounded-md border text-sm font-gilroy transition-colors ${
                            page === item
                              ? "bg-brand-primary border-brand-primary text-white"
                              : "bg-white/5 border-white/10 text-white/60 hover:text-white hover:bg-white/10"
                          }`}
                        >
                          {item}
                        </button>
                      )
                    )}

                  <button
                    onClick={() => handlePageChange(page + 1)}
                    disabled={page === totalPages}
                    className="w-8 h-8 rounded-md bg-white/5 border border-white/10 flex items-center justify-center text-white/60 hover:text-white hover:bg-white/10 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                  >
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            )}
          </>
        )}
      </div>

      {/* Slide-Over: Customer Details */}
      <SlideOver
        open={slideOpen}
        onClose={() => setSlideOpen(false)}
        title={selectedCustomer?.username ?? "Customer"}
        width="xl"
      >
        {selectedCustomer && (
          <div className="space-y-6 font-gilroy">
            {/* Section 1: Customer Overview */}
            <div>
              <h3 className="text-white/60 text-xs font-semibold uppercase tracking-wider font-gilroy mb-4">
                Customer Overview
              </h3>

              {/* Large Avatar + Identity */}
              <div className="flex items-center gap-4 mb-5">
                <div className="w-16 h-16 rounded-full bg-brand-primary/20 flex items-center justify-center flex-shrink-0">
                  <span className="text-brand-primary text-xl font-bold font-gilroy">
                    {getInitials(selectedCustomer.username)}
                  </span>
                </div>
                <div>
                  <p className="text-white text-lg font-semibold font-gilroy">
                    {selectedCustomer.username}
                  </p>
                  <p className="text-white/40 text-xs font-gilroy mt-0.5">
                    Customer ID: {selectedCustomer.id}
                  </p>
                </div>
              </div>

              {/* Stats chips */}
              <div className="grid grid-cols-3 gap-3">
                <div className="bg-[#0f172a] border border-white/10 rounded-lg p-3 text-center">
                  <p className="text-white/40 text-xs font-gilroy mb-1">
                    Total Orders
                  </p>
                  <p className="text-white font-bold text-base font-gilroy">
                    {selectedCustomer.orderCount}
                  </p>
                </div>
                <div className="bg-[#0f172a] border border-white/10 rounded-lg p-3 text-center">
                  <p className="text-white/40 text-xs font-gilroy mb-1">
                    Total Spent
                  </p>
                  <p className="text-white font-bold text-base font-gilroy">
                    ${selectedCustomer.totalSpent.toFixed(2)}
                  </p>
                </div>
                <div className="bg-[#0f172a] border border-white/10 rounded-lg p-3 text-center">
                  <p className="text-white/40 text-xs font-gilroy mb-1">
                    Avg Order
                  </p>
                  <p className="text-white font-bold text-base font-gilroy">
                    ${avgOrderValue.toFixed(2)}
                  </p>
                </div>
              </div>
            </div>

            {/* Divider */}
            <div className="border-t border-white/[0.07]" />

            {/* Section 2: Order History */}
            <div>
              <div className="flex items-center gap-2 mb-4">
                <h3 className="text-white/60 text-xs font-semibold uppercase tracking-wider font-gilroy">
                  Order History
                </h3>
                <span className="text-white/40 text-xs font-gilroy">
                  ({selectedCustomer.orderCount} order
                  {selectedCustomer.orderCount !== 1 ? "s" : ""})
                </span>
              </div>

              {selectedCustomer.orders.length === 0 ? (
                <div className="bg-[#0f172a] rounded-lg p-4 text-center">
                  <p className="text-white/40 text-sm font-gilroy">
                    No orders placed yet
                  </p>
                </div>
              ) : (
                <div className="space-y-2">
                  {selectedCustomer.orders.map((order) => (
                    <div
                      key={order.id}
                      className="bg-[#0f172a] rounded-lg p-3"
                    >
                      <div className="flex items-start justify-between gap-2 mb-2">
                        <div>
                          <p className="text-white text-sm font-medium font-gilroy">
                            #{order.id.slice(0, 8).toUpperCase()}
                          </p>
                          <p className="text-white/40 text-xs font-gilroy mt-0.5">
                            {new Date(order.created_at).toLocaleDateString(
                              "en-US",
                              {
                                month: "short",
                                day: "numeric",
                                year: "numeric",
                              }
                            )}
                          </p>
                        </div>
                        <div className="flex items-center gap-2">
                          <StatusBadge status={order.status} />
                          <span className="text-white text-sm font-bold font-gilroy">
                            ${order.total.toFixed(2)}
                          </span>
                        </div>
                      </div>

                      {order.order_items && order.order_items.length > 0 && (
                        <div className="mt-2 pt-2 border-t border-white/[0.06] space-y-1">
                          {order.order_items.map((item, idx) => (
                            <p
                              key={idx}
                              className="text-white/50 text-xs font-gilroy"
                            >
                              {item.products?.name ?? "Unknown item"} ×{" "}
                              {item.quantity}
                            </p>
                          ))}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Divider */}
            <div className="border-t border-white/[0.07]" />

            {/* Section 3: Quick Stats */}
            <div>
              <h3 className="text-white/60 text-xs font-semibold uppercase tracking-wider font-gilroy mb-4">
                Quick Stats
              </h3>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-white/40 text-sm font-gilroy flex items-center gap-2">
                    <Calendar className="w-3.5 h-3.5" />
                    Member Since
                  </span>
                  <span className="text-white text-sm font-gilroy">
                    {selectedCustomer.joinedAt === "N/A"
                      ? "N/A"
                      : new Date(
                          selectedCustomer.joinedAt
                        ).toLocaleDateString("en-US", {
                          month: "short",
                          day: "numeric",
                          year: "numeric",
                        })}
                  </span>
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-white/40 text-sm font-gilroy flex items-center gap-2">
                    <ShoppingBag className="w-3.5 h-3.5" />
                    First Order
                  </span>
                  <span className="text-white text-sm font-gilroy">
                    {selectedCustomer.orders.length > 0
                      ? new Date(
                          selectedCustomer.orders[
                            selectedCustomer.orders.length - 1
                          ].created_at
                        ).toLocaleDateString("en-US", {
                          month: "short",
                          day: "numeric",
                          year: "numeric",
                        })
                      : "N/A"}
                  </span>
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-white/40 text-sm font-gilroy flex items-center gap-2">
                    <Package className="w-3.5 h-3.5" />
                    Most Recent Order
                  </span>
                  <span className="text-white text-sm font-gilroy">
                    {selectedCustomer.lastOrderAt
                      ? new Date(
                          selectedCustomer.lastOrderAt
                        ).toLocaleDateString("en-US", {
                          month: "short",
                          day: "numeric",
                          year: "numeric",
                        })
                      : "Never"}
                  </span>
                </div>

                {(() => {
                  const allItems = selectedCustomer.orders.flatMap(
                    (o) => o.order_items ?? []
                  );
                  const topItem =
                    allItems.length > 0
                      ? allItems.reduce((a, b) =>
                          (a.quantity ?? 0) >= (b.quantity ?? 0) ? a : b
                        )
                      : null;
                  return topItem?.products?.name ? (
                    <div className="flex items-center justify-between">
                      <span className="text-white/40 text-sm font-gilroy flex items-center gap-2">
                        <DollarSign className="w-3.5 h-3.5" />
                        Top Ordered Item
                      </span>
                      <span className="text-white text-sm font-gilroy max-w-[160px] truncate text-right">
                        {topItem.products.name}
                      </span>
                    </div>
                  ) : null;
                })()}
              </div>
            </div>
          </div>
        )}
      </SlideOver>
    </div>
  );
}
