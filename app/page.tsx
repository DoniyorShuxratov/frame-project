import Link from "next/link";

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-[#0f0f0f] flex flex-col">
      {/* Nav */}
      <header className="px-8 py-5 flex items-center justify-between">
        <span className="font-gilroy font-bold text-h4 text-white tracking-tight">FRAME</span>
        <div className="flex items-center gap-4">
          <Link
            href="/login"
            className="font-gilroy font-semibold text-small text-white/60 hover:text-white transition-colors"
          >
            Sign In
          </Link>
          <Link
            href="/register"
            className="font-gilroy font-semibold text-small bg-white text-black px-4 py-2 rounded-md hover:bg-white/90 transition-colors"
          >
            Get Started
          </Link>
        </div>
      </header>

      {/* Hero */}
      <main className="flex-1 flex items-center justify-center px-8 py-20 text-center">
        <div className="max-w-2xl">
          <p className="font-gilroy text-small text-white/40 uppercase tracking-widest mb-6">
            New Collection — 2025
          </p>
          <h1 className="font-gilroy font-bold text-white leading-none mb-6"
            style={{ fontSize: "clamp(48px, 8vw, 96px)" }}>
            Dress the{" "}
            <span className="italic font-light text-[#0086cb]">future</span>
          </h1>
          <p className="font-gilroy text-white/60 text-body-lg mb-10 leading-relaxed">
            Curated essentials and statement pieces for the modern wardrobe.
            Free shipping on orders over $150.
          </p>
          <div className="flex flex-wrap gap-4 justify-center">
            <Link
              href="/login"
              className="font-gilroy font-bold text-body bg-[#0086cb] text-white px-8 py-3.5 rounded-md hover:opacity-90 transition-opacity"
            >
              Shop Collection
            </Link>
            <Link
              href="/register"
              className="font-gilroy font-bold text-body border border-white/20 text-white px-8 py-3.5 rounded-md hover:border-white/50 transition-colors"
            >
              Create Account
            </Link>
          </div>
        </div>
      </main>

      {/* Footer strip */}
      <footer className="px-8 py-5 flex items-center justify-between border-t border-white/10">
        <p className="font-gilroy text-xs text-white/20">© 2025 FRAME. All rights reserved.</p>
        <Link
          href="/admin/login"
          className="font-gilroy text-xs text-white/20 hover:text-white/50 transition-colors"
        >
          Admin →
        </Link>
      </footer>
    </div>
  );
}
