import type { Metadata } from "next";
import type { ReactNode } from "react";
import { Geist, Geist_Mono } from "next/font/google";
import { StoreProvider } from "@/store/provider";
import { MSWProvider } from "@/components/providers/MSWProvider";
import "./globals.css";

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
        <MSWProvider>
          <StoreProvider>{children}</StoreProvider>
        </MSWProvider>
      </body>
    </html>
  );
}
