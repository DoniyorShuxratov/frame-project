"use client";

import { usePathname } from "next/navigation";
import { Navbar } from "@/components/Navbar";

const NO_NAVBAR = ["/login", "/register"];

export default function MainLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const showNavbar = !NO_NAVBAR.includes(pathname);

  return (
    <>
      {showNavbar && <Navbar />}
      <main>{children}</main>
    </>
  );
}
