import { Toaster } from "sonner";
import { Inter } from "next/font/google";

import { cn } from "@/lib/utils";

import "./globals.css";

import MenuBar from "@/components/layout/menu-bar/MenuBar";
import Footer from "@/components/layout/footer/Footer";
import { Suspense } from "react";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-sans",
});

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="vi" className={cn("font-sans", inter.variable)}>
      <body className="flex min-h-screen flex-col">
        <Suspense fallback={null}>
          <MenuBar />
        </Suspense>

        {/* Nội dung trang */}
        <main className="flex-1">{children}</main>

        <Toaster position="top-right" richColors />

        <Footer />
      </body>
    </html>
  );
}
