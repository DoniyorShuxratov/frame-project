"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useCartStore } from "@/lib/store";
import { createClient } from "@/lib/supabase/client";
import { Input } from "@/components/Input";
import { Button } from "@/components/Button";

export default function CheckoutPage() {
  const router = useRouter();
  const { items, getTotalPrice, clearCart } = useCartStore();
  const subtotal = getTotalPrice();
  const shipping  = subtotal > 150 ? 0 : 9.99;
  const total     = subtotal + shipping;

  const [form, setForm] = useState({
    firstName: "", lastName: "", email: "", phone: "",
    address: "", city: "", state: "", zip: "", country: "US",
    cardName: "", cardNumber: "", expiry: "", cvv: "",
  });
  const [errors, setErrors]       = useState<Record<string, string>>({});
  const [submitting, setSubmitting] = useState(false);

  function handleChange(e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) {
    const { name, value } = e.target;
    setForm((p) => ({ ...p, [name]: value }));
    if (errors[name]) setErrors((p) => ({ ...p, [name]: "" }));
  }

  function validate() {
    const e: Record<string, string> = {};
    if (!form.firstName.trim())    e.firstName   = "Required";
    if (!form.lastName.trim())     e.lastName    = "Required";
    if (!form.email.includes("@")) e.email       = "Valid email required";
    if (!form.address.trim())      e.address     = "Required";
    if (!form.city.trim())         e.city        = "Required";
    if (!form.zip.trim())          e.zip         = "Required";
    if (!form.cardNumber.trim())   e.cardNumber  = "Required";
    if (!form.expiry.trim())       e.expiry      = "Required";
    if (!form.cvv.trim())          e.cvv         = "Required";
    return e;
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const newErrors = validate();
    if (Object.keys(newErrors).length > 0) { setErrors(newErrors); return; }

    setSubmitting(true);
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) { router.push("/login"); return; }

    // Create order
    const { data: order, error: orderError } = await supabase
      .from("orders")
      .insert({ customer_id: user.id, total, status: "pending" })
      .select()
      .single();

    if (orderError || !order) {
      setSubmitting(false);
      alert("Failed to place order. Please try again.");
      return;
    }

    // Create order items
    const orderItems = items.map((item) => ({
      order_id: order.id,
      product_id: item.product.id,
      quantity: item.quantity,
      size: item.size,
      price: item.product.price,
    }));

    await supabase.from("order_items").insert(orderItems);

    clearCart();
    router.push("/orders");
  }

  if (items.length === 0) {
    return (
      <div className="max-w-7xl mx-auto px-ds-4 py-24 text-center">
        <h1 className="font-gilroy font-bold text-h2 mb-ds-4">Nothing to checkout</h1>
        <Link href="/home"><Button>Continue Shopping</Button></Link>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-ds-4 sm:px-ds-6 lg:px-ds-8 py-ds-10">
      <h1 className="font-gilroy font-bold text-h1 text-content-primary mb-ds-10">Checkout</h1>

      <form onSubmit={handleSubmit} className="flex flex-col lg:flex-row gap-ds-12">
        <div className="flex-1 space-y-ds-10">
          {/* Contact */}
          <section>
            <h2 className="font-gilroy font-bold text-h4 text-content-primary mb-ds-6 pb-ds-4 border-b border-stroke-default">
              Contact Information
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-ds-4">
              <Input label="First Name" name="firstName" value={form.firstName} onChange={handleChange} error={errors.firstName} placeholder="Jane" />
              <Input label="Last Name" name="lastName" value={form.lastName} onChange={handleChange} error={errors.lastName} placeholder="Doe" />
              <Input label="Email" name="email" type="email" value={form.email} onChange={handleChange} error={errors.email} placeholder="jane@example.com" wrapperClassName="sm:col-span-2" />
              <Input label="Phone (optional)" name="phone" type="tel" value={form.phone} onChange={handleChange} placeholder="+1 (555) 000-0000" wrapperClassName="sm:col-span-2" />
            </div>
          </section>

          {/* Shipping */}
          <section>
            <h2 className="font-gilroy font-bold text-h4 text-content-primary mb-ds-6 pb-ds-4 border-b border-stroke-default">
              Shipping Address
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-ds-4">
              <Input label="Street Address" name="address" value={form.address} onChange={handleChange} error={errors.address} placeholder="123 Main St" wrapperClassName="sm:col-span-2" />
              <Input label="City" name="city" value={form.city} onChange={handleChange} error={errors.city} placeholder="New York" />
              <Input label="State" name="state" value={form.state} onChange={handleChange} placeholder="NY" />
              <Input label="ZIP Code" name="zip" value={form.zip} onChange={handleChange} error={errors.zip} placeholder="10001" />
              <div className="flex flex-col gap-1.5">
                <label className="font-gilroy font-semibold text-small text-content-primary">Country</label>
                <select name="country" value={form.country} onChange={handleChange}
                  className="border border-stroke-default rounded-md px-ds-4 py-ds-2.5 font-gilroy text-body bg-surface-card text-content-primary outline-none focus:border-stroke-focus">
                  <option value="US">United States</option>
                  <option value="GB">United Kingdom</option>
                  <option value="CA">Canada</option>
                  <option value="AU">Australia</option>
                </select>
              </div>
            </div>
          </section>

          {/* Payment */}
          <section>
            <h2 className="font-gilroy font-bold text-h4 text-content-primary mb-2 pb-ds-4 border-b border-stroke-default">
              Payment
            </h2>
            <p className="text-small text-content-secondary font-gilroy mb-ds-6 bg-info-bg rounded-md px-4 py-3">
              Demo checkout — no real payment processed.
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-ds-4">
              <Input label="Name on Card" name="cardName" value={form.cardName} onChange={handleChange} placeholder="Jane Doe" wrapperClassName="sm:col-span-2" />
              <Input label="Card Number" name="cardNumber" value={form.cardNumber} onChange={handleChange} error={errors.cardNumber} placeholder="4242 4242 4242 4242" wrapperClassName="sm:col-span-2" />
              <Input label="Expiry" name="expiry" value={form.expiry} onChange={handleChange} error={errors.expiry} placeholder="MM / YY" />
              <Input label="CVV" name="cvv" value={form.cvv} onChange={handleChange} error={errors.cvv} placeholder="123" />
            </div>
          </section>
        </div>

        {/* Summary */}
        <div className="lg:w-80 flex-shrink-0">
          <div className="bg-surface-card border border-stroke-default rounded-xl p-ds-6 sticky top-24">
            <h2 className="font-gilroy font-bold text-h4 text-content-primary mb-ds-5">Order Summary</h2>
            <div className="space-y-3 mb-ds-5">
              {items.map((item) => (
                <div key={`${item.product.id}-${item.size}`} className="flex justify-between text-body font-gilroy text-content-secondary">
                  <span className="truncate mr-2">{item.product.name} <span className="text-small">×{item.quantity}</span></span>
                  <span className="flex-shrink-0">${(item.product.price * item.quantity).toFixed(2)}</span>
                </div>
              ))}
            </div>
            <div className="border-t border-stroke-default pt-ds-4 space-y-2 mb-ds-5">
              <div className="flex justify-between font-gilroy text-body text-content-secondary">
                <span>Subtotal</span><span>${subtotal.toFixed(2)}</span>
              </div>
              <div className="flex justify-between font-gilroy text-body text-content-secondary">
                <span>Shipping</span>
                <span>{shipping === 0 ? <span className="text-success font-semibold">Free</span> : `$${shipping.toFixed(2)}`}</span>
              </div>
            </div>
            <div className="border-t border-stroke-default pt-ds-4 flex justify-between items-center mb-ds-6">
              <span className="font-gilroy font-bold text-h5 text-content-primary">Total</span>
              <span className="font-gilroy font-bold text-h4 text-content-primary">${total.toFixed(2)}</span>
            </div>
            <Button type="submit" fullWidth size="lg" loading={submitting}>
              {submitting ? "Placing Order…" : "Place Order"}
            </Button>
          </div>
        </div>
      </form>
    </div>
  );
}
