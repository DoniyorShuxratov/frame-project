import type { Metadata } from "next";
import "./globals.css";
import { AppProgressBar } from "next-nprogress-bar";

export const metadata: Metadata = {
  title: "Frame — Fashion Forward",
  description: "Discover curated fashion for the modern wardrobe.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="font-gilroy antialiased bg-surface-page text-content-primary min-h-screen">
        {children}
        <AppProgressBar
          height="3px"
          color="#0086cb"
          options={{ showSpinner: false }}
          shallowRouting
        />
      </body>
    </html>
  );
}
