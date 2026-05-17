"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { createClient } from "@/lib/supabase/client";
import { Badge } from "@/components/Badge";
import { useCartStore } from "@/lib/store";

interface Product {
  id: string; name: string; description: string; price: number;
  category: string; sizes: string[]; image_url: string; stock: number;
}

const ALL = "All";

export default function HomePage() {
  const [products, setProducts]   = useState<Product[]>([]);
  const [category, setCategory]   = useState(ALL);
  const [categories, setCategories] = useState<string[]>([ALL]);
  const [loading, setLoading]     = useState(true);
  const addItem = useCartStore((s) => s.addItem);

  useEffect(() => {
    async function load() {
      const supabase = createClient();
      const { data } = await supabase.from("products").select("*").order("created_at", { ascending: false });
      if (data) {
        setProducts(data);
        const cats = [ALL, ...Array.from(new Set(data.map((p: Product) => p.category)))];
        setCategories(cats);
      }
      setLoading(false);
    }
    load();
  }, []);

  const filtered = category === ALL ? products : products.filter((p) => p.category === category);

  function quickAdd(product: Product) {
    addItem(
      {
        id: product.id, name: product.name, price: product.price,
        category: product.category, sizes: product.sizes,
        image: product.image_url, description: product.description,
        rating: 5, reviews: 0,
      },
      product.sizes[0] ?? "M"
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-ds-4 sm:px-ds-6 lg:px-ds-8 py-ds-10">

      {/* Banner */}
      <Link href="/products" className="block mb-ds-10 rounded-xl overflow-hidden">
        <div className="relative w-full" style={{ aspectRatio: "1390 / 430" }}>
          <Image
            src="/images/banner-1.png"
            alt="Shop banner"
            fill
            className="object-cover"
            priority
          />
        </div>
      </Link>

      {/* Header */}
      <div className="flex items-center justify-between mb-ds-8">
        <div>
          <h1 className="font-gilroy font-bold text-h1 text-content-primary">Shop</h1>
          <p className="text-content-secondary font-gilroy text-body mt-1">
            {filtered.length} product{filtered.length !== 1 ? "s" : ""}
          </p>
        </div>
        <Link href="/orders" className="font-gilroy text-small font-semibold text-brand-primary hover:underline">
          My Orders →
        </Link>
      </div>

      {/* Category filters */}
      <div className="flex flex-wrap gap-2 mb-ds-8">
        {categories.map((cat) => (
          <button
            key={cat}
            onClick={() => setCategory(cat)}
            className={[
              "px-ds-4 py-ds-1.5 font-gilroy font-semibold text-small uppercase tracking-widest rounded-full border transition-all",
              category === cat
                ? "bg-brand-primary text-content-inverse border-brand-primary"
                : "bg-surface-card text-content-secondary border-stroke-default hover:border-brand-primary hover:text-brand-primary",
            ].join(" ")}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Grid */}
      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-ds-6">
          {Array.from({ length: 8 }).map((_, i) => (
            <div key={i} className="bg-surface-card border border-stroke-default rounded-xl overflow-hidden animate-pulse">
              <div className="aspect-[3/4] bg-surface-item" />
              <div className="p-ds-4 space-y-2">
                <div className="h-3 bg-surface-item rounded w-1/3" />
                <div className="h-4 bg-surface-item rounded w-3/4" />
                <div className="h-5 bg-surface-item rounded w-1/4" />
              </div>
            </div>
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-20">
          <p className="font-gilroy font-semibold text-h4 text-content-secondary">No products yet</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-ds-6">
          {filtered.map((product) => (
            <Link key={product.id} href={`/products/${product.id}`} className="group block">
              <div className="bg-surface-card border border-stroke-default rounded-xl overflow-hidden transition-colors">
                <div className="relative aspect-[3/4] bg-surface-item overflow-hidden rounded-t-xl">
                  <Image
                    src={product.image_url}
                    alt={product.name}
                    fill
                    sizes="(max-width: 640px) 100vw, 33vw"
                    className="object-cover transition-transform duration-500 group-hover:scale-105"
                  />
                  {product.stock < 5 && product.stock > 0 && (
                    <div className="absolute top-3 left-3">
                      <Badge variant="warning">Low Stock</Badge>
                    </div>
                  )}
                  {product.stock === 0 && (
                    <div className="absolute top-3 left-3">
                      <Badge variant="neutral">Sold Out</Badge>
                    </div>
                  )}
                  <button
                    onClick={(e) => { e.preventDefault(); quickAdd(product); }}
                    className="absolute bottom-0 left-0 right-0 bg-brand-primary text-content-inverse font-gilroy font-semibold text-small py-3 translate-y-full group-hover:translate-y-0 transition-transform duration-300"
                  >
                    Quick Add — {product.sizes[0] ?? "One Size"}
                  </button>
                </div>
                <div className="p-ds-4">
                  <p className="text-xs text-content-secondary font-gilroy uppercase tracking-widest mb-1">
                    {product.category}
                  </p>
                  <h3 className="text-body font-gilroy font-semibold text-content-primary leading-snug mb-2 line-clamp-2">
                    {product.name}
                  </h3>
                  <span className="text-h5 font-gilroy font-bold text-content-primary">
                    ${product.price.toFixed(2)}
                  </span>
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
