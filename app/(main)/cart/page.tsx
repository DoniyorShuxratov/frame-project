"use client";

import Link from "next/link";
import { useCartStore } from "@/lib/store";
import { CartItem } from "@/components/CartItem";
import { Button } from "@/components/Button";

export default function CartPage() {
  const { items, getTotalPrice, clearCart } = useCartStore();
  const subtotal = getTotalPrice();
  const shipping  = subtotal > 150 ? 0 : 9.99;
  const total     = subtotal + shipping;

  if (items.length === 0) {
    return (
      <div className="max-w-7xl mx-auto px-ds-4 py-24 text-center">
        <div className="w-20 h-20 rounded-full bg-brand-bg flex items-center justify-center mx-auto mb-ds-6">
          <svg className="w-9 h-9 text-brand-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
              d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
          </svg>
        </div>
        <h1 className="font-gilroy font-bold text-h2 text-content-primary mb-3">
          Your cart is empty
        </h1>
        <p className="text-content-secondary font-gilroy text-body mb-ds-8">
          Looks like you haven&apos;t added anything yet.
        </p>
        <Link href="/products">
          <Button size="lg">Start Shopping</Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-ds-4 sm:px-ds-6 lg:px-ds-8 py-ds-10">
      <div className="flex items-center justify-between mb-ds-8">
        <h1 className="font-gilroy font-bold text-h1 text-content-primary">
          Cart <span className="text-content-secondary font-normal text-h3">({items.length})</span>
        </h1>
        <button
          onClick={clearCart}
          className="font-gilroy text-small font-medium text-content-secondary hover:text-error transition-colors"
        >
          Clear cart
        </button>
      </div>

      <div className="flex flex-col lg:flex-row gap-ds-10">
        {/* Items */}
        <div className="flex-1">
          {items.map((item) => (
            <CartItem key={`${item.product.id}-${item.size}`} item={item} />
          ))}
          <Link
            href="/products"
            className="inline-flex items-center gap-2 mt-ds-6 font-gilroy text-small font-semibold text-content-secondary hover:text-brand-primary transition-colors"
          >
            ← Continue Shopping
          </Link>
        </div>

        {/* Summary */}
        <div className="lg:w-80 flex-shrink-0">
          <div className="bg-surface-card border border-stroke-default rounded-xl p-ds-6 sticky top-24">
            <h2 className="font-gilroy font-bold text-h4 text-content-primary mb-ds-6">
              Order Summary
            </h2>

            <div className="space-y-3 mb-ds-6">
              <div className="flex justify-between font-gilroy text-body text-content-secondary">
                <span>Subtotal</span>
                <span>${subtotal.toFixed(2)}</span>
              </div>
              <div className="flex justify-between font-gilroy text-body text-content-secondary">
                <span>Shipping</span>
                <span>
                  {shipping === 0
                    ? <span className="text-success font-semibold">Free</span>
                    : `$${shipping.toFixed(2)}`}
                </span>
              </div>
              {shipping > 0 && (
                <p className="text-xs text-content-secondary bg-info-bg rounded-sm px-3 py-2">
                  Add <strong className="text-content-primary">${(150 - subtotal).toFixed(2)}</strong> more for free shipping
                </p>
              )}
            </div>

            <div className="border-t border-stroke-default pt-ds-4 mb-ds-6 flex justify-between items-center">
              <span className="font-gilroy font-bold text-h5 text-content-primary">Total</span>
              <span className="font-gilroy font-bold text-h4 text-content-primary">
                ${total.toFixed(2)}
              </span>
            </div>

            <Link href="/checkout">
              <Button fullWidth size="lg">Proceed to Checkout</Button>
            </Link>

            <div className="mt-ds-4 flex items-center justify-center gap-2 text-content-secondary">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                  d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
              </svg>
              <span className="text-xs font-gilroy">Secure checkout</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
