import type { Metadata } from "next";
import type { ReactNode } from "react";
import { Geist, Geist_Mono } from "next/font/google";
import { StoreProvider } from "@/store/provider";
import "./globals.css";

// MSW
// TODO: find a better way to start it
if (process.env.NODE_ENV === "development") {
  if (typeof window !== "undefined") {
    const { worker } = await import("@/mocks/browser");
    worker.start();
  }
}

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "OrderDash - Order Management Dashboard",
  description: "Streamline your order management with OrderDash",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <StoreProvider>{children}</StoreProvider>
      </body>
    </html>
  );
}
