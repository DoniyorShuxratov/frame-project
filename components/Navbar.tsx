"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useCartStore } from "@/lib/store";
import { useEffect, useRef, useState } from "react";
import { createClient } from "@/lib/supabase/client";

const navLinks = [
  { href: "/home",     label: "Shop" },
  { href: "/orders",   label: "My Orders" },
];

export function Navbar() {
  const pathname   = usePathname();
  const router     = useRouter();
  const totalItems = useCartStore((s) => s.getTotalItems());

  const [menuOpen,    setMenuOpen]    = useState(false);
  const [userMenu,    setUserMenu]    = useState(false);
  const [userEmail,   setUserEmail]   = useState<string | null>(null);
  const userMenuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const supabase = createClient();
    supabase.auth.getUser().then(({ data: { user } }) => {
      setUserEmail(user?.email ?? null);
    });
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUserEmail(session?.user?.email ?? null);
    });
    return () => subscription.unsubscribe();
  }, []);

  // Close user menu on outside click
  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (userMenuRef.current && !userMenuRef.current.contains(e.target as Node)) {
        setUserMenu(false);
      }
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  async function handleSignOut() {
    const supabase = createClient();
    await supabase.auth.signOut();
    setUserMenu(false);
    router.push("/login");
    router.refresh();
  }

  const initials = userEmail ? userEmail[0].toUpperCase() : null;

  return (
    <header className="sticky top-0 z-50 bg-surface-card border-b border-stroke-default">
      <div className="max-w-7xl mx-auto px-ds-4 sm:px-ds-6 lg:px-ds-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link href="/home" className="font-gilroy font-bold text-h4 text-brand-primary tracking-tight">
            FRAME
          </Link>

          {/* Desktop nav */}
          <nav className="hidden md:flex items-center gap-ds-8">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className={[
                  "font-gilroy font-medium text-body transition-colors",
                  pathname === link.href
                    ? "text-brand-primary"
                    : "text-content-secondary hover:text-content-primary",
                ].join(" ")}
              >
                {link.label}
              </Link>
            ))}
          </nav>

          {/* Right actions */}
          <div className="flex items-center gap-ds-4">
            {/* Cart */}
            <Link
              href="/cart"
              className="relative flex items-center gap-1.5 font-gilroy font-medium text-body text-content-primary hover:text-brand-primary transition-colors"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
                  d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
              </svg>
              <span className="hidden sm:inline">Cart</span>
              {totalItems > 0 && (
                <span className="absolute -top-2 -right-2 sm:static sm:ml-0 min-w-[18px] h-[18px] flex items-center justify-center bg-brand-primary text-content-inverse text-xs font-bold rounded-full px-1">
                  {totalItems}
                </span>
              )}
            </Link>

            {/* User account */}
            {userEmail ? (
              <div className="relative" ref={userMenuRef}>
                <button
                  onClick={() => setUserMenu((o) => !o)}
                  className="w-9 h-9 rounded-full bg-brand-primary text-content-inverse font-gilroy font-bold text-small flex items-center justify-center hover:opacity-90 transition-opacity"
                >
                  {initials}
                </button>

                {userMenu && (
                  <div className="absolute right-0 top-11 w-56 bg-surface-card border border-stroke-default rounded-xl shadow-lg py-1 z-50">
                    <div className="px-4 py-3 border-b border-stroke-default">
                      <p className="font-gilroy font-semibold text-small text-content-primary truncate">{userEmail}</p>
                      <p className="font-gilroy text-xs text-content-secondary mt-0.5">Customer account</p>
                    </div>
                    <Link
                      href="/orders"
                      onClick={() => setUserMenu(false)}
                      className="flex items-center gap-3 px-4 py-2.5 font-gilroy text-body text-content-secondary hover:text-content-primary hover:bg-surface-item transition-colors"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
                          d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                      </svg>
                      Order History
                    </Link>
                    <Link
                      href="/checkout"
                      onClick={() => setUserMenu(false)}
                      className="flex items-center gap-3 px-4 py-2.5 font-gilroy text-body text-content-secondary hover:text-content-primary hover:bg-surface-item transition-colors"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
                          d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
                      </svg>
                      Checkout
                    </Link>
                    <div className="border-t border-stroke-default mt-1 pt-1">
                      <button
                        onClick={handleSignOut}
                        className="flex items-center gap-3 px-4 py-2.5 w-full text-left font-gilroy text-body text-error hover:bg-error-bg transition-colors"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
                            d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                        </svg>
                        Sign Out
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <Link
                href="/login"
                className="font-gilroy font-semibold text-small text-brand-primary hover:underline"
              >
                Sign In
              </Link>
            )}

            {/* Mobile burger */}
            <button
              className="md:hidden p-1 text-content-primary"
              onClick={() => setMenuOpen((o) => !o)}
              aria-label="Toggle menu"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                {menuOpen
                  ? <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  : <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                }
              </svg>
            </button>
          </div>
        </div>
      </div>

      {/* Mobile menu */}
      {menuOpen && (
        <div className="md:hidden border-t border-stroke-default bg-surface-card">
          <nav className="flex flex-col">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setMenuOpen(false)}
                className={[
                  "px-ds-6 py-ds-4 font-gilroy font-medium text-body border-b border-stroke-default",
                  pathname === link.href
                    ? "text-brand-primary bg-brand-bg"
                    : "text-content-secondary",
                ].join(" ")}
              >
                {link.label}
              </Link>
            ))}
            {userEmail ? (
              <button
                onClick={() => { setMenuOpen(false); handleSignOut(); }}
                className="px-ds-6 py-ds-4 font-gilroy font-medium text-body text-left text-error border-b border-stroke-default"
              >
                Sign Out
              </button>
            ) : (
              <Link
                href="/login"
                onClick={() => setMenuOpen(false)}
                className="px-ds-6 py-ds-4 font-gilroy font-medium text-body text-brand-primary border-b border-stroke-default"
              >
                Sign In
              </Link>
            )}
          </nav>
        </div>
      )}
    </header>
  );
}
