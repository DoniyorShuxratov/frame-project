"use client";

import { useState, useMemo, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { createClient } from "@/lib/supabase/client";
import { Badge } from "@/components/Badge";
import { useCartStore } from "@/lib/store";

interface Product {
  id: string; name: string; description: string; price: number;
  category: string; sizes: string[]; image_url: string; stock: number;
}

const priceRanges = [
  { label: "Under $50",   min: 0,   max: 50 },
  { label: "$50 – $100",  min: 50,  max: 100 },
  { label: "$100 – $150", min: 100, max: 150 },
  { label: "Over $150",   min: 150, max: Infinity },
];

const sortOptions = [
  { value: "default",    label: "Featured" },
  { value: "price-asc",  label: "Price: Low to High" },
  { value: "price-desc", label: "Price: High to Low" },
];

export default function ProductsPage() {
  const [products, setProducts]         = useState<Product[]>([]);
  const [loading, setLoading]           = useState(true);
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [selectedSizes, setSelectedSizes]       = useState<string[]>([]);
  const [selectedPrice, setSelectedPrice]       = useState<number | null>(null);
  const [sortBy, setSortBy]                     = useState("default");
  const [mobileFilterOpen, setMobileFilterOpen] = useState(false);
  const addItem = useCartStore((s) => s.addItem);

  useEffect(() => {
    async function load() {
      const supabase = createClient();
      const { data } = await supabase.from("products").select("*").order("created_at", { ascending: false });
      if (data) setProducts(data as Product[]);
      setLoading(false);
    }
    load();
  }, []);

  const categories = ["All", ...Array.from(new Set(products.map((p) => p.category)))];
  const allSizes   = Array.from(new Set(products.flatMap((p) => p.sizes)));

  const filtered = useMemo(() => {
    let list = [...products];
    if (selectedCategory !== "All") list = list.filter((p) => p.category === selectedCategory);
    if (selectedSizes.length > 0)   list = list.filter((p) => p.sizes.some((s) => selectedSizes.includes(s)));
    if (selectedPrice !== null) {
      const r = priceRanges[selectedPrice];
      list = list.filter((p) => p.price >= r.min && p.price < r.max);
    }
    if (sortBy === "price-asc")  list.sort((a, b) => a.price - b.price);
    if (sortBy === "price-desc") list.sort((a, b) => b.price - a.price);
    return list;
  }, [products, selectedCategory, selectedSizes, selectedPrice, sortBy]);

  function toggleSize(size: string) {
    setSelectedSizes((prev) => prev.includes(size) ? prev.filter((s) => s !== size) : [...prev, size]);
  }

  function clearFilters() {
    setSelectedCategory("All"); setSelectedSizes([]); setSelectedPrice(null); setSortBy("default");
  }

  function quickAdd(product: Product) {
    addItem({
      id: product.id, name: product.name, price: product.price,
      category: product.category, sizes: product.sizes,
      image: product.image_url, description: product.description,
      rating: 5, reviews: 0,
    }, product.sizes[0] ?? "M");
  }

  const hasFilters = selectedCategory !== "All" || selectedSizes.length > 0 || selectedPrice !== null;

  const FiltersPanel = () => (
    <div className="space-y-ds-8">
      <div>
        <h3 className="font-gilroy font-bold text-small text-content-primary uppercase tracking-widest mb-ds-4">Category</h3>
        <div className="space-y-2.5">
          {categories.map((cat) => (
            <button key={cat} onClick={() => setSelectedCategory(cat)}
              className={["flex items-center gap-2 w-full text-left font-gilroy text-body transition-colors",
                selectedCategory === cat ? "text-brand-primary font-semibold" : "text-content-secondary hover:text-content-primary"].join(" ")}>
              <span className={["w-4 h-4 rounded-sm border-2 flex-shrink-0 flex items-center justify-center transition-colors",
                selectedCategory === cat ? "bg-brand-primary border-brand-primary" : "border-stroke-default"].join(" ")}>
                {selectedCategory === cat && (
                  <svg className="w-2.5 h-2.5" fill="none" viewBox="0 0 12 12">
                    <path d="M10 3L5 8.5 2 5.5" stroke="white" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                )}
              </span>
              {cat}
            </button>
          ))}
        </div>
      </div>

      <div>
        <h3 className="font-gilroy font-bold text-small text-content-primary uppercase tracking-widest mb-ds-4">Price</h3>
        <div className="space-y-2.5">
          {priceRanges.map((range, idx) => (
            <button key={range.label} onClick={() => setSelectedPrice(selectedPrice === idx ? null : idx)}
              className={["flex items-center gap-2 w-full text-left font-gilroy text-body transition-colors",
                selectedPrice === idx ? "text-brand-primary font-semibold" : "text-content-secondary hover:text-content-primary"].join(" ")}>
              <span className={["w-4 h-4 rounded-sm border-2 flex-shrink-0 flex items-center justify-center transition-colors",
                selectedPrice === idx ? "bg-brand-primary border-brand-primary" : "border-stroke-default"].join(" ")}>
                {selectedPrice === idx && (
                  <svg className="w-2.5 h-2.5" fill="none" viewBox="0 0 12 12">
                    <path d="M10 3L5 8.5 2 5.5" stroke="white" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                )}
              </span>
              {range.label}
            </button>
          ))}
        </div>
      </div>

      {allSizes.length > 0 && (
        <div>
          <h3 className="font-gilroy font-bold text-small text-content-primary uppercase tracking-widest mb-ds-4">Size</h3>
          <div className="flex flex-wrap gap-2">
            {allSizes.map((size) => (
              <button key={size} onClick={() => toggleSize(size)}
                className={["px-3 py-1.5 border rounded-sm text-small font-gilroy font-medium transition-all",
                  selectedSizes.includes(size)
                    ? "bg-brand-primary text-content-inverse border-brand-primary"
                    : "border-stroke-default text-content-secondary hover:border-brand-primary hover:text-brand-primary"].join(" ")}>
                {size}
              </button>
            ))}
          </div>
        </div>
      )}

      {hasFilters && (
        <button onClick={clearFilters} className="font-gilroy text-small font-semibold text-error underline">
          Clear all filters
        </button>
      )}
    </div>
  );

  return (
    <div className="max-w-7xl mx-auto px-3 sm:px-ds-6 lg:px-ds-8 py-ds-6 sm:py-ds-10">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-ds-4 sm:mb-ds-8">
        <div>
          <h1 className="font-gilroy font-bold text-h3 sm:text-h1 text-content-primary">Shop All</h1>
          <p className="text-content-secondary font-gilroy text-small sm:text-body mt-0.5">
            {loading ? "Loading…" : `${filtered.length} product${filtered.length !== 1 ? "s" : ""}`}
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button
            className="md:hidden flex items-center gap-2 border border-stroke-default rounded-md px-ds-4 py-ds-1.5 font-gilroy text-small font-semibold text-content-primary hover:border-brand-primary hover:text-brand-primary transition-colors"
            onClick={() => setMobileFilterOpen((o) => !o)}
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2a1 1 0 01-.293.707L13 13.414V19a1 1 0 01-.553.894l-4 2A1 1 0 017 21v-7.586L3.293 6.707A1 1 0 013 6V4z" />
            </svg>
            Filters
          </button>
          <select value={sortBy} onChange={(e) => setSortBy(e.target.value)}
            className="border border-stroke-default rounded-md px-3 py-2 font-gilroy text-small text-content-primary bg-surface-card outline-none focus:border-stroke-focus">
            {sortOptions.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
          </select>
        </div>
      </div>

      <div className="flex gap-ds-10">
        <aside className="hidden md:block w-56 flex-shrink-0">
          <FiltersPanel />
        </aside>

        {mobileFilterOpen && (
          <div className="fixed inset-0 z-40 bg-black/40 md:hidden" onClick={() => setMobileFilterOpen(false)}>
            <div className="absolute left-0 top-0 h-full w-72 bg-surface-card p-ds-6 overflow-y-auto" onClick={(e) => e.stopPropagation()}>
              <div className="flex justify-between items-center mb-ds-6">
                <h2 className="font-gilroy font-bold text-h4">Filters</h2>
                <button onClick={() => setMobileFilterOpen(false)}>
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
              <FiltersPanel />
            </div>
          </div>
        )}

        <div className="flex-1">
          {loading ? (
            <div className="grid grid-cols-2 xl:grid-cols-3 gap-2 sm:gap-ds-6">
              {Array.from({ length: 6 }).map((_, i) => (
                <div key={i} className="bg-surface-card border border-stroke-default rounded-md sm:rounded-xl overflow-hidden animate-pulse">
                  <div className="aspect-[3/4] bg-surface-item" />
                  <div className="p-2 sm:p-ds-4 space-y-1.5">
                    <div className="h-2.5 bg-surface-item rounded w-1/3" />
                    <div className="h-3 bg-surface-item rounded w-3/4" />
                    <div className="h-4 bg-surface-item rounded w-1/4" />
                  </div>
                </div>
              ))}
            </div>
          ) : filtered.length === 0 ? (
            <div className="text-center py-20">
              <p className="font-gilroy font-semibold text-h4 text-content-secondary">No products found</p>
              {hasFilters && (
                <button onClick={clearFilters} className="mt-4 font-gilroy text-body text-brand-primary underline">Clear filters</button>
              )}
            </div>
          ) : (
            <div className="grid grid-cols-2 xl:grid-cols-3 gap-2 sm:gap-ds-6">
              {filtered.map((product) => (
                <Link key={product.id} href={`/products/${product.id}`} className="group block">
                  <div className="bg-surface-card border border-stroke-default rounded-md sm:rounded-xl overflow-hidden transition-colors">
                    <div className="relative aspect-[3/4] bg-surface-item overflow-hidden rounded-t-md sm:rounded-t-xl">
                      <Image src={product.image_url} alt={product.name} fill
                        sizes="(max-width: 640px) 50vw, 33vw"
                        className="object-cover transition-transform duration-500 group-hover:scale-105" />
                      {product.stock < 5 && product.stock > 0 && (
                        <div className="absolute top-2 left-2"><Badge variant="warning">Low Stock</Badge></div>
                      )}
                      {product.stock === 0 && (
                        <div className="absolute top-2 left-2"><Badge variant="neutral">Sold Out</Badge></div>
                      )}
                      <button onClick={(e) => { e.preventDefault(); quickAdd(product); }}
                        className="absolute bottom-0 left-0 right-0 bg-brand-primary text-content-inverse font-gilroy font-semibold text-xs sm:text-small py-2 sm:py-3 translate-y-full group-hover:translate-y-0 transition-transform duration-300">
                        Quick Add — {product.sizes[0] ?? "One Size"}
                      </button>
                    </div>
                    <div className="p-2 sm:p-ds-4">
                      <p className="text-xs text-content-secondary font-gilroy uppercase tracking-widest mb-0.5 sm:mb-1 truncate">{product.category}</p>
                      <h3 className="text-xs sm:text-body font-gilroy font-semibold text-content-primary leading-snug mb-1 sm:mb-2 line-clamp-2">{product.name}</h3>
                      <span className="text-small sm:text-h5 font-gilroy font-bold text-content-primary">${product.price.toFixed(2)}</span>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
