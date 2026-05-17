"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { createClient } from "@/lib/supabase/client";

interface Product {
  id: string; name: string; category: string; price: number;
  stock: number; image_url: string;
}

export default function AdminProductsPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading]   = useState(true);
  const [deleting, setDeleting] = useState<string | null>(null);

  useEffect(() => {
    load();
  }, []);

  async function load() {
    const supabase = createClient();
    const { data } = await supabase.from("products").select("*").order("created_at", { ascending: false });
    if (data) setProducts(data as Product[]);
    setLoading(false);
  }

  async function handleDelete(id: string) {
    if (!confirm("Delete this product?")) return;
    setDeleting(id);
    const supabase = createClient();
    await supabase.from("products").delete().eq("id", id);
    setProducts((prev) => prev.filter((p) => p.id !== id));
    setDeleting(null);
  }

  return (
    <div className="p-6 lg:p-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="font-gilroy font-bold text-h2 text-white">Products</h1>
          <p className="font-gilroy text-small text-white/50 mt-1">{products.length} total</p>
        </div>
        <Link
          href="/admin/products/new"
          className="bg-brand-primary text-white font-gilroy font-semibold text-small px-5 py-2.5 rounded-md hover:opacity-90 transition-opacity"
        >
          + Add Product
        </Link>
      </div>

      {loading ? (
        <div className="space-y-3">
          {[1, 2, 3, 4, 5].map((i) => (
            <div key={i} className="bg-[#1e293b] border border-white/10 rounded-xl p-4 animate-pulse h-20" />
          ))}
        </div>
      ) : products.length === 0 ? (
        <div className="bg-[#1e293b] border border-white/10 rounded-xl p-12 text-center">
          <p className="font-gilroy text-white/40 text-body">No products yet.</p>
          <Link href="/admin/products/new" className="text-brand-primary font-semibold font-gilroy text-small mt-2 inline-block hover:underline">
            Add your first product →
          </Link>
        </div>
      ) : (
        <div className="bg-[#1e293b] border border-white/10 rounded-xl overflow-hidden">
          <table className="w-full font-gilroy text-sm">
            <thead>
              <tr className="border-b border-white/10">
                {["Product", "Category", "Price", "Stock", ""].map((h) => (
                  <th key={h} className="text-left py-3 px-4 text-white/50 font-semibold text-xs uppercase tracking-widest">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {products.map((product) => (
                <tr key={product.id} className="border-b border-white/5 hover:bg-white/5 transition-colors">
                  <td className="py-3 px-4">
                    <div className="flex items-center gap-3">
                      <div className="relative w-10 h-10 rounded-md overflow-hidden bg-white/10 flex-shrink-0">
                        <Image src={product.image_url} alt={product.name} fill className="object-cover" />
                      </div>
                      <span className="text-white font-semibold truncate max-w-[180px]">{product.name}</span>
                    </div>
                  </td>
                  <td className="py-3 px-4 text-white/60 capitalize">{product.category}</td>
                  <td className="py-3 px-4 text-white font-semibold">${product.price.toFixed(2)}</td>
                  <td className="py-3 px-4">
                    <span className={`font-semibold ${product.stock === 0 ? "text-error" : product.stock < 5 ? "text-warning" : "text-success"}`}>
                      {product.stock}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-right">
                    <div className="flex items-center justify-end gap-3">
                      <a href={`/admin/products/${product.id}`}
                        className="text-brand-primary/70 hover:text-brand-primary font-semibold text-xs transition-colors">
                        Edit
                      </a>
                      <button
                        onClick={() => handleDelete(product.id)}
                        disabled={deleting === product.id}
                        className="text-error/70 hover:text-error font-semibold text-xs transition-colors disabled:opacity-40"
                      >
                        {deleting === product.id ? "Deleting…" : "Delete"}
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
