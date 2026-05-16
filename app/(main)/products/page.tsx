"use client";

import { useState, useMemo } from "react";
import { products, categories } from "@/lib/products";
import { ProductCard } from "@/components/ProductCard";

const sizes = ["XS", "S", "M", "L", "XL", "2XL", "28", "30", "32", "34", "36", "One Size"];

const priceRanges = [
  { label: "Under $50",    min: 0,   max: 50 },
  { label: "$50 – $100",   min: 50,  max: 100 },
  { label: "$100 – $150",  min: 100, max: 150 },
  { label: "Over $150",    min: 150, max: Infinity },
];

const sortOptions = [
  { value: "default",    label: "Featured" },
  { value: "price-asc",  label: "Price: Low to High" },
  { value: "price-desc", label: "Price: High to Low" },
  { value: "rating",     label: "Top Rated" },
];

export default function ProductsPage() {
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [selectedSizes, setSelectedSizes]       = useState<string[]>([]);
  const [selectedPrice, setSelectedPrice]       = useState<number | null>(null);
  const [sortBy, setSortBy]                     = useState("default");
  const [mobileFilterOpen, setMobileFilterOpen] = useState(false);

  const filtered = useMemo(() => {
    let list = [...products];
    if (selectedCategory !== "All")
      list = list.filter((p) => p.category === selectedCategory);
    if (selectedSizes.length > 0)
      list = list.filter((p) => p.sizes.some((s) => selectedSizes.includes(s)));
    if (selectedPrice !== null) {
      const r = priceRanges[selectedPrice];
      list = list.filter((p) => p.price >= r.min && p.price < r.max);
    }
    if (sortBy === "price-asc")  list.sort((a, b) => a.price - b.price);
    if (sortBy === "price-desc") list.sort((a, b) => b.price - a.price);
    if (sortBy === "rating")     list.sort((a, b) => b.rating - a.rating);
    return list;
  }, [selectedCategory, selectedSizes, selectedPrice, sortBy]);

  function toggleSize(size: string) {
    setSelectedSizes((prev) =>
      prev.includes(size) ? prev.filter((s) => s !== size) : [...prev, size]
    );
  }

  function clearFilters() {
    setSelectedCategory("All");
    setSelectedSizes([]);
    setSelectedPrice(null);
    setSortBy("default");
  }

  const hasFilters = selectedCategory !== "All" || selectedSizes.length > 0 || selectedPrice !== null;

  const FilterCheckbox = ({
    active,
    label,
    onClick,
  }: { active: boolean; label: string; onClick: () => void }) => (
    <button
      onClick={onClick}
      className={[
        "flex items-center gap-2 w-full text-left font-gilroy text-body transition-colors",
        active ? "text-brand-primary font-semibold" : "text-content-secondary hover:text-content-primary",
      ].join(" ")}
    >
      <span
        className={[
          "w-4 h-4 rounded-sm border-2 flex-shrink-0 flex items-center justify-center transition-colors",
          active ? "bg-brand-primary border-brand-primary" : "border-stroke-default",
        ].join(" ")}
      >
        {active && (
          <svg className="w-2.5 h-2.5 text-content-inverse" fill="currentColor" viewBox="0 0 12 12">
            <path d="M10 3L5 8.5 2 5.5" stroke="white" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" fill="none" />
          </svg>
        )}
      </span>
      {label}
    </button>
  );

  const FiltersPanel = () => (
    <div className="space-y-ds-8">
      {/* Category */}
      <div>
        <h3 className="font-gilroy font-bold text-small text-content-primary uppercase tracking-widest mb-ds-4">
          Category
        </h3>
        <div className="space-y-2.5">
          {categories.map((cat) => (
            <FilterCheckbox
              key={cat}
              active={selectedCategory === cat}
              label={cat}
              onClick={() => setSelectedCategory(cat)}
            />
          ))}
        </div>
      </div>

      {/* Price */}
      <div>
        <h3 className="font-gilroy font-bold text-small text-content-primary uppercase tracking-widest mb-ds-4">
          Price
        </h3>
        <div className="space-y-2.5">
          {priceRanges.map((range, idx) => (
            <FilterCheckbox
              key={range.label}
              active={selectedPrice === idx}
              label={range.label}
              onClick={() => setSelectedPrice(selectedPrice === idx ? null : idx)}
            />
          ))}
        </div>
      </div>

      {/* Size */}
      <div>
        <h3 className="font-gilroy font-bold text-small text-content-primary uppercase tracking-widest mb-ds-4">
          Size
        </h3>
        <div className="flex flex-wrap gap-2">
          {sizes.map((size) => (
            <button
              key={size}
              onClick={() => toggleSize(size)}
              className={[
                "px-3 py-1.5 border rounded-sm text-small font-gilroy font-medium transition-all",
                selectedSizes.includes(size)
                  ? "bg-brand-primary text-content-inverse border-brand-primary"
                  : "border-stroke-default text-content-secondary hover:border-brand-primary hover:text-brand-primary",
              ].join(" ")}
            >
              {size}
            </button>
          ))}
        </div>
      </div>

      {hasFilters && (
        <button
          onClick={clearFilters}
          className="font-gilroy text-small font-semibold text-error underline"
        >
          Clear all filters
        </button>
      )}
    </div>
  );

  return (
    <div className="max-w-7xl mx-auto px-ds-4 sm:px-ds-6 lg:px-ds-8 py-ds-10">
      {/* Header row */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-ds-8">
        <div>
          <h1 className="font-gilroy font-bold text-h1 text-content-primary">Shop All</h1>
          <p className="text-content-secondary font-gilroy text-body mt-1">
            {filtered.length} product{filtered.length !== 1 ? "s" : ""}
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
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="border border-stroke-default rounded-md px-3 py-2 font-gilroy text-small text-content-primary bg-surface-card outline-none focus:border-stroke-focus"
          >
            {sortOptions.map((o) => (
              <option key={o.value} value={o.value}>{o.label}</option>
            ))}
          </select>
        </div>
      </div>

      <div className="flex gap-ds-10">
        {/* Desktop sidebar */}
        <aside className="hidden md:block w-56 flex-shrink-0">
          <FiltersPanel />
        </aside>

        {/* Mobile drawer */}
        {mobileFilterOpen && (
          <div
            className="fixed inset-0 z-40 bg-surface-overlay md:hidden"
            onClick={() => setMobileFilterOpen(false)}
          >
            <div
              className="absolute left-0 top-0 h-full w-72 bg-surface-card p-ds-6 overflow-y-auto rounded-r-xl shadow-lg"
              onClick={(e) => e.stopPropagation()}
            >
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

        {/* Product grid */}
        <div className="flex-1">
          {filtered.length === 0 ? (
            <div className="text-center py-20">
              <p className="font-gilroy font-semibold text-h4 text-content-secondary">
                No products found
              </p>
              <button
                onClick={clearFilters}
                className="mt-4 font-gilroy text-body text-brand-primary underline"
              >
                Clear filters
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-ds-6">
              {filtered.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
