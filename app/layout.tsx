import type { Metadata } from "next";
import "./globals.css";
import { ProgressBar } from "@/components/ProgressBar";

export const metadata: Metadata = {
  title: "Frame — Fashion Forward",
  description: "Discover curated fashion for the modern wardrobe.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="font-gilroy antialiased bg-surface-page text-content-primary min-h-screen">
        {children}
        <ProgressBar />
      </body>
    </html>
  );
}
